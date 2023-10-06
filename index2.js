function $(selector) {
  /** @type {HTMLElement | null} */
  let element =
    typeof selector === "string" ? document.querySelector(selector) : selector

  let proxy = null

  const queue = []

  const applyFunc =
    (customFunction) =>
    (...args) => {
      const executor = async () => {
        if (!element) {
          console.error("Element not found for selector.")
          return
        }
        const resolvedArgs = await Promise.all(args)
        const result = customFunction(...resolvedArgs)

        if (result instanceof HTMLElement) {
          element = result
        }

        if (result instanceof Promise) {
          await result
        }
      }

      queue.push(executor)
      if (queue.length === 1) {
        handleQueue()
      }

      return proxy
    }

  async function handleQueue() {
    while (queue.length) {
      const execute = queue[0]
      await execute()
      queue.shift()
    }
  }

  const customMethods = {
    on: applyFunc((ev, fn) => element.addEventListener(ev, fn)),
    delegate: applyFunc((event, subSelector, handler) => {
      element.addEventListener(event, (e) => {
        if (e.target.matches(subSelector)) handler.call(e.target, e)
      })
    }),
    html: applyFunc((newHtml) => {
      element.innerHTML = newHtml
    }),
    text: applyFunc((newText) => {
      element.textContent = newText
    }),
    css: applyFunc((stylesOrProp, value) => {
      if (typeof stylesOrProp === "string") {
        element.style[stylesOrProp] = value
      } else {
        Object.assign(element.style, stylesOrProp)
      }
    }),
    addClass: applyFunc((className) => {
      element.classList.add(className)
    }),
    removeClass: applyFunc((className) => {
      element.classList.remove(className)
    }),
    toggleClass: applyFunc((className) => {
      element.classList.toggle(className)
    }),
    setAttribute: applyFunc((attr, value) => {
      element.setAttribute(attr, value)
    }),
    data: applyFunc((key, value) => {
      element.dataset[key] = value
    }),
    append: applyFunc((child) => {
      if (typeof child === "string") {
        const template = document.createElement("template")
        template.innerHTML = child.trim()
        element.appendChild(template.content.firstChild)
      } else if (child instanceof HTMLElement) {
        element.appendChild(child)
      }
    }),
    appendTo: applyFunc((target) => {
      const targetElement = document.querySelector(target)
      targetElement.appendChild(element)
    }),
    prepend: applyFunc((child) => {
      if (typeof child === "string") {
        const template = document.createElement("template")
        template.innerHTML = child.trim()
        element.prepend(template.content.firstChild)
      } else if (child instanceof HTMLElement) {
        element.prepend(child)
      }
    }),
    prependTo: applyFunc((target) => {
      const targetElement = document.querySelector(target)
      targetElement.prepend(element)
    }),
    remove: applyFunc(() => {
      element.remove()
    }),
    animate: applyFunc((keyframes, options) => {
      return new Promise((resolve) => {
        const animation = element.animate(keyframes, options)
        animation.onfinish = resolve
      })
    }),
    wait: applyFunc((duration) => {
      return new Promise((resolve) => setTimeout(resolve, duration))
    }),
    find: (subSelector) => $(element.querySelector(subSelector)),
    closest: (ancestorSelector) => {
      const ancestor = element.closest(ancestorSelector)
      return $(ancestor)
    },
    next: () => $(element.nextElementSibling),
    prev: () => $(element.previousElementSibling),
    parent: () => $(element.parentElement),
    children: () => $$(Array.from(element.children)),
    siblings: () =>
      $$(
        Array.from(element.parentElement.children).filter(
          (el) => el !== element
        )
      ),
    styleSheet: addStyleSheet,
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

  proxy = new Proxy(customMethods, handler)
  return proxy
}

function $$(selector) {
  /** @type {HTMLElement[]} */
  const elements =
    typeof selector === "string"
      ? Array.from(document.querySelectorAll(selector))
      : selector

  const noop = () => proxy
  let proxy = null
  let queue = []

  const applyToElements =
    (method) =>
    (...args) => {
      const results = elements.map((element) => {
        const [namespace, func] = method.split(".")
        const context = namespace ? element[namespace] : element
        return context[func](...args)
      })

      const hasPromises = results.some((result) => result instanceof Promise)
      if (hasPromises) {
        return Promise.all(results).then(() => proxy)
      }

      return proxy
    }

  const checkAndApply = (method) =>
    elements.length ? applyToElements(method) : noop

  const applyFunc =
    (customFunction) =>
    (...args) => {
      const executor = async () => {
        const result = customFunction(...args)
        if (result instanceof Promise) {
          await result
        }
      }

      queue.push(executor)
      if (queue.length === 1) {
        handleQueue()
      }

      return proxy
    }

  async function handleQueue() {
    while (queue.length) {
      const execute = queue[0]
      await execute()
      queue.shift()
    }
  }

  const customMethods = {
    on: applyFunc((ev, fn) => {
      elements.forEach((element) => element.addEventListener(ev, fn))
    }),
    delegate: applyFunc((event, subSelector, handler) => {
      elements.forEach((element) => {
        element.addEventListener(event, (e) => {
          if (e.target.matches(subSelector)) handler.call(e.target, e)
        })
      })
    }),
    html: applyFunc((newHtml) => {
      elements.forEach((element) => (element.innerHTML = newHtml))
    }),
    text: applyFunc((newText) => {
      elements.forEach((element) => (element.textContent = newText))
    }),
    css: applyFunc((stylesOrProp, value) => {
      elements.forEach((element) => {
        if (typeof stylesOrProp === "string") {
          element.style[stylesOrProp] = value
        } else {
          Object.assign(element.style, stylesOrProp)
        }
      })
    }),
    addClass: checkAndApply("classList.add"),
    removeClass: checkAndApply("classList.remove"),
    toggleClass: checkAndApply("classList.toggle"),
    setAttribute: checkAndApply("setAttribute"),
    data: applyFunc((key, value) => {
      elements.forEach((element) => (element.dataset[key] = value))
    }),
    append: applyFunc((child) => {
      elements.forEach((element) => {
        if (typeof child === "string") {
          const template = document.createElement("template")
          template.innerHTML = child.trim()
          element.appendChild(template.content.firstChild)
        } else if (child instanceof HTMLElement) {
          element.appendChild(child)
        }
      })
    }),
    appendTo: applyFunc((target) => {
      const targetElement = document.querySelector(target)
      elements.forEach((element) => targetElement.appendChild(element))
    }),
    prepend: applyFunc((child) => {
      elements.forEach((element) => {
        if (typeof child === "string") {
          const template = document.createElement("template")
          template.innerHTML = child.trim()
          element.prepend(template.content.firstChild)
        } else if (child instanceof HTMLElement) {
          element.prepend(child)
        }
      })
    }),
    prependTo: applyFunc((target) => {
      const targetElement = document.querySelector(target)
      elements.forEach((element) => targetElement.prepend(element))
    }),
    remove: applyFunc(() => {
      elements.forEach((element) => element.remove())
    }),
    animate: applyFunc((keyframes, options) => {
      return new Promise((resolve) => {
        const animations = elements.map((element) =>
          element.animate(keyframes, options)
        )
        animations.forEach((animation) => (animation.onfinish = resolve))
      })
    }),
    wait: applyFunc((duration) => {
      return new Promise((resolve) => setTimeout(resolve, duration))
    }),
    find: (subSelector) => $$(selector + " " + subSelector),
    closest: (ancestorSelector) => {
      const ancestors = elements.map((element) =>
        element.closest(ancestorSelector)
      )
      return $$(ancestors.map((ancestor) => ancestor?.tagName).join(","))
    },
    next: () => $$(elements.map((element) => element.nextElementSibling)),
    prev: () => $$(elements.map((element) => element.previousElementSibling)),
    parent: () => $$(elements.map((element) => element.parentElement)),
    children: () =>
      $$(elements.map((element) => Array.from(element.children)).flat()),
    siblings: () =>
      $$(
        elements
          .map((element) =>
            Array.from(element.parentElement.children).filter(
              (el) => el !== element
            )
          )
          .flat()
      ),
    styleSheet: addStyleSheet,
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

  proxy = new Proxy(customMethods, handler)
  return proxy
}

export { $, $$ }

function addStyleSheet(rules) {
  document.head.appendChild(
    Object.assign(document.createElement("style"), {
      textContent: rules,
    })
  )
}
