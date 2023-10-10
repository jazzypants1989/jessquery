import { createApplyFunc, createChainExecutor, handlerMaker } from "./core.js"
import { giveContext } from "./errors.js"

export function addMethods(type, selector, target) {
  let proxy = null

  const isSingle = type === "$"
  const toOneOrMany = (func) => {
    return isSingle ? func(target) : target.forEach((el) => func(el))
  }

  const addToLocalQueue = createChainExecutor()
  const applyFunc = createApplyFunc(addToLocalQueue, () => proxy)

  const customMethods = {
    on: applyFunc((ev, fn) => {
      toOneOrMany((el) => el.addEventListener(ev, fn))
    }, giveContext("on", selector)),

    once: applyFunc((ev, fn) => {
      toOneOrMany((el) => el.addEventListener(ev, fn, { once: true }))
    }, giveContext("once", selector)),

    off: applyFunc((ev, fn) => {
      toOneOrMany((el) => el.removeEventListener(ev, fn))
    }, giveContext("off", selector)),

    delegate: applyFunc((event, subSelector, handler) => {
      toOneOrMany((el) => delegate(el, event, subSelector, handler))
    }, giveContext("delegate", selector)),

    html: applyFunc((newHtml) => {
      toOneOrMany((el) => (el.innerHTML = newHtml))
    }, giveContext("html", selector)),

    sanitize: applyFunc((newHtml, sanitizer) => {
      toOneOrMany((el) => el.setHTML(newHtml, sanitizer))
    }, giveContext("sanitize", selector)),

    text: applyFunc((newText) => {
      toOneOrMany((el) => (el.textContent = newText))
    }, giveContext("text", selector)),

    val: applyFunc((newValue) => {
      toOneOrMany((el) => {
        setFormElementValue(el, newValue)
      })
    }, giveContext("val", selector)),

    css: applyFunc((stylesOrProp, value) => {
      toOneOrMany((el) => css(el, stylesOrProp, value))
    }, giveContext("css", selector)),

    addStyleSheet: applyFunc((rules) => {
      addStyleSheet(rules)
    }, giveContext("addStyleSheet", selector)),

    addClass: applyFunc((className) => {
      toOneOrMany((el) => el.classList.add(className))
    }, giveContext("addClass", selector)),

    removeClass: applyFunc((className) => {
      toOneOrMany((el) => el.classList.remove(className))
    }, giveContext("removeClass", selector)),

    toggleClass: applyFunc((className) => {
      toOneOrMany((el) => el.classList.toggle(className))
    }, giveContext("toggleClass", selector)),

    set: applyFunc((attr, value = "") => {
      toOneOrMany((el) => el.setAttribute(attr, value))
    }, giveContext("set", selector)),

    unset: applyFunc((attr) => {
      toOneOrMany((el) => el.removeAttribute(attr))
    }, giveContext("unset", selector)),

    toggle: applyFunc((attr) => {
      toOneOrMany((el) => el.toggleAttribute(attr))
    }, giveContext("toggle", selector)),

    data: applyFunc((key, value) => {
      toOneOrMany((el) => (el.dataset[key] = value))
    }, giveContext("data", selector)),

    attach: applyFunc((...children) => {
      toOneOrMany((el) => attach(el, ...children))
    }, giveContext("attach", selector)),

    cloneTo: applyFunc((parentSelector, options) => {
      moveOrClone(target, parentSelector, { mode: "clone", ...options })
    }, giveContext("cloneTo", selector)),

    moveTo: applyFunc((parentSelector, options) => {
      moveOrClone(target, parentSelector, { mode: "move", ...options })
    }, giveContext("moveTo", selector)),

    become: applyFunc((replacements, mode = "move") => {
      become(target, replacements, mode)
    }, giveContext("become", selector)),

    purge: applyFunc(() => {
      toOneOrMany((el) => el.remove())
    }, giveContext("purge", selector)),

    transition: applyFunc(
      (keyframes, options) =>
        transition(
          Array.isArray(target) ? target : [target],
          keyframes,
          options
        ),
      giveContext("transition", selector)
    ),

    wait: applyFunc(
      (duration) => wait(duration),
      giveContext("wait", selector)
    ),

    do: applyFunc((fn) => {
      toOneOrMany((el) => {
        const wrappedElement = addMethods("$", selector, el)
        fn(wrappedElement)
      })
    }, giveContext("do", selector)),

    parent: () => {
      const elements = isSingle
        ? target.parentElement
        : Array.from(target).map((el) => el.parentElement)
      return addMethods("$", selector, elements)
    },

    ancestor: (subSelector) => {
      const elements = isSingle
        ? target.closest(subSelector)
        : Array.from(target).map((el) => el.closest(subSelector))
      return addMethods("$", subSelector, elements)
    },

    kids: () => {
      const elements = isSingle
        ? target.children
        : Array.from(target).map((el) => el.children)
      return addMethods("$$", selector, elements)
    },

    siblings: () => {
      const elements = isSingle
        ? Array.from(target.parentElement.children).filter(
            (el) => el !== target
          )
        : target.map((el) =>
            Array.from(el.parentElement.children).filter(
              (child) => child !== el
            )
          )
      return addMethods("$$", selector, elements)
    },

    pick: (subSelector) => {
      const elements = isSingle
        ? target.querySelectorAll(subSelector)
        : Array.from(target).map((el) => el.querySelectorAll(subSelector))
      return addMethods("$$", subSelector, elements)
    },
  }

  const handler = handlerMaker(target, customMethods)
  proxy = new Proxy(customMethods, handler)

  proxy.isSingle = isSingle
  proxy.raw = target

  return proxy
}

