import { defaultErrorHandler, giveContext } from "./errors.js"
import { addMethods } from "./addMethods.js"
import { getDOMElement } from "./utils.js"

export function $(string, fixed = false) {
  const element = getDOMElement(string, false, false)

  if (!element[0]) {
    defaultErrorHandler(
      new Error(`Error with element.`),
      giveContext("$", string)
    )
    return null
  }

  const proxy = addMethods("$", string, element, fixed)
  return proxy
}
