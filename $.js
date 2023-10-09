import { defaultErrorHandler, giveContext } from "./errors.js"
import { addMethods } from "./methods.js"

export function $(selector) {
  /** @type {HTMLElement | null} */
  let element =
    typeof selector === "string" ? document.querySelector(selector) : selector

  if (!element) {
    defaultErrorHandler(
      new Error(`Error finding element.`),
      giveContext("selector", selector)
    )
    return null
  }

  const proxy = addMethods("$", selector, element)
  return proxy
}
