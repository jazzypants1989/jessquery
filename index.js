function $(selector) {
  /** @type {HTMLElement | null} */
  const element = document.querySelector(selector)
  if (!element) throw new Error(selector + " is not found on the page")

  const handler = {
    get(target, prop) {
      if (typeof target[prop] === "function") {
        return function (...args) {
          const result = target[prop].apply(element, args)
          return result === element ? self : result
        }
      }
      return Reflect.get(element, prop)
    },
    set(target, prop, value) {
      return Reflect.set(element, prop, value)
    },
  }

  const self = new Proxy(element, handler)

  self.on = (ev, fn) => {
    element.addEventListener(ev, fn)
    return self
  }
  self.css = (prop, value) => {
    element.style[prop] = value
    return self
  }
  self.addClass = (className) => {
    element.classList.add(className)
    return self
  }
  self.removeClass = (className) => {
    element.classList.remove(className)
    return self
  }
  self.toggleClass = (className) => {
    element.classList.toggle(className)
    return self
  }
  self.setAttribute = (attr, value) => {
    element.setAttribute(attr, value)
    return self
  }
  self.append = (htmlString) => {
    element.insertAdjacentHTML("beforeend", htmlString)
    return self
  }
  self.remove = () => {
    element.remove()
    return self
  }
  self.html = (newHtml) => {
    element.innerHTML = newHtml
    return self
  }
  self.text = (newText) => {
    element.textContent = newText
    return self
  }
  self.animate = (keyframes, options) => {
    const animation = element.animate(keyframes, options)
    animation.onfinish = () => self // Return self on animation finish for chaining
    return self
  }

  return self
}

function $$(selector) {
  /** @type {HTMLElement[]} */
  const elements = Array.from(document.querySelectorAll(selector))
  const noop = () => self

  const applyToElements =
    (method) =>
    (...args) => {
      elements.forEach((element) => {
        const [namespace, func] = method.split(".")
        const context = namespace ? element[namespace] : element
        context[func](...args)
      })
      return self
    }

  const checkAndApply = (method) =>
    elements.length ? applyToElements(method) : noop

  const applyFunc =
    (customFunction) =>
    (...args) => {
      customFunction(...args)
      return self
    }

  /** @type {import("jessquery").DomElementCollection} */
  const self = {
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
    remove: applyFunc(() => {
      elements.forEach((element) => element.remove())
    }),
    appendTo: applyFunc((target) => {
      const targetElement = document.querySelector(target)
      elements.forEach((element) => targetElement.appendChild(element))
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
        animation.onfinish = () => self // Return self on animation finish for chaining
      })
    }),
    css: applyFunc((prop, value) => {
      elements.forEach((element) => (element.style[prop] = value))
    }),
    html: applyFunc((newHtml) => {
      elements.forEach((element) => (element.innerHTML = newHtml))
    }),
    text: applyFunc((newText) => {
      elements.forEach((element) => (element.textContent = newText))
    }),
  }

  const handler = {
    get: (target, property) => {
      if (property in self) {
        return typeof self[property] === "function"
          ? self[property].bind(self)
          : self[property]
      } else {
        return elements[property]
      }
    },
    set: (target, property, value) => {
      elements[property] = value
      return true
    },
    apply: (target, thisArg, argumentsList) => {
      return target(...argumentsList)
    },
  }

  const proxy = new Proxy(self, handler)

  return proxy
}

export { $, $$ }
