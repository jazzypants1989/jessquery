import { createApplyFunc, createQueue, handlerMaker } from "./core.js"
import { giveContext } from "./errors.js"
import {
  addStyleSheet,
  attach,
  become,
  stringOrObject,
  moveOrClone,
  setFormElementValue,
  transition,
  wrappedFetch,
  send,
  fetchElements,
} from "./utils.js"

export function addMethods(type, selector, target, fixed = false) {
  let proxy = null
  let isSingle = type === "$"

  const toOneOrMany = (func) => {
    return isSingle ? func(target) : target.forEach((el) => func(el))
  }

  const { addToQueue, prioritize, defer } = createQueue()
  const applyFunc = createApplyFunc(addToQueue, () => proxy)

  const makeMethod = (action, methodContext) => {
    return applyFunc((...args) => {
      toOneOrMany((el) => action(el, ...args))
    }, giveContext(methodContext, selector))
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
      (el, stylesOrProp, value) =>
        stringOrObject(el.style, stylesOrProp, value),
      "css"
    ),

    addStyleSheet: makeMethod(
      (el, rules) => addStyleSheet(rules),
      "addStyleSheet"
    ),

    addClass: makeMethod(classMethod("add"), "addClass"),

    removeClass: makeMethod(classMethod("remove"), "removeClass"),

    toggleClass: makeMethod(classMethod("toggle"), "toggleClass"),

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

    send: makeMethod((el, options) => send(el, options), "send"),

    fromStream: makeMethod((url, options = {}) => {
      const type = options.sse ? "sse" : "stream"
      fetchElements(type, url, options, target, toOneOrMany)
    }, "fromStream"),

    fromHTML: makeMethod((el, url, options = {}) => {
      fetchElements("text", url, options, el, toOneOrMany)
    }, "fromHTML"),

    fromJSON: makeMethod((el, url, fn, options = {}) => {
      wrappedFetch(url, options, "json", toOneOrMany).then((json) => {
        const wrappedElement = addMethods(type, selector, el)
        fn(wrappedElement, json)
      })
    }, "fromJSON"),

    do: makeMethod((el, fn) => {
      const wrappedElement = addMethods(type, selector, el)
      fn(wrappedElement)
    }),

    defer: makeMethod((el, fn) => {
      const wrappedElement = addMethods(type, selector, el)
      defer(fn, [wrappedElement])
    }, "defer"),

    transition: applyFunc(
      (keyframes, options) =>
        transition(
          Array.isArray(target) ? target : [target],
          keyframes,
          options
        ),
      giveContext("transition", selector)
    ),

    wait: applyFunc(
      (duration) => new Promise((resolve) => setTimeout(resolve, duration)),
      giveContext("wait", selector)
    ),

    next: contextSwitch("nextElementSibling"),

    prev: contextSwitch("previousElementSibling"),

    first: contextSwitch("firstElementChild"),

    last: contextSwitch("lastElementChild"),

    parent: contextSwitch("parentElement"),

    ancestor: applyFunc((selector) => {
      const ancestor = filterTarget((el) => el.closest(selector))
      return switchTarget(ancestor)
    }, giveContext("ancestor", selector)),

    kids: applyFunc(() => {
      const kidsArray = filterTarget((el) => Array.from(el.children))
      return switchTarget(kidsArray.flat())
    }, giveContext("kids", selector)),

    siblings: applyFunc(() => {
      const siblings = filterTarget((el) =>
        Array.from(el.parentElement.children).filter((child) => child !== el)
      )
      return switchTarget(siblings)
    }, giveContext("siblings", selector)),

    pick: applyFunc((selector) => {
      const pickedElements = filterTarget((el) => el.querySelector(selector))
      return switchTarget(pickedElements)
    }, giveContext("pick", selector)),

    pickAll: applyFunc((selector) => {
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
    return applyFunc(() => {
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

  function classMethod(type) {
    return (el, ...classes) => el.classList[type](...classes)
  }

  proxy = updateProxy(target)
  return proxy
}
