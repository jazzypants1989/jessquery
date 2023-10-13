import { defaultErrorHandler } from "./errors.js"

export function promisify(
  fn,
  timeout = 5000,
  meta = { fnName: "anonymous", fnArgs: "unknown" }
) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      let hasSettled = false

      const guardedResolve = (value) => {
        if (!hasSettled) {
          hasSettled = true
          resolve(value)
        }
      }

      const guardedReject = (reason) => {
        if (!hasSettled) {
          hasSettled = true
          reject(reason)
        }
      }

      setTimeout(() => {
        if (!hasSettled) {
          hasSettled = true
          resolve()
          defaultErrorHandler(
            new Error(
              `Promise timed out after ${timeout}ms. You can pass a second argument to promisify to customize the timeout.`
            ),
            meta
          )
        }
      }, timeout)

      fn(guardedResolve, guardedReject, ...args)
    })
  }
}
