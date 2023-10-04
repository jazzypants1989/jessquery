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
