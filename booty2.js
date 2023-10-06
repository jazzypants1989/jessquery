let isPROCESSING = false

// if any arguments are promises, we wait for them to resolve
// if any methods return promises, we wait for them to resolve
// the user NEVER has to await anything
// Examples:
// $("#otherDiv")
//   .text("Other Div")
//   .wait(1000)
//   .text("Single Timeout Complete!")
//   .css({ color: "red" })

// $("#otherDiv")
// .text(fetch("https://jsonplaceholder.typicode.com/todos/1")
// .then(res => res.json()).then(data => data.title)))
// .wait(1000)
// .text("That's how fetch works!")
// No matter what, it returns the proxy so you can keep chaining.
// Each function waits on the one before it to finish.
// There is a queue for each $ & $$ and a global isPROCESSING flag
// that is set to true when any queue is running. If a queue is running
// and you call $ or $$, it will wait until the queue is finished before
// running the functions.

function $(selector) {
  /** @type {HTMLElement | null} */
  let element =
    typeof selector === "string" ? document.querySelector(selector) : selector
  let proxy = null

  const queue = []
  function applyFunc(fn) {
    return (...args) => {
      queue.push(() => fn(...args))
      if (!isPROCESSING) {
        isPROCESSING = true
        runQueue()
      }
      return proxy
    }
  }

  async function runQueue() {
    if (queue.length === 0) {
      isPROCESSING = false
      return
    }
    const fn = queue.shift()

    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    const result = await fn()

    if (result instanceof Promise) {
      await result
    }

    runQueue()
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
    animate: applyFunc((keyframes, options, proxy) =>
      animate([element], keyframes, options, proxy)
    ),
    wait: applyFunc((duration) => wait(duration)),
    find: (subSelector) => $(element.querySelector(subSelector)),
    closest: (ancestorSelector) => closest(element, ancestorSelector),
    val: applyFunc((newValue) => (element.value = newValue)),
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

  let proxy = null
  const queue = []
  function applyFunc(fn) {
    return (...args) => {
      queue.push(() => fn(...args))
      if (!isPROCESSING) {
        isPROCESSING = true
        runQueue()
      }
      return proxy
    }
  }

  async function runQueue() {
    if (queue.length === 0) {
      isPROCESSING = false
      return
    }
    const fn = queue.shift()

    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })

    const result = await fn()

    if (result instanceof Promise) {
      await result
    }

    runQueue()
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
    animate: applyFunc((keyframes, options, proxy) =>
      animate(elements, keyframes, options, proxy)
    ),
    wait: applyFunc((duration) => wait(duration)),
    find: (subSelector) => $$(selector + " " + subSelector),
    closest: (ancestorSelector) =>
      $$(elements.map((el) => closest(el, ancestorSelector))),
    val: applyFunc((newValue) => {
      elements.forEach((element) => (element.value = newValue))
    }),
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
      element[prop] = value
      return true
    },
  }
}

function animate(elements, keyframes, options, proxy) {
  const animations = elements.map((element) =>
    element.animate(keyframes, options)
  )
  if (proxy) {
    return new Promise((resolve) => {
      animations[0].onfinish = () => resolve(proxy)
    })
  }
  return animations
}

function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, duration)
  })
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
