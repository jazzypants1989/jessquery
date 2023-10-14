import { defaultErrorHandler, giveContext } from "./errors.js"
import { addMethods } from "./addMethods.js"
import { getDOMElement } from "./utils.js"

export function $$(selector, fixed = false) {
  const elements = getDOMElement(selector, false, true)

  if (!elements[0]) {
    defaultErrorHandler(
      new Error(`Error finding elements.`),
      giveContext("selector", selector)
    )
    return null
  }

  const proxy = addMethods("$$", selector, elements, fixed)
  return proxy
}
