import { defaultErrorHandler } from "./errors.js"

const isThenable = (value) => value && typeof value.then === "function"

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

export function createApplyFunc(addToQueue, proxy) {
  return function applyFunc(fn, context) {
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
