export let defaultErrorHandler = (error, context) => {
  console.error(error, context)
}

export function setErrorHandler(handler) {
  defaultErrorHandler = handler

  return defaultErrorHandler
}

export function giveContext(methodName, selector) {
  const message =
    methodName === "selector"
      ? `The selector: ${selector}`
      : `The method: ${methodName} called on the selector: ${selector}`

  return message
}

export function isFixed(isSingle, selector) {
  return `This proxy is fixed. The target is still ${
    isSingle ? "the" : "all of the"
  } ${
    isSingle ? "element" : "elements"
  } matching ${selector}. You must create a new proxy.`
}