function delegate(element, event, subSelector, handler) {
  element.addEventListener(event, (e) => {
    if (e.target.matches(subSelector)) handler.call(e.target, e)
  })
}

function setFormElementValue(element, value) {
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

function css(element, stylesOrProp, value) {
  if (typeof stylesOrProp === "string") {
    element.style[stylesOrProp] = value
  } else if (typeof stylesOrProp === "object") {
    Object.assign(element.style, stylesOrProp)
  }
}

function addStyleSheet(rules) {
  const style = document.createElement("style")
  style.textContent = rules
  document.head.appendChild(style)
}

function attach(element, ...args) {
  const options =
    args[args.length - 1] instanceof Object &&
    ("sanitize" || "position" || "all" in args[args.length - 1])
      ? args.pop()
      : {}

  modifyDOM(element, args, options)
}

function moveOrClone(elements, parentSelector, options = {}) {
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

function become(elements, replacements, options = {}) {
  const handleReplacement = (element, replacement) => {
    const newElement =
      options.mode === "clone" ? replacement.cloneNode(true) : replacement
    element.replaceWith(newElement)
  }

  if (elements.isSingle) {
    handleReplacement(elements.raw, replacements.raw)
  } else {
    elements.raw.forEach((element, index) =>
      handleReplacement(element, replacements.raw[index])
    )
  }
}

function transition(elements, keyframes, options) {
  const animations = elements.map((element) =>
    element.animate(keyframes, options)
  )
  return Promise.all(animations.map((animation) => animation.finished))
}

function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

function modifyDOM(
  parent,
  children,
  { position = "append", sanitize = true, mode = "move" } = {}
) {
  const getCloneOrNode =
    mode === "clone" ? (el) => el.cloneNode(true) : (el) => el

  children.forEach((child) => {
    const domElement = getCloneOrNode(getDOMElement(child, sanitize))
    switch (position) {
      case "append":
        parent.append(domElement)
        break
      case "prepend":
        parent.prepend(domElement)
        break
      case "before":
        parent.before(domElement)
        break
      case "after":
        parent.after(domElement)
        break
      default:
        throw new Error(`Unsupported position: ${position}`)
    }
  })
}

function getDOMElement(item, sanitize = true, all = false) {
  return typeof item === "string" && item.trim().startsWith("<") // If it's an HTML string
    ? createDOMFromString(item, sanitize) // Create an element from it
    : item instanceof HTMLElement // If it's already an element
    ? item // Just return it
    : all // So, if it isn't an element or an HTML string, check if the all flag is true
    ? Array.from(document.querySelectorAll(item)) // All is true? - see if you can make an array of elements that match a selector
    : document.querySelector(item) // All is false? - Return the first element that matches the selector (or null)
}

function createDOMFromString(htmlString, sanitize = true) {
  const div = document.createElement("div")
  sanitize ? div.setHTML(htmlString) : (div.innerHTML = htmlString)
  return div.firstElementChild
}
