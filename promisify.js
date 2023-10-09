import { defaultErrorHandler } from "./errors.js"

export function promisify(fn, timeout = 2000) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer) // Clear the timer here
        reject(new Error("Automatic rejection due to inaction."))
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
