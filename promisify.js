import { errorHandler } from "./errors.js"

export function promisify(fn, meta = {}) {
  const { timeout = 5000, interval } = meta

  return (...args) =>
    new Promise((resolve, reject) => {
      let settled = false
      let intervalId

      const cleanUp = () => intervalId && clearInterval(intervalId)

      const Resolve = (value) => {
        if (!settled) {
          settled = true
          cleanUp()
          resolve(value)
        }
      }

      const Reject = (reason) => {
        if (!settled) {
          settled = true
          cleanUp()
          meta.error = reason
          reject(meta)
        }
      }

      const run = () => {
        try {
          fn(Resolve, Reject, ...args)
        } catch (e) {
          cleanUp()
          errorHandler(e, meta)
        }
      }

      interval ? (intervalId = setInterval(run, interval)) : run()

      setTimeout(() => {
        if (!settled) {
          Reject(`Timeout: ${timeout}ms exceeded`)
        }
      }, timeout)
    })
}
