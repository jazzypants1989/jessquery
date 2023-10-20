import { errorHandler } from "./errors.js"

export function promisify(fn, meta) {
  const { timeout = 5000 } = meta
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
          meta.error = reason
          reject(meta)
        }
      }

      setTimeout(() => {
        if (!settled) {
          settled = true
          meta.error = `Timeout: ${timeout}ms exceeded`
          reject(meta)
        }
      }, timeout)

      try {
        fn(Resolve, Reject, ...args)
      } catch (e) {
        errorHandler(e, meta)
      }
    })
  }
}
