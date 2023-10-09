export let defaultErrorHandler = (error, context) => {
  console.error(error, context)
}

export function setErrorHandler(handler) {
  defaultErrorHandler = handler
}

export function giveContext(methodName, selector) {
  const message =
    methodName === "selector"
      ? `The selector: ${selector}`
      : `The method: ${methodName} called on the selector: ${selector}`

  return message
}
