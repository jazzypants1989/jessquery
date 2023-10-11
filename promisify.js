import { defaultErrorHandler } from "./errors.js"

export function promisify(fn, timeout = 5000) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer)
        reject(new Error("Promisify timeout."))
      }, timeout)

      try {
        fn(
          resolve,
          (err) => {
            clearTimeout(timer)
            defaultErrorHandler(err)
            reject(err)
          },
          ...args
        )
      } catch (error) {
        clearTimeout(timer)
        defaultErrorHandler(error)
        reject(error)
      }
    })
  }
}
