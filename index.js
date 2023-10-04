class DomElement {
  constructor(selector) {
    this.element = document.querySelector(selector)
  }

  on(ev, fn) {
    this.element.addEventListener(ev, fn)
    return this
  }

  css(arg1, arg2) {
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

  addClass(className) {
    this.element.classList.add(className)
    return this
  }

  removeClass(className) {
    this.element.classList.remove(className)
    return this
  }

  toggleClass(className) {
    this.element.classList.toggle(className)
    return this
  }

  setAttribute(attr, value) {
    if (this.element.getAttribute(attr) !== value) {
      this.element.setAttribute(attr, value)
    }
    return this
  }

  append(htmlString) {
    this.element.appendChild(htmlString)
    return this
  }

  appendTo(target) {
    const targetElement = document.querySelector(target)
    targetElement.appendChild(this.element)
    return this
  }

  remove() {
    this.element.remove()
    return this
  }

  html(newHtml) {
    this.element.innerHTML = newHtml
    return this
  }

  text(newText) {
    this.element.textContent = newText
    return this
  }

  animate(keyframes, options) {
    const animation = this.element.animate(keyframes, options)
    animation.onfinish = () => this // Return proxy on animation finish for chaining
    return this
  }

  static create(htmlString) {
    const template = document.createElement("template")
    template.innerHTML = htmlString.trim()
    return new DomElement(template.content.firstChild)
  }

  static createAll(htmlString) {
    const template = document.createElement("template")
    template.innerHTML = htmlString.trim()
    return new DomElements(template.content.childNodes)
  }
}

class DomElements {
  constructor(selector) {
    this.elements = Array.from(document.querySelectorAll(selector))
  }

  on(ev, fn) {
    this.elements.forEach((element) => element.addEventListener(ev, fn))
    return this
  }

  addClass(className) {
    this.elements.forEach((element) => element.classList.add(className))
    return this
  }

  removeClass(className) {
    this.elements.forEach((element) => element.classList.remove(className))
    return this
  }

  toggleClass(className) {
    this.elements.forEach((element) => element.classList.toggle(className))
    return this
  }

  setAttribute(attr, value) {
    this.elements.forEach((element) => {
      if (element.getAttribute(attr) !== value) {
        element.setAttribute(attr, value)
      }
    })
    return this
  }

  append(htmlString) {
    this.elements.forEach((element) => element.appendChild(htmlString))
    return this
  }

  appendTo(target) {
    const targetElement = document.querySelector(target)
    this.elements.forEach((element) => targetElement.appendChild(element))
    return this
  }

  remove() {
    this.elements.forEach((element) => element.remove())
    return this
  }

  find(subSelector) {
    return new DomElements(
      this.elements.map((element) => element.querySelector(subSelector))
    )
  }

  closest(ancestorSelector) {
    const ancestors = this.elements.map((element) =>
      element.closest(ancestorSelector)
    )
    return new DomElements(
      ancestors.map((ancestor) => ancestor?.tagName).join(",")
    )
  }

  delegate(event, subSelector, handler) {
    this.elements.forEach((element) => {
      element.addEventListener(event, (e) => {
        if (e.target.matches(subSelector)) handler.call(e.target, e)
      })
    })
  }

  animate(keyframes, options) {
    this.elements.forEach((element) => {
      const animation = element.animate(keyframes, options)
      animation.onfinish = () => this
    })
  }

  css(arg1, arg2) {
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

  html(newHtml) {
    this.elements.forEach((element) => (element.innerHTML = newHtml))
  }

  text(newText) {
    this.elements.forEach((element) => (element.textContent = newText))
  }
}

function $(selector) {
  return new DomElement(selector)
}

function $$(selector) {
  return new DomElements(selector)
}

export { $, $$ }
