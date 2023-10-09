import { defaultErrorHandler, giveContext } from "./errors.js"
import { addMethods } from "./methods.js"

export function $$(selector) {
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

  const proxy = addMethods("$$", selector, elements)
  return proxy
}
