declare module "jessquery" {
  /**
   * An HTML element with some extra methods
   */
  export interface DomProxy {
    /** Add an event listener to the element
     * @param ev The event name
     * @param fn The event listener
     * @returns This DomProxy
     * @example
     * $('button').on('click', () => console.log('clicked'))
     */
    on: (ev: string, fn: EventListenerOrEventListenerObject) => DomProxy

    /** Add an event listener that will only fire once to the element
     * @param ev The event name
     * @param fn The event listener
     * @returns This DomProxy
     * @example
     * $('button').once('click', () => console.log('clicked'))
     * // The event listener will only fire once
     */
    once: (ev: string, fn: EventListenerOrEventListenerObject) => DomProxy

    /** Remove an event listener from the element
     * @param ev The event name
     * @param fn The event listener
     * @returns This DomProxy
     * @example
     * $('button').off('click', clickHandler)
     * // The event listener will no longer fire
     */
    off: (ev: string, fn: EventListenerOrEventListenerObject) => DomProxy

    /** Delegate an event listener to the element
     * @param event The event name
     * @param subSelector The sub-selector
     * @param handler The event handler
     * @returns This DomProxy
     * @example
     * $('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))
     */
    delegate: (
      event: string,
      subSelector: string,
      handler: EventListenerOrEventListenerObject
    ) => DomProxy

    /** Change the HTML of the element with an **UNSANITIZED** string of new HTML. This is useful if you want to add a script tag or something. If you want to sanitize the HTML, use `sanitize` instead.
     * @param newHtml The new HTML
     * @returns This DomProxy
     * @example
     * $('button').html('<span>Click me!</span>')
     */
    html: (newHtml: string) => DomProxy

    /** Sanitizes a string of untusted HTML, then replaces the element with the new, freshly sanitized HTML. This helps protect you from XSS Attacks. It uses the setHTML API under the hood, so you can provide your own sanitizer if you want with a second argument.
     * @param html The HTML to sanitize
     * @param sanitizer A function that takes a string of HTML and returns a sanitized string of HTML. If you don't provide one, the default sanitizer will be used.
     * @returns The sanitized HTML
     * @example
     * const html = '<span>Click me!</span><script>alert("hacked!")</script>'
     * $('button').sanitize(html).on('click', () => console.log('clicked'))
     * // The button will now contain the sanitized HTML, but the alert will be removed.
     * @see
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML
     */
    sanitize: (html: string, sanitizer?: (html: string) => string) => DomProxy

    /** Change the text of the element while retaining the HTML.
     * @param newText The new text
     * @returns This DomProxy
     * @example
     * $('button').text('Click me!')
     */
    text: (newText: string) => DomProxy

    /**
     * Sets the value of a DOM element based on its type. For form elements such as inputs, textareas, and selects, the appropriate property (e.g., `value`, `checked`) will be adjusted. For other elements, the `textContent` property will be set.
     * @param newValue - The value to be set. This can be a string, number, an array for multi-selects, a FileList for file inputs, or a boolean for checkboxes.
     *    - For `input[type="checkbox"]`: A truthy value sets it to checked, otherwise unchecked.
     *    - For `input[type="radio"]`: If the `newValue` matches the input's value, it's checked.
     *    - For `input[type="file"]`: Sets the input's `files` property (expects a FileList or similar).
     *    - For `select[multiple]`: Expects an array of values to select multiple options.
     * @returns This DomProxy.
     * @example
     * $('input[type="text"]').value('New Value')
     * $('input[type="checkbox"]').value(true)
     * $('input[type="radio"]').value('radio1')
     * $('input[type="file"]').value(myFileList)
     * $('select[multiple]').value(['option1', 'option2'])
     */
    val: (
      newValue: string | number | (string | number)[] | FileList
    ) => DomProxy

    /** Add a CSS Rule to the element. If the first argument is an object, it will be treated as a map of CSS properties and values. Otherwise, it will be treated as a single CSS property and the second argument will be treated as the value.
     * @param propOrObj The CSS property or object containing CSS properties and values
     * @param value The CSS value
     * @returns This DomProxy
     * @example
     * $('button').css('color', 'red')
     * OR
     * $('button').css({ color: 'red', backgroundColor: 'blue' })
     */
    css: (
      propOrObj: string | { [key: string]: string | number },
      value?: string
    ) => DomProxy

