import { createQueue, handlerMaker, queueAndReturn } from "./core.js"
import { errorHandler, giveContext } from "./errors.js"
import { fetchElements, send, wrappedFetch } from "./ajax.js"
import {
  addStyleSheet,
  attach,
  become,
  Class,
  moveOrClone,
  parseArgument,
  setFormElementValue,
} from "./DOM.js"

export function addMethods(selector, target, fixed = false) {
  const originalTarget = [...target]

  let proxy = null

  const { addToQueue, defer } = createQueue()
  const queueFunction = queueAndReturn(addToQueue, () => proxy)

  const makeMethod = (action, context) => {
    return queueFunction(async (...args) => {
      await Promise.all(target.map((el) => action(el, ...args)))
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

    html: makeMethod((el, newHtml, outer) => {
      if (outer) {
        const nextSibling = el.nextSibling // We need to get the nextSibling before removing the element
        el.outerHTML = newHtml // Otherwise, we lose the reference, and the proxy is empty

        const newElement = nextSibling // If nextSibling is null, then we're at the end of the list
          ? nextSibling.previousSibling // So, we get the previousSibling from where we were
          : el.parentElement.lastElementChild // Otherwise, we get the lastElementChild from the parent

        const index = target.indexOf(el)
        target[index] = newElement
      } else {
        el.innerHTML = newHtml
      }
    }, "html"),

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
      const wrappedElement = addMethods(selector, [el])
      return await fn(wrappedElement)
    }, "do"),

    defer: makeMethod((el, fn) => {
      const wrappedElement = addMethods(selector, [el])
      return defer(fn, [wrappedElement])
    }, "defer"),

    fromJSON: makeMethod((el, url, fn, options = {}) => {
      return wrappedFetch(url, options, "json", target).then((json) => {
        const wrappedElement = addMethods(selector, [el])
        fn(wrappedElement, json)
      })
    }, "fromJSON"),

    fromHTML: makeMethod((el, url, options = {}) => {
      return fetchElements("text", url, options, [el])
    }, "fromHTML"),

    fromStream: makeMethod((el, url, options = {}) => {
      const type = options.sse ? "sse" : "stream"
      return fetchElements(type, url, options, [el])
    }, "fromStream"),

    transition: makeMethod((el, keyframes, options) => {
      return el.animate(keyframes, options).finished
    }, "transition"),

    wait: makeMethod((el, duration) => {
      return new Promise((resolve) => setTimeout(resolve, duration))
    }, "wait"),

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
        for (const el of target) {
          const wrappedElement = addMethods(selector, [el])
          try {
            if (is(wrappedElement)) {
              then && then(wrappedElement)
            } else {
              or && or(wrappedElement)
            }
          } catch (error) {
            errorHandler(error, giveContext("if", selector))
          }
        }
      },
      giveContext("if", selector),
      false
    ),

    takeWhile: queueFunction((predicate, reverse) => {
      const result = []
      if (reverse) target.reverse()
      for (const el of target) {
        try {
          if (predicate(el.raw || el)) {
            result.push(el)
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

  function filterTarget(action) {
    return target.map(action).filter((el) => el)
  }

  function switchTarget(newTarget) {
    if (fixed)
      throw new Error(`Proxy is fixed. Create new proxy to switch targets.`)
    target = newTarget.length > 0 ? newTarget : []
    proxy = updateProxy(target)
    return proxy
  }

  function contextSwitch(prop) {
    return queueFunction(() => {
      const resultElements = filterTarget((el) => el[prop])
      return switchTarget(resultElements)
    }, giveContext(prop, selector))
  }

  function updateProxy(newTarget) {
    const handler = handlerMaker(newTarget, customMethods)
    const proxy = new Proxy(customMethods, handler)
    proxy.raw = newTarget
    return proxy
  }

  proxy = updateProxy(target)
  return proxy
}
