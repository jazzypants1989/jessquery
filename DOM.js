export function setFormElementValue(element, value) {
  if (element instanceof HTMLInputElement) {
    const inputTypes = {
      checkbox: () => (element.checked = !!value),
      radio: () => (element.checked = element.value === value),
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

export function parseArgument(prop, stringOrObj, value, attr) {
  if (typeof stringOrObj === "string") {
    attr ? prop.setAttribute(stringOrObj, value) : (prop[stringOrObj] = value)
  } else if (typeof stringOrObj === "object") {
    Object.assign(prop, stringOrObj)
  }
}

export function addStyleSheet(rules) {
  const importantRules = rules.trim().split(";").join(" !important;")
  const style = document.createElement("style")
  style.textContent = importantRules
  document.head.appendChild(style)
}

export function Class(type) {
  return (el, ...classes) => el.classList[type](...classes)
}

export function attach(element, ...args) {
  const options =
    args[args.length - 1] instanceof Object &&
    ("sanitize" in args[args.length - 1] || "position" in args[args.length - 1])
      ? args.pop()
      : {}

  const children = args.flat()

  if ((children instanceof NodeList || Array.isArray(children)) && !options) {
    options.all = true
  }

  modifyDOM(element, children, options)
}

export function moveOrClone(elements, parentSelector, options = {}) {
  let parents = getDOMElement(parentSelector, options)

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
  const makeArray = (candidate) => {
    if (Array.isArray(candidate)) return candidate
    if (candidate instanceof HTMLElement) return [candidate]
    if (candidate instanceof NodeList) return Array.from(candidate)
    return []
  }

  const elementsArray = makeArray(proxyOrDOM(elements))
  const replacementsArray = makeArray(proxyOrDOM(replacements))

  elementsArray.forEach((element, index) =>
    handleReplacement(element, replacementsArray[index])
  )
}

export function modifyDOM(parent, children, options) {
  const {
    position = "append",
    sanitize = true,
    mode = "move",
    sanitizer,
    all,
  } = options

  const DOMActions = {
    append: (parent, child) => parent.append(child),
    prepend: (parent, child) => parent.prepend(child),
    before: (parent, child) => parent.before(child),
    after: (parent, child) => parent.after(child),
  }

  const getCloneOrNode =
    mode === "clone" ? (el) => el.cloneNode(true) : (el) => el

  children.forEach((child) => {
    const domElements = getDOMElement(child, { sanitize, sanitizer, all })
    domElements.forEach((domElement) => {
      DOMActions[position](parent, getCloneOrNode(domElement))
    })
  })
}

export function getDOMElement(item, options) {
  return typeof item === "string" && item.trim().startsWith("<") // If it's an HTML string,
    ? createDOMFromString(item, options) // create DOM elements from it
    : item instanceof HTMLElement // If it's already a DOM element
    ? [item] // return it as an array
    : item instanceof NodeList // If it's a NodeList
    ? Array.from(item) // return it as an array
    : options.all // If the all flag is set
    ? Array.from(document.querySelectorAll(item)) // return all matching elements from the DOM as an array
    : [document.querySelector(item)] // Otherwise, return the first matching element from the DOM as an array
}

export function createDOMFromString(string, { sanitize = true, sanitizer }) {
  const div = document.createElement("div")
  sanitize ? div.setHTML(string, sanitizer) : (div.innerHTML = string)
  return Array.from(div.children)
}
