import { defaultErrorHandler } from "./errors.js"

const isThenable = (value) => value && typeof value.then === "function"

export function createChainExecutor() {
  const queue = []
  let isProcessing = false

  async function runQueue() {
    if (isProcessing) return
    isProcessing = true

    while (queue.length) {
      const fn = queue[0]
      await fn()
      queue.shift()
    }

    isProcessing = false
  }

  function addToQueue(fn) {
    queue.push(fn)
    if (!isProcessing) {
      runQueue()
    }
  }

  return addToQueue
}

export function createApplyFunc(addToLocalQueue, proxy) {
  return function applyFunc(fn, context) {
    return (...args) => {
      addToLocalQueue(async () => {
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