    /** Add a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got an good idea for how to make this scoped to a single element? Open a PR!
     * @param css The CSS to add
     * @returns This DomProxy
     * @example
     * $('button').stylesheet('button:hover { color: red; }')
     * // Now all buttons on the page will turn red when hovered
     */
    addStylesheet: (css: string) => DomProxy

    /** Add a class to the element
     * @param className The class name
     * @returns This DomProxy
     * @example
     * $('button').addClass('btn')
     */
    addClass: (className: string) => DomProxy

    /** Remove a class from the element
     * @param className The class name
     * @returns This DomProxy
     * @example
     * $('button').removeClass('btn')
     */
    removeClass: (className: string) => DomProxy

    /** Toggle a class on the element
     * @param className The class name
     * @returns This DomProxy
     * @example
     * $('button').toggleClass('btn')
     */
    toggleClass: (className: string) => DomProxy

    /** Set an attribute on the element. If the value is undefined, it will be set to `""`, which is useful for boolean attributes like disabled or hidden.
     * @param attr The attribute name
     * @param value The attribute value (optional)
     * @returns This DomProxy
     * @example
     * $('button').set('disabled')
     * $('button').set('formaction', '/submit')
     */
    set: (attr: string, value?: string) => DomProxy

    /** Remove an attribute from the element
     * @param attr The attribute name
     * @returns This DomProxy
     * @example
     * $('button').unset('disabled')
     */
    unset: (attr: string) => DomProxy

    /** Toggle an attribute on the element
     * @param attr The attribute name
     * @returns This DomProxy
     * @example
     * $('button').toggle('disabled')
     */
    toggle: (attr: string) => DomProxy

    /**
     * Set a data attribute on the element.
     * @param key The dataset key
     * @param value The corresponding value for the dataset key
     * @returns This DomProxy
     * @example
     * $('div').data('info', 'extraDetails')
     * This implies: element.dataset.info = 'extraDetails'
     */
    data: (key: string, value: string) => DomProxy

    /**
     * Attaches children to the element based on the provided options.
     * The children can be:
     * - A string of HTML
     * - A CSS selector
     * - An HTMLElement
     * - A DomProxy
     * - An array of any of the above
     *
     * The position can be:
     * - 'append' (default): Adds the children to the end of the element.
     * - 'prepend': Adds the children to the beginning of the element.
     * - 'before': Adds the children before the element.
     * - 'after': Adds the children after the element.
     *
     * The HTML is sanitized by default, which helps prevent XSS attacks.
     * If you want to disable sanitization, set the `sanitize` option to `false`.
     *
     * @param {...*} children - The children to attach. The last argument can be an options object.
     * @param {Object} [options] - The options object.
     * @param {('append'|'prepend'|'before'|'after')} [options.position='append'] - Where to attach the children.
     * @param {boolean} [options.sanitize=true] - Whether or not to sanitize the HTML.
     * @returns This DomProxy
     *
     * @example
     * $('button').attach('<span>Click me!</span>');
     * $('button').attach($('.container'), { position: 'prepend' });
     * $('button').attach([$('.container'), '<span>Click me!</span>'], { position: 'before' });
     * $('button').attach('<image src="x" onerror="alert(\'hacked!\')">'); // No XSS attack here!
     * $('button').attach('<image src="x" onerror="alert(\'hacked!\')">', { sanitize: false }); // XSS attack here!
     *
     * @see https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
     */
    attach: (...children: ChildInput[]) => DomProxy

    /**
     * Clone of the element to a new parent element in the DOM. By default, it is appended inside the new parent element, but you change change this with the `position` option. The original element remains in its current location. If you want to move the element instead of cloning it, use `moveTo`.
     * @param parentSelector CSS selector for the parent element to which the cloned element will be added.
     * @param options Optional configuration for the function behavior.
     * @param {boolean} [options.all=false] If set to true, the element will be cloned or moved to all elements matching the parentSelector.
     * @param {"before" | "after" | "prepend" | "append"} [options.position="append"] If not selected, the element will be placed inside the parent element after any existing children. If you want it right outside of the parent element, use 'before' or 'after'. If you want it to be the first child, use 'prepend'.
     * @returns This DomProxy
     * @example
     * $('button').cloneTo('.target') // Clones and appends to .target (default behavior)
     * $('button').cloneTo('.target', { position: 'prepend' }) // Clones and prepends to .target as first child
     * $('button').cloneTo('.target', { all: true }) // Clones and appends to all .target elements
     * $('button').cloneTo('.target', { all: true, position: 'before' }) // Clones and adds element just before all .target elements
     * @see https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
     */
    cloneTo: (parentSelector: string, options?: MoveOrCloneOptions) => DomProxy

