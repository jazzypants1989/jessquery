import { createQueueFunction, createQueue, handlerMaker } from "./core.js"
import { giveContext } from "./errors.js"
import {
  addStyleSheet,
  attach,
  become,
  Class,
  moveOrClone,
  setFormElementValue,
  stringOrObject,
  transition,
} from "./DOM.js"
import { fetchElements, send, wrappedFetch } from "./ajax.js"

export function addMethods(type, selector, target, fixed = false) {
  let proxy = null
  let isSingle = type === "$"

  const applyMethod = (func) => {
    return isSingle ? func(target) : target.forEach((el) => func(el))
  }

  const { addToQueue, prioritize, defer } = createQueue()
  const queueFunction = createQueueFunction(addToQueue, () => proxy)

  const makeMethod = (action, context) => {
    return queueFunction((...args) => {
      applyMethod((el) => action(el, ...args))
    }, giveContext(context, selector))
  }

  const customMethods = {
    on: makeMethod((el, ev, fn) => {
      el.addEventListener(ev, (...args) => {
        prioritize(fn, args)
      })
    }, "on"),

    once: makeMethod((el, ev, fn) => {
      el.addEventListener(
        ev,
        (...args) => {
          prioritize(fn, args)
        },
        { once: true }
      )
    }, "once"),

    delegate: makeMethod((el, event, subSelector, handler) => {
      el.addEventListener(event, (e) => {
        if (e.target.matches(subSelector)) {
          prioritize(handler, [e])
        }
      })
    }, "delegate"),

    off: makeMethod((el, ev, fn) => {
      el.removeEventListener(ev, fn)
    }, "off"),

    html: makeMethod((el, newHtml) => (el.innerHTML = newHtml), "html"),

    text: makeMethod((el, newText) => (el.textContent = newText), "text"),

    sanitize: makeMethod(
      (el, newHtml, sanitizer) => el.setHTML(newHtml, sanitizer),
      "sanitize"
    ),

    val: makeMethod((el, newValue) => setFormElementValue(el, newValue), "val"),

    css: makeMethod(
      (el, prop, value) => stringOrObject(el.style, prop, value),
      "css"
    ),

    addStyleSheet: makeMethod(
      (_, rules) => addStyleSheet(rules),
      "addStyleSheet"
    ),

    addClass: makeMethod(Class("add"), "addClass"),

    removeClass: makeMethod(Class("remove"), "removeClass"),

    toggleClass: makeMethod(Class("toggle"), "toggleClass"),

    set: makeMethod(
      (el, attr, value = "") => stringOrObject(el, attr, value, true),
      "set"
    ),

    unset: makeMethod((el, attr) => el.removeAttribute(attr), "unset"),

    toggle: makeMethod((el, attr) => el.toggleAttribute(attr), "toggle"),

    data: makeMethod(
      (el, keyOrObj, value) => stringOrObject(el.dataset, keyOrObj, value),
      "data"
    ),

    attach: makeMethod((el, ...children) => attach(el, ...children), "attach"),

    cloneTo: makeMethod((el, parentSelector, options) => {
      moveOrClone(el, parentSelector, { mode: "clone", ...options })
    }, "cloneTo"),

    moveTo: makeMethod((el, parentSelector, options) => {
      moveOrClone(el, parentSelector, { mode: "move", ...options })
    }, "moveTo"),

    become: makeMethod((el, replacements, options) => {
      become(el, replacements, options)
    }, "become"),

    purge: makeMethod((el) => el.remove(), "purge"),

    send: makeMethod((el, options) => send(el, options, applyMethod), "send"),

    do: makeMethod((el, fn) => {
      const wrappedElement = addMethods(type, selector, el)
      fn(wrappedElement)
    }),

    defer: makeMethod((el, fn) => {
      const wrappedElement = addMethods(type, selector, el)
      defer(fn, [wrappedElement])
    }, "defer"),

    fromJSON: makeMethod((el, url, fn, options = {}) => {
      wrappedFetch(url, options, "json", applyMethod).then((json) => {
        const wrappedElement = addMethods(type, selector, el)
        fn(wrappedElement, json)
      })
    }, "fromJSON"),

    fromHTML: makeMethod((el, url, options = {}) => {
      fetchElements("text", url, options, el, applyMethod)
    }, "fromHTML"),

    fromStream: makeMethod((el, url, options = {}) => {
      const type = options.sse ? "sse" : "stream"
      fetchElements(type, url, options, el, applyMethod)
    }, "fromStream"),

    transition: queueFunction(
      (keyframes, options) =>
        transition(
          Array.isArray(target) ? target : [target],
          keyframes,
          options
        ),
      giveContext("transition", selector)
    ),

    wait: queueFunction(
      (duration) => new Promise((resolve) => setTimeout(resolve, duration)),
      giveContext("wait", selector)
    ),

    next: contextSwitch("nextElementSibling"),

    prev: contextSwitch("previousElementSibling"),

    first: contextSwitch("firstElementChild"),

    last: contextSwitch("lastElementChild"),

    parent: contextSwitch("parentElement"),

    ancestor: queueFunction((selector) => {
      const ancestor = filterTarget((el) => el.closest(selector))
      return switchTarget(ancestor)
    }, giveContext("ancestor", selector)),

    kids: queueFunction(() => {
      const kidsArray = filterTarget((el) => Array.from(el.children))
      return switchTarget(kidsArray.flat())
    }, giveContext("kids", selector)),

    siblings: queueFunction(() => {
      const siblings = filterTarget((el) =>
        Array.from(el.parentElement.children).filter((child) => child !== el)
      )
      return switchTarget(siblings)
    }, giveContext("siblings", selector)),

    pick: queueFunction((selector) => {
      const pickedElements = filterTarget((el) => el.querySelector(selector))
      return switchTarget(pickedElements)
    }, giveContext("pick", selector)),

    pickAll: queueFunction((selector) => {
      const pickedElements = filterTarget((el) =>
        Array.from(el.querySelectorAll(selector))
      )
      return switchTarget(pickedElements.flat())
    }, giveContext("pickAll", selector)),
  }

  function updateProxy(newTarget) {
    const handler = handlerMaker(newTarget, customMethods)
    const proxy = new Proxy(customMethods, handler)
    proxy.raw = newTarget
    isSingle = !(newTarget instanceof Array)
    return proxy
  }

  function contextSwitch(prop) {
    return queueFunction(() => {
      const resultElements = filterTarget((el) => el[prop])
      return switchTarget(resultElements)
    }, giveContext(prop, selector))
  }

  function switchTarget(newTarget) {
    if (fixed)
      throw new Error(`Proxy is fixed. Create new proxy to switch targets.`)
    if (!newTarget || (Array.isArray(newTarget) && newTarget.length === 0))
      throw new Error(`No elements found.`)
    target = newTarget
    proxy = updateProxy(target)
    return proxy
  }

  function filterTarget(action) {
    if (isSingle) {
      const result = action(target)
      return result ? [result] : []
    } else {
      return target.map(action).filter((el) => el)
    }
  }

  proxy = updateProxy(target)
  return proxy
}
