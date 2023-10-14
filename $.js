import { defaultErrorHandler, giveContext } from "./errors.js"
import { addMethods } from "./addMethods.js"
import { getDOMElement } from "./utils.js"

export function $(selector, fixed = false) {
  const element = getDOMElement(selector, false, false)

  if (!element[0]) {
    defaultErrorHandler(
      new Error(`Error finding element.`),
      giveContext("selector", selector)
    )
    return null
  }

  const proxy = addMethods("$", selector, element[0], fixed)
  return proxy
}
