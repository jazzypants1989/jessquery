export let defaultErrorHandler = (error, context) => {
  console.error(context, "\n", error)
}

export function setErrorHandler(handler) {
  defaultErrorHandler = handler

  return defaultErrorHandler
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
