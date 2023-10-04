// function $(selector) {
//   /** @type {HTMLElement | null} */
//   const element = document.querySelector(selector)
//   if (!element) return null

//   const customMethods = {
//     on(ev, fn) {
//       element.addEventListener(ev, fn)
//       return proxy
//     },
//     css(arg1, arg2) {
//       if (typeof arg1 === "string") {
//         element.style[arg1] = arg2
//       } else if (typeof arg1 === "object") {
//         for (const prop in arg1) {
//           if (arg1.hasOwnProperty(prop)) {
//             element.style[prop] = arg1[prop]
//           }
//         }
//       }
//       return proxy
//     },
//     addClass(className) {
//       element.classList.add(className)
//       return proxy
//     },
//     removeClass(className) {
//       element.classList.remove(className)
//       return proxy
//     },
//     toggleClass(className) {
//       element.classList.toggle(className)
//       return proxy
//     },
//     setAttribute(attr, value) {
//       if (element.getAttribute(attr) !== value) {
//         element.setAttribute(attr, value)
//       }
//       return proxy
//     },
//     append(htmlString) {
//       element.appendChild(htmlString)
//       return proxy
//     },
//     appendTo(target) {
//       const targetElement = document.querySelector(target)
//       targetElement.appendChild(element)
//       return proxy
//     },
//     remove() {
//       element.remove()
//       return proxy
//     },
//     html(newHtml) {
//       element.innerHTML = newHtml
//       return proxy
//     },
//     text(newText) {
//       element.textContent = newText
//       return proxy
//     },
//     animate(keyframes, options) {
//       const animation = element.animate(keyframes, options)
//       animation.onfinish = () => proxy // Return proxy on animation finish for chaining
//       return proxy
//     },
//   }

//   const handler = {
//     get(_, prop) {
//       if (prop in customMethods) {
//         return customMethods[prop]
//       }
//       return element[prop]
//     },
//     set(_, prop, value) {
//       if (prop in customMethods) {
//         customMethods[prop] = value
//         return true
//       }
//       element[prop] = value
//       return true
//     },
//   }

//   const proxy = new Proxy(customMethods, handler)
//   return proxy
// }

// function $$(selector) {
//   /** @type {HTMLElement[]} */
//   const elements = Array.from(document.querySelectorAll(selector))
//   const noop = () => proxy

//   const applyToElements =
//     (method) =>
//     (...args) => {
//       elements.forEach((element) => {
//         const [namespace, func] = method.split(".")
//         const context = namespace ? element[namespace] : element
//         context[func](...args)
//       })
//       return proxy
//     }

//   const checkAndApply = (method) =>
//     elements.length ? applyToElements(method) : noop

//   const applyFunc =
//     (customFunction) =>
//     (...args) => {
//       customFunction(...args)
//       return proxy
//     }

//   const customMethods = {
//     on: (ev, fn) =>
//       applyFunc((ev, fn) => {
//         elements.forEach((element) => element.addEventListener(ev, fn))
//       })(ev, fn),
//     addClass: checkAndApply("classList.add"),
//     removeClass: checkAndApply("classList.remove"),
//     toggleClass: checkAndApply("classList.toggle"),
//     setAttribute: checkAndApply("setAttribute"),
//     append: applyFunc((htmlString) => {
//       elements.forEach((element) => element.appendChild(htmlString))
//     }),
//     appendTo: applyFunc((target) => {
//       const targetElement = document.querySelector(target)
//       elements.forEach((element) => targetElement.appendChild(element))
//     }),
//     remove: applyFunc(() => {
//       elements.forEach((element) => element.remove())
//     }),
//     find: (subSelector) => $$(selector + " " + subSelector),
//     closest: (ancestorSelector) => {
//       const ancestors = elements.map((element) =>
//         element.closest(ancestorSelector)
//       )
//       return $$(ancestors.map((ancestor) => ancestor?.tagName).join(","))
//     },
//     delegate: applyFunc((event, subSelector, handler) => {
//       elements.forEach((element) => {
//         element.addEventListener(event, (e) => {
//           if (e.target.matches(subSelector)) handler.call(e.target, e)
//         })
//       })
//     }),
//     animate: applyFunc((keyframes, options) => {
//       elements.forEach((element) => {
//         const animation = element.animate(keyframes, options)
//         animation.onfinish = () => proxy
//       })
//     }),
//     css: applyFunc((arg1, arg2) => {
//       elements.forEach((element) => {
//         if (typeof arg1 === "string") {
//           element.style[arg1] = arg2
//         } else if (typeof arg1 === "object") {
//           for (const prop in arg1) {
//             if (arg1.hasOwnProperty(prop)) {
//               element.style[prop] = arg1[prop]
//             }
//           }
//         }
//       })
//     }),
//     html: applyFunc((newHtml) => {
//       elements.forEach((element) => (element.innerHTML = newHtml))
//     }),
//     text: applyFunc((newText) => {
//       elements.forEach((element) => (element.textContent = newText))
//     }),
//   }

