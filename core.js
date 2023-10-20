import { errorHandler, giveContext } from "./errors.js"
import { addMethods } from "./methods.js"
import { getDOMElement } from "./DOM.js"

export function $(string, fixed = false) {
  return addProxy("$", string, fixed)
}

export function $$(string, fixed = false) {
  return addProxy("$$", string, fixed)
}

function addProxy(type, string, fixed = false) {
  const elements = getDOMElement(string, {
    all: type === "$$",
    sanitize: false,
  })

  if (!elements[0]) {
    return errorHandler(new Error(`No elements.`), giveContext(type, string))
  }

  return addMethods(type, string, elements, fixed)
}

export function createQueue() {
  const mainQueue = []
  const deferredQueue = []
  let isRunning = false

  async function runQueue() {
    if (isRunning) return
    isRunning = true

    while (mainQueue.length > 0) {
      const fn = mainQueue.shift()
      await fn()
    }

    if (deferredQueue.length > 0 && mainQueue.length === 0) {
      while (deferredQueue.length > 0) {
        const { fn, args } = deferredQueue.shift()
        await eachArgument(fn, args)
      }
    }

    isRunning = false
  }

  function addToQueue(fn) {
    mainQueue.push(fn)
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
    defer,
  }
}

export function queueAndReturn(addToQueue, getProxy) {
  return function queueFunction(fn, context, eager = true) {
    return (...args) => {
      addToQueue(async () => {
        try {
          await eachArgument(fn, args, eager)
        } catch (error) {
          errorHandler(error, context)
        }
      })
      return getProxy()
    }
  }
}

export function handlerMaker(element, customMethods) {
  return {
    get(_, prop) {
      if (element.length && element.length === 1) {
        element = element[0]
      }

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
  }
}

async function eachArgument(fn, args, eager = true) {
  const isThenable = (value) => value && typeof value.then === "function"
  const resolvedArgs = []
  for (const arg of args) {
    resolvedArgs.push(isThenable(arg) && eager ? await arg : arg)
  }
  const result = fn(...resolvedArgs)
  if (isThenable(result)) {
    await result
  }
}
