function $(selector) {
  /** @type {HTMLElement | null} */
  const element = document.querySelector(selector)
  if (!element) return null

  const customMethods = {
    on(ev, fn) {
      element.addEventListener(ev, fn)
      return proxy
    },
    css(arg1, arg2) {
      if (typeof arg1 === "string") {
        element.style[arg1] = arg2
      } else if (typeof arg1 === "object") {
        for (const prop in arg1) {
          if (arg1.hasOwnProperty(prop)) {
            element.style[prop] = arg1[prop]
          }
        }
      }
      return proxy
    },
    addClass(className) {
      element.classList.add(className)
      return proxy
    },
    removeClass(className) {
      element.classList.remove(className)
      return proxy
    },
    toggleClass(className) {
      element.classList.toggle(className)
      return proxy
    },
    setAttribute(attr, value) {
      if (element.getAttribute(attr) !== value) {
        element.setAttribute(attr, value)
      }
      return proxy
    },
    append(htmlString) {
      element.insertAdjacentHTML("beforeend", htmlString)
      return proxy
    },
    appendTo(target) {
      const targetElement = document.querySelector(target)
      targetElement.appendChild(element)
      return proxy
    },
    remove() {
      element.remove()
      return proxy
    },
    html(newHtml) {
      element.innerHTML = newHtml
      return proxy
    },
    text(newText) {
      element.textContent = newText
      return proxy
    },
    animate(keyframes, options) {
      const animation = element.animate(keyframes, options)
      animation.onfinish = () => proxy // Return proxy on animation finish for chaining
      return proxy
    },
  }

  const handler = {
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

  const proxy = new Proxy(customMethods, handler)
  return proxy
}

function $$(selector) {
  /** @type {HTMLElement[]} */
  const elements = Array.from(document.querySelectorAll(selector))
  const noop = () => proxy

  const applyToElements =
    (method) =>
    (...args) => {
      elements.forEach((element) => {
        const [namespace, func] = method.split(".")
        const context = namespace ? element[namespace] : element
        context[func](...args)
      })
      return proxy
    }

  const checkAndApply = (method) =>
    elements.length ? applyToElements(method) : noop

  const applyFunc =
    (customFunction) =>
    (...args) => {
      customFunction(...args)
      return proxy
    }

  const customMethods = {
    on: (ev, fn) =>
      applyFunc((ev, fn) => {
        elements.forEach((element) => element.addEventListener(ev, fn))
      })(ev, fn),
    addClass: checkAndApply("classList.add"),
    removeClass: checkAndApply("classList.remove"),
    toggleClass: checkAndApply("classList.toggle"),
    setAttribute: checkAndApply("setAttribute"),
    append: applyFunc((htmlString) => {
      elements.forEach((element) =>
        element.insertAdjacentHTML("beforeend", htmlString)
      )
    }),
    appendTo: applyFunc((target) => {
      const targetElement = document.querySelector(target)
      elements.forEach((element) => targetElement.appendChild(element))
    }),
    remove: applyFunc(() => {
      elements.forEach((element) => element.remove())
    }),
    find: (subSelector) => $$(selector + " " + subSelector),
    closest: (ancestorSelector) => {
      const ancestors = elements.map((element) =>
        element.closest(ancestorSelector)
      )
      return $$(ancestors.map((ancestor) => ancestor?.tagName).join(","))
    },
    delegate: applyFunc((event, subSelector, handler) => {
      elements.forEach((element) => {
        element.addEventListener(event, (e) => {
          if (e.target.matches(subSelector)) handler.call(e.target, e)
        })
      })
    }),
    animate: applyFunc((keyframes, options) => {
      elements.forEach((element) => {
        const animation = element.animate(keyframes, options)
        animation.onfinish = () => proxy
      })
    }),
    css: applyFunc((arg1, arg2) => {
      elements.forEach((element) => {
        if (typeof arg1 === "string") {
          element.style[arg1] = arg2
        } else if (typeof arg1 === "object") {
          for (const prop in arg1) {
            if (arg1.hasOwnProperty(prop)) {
              element.style[prop] = arg1[prop]
            }
          }
        }
      })
    }),
    html: applyFunc((newHtml) => {
      elements.forEach((element) => (element.innerHTML = newHtml))
    }),
    text: applyFunc((newText) => {
      elements.forEach((element) => (element.textContent = newText))
    }),
  }

  const handler = {
    get(_, prop) {
      if (prop in customMethods) {
        return customMethods[prop]
      }
      return elements[prop] // for array methods and properties
    },
    set(_, prop, value) {
      if (prop in customMethods) {
        customMethods[prop] = value
        return true
      }
      elements[prop] = value
      return true
    },
    has(_, prop) {
      return prop in customMethods || prop in elements
    },
  }

  const proxy = new Proxy(customMethods, handler)
  return proxy
}

export { $, $$ }
