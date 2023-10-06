export function $(selector) {
  /** @type {HTMLElement | null} */
  let element =
    typeof selector === "string" ? document.querySelector(selector) : selector
  let proxy = null

  const addToLocalQueue = createChainExecutor()
  const applyFunc = createApplyFunc(addToLocalQueue, () => proxy)

  const customMethods = {
    on: applyFunc(
      (ev, fn) => element.addEventListener(ev, fn),
      giveContext("on", selector)
    ),

    once: applyFunc(
      (ev, fn) => element.addEventListener(ev, fn, { once: true }),
      giveContext("once", selector)
    ),

    off: applyFunc(
      (ev, fn) => element.removeEventListener(ev, fn),
      giveContext("off", selector)
    ),

    delegate: applyFunc(
      (event, subSelector, handler) =>
        delegate(element, event, subSelector, handler),
      giveContext("delegate", selector)
    ),

    html: applyFunc(
      (newHtml) => (element.innerHTML = newHtml),
      giveContext("html", selector)
    ),

    sanitize: applyFunc(
      (newHtml, sanitizer) => element.setHTML(newHtml, sanitizer),
      giveContext("sanitize", selector)
    ),

    text: applyFunc(
      (newText) => (element.textContent = newText),
      giveContext("text", selector)
    ),

    val: applyFunc((newValue) => {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      ) {
        element.value = newValue
      }
    }, giveContext("val", selector)),

    css: applyFunc(
      (stylesOrProp, value) => css(element, stylesOrProp, value),
      giveContext("css", selector)
    ),

    addStyleSheet, // SAME NAME. This comment is just here cuz this is easy to miss.

    addClass: applyFunc(
      (className) => element.classList.add(className),
      giveContext("addClass", selector)
    ),

    removeClass: applyFunc(
      (className) => element.classList.remove(className),
      giveContext("removeClass", selector)
    ),

    toggleClass: applyFunc(
      (className) => element.classList.toggle(className),
      giveContext("toggleClass", selector)
    ),

    set: applyFunc(
      (attr, value = "") => element.setAttribute(attr, value),
      giveContext("set", selector)
    ),

    unset: applyFunc(
      (attr) => element.removeAttribute(attr),
      giveContext("unset", selector)
    ),

    toggle: applyFunc(
      (attr) => element.toggleAttribute(attr),
      giveContext("toggle", selector)
    ),

    data: applyFunc(
      (key, value) => (element.dataset[key] = value),
      giveContext("data", selector)
    ),

    append: applyFunc(
      (...children) => append(element, ...children),
      giveContext("append", selector)
    ),

    prepend: applyFunc(
      (...children) => prepend(element, ...children),
      giveContext("prepend", selector)
    ),

    appendTo: applyFunc(
      (parentSelector) => appendElementsTo([element], parentSelector),
      giveContext("appendTo", selector)
    ),

    prependTo: applyFunc(
      (parentSelector) => prependElementsTo([element], parentSelector),
      giveContext("prependTo", selector)
    ),

    remove: applyFunc(() => element.remove(), giveContext("remove", selector)),

    animate: applyFunc(
      (keyframes, options) => animate([element], keyframes, options),
      giveContext("animate", selector)
    ),

    wait: applyFunc(
      (duration) => wait(duration),
      giveContext("wait", selector)
    ),

    find: (subSelector) => $(element.querySelector(subSelector)),

    closest: (ancestorSelector) => closest(element, ancestorSelector),
  }

  const handler = handlerMaker(element, customMethods)
  proxy = new Proxy(customMethods, handler)
  return proxy
}

