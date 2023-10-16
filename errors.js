export let errorHandler = (error, context) => {
  typeof context === "string"
    ? console.error(`${context}\n`, error)
    : console.error(context, error)
}

export function setErrorHandler(handler) {
  errorHandler = handler
}

export function giveContext(methodName, selector) {
  const message =
    methodName === "$"
      ? `$${selector}`
      : methodName === "$$"
      ? `$$${selector}`
      : `Method: ${methodName} called on: ${selector}`

  return message
}
