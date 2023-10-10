declare module "jessquery" {
  /**
   * A proxy covering a single HTML element that allows you to chain methods sequentially (including asynchronous tasks) and then execute them all at once.
   *
   * Methods:
   * - {@link DomProxy.on} - Add an event listener to the element
   * - {@link DomProxy.once} - Add an event listener that will only fire once to the element
   * - {@link DomProxy.off} - Remove an event listener from the element
   * - {@link DomProxy.delegate} - Delegate an event listener to the element
   * - {@link DomProxy.html} - Change the HTML of the element with an **UNSANITIZED** string of new HTML. This is useful if you want to add a script tag or something. If you want to sanitize the HTML, use {@link DomProxy.sanitize} instead.
   * - {@link DomProxy.sanitize} - Sanitizes a string of untrusted HTML using the setHTML API, and sets the sanitized HTML to the provided element. Offers protection against XSS attacks.
   * - {@link DomProxy.text} - Change the text of the element while retaining the HTML.
   * - {@link DomProxy.val} - Sets the value of a DOM element based on its type. For form elements such as inputs, textareas, and selects, the appropriate property (e.g., `value`, `checked`) will be adjusted. For other elements, the `textContent` property will be set.
   * - {@link DomProxy.css} - Add a CSS Rule to the element. If the first argument is an object, it will be treated as a map of CSS properties and values. Otherwise, it will be treated as a single CSS property and the second argument will be treated as the value.
   * - {@link DomProxy.addStylesheet} - Add a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got a good idea for how to make this scoped to a single element? Open a PR!
   * - {@link DomProxy.addClass} - Add a class to the element
   * - {@link DomProxy.removeClass} - Remove a class from the element
   * - {@link DomProxy.toggleClass} - Toggle a class on the element
   * - {@link DomProxy.set} - Set an attribute on the element. If the value is undefined, it will be set to `""`, which is useful for boolean attributes like disabled or hidden.
   * - {@link DomProxy.unset} - Remove an attribute from the element
   * - {@link DomProxy.toggle} - Toggle an attribute on the element
   * - {@link DomProxy.data} - Set a data attribute on the element.
   * - {@link DomProxy.attach} - Attaches children to the element based on the provided options.
   * - {@link DomProxy.cloneTo} - Clone of the element to a new parent element in the DOM. By default, it is appended inside the new parent element, but you change change this with the `position` option. The original element remains in its current location. If you want to move the element instead of cloning it, use {@link DomProxy.moveTo}.
   * - {@link DomProxy.moveTo} - Move the element to a new parent element in the DOM. By default, it is appended inside the new parent element, but you change change this with the `position` option. The original element is removed from its current location. The `all` option is technically available, but it will simply use the last element in the collection. This is because you can only move an element to one place at a time. If you want to clone the element instead of moving it, use {@link DomProxy.cloneTo}.
   * - {@link DomProxy.become} - Replace the element with a new element. By default, the element is moved to the new location. To clone it instead, set the mode to 'clone'.
   * - {@link DomProxy.purge} - Remove the element from the DOM entirely
   * - {@link DomProxy.transition} - Animate the element using the WAAPI
   * - {@link DomProxy.wait} - Sets a timeout for the given number of milliseconds and waits for it to resolve before continuing the chain
   * - {@link DomProxy.do} - Executes an asynchronous function and waits for it to resolve before continuing the chain (can be synchronous too)
   * - {@link DomProxy.parent} - Switch to the parent of the element in the middle of a chain
   * - {@link DomProxy.ancestor} - Switch to the closest ancestor matching a selector in the middle of a chain
   * - {@link DomProxy.children} - Switch to the children of the element in the middle of a chain
   * - {@link DomProxy.siblings} - Switch to the siblings of the element in the middle of a chain
   * - {@link DomProxy.pick} - Switch to the descendants of the element that match a selector in the middle of a chain
   */
  export type DomProxy<T extends HTMLElement = HTMLElement> = T & {
    /** Add an event listener to the element
     * @param ev The event name
     * @param fn The event listener
     * @returns This {@link DomProxy}
     * @example
     * $('button').on('click', () => console.log('clicked'))
     */
    on: (ev: string, fn: EventListenerOrEventListenerObject) => DomProxy<T>

    /** Add an event listener that will only fire once to the element
     * @param ev The event name
     * @param fn The event listener
     * @returns This {@link DomProxy}
     * @example
     * $('button').once('click', () => console.log('clicked'))
     * // The event listener will only fire once
     */
    once: (ev: string, fn: EventListenerOrEventListenerObject) => DomProxy<T>

    /** Remove an event listener from the element
     * @param ev The event name
     * @param fn The event listener
     * @returns This {@link DomProxy}
     * @example
     * $('button').off('click', clickHandler)
     * // The event listener will no longer fire
     */
    off: (ev: string, fn: EventListenerOrEventListenerObject) => DomProxy<T>

    /** Delegate an event listener to the element
     * @param event The event name
     * @param subSelector The sub-selector
     * @param handler The event handler
     * @returns This {@link DomProxy}
     * @example
     * $('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))
     */
    delegate: (
      event: string,
      subSelector: string,
      handler: EventListenerOrEventListenerObject
    ) => DomProxy<T>

    /** Change the HTML of the element with an **UNSANITIZED** string of new HTML. This is useful if you want to add a script tag or something. If you want to sanitize the HTML, use {@link DomProxy.sanitize} instead.
     * @param newHtml The new HTML
     * @returns This {@link DomProxy}
     * @example
     * $('button').html('<span>Click me!</span>')
     */
    html: (newHtml: string) => DomProxy<T>

    /**
     * Sanitizes a string of untrusted HTML using the setHTML API, and sets the sanitized HTML to the provided element.
     * Offers protection against XSS attacks.
     *
     * @param {string} html - Untrusted HTML string to sanitize and set.
     * @param {Sanitizer} [sanitizer] - An instance of Sanitizer to customize the sanitization. Defaults to a new Sanitizer() with default configuration.
     * @returns {DomProxy} - The provided element with the sanitized content set.
     *
     * @example
     * const maliciousHTML = '<span>Safe Content</span><script>alert("hacked!")</script>';
     * const customSanitizer = new Sanitizer({
     *   allowElements: ['span']
     * });
     * $('button').sanitize(maliciousHTML, customSanitizer);
     * // The button will only contain the 'Safe Content' span;
     * // Any scripts (or other unwanted tags) will be removed.
     * // Only span elements will be allowed.
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML}
     */
    sanitize: (html: string, sanitizer?: Sanitizer) => DomProxy<T>

    /** Change the text of the element while retaining the HTML.
     * @param newText The new text
     * @returns This {@link DomProxy}
     * @example
     * $('button').text('Click me!')
     */
    text: (newText: string) => DomProxy<T>

    /**
     * Sets the value of a DOM element based on its type. For form elements such as inputs, textareas, and selects, the appropriate property (e.g., `value`, `checked`) will be adjusted. For other elements, the `textContent` property will be set.
     * @param newValue - The value to be set. This can be a string, number, an array for multi-selects, a FileList for file inputs, or a boolean for checkboxes.
     *    - For `input[type="checkbox"]`: A truthy value sets it to checked, otherwise unchecked.
     *    - For `input[type="radio"]`: If the `newValue` matches the input's value, it's checked.
     *    - For `input[type="file"]`: Sets the input's `files` property (expects a FileList or similar).
     *    - For `select[multiple]`: Expects an array of values to select multiple options.
     * @returns This {@link DomProxy}.
     * @example
     * $('input[type="text"]').val('New Val')
     * $('input[type="checkbox"]').val(true)
     * $('input[type="radio"]').val('radio1')
     * $('input[type="file"]').val(myFileList)
     * $('select[multiple]').val(['option1', 'option2'])
     */
    val: (
      newValue: string | number | (string | number)[] | FileList
    ) => DomProxy<T>

    /** Add a CSS Rule to the element. If the first argument is an object, it will be treated as a map of CSS properties and values. Otherwise, it will be treated as a single CSS property and the second argument will be treated as the value.
     * @param propOrObj The CSS property or object containing CSS properties and values
     * @param value The CSS value
     * @returns This {@link DomProxy}
     * @example
     * $('button').css('color', 'red')
     * OR
     * $('button').css({ color: 'red', backgroundColor: 'blue' })
     */
    css: (
      propOrObj: string | { [key: string]: string | number },
      value?: string
    ) => DomProxy<T>

    /** Add a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got a good idea for how to make this scoped to a single element? Open a PR!
     * @param css The CSS to add
     * @returns This {@link DomProxy}
     * @example
     * $('button').stylesheet('button:hover { color: red; }')
     * // Now all buttons on the page will turn red when hovered
     */
    addStylesheet: (css: string) => DomProxy<T>

    /** Add a class to the element
     * @param className The class name
     * @returns This {@link DomProxy}
     * @example
     * $('button').addClass('btn')
     */
    addClass: (className: string) => DomProxy<T>

    /** Remove a class from the element
     * @param className The class name
     * @returns This {@link DomProxy}
     * @example
     * $('button').removeClass('btn')
     */
    removeClass: (className: string) => DomProxy<T>

    /** Toggle a class on the element
     * @param className The class name
     * @returns This {@link DomProxy}
     * @example
     * $('button').toggleClass('btn')
     */
    toggleClass: (className: string) => DomProxy<T>

    /** Set an attribute on the element. If the value is undefined, it will be set to `""`, which is useful for boolean attributes like disabled or hidden.
     * @param attr The attribute name
     * @param value The attribute value (optional)
     * @returns This {@link DomProxy}
     * @example
     * $('button').set('disabled')
     * $('button').set('formaction', '/submit')
     */
    set: (attr: string, value?: string) => DomProxy<T>

    /** Remove an attribute from the element
     * @param attr The attribute name
     * @returns This {@link DomProxy}
     * @example
     * $('button').unset('disabled')
     */
    unset: (attr: string) => DomProxy<T>

    /** Toggle an attribute on the element
     * @param attr The attribute name
     * @returns This {@link DomProxy}
     * @example
     * $('button').toggle('disabled')
     */
    toggle: (attr: string) => DomProxy<T>

    /**
     * Set a data attribute on the element.
     * @param key The dataset key
     * @param value The corresponding value for the dataset key
     * @returns This {@link DomProxy}
     * @example
     * $('div').data('info', 'extraDetails')
     * This implies: element.dataset.info = 'extraDetails'
     */
    data: (key: string, value: string) => DomProxy<T>

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
     * @returns This {@link DomProxy}
     *
     * @example
     * $('button').attach('<span>Click me!</span>');
     * $('button').attach($('.container'), { position: 'prepend' });
     * $('button').attach([$('.container'), '<span>Click me!</span>'], { position: 'before' });
     * $('button').attach('<image src="x" onerror="alert(\'hacked!\')">'); // No XSS attack here!
     * $('button').attach('<image src="x" onerror="alert(\'hacked!\')">', { sanitize: false }); // XSS attack here!
     * @see https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
     */
    attach: (...children: ChildInput[]) => DomProxy<T>

    /**
     * Clone of the element to a new parent element in the DOM. By default, it is appended inside the new parent element, but you change change this with the `position` option. The original element remains in its current location. If you want to move the element instead of cloning it, use `moveTo`.
     * @param parentSelector CSS selector for the parent element to which the cloned element will be added.
     * @param options Optional configuration for the function behavior.
     * @param {boolean} [options.all=false] If set to true, the element will be cloned or moved to all elements matching the parentSelector.
     * @param {"before" | "after" | "prepend" | "append"} [options.position="append"] If not selected, the element will be placed inside the parent element after any existing children. If you want it right outside of the parent element, use 'before' or 'after'. If you want it to be the first child, use 'prepend'.
     * @returns This {@link DomProxy}
     * @example
     * $('button').cloneTo('.target') // Clones and appends to .target (default behavior)
     * $('button').cloneTo('.target', { position: 'prepend' }) // Clones and prepends to .target as first child
     * $('button').cloneTo('.target', { all: true }) // Clones and appends to all .target elements
     * $('button').cloneTo('.target', { all: true, position: 'before' }) // Clones and adds element just before all .target elements
     * @see https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
     */
    cloneTo: (
      parentSelector: string,
      options?: MoveOrCloneOptions
    ) => DomProxy<T>

    /**
     * Move the element to a new parent element in the DOM. By default, it is appended inside the new parent element, but you change change this with the `position` option. The original element is removed from its current location. The `all` option is technically available, but it will simply use the last element in the collection. This is because you can only move an element to one place at a time. If you want to clone the element instead of moving it, use `cloneTo`.
     * @param parentSelector CSS selector for the parent element to which the element will be moved.
     * @param options Optional configuration for the function behavior.
     * @param {"before" | "after" | "prepend" | "append"} [options.position="append"] If not selected, the element will be placed inside the parent element after any existing children. If you want it right outside of the parent element, use 'before' or 'after'. If you want it to be the first child, use 'prepend'.
     * @returns This {@link DomProxy}
     * @example
     * $('button').moveTo('.target') // Moves and appends to .target (default behavior)
     * $('button').moveTo('.target', { position: 'prepend' }) // Moves and prepends to .target as first child
     * @see https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
     */
    moveTo: (
      parentSelector: string,
      options?: MoveOrCloneOptions
    ) => DomProxy<T>

    /**
     * Replace the element(s) with new element(s). By default, the element is moved to the new location. To clone it instead, set the mode to 'clone'. Under the hood, this is a light wrapper around `replaceWith` that has the option to use `cloneNode`.
     * @param replacements An array of elements that will replace the original elements.
     * @param mode Specify whether the original elements should be moved or cloned to their new location.
     * @returns This {@link DomProxy}
     * @example
     * $('div').become([newElement])
     * $('div').become([newElement], 'clone')
     */
    become: (
      replacements: Array<HTMLElement>,
      mode?: "move" | "clone"
    ) => DomProxy<T>

    /** Remove the element from the DOM entirely. This is a light wrapper around `remove`.
     * @returns This {@link DomProxy}
     * @example
     * $('button').purge()
     */
    purge: () => DomProxy<T>

    /** Animate the element using the WAAPI
     * @param keyframes The keyframes to animate
     * @param options The animation options
     * @returns This {@link DomProxy}
     * @example
     * $('button').transition([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
     */
    transition: (
      keyframes: Keyframe[] | PropertyIndexedKeyframes,
      options: KeyframeAnimationOptions
    ) => DomProxy<T>

    /** Sets a timeout for the given number of milliseconds and waits for it to resolve before continuing the chain
     * @param ms The number of milliseconds to wait
     * @returns This {@link DomProxy}
     * @example
     * $('button').css('color', 'red').wait(1000).css('color', 'blue')
     */
    wait: (ms: number) => DomProxy<T>

    /** Executes an asynchronous function and waits for it to resolve before continuing the chain (can be synchronous too)
     * @param fn The async callback. This can receive the element as an argument.
     * @returns This {@link DomProxy}
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
    do: (fn: (el: DomProxy<T>) => Promise<void>) => DomProxy<T>

    /** Switch to the parent of the element in the middle of a chain
     * @returns A new {@link DomProxy} from the parent element
     * @example
     * $('button')
     * .css('color', 'red')
     * .parent()
     * .css('color', 'blue')
     * // the parent of the button will turn blue
     * // the button itself will remain red
     */
    parent: () => DomProxy<T>

    /** Switch to the closest ancestor matching a selector in the middle of a chain. Uses the native `closest` method.
     * @param ancestorSelector The ancestor selector
     * @returns A new {@link DomProxy} from the ancestor element
     * @example
     * $('.buttons').ancestor('.container')
     */
    ancestor: (ancestorSelector: string) => DomProxy<T>

    /** Switch to the children of the element in the middle of a chain
     * @returns A new {@link DomProxyCollection} created from the children of the element
     * @example
     * $('.container')
     * .css('color', 'red')
     * .kids()
     * .css('color', 'blue')
     * // All the children of the container will turn blue
     * // The container itself will remain red
     */
    kids: () => DomProxyCollection<T>

    /** Switch to the siblings of the element in the middle of a chain
     * @returns A new {@link DomProxyCollection} created from the siblings of the element
     * @example
     * $('button')
     * .css('color', 'red')
     * .siblings()
     * .css('color', 'blue')
     * // All the siblings of the button will turn blue
     * // The button itself will remain red
     */
    siblings: () => DomProxyCollection<T>

    /** Switch to the descendants of the element that match a selector in the middle of a chain
     * @param subSelector The sub-selector
     * @returns A new {@link DomProxyCollection} created from the descendants matching the sub-selector
     * @example
     * $('.container').pick('.buttons')
     */
    pick: (subSelector: string) => DomProxyCollection<T>
  }

  /**
   * A proxy covering a collection of HTML elements that allows you to chain methods sequentially (including asynchronous tasks) and then execute them all at once.
   *
   * Methods:
   * - {@link DomProxyCollection.on} - Add an event listener to the elements
   * - {@link DomProxyCollection.once} - Add an event listener that will only fire once to the elements
   * - {@link DomProxyCollection.off} - Remove an event listener from the elements
   * - {@link DomProxyCollection.delegate} - Delegate an event listener to the elements
   * - {@link DomProxyCollection.html} - Change the HTML of the elements with an **UNSANITIZED** string of new HTML. This is useful if you want to add a script tag or something. If you want to sanitize the HTML, use `sanitize` instead.
   * - {@link DomProxyCollection.sanitize} - Sanitizes a string of untrusted HTML using the setHTML API, and sets the sanitized HTML to the matched elements. Offers protection against XSS attacks.
   * - {@link DomProxyCollection.text} - Change the text of the elements while retaining the HTML.
   * - {@link DomProxyCollection.val} - Sets the value of all DOM elements in the collection based on their type. For form elements such as inputs, textareas, and selects, the appropriate property (e.g., `value`, `checked`) will be adjusted. For other elements, the `textContent` property will be set.
   * - {@link DomProxyCollection.css} - Add a CSS Rule to the elements. If the first argument is an object, it will be treated as a map of CSS properties and values. Otherwise, it will be treated as a single CSS property and the second argument will be treated as the value.
   * - {@link DomProxyCollection.addStylesheet} - Add a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got a good idea for how to make this scoped to a single element? Open a PR!
   * - {@link DomProxyCollection.addClass} - Add a class to the elements
   * - {@link DomProxyCollection.removeClass} - Remove a class from the elements
   * - {@link DomProxyCollection.toggleClass} - Toggle a class on the elements
   * - {@link DomProxyCollection.set} - Set an attribute on the elements. If the value is undefined, it will be set to `""`, which is useful for boolean attributes like disabled or hidden.
   * - {@link DomProxyCollection.unset} - Remove an attribute from the elements
   * - {@link DomProxyCollection.toggle} - Toggle an attribute on the elements
   * - {@link DomProxyCollection.data} - Set a data attribute on the elements.
   * - {@link DomProxyCollection.attach} - Attaches children to the elements based on the provided options.
   * - {@link DomProxyCollection.cloneTo} - Clones the elements to a new parent element in the DOM. By default, it is appended inside the new parent element, but you change change this with the `position` option. The original elements remain in their current location. If you want to move the elements instead of cloning them, use {@link DomProxyCollection.moveTo}.
   * - {@link DomProxyCollection.moveTo} - Moves the elements to a new parent element in the DOM. By default, it is appended inside the new parent element, but you change change this with the `position` option. The original elements are removed from their current location. The `all` option is technically available, but it will simply use the last element in the collection. This is because you can only move an element to one place at a time. If you want to clone the elements instead of moving them, use {@link DomProxyCollection.cloneTo}.
   * - {@link DomProxyCollection.become} - Replaces the elements with new elements. By default, the elements are moved to the new location. To clone them instead, set the mode to 'clone'.
   * - {@link DomProxyCollection.purge} - Remove the elements from the DOM entirely
   * - {@link DomProxyCollection.transition} - Animate the elements using the WAAPI
   * - {@link DomProxyCollection.wait} - Sets a timeout for the given number of milliseconds and waits for it to resolve before continuing the chain
   * - {@link DomProxyCollection.do} - Executes an asynchronous function and waits for it to resolve before continuing the chain (can be synchronous too)
   * - {@link DomProxyCollection.parent} - Switch to the parent of the elements in the middle of a chain
   * - {@link DomProxyCollection.ancestor} - Switch to the closest ancestor matching a selector in the middle of a chain
   * - {@link DomProxyCollection.kids} - Switch to the children of the elements in the middle of a chain
   * - {@link DomProxyCollection.siblings} - Switch to the siblings of the elements in the middle of a chain
   * - {@link DomProxyCollection.pick} - Switch to the descendants of the elements that match a selector in the middle of a chain
   */
  export interface DomProxyCollection<T extends HTMLElement = HTMLElement>
    extends Array<T> {
    /** Add an event listener to the elements
     * @param ev The event name
     * @param fn The event listener
     * @returns This {@link DomProxyCollection}
     * @example
     * $('button').on('click', () => console.log('clicked'))
     */
    on(
      ev: string,
      fn: EventListenerOrEventListenerObject
    ): DomProxyCollection<T>

    /** Add an event listener that will only fire once to the elements
     * @param ev The event name
     * @param fn The event listener
     * @returns This {@link DomProxyCollection}
     * @example
     * $('button').once('click', () => console.log('clicked'))
     * // The event listener will only fire once
     */
    once(
      ev: string,
      fn: EventListenerOrEventListenerObject
    ): DomProxyCollection<T>

    /** Remove an event listener from the elements
     * @param ev The event name
     * @param fn The event listener
     * @returns This {@link DomProxyCollection}
     * @example
     * $('button').off('click', clickHandler)
     * // The event listener will no longer fire
     */
    off(
      ev: string,
      fn: EventListenerOrEventListenerObject
    ): DomProxyCollection<T>

    /** Delegate an event listener to the elements
     * @param event The event name
     * @param subSelector The sub-selector
     * @param handler The event handler
     * @returns This {@link DomProxyCollection}
     * @example
     * $('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))
     */
    delegate: (
      event: string,
      subSelector: string,
      handler: EventListenerOrEventListenerObject
    ) => DomProxyCollection<T>

    /** Change the HTML of the element The string will **NOT** be sanitized. If you want to sanitize the HTML, use `sanitize` instead.
     * @param newHtml The new HTML
     * @returns This {@link DomProxyCollection}
     * @example
     * $('.container').html('<span>New Content</span>')
     */
    html: (newHtml: string) => DomProxyCollection<T>

    /**
     * Sanitizes a string of untrusted HTML using the setHTML API, and sets the sanitized HTML to the matched element(s).
     * Provides protection against XSS attacks.
     *
     * @param {string} html - Untrusted HTML string to sanitize and set.
     * @param {Sanitizer} [sanitizer] - An instance of Sanitizer to customize the sanitization. Defaults to a new Sanitizer() with default configuration.
     * @returns {DomProxyCollection} - The matched elements with the sanitized content set.
     *
     * @example
     * const maliciousHTML = '<span>Safe Content</span><script>alert("hacked!")</script>';
     * const customSanitizer = new Sanitizer({
     *   allowElements: ['span']
     * });
     * $('.targetElement').sanitize(maliciousHTML, customSanitizer);
     * // The .targetElement will only contain the 'Safe Content' span; the script and other unwanted tags will be removed.
     *
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML}
     */
    sanitize: (html: string, sanitizer?: Sanitizer) => DomProxyCollection<T>

    /** Change the text of the elements
     * @param newText The new text
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').text('Click me!')
     */
    text: (newText: string) => DomProxyCollection<T>

    /**
     * Sets the value of all DOM elements in the collection based on their type. For form elements such as inputs, textareas, and selects, the appropriate property (e.g., `value`, `checked`) will be adjusted. For other elements, the `textContent` property will be set.
     * @param newValue - The value to be set. This can be a string, number, an array for multi-selects, a FileList for file inputs, or a boolean for checkboxes.
     *   - For `input[type="checkbox"]`: A truthy value sets it to checked, otherwise unchecked.
     *  - For `input[type="radio"]`: If the `newValue` matches the input's value, it's checked.
     * - For `input[type="file"]`: Sets the input's `files` property (expects a FileList or similar).
     * - For `select[multiple]`: Expects an array of values to select multiple options.
     * @returns This {@link DomProxyCollection}.
     * @example
     * $('input[type="text"]').value('New Value')
     * $('input[type="checkbox"]').value(true)
     * $('input[type="radio"]').value('radio1')
     * $('input[type="file"]').value(myFileList)
     * $('select[multiple]').value(['option1', 'option2'])
     */
    val: (
      newValue: string | number | (string | number)[] | FileList
    ) => DomProxyCollection<T>

    /** Adds one or more CSS rule(s) to the elements. If the first argument is an object, it will be treated as a map of CSS properties and values. Otherwise, it will be treated as a single CSS property and the second argument will be treated as the value.
     * @param prop The CSS property
     * @param value The CSS value
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').css('color', 'red')
     * OR
     * $$('.buttons').css({ color: 'red', backgroundColor: 'blue' })
     */
    css: (
      propOrObj: string | { [key: string]: string | number },
      value?: string
    ) => DomProxyCollection<T>

    /** Add a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got a good idea for how to make this scoped to a single element? Open a PR!
     * @param css The CSS to add
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').addStylesheet('button:hover { color: red; }')
     * // Now all buttons on the page will turn red when hovered
     */
    addStylesheet: (css: string) => DomProxyCollection<T>

    /** Add a class to the elements
     * @param className The class name
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').addClass('btn')
     */
    addClass: (className: string) => DomProxyCollection<T>

    /** Remove a class from the elements
     * @param className The class name
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').removeClass('btn')
     */
    removeClass: (className: string) => DomProxyCollection<T>

    /** Toggle a class on the elements
     * @param className The class name
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').toggleClass('btn')
     */
    toggleClass: (className: string) => DomProxyCollection<T>

    /** Set an attribute on the elements. If the value is undefined, it will be set to `""`, which is useful for boolean attributes like disabled or hidden.
     * @param attr The attribute name
     * @param value The attribute value
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').set('disabled')
     * $$('.buttons').set('formaction', '/submit')
     */
    set: (attr: string, value: string) => DomProxyCollection<T>

    /** Remove an attribute from the elements
     * @param attr The attribute name
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').unset('disabled')
     */
    unset: (attr: string) => DomProxyCollection<T>

    /** Toggle an attribute on the elements
     * @param attr The attribute name
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').toggle('disabled')
     */
    toggle: (attr: string) => DomProxyCollection<T>

    /** Set a data attribute on the elements.
     * @param key The dataset key
     * @param value The corresponding value for the dataset key
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').data('info', 'extraDetails')
     * This implies: element.dataset.info = 'extraDetails'
     */
    data: (key: string, value: string) => DomProxyCollection<T>

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
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').attach('<span>Click me!</span>');
     * $$('.buttons').attach($('.container'), { position: 'prepend' });
     * $$('.buttons').attach([$('.container'), '<span>Click me!</span>'], { position: 'before' });
     * $$('.buttons').attach('<image src="x" onerror="alert(\'hacked!\')">'); // No XSS attack here!
     * $$('.buttons').attach('<image src="x" onerror="alert(\'hacked!\')">', { sanitize: false }); // XSS attack here!
     * @see https://stackoverflow.com/questions/14846506/append-prepend-after-and-before
     */
    attach: (...children: ChildInput[]) => DomProxyCollection<T>

    /**
     * Move a clone of the elements to a new parent element in the DOM. The original elements remain in their current location. By default, they are appended inside the new parent element, but you change change this with the `position` option. If you want to move the elements instead of cloning them, use {@link DomProxyCollection.moveTo}
     * @param parentSelector CSS selector for the parent element to which the cloned elements will be added.
     * @param options Optional configuration for the function behavior.
     * @param {boolean} [options.all=false] If set to true, the elements will be cloned or moved to all elements matching the parentSelector.
     * @param {"before" | "after" | "prepend" | "append"} [options.position="append"] If not selected, the elements will be placed inside the parent element after any existing children. If you want them right outside of the parent element, use 'before' or 'after'. If you want them to be the first child, use 'prepend'.
     * @returns This {@link DomProxyCollection}
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
    ) => DomProxyCollection<T>

    /**
     * Move the elements to a new parent element in the DOM. By default, they are appended inside the new parent element, but you change change this with the `position` option. The original elements are removed from their current location. The `all` option is technically available, but it will simply use the last element in the collection. This is because you can only move an element to one place at a time. If you want to clone the elements instead of moving them, use {@link DomProxyCollection.cloneTo}
     * @param parentSelector CSS selector for the parent element to which the elements will be moved.
     * @param options Optional configuration for the function behavior.
     * @param {"before" | "after" | "prepend" | "append"} [options.position="append"] If not selected, the elements will be placed inside the parent element after any existing children. If you want them right outside of the parent element, use 'before' or 'after'. If you want them to be the first child, use 'prepend'.
     * @returns This {@link DomProxyCollection}
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
    ) => DomProxyCollection<T>

    /**
     * Replace the elements with different elements from elsewhere in the DOM. The new elements will be moved from their original location by default. To clone them instead, set the mode to 'clone'. Under the hood, this is a light wrapper around `replaceWith` that has the option to use `cloneNode`.
     * @param replacements An array of elements that will replace the original elements.
     * @param mode Specify whether the original elements should be moved or cloned to their new location.
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').become([newElements])
     * $$('.buttons').become([newElements], 'clone')
     */
    become: (
      replacements: Array<HTMLElement>,
      mode?: "move" | "clone"
    ) => DomProxyCollection<T>

    /** Remove the elements from the DOM
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').purge()
     */
    purge: () => DomProxyCollection<T>

    /** Animate the elements using the WAAPI
     * @param keyframes The keyframes to animate
     * @param options The animation options
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').transition([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
     */
    transition(
      keyframes: Keyframe[] | PropertyIndexedKeyframes,
      options: KeyframeAnimationOptions
    ): DomProxyCollection<T>

    /** Await a timeout before continuing the chain
     * @param ms The number of milliseconds to wait
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').css('color', 'red').wait(1000).css('color', 'blue')
     */
    wait: (ms: number) => DomProxyCollection<T>

    /** Execute an asynchronous function and wait for it to resolve before continuing the chain (can be synchronous too)
     * @param fn The async callback. This can receive the element as an argument.
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons')
     * .css('color', 'red')
     * .do(async (el) => { // The element is passed as an argument
     *   const response = await fetch('/api')
     *  const data = await response.json()
     * el.text(data.message) // All the methods are still available
     * })
     * .css('color', 'blue')
     */
    do: (fn: (el: DomProxy) => Promise<void>) => DomProxyCollection<T>

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
    parents: () => DomProxyCollection<T>

    /** Switch to the closest ancestor matching a selector in the middle of a chain. Uses the native `closest` method.
     * @param ancestorSelector The ancestor selector
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.buttons').ancestor('.container')
     */
    ancestor: (ancestorSelector: string) => DomProxyCollection<T>

    /** Switch to the children of the elements in the middle of a chain
     * @returns The child DomProxyCollection
     * @example
     * $$('.container')
     * .css('color', 'red')
     * .kids()
     * .css('color', 'blue')
     * // All the children of the containers will turn blue
     * // The containers themselves will remain red
     */
    kids: () => DomProxyCollection<T>

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
    siblings: () => DomProxyCollection<T>

    /** Switch to the descendants of the elements that match a selector in the middle of a chain
     * @param subSelector The sub-selector
     * @returns This {@link DomProxyCollection}
     * @example
     * $$('.container').pick('.buttons')
     */
    pick: (subSelector: string) => DomProxyCollection<T>
  }

  /** Finds the first element in the DOM that matches a CSS selector and returns it with some extra, useful methods.
   *
   * These methods can be chained together to create a sequence of actions that will be executed in order (including asynchronous tasks).
   *
   * Every method returns a {@link DomProxy} or {@link DomProxyCollection} object, which can be used to continue the chain.
   * @param {string} selector - The CSS selector to match
   * @returns A {@link DomProxy} object representing the first element in the DOM that matches the selector
   * @example
   * $('button')
   *    .on('click', () => console.log('Clicked!'))
   *    .css('color', 'purple')
   *    .wait(1000)
   *    .css('color', 'lightblue')
   *    .text('Click me!')
   */
  export function $<S extends string>(selector: S): DomProxy<ElementForTag<S>>
  export function $<T extends HTMLElement>(selector: string): DomProxy<T>

  /** Finds all elements in the DOM that match a CSS selector and returns them with some extra, useful methods.
   *
   * These methods can be chained together to create a sequence of actions that will be executed in order (including asynchronous tasks).
   *
   * Every method returns a {@link DomProxy} or {@link DomProxyCollection} object, which can be used to continue the chain.
   * @param {string} selector - The CSS selector to match
   * @returns A {@link DomProxyCollection} object representing all elements in the DOM that match the selector
   * @example
   * $$('.buttons')
   *   .on('click', () => console.log('Clicked!'))
   *   .css('color', 'purple')
   *   .wait(1000)
   *   .css('color', 'lightblue')
   *   .text('Click me!')
   */
  export function $$<S extends string>(
    selector: S
  ): DomProxyCollection<ElementForTag<S>>
  export function $$<T extends HTMLElement>(
    selector: string
  ): DomProxyCollection<T>

  /** Sets an error handler that will be called when an error occurs somewhere in JessQuery. The default behavior is to simply log it to the console. You can override this behavior with this method to do something else (or nothing... no judgement here! 😉)
   * @param {function} handler - The error handler
   * @example
   * setErrorHandler((err) => alert(err.message))
   * // Now, you'll get an annoying alert every time an error occurs like a good little developer.
   * // The error will not be thrown or logged to the console.
   */
  export function setErrorHandler(handler: (err: Error) => void): void

  /**
   * Converts any function that uses callbacks into a function that returns a promise, allowing easy integration into DomProxy chains. This is particularly useful for things like setTimeout, setInterval, and any older APIs that use callbacks.
   *
   * This works just like building a normal promise: call the resolve function when the function is successful, and call the reject function when it fails.
   * If the function does not call either resolve or reject within the specified timeout, the promise will automatically reject.
   * If you call the resolve function, the promise will resolve with the value you pass into it.
   * If you call the reject function, the promise will reject with the value you pass into it.
   *
   * Every promise that rejects or error found inside of a promisified function will get routed through the default error handler (which you can set with the {@link setErrorHandler} function).
   *
   * To use this function in the middle of a chain, you can use it to provide values to one of the DomProxy methods like text() or html().
   *
   * OR
   *
   * You can use the {@link DomProxy.do} method to execute the function and use the result on the element or elements represented by the DomProxy or DomProxyCollection.
   *
   * @param {(...args: any[]) => any} fn - The function you wish to promisify. This function must call one of either the resolve or reject functions passed into it.
   * @param {number} [timeout=2000] - Amount of time (in milliseconds) to wait before automatically rejecting the promise due to inaction.
   *
   * @returns {(...args: any[]) => Promise<any>} - Returns a new function that when called, returns a promise.
   *
   * @example
   * const fetchApiData = promisify((resolve, reject) => {
   *   const xhr = new XMLHttpRequest();
   *   xhr.open("GET", "https://jsonplaceholder.typicode.com/todos/1");
   *   xhr.onload = () => resolve(xhr.responseText);
   *   xhr.onerror = () => reject(xhr.statusText);
   *   xhr.send();
   * });
   *
   * setErrorHandler((err) => $("#display").text(err.message));
   *
   * button.on("click", () => {
   *   display
   *     .text("Hold on! I'm about to use XHR")
   *     .wait(500)
   *     .do(async (el) => {
   *       const data = await fetchApiData();
   *       el.text(data);
   *     });
   * });
   *
   * // Alternatively, pass the promisified function directly into another method.
   * button.on("click", async () => {
   *   display
   *     .text("I betcha don't even know what XHR is!")
   *     .wait(1000)
   *     .text(fetchApiData());
   * });
   */
  export function promisify(
    fn: (...args: any[]) => void,
    timeout?: number
  ): (...args: any[]) => Promise<any>

  type ChildInput = string | HTMLElement | DomProxy | ChildInput[]

  type MoveOrCloneOptions = {
    mode?: "move" | "clone"
    position?: "before" | "after" | "prepend" | "append"
    all?: boolean
  }

  type ElementForTag<S extends string> = S extends keyof HTMLElementTagNameMap
    ? HTMLElementTagNameMap[S]
    : HTMLElement
}

interface Element {
  setHTML(input: string, sanitizer?: Sanitizer): void
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
