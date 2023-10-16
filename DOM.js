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

export function Class(type) {
  return (el, ...classes) => el.classList[type](...classes)
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

  !Array.isArray(parents) && (parents = [parents])

  const children = Array.isArray(elements) ? elements : [elements].flat()

  parents.forEach((parent) => {
    modifyDOM(parent, children, options)
  })
}

export function become(elements, replacements, options = { mode: "clone" }) {
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
    handleReplacement(element, replacementsArray[index])
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

export function getDOMElement(item, sanitize = true, all = false) {
  return typeof item === "string" && item.trim().startsWith("<") // If it's an HTML string, create DOM elements from it
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
