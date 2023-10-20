import { createQueue, handlerMaker, queueAndReturn } from "./core.js"
import { errorHandler, giveContext } from "./errors.js"
import {
  addStyleSheet,
  attach,
  become,
  Class,
  moveOrClone,
  parseArgument,
  setFormElementValue,
  transition,
} from "./DOM.js"
import { fetchElements, send, wrappedFetch } from "./ajax.js"

export function addMethods(type, selector, target, fixed = false) {
  let proxy = null
  let originalTarget = [...target]

  const { addToQueue, defer } = createQueue()
  const queueFunction = queueAndReturn(addToQueue, () => proxy)

  const makeMethod = (action, context) => {
    return queueFunction(async (...args) => {
      let promises = []
      target.forEach((el) => {
        promises.push(action(el, ...args))
      })
      await Promise.all(promises)
    }, giveContext(context, selector))
  }

  const customMethods = {
    on: makeMethod((el, ev, fn) => {
      el.addEventListener(ev, fn)
    }, "on"),

    once: makeMethod((el, ev, fn) => {
      el.addEventListener(ev, fn, { once: true })
    }, "once"),

    delegate: makeMethod((el, ev, selector, fn) => {
      el.addEventListener(ev, (event) => {
        if (event.target.matches(selector)) {
          fn(event)
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
      (el, prop, value) => parseArgument(el.style, prop, value),
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
      (el, attr, value = "") => parseArgument(el, attr, value, true),
      "set"
    ),

    unset: makeMethod((el, attr) => el.removeAttribute(attr), "unset"),

    toggle: makeMethod((el, attr) => el.toggleAttribute(attr), "toggle"),

    data: makeMethod(
      (el, key, value) => parseArgument(el.dataset, key, value),
      "data"
    ),

    attach: makeMethod((el, ...children) => attach(el, ...children), "attach"),

    cloneTo: makeMethod((el, parentSelector, options) => {
      moveOrClone(el, parentSelector, { mode: "clone", ...options })
    }, "cloneTo"),

    moveTo: makeMethod((el, parentSelector, options) => {
      moveOrClone(el, parentSelector, options)
    }, "moveTo"),

    become: makeMethod((el, replacements, options) => {
      become(el, replacements, options)
    }, "become"),

    purge: makeMethod((el) => el.remove(), "purge"),

    send: makeMethod((el, options) => send(el, options, target), "send"),

    do: makeMethod(async (el, fn) => {
      const wrappedElement = addMethods(type, selector, [el])
      const result = await fn(wrappedElement)
      return result
    }, "do"),

    defer: makeMethod((el, fn) => {
      const wrappedElement = addMethods(type, selector, [el])
      defer(fn, [wrappedElement])
    }, "defer"),

    fromJSON: makeMethod((el, url, fn, options = {}) => {
      wrappedFetch(url, options, "json", target).then((json) => {
        const wrappedElement = addMethods(type, selector, [el])
        fn(wrappedElement, json)
      })
    }, "fromJSON"),

    fromHTML: makeMethod((el, url, options = {}) => {
      fetchElements("text", url, options, [el])
    }, "fromHTML"),

    fromStream: makeMethod((el, url, options = {}) => {
      const type = options.sse ? "sse" : "stream"
      fetchElements(type, url, options, [el])
    }, "fromStream"),

    transition: queueFunction(
      (keyframes, options) => transition(target, keyframes, options),
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

    if: queueFunction(
      ({ is, then, or }) => {
        target.forEach((el) => {
          const wrappedElement = addMethods(type, selector, [el])
          try {
            if (is(wrappedElement)) {
              then && then(wrappedElement)
            } else {
              or && or(wrappedElement)
            }
          } catch (error) {
            errorHandler(error, giveContext("if", selector))
          }
        })
      },
      giveContext("if", selector),
      false
    ),

    takeWhile: queueFunction((predicate) => {
      const result = []
      for (const item of target) {
        try {
          if (predicate(item.raw || item)) {
            result.push(item)
          } else {
            break
          }
        } catch (error) {
          errorHandler(error, giveContext("takeWhile", selector))
        }
      }
      return switchTarget(result)
    }, giveContext("takeWhile", selector)),

    refresh: queueFunction(() => {
      target = [...originalTarget]
    }, giveContext("refresh", selector)),
  }

  function updateProxy(newTarget) {
    const handler = handlerMaker(newTarget, customMethods)
    const proxy = new Proxy(customMethods, handler)
    proxy.raw = newTarget
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
    target = newTarget.length > 0 ? newTarget : []
    proxy = updateProxy(target)
    return proxy
  }

  function filterTarget(action) {
    return target.map(action).filter((el) => el)
  }

  proxy = updateProxy(target)
  return proxy
}
