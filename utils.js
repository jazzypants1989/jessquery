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

export function css(element, stylesOrProp, value) {
  if (typeof stylesOrProp === "string") {
    element.style[stylesOrProp] = value
  } else if (typeof stylesOrProp === "object") {
    Object.assign(element.style, stylesOrProp)
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
    ("sanitize" || "position" || "all" in args[args.length - 1])
      ? args.pop()
      : {}

  modifyDOM(element, args, options)
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

export function wrappedFetch(url, options, type, toOneOrMany) {
  if (options.fallback) {
    toOneOrMany(
      (el) =>
        (el[type === "json" ? "textContent" : "innerHTML"] = options.fallback)
    )
  }

  return fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return type === "json" ? response.json() : response.text()
    })
    .catch((error) => {
      const errorMessage = options.error || `Failed to load ${type}`
      toOneOrMany(
        (el) =>
          (el[type === "json" ? "textContent" : "innerHTML"] = errorMessage)
      )
      throw error
    })
    .finally(() => {
      if (options.onComplete) {
        requestIdleCallback(options.onComplete)
      }
    })
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
    const domElement = getCloneOrNode(getDOMElement(child, sanitize))
    DOMActions[position](parent, domElement)
  })
}

export function getDOMElement(item, sanitize = true, all = false) {
  return typeof item === "string" && item.trim().startsWith("<")
    ? createDOMFromString(item, sanitize)
    : item instanceof HTMLElement
    ? item
    : all
    ? Array.from(document.querySelectorAll(item))
    : document.querySelector(item)
}

export function createDOMFromString(htmlString, sanitize = true) {
  const div = document.createElement("div")
  sanitize ? div.setHTML(htmlString) : (div.innerHTML = htmlString)
  return div.firstElementChild
}
