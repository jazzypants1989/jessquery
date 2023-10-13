import { createApplyFunc, createQueue, handlerMaker } from "./core.js"
import { giveContext, isFixed } from "./errors.js"
import {
  addStyleSheet,
  attach,
  become,
  css,
  moveOrClone,
  setFormElementValue,
  transition,
  wrappedFetch,
} from "./utils.js"

export function addMethods(type, selector, target, fixed = false) {
  let proxy = null
  let isSingle = type === "$"

  const toOneOrMany = (func) => {
    return isSingle ? func(target) : target.forEach((el) => func(el))
  }

  const switchTarget = (newTarget) => {
    if (fixed) throw new Error(isFixed(isSingle, selector))
    if (!newTarget || (Array.isArray(newTarget) && newTarget.length === 0))
      throw new Error(`No element found.`)
    target = newTarget
    proxy = updateProxy(target)
    return proxy
  }

  const { addToQueue, prioritize, defer } = createQueue()
  const applyFunc = createApplyFunc(addToQueue, () => proxy)

  const customMethods = {
    on: applyFunc((ev, fn) => {
      toOneOrMany((el) => {
        el.addEventListener(ev, (...args) => {
          prioritize(fn, args)
        })
      })
    }, giveContext("on", selector)),

    once: applyFunc((ev, fn) => {
      toOneOrMany((el) => {
        el.addEventListener(
          ev,
          (...args) => {
            prioritize(fn, args)
          },
          { once: true }
        )
      })
    }, giveContext("once", selector)),

    delegate: applyFunc((event, subSelector, handler) => {
      toOneOrMany((el) => {
        el.addEventListener(event, (e) => {
          if (e.target.matches(subSelector)) {
            prioritize(handler, [e])
          }
        })
      })
    }, giveContext("delegate", selector)),

    off: applyFunc((ev, fn) => {
      toOneOrMany((el) => {
        el.removeEventListener(ev, fn)
      })
    }, giveContext("off", selector)),

    html: applyFunc((newHtml) => {
      toOneOrMany((el) => (el.innerHTML = newHtml))
    }, giveContext("html", selector)),

    sanitize: applyFunc((newHtml, sanitizer) => {
      toOneOrMany((el) => el.setHTML(newHtml, sanitizer))
    }, giveContext("sanitize", selector)),

    text: applyFunc((newText) => {
      toOneOrMany((el) => (el.textContent = newText))
    }, giveContext("text", selector)),

    val: applyFunc((newValue) => {
      toOneOrMany((el) => {
        setFormElementValue(el, newValue)
      })
    }, giveContext("val", selector)),

    css: applyFunc((stylesOrProp, value) => {
      toOneOrMany((el) => css(el, stylesOrProp, value))
    }, giveContext("css", selector)),

    addStyleSheet: applyFunc((rules) => {
      addStyleSheet(rules)
    }, giveContext("addStyleSheet", selector)),

    addClass: applyFunc((className) => {
      toOneOrMany((el) => el.classList.add(className))
    }, giveContext("addClass", selector)),

    removeClass: applyFunc((className) => {
      toOneOrMany((el) => el.classList.remove(className))
    }, giveContext("removeClass", selector)),

    toggleClass: applyFunc((className) => {
      toOneOrMany((el) => el.classList.toggle(className))
    }, giveContext("toggleClass", selector)),

    set: applyFunc((attr, value = "") => {
      toOneOrMany((el) => el.setAttribute(attr, value))
    }, giveContext("set", selector)),

    unset: applyFunc((attr) => {
      toOneOrMany((el) => el.removeAttribute(attr))
    }, giveContext("unset", selector)),

    toggle: applyFunc((attr) => {
      toOneOrMany((el) => el.toggleAttribute(attr))
    }, giveContext("toggle", selector)),

    data: applyFunc((key, value) => {
      toOneOrMany((el) => (el.dataset[key] = value))
    }, giveContext("data", selector)),

    attach: applyFunc((...children) => {
      toOneOrMany((el) => attach(el, ...children))
    }, giveContext("attach", selector)),

    cloneTo: applyFunc((parentSelector, options) => {
      moveOrClone(target, parentSelector, { mode: "clone", ...options })
    }, giveContext("cloneTo", selector)),

    moveTo: applyFunc((parentSelector, options) => {
      moveOrClone(target, parentSelector, { mode: "move", ...options })
    }, giveContext("moveTo", selector)),

    become: applyFunc((replacements, options) => {
      become(target, replacements, options)
    }, giveContext("become", selector)),

    purge: applyFunc(() => {
      toOneOrMany((el) => el.remove())
    }, giveContext("purge", selector)),

    transition: applyFunc(
      (keyframes, options) =>
        transition(
          Array.isArray(target) ? target : [target],
          keyframes,
          options
        ),
      giveContext("transition", selector)
    ),

    do: applyFunc((fn) => {
      toOneOrMany((el) => {
        const wrappedElement = addMethods(type, selector, el)
        fn(wrappedElement)
      })
    }, giveContext("do", selector)),

    now: applyFunc((fn) => {
      toOneOrMany((el) => {
        const wrappedElement = addMethods(type, selector, el)
        prioritize(fn, [wrappedElement])
      })
    }, giveContext("now", selector)),

    later: applyFunc((fn) => {
      toOneOrMany((el) => {
        const wrappedElement = addMethods(type, selector, el)
        defer(fn, [wrappedElement])
      })
    }, giveContext("later", selector)),

    fromJSON: applyFunc((url, transformFunc, options = {}) => {
      if (typeof transformFunc !== "function") {
        throw new TypeError("Expected transformFunc to be a function")
      }

      wrappedFetch(url, options, "json", toOneOrMany).then((json) => {
        toOneOrMany((el) => {
          const wrappedElement = addMethods(type, selector, el)
          transformFunc(wrappedElement, json)
        })
      })
    }, giveContext("fromJSON", selector)),

    fromHTML: applyFunc((url, options = {}) => {
      wrappedFetch(url, options, "text", toOneOrMany).then((html) => {
        if (html) {
          const { sanitize = true, sanitizer } = options
          const targetElements = Array.isArray(target) ? target : [target]
          targetElements.forEach((el) => {
            sanitize ? el.setHTML(html, sanitizer) : (el.innerHTML = html)
          })
        } else {
          throw new Error(`No HTML found at ${url}`)
        }
      })
    }, giveContext("fromHTML", selector)),

    wait: applyFunc(
      (duration) => new Promise((resolve) => setTimeout(resolve, duration)),
      giveContext("wait", selector)
    ),

    next: applyFunc(() => {
      const nextElements = performOnTargets((el) => el.nextElementSibling)
      return switchTarget(nextElements)
    }, giveContext("next", selector)),

    prev: applyFunc(() => {
      const previousElements = performOnTargets(
        (el) => el.previousElementSibling
      )
      return switchTarget(previousElements)
    }, giveContext("prev", selector)),

    first: applyFunc(() => {
      const firstChildren = performOnTargets((el) => el.firstElementChild)
      return switchTarget(firstChildren)
    }, giveContext("first", selector)),

    last: applyFunc(() => {
      const lastChildren = performOnTargets((el) => el.lastElementChild)
      return switchTarget(lastChildren)
    }, giveContext("last", selector)),

    parent: applyFunc(() => {
      const parents = isSingle
        ? [target.parentElement]
        : target.map((el) => el.parentElement)
      return switchTarget([...new Set(parents)])
    }, giveContext("parent", selector)),

    ancestor: applyFunc((selector) => {
      const ancestors = isSingle
        ? [target.closest(selector)]
        : target.map((el) => el.closest(selector))
      return switchTarget([...new Set(ancestors)])
    }, giveContext("ancestor", selector)),

    kids: applyFunc(() => {
      const childrenArray = isSingle
        ? target.children
          ? Array.from(target.children)
          : []
        : target.flatMap((el) => Array.from(el.children))
      return switchTarget(childrenArray)
    }, giveContext("kids", selector)),

    siblings: applyFunc(() => {
      const siblingsArray = isSingle
        ? Array.from(target.parentElement.children).filter(
            (child) => child !== target
          )
        : target.flatMap((el) =>
            Array.from(el.parentElement.children).filter(
              (child) => child !== el
            )
          )
      siblingsArray.length ? switchTarget(siblingsArray) : switchTarget(null)
    }, giveContext("siblings", selector)),

    pick: applyFunc((selector) => {
      const pickedElements = performOnTargets((el) =>
        el.querySelector(selector)
      )
      return switchTarget(pickedElements)
    }, giveContext("pick", selector)),

    pickAll: applyFunc((selector) => {
      const pickedElements = performOnTargets((el) =>
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

  function performOnTargets(action) {
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
