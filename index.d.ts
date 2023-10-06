declare module "jessquery" {
  /**
   * An HTML element with some extra methods
   */
  export interface DomElement {
    /** Add an event listener to the element
     * @param ev The event name
     * @param fn The event listener
     * @returns This DomElement
     * @example
     * $('button').on('click', () => console.log('clicked'))
     */
    on: (ev: string, fn: EventListenerOrEventListenerObject) => DomElement
    /** Add a CSS Rule to the element. If the first argument is an object, it will be treated as a map of CSS properties and values. Otherwise, it will be treated as a single CSS property and the second argument will be treated as the value.
     * @param propOrObj The CSS property or object containing CSS properties and values
     * @param value The CSS value
     * @returns This DomElement
     * @example
     * $('button').css('color', 'red')
     * OR
     * $('button').css({ color: 'red', backgroundColor: 'blue' })
     */
    css: (
      propOrObj: string | { [key: string]: string | number },
      value?: string
    ) => DomElement
    addClass: (className: string) => DomElement
    /** Remove a class from the element
     * @param className The class name
     * @returns This DomElement
     * @example
     * $('button').removeClass('btn')
     */
    removeClass: (className: string) => DomElement
    /** Toggle a class on the element
     * @param className The class name
     * @returns This DomElement
     * @example
     * $('button').toggleClass('btn')
     */
    toggleClass: (className: string) => DomElement
    /** Set an attribute on the element
     * @param attr The attribute name
     * @param value The attribute value
     * @returns This DomElement
     * @example
     * $('button').toggleClass('btn')
     */
    setAttribute: (attr: string, value: string) => DomElement
    /** Append an additional element to the element
     * @param htmlString The HTML string to append
     * @returns This DomElement
     * @example
     * $('button').append('<span>Click me!</span>')
     */
    append: (htmlString: string) => DomElement
    /** Append the element to a target
     * @param target The target selector
     * @returns This DomElement
     * @example
     * $('button').appendTo('.container')
     */
    appendTo: (target: string) => DomElement
    /** Remove the element from the DOM
     * @returns This DomElement
     * @example
     * $('button').remove()
     */

    remove: () => DomElement
    /** Change the HTML of the element
     * @param newHtml The new HTML
     * @returns This DomElement
     * @example
     * $('button').html('<span>Click me!</span>')
     */
    html: (newHtml: string) => DomElement
    /** Change the text of the element
     * @param newText The new text
     * @returns This DomElement
     * @example
     * $('button').text('Click me!')
     */
    text: (newText: string) => DomElement
    /** Animate the element using the WAAPI
     * @param keyframes The keyframes to animate
     * @param options The animation options
     * @returns This DomElement
     * @example
     * $('button').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
     */
    animate: (
      keyframes: Keyframe[] | PropertyIndexedKeyframes,
      options: KeyframeAnimationOptions
    ) => DomElement
    /** Find descendants matching a sub-selector
     * @param subSelector The sub-selector
     * @returns This DomElement
     * @example
     * $('.container').find('.buttons')
     */
    find: (subSelector: string) => DomElement
    /** Get the closest ancestor matching a selector
     * @param ancestorSelector The ancestor selector
     * @returns This DomElement
     * @example
     * $('.buttons').closest('.container')
     */
    closest: (ancestorSelector: string) => DomElement
    /** Delegate an event listener to the element
     * @param event The event name
     * @param subSelector The sub-selector
     * @param handler The event handler
     * @returns This DomElement
     * @example
     * $('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))
     */
    delegate: (
      event: string,
      subSelector: string,
      handler: EventListenerOrEventListenerObject
    ) => DomElement
    /** Find the parent of the element
     * @returns This DomElement
     * @example
     * $('.buttons').parent()
     */
    parent: () => DomElement
    /** Find the children of the element
     * @returns This DomElement
     * @example
     * $('.container').children()
     */
    children: () => DomElement
    /** Find the next sibling of the element
     * @returns This DomElement
     * @example
     * $('.buttons').next()
     */
    next: () => DomElement
    /** Find the previous sibling of the element
     * @returns This DomElement
     * @example
     * $('.buttons').prev()
     */
    prev: () => DomElement
    /** Find the siblings of the element
     * @returns This DomElement
     * @example
     * $('.buttons').siblings()
     */
    siblings: () => DomElement
    /** Await a timeout before continuing the chain
     * @param ms The number of milliseconds to wait
     * @returns This DomElement
     * @example
     * $('button').css('color', 'red').wait(1000).css('color', 'blue')
     * // The button will turn red, wait 1 second, then turn blue
     */
    wait: (ms: number) => DomElement
    /** Add a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got a good idea for how to make this scoped to a single element? Open a PR!
     * @param css The CSS to add
     * @returns This DomElement
     * @example
     * $('button').stylesheet('button:hover { color: red; }')
     * // Now all buttons on the page will turn red when hovered
     */
    stylesheet: (css: string) => DomElement
  }

  /**
   * An HTML element collection with some extra methods
   */
  export interface DomElementCollection {
    /** Add an event listener to the elements
     * @param ev The event name
     * @param fn The event listener
     * @returns This DomElementCollection
     * @example
     * $('button').on('click', () => console.log('clicked'))
     */
    on(ev: string, fn: EventListenerOrEventListenerObject): DomElementCollection

    /** Add a class to the elements
     * @param className The class name
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').addClass('btn')
     */
    addClass: (className: string) => DomElementCollection

    /** Remove a class from the elements
     * @param className The class name
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').removeClass('btn')
     */
    removeClass: (className: string) => DomElementCollection

    /** Toggle a class on the elements
     * @param className The class name
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').toggleClass('btn')
     */
    toggleClass: (className: string) => DomElementCollection

    /** Set an attribute on the elements
     * @param attr The attribute name
     * @param value The attribute value
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').setAttribute('disabled', 'true')
     */
    setAttribute: (attr: string, value: string) => DomElementCollection

    /** Append an additional element to the elements
     * @param htmlString The HTML string to append
     * @returns This DomElementCollection
     * @example
     * $$('.container').append('<span>New Element</span>')
     */
    append: (htmlString: string) => DomElementCollection

    /** Remove the elements from the DOM
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').remove()
     */
    remove: () => DomElementCollection

    /** Append the elements to a target
     * @param target The target selector
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').appendTo('.container')
     */
    appendTo: (target: string) => DomElementCollection

    /** Find descendants matching a sub-selector
     * @param subSelector The sub-selector
     * @returns This DomElementCollection
     * @example
     * $$('.container').find('.buttons')
     */
    find: (subSelector: string) => DomElementCollection

    /** Get the closest ancestor matching a selector
     * @param ancestorSelector The ancestor selector
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').closest('.container')
     */
    closest: (ancestorSelector: string) => DomElementCollection

    /** Delegate an event listener to the elements
     * @param event The event name
     * @param subSelector The sub-selector
     * @param handler The event handler
     * @returns This DomElementCollection
     * @example
     * $$('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))
     */
    delegate: (
      event: string,
      subSelector: string,
      handler: EventListenerOrEventListenerObject
    ) => DomElementCollection

    /** Animate the elements using the WAAPI
     * @param keyframes The keyframes to animate
     * @param options The animation options
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
     */
    animate(
      keyframes: Keyframe[] | PropertyIndexedKeyframes,
      options: KeyframeAnimationOptions
    ): DomElementCollection

    /** Adds one or more CSS rule(s) to the elements. If the first argument is an object, it will be treated as a map of CSS properties and values. Otherwise, it will be treated as a single CSS property and the second argument will be treated as the value.
     * @param prop The CSS property
     * @param value The CSS value
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').css('color', 'red')
     * OR
     * $$('.buttons').css({ color: 'red', backgroundColor: 'blue' })
     */

    /** Change the HTML of the elements
     * @param newHtml The new HTML
     * @returns This DomElementCollection
     * @example
     * $$('.container').html('<span>New Content</span>')
     */
    html: (newHtml: string) => DomElementCollection

    /** Change the text of the elements
     * @param newText The new text
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').text('Click me!')
     */
    text: (newText: string) => DomElementCollection
    /** Find the parent of the elements
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').parent()
     */
    parent: () => DomElementCollection
    /** Find the children of the elements
     * @returns This DomElementCollection
     * @example
     * $$('.container').children()
     */
    children: () => DomElementCollection
    /** Find the next sibling of the elements
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').next()
     */
    next: () => DomElementCollection
    /** Find the previous sibling of the elements
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').prev()
     */
    prev: () => DomElementCollection
    /** Find the siblings of the elements
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').siblings()
     */
    siblings: () => DomElementCollection
    /** Add a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got a good idea for how to make this scoped to a single element? Open a PR!
     * @param css The CSS to add
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').addStylesheet('button:hover { color: red; }')
     * // Now all buttons on the page will turn red when hovered
     */
    addStylesheet: (css: string) => DomElementCollection
    /** Await a timeout before continuing the chain
     * @param ms The number of milliseconds to wait
     * @returns This DomElementCollection
     * @example
     * $$('.buttons').css('color', 'red').wait(1000).css('color', 'blue')
     */
    wait: (ms: number) => DomElementCollection
  }

  /** Finds the first element in the DOM that matches a CSS selector and returns it with some extra, useful methods.
   * @param {string} selector - The CSS selector to match
   * @returns {DomElement}
   * @example
   * $('button').on('click', () => console.log('Clicked!'))
   * // The first button on the page will log 'Clicked!' when clicked
   */
  export function $(selector: string): DomElement

  /**
   * Finds all elements in the DOM that match a CSS selector and returns them with some extra, useful methods.
   * @param {string} selector - The CSS selector to match
   * @returns {DomElementCollection}
   * @example
   * $$('.button').on('click', () => console.log('Clicked!'))
   * // Every button on the page will log 'Clicked!' when clicked
   */
  export function $$(selector: string): DomElementCollection
}
