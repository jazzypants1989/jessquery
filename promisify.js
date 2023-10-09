import { defaultErrorHandler } from "./errors.js"

export function promisify(fn, timeout = 2000) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
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
        reject(error)
      }
    })
  }
}
