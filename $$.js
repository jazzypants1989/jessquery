import { defaultErrorHandler, giveContext } from "./errors.js"
import { addMethods } from "./addMethods.js"

export function $$(selector, fixed = false) {
  const elements =
    typeof selector === "string"
      ? Array.from(document.querySelectorAll(selector))
      : selector

  if (!elements.length) {
    defaultErrorHandler(
      new Error(`Error finding elements.`),
      giveContext("selector", selector)
    )
    return null
  }

  const proxy = addMethods("$$", selector, elements, fixed)
  return proxy
}
