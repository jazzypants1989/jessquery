import { errorHandler, giveContext } from "./errors.js"
import { addMethods } from "./methods.js"
import { getDOMElement } from "./DOM.js"

export function $(selector, fixed = false) {
  return createProxy("$", selector, fixed)
}

export function $$(selector, fixed = false) {
  return createProxy("$$", selector, fixed)
}

function createProxy(type, selector, fixed = false) {
  const elements = getDOMElement(selector, {
    all: type === "$$",
    sanitize: false,
  })

  if (!elements[0]) {
    return errorHandler(new Error(`No elements.`), giveContext(type, selector))
  }

  return addMethods(selector, elements, fixed)
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

export function handlerMaker(elements, customMethods) {
  return {
    get(_, prop) {
      if (elements.length && elements.length === 1) {
        elements = elements[0]
      }

      if (prop === "raw") {
        return elements
      }

      if (prop in customMethods) {
        return customMethods[prop]
      }

      return typeof elements[prop] === "function"
        ? elements[prop].bind(elements)
        : elements[prop]
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
