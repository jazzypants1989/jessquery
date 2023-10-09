# jessquery

`jessquery` is a light wrapper around the browser's native DOM API with less verbosity and more convenience methods. It's just like [jQuery](https://jquery.com/), except with a smaller footprint and a sillier name. It doesn't do quite as much, but most of jQuery's features have been subsumed by the browser itself.

The key thing that is lost when working without jQuery is the ability to easily compose multiple actions in a readable, logical way. So, I made sure that all these methods can be chained together-- just like with jQuery! Each function will wait for the previous one to finish before continuing the chain. This makes it easy to do things like wait for an animation to finish before removing an element from the DOM.

The main difference? jQuery is 80kb before gzip and around 30kb after compression. jessquery is 5kb before gzip-- 2.02kb after compression! So, you get most of the convenience at a fraction of the cost.

## Usage

```javascript
import { $, $$, promisify, setErrorHandler } from "../index.js"

// Use $ to select a single element.
const display = $(".display")
const button = $("#button")

// Use $$ to select multiple elements.
const buttons = $$(".buttons")

// These elements are now wrapped in a proxy with extra methods.
// They each have an internal queue that always executes in order.
// So, the chains are not only convenient and readable, but they're also predictable.

// You can even do async stuff!
async function fetchData() {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const response = await fetch("https://api.github.com/users/jazzypants1989")
  const data = await response.json()
  return data.name
}

// promisify is for setTimeout/anything async that doesn't return a promise.
// (You can also just return a promise yourself if you want.)
const onlyWarnIfLoadIsSlow = promisify((resolve) => {
  setTimeout(() => {
    // Each proxy has full access to the DOM API-- useful for conditional logic.
    if (display.textContent === "") {
      resolve("Loading...")
      // reject will automatically throw an error and call the error handler.
    }
  }, 200)
})

// There's a default error handler that catches all errors and promise rejections
// But, you can override it if you want to do something else.
setErrorHandler((err) => {
  sendErrorToAnalytics(err)
})

// Every promise is resolved automatically
// The next function will never run until the previous one is finished.
button.on("click", () => {
  display
    .text(onlyWarnIfLoadIsSlow()) // Only shows text if data doesn't load in 200ms
    .text(fetchData()) // You don't have to await anything. It will just work!
    .css("background-color", "red")
})

// Most things follow the DOM API closely
// But, now you can chain them together, they will always execute in order!
const fadeIn = [{ opacity: 0 }, { opacity: 1 }] // WAAPI keyframes
const fadeOut = [{ opacity: 1 }, { opacity: 0 }] // WAAPI keyframes
const oneSecond = { duration: 1000 } // WAAPI options

buttons
  .addClass("btn")
  .text(
    "These buttons will animate in 2 seconds. They will fade in and out twice then disappear."
  )
  .wait(2000)
  .animate(fadeIn, oneSecond)
  .animate(fadeOut, oneSecond)
  .animate(fadeIn, oneSecond)
  .animate(fadeOut, oneSecond)
  .remove()
```

## Installation

You can install it via NPM, PNPM, Yarn, or Bun just like anything else on NPM.

```bash
npm install jessquery
pnpm install jessquery
yarn add jessquery
bun install jessquery
```

Or, since it's so small, you can just use a CDN like the good, old days. The big problem with this is that you lose the types and the JSDoc annotations. I keep those in the `d.ts` file to keep the file size small, but I recently learned that gzip takes care of that for you. So, I'll probably change that in the future. For now, you can just use the `index.d.ts` file in your project if you want the types without installing the package.

```html
<script src="https://esm.sh/jessquery"></script>
<script src="https://unpkg.com/jessquery"></script>
```

## The Rules

1. Use `$` to operate on a single element
2. Use `$$` for operating on multiple elements at once.
3. All custom methods can be chained together.
4. _ALL_ DOM API's can be used, but they **MUST COME LAST** in the chain. You can always start a new chain if you need to.
5. All chains are begun in the order they are found in the script, but they await any microtasks or promises found before continuing.
6. Synchronous tasks are always executed immediately unless they are preceded by an async task. In that case, they will be added to the queue and executed in order.
7. Each chain gets its own queue but they are all executed concurrently, so you can have multiple chains operating on the same element at the same time.

If anything gets hard, just use the `wait` method to let the DOM catch up while you re-evaluate your life choices. 😅

## Demo and Key Concepts

Here's a [Stackblitz Playground](https://stackblitz.com/edit/jessquery?file=main.js) if you want to try it out. It works slightly differently from jQuery, but it makes sense once you understand the rules. It's a bit more like [PrototypeJS](http://prototypejs.org/doc/latest/dom/dollar-dollar/) mixed with the async flow of something like [RxJS](https://rxjs.dev/guide/overview).

The magic sauce here is that everything is a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), so you can still use the full DOM API if your use case isn't covered by one of the methods. So, if you forget about the `.css` operator and use `.style` instead when using `$`, it will just work. The NodeList that you get from `$$` is automatically turned into an array so you can use array methods on it like `.map` or `.filter`.

This is the benefit of using proxies, but I'm curious if this will scale well as they bring a tiny bit of overhead. This might get problematic in large applications, but I'm probably just being paranoid. I welcome anyone to do some tests! 😅

## Interfaces

### $()

- **$(selector: string): DomProxy**
  - Selects a single element.
  - Example: `$("#button")`

### $$()

- **$$(selector: string): DomProxyCollection**
  - Selects multiple elements.
  - Example: `$$(".buttons")`

### DomProxy

A representation of an HTML element enriched with extra methods for easier manipulation.

#### Methods

- **on(ev: string, fn: EventListenerOrEventListenerObject): DomProxy**

  - Adds an event listener to the element.
  - Example: `$('button').on('click', () => console.log('clicked'))`

- **once(ev: string, fn: EventListenerOrEventListenerObject): DomProxy**

  - Adds an event listener to the element that will only fire once.
  - Example: `$('button').once('click', () => console.log('clicked'))`

- **off(ev: string, fn: EventListenerOrEventListenerObject): DomProxy**

  - Removes an event listener from the element.
  - Example: `$('button').off('click', () => console.log('clicked'))`

- **delegate(event: string, subSelector: string, handler: EventListenerOrEventListenerObject): DomProxy**

  - Delegates an event listener to the element.
  - Example: `$('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))`

- **html(newHtml: string): DomProxy**

  - Change the HTML of the element with an **UNSANITIZED** string of new HTML. This is useful if you want to add a script tag or something. If you want to sanitize the HTML, use `sanitize` instead.
  - Example: `$('button').html('<span>Click me!</span>')`

- **sanitize: (html: string, sanitizer?: (html: string) => string) => DomProxy**

  - Sanitizes a string of untusted HTML, then replaces the element with the new, freshly sanitized HTML. This helps protect you from XSS Attacks. It uses the setHTML API under the hood, so you can provide your own sanitizer if you want with a second argument.
  - Example: `$('button').sanitize('<span>Click me!</span>')`
  - MDN Documentation: [setHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)

- **text(newText: string): DomProxy**

  - Changes the text of the element while retaining the tag.
  - Example: `$('button').text('Click me!')`

- **val(newValue: string | number | (string | number)[] | FileList): DomProxy**

  - Changes the value of the element based on its type. For form elements such as inputs, textareas, and selects, the appropriate property (e.g., `value`, `checked`) will be adjusted. For other elements, the `textContent` property will be set.
  - Example: `$('input[type="text"]').val('New Value')`
  - Example: `$('input[type="checkbox"]').val(true)`
  - Example: `$('input[type="radio"]').val('radio1')`
  - Example: `$('input[type="file"]').val(myFileList)`
  - Example: `$('select[multiple]').val(['option1', 'option2'])`

- **css(prop: string | Record<string, string>, value?: string): DomProxy**

  - Adds one or more CSS Rules to the element. If the first argument is an object, each key-value pair will be added as a CSS Rule. If the first argument is a string, it will be treated as a CSS property and the second argument will be treated as its value.
  - Example: `$('button').css('color', 'red')`
  - Example: `$('button').css({ color: 'red', backgroundColor: 'blue' })`

- **addStyleSheet(cssString: string): DomProxy**

  - Adds a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got an good idea for how to make this scoped to a single element? Open a PR!
  - Example: `$('button').addStyleSheet('button:hover { color: red }')`

- **addClass(className: string): DomProxy**

  - Adds a class to the element.
  - Example: `$('button').addClass('btn')`

- **removeClass(className: string): DomProxy**

  - Removes a class from the element.
  - Example: `$('button').removeClass('btn')`

- **toggleClass(className: string): DomProxy**

  - Toggles a class on the element.
  - Example: `$('button').toggleClass('btn')`

- **set(attr: string, value: string?): DomProxy**

  - Sets an attribute on the element. If the value is undefined, it will be set to `""`, which is useful for boolean attributes like disabled or hidden.
  - Example: `$('button').set('disabled')`

- **unset(attr: string): DomProxy**

  - Removes an attribute from the element.
  - Example: `$('button').unset('disabled')`

- **toggle(attr: string): DomProxy**

  - Toggles an attribute on the element.
  - Example: `$('button').toggle('disabled')`

- **data(key: string, value?: string): DomProxy**

  - Sets a data attribute on the element.
  - Example: `$('button').data('id', '123')`

- **append(htmlString | selector | HTMLElement | DomProxy, sanitize?: boolean): DomProxy**

  - Appends children to the element. The first argument can be:

    - A string of HTML
    - A CSS selector
    - An HTMLElement
    - A DomProxy
    - An array of any of the above

  - If you don't know what append means and you feel dumb, don't worry. I constantly forget. Append means that the children will be added to the end of the element. If you want to add them to the beginning, use `prepend`.

  - The HTML is sanitized by default, so you don't have to worry about XSS attacks. If you want to disable sanitization, you can pass `false` as the second argument.

  - Example: `$('button').append('<span>Click me!</span>')`
  - Example: `$('button').append($('.container'))`
  - Example: `$('button').append([$('.container'), '<span>Click me!</span>'])`
  - Example: `$('button').append('<image src="x" onerror="alert(\'hacked!\')">')` // No XSS attack here!
  - Example: `$('button').append('<image src="x" onerror="alert(\'hacked!\')">', false)` // XSS attack here!

- **prepend(htmlString | selector | HTMLElement | DomProxy, sanitize?: boolean): DomProxy**

  - Prepends children to the element. The first argument can be:

    - A string of HTML
    - A CSS selector
    - An HTMLElement
    - A DomProxy
    - An array of any of the above

  - If don't know what prepend means and you feel dumb, don't worry. I constantly forget. Prepend means that the children will be added to the beginning of the element. If you want to add them to the end, use `append`.

  - The HTML is sanitized by default, so you don't have to worry about XSS attacks. If you want to disable sanitization, you can pass `false` as the second argument.

  - Example: `$('button').prepend('<span>Click me!</span>')`
  - Example: `$('button').prepend($('.container'))`
  - Example: `$('button').prepend([$('.container'), '<span>Click me!</span>'])`
  - Example: `$('button').prepend('<image src="x" onerror="alert(\'hacked!\')">')` // No XSS attack here!
  - Example: `$('button').prepend('<image src="x" onerror="alert(\'hacked!\')">', false)` // XSS attack here!

- **cloneTo(parentSelector: string, options?: { position: string; all: boolean }): DomProxy**

  - Clone of the element to a new parent element in the DOM. The original element remains in its current location. If you want to move the element instead of cloning it, use `moveTo`.
  - @param parentSelector CSS selector for the parent element to which the cloned element will be added.
  - @param options Optional configuration for the function behavior.
  - @param {"before" | "after" | inside} [options.position="inside"] If not selected, the element will be placed inside the parent element. If you want it right outside of the parent element, use 'before' or 'after'.
  - @param {boolean} [options.all=false] If set to true, the element will be cloned or moved to all elements matching the parentSelector.
  - @returns This DomProxy
  - @example
  - $('div').cloneTo('.target') // Clones and places inside first .target element (default behavior)
  - $('div').cloneTo('.target', { position: 'after' }) // Clones and places after first .target element
  - $('div').cloneTo('.target', { all: true }) // Clones and places inside all .target elements
  - $('div').cloneTo('.target', { all: true, position: 'before' }) // Clones and places before all .target elements

    cloneTo: (
    parentSelector: string,
    options?: { position: string; all: boolean }
    ) => DomProxy

- **moveTo(parentSelector: string, options?: { position: string }): DomProxy**

  - Move the element to a new parent element in the DOM. The original element is moved from its current location. If you want to clone the element instead of moving it, use `cloneTo`. The all option can technically be passed, but the element will simply be attached to the last parent in the collection as there is only one element.
  - @param parentSelector CSS selector for the parent element to which the element will be moved.
  - @param options Optional configuration for the function behavior.
  - @param {"before" | "after" | inside} [options.position="inside"] Determine where the element should be placed relative to the new parent's children. 'before' places it at the start; 'after' at the end; 'inside' as the first child.
  - @returns This DomProxy
  - @example
  - $('div').moveTo('.target') // Moves element inside first .target element (default behavior)
  - $('div').moveTo('.target', { position: 'before' }) // Moves element before first .target element
  - $('div').moveTo('.target', { position: 'after' }) // Moves element after first .target element
    \*/
    moveTo: (parentSelector: string, options?: { position: string }) => DomProxy

- **replaceWith(replacements: Array<HTMLElement>, mode?: "move" | "clone"): DomProxy**

  - Replace the element(s) with new element(s). By default, the element is moved to the new location. To clone it instead, set the mode to 'clone'.
  - @param replacements An array of elements that will replace the original elements.
  - @param mode Specify whether the original elements should be moved or cloned to their new location.
  - @returns This DomProxy
  - @example
  - $('div').replaceWith([newElement])
  - $('div').replaceWith([newElement], 'clone')
    \*/
    replaceWith: (
    replacements: Array<HTMLElement>,
    mode?: "move" | "clone"
    ) => DomProxy

- **remove(): DomProxy**

  - Removes the element from the DOM entirely.
  - Example: `$('button').remove()`

- **animate(keyframes: Keyframe[] | PropertyIndexedKeyframes, options: KeyframeAnimationOptions): DomProxy**

  - Animates the element using the WAAPI.
  - Example: `$('button').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })`
  - [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)

- **wait(ms: number): DomProxy**

  - Waits for a specified number of milliseconds before continuing the chain.
  - Example: `$('button').wait(1000)`

- **do(fn: (el: DomProxy) => Promise<void>): DomProxy**

  - Executes an asynchronous function and waits for it to resolve before continuing the chain (can be synchronous too).
  - Example: `$('button').do(async (el) => { // The element is passed as an argument
  const response = await fetch('/api')
  const data = await response.json()
  el.text(data.message) // All the methods are still available
})`

- **parent(): DomProxy**

  - Switch to the parent of the element in the middle of a chain.
  - Example: `$('button').parent().css('color', 'blue')` // the parent of the button will turn blue. The button itself will remain red.

- **siblings(): DomProxyCollection**

  - Switch to the siblings of the element in the middle of a chain.
  - Example: `$('button').siblings().css('color', 'blue')` // All the siblings of the button will turn blue. The button itself will remain red.

- **children(): DomProxyCollection**

  - Switch to the children of the element in the middle of a chain.
  - Example: `$('.container').children().css('color', 'blue')` // the children of the container will turn blue. The container itself will remain red.

- **find(subSelector: string): DomProxyCollection**

  - Finds descendants matching a sub-selector.
  - Example: `$('.container').find('.buttons')`

- **closest(ancestorSelector: string): DomProxy**

  - Gets the closest ancestor matching a selector.
  - Example: `$('.buttons').closest('.container')`

### DomProxyCollection

A collection of DomProxy instances with similar enhanced methods for bulk actions.

#### Methods

- **on(ev: string, fn: EventListenerOrEventListenerObject): DomProxyCollection**

  - Adds an event listener to the elements.
  - Example: `$$('button').on('click', () => console.log('clicked'))`

- **once(ev: string, fn: EventListenerOrEventListenerObject): DomProxyCollection**

  - Adds an event listener to the elements that will only fire once.
  - Example: `$$('button').once('click', () => console.log('clicked'))`

- **off(ev: string, fn: EventListenerOrEventListenerObject): DomProxyCollection**

  - Removes an event listener from the elements.
  - Example: `$$('button').off('click', () => console.log('clicked'))`

- **delegate(event: string, subSelector: string, handler: EventListenerOrEventListenerObject): DomProxyCollection**

  - Delegates an event listener to the elements.
  - Example: `$$('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))`

- **html(newHtml: string): DomProxyCollection**

  - Change the HTML of the elements with an **UNSANITIZED** string of new HTML. This is useful if you want to add a script tag or something. If you want to sanitize the HTML, use `sanitize` instead.
  - Example: `$$('button').html('<span>Click me!</span>')`

- **sanitize: (html: string, sanitizer?: (html: string) => string) => DomProxyCollection**

  - Sanitizes a string of untusted HTML, then replaces the elements with the new, freshly sanitized HTML. This helps protect you from XSS Attacks. It uses the setHTML API under the hood, so you can provide your own sanitizer if you want with a second argument.
  - Example: `$$('button').sanitize('<span>Click me!</span>')`
  - MDN Documentation: [setHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)

- **text(newText: string): DomProxyCollection**

  - Changes the text of the elements while retaining the tag.
  - Example: `$$('.buttons').text('Click me!')`

- **val(newValue: string | number | (string | number)[] | FileList): DomProxyCollection**

  - Changes the value of all elements in the collection based on their type. For form elements such as inputs, textareas, and selects, the appropriate property (e.g., `value`, `checked`) will be adjusted. For other elements, the `textContent` property will be set.
  - Example: `$$('input[type="text"]').val('New Value')`
  - Example: `$$('input[type="checkbox"]').val(true)`
  - Example: `$$('input[type="radio"]').val('radio1')`
  - Example: `$$('input[type="file"]').val(myFileList)`
  - Example: `$$('select[multiple]').val(['option1', 'option2'])`

- **css(prop: string | Record<string, string>, value?: string): DomProxyCollection**

  - Adds one or more CSS Rules to the elements. If the first argument is an object, each key-value pair will be added as a CSS Rule. If the first argument is a string, it will be treated as a CSS property and the second argument will be treated as its value.
  - Example: `$$('button').css('color', 'red')`
  - Example: `$$('button').css({ color: 'red', backgroundColor: 'blue' })`

- **addStyleSheet(cssString: string): DomProxyCollection**

  - Adds a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got an good idea for how to make this scoped to a single element? Open a PR!
  - Example: `$$('button').addStyleSheet('button:hover { color: red }')`

- **addClass(className: string): DomProxyCollection**

  - Adds a class to the elements.
  - Example: `$$('.buttons').addClass('btn')`

- **removeClass(className: string): DomProxyCollection**

  - Removes a class from the elements.
  - Example: `$$('.buttons').removeClass('btn')`

- **toggleClass(className: string): DomProxyCollection**

  - Toggles a class on the elements.
  - Example: `$$('.buttons').toggleClass('btn')`

- **set(attr: string, value: string?): DomProxyCollection**

  - Sets an attribute on the elements. If the value is undefined, it will be set to `""`, which is useful for boolean attributes like disabled or hidden.
  - Example: `$$('button').set('disabled')`

- **unset(attr: string): DomProxyCollection**

  - Removes an attribute from the elements.
  - Example: `$$('button').unset('disabled')`

- **toggle(attr: string): DomProxyCollection**

  - Toggles an attribute on the elements.
  - Example: `$$('button').toggle('disabled')`

- **data(key: string, value?: string): DomProxyCollection**

  - Sets a data attribute on the elements.
  - Example: `$$('button').data('id', '123')`

- **append(htmlString | selector | HTMLElement | DomProxy, sanitize?: boolean): DomProxyCollection**

  - Appends children to the elements. The first argument can be:

    - A string of HTML
    - A CSS selector
    - An HTMLElement
    - A DomProxy
    - An array of any of the above

  - If you don't know what append means and you feel dumb, don't worry. I constantly forget. Append means that the children will be added to the end of the element. If you want to add them to the beginning, use `prepend`.

  - The HTML is sanitized by default, so you don't have to worry about XSS attacks. If you want to disable sanitization, you can pass `false` as the second argument.

  - Example: `$$('button').append('<span>Click me!</span>')`
  - Example: `$$('button').append($('.container'))`
  - Example: `$$('button').append([$('.container'), '<span>Click me!</span>'])`
  - Example: `$$('button').append('<image src="x" onerror="alert(\'hacked!\')">')` // No XSS attack here!
  - Example: `$$('button').append('<image src="x" onerror="alert(\'hacked!\')">', false)` // XSS attack here!

- **prepend(htmlString | selector | HTMLElement | DomProxy, sanitize?: boolean): DomProxyCollection**

  - Prepends children to the elements. The first argument can be:

    - A string of HTML
    - A CSS selector
    - An HTMLElement
    - A DomProxy
    - An array of any of the above

  - If don't know what prepend means and you feel dumb, don't worry. I constantly forget. Prepend means that the children will be added to the beginning of the element. If you want to add them to the end, use `append`.

  - The HTML is sanitized by default, so you don't have to worry about XSS attacks. If you want to disable sanitization, you can pass `false` as the second argument.

  - Example: `$$('button').prepend('<span>Click me!</span>')`
  - Example: `$$('button').prepend($('.container'))`
  - Example: `$$('button').prepend([$('.container'), '<span>Click me!</span>'])`
  - Example: `$$('button').prepend('<image src="x" onerror="alert(\'hacked!\')">')` // No XSS attack here!
  - Example: `$$('button').prepend('<image src="x" onerror="alert(\'hacked!\')">', false)` // XSS attack here!

- **cloneTo(parentSelector: string, options?: { position: string; all: boolean }): DomProxyCollection**

  - Clone of the elements to a new parent element in the DOM. The original elements remain in their current location. If you want to move the elements instead of cloning them, use `moveTo`.
  - Example: `$$('div').cloneTo('.target')` // Clones and places inside first .target element (default behavior)
  - Example: `$$('div').cloneTo('.target', { position: 'after' })` // Clones and places after first .target element
  - Example: `$$('div').cloneTo('.target', { all: true })` // Clones and places inside all .target elements
  - Example: `$$('div').cloneTo('.target', { all: true, position: 'before' })` // Clones and places before all .target elements

- **moveTo(parentSelector: string, options?: { position: string }): DomProxyCollection**

  - Move the elements to a new parent element in the DOM. The original elements are moved from their current location. If you want to clone the elements instead of moving them, use `cloneTo`. The all option can technically be passed, but the elements will simply be attached to the last parent in the collection as there is only one element.
  - Example: `$$('div').moveTo('.target')` // Moves elements inside first .target element (default behavior)
  - Example: `$$('div').moveTo('.target', { position: 'before' })` // Moves elements before first .target element
  - Example: `$$('div').moveTo('.target', { position: 'after' })` // Moves elements after first .target element

- **replaceWith(replacements: Array<HTMLElement>, mode?: "move" | "clone"): DomProxyCollection**

  - Replace the elements with new elements. By default, the elements are moved to the new location. To clone them instead, set the mode to 'clone'.
  - Example: `$$('div').replaceWith([newElement])`
  - Example: `$$('div').replaceWith([newElement], 'clone')`

- **remove(): DomProxyCollection**

  - Removes the elements from the DOM.
  - Example: `$$('.buttons').remove()`

- **animate(keyframes: Keyframe[] | PropertyIndexedKeyframes, options: KeyframeAnimationOptions): DomProxyCollection**

  - Animates the elements using the WAAPI.
  - Example: `$$('.buttons').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })`
  - [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)

- **wait(ms: number): DomProxyCollection**

  - Waits for a specified number of milliseconds before continuing the chain.
  - Example: `$$('button').wait(1000)`

- **do(fn: (el: DomProxy) => Promise<void>): DomProxyCollection**

  - Executes an asynchronous function and waits for it to resolve before continuing the chain (can be synchronous too).
  - Example: `$$('button').do(async (el) => { // The element is passed as an argument
  const response = await fetch('/api')
  const data = await response.json()
  el.text(data.message) // All the methods are still available
})`

- **parent(): DomProxyCollection**

  - Switch to the parents of the elements in the middle of a chain.
  - Example: `$$('button').parent().css('color', 'blue')` // the parents of the buttons will turn blue. The buttons themselves will remain red.

- **siblings(): DomProxyCollection**

  - Switch to the siblings of the elements in the middle of a chain.
  - Example: `$$('button').siblings().css('color', 'blue')` // All the siblings of the buttons will turn blue. The buttons themselves will remain red.

- **children(): DomProxyCollection**

  - Switch to the children of the elements in the middle of a chain.
  - Example: `$$('.container').children().css('color', 'blue')` // the children of the container will turn blue. The container itself will remain red.

- **find(subSelector: string): DomProxyCollection**

  - Finds descendants matching a sub-selector.
  - Example: `$$('.container').find('.buttons')`

- **closest(ancestorSelector: string): DomProxyCollection**

  - Gets the closest ancestors for each element in the collection matching a selector.
  - Example: `$$('.buttons').closest('.container')`

### setErrorHandler(handler: (err: Error) => void): void

Sets an error handler that will be called when an error occurs somewhere in JessQuery. The default behavior is to throw the error and log it to the console. You can override this behavior with this method to do something else.

- **handler: (err: Error) => void**

  - The error handler

- Example:

  ```javascript
  setErrorHandler((err) => alert(err.message))
  // Now, you'll get an annoying alert every time an error occurs like a good little developer
  ```

## Contributing

If you have any ideas for new features or improvements, feel free to open an issue or a PR. I'm always open to suggestions! I started this as a bit of a joke, but I think it turned into something pretty useful. I'm sure there are a lot of things that could be improved, so I welcome any and all feedback.