export function $$(selector) {
  /** @type {HTMLElement[]}HTMLInputElement |  */
  let elements =
    typeof selector === "string"
      ? Array.from(document.querySelectorAll(selector))
      : selector
  let proxy = null

  const addToLocalQueue = createChainExecutor()
  const applyFunc = createApplyFunc(addToLocalQueue, () => proxy)

  const customMethods = {
    on: applyFunc((ev, fn) => {
      elements.forEach((element) => element.addEventListener(ev, fn))
    }, giveContext("on", selector)),

    once: applyFunc((ev, fn) => {
      elements.forEach((element) =>
        element.addEventListener(ev, fn, { once: true })
      )
    }, giveContext("once", selector)),

    off: applyFunc((ev, fn) => {
      elements.forEach((element) => element.removeEventListener(ev, fn))
    }, giveContext("off", selector)),

    delegate: applyFunc((event, subSelector, handler) => {
      elements.forEach((element) => {
        delegate(element, event, subSelector, handler)
      })
    }, giveContext("delegate", selector)),

    html: applyFunc((newHtml) => {
      elements.forEach((element) => (element.innerHTML = newHtml))
    }, giveContext("html", selector)),

    sanitize: applyFunc((newHtml, sanitizer) => {
      elements.forEach((element) => element.setHTML(newHtml, sanitizer))
    }, giveContext("sanitize", selector)),

    text: applyFunc((newText) => {
      elements.forEach((element) => (element.textContent = newText))
    }, giveContext("text", selector)),

    val: applyFunc((newValue) => {
      elements.forEach((element) => {
        if (
          element instanceof HTMLInputElement ||
          element instanceof HTMLSelectElement ||
          element instanceof HTMLTextAreaElement
        ) {
          element.value = newValue
        }
      })
    }, "the val method for " + selector),

    css: applyFunc((stylesOrProp, value) => {
      elements.forEach((element) => css(element, stylesOrProp, value))
    }, giveContext("css", selector)),

    addStyleSheet, // SAME NAME. This comment is just here cuz this is easy to miss.

    addClass: applyFunc((className) => {
      elements.forEach((element) => element.classList.add(className))
    }, giveContext("addClass", selector)),

    removeClass: applyFunc((className) => {
      elements.forEach((element) => element.classList.remove(className))
    }, giveContext("removeClass", selector)),

    toggleClass: applyFunc((className) => {
      elements.forEach((element) => element.classList.toggle(className))
    }, giveContext("toggleClass", selector)),

    set: applyFunc((attr, value = "") => {
      elements.forEach((element) => element.setAttribute(attr, value))
    }, giveContext("set", selector)),

    unset: applyFunc((attr) => {
      elements.forEach((element) => element.removeAttribute(attr))
    }, giveContext("unset", selector)),

    toggle: applyFunc((attr) => {
      elements.forEach((element) => element.toggleAttribute(attr))
    }, giveContext("toggle", selector)),

    data: applyFunc((key, value) => {
      elements.forEach((element) => (element.dataset[key] = value))
    }, giveContext("data", selector)),

    append: applyFunc((...children) => {
      elements.forEach((element) => append(element, ...children))
    }, giveContext("append", selector)),

    prepend: applyFunc((...children) => {
      elements.forEach((element) => prepend(element, ...children))
    }, giveContext("prepend", selector)),

    appendTo: applyFunc((parentSelector) => {
      appendElementsTo(elements, parentSelector)
    }, giveContext("appendTo", selector)),

    prependTo: applyFunc((parentSelector) => {
      prependElementsTo(elements, parentSelector)
    }, giveContext("prependTo", selector)),

    remove: applyFunc(() => {
      elements.forEach((element) => element.remove())
    }, giveContext("remove", selector)),

    animate: applyFunc(
      (keyframes, options) => animate(elements, keyframes, options),
      giveContext("animate", selector)
    ),

    wait: applyFunc(
      (duration) => wait(duration),
      giveContext("wait", selector)
    ),

    find: (subSelector) => $$(selector + " " + subSelector),

    closest: (ancestorSelector) =>
      $$(elements.map((el) => closest(el, ancestorSelector))),
  }
  const handler = handlerMaker(elements, customMethods)
  proxy = new Proxy(customMethods, handler)
  return proxy
}

const isThenable = (value) => value && typeof value.then === "function"

function createChainExecutor() {
  const queue = []
  let isProcessing = false

  async function runQueue() {
    if (isProcessing) return
    isProcessing = true

    while (queue.length) {
      const fn = queue[0]
      const result = await fn()
      if (isThenable(result)) {
        await result
      }
      queue.shift()
    }

    isProcessing = false
  }

  function addToQueue(fn) {
    queue.push(fn)
    runQueue()
  }

  return addToQueue
}

