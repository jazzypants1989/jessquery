import { defaultErrorHandler, giveContext } from "./errors.js"
import { addMethods } from "./addMethods.js"
import { getDOMElement } from "./utils.js"

export function $$(string, fixed = false) {
  const elements = getDOMElement(string, false, true)

  if (!elements[0]) {
    defaultErrorHandler(
      new Error(`Error finding elements.`),
      giveContext("$$", string)
    )
    return null
  }

  const proxy = addMethods("$$", string, elements, fixed)
  return proxy
}
