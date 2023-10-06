function $(selector) {
  /** @type {HTMLElement | null} */
  let element =
    typeof selector === "string" ? document.querySelector(selector) : selector

  const queue = []
  const applyFunc = createApplyFunc(() => element, queue)

  const customMethods = {
    on: applyFunc((el, ev, fn) => el.addEventListener(ev, fn)),
    delegate: applyFunc((el, event, subSelector, handler) =>
      delegate(el, event, subSelector, handler)
    ),
    html: applyFunc((el, newHtml) => (el.innerHTML = newHtml)),
    text: applyFunc((el, newText) => (el.textContent = newText)),
    css: applyFunc((el, stylesOrProp, value) => css(el, stylesOrProp, value)),
    addClass: applyFunc((el, className) => el.classList.add(className)),
    removeClass: applyFunc((el, className) => el.classList.remove(className)),
    toggleClass: applyFunc((el, className) => el.classList.toggle(className)),
    setAttribute: applyFunc((el, attr, value) => el.setAttribute(attr, value)),
    data: applyFunc((el, key, value) => (el.dataset[key] = value)),
    remove: applyFunc((el) => el.remove()),
    animate: applyFunc((el, keyframes, options) =>
      animate([el], keyframes, options)
    ),
    wait: applyFunc(
      (_, duration) => new Promise((resolve) => setTimeout(resolve, duration))
    ),
    find: (subSelector) => $(element.querySelector(subSelector)),
    closest: (ancestorSelector) => {
      const ancestor = element.closest(ancestorSelector)
      return $(ancestor)
    },
    styleSheet: addStyleSheet,
  }

  return new Proxy(element, {
    get: (_, prop) => customMethods[prop] || element[prop],
    set: (_, prop, value) => {
      if (customMethods[prop]) {
        customMethods[prop] = value
      } else {
        element[prop] = value
      }
      return true
    },
  })
}

function $$(selector) {
  /** @type {HTMLElement[]} */
  const elements =
    typeof selector === "string"
      ? Array.from(document.querySelectorAll(selector))
      : selector

  const queue = []
  const applyFunc = createApplyFunc(() => elements, queue)

  const customMethods = {
    on: applyFunc((els, ev, fn) =>
      els.forEach((el) => el.addEventListener(ev, fn))
    ),
    delegate: applyFunc((els, event, subSelector, handler) =>
      els.forEach((el) => delegate(el, event, subSelector, handler))
    ),
    html: applyFunc((els, newHtml) =>
      els.forEach((el) => (el.innerHTML = newHtml))
    ),
    text: applyFunc((els, newText) =>
      els.forEach((el) => (el.textContent = newText))
    ),
    css: applyFunc((els, stylesOrProp, value) =>
      els.forEach((el) => css(el, stylesOrProp, value))
    ),
    addClass: applyFunc((els, className) =>
      els.forEach((el) => el.classList.add(className))
    ),
    removeClass: applyFunc((els, className) =>
      els.forEach((el) => el.classList.remove(className))
    ),
    toggleClass: applyFunc((els, className) =>
      els.forEach((el) => el.classList.toggle(className))
    ),
    setAttribute: applyFunc((els, attr, value) =>
      els.forEach((el) => el.setAttribute(attr, value))
    ),
    data: applyFunc((els, key, value) =>
      els.forEach((el) => (el.dataset[key] = value))
    ),
    remove: applyFunc((els) => els.forEach((el) => el.remove())),
    animate: applyFunc((els, keyframes, options) =>
      animate(els, keyframes, options)
    ),
    wait: applyFunc(
      (_, duration) => new Promise((resolve) => setTimeout(resolve, duration))
    ),
    find: (subSelector) => $$(subSelector),
    closest: (ancestorSelector) => {
      const ancestors = elements.map((el) => el.closest(ancestorSelector))
      return $$(ancestors)
    },
    styleSheet: addStyleSheet,
  }

  return new Proxy(elements, {
    get: (_, prop) => customMethods[prop] || elements[prop],
    set: (_, prop, value) => {
      if (customMethods[prop]) {
        customMethods[prop] = value
      } else {
        elements[prop] = value
      }
      return true
    },
  })
}

function createApplyFunc(getTarget, queue) {
  return (customFunction) => {
    return (...args) => {
      const target = getTarget()
      const executor = async () => {
        const result = customFunction(target, ...args)
        if (result instanceof Promise) {
          await result
        }
      }
      queue.push(executor)
      if (queue.length === 1) {
        handleQueue(queue)
      }
      return target
    }
  }
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

function animate(elements, keyframes, options) {
  return new Promise((resolve) => {
    const animations = elements.map((el) => el.animate(keyframes, options))
    const completedAnimations = []
    animations.forEach((animation, index) => {
      animation.onfinish = () => {
        completedAnimations.push(index)
        if (completedAnimations.length === animations.length) resolve()
      }
    })
  })
}

function addStyleSheet(rules) {
  const style = document.createElement("style")
  style.textContent = rules
  document.head.appendChild(style)
}

export { $, $$ }