    /**
     * Move the element to a new parent element in the DOM. By default, it is appended inside the new parent element, but you change change this with the `position` option. The original element is removed from its current location. The `all` option is technically available, but it will simply use the last element in the collection. This is because you can only move an element to one place at a time. If you want to clone the element instead of moving it, use `cloneTo`.
     * @param parentSelector CSS selector for the parent element to which the element will be moved.
     * @param options Optional configuration for the function behavior.
     * @param {"before" | "after" | "prepend" | "append"} [options.position="append"] If not selected, the element will be placed inside the parent element after any existing children. If you want it right outside of the parent element, use 'before' or 'after'. If you want it to be the first child, use 'prepend'.
     * @returns This DomProxy
     * @example
     * $('button').moveTo('.target') // Moves and appends to .target (default behavior)
     * $('button').moveTo('.target', { position: 'prepend' }) // Moves and prepends to .target as first child
     * @see https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
     */
    moveTo: (parentSelector: string, options?: MoveOrCloneOptions) => DomProxy

    /**
     * Replace the element(s) with new element(s). By default, the element is moved to the new location. To clone it instead, set the mode to 'clone'.
     * @param replacements An array of elements that will replace the original elements.
     * @param mode Specify whether the original elements should be moved or cloned to their new location.
     * @returns This DomProxy
     * @example
     * $('div').replaceWith([newElement])
     * $('div').replaceWith([newElement], 'clone')
     */
    replaceWith: (
      replacements: Array<HTMLElement>,
      mode?: "move" | "clone"
    ) => DomProxy

    /** Remove the element from the DOM entirely
     * @returns This DomProxy
     * @example
     * $('button').remove()
     */
    remove: () => DomProxy

    /** Animate the element using the WAAPI
     * @param keyframes The keyframes to animate
     * @param options The animation options
     * @returns This DomProxy
     * @example
     * $('button').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
     */
    animate: (
      keyframes: Keyframe[] | PropertyIndexedKeyframes,
      options: KeyframeAnimationOptions
    ) => DomProxy

    /** Sets a timeout for the given number of milliseconds and waits for it to resolve before continuing the chain
     * @param ms The number of milliseconds to wait
     * @returns This DomProxy
     * @example
     * $('button').css('color', 'red').wait(1000).css('color', 'blue')
     */
    wait: (ms: number) => DomProxy

    /** Executes an asynchronous function and waits for it to resolve before continuing the chain (can be synchronous too)
     * @param fn The async callback. This can receive the element as an argument.
     * @returns This DomProxy
     * @example
     * $('button')
     * .css('color', 'red')
     * .do(async (el) => { // The element is passed as an argument
     *    const response = await fetch('/api')
     *    const data = await response.json()
     *    el.text(data.message) // All the methods are still available
     * })
     * .css('color', 'blue')
     */
    do: (fn: (el: DomProxy) => Promise<void>) => DomProxy

    /** Switch to the parent of the element in the middle of a chain
     * @returns The parent DomProxy
     * @example
     * $('button')
     * .css('color', 'red')
     * .parent()
     * .css('color', 'blue')
     * // the parent of the button will turn blue
     * // the button itself will remain red
     */
    parent: () => DomProxy

    /** Get the closest ancestor matching a selector
     * @param ancestorSelector The ancestor selector
     * @returns This DomProxy
     * @example
     * $('.buttons').closest('.container')
     */
    closest: (ancestorSelector: string) => DomProxy

    /** Switch to the children of the element in the middle of a chain
     * @returns The child DomProxyCollection
     * @example
     * $('.container')
     * .css('color', 'red')
     * .children()
     * .css('color', 'blue')
     * // All the children of the container will turn blue
     * // The container itself will remain red
     */
    children: () => DomProxyCollection

    /** Switch to the siblings of the element in the middle of a chain
     * @returns The sibling DomProxyCollection
     * @example
     * $('button')
     * .css('color', 'red')
     * .siblings()
     * .css('color', 'blue')
     * // All the siblings of the button will turn blue
     * // The button itself will remain red
     */
    siblings: () => DomProxyCollection

    /** Find descendants matching a sub-selector
     * @param subSelector The sub-selector
     * @returns This DomProxy
     * @example
     * $('.container').find('.buttons')
     */
    find: (subSelector: string) => DomProxyCollection
  }

