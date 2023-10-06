# jessquery

`jessquery` is a light wrapper around the browser's native DOM API with less verbosity and more convenience methods. It's just like [jQuery](https://jquery.com/), except with a smaller footprint and a sillier name. It doesn't do quite as much, but most of jQuery's features have been subsumed by the browser itself.

The key thing that is lost when working without jQuery is the ability to easily compose multiple actions in a readable, logical way. So, I made sure that all these methods can be chained together-- just like with jQuery! Each function will wait for the previous one to finish before continuing the chain. This makes it easy to do things like wait for an animation to finish before removing an element from the DOM.

The main difference? jQuery is 80kb before gzip. jessquery is 2kb before gzip-- 800 bytes after gzip. So, you get most of the convenience at a fraction of the cost.

## Usage

```javascript
import { $, $$ } from "jessquery"

// Select a single element
const button = $("#button")

// Select multiple elements
const buttons = $$(".buttons")

// The chains accept promises, so you can do async stuff
async function fetchData() {
  const response = await fetch("https://api.github.com/users/jazzypants1989")
  const data = await response.json()
  return data.name
}

// You don't have to await anything! It just works!
button.on("click", () => {
  $(".display").text("Loading...").text(fetchData()).css("color", "red")
})

// Each chain gets its own queue, and each queue is executed in order. Have fun!
buttons
  .addClass("btn")
  .text(
    "these buttons will animate in 5 seconds. It will fade in and out twice then disappear."
  )
  .wait(5000)
  .animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 }) // Dumb, I know
  .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1000 }) // It's just to show that it works
  .animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 }) // You can do whatever you want here
  .animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1000 }) // I'm not your dad
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

Or, since it's so small, you can just use a CDN like the good, old days. The big problem with this is that you lose the types and the JSDoc annotations. I keep those in the `d.ts` file to keep the file size small.

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
6. Each chain gets its own queue, so you can have multiple chains operating on the same element at the same time.
7. Each chain is executed concurrently, so you can use `await` on the functions to wait for one chain to finish executing if another chain is dependent on it.
8. Synchronous tasks are always executed immediately unless they are preceded by an async task. In that case, they are executed after the async task is finished.

If anything gets hard, just use the `await` on the function call or use the `wait` method in the middle to let the DOM catch up while you re-evaulate your life choices. 😅

## Demo and Key Concepts

Here's a [Stackblitz Playground](https://stackblitz.com/edit/jessquery?file=main.js) if you want to try it out. It works slightly differently from jQuery, but it makes sense once you understand the rules. If you ever used [PrototypeJS](http://prototypejs.org/doc/latest/dom/dollar-dollar/), this should be vaguely familiar to you.

The magic sauce here is that everything is a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), so you can still use the full DOM API if your use case isn't covered by one of the methods. The NodeList that you get from `$$` is automatically turned into an array for you. So, you can map over the DomProxyCollection and operate on each element. Or, if you forget about the `.css` operator and use `.style` instead when using `$`, it will just work.

This might get problematic in large applications as proxies bring a small performance overhead, but I'm probably just being paranoid. I welcome anyone to do some tests! 😅

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

- **val(newVal: string): DomProxy**

  - Changes the value of the element.
  - Example: `$('input').val('Hello, world!')`

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

- **appendTo(parent: DomProxy): DomProxy**

  - Append the element to a single parent element in the DOM. So, the element will be removed from its current parent and added to the end of the new parent. If you want to add it to the beginning, use `prependTo`.

  - Example: `$('button').appendTo($('.container'))`

- **prependTo(parent: DomProxy): DomProxy**

  - Prepend the element to a single parent element in the DOM. So, the element will be removed from its current parent and added to the beginning of the new parent. If you want to add it to the end, use `appendTo`.

  - Example: `$('button').prependTo($('.container'))`

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

- **val(newVal: string): DomProxyCollection**

  - Changes the value of the elements.
  - Example: `$$('.inputs').val('Hello, world!')`

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

- **appendTo(parent: DomProxy): DomProxyCollection**

  - Append the elements to a single parent element in the DOM. So, the elements will be removed from their current parent and added to the end of the new parent. If you want to add them to the beginning, use `prependTo`.

  - Example: `$$('button').appendTo($('.container'))`

- **prependTo(parent: DomProxy): DomProxyCollection**

  - Prepend the elements to a single parent element in the DOM. So, the elements will be removed from their current parent and added to the beginning of the new parent. If you want to add them to the end, use `appendTo`.

  - Example: `$$('button').prependTo($('.container'))`

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

- **find(subSelector: string): DomProxyCollection**

  - Finds descendants matching a sub-selector.
  - Example: `$$('.container').find('.buttons')`

- **closest(ancestorSelector: string): DomProxyCollection**

  - Gets the closest ancestor matching a selector.
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
