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
              `Promisify Timeout (second argument): ${timeout}ms exceeded.`
            ),
            meta
          )
        }
      }, timeout)

      fn(guardedResolve, guardedReject, ...args)
    })
  }
}
