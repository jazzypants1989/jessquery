export let defaultErrorHandler = (error, context) => {
  typeof context === "string"
    ? console.error(`${context}\n`, error)
    : console.error(context, error)
}

export function setErrorHandler(handler) {
  defaultErrorHandler = handler
}

export function giveContext(methodName, selector) {
  const message =
    methodName === "$"
      ? `$${selector}`
      : methodName === "$$"
      ? `$$${selector}`
      : `The method: ${methodName} called on: ${selector}`

  return message
}