let defaultErrorHandler = (error, context) => {
  console.error(`Error in ${context}:`, error)

  throw error
}

export function setErrorHandler(handler) {
  defaultErrorHandler = handler
}

function giveContext(context, selector) {
  return `This error occurred in the ${context} method in one of the ${selector} selector chains.`
}

function createApplyFunc(addToLocalQueue, proxy) {
  return function applyFunc(fn, context) {
    return (...args) => {
      addToLocalQueue(async () => {
        try {
          const resolvedArgs = []
          for (const arg of args) {
            resolvedArgs.push(isThenable(arg) ? await arg : arg)
          }
          const result = fn(...resolvedArgs)
          if (isThenable(result)) {
            await result
          }
        } catch (error) {
          defaultErrorHandler(error, context)
        }
      })
      return proxy()
    }
  }
}

function handlerMaker(element, customMethods) {
  return {
    get(_, prop) {
      if (prop in customMethods) {
        return customMethods[prop]
      }
      console.log("get", prop)
      return element[prop]
    },
    set(_, prop, value) {
      if (prop in customMethods) {
        customMethods[prop] = value
        return true
      }
      element[prop] = value
      return true
    },
  }
}

function animate(elements, keyframes, options) {
  const animations = elements.map((element) =>
    element.animate(keyframes, options)
  )
  return Promise.all(animations.map((animation) => animation.finished))
}

function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}

function addStyleSheet(rules) {
  const style = document.createElement("style")
  style.textContent = rules
  document.head.appendChild(style)
}

function delegate(element, event, subSelector, handler) {
  element.addEventListener(event, (e) => {
    if (e.target.matches(subSelector)) handler.call(e.target, e)
  })
}

function css(element, stylesOrProp, value) {
  if (typeof stylesOrProp === "string") {
    element.style[stylesOrProp] = value
  } else {
    Object.assign(element.style, stylesOrProp)
  }
}

function closest(element, ancestorSelector) {
  return $(element.closest(ancestorSelector))
}

function createDOMFromString(htmlString, sanitize) {
  console.log(sanitize, "in createDOMFromString")
  const div = document.createElement("div")
  sanitize ? div.setHTML(htmlString) : (div.innerHTML = htmlString)
  return div.firstElementChild
}

function getDOMElement(item, sanitize) {
  console.log(sanitize, "in getDOMElement")
  if (typeof item === "string") {
    if (item.trim().startsWith("<")) {
      return createDOMFromString(item, sanitize)
    } else {
      try {
        const queriedElement = document.querySelector(item)
        if (queriedElement) return queriedElement
      } catch (e) {
        console.warn("Invalid querySelector or HTML string:", item)
      }
    }
  } else if (item instanceof HTMLElement) {
    return item
  }
  return null
}

function append(element, ...children) {
  let sanitize = true
  if (typeof children[children.length - 1] === "boolean") {
    sanitize = children.pop()
  }
  children.forEach((child) => {
    const domElement = getDOMElement(child, sanitize)
    if (domElement) element.appendChild(domElement)
  })
}

function prepend(element, ...children) {
  let sanitize = true
  if (typeof children[children.length - 1] === "boolean") {
    sanitize = children.pop()
  }
  children.forEach((child) => {
    const domElement = getDOMElement(child, sanitize)
    if (domElement) element.prepend(domElement)
  })
}

function appendElementsTo(children, parentSelector) {
  const parentElement = document.querySelector(parentSelector)
  if (parentElement) {
    children.forEach((child) => {
      parentElement.appendChild(child)
    })
  } else {
    console.warn(`Parent element ${parentSelector} not found.`)
  }
}

function prependElementsTo(children, parentSelector) {
  const parentElement = document.querySelector(parentSelector)
  if (parentElement) {
    children.forEach((child) => {
      parentElement.prepend(child)
    })
  } else {
    console.warn(`Parent element ${parentSelector} not found.`)
  }
}
