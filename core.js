import { defaultErrorHandler } from "./errors.js"

const isThenable = (value) => value && typeof value.then === "function"

let eventsQueue = []

export function createChainExecutor() {
  const queue = []
  let isWaiting = false

  async function runQueue() {
    if ((eventsQueue.length === 0 && queue.length === 0) || isWaiting) return

    try {
      const fn = eventsQueue.length > 0 ? eventsQueue.shift() : queue.shift()
      const result = fn()

      if (isThenable(result)) {
        isWaiting = true
        await result
        isWaiting = false
      }
    } catch (error) {
      defaultErrorHandler(error)
    } finally {
      runQueue()
    }
  }

  function addToQueue(fn, isEvent = false) {
    if (isEvent) {
      eventsQueue.push(fn)
    } else {
      queue.push(fn)
    }

    if (!isWaiting) {
      runQueue()
    }
  }

  return addToQueue
}

export function createApplyFunc(addToQueue, getProxy) {
  return function applyFunc(fn, context, isEvent = false) {
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
      }, isEvent)
      return getProxy()
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
