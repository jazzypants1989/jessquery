export function setFormElementValue(element, value) {
  if (element instanceof HTMLInputElement) {
    const inputTypes = {
      checkbox: () => (element.checked = !!value),
      radio: () => (element.checked = element.value === value),
      file: () => (element.files = value),
      default: () => {
        if (typeof value === "string") element.value = value
      },
    }
    const handler = inputTypes[element.type] || inputTypes.default
    return handler()
  } else if (element instanceof HTMLSelectElement) {
    if (element.multiple && Array.isArray(value)) {
      for (let option of element.options) {
        option.selected = value.includes(option.value)
      }
    } else if (typeof value === "string" || typeof value === "number") {
      element.value = value.toString()
    }
  } else if (
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLButtonElement
  ) {
    element.value = value
  } else {
    element.textContent = value
  }
}

export function stringOrObject(prop, stringOrObj, value, attr) {
  if (typeof stringOrObj === "string") {
    attr ? prop.setAttribute(stringOrObj, value) : (prop[stringOrObj] = value)
  } else if (typeof stringOrObj === "object") {
    Object.assign(prop, stringOrObj)
  }
}

export function addStyleSheet(rules) {
  const style = document.createElement("style")
  style.textContent = rules
  document.head.appendChild(style)
}

export function attach(element, ...args) {
  const options =
    args[args.length - 1] instanceof Object &&
    ("sanitize" in args[args.length - 1] || "position" in args[args.length - 1])
      ? args.pop()
      : {}

  const children = args.flat()

  modifyDOM(element, children, options)
}

export function moveOrClone(elements, parentSelector, options = {}) {
  let parents = getDOMElement(parentSelector, options.sanitize, options.all)

  if (!Array.isArray(parents)) {
    parents = [parents]
  }

  if (!parents.length) return

  const children = Array.isArray(elements) ? elements : [elements].flat()

  parents.forEach((parent) => {
    modifyDOM(parent, children, options)
  })
}

export function become(
  elements,
  replacements,
  options = { mode: "clone", match: "cycle" }
) {
  const handleReplacement = (element, replacement) => {
    if (!replacement) return
    const newElement =
      options.mode === "clone" ? replacement.cloneNode(true) : replacement
    element.replaceWith(newElement)
  }
  const proxyOrDOM = (candidate) => candidate.raw || candidate
  const makeArray = (candidate) =>
    Array.isArray(candidate) ? candidate : [candidate]

  const elementsArray = makeArray(proxyOrDOM(elements))
  const replacementsArray = makeArray(proxyOrDOM(replacements))

  elementsArray.forEach((element, index) => {
    const replacement =
      options.match === "cycle"
        ? replacementsArray[index % replacementsArray.length]
        : replacementsArray[index] || null

    if (replacement) {
      handleReplacement(element, replacement)
    } else if (options.match === "remove") {
      element.remove()
    }
  })
}

export function transition(elements, keyframes, options) {
  const animations = elements.map((element) =>
    element.animate(keyframes, options)
  )
  return Promise.all(animations.map((animation) => animation.finished))
}

export function modifyDOM(parent, children, options) {
  const { position = "append", sanitize = true, mode = "move" } = options

  const DOMActions = {
    append: (parent, child) => parent.append(child),
    prepend: (parent, child) => parent.prepend(child),
    before: (parent, child) => parent.before(child),
    after: (parent, child) => parent.after(child),
  }

  const getCloneOrNode =
    mode === "clone" ? (el) => el.cloneNode(true) : (el) => el

  children.forEach((child) => {
    const domElements = getDOMElement(child, sanitize)
    domElements.forEach((domElement) => {
      DOMActions[position](parent, getCloneOrNode(domElement))
    })
  })
}

export function wrappedFetch(url, options, type, toOneOrMany) {
  let response

  handleFallback(options, toOneOrMany, type)

  return fetch(url, options)
    .then((res) => {
      response = res
      return handleResponse(res, type, toOneOrMany)
    })
    .catch((error) => handleError(error, options, toOneOrMany, type))
    .finally(() => handleFinally(options, response))
}

export function send(element, options = {}, toOneOrMany) {
  let {
    url,
    method = "POST",
    json = false,
    onerror,
    oncomplete,
    event,
  } = options
  event && event.preventDefault()
  url =
    url ||
    element.action ||
    element.formAction ||
    element.form.action ||
    window.location.href.slice(0, window.location.href.lastIndexOf("/"))
  let body = getBody(element, options)
  const headers = new Headers()

  if (json) {
    headers.append("Content-Type", "application/json")
    body =
      body instanceof FormData
        ? JSON.stringify(Object.fromEntries(body.entries()))
        : typeof body === "object"
        ? JSON.stringify(body)
        : JSON.stringify({ body })
  }

  const fetchOptions = { method, headers, body }
  let response

  handleFallback(options, toOneOrMany, json ? "json" : "text")

  return fetch(url, fetchOptions)
    .then((res) => {
      response = res
      return handleResponse(res, json ? "json" : "text")
    })
    .then((data) => {
      oncomplete && oncomplete(data)
      return data
    })
    .catch((error) => {
      onerror && onerror(error)
      handleError(error, options, toOneOrMany, json ? "json" : "text")
    })
    .finally(() => handleFinally(options, response))

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

function handleError(error, options, toOneOrMany, type) {
  const errorMessage = options.error || `Failed to load ${type}`
  toOneOrMany((el) => updateContent(el, type, errorMessage))
  throw error
}

function handleFallback(options, toOneOrMany, type) {
  if (options.fallback) {
    toOneOrMany((el) => updateContent(el, type, options.fallback))
  }
}

function handleFinally(options, response) {
  if (options.onComplete) {
    requestIdleCallback(() => options.onComplete(response))
  }
}

export function fetchElements(type, url, options = {}, target, toOneOrMany) {
  if (type === "sse") {
    const eventSource = new EventSource(url)
    eventSource.onmessage = (event) => {
      toOneOrMany((el) => {
        sanitizeOrNot(el, event.data, options)
      })
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

export function sanitizeOrNot(target, data, options) {
  const { sanitize = true, sanitizer } = options
  const targetElements = Array.isArray(target) ? target : [target]
  targetElements.forEach((el) => {
    sanitize ? el.setHTML(data, sanitizer) : (el.innerHTML = data)
  })
}

export function getDOMElement(item, sanitize = true, all = false) {
  return typeof item === "string" && item.trim().startsWith("<")
    ? createDOMFromString(item, sanitize) // If it's an HTML string, create DOM elements from it
    : item instanceof HTMLElement // If it's already a DOM element, return it
    ? [item]
    : all // If the all flag is set, return all matching elements from the DOM
    ? Array.from(document.querySelectorAll(item))
    : [document.querySelector(item)] // Otherwise, return the first matching element from the DOM as an array
}

export function createDOMFromString(string, sanitize = true) {
  const div = document.createElement("div")
  sanitize ? div.setHTML(string) : (div.innerHTML = string)
  return Array.from(div.children)
}