  /**
   * An HTML element collection with some extra methods
   */
  export interface DomProxyCollection {
    /** Add an event listener to the elements
     * @param ev The event name
     * @param fn The event listener
     * @returns This DomProxyCollection
     * @example
     * $('button').on('click', () => console.log('clicked'))
     */
    on(ev: string, fn: EventListenerOrEventListenerObject): DomProxyCollection

    /** Add an event listener that will only fire once to the elements
     * @param ev The event name
     * @param fn The event listener
     * @returns This DomProxyCollection
     * @example
     * $('button').once('click', () => console.log('clicked'))
     * // The event listener will only fire once
     */
    once(ev: string, fn: EventListenerOrEventListenerObject): DomProxyCollection

    /** Remove an event listener from the elements
     * @param ev The event name
     * @param fn The event listener
     * @returns This DomProxyCollection
     * @example
     * $('button').off('click', clickHandler)
     * // The event listener will no longer fire
     */
    off(ev: string, fn: EventListenerOrEventListenerObject): DomProxyCollection

    /** Delegate an event listener to the elements
     * @param event The event name
     * @param subSelector The sub-selector
     * @param handler The event handler
     * @returns This DomProxyCollection
     * @example
     * $('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))
     */
    delegate: (
      event: string,
      subSelector: string,
      handler: EventListenerOrEventListenerObject
    ) => DomProxyCollection

    /** Change the HTML of the element The string will **NOT** s
     * @param newHtml The new HTML
     * @returns This DomProxyCollection
     * @example
     * $('.container').html('<span>New Content</span>')
     */
    html: (newHtml: string) => DomProxyCollection

    /** Change the text of the elements
     * @param newText The new text
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').text('Click me!')
     */
    text: (newText: string) => DomProxyCollection

    /**
     * Sets the value of all DOM elements in the collection based on their type. For form elements such as inputs, textareas, and selects, the appropriate property (e.g., `value`, `checked`) will be adjusted. For other elements, the `textContent` property will be set.
     * @param newValue - The value to be set. This can be a string, number, an array for multi-selects, a FileList for file inputs, or a boolean for checkboxes.
     *   - For `input[type="checkbox"]`: A truthy value sets it to checked, otherwise unchecked.
     *  - For `input[type="radio"]`: If the `newValue` matches the input's value, it's checked.
     * - For `input[type="file"]`: Sets the input's `files` property (expects a FileList or similar).
     * - For `select[multiple]`: Expects an array of values to select multiple options.
     * @returns This DomProxyCollection.
     * @example
     * $('input[type="text"]').value('New Value')
     * $('input[type="checkbox"]').value(true)
     * $('input[type="radio"]').value('radio1')
     * $('input[type="file"]').value(myFileList)
     * $('select[multiple]').value(['option1', 'option2'])
     */
    val: (
      newValue: string | number | (string | number)[] | FileList
    ) => DomProxyCollection

    /** Adds one or more CSS rule(s) to the elements. If the first argument is an object, it will be treated as a map of CSS properties and values. Otherwise, it will be treated as a single CSS property and the second argument will be treated as the value.
     * @param prop The CSS property
     * @param value The CSS value
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').css('color', 'red')
     * OR
     * $$('.buttons').css({ color: 'red', backgroundColor: 'blue' })
     */
    css: (
      propOrObj: string | { [key: string]: string | number },
      value?: string
    ) => DomProxyCollection

    /** Add a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got a good idea for how to make this scoped to a single element? Open a PR!
     * @param css The CSS to add
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').addStylesheet('button:hover { color: red; }')
     * // Now all buttons on the page will turn red when hovered
     */
    addStylesheet: (css: string) => DomProxyCollection

    /** Add a class to the elements
     * @param className The class name
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').addClass('btn')
     */
    addClass: (className: string) => DomProxyCollection

    /** Remove a class from the elements
     * @param className The class name
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').removeClass('btn')
     */
    removeClass: (className: string) => DomProxyCollection

    /** Toggle a class on the elements
     * @param className The class name
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').toggleClass('btn')
     */
    toggleClass: (className: string) => DomProxyCollection

    /** Set an attribute on the elements. If the value is undefined, it will be set to `""`, which is useful for boolean attributes like disabled or hidden.
     * @param attr The attribute name
     * @param value The attribute value
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').set('disabled')
     * $$('.buttons').set('formaction', '/submit')
     */
    set: (attr: string, value: string) => DomProxyCollection

    /** Remove an attribute from the elements
     * @param attr The attribute name
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').unset('disabled')
     */
    unset: (attr: string) => DomProxyCollection

