export async function wrappedFetch(url, options, type, toOneOrMany) {
  options.fallback &&
    toOneOrMany((el) => updateContent(el, type, options.fallback))

  try {
    const response = await fetch(url, options)
    const data = await handleResponse(response, type, toOneOrMany)
    options.onSuccess && requestIdleCallback(() => options.onSuccess(data))
    return data
  } catch (error) {
    const errorMessage = options.error || `Failed to load ${type}`
    if (options.onError) {
      options.onError(error)
    }
    toOneOrMany((el) =>
      updateContent(el, "text", `${errorMessage}: ${error.message}`)
    )
  }
}

export function send(element, options = {}, toOneOrMany) {
  let { url, method = "POST", json = false, body, event, headers } = options

  event && event.preventDefault()
  url = url || getAction(element)
  body = body || getBody(element, options)
  headers = headers || new Headers()

  if (json) {
    headers.append("Content-Type", "application/json")
    body =
      body instanceof FormData
        ? JSON.stringify(Object.fromEntries(body.entries()))
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

  return wrappedFetch(url, fetchOptions, "text", toOneOrMany)
}

export function fetchElements(type, url, options = {}, target, toOneOrMany) {
  if (type === "sse") {
    const eventSource = new EventSource(url)
    eventSource.onmessage = (event) => {
      toOneOrMany((el) => {
        if (options.add) {
          sanitizeOrNot(el, event.data + "<br />" + el.innerHTML, options)
        } else {
          sanitizeOrNot(el, event.data, options)
        }
      })
      if (options.onSuccess) {
        options.onSuccess(event)
      }
    }
    eventSource.onerror = (error) => {
      if (options.onError) {
        options.onError(error)
      }
    }

    return
  }

  wrappedFetch(url, options, type, toOneOrMany).then((data) => {
    if (data) {
      sanitizeOrNot(target, data, options)
    } else {
      throw new Error(`No ${type} found at ${url}`)
    }
  })
}

function handleResponse(response, type, toOneOrMany) {
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

  if (type === "json") return response.json()
  if (type === "stream") {
    const reader = response.body.getReader()
    return recursiveRead(reader, toOneOrMany, type)
  }

  return response.text()
}

function recursiveRead(reader, toOneOrMany, type, chunks = []) {
  return reader.read().then(({ done, value }) => {
    const decodedChunk = new TextDecoder("utf-8").decode(value)
    const allChunks = [...chunks, decodedChunk]

    toOneOrMany((el) => updateContent(el, type, allChunks.join("")))

    return done
      ? allChunks.join("")
      : recursiveRead(reader, toOneOrMany, type, allChunks)
  })
}

function updateContent(el, type, message) {
  el[type === "json" || type === "stream" ? "textContent" : "innerHTML"] =
    message
}

function getBody(element, options = {}) {
  const { serializer } = options
  const tagName = element.tagName
  const form = element.form || element.closest("form")

  return tagName === "FORM"
    ? serializer
      ? serializer(element)
      : new FormData(element)
    : tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA"
    ? element.value
    : form
    ? serializer
      ? serializer(form)
      : new FormData(form)
    : element.textContent
}

function getAction(element) {
  let form = element.form || element.closest("form")
  return element.formAction && element.formAction !== window.location.href
    ? element.formAction
    : element.action
    ? element.action
    : form && form.action
    ? form.action
    : window.location.href
}

function sanitizeOrNot(target, data, options) {
  const { sanitize = true, sanitizer } = options
  const targetElements = Array.isArray(target) ? target : [target]
  targetElements.forEach((el) => {
    sanitize ? el.setHTML(data, sanitizer) : (el.innerHTML = data)
  })
}
