export async function wrappedFetch(url, options, type, target) {
  const { onWait, waitTime, onSuccess, onError } = options

  let waitTimeout = null
  onWait && (waitTimeout = setTimeout(() => onWait(), waitTime || 250))

  try {
    const response = await fetch(url, options)
    clearTimeout(waitTimeout)
    const data = await handleResponse(response, type, target, options)
    onSuccess && requestIdleCallback(() => onSuccess(data))
    return data
  } catch (error) {
    const errorMessage = error || `Failed to load ${type}`
    console.log(target)
    onError
      ? requestIdleCallback(() => onError(error))
      : target.forEach((el) => (el.innerHTML = errorMessage))
  }
}

export function send(element, options = {}, target) {
  let { url, method = "POST", json = false, body, event, headers } = options

  event && event.preventDefault()
  url = url || getAction(element)
  body = body || getBody(element, options)
  headers = headers ? new Headers(headers) : new Headers()

  if (json) {
    headers.append("Content-Type", "application/json")
    body =
      body instanceof FormData
        ? JSON.stringify(Object.fromEntries(body))
        : typeof body === "object"
        ? JSON.stringify(body)
        : JSON.stringify({ body })
  }

  const fetchOptions = {
    ...options,
    method,
    headers,
    body,
  }

  return wrappedFetch(url, fetchOptions, "text", target)
}

export function fetchElements(type, url, options = {}, target) {
  if (type === "sse") {
    const eventSource = new EventSource(url)
    eventSource.onmessage = (event) => {
      target.forEach((el) => {
        if (options.add) {
          sanitizeOrNot(el, event.data + "<br />" + el.innerHTML, options)
        } else {
          sanitizeOrNot(el, event.data, options)
        }
      })
      options.onSuccess && requestIdleCallback(() => options.onSuccess(event))
      options.runScripts && runScripts(target)
    }
    eventSource.onerror = (error) => options.onError && options.onError(error)
    return
  }

  wrappedFetch(url, options, type, target).then((data) => {
    if (!data) throw new Error(`No data received from ${url}`)
    if (type === "text") {
      sanitizeOrNot(target, data, options)
    }
    options.runScripts && runScripts(target)
  })
}

function handleResponse(response, type, target, options) {
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

  if (type === "json") return response.json()
  if (type === "stream") {
    const reader = response.body.getReader()
    return recursiveRead(reader, target, type, options)
  }

  return response.text()
}

function recursiveRead(reader, target, type, options, chunks = []) {
  return reader.read().then(({ done, value }) => {
    const decodedChunk = new TextDecoder("utf-8").decode(value)
    const allChunks = [...chunks, decodedChunk]

    target.forEach((el) => {
      sanitizeOrNot(el, allChunks.join(""), options)
    })

    return done
      ? allChunks.join("")
      : recursiveRead(reader, target, type, options, allChunks)
  })
}

function getBody(element, options = {}) {
  const { serializer } = options
  const tagName = element.tagName
  const form = element.form || element.closest("form")

  return tagName === "FORM" // If the element is a form
    ? serializer // & a serializer is passed
      ? serializer(element) // use the serializer
      : new FormData(element) // otherwise use FormData on the form
    : // If the element is an input, select, or textarea
    tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA"
    ? element.value // use the value
    : form // If the element is not a form, but has a form ancestor
    ? serializer // & a serializer is passed
      ? serializer(form) // use the serializer
      : new FormData(form) // otherwise use FormData on the ancestor form
    : element.textContent // If nothing else, just use the text content
}

function getAction(element) {
  let form = element.form || element.closest("form")
  return element.formAction && element.formAction !== window.location.href
    ? element.formAction // If there is a formaction, but it is not the same as the current URL, use it
    : element.action // If there is an action attribute
    ? element.action // use it
    : form && form.action // If there is no action, but there is a form ancestor with an action
    ? form.action // use it
    : window.location.href // If there is no formAction, no action, and no form ancestor with an action, use the current URL
}

function sanitizeOrNot(target, data, options) {
  const { sanitize = true, sanitizer } = options
  const targetElements = Array.isArray(target) ? target : [target]
  targetElements.forEach((el) => {
    sanitize ? el.setHTML(data, sanitizer) : (el.innerHTML = data)
  })
}

function runScripts(target) {
  target.forEach((el) =>
    el.querySelectorAll("script").forEach((script) => {
      const newScript = document.createElement("script")
      newScript.textContent = script.textContent
      newScript.type = script.type
      script.replaceWith(newScript)
    })
  )
}
