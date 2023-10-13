import { defaultErrorHandler, giveContext } from "./errors.js"
import { addMethods } from "./addMethods.js"

export function $(selector, fixed = false) {
  let element =
    typeof selector === "string" ? document.querySelector(selector) : selector

  if (!element) {
    defaultErrorHandler(
      new Error(`Error finding element.`),
      giveContext("selector", selector)
    )
    return null
  }

  const proxy = addMethods("$", selector, element, fixed)
  return proxy
}
