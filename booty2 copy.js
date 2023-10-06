function defer(fn) {
  return Promise.resolve().then(fn)
}

function $(selector) {
  /** @type {HTMLElement | null} */
  let element =
    typeof selector === "string" ? document.querySelector(selector) : selector
  let proxy = null
  let operationsQueue = []

  function flushQueue() {
    while (operationsQueue.length) {
      operationsQueue.shift()()
    }
  }

  const applyFunc =
    (customMethod) =>
    (...args) => {
      const executor = async () => {
        const resolvedArgs = await Promise.all(args)
        const result = customMethod(...resolvedArgs)
        if (result instanceof Promise) {
          await result
        }
      }
      operationsQueue.push(executor)
      defer(flushQueue)
      return proxy
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
    wait: applyFunc((duration) => wait(duration)),
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
  const elements = Array.from(document.querySelectorAll(selector))

  let proxy = null
  let operationsQueue = []

  function flushQueue() {
    while (operationsQueue.length) {
      operationsQueue.shift()()
    }
  }

  const applyFunc =
    (customMethod) =>
    (...args) => {
      const executor = async () => {
        const resolvedArgs = await Promise.all(args)
        const result = customMethod(...resolvedArgs)
        if (result instanceof Promise) {
          await result
        }
      }
      operationsQueue.push(executor)
      defer(flushQueue)
      return proxy
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
    wait: applyFunc((duration) => wait(duration)),
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
      console.log("get", prop)
      return element[prop]
    },
    set(_, prop, value) {
      if (prop in customMethods) {
        customMethods[prop] = value
        return true
      }
      console.log("set", prop)
      element[prop] = value
      return true
    },
  }
}

function animate(elements, keyframes, options) {
  return new Promise((resolve) => {
    elements.forEach((element) => {
      element.animate(keyframes, options).onfinish = resolve
    })
  })
}

function addStyleSheet(rules) {
  const style = document.createElement("style")
  style.textContent = rules
  document.head.appendChild(style)
}

async function handleQueue(queue) {
  while (queue.length) {
    const execute = queue[0]
    await execute()
    queue.shift()
  }
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

function wait(duration) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}