    /** Toggle an attribute on the elements
     * @param attr The attribute name
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').toggle('disabled')
     */
    toggle: (attr: string) => DomProxyCollection

    /** Set a data attribute on the elements.
     * @param key The dataset key
     * @param value The corresponding value for the dataset key
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').data('info', 'extraDetails')
     * This implies: element.dataset.info = 'extraDetails'
     */
    data: (key: string, value: string) => DomProxyCollection

    /**
     * Attaches children to the elements based on the provided options.
     * The children can be:
     * - A string of HTML
     * - A CSS selector
     * - An HTMLElement
     * - A DomProxy
     * - An array of any of the above
     * The position can be:
     * - 'append' (default): Adds the children to the end of the element.
     * - 'prepend': Adds the children to the beginning of the element.
     * - 'before': Adds the children before the element.
     * - 'after': Adds the children after the element.
     * The HTML is sanitized by default, which helps prevent XSS attacks.
     * If you want to disable sanitization, set the `sanitize` option to `false`.
     * @param {...*} children - The children to attach. The last argument can be an options object.
     * @param {Object} [options] - The options object.
     * @param {('append'|'prepend'|'before'|'after')} [options.position='append'] - Where to attach the children.
     * @param {boolean} [options.sanitize=true] - Whether or not to sanitize the HTML.
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').attach('<span>Click me!</span>');
     * $$('.buttons').attach($('.container'), { position: 'prepend' });
     * $$('.buttons').attach([$('.container'), '<span>Click me!</span>'], { position: 'before' });
     * $$('.buttons').attach('<image src="x" onerror="alert(\'hacked!\')">'); // No XSS attack here!
     * $$('.buttons').attach('<image src="x" onerror="alert(\'hacked!\')">', { sanitize: false }); // XSS attack here!
     * @see https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
     */

    /**
     * Move a clone of the elements to a new parent element in the DOM. The original elements remain in their current location. By default, they are appended inside the new parent element, but you change change this with the `position` option. If you want to move the elements instead of cloning them, use `moveTo`.
     * @param parentSelector CSS selector for the parent element to which the cloned elements will be added.
     * @param options Optional configuration for the function behavior.
     * @param {boolean} [options.all=false] If set to true, the elements will be cloned or moved to all elements matching the parentSelector.
     * @param {"before" | "after" | "prepend" | "append"} [options.position="append"] If not selected, the elements will be placed inside the parent element after any existing children. If you want them right outside of the parent element, use 'before' or 'after'. If you want them to be the first child, use 'prepend'.
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').cloneTo('.target')
     * // Clones and appends to .target (default behavior)
     * @example
     * $$('.buttons').cloneTo('.target', { position: 'prepend' })
     * // Clones and prepends to .target as first child
     * @example
     * $$('.buttons').cloneTo('.target', { all: true })
     * // Clones and appends to all .target elements
     * @example
     * $$('.buttons').cloneTo('.target', { all: true, position: 'before' })
     * // Clones and adds elements just before all .target elements
     * @see https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
     */
    cloneTo: (
      parentSelector: string,
      options?: MoveOrCloneOptions
    ) => DomProxyCollection

    /**
     * Move the elements to a new parent element in the DOM. By default, they are appended inside the new parent element, but you change change this with the `position` option. The original elements are removed from their current location. The `all` option is technically available, but it will simply use the last element in the collection. This is because you can only move an element to one place at a time. If you want to clone the elements instead of moving them, use `cloneTo`.
     * @param parentSelector CSS selector for the parent element to which the elements will be moved.
     * @param options Optional configuration for the function behavior.
     * @param {"before" | "after" | "prepend" | "append"} [options.position="append"] If not selected, the elements will be placed inside the parent element after any existing children. If you want them right outside of the parent element, use 'before' or 'after'. If you want them to be the first child, use 'prepend'.
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').moveTo('.target')
     * // Moves and appends to .target (default behavior)
     * @example
     * $$('.buttons').moveTo('.target', { position: 'prepend' })
     * // Moves and prepends to .target as first child
     */
    moveTo: (
      parentSelector: string,
      options?: MoveOrCloneOptions
    ) => DomProxyCollection

    /**
     * Replace the elements with new elements. The elements will be moved to the new location by default. To clone them instead, set the mode to 'clone'.
     * @param replacements An array of elements that will replace the original elements.
     * @param mode Specify whether the original elements should be moved or cloned to their new location.
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').replaceWith([newElement])
     * $$('.buttons').replaceWith([newElement], 'clone')
     */
    replaceWith: (
      replacements: Array<HTMLElement>,
      mode?: "move" | "clone"
    ) => DomProxyCollection

