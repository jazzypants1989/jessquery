import { defaultErrorHandler, giveContext } from "./errors.js"
import { addMethods } from "./methods.js"
import { getDOMElement } from "./DOM.js"

export function $(string, fixed = false) {
  return addProxy("$", string, fixed)
}

export function $$(string, fixed = false) {
  return addProxy("$$", string, fixed)
}

function addProxy(type, string, fixed = false) {
  const elements = getDOMElement(string, false, type === "$$")

  if (!elements[0]) {
    return defaultErrorHandler(
      new Error(`No elements for ${type}(${string})`),
      giveContext(type, string)
    )
  }

  return addMethods(type, string, elements[1] ? elements : elements[0], fixed)
}

export function createQueue() {
  const priorityQueue = []
  const mainQueue = []
  const deferredQueue = []
  let isRunning = false

  async function runQueue() {
    if (isRunning) return
    isRunning = true

    while (priorityQueue.length > 0 || mainQueue.length > 0) {
      if (priorityQueue.length > 0) {
        const { fn, args } = priorityQueue.shift()
        await fn(...args)
      } else if (mainQueue.length > 0) {
        const fn = mainQueue.shift()
        await fn()
      }
    }

    if (
      deferredQueue.length > 0 &&
      mainQueue.length === 0 &&
      priorityQueue.length === 0
    ) {
      while (deferredQueue.length > 0) {
        const { fn, args } = deferredQueue.shift()
        await fn(...args)
      }
    }

    isRunning = false
  }

  function addToQueue(fn) {
    mainQueue.push(fn)
    runQueue()
  }

  function prioritize(fn, args = []) {
    priorityQueue.push({ fn, args })
    runQueue()
  }

  function defer(fn, args = []) {
    deferredQueue.push({ fn, args })
    if (!isRunning) {
      runQueue()
    }
  }

  return {
    addToQueue,
    prioritize,
    defer,
  }
}

export function createQueueFunction(addToQueue, proxy) {
  const isThenable = (value) => value && typeof value.then === "function"

  return function queueFunction(fn, context) {
    return (...args) => {
      addToQueue(async () => {
        try {
          const resolvedArgs = []
          for (const arg of args) {
            resolvedArgs.push(isThenable(arg) ? await arg : arg)
          }
          const result = fn(...resolvedArgs)
          if (isThenable(result)) {
            await result
          }
        } catch (error) {
          defaultErrorHandler(error, context)
        }
      })
      return proxy()
    }
  }
}

export function handlerMaker(element, customMethods) {
  return {
    get(_, prop) {
      if (prop === "raw") {
        return element
      }

      if (prop in customMethods) {
        return customMethods[prop]
      }

      if (Array.isArray(element) && element[prop]) {
        return typeof element[prop] === "function"
          ? element[prop].bind(element)
          : element[prop]
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
}
