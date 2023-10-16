import { defaultErrorHandler } from "./errors.js"

export function promisify(
  fn,
  timeout = 5000,
  meta = { fnName: "anonymous", fnArgs: "unknown" }
) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      let settled = false

      const Resolve = (value) => {
        if (!settled) {
          settled = true
          resolve(value)
        }
      }

      const Reject = (reason) => {
        if (!settled) {
          settled = true
          reject(reason)
        }
      }

      setTimeout(() => {
        if (!settled) {
          settled = true
          resolve()
          defaultErrorHandler(
            new Error(`Timeout: ${timeout}ms exceeded.`),
            meta
          )
        }
      }, timeout)

      fn(Resolve, Reject, ...args)
    })
  }
}
