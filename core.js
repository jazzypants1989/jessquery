import { defaultErrorHandler } from "./errors.js"

const isThenable = (value) => value && typeof value.then === "function"

let priorityEvent = false

export function prioritize(fn, args) {
  priorityEvent = true
  fn(...args)
  priorityEvent = false
}

export function createChainExecutor() {
  const queue = []
  let isProcessing = false

  async function runQueue() {
    if (isProcessing) return
    isProcessing = true

    while (queue.length) {
      const fn = queue.shift()
      await fn()
    }

    isProcessing = false
  }

  function addToQueue(fn) {
    if (priorityEvent) {
      fn()
    } else {
      queue.push(fn)
      if (!isProcessing) {
        runQueue()
      }
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