//   const handler = {
//     get(_, prop) {
//       if (prop in customMethods) {
//         return customMethods[prop]
//       }
//       return elements[prop] // for array methods and properties
//     },
//     set(_, prop, value) {
//       if (prop in customMethods) {
//         customMethods[prop] = value
//         return true
//       }
//       elements[prop] = value
//       return true
//     },
//     has(_, prop) {
//       return prop in customMethods || prop in elements
//     },
//   }

//   const proxy = new Proxy(customMethods, handler)
//   return proxy
// }

// export { $, $$ }

function DomElement(selector) {
  this.element = document.querySelector(selector)
}

DomElement.prototype.on = function (ev, fn) {
  this.element.addEventListener(ev, fn)
  return this
}

DomElement.prototype.css = function (arg1, arg2) {
  if (typeof arg1 === "string") {
    this.element.style[arg1] = arg2
  } else if (typeof arg1 === "object") {
    for (const prop in arg1) {
      if (arg1.hasOwnProperty(prop)) {
        this.element.style[prop] = arg1[prop]
      }
    }
  }
  return this
}

DomElement.prototype.addClass = function (className) {
  this.element.classList.add(className)
  return this
}

DomElement.prototype.removeClass = function (className) {
  this.element.classList.remove(className)
  return this
}

DomElement.prototype.toggleClass = function (className) {
  this.element.classList.toggle(className)
  return this
}

DomElement.prototype.setAttribute = function (attr, value) {
  if (this.element.getAttribute(attr) !== value) {
    this.element.setAttribute(attr, value)
  }
  return this
}

DomElement.prototype.append = function (htmlString) {
  this.element.appendChild(htmlString)
  return this
}

DomElement.prototype.appendTo = function (target) {
  const targetElement = document.querySelector(target)
  targetElement.appendChild(this.element)
  return this
}

DomElement.prototype.remove = function () {
  this.element.remove()
  return this
}

DomElement.prototype.html = function (newHtml) {
  this.element.innerHTML = newHtml
  return this
}

DomElement.prototype.text = function (newText) {
  this.element.textContent = newText
  return this
}

DomElement.prototype.animate = function (keyframes, options) {
  const animation = this.element.animate(keyframes, options)
  animation.onfinish = () => this // Return proxy on animation finish for chaining
  return this
}

function $(selector) {
  return new DomElement(selector)
}

function DomElements(selector) {
  this.elements = Array.from(document.querySelectorAll(selector))
}

DomElements.prototype.on = function (ev, fn) {
  this.elements.forEach((element) => element.addEventListener(ev, fn))
  return this
}

DomElements.prototype.addClass = function (className) {
  this.elements.forEach((element) => element.classList.add(className))
  return this
}

DomElements.prototype.removeClass = function (className) {
  this.elements.forEach((element) => element.classList.remove(className))
  return this
}

DomElements.prototype.toggleClass = function (className) {
  this.elements.forEach((element) => element.classList.toggle(className))
  return this
}

DomElements.prototype.setAttribute = function (attr, value) {
  this.elements.forEach((element) => {
    if (element.getAttribute(attr) !== value) {
      element.setAttribute(attr, value)
    }
  })
  return this
}

DomElements.prototype.append = function (htmlString) {
  this.elements.forEach((element) => element.appendChild(htmlString))
  return this
}

DomElements.prototype.appendTo = function (target) {
  const targetElement = document.querySelector(target)
  this.elements.forEach((element) => targetElement.appendChild(element))
  return this
}

DomElements.prototype.remove = function () {
  this.elements.forEach((element) => element.remove())
  return this
}

DomElements.prototype.find = function (subSelector) {
  return new DomElements(
    this.elements.map((element) => element.querySelector(subSelector))
  )
}

DomElements.prototype.closest = function (ancestorSelector) {
  const ancestors = this.elements.map((element) =>
    element.closest(ancestorSelector)
  )
  return new DomElements(
    ancestors.map((ancestor) => ancestor?.tagName).join(",")
  )
}

DomElements.prototype.delegate = function (event, subSelector, handler) {
  this.elements.forEach((element) => {
    element.addEventListener(event, (e) => {
      if (e.target.matches(subSelector)) handler.call(e.target, e)
    })
  })
}

DomElements.prototype.animate = function (keyframes, options) {
  this.elements.forEach((element) => {
    const animation = element.animate(keyframes, options)
    animation.onfinish = () => this
  })
}

DomElements.prototype.css = function (arg1, arg2) {
  this.elements.forEach((element) => {
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
}

DomElements.prototype.html = function (newHtml) {
  this.elements.forEach((element) => (element.innerHTML = newHtml))
}

DomElements.prototype.text = function (newText) {
  this.elements.forEach((element) => (element.textContent = newText))
}

function $$(selector) {
  return new DomElements(selector)
}

export { $, $$ }
