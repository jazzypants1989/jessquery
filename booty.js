function $(selector) {
  /** @type {HTMLElement | null} */
  let element =
    typeof selector === "string" ? document.querySelector(selector) : selector

  if (!element) {
    console.error("Element not found for " + selector)
    return
  }

  let proxy = null
  const queue = []
  let processing = false

  function applyFunc(customFunction) {
    return (...args) => {
      const isAsync =
        args.some((arg) => arg instanceof Promise) ||
        customFunction.name === "wait" ||
        customFunction.name === "animate"

      if (isAsync) {
        // Defer asynchronous tasks to the next tick.
        queue.push(() => {
          const resolvedArgs = args.map((arg) =>
            arg instanceof Promise ? arg : Promise.resolve(arg)
          )
          Promise.all(resolvedArgs)
            .then(() => customFunction(...resolvedArgs))
            .then(() => {
              if (!processing) {
                processQueue() // Start processing the queue.
              }
            })
        })
      } else {
        // Execute synchronous tasks immediately.
        customFunction(...args)
      }

      return proxy
    }
  }

  async function processQueue() {
    if (processing) return
    processing = true

    while (queue.length) {
      const task = queue.shift()
      await task() // Make sure we are waiting for the task to complete.
    }

    processing = false
  }

  const customMethods = {
    on: applyFunc((ev, fn) => element.addEventListener(ev, fn)),
    delegate: applyFunc((event, subSelector, handler) =>
      delegate(element, event, subSelector, handler)
    ),
    html: applyFunc((newHtml) => (element.innerHTML = newHtml)),
    sanitize: applyFunc((newHtml) => element.setHTML(newHtml)),
    text: applyFunc((newText) => (element.textContent = newText)),
    css: applyFunc((stylesOrProp, value) => css(element, stylesOrProp, value)),
    addClass: applyFunc((className) => element.classList.add(className)),
    removeClass: applyFunc((className) => element.classList.remove(className)),
    toggleClass: applyFunc((className) => element.classList.toggle(className)),
    setAttribute: applyFunc((attr, value) => element.setAttribute(attr, value)),
    removeAttribute: applyFunc((attr) => element.removeAttribute(attr)),
    toggleAttribute: applyFunc((attr) => element.toggleAttribute(attr)),
    data: applyFunc((key, value) => (element.dataset[key] = value)),
    remove: applyFunc(() => element.remove()),
    append: applyFunc((...children) => element.append(...children)),
    prepend: applyFunc((...children) => element.prepend(...children)),
    animate: applyFunc((keyframes, options) =>
      animate([element], keyframes, options)
    ),
    wait: applyFunc((duration) => {
      return new Promise((resolve) => setTimeout(resolve, duration))
    }),
    find: (subSelector) => $(element.querySelector(subSelector)),
    closest: (ancestorSelector) => closest(element, ancestorSelector),
    styleSheet: addStyleSheet,
  }
  const handler = handlerMaker(element, customMethods)
  proxy = new Proxy(customMethods, handler)
  return proxy
}

function $$(selector) {
  /** @type {HTMLElement[]} */
  const elements =
    typeof selector === "string"
      ? Array.from(document.querySelectorAll(selector))
      : selector
  elements.length === 0 && console.error("Elements not found for " + selector)

  let proxy = null
  let queue = []
  let processing = false

  function applyFunc(customFunction) {
    return (...args) => {
      const isAsync =
        args.some((arg) => arg instanceof Promise) ||
        customFunction.name === "wait" ||
        customFunction.name === "animate"

      if (isAsync) {
        // Defer asynchronous tasks to the next tick.
        queue.push(async () => {
          const resolvedArgs = await Promise.all(args)
          await customFunction(...resolvedArgs)
          if (!processing) {
            processQueue() // Start processing the queue.
          }
        })
      } else {
        // Execute synchronous tasks immediately.
        customFunction(...args)
      }

      return proxy
    }
  }

  async function processQueue() {
    if (processing) return
    processing = true

    while (queue.length) {
      const task = queue.shift()
      await task() // Make sure we are waiting for the task to complete.
    }

    processing = false
  }

  const customMethods = {
    on: applyFunc((ev, fn) => {
      elements.forEach((element) => element.addEventListener(ev, fn))
    }),
    delegate: applyFunc((event, subSelector, handler) => {
      elements.forEach((element) => {
        delegate(element, event, subSelector, handler)
      })
    }),
    html: applyFunc((newHtml) => {
      elements.forEach((element) => (element.innerHTML = newHtml))
    }),
    setHTML: applyFunc((newHtml) => {
      elements.forEach((element) => element.setHTML(newHtml))
    }),
    text: applyFunc((newText) => {
      elements.forEach((element) => (element.textContent = newText))
    }),
    css: applyFunc((stylesOrProp, value) => {
      elements.forEach((element) => css(element, stylesOrProp, value))
    }),
    addClass: applyFunc((className) => {
      elements.forEach((element) => element.classList.add(className))
    }),
    removeClass: applyFunc((className) => {
      elements.forEach((element) => element.classList.remove(className))
    }),
    toggleClass: applyFunc((className) => {
      elements.forEach((element) => element.classList.toggle(className))
    }),
    setAttribute: applyFunc((attr, value) => {
      elements.forEach((element) => element.setAttribute(attr, value))
    }),
    removeAttribute: applyFunc((attr) => {
      elements.forEach((element) => element.removeAttribute(attr))
    }),
    toggleAttribute: applyFunc((attr) => {
      elements.forEach((element) => element.toggleAttribute(attr))
    }),
    data: applyFunc((key, value) => {
      elements.forEach((element) => (element.dataset[key] = value))
    }),
    remove: applyFunc(() => {
      elements.forEach((element) => element.remove())
    }),
    append: applyFunc((...children) => {
      elements.forEach((element) => element.append(...children))
    }),
    prepend: applyFunc((...children) => {
      elements.forEach((element) => element.prepend(...children))
    }),
    animate: applyFunc((keyframes, options) =>
      animate(elements, keyframes, options)
    ),
    wait: applyFunc((duration) => {
      return new Promise((resolve) => setTimeout(resolve, duration))
    }),
    find: (subSelector) => $$(selector + " " + subSelector),
    closest: (ancestorSelector) =>
      $$(elements.map((el) => closest(el, ancestorSelector))),
    styleSheet: addStyleSheet,
  }
  const handler = handlerMaker(elements, customMethods)
  proxy = new Proxy(customMethods, handler)
  return proxy
}

function handlerMaker(element, customMethods) {
  return {
    get(_, prop) {
      if (prop in customMethods) {
        return customMethods[prop]
      }
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
  return Promise.all(animations.map((anim) => anim.finished))
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

export { $, $$, addStyleSheet }