    /** Remove the elements from the DOM
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').remove()
     */
    remove: () => DomProxyCollection

    /** Switch to the parents of the elements in the middle of a chain
     * @returns The parent DomProxyCollection
     * @example
     * $$('.buttons')
     * .css('color', 'red')
     * .parents()
     * .css('color', 'blue')
     * // the parents of the buttons will turn blue
     * // the buttons themselves will remain red
     */
    parents: () => DomProxyCollection

    /** Switch to the children of the elements in the middle of a chain
     * @returns The child DomProxyCollection
     * @example
     * $$('.container')
     * .css('color', 'red')
     * .children()
     * .css('color', 'blue')
     * // All the children of the containers will turn blue
     * // The containers themselves will remain red
     */
    children: () => DomProxyCollection

    /** Switch to the siblings of the elements in the middle of a chain
     * @returns The sibling DomProxyCollection
     * @example
     * $$('.buttons')
     * .css('color', 'red')
     * .siblings()
     * .css('color', 'blue')
     * // All the siblings of the buttons will turn blue
     * // The buttons themselves will remain red
     */
    siblings: () => DomProxyCollection

    /** Get the closest ancestor matching a selector
     * @param ancestorSelector The ancestor selector
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').closest('.container')
     */
    closest: (ancestorSelector: string) => DomProxyCollection

    /** Find descendants matching a sub-selector
     * @param subSelector The sub-selector
     * @returns This DomProxyCollection
     * @example
     * $$('.container').find('.buttons')
     */
    find: (subSelector: string) => DomProxyCollection

    /** Animate the elements using the WAAPI
     * @param keyframes The keyframes to animate
     * @param options The animation options
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
     */
    animate(
      keyframes: Keyframe[] | PropertyIndexedKeyframes,
      options: KeyframeAnimationOptions
    ): DomProxyCollection

    /** Await a timeout before continuing the chain
     * @param ms The number of milliseconds to wait
     * @returns This DomProxyCollection
     * @example
     * $$('.buttons').css('color', 'red').wait(1000).css('color', 'blue')
     */
    wait: (ms: number) => DomProxyCollection
  }

  /** Finds the first element in the DOM that matches a CSS selector and returns it with some extra, useful methods.
   * @param {string} selector - The CSS selector to match
   * @returns {DomProxy}
   * @example
   * $('button').on('click', () => console.log('Clicked!'))
   * // The first button on the page will log 'Clicked!' when clicked
   */
  export function $(selector: string): DomProxy

  /**
   * Finds all elements in the DOM that match a CSS selector and returns them with some extra, useful methods.
   * @param {string} selector - The CSS selector to match
   * @returns {DomProxyCollection}
   * @example
   * $$('.button').on('click', () => console.log('Clicked!'))
   * // Every button on the page will log 'Clicked!' when clicked
   */
  export function $$(selector: string): DomProxyCollection

  /** Sets an error handler that will be called when an error occurs somewhere in JessQuery. The default behavior is to throw the error and log it to the console. You can override this behavior with this method to do something else.
   * @param {function} handler - The error handler
   * @example
   * setErrorHandler((err) => alert(err.message))
   * // Now, you'll get an annoying alert every time an error occurs like a good little developer.
   * // The error will not be thrown or logged to the console.
   */
  export function setErrorHandler(handler: (err: Error) => void): void

  type ChildInput = string | HTMLElement | DomProxy | ChildInput[]

  type MoveOrCloneOptions = {
    mode?: "move" | "clone"
    position?: "before" | "after" | "prepend" | "append"
    all?: boolean
  }
}

interface Element {
  setHTML(input: string, options?: SetHTMLOptions): void
}

interface SanitizerConfig {
  allowElements?: string[]
  blockElements?: string[]
  dropElements?: string[]
  allowAttributes?: AttributeMatchList
  dropAttributes?: AttributeMatchList
  allowCustomElements?: boolean
  allowUnknownMarkup?: boolean
  allowComments?: boolean
}

type AttributeMatchList = Record<string, string[]>

interface Sanitizer {
  sanitize(input: string): string
  getConfiguration(): SanitizerConfig
  getDefaultConfiguration(): SanitizerConfig
}

interface SetHTMLOptions {
  sanitizer?: Sanitizer
}
