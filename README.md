# jessquery

`jessquery` is a lightweight wrapper around the DOM API that offers the intuitive elegance of jQuery, but streamlined for the modern web.

Feel like a 🦕 for still using jQuery? Wish that it didn't bloat up your bundle size like a 🐖? Want something 🆕 and ✨?

Rekindle your love for method chaining-- now in a lightweight, type-safe package! `jessquery` helps you seamlessly handle asynchronous tasks, customize error behaviors, and ensure your DOM operations always execute in order. And, the best part? 🏎️💨

| Library   | Size before gzip | Size after gzip |
| --------- | ---------------- | --------------- |
| jQuery    | 88.3kb           | 31.7kb          |
| jessquery | 8.05kb           | 3.43kb          |

![It's only 3.43kb! I swear! This badge proves it.](https://deno.bundlejs.com/badge?q=jessquery@2.3.4)
[![npm version](https://badge.fury.io/js/jessquery.svg)](https://badge.fury.io/js/jessquery)

- [Basic Usage](#basic-usage)
- [Installation](#installation)
- [The Rules](#the-rules)
- [Demo and Key Concepts](#demo-and-key-concepts)
- [TypeScript](#typescript)
- [Advanced Usage](#advanced-usage)
- [Contributing](#contributing)

## Basic Usage

```javascript
// Most things follow the DOM API closely with slightly different names.
// But, now you can chain them together
// They will always execute in order!
const fadeIn = [{ opacity: 0 }, { opacity: 1 }] // WAAPI keyframes
const fadeOut = [{ opacity: 1 }, { opacity: 0 }] // WAAPI keyframes
const animatedText = $$(".animated-text") // $$ ≈ querySelectorAll, use $ for querySelector

// <span hidden class="animated-text"></span>
// <span hidden class="animated-text"></span>
animatedText
  .addClass("special")
  .wait(1000) // Will not appear for one second
  .toggle("hidden")
  .text(
    `<p>
      In two seconds, every element matching the 'animated-text' class
      will fade in and out twice then disappear.
    </p>`
  )
  .wait(2000)
  .transition(fadeIn, 1000)
  .transition(fadeOut, 1000)
  .transition(fadeIn, 1000)
  .transition(fadeOut, 1000)
  .purge() // All `.animated-text` elements will be removed from the DOM
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

## Demo and Key Concepts

`jessquery` works slightly differently from jQuery, but it makes sense once you understand the rules. The concurrent chaining makes things a bit more complex. The key is understanding that each `$()` or `$$()` call is representative of a single queue-- not necessarily the elements that are being manipulated. It's a bit like [PrototypeJS](http://prototypejs.org/doc/latest/dom/dollar-dollar/) mixed with the async flow of something like [RxJS](https://rxjs.dev/guide/overview).

The magic sauce here is that everything is a [proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), so you can still use the full DOM API if your use case isn't covered by one of the methods. So, if you forget about the `.css` operator and use `.style` instead when using `$()`, it will just work. The NodeList that you get from `$$()` is automatically turned into an array so you can use array methods on it like `.map()` or `.filter()`.

This is the benefit of using proxies, but I'm curious if this will scale well as they bring a tiny bit of overhead. This might get problematic in large applications, but I'm probably just being paranoid. I welcome anyone to do some tests! 😅

Here's a [Stackblitz Playground](https://stackblitz.com/edit/jessquery?file=main.js) if you want to try it out. The demo that will load in has an extremely long chain showing the mutability that a standard `DomProxy` exhibits. To see how an error is thrown when that proxy is `fixed` in place, simply add a `true` argument to the `$()` call like this: `const container = $(".container", true)`.

## TypeScript

Everything is fully type-safe, but there's no way for the `$()` and `$$()` functions to infer the type of the element you're selecting unless it's a tag name. Things like `$$('input')` will always be fully inferred even if you map over the individual elements in the collection-- in that case, each element would automatically become an `HTMLInputElement`. However, if you select a class or id, the type will always be `HTMLElement` unless you specify the type yourself like this:

```typescript
const button = $<HTMLButtonElement>(".button")

const coolInputs = $$<HTMLInputElement>(".cool-inputs")
```

## The Rules

I wrote a lot, but the main idea is that everything should be predictable. You probably only need to read the bold parts unless you start doing a lot of crazy DOM manipulation that operates on multiple elements at once while using the same variables for everything. If you're just doing simple stuff, you can probably just ignore the rest. 👌

1. **Use `$()` to build a queue that operates on a single element-- a DomProxy**. However, if you use a method like `pickAll()` or `kids()`, you will switch to a `DomProxyCollection` with multiple elements.
2. **Use `$$()` to build a queue that operates on multiple elements at once-- a DomProxyCollection**. However, if you use a method like `pick()` or `parent()` and there is only one element in the collection, you will switch to a `DomProxy` with a single element.
3. **Every `DomProxy` is mutable unless it was created with a `fixed` argument set to `true`**. If you store it in a variable and you change the element with a method like `next()` or `siblings()`, any event handlers that use that variable for DOM manipulation will now operate on the new element.
4. _ALL_ `jessquery` custom methods can be chained together. Each method will operate on the element(s) held in the proxy at the time the function is called. If you switch context multiple times, it can get confusing. **Try to only switch "element context" once per variable**. If you do not want your proxy to be mutable, you can use the `fixed` argument like this: `const container = $(".container", true)`. This will throw an error if you try to change the element with a method like `next()` or `siblings()`. The "element context" is now `fixed` in place.
5. **_ALL_ `jessquery` custom methods are setters that return the proxy**. If you need to check the value of something, just use the DOM API directly (`textContent` instead of `text()`, for example). This also helps to differentiate between set and get operations.
6. **_ALL_ DOM API's can be used, but they MUST COME LAST within a single chain**. You can always start a new chain if you need to. You can even use the same variable-- you just need to know that function won't be executed until the previous chain finishes or hits a microtask.
7. All chains are begun in the order they are found in the script, but they await any microtasks or promises found before continuing. If you need to do things concurrently, **just make a new variable so you get a new queue**.
8. **Each variable tied to a single `$()` or `$$()` call gets its own queue which runs every function sequentially**. However, remember that the chains are executed concurrently if any promises are found, so you can have multiple chains operating on the same element at the same time if you're not careful.
9. **Synchronous tasks are always executed as soon as possible, but not until their turn is reached in the queue.** If they are preceded by an async task, they will be added to the queue and executed in order. If there are any promises in their arguments, those will be awaited before the function is called.
10. Event handlers are always given special priority and moved to the front of the queue. This way, even if you have a full minute of animations lined up, the user can still interact with the element and expect the event to fire immediately. However, **each method is blocking, so if you use the same variable for event handlers, you will block the event handler from firing until that function is finished**. This is particularly problematic if that chain has any `wait()` calls or long animations.

Generally, just try to keep each discrete chain of DOM operations for a single element together, and try to use a new variable for any event handlers. I mean, the whole point of this library is that `$()` and `$$()` are really easy to type, and you only need to worry about it when things aren't behaving the way you expect. If anything gets too hard, you can also use the `defer()` and `wait()` methods to let the DOM catch up while you re-evaluate your life choices. 😅

## Advanced Usage

```javascript
import { $, $$, promisify, setErrorHandler } from "jessquery"

// Use $ to select a single element.
const display = $(".display")

// Use $$ to select multiple elements.
const dynamicSpans = $$(".dynamic-spans")

// You can create elements on the fly
$(`<h1>I'm #1</h1>`).moveTo(".container", { position: "prepend" }) // append is the default

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
      // Promisify is great for when you forget to cover all conditions like this troubling example,
      // The next function will try to wait (five seconds by default).
      // If it still hasn't resolved, the chain will keep moving (while passing an error to the error handler).
    }
  }, 200)
})

// The default error handler catches all errors and promise rejections
// It simply logs using console.error, but you can use setErrorHandler to override this.
setErrorHandler((err) => {
  sendErrorToAnalytics(err)
})

// Every promise is resolved automatically
// The next function never runs until the previous one is finished.
button.on("click", () => {
  display
    .text(onlyWarnIfLoadIsSlow()) // NEVER shows text UNLESS data doesn't load in 200ms
    .text(fetchData()) // You don't have to await anything. It will just work!
    .css("background-color", "red") // This won't happen until the fetch is done.
})

// There's also internal `fromJSON` and `fromHTML` methods which automatically handle fetching and parsing.
// I just wanted to show off the `promisify` method and how you don't have to await anything.
// These functions expand fetch to include a fallback message, an error message, and a callback.
const fetchOptions = {
  error: "Failed to load data",
  fallback: "Loading...",
  onSuccess: () => dynamicSpans.attach("<h6>Data Loaded!</h6>"),
  // This will reflect the DOM AFTER the fetch is done.
  onError: (err) => sendFetchErrorToAnalytics(err),
  headers: {
    "Cool-Header": "Cool-Value",
    // the full range of fetch options (requestInit) are still supported.
  },
}

// You can nest things as deep as you want (if you like making things confusing).
dynamicSpans.fromJSON(
  "https://jessepence.com/api/cool-json",
  (el, json) => {
    el.html(
      `<h2>${json.name}</h2>
       <p>${json.bio}</p>
    `
    )
      .wait(5000)
      .fromHTML("/api/cool-html", fetchOptions)
      .attach(
        "<h2>Enough about me, watch this! I'm gonna replace this cool HTML with a stream in 5 seconds.</h2>"
      )
      .wait(5000)
      .fromStream("/api/cool-stream", fetchOptions)
  },
  fetchOptions
)

$("#bigForm").send()
// This will automatically serialize the form
// It will send it to the action attribute if it exists (The page's URL if not)
// You can also customize each aspect of the request if you want.
// EVERYTHING is optional. You can just pass a URL if you want.

$("#otherSubmitButton").on("click", (event) => {
  $$("#bigForm").send({
    event, // to prevent default submission
    url: "/api/cool-endpoint", // Otherwise, the formaction attribute or any parent form's action would be used if it exists.
    body: { cool: "data" }, // Otherwise, the form's data would be used. If no form, the textContent would be used.
    method: "PUT", // POST is the default
  })
})
// (this will send multiple fetches though. No caching or batching... yet)
```

## Interfaces

### Table of Contents

- [$()](#$)
- [$$()](#$$)
- [DomProxy](#DomProxy)
  - [DomProxy Methods](#DomProxy-Methods)
    - [DomProxy.on](#DomProxyon)
    - [DomProxy.once](#DomProxyonce)
    - [DomProxy.off](#DomProxyoff)
    - [DomProxy.delegate](#DomProxydelegate)
    - [DomProxy.html](#DomProxyhtml)
    - [DomProxy.sanitize](#DomProxysanitize)
    - [DomProxy.text](#DomProxytext)
    - [DomProxy.val](#DomProxyval)
    - [DomProxy.css](#DomProxycss)
    - [DomProxy.addStyleSheet](#DomProxyaddStyleSheet)
    - [DomProxy.addClass](#DomProxyaddClass)
    - [DomProxy.removeClass](#DomProxyremoveClass)
    - [DomProxy.toggleClass](#DomProxytoggleClass)
    - [DomProxy.set](#DomProxyset)
    - [DomProxy.unset](#DomProxyunset)
    - [DomProxy.toggle](#DomProxytoggle)
    - [DomProxy.data](#DomProxydata)
    - [DomProxy.attach](#DomProxyattach)
    - [DomProxy.cloneTo](#DomProxycloneTo)
    - [DomProxy.moveTo](#DomProxymoveTo)
    - [DomProxy.become](#DomProxybecome)
    - [DomProxy.purge](#DomProxypurge)
    - [DomProxy.fromJSON](#DomProxyfromJSON)
    - [DomProxy.fromHTML](#DomProxyfromHTML)
    - [DomProxy.do](#DomProxydo)
    - [DomProxy.defer](#DomProxydefer)
    - [DomProxy.transition](#DomProxytransition)
    - [DomProxy.wait](#DomProxywait)
    - [DomProxy.next](#DomProxynext)
    - [DomProxy.prev](#DomProxyprev)
    - [DomProxy.first](#DomProxyfirst)
    - [DomProxy.last](#DomProxylast)
    - [DomProxy.parent](#DomProxyparent)
    - [DomProxy.ancestor](#DomProxyancestor)
    - [DomProxy.pick](#DomProxypick)
    - [DomProxy.pickAll](#DomProxypickAll)
    - [DomProxy.siblings](#DomProxysiblings)
    - [DomProxy.kids](#DomProxykids)
- [DomProxyCollection](#DomProxyCollection)
  - [DomProxyCollection Methods](#DomProxyCollection-Methods)
    - [DomProxyCollection.on](#DomProxyCollectionon)
    - [DomProxyCollection.once](#DomProxyCollectiononce)
    - [DomProxyCollection.off](#DomProxyCollectionoff)
    - [DomProxyCollection.delegate](#DomProxyCollectiondelegate)
    - [DomProxyCollection.html](#DomProxyCollectionhtml)
    - [DomProxyCollection.sanitize](#DomProxyCollectionsanitize)
    - [DomProxyCollection.text](#DomProxyCollectiontext)
    - [DomProxyCollection.val](#DomProxyCollectionval)
    - [DomProxyCollection.css](#DomProxyCollectioncss)
    - [DomProxyCollection.addStyleSheet](#DomProxyCollectionaddStyleSheet)
    - [DomProxyCollection.addClass](#DomProxyCollectionaddClass)
    - [DomProxyCollection.removeClass](#DomProxyCollectionremoveClass)
    - [DomProxyCollection.toggleClass](#DomProxyCollectiontoggleClass)
    - [DomProxyCollection.set](#DomProxyCollectionset)
    - [DomProxyCollection.unset](#DomProxyCollectionunset)
    - [DomProxyCollection.toggle](#DomProxyCollectiontoggle)
    - [DomProxyCollection.data](#DomProxyCollectiondata)
    - [DomProxyCollection.attach](#DomProxyCollectionattach)
    - [DomProxyCollection.cloneTo](#DomProxyCollectioncloneTo)
    - [DomProxyCollection.moveTo](#DomProxyCollectionmoveTo)
    - [DomProxyCollection.become](#DomProxyCollectionbecome)
    - [DomProxyCollection.purge](#DomProxyCollectionpurge)
    - [DomProxyCollection.fromJSON](#DomProxyCollectionfromJSON)
    - [DomProxyCollection.fromHTML](#DomProxyCollectionfromHTML)
    - [DomProxyCollection.do](#DomProxyCollectiondo)
    - [DomProxyCollection.defer](#DomProxyCollectiondefer)
    - [DomProxyCollection.transition](#DomProxyCollectiontransition)
    - [DomProxyCollection.wait](#DomProxyCollectionwait)
    - [DomProxyCollection.next](#DomProxyCollectionnext)
    - [DomProxyCollection.prev](#DomProxyCollectionprev)
    - [DomProxyCollection.first](#DomProxyCollectionfirst)
    - [DomProxyCollection.last](#DomProxyCollectionlast)
    - [DomProxyCollection.parent](#DomProxyCollectionparent)
    - [DomProxyCollection.ancestor](#DomProxyCollectionancestor)
    - [DomProxyCollection.pick](#DomProxyCollectionpick)
    - [DomProxyCollection.pickAll](#DomProxyCollectionpickAll)
    - [DomProxyCollection.siblings](#DomProxyCollectionsiblings)
    - [DomProxyCollection.kids](#DomProxyCollectionkids)
- [setErrorHandler](#setErrorHandler)
- [promisify](#promisify)

### $()

- **$(selector: string): DomProxy**

  - Finds the first element in the DOM that matches a CSS selector and returns it with some extra, useful methods.
  - These methods can be chained together to create a sequence of actions that will be executed in order (including asynchronous tasks).
  - Every method returns a DomProxy or DomProxyCollection object, which can be used to continue the chain.
  - All DOM API's can still be used, but they _MUST COME LAST_ within a single chain.

  - Example:

```javascript
$("#button")
  .on("click", () => console.log("Clicked!"))
  .css("color", "purple")
  .wait(1000)
  .css("color", "lightblue")
  .text("Click me!").style.backgroundColor = "lightGreen" // This will work, but only because it's the last thing in the chain.
// It's also important to note that the style method call is not queued, so it will happen before everything else.
```

### $$()

- **$$(selector: string): DomProxyCollection**

  - Finds all elements in the DOM that match a CSS selector and returns them with some extra, useful methods
  - These methods can be chained together to create a sequence of actions that will be executed in order (including asynchronous tasks).
  - Every method returns a DomProxy or DomProxyCollection object, which can be used to continue the chain.
  - All DOM API's can still be used, but they _MUST COME LAST_ within a single chain.

  - Example:

```javascript
$$(".buttons")
  .on("click", () => console.log("Clicked!"))
  .css("color", "purple")
  .wait(1000)
  .css("color", "lightblue")
  .text("Click me!").style.backgroundColor = "lightGreen" // This will work, but only because it's the last thing in the chain.
// It's also important to note that the style method call is not queued, so it will happen before everything else.
```

### DomProxy

A proxy covering a single HTML element that allows you to chain methods sequentially (including asynchronous tasks) and then execute them one after the other. It includes **38** of these custom methods, but you can still use the full DOM API if you need to.

#### DomProxy Methods

##### DomProxy.on

**on(ev: string, fn: EventListenerOrEventListenerObject): DomProxy**

- Adds an event listener to the element.
- Example: `$('button').on('click', () => console.log('clicked'))`

##### DomProxy.once

**once(ev: string, fn: EventListenerOrEventListenerObject): DomProxy**

- Adds an event listener to the element that will only fire once.
- Example: `$('button').once('click', () => console.log('clicked'))`

##### DomProxy.off

- **off(ev: string, fn: EventListenerOrEventListenerObject): DomProxy**

  - Removes an event listener from the element.
  - Example: `$('button').off('click', () => console.log('clicked'))`

##### DomProxy.delegate

- **delegate(event: string, subSelector: string, handler: EventListenerOrEventListenerObject): DomProxy**

  - Delegates an event listener to the element.
  - Example: `$('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))`

##### DomProxy.html

- **html(newHtml: string): DomProxy**

  - Change the HTML of the element with an **UNSANITIZED** string of new HTML. This is useful if you want to add a script tag or something. If you want to sanitize the HTML, use `sanitize` instead.
  - Example: `$('button').html('<span>Click me!</span>')`

##### DomProxy.sanitize

- **sanitize: (html: string, sanitizer?: (html: string) => string) => DomProxy**

  - Sanitizes a string of untusted HTML, then replaces the element with the new, freshly sanitized HTML. This helps protect you from XSS Attacks. It uses the setHTML API under the hood, so you can provide your own sanitizer if you want with a second argument.
  - Example:

  ```javascript
  const maliciousHTML =
    '<span>Safe Content</span><script>alert("hacked!")</script>'
  const customSanitizer = new Sanitizer({
    allowElements: ["span"],
  })
  $("button").sanitize(maliciousHTML, customSanitizer)
  // The button will only contain the 'Safe Content' span;
  // Any scripts (or other unwanted tags) will be removed.
  // Only span elements will be allowed.
  ```

  - MDN Documentation: [setHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)

##### DomProxy.text

- **text(newText: string): DomProxy**

  - Changes the text of the element while retaining the tag.
  - Example: `$('button').text('Click me!')`

##### DomProxy.val

- **val(newValue: string | number | (string | number)[] | FileList): DomProxy**

  - Changes the value of the element based on its type. For form elements such as inputs, textareas, and selects, the appropriate property (e.g., `value`, `checked`) will be adjusted. For other elements, the `textContent` property will be set.
  - Example: `$('input[type="text"]').val('New Value')`
  - Example: `$('input[type="checkbox"]').val(true)`
  - Example: `$('input[type="radio"]').val('radio1')`
  - Example: `$('input[type="file"]').val(myFileList)`
  - Example: `$('select[multiple]').val(['option1', 'option2'])`

##### DomProxy.css

- **css(prop: string | Record<string, string>, value?: string): DomProxy**

  - Adds one or more CSS Rules to the element. If the first argument is an object, each key-value pair will be added as a CSS Rule. If the first argument is a string, it will be treated as a CSS property and the second argument will be treated as its value.
  - Example: `$('button').css('color', 'red')`
  - Example: `$('button').css({ color: 'red', backgroundColor: 'blue' })`

##### DomProxy.addStyleSheet

- **addStyleSheet(cssString: string): DomProxy**

  - Adds a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got an good idea for how to make this scoped to a single element? Open a PR!
  - Example: `$('button').addStyleSheet('button:hover { color: red }')`

##### DomProxy.addClass

- **addClass(className: string): DomProxy**

  - Adds a class to the element.
  - Example: `$('button').addClass('btn')`

##### DomProxy.removeClass

- **removeClass(className: string): DomProxy**

  - Removes a class from the element.
  - Example: `$('button').removeClass('btn')`

##### DomProxy.toggleClass

- **toggleClass(className: string): DomProxy**

  - Toggles a class on the element.
  - Example: `$('button').toggleClass('btn')`

##### DomProxy.set

- **set(attr: string, value: string?): DomProxy**

  - Sets an attribute on the element. If the value is undefined, it will be set to `""`, which is useful for boolean attributes like disabled or hidden.
  - Example: `$('button').set('disabled')`

##### DomProxy.unset

- **unset(attr: string): DomProxy**

  - Removes an attribute from the element.
  - Example: `$('button').unset('disabled')`

##### DomProxy.toggle

- **toggle(attr: string): DomProxy**

  - Toggles an attribute on the element.
  - Example: `$('button').toggle('disabled')`

##### DomProxy.data

- **data(key: string, value?: string): DomProxy**

  - Sets a data attribute on the element.
  - Example: `$('button').data('id', '123')`

##### DomProxy.attach

- **attach(...children: (HTMLElement | DomProxy)[]): DomProxy**

  - Attaches children to the element based on the provided options.
  - The children can be:
    - A string of HTML
    - A CSS selector
    - An HTMLElement
    - A DomProxy
    - An array of any of the above
  - The position can be:
    - 'append' (default): Adds the children to the end of the element.
    - 'prepend': Adds the children to the beginning of the element.
    - 'before': Adds the children before the element.
    - 'after': Adds the children after the element.
  - The HTML is sanitized by default, which helps prevent XSS attacks.
  - If you want to disable sanitization, set the `sanitize` option to `false`.
  - Example: `$('button').attach('<span>Click me!</span>')`
  - Example: `$('button').attach($('.container'), { position: 'prepend' })`
  - Example: `$('button').attach([$('.container'), '<span>Click me!</span>'], { position: 'before' })`
  - Example: `$('button').attach('<image src="x" onerror="alert(\'hacked!\')">')` // No XSS attack here!
  - Example: `$('button').attach('<image src="x" onerror="alert(\'hacked!\')">', { sanitize: false })` // XSS attack here!
  - [Handy StackOverflow Answer for Position Option](https://stackoverflow.com/questions/14846506/append-prepend-after-and-before)

##### DomProxy.cloneTo

- **cloneTo(parentSelector: string, options?: { position: string; all: boolean }): DomProxy**

  - Clone of the element to a new parent element in the DOM. The original element remains in its current location. If you want to move the element instead of cloning it, use `moveTo`.

  - The position can be:

    - 'append' (default): Adds the children to the end of the parent.
    - 'prepend': Adds the children to the beginning of the parent.
    - 'before': Adds the children before the parent.
    - 'after': Adds the children after the parent.

  - The all option will clone the element into each new parent in the collection. If the all option is not passed, only the first parent in the collection will be used.

  - Example: `$('div').cloneTo('.target')` // Clones and places inside first .target element (default behavior)
  - Example: `$('div').cloneTo('.target', { position: 'after' })` // Clones and places after first .target element
  - Example: `$('div').cloneTo('.target', { all: true })` // Clones and places inside all .target elements
  - Example: `$('div').cloneTo('.target', { all: true, position: 'before' })` // Clones and places before all .target elements
  - [Handy StackOverflow Answer for Position Option](https://stackoverflow.com/questions/14846506/append-prepend-after-and-before)

##### DomProxy.moveTo

- **moveTo(parentSelector: string, options?: { position: string }): DomProxy**

  - Move the element to a new parent element in the DOM. The original element is moved from its current location. If you want to clone the element instead of moving it, use `cloneTo`.

  - The position can be:

    - 'append' (default): Adds the children to the end of the parent.
    - 'prepend': Adds the children to the beginning of the parent.
    - 'before': Adds the children before the parent.
    - 'after': Adds the children after the parent.

  - The all option can technically be used, but it will only move the element to the last parent in the collection. This is because the element can only exist in one place at a time. Use `cloneTo` if you want to move the element to multiple parents.

  - Example: `$('div').moveTo('.target')` // Moves inside first .target element (default behavior)
  - Example: `$('div').moveTo('.target', { position: 'after' })` // Moves after first .target element
  - [Handy StackOverflow Answer for Position Option](https://stackoverflow.com/questions/14846506/append-prepend-after-and-before)

##### DomProxy.become

- **become(replacement: HTMLElement | Array<HTMLElement> | DomProxy, options?: { mode?: "move" | "clone"; match?: "cycle" | "remove" }): DomProxy**

  - The become method is used to replace a single element with a different element from elsewhere in the DOM.
  - Under the hood, it utilizes the native `replaceWith` method but adds extra layers of functionality.
  - The replacement can be a simple HTMLElement, an array of HTMLElements, or another DomProxy instance.
  - Mode:
    - _clone_ (default) - This makes a copy of the replacement element to use for the DomProxy. This clone includes the element, its attributes, and all its child nodes, but does not include event listeners. The original element is left untouched.
    - _move_ - This moves the replacement element to the original element's position. The original element is removed from the DOM. This is the same as calling `replaceWith` directly.
  - Example: `$('div').become(newElement, {mode: "move"})`
  - Expectation: Replaces div with newElement, literally moving it to the original div's position.

  - Example: `$('div').become(newElement, {mode: "clone"})`
  - Expectation: Replaces div with a deep clone of newElement, leaving the original newElement untouched.

  - Example: `$('#button').become($$('.otherButtons'))`
  - Expectation: Takes another DomProxy as the replacement. The first element of the DomProxy is chosen for the replacement.

##### DomProxy.purge

- **purge(): DomProxy**

  - Removes the element from the DOM entirely.
  - Example: `$('button').purge()`

##### DomProxy.send

- **send(options: {url?: string, json?: boolean, event?: Event, serializer?: (element) => void} & FetchOptions): DomProxy**

  - Sends an HTTP request using the current element as the body of the request unless otherwise specified.
  - None of the options are required-- not even the URL.

  - If you do not provide a URL the method will:

    - First, look to see if it's in a form with an action property.
    - Next, it will look to see if the element is a button with a formaction property.
    - Next, it will try to see if the element is part of a form that has an action property.
    - Finally, it will take the current URL and slice off everything after the last slash. (http://example.com/foo/index.html -> http://example.com/foo/)

  - Unless the `body` option is provided, it will be created automatically based on the element type:

    - If it's a form, the entire form will be serialized using the formData API unless a custom serializer is provided.
    - If it's an input, textarea, or select, the value will be used.
    - If it isn't a form or one of the above elements, we will check to see if the element has a form property or one can be found with the `closest` method. If so, we will serialize the form using the formData API unless a custom serializer is provided.
    - If none of the above, the element's textContent will be used.

  - If the `json` option is set to true, the request will be sent as JSON and the response will be parsed as JSON.
  - Otherwise, the request will be sent as FormData and the response will be parsed as text.

  - Example:

  ```javascript
  // Send a JSON request using input value, providing fallback and completion messages.
  $("#myInput").send(myElement, {
    url: "/api/data",
    json: true,
    fallback: "Loading...",
    onSuccess: (data) => console.log("Received:", data),
    onError: (error) => console.log("Error occurred:", error),
  })
  ```

  - Example:

  ```javascript
  // Send form data using a custom serializer.
  $("#myForm").send(myElement, {
    url: "/api/data",
    serializer: (form) => {
      const formData = new FormData(form)
      formData.append("extra", "data")
      return formData
    },
  })
  ```

##### DomProxy.do

- **do(fn: (el: DomProxy) => Promise<void>): DomProxy**

  - Executes an asynchronous function and waits for it to resolve before continuing the chain (can be synchronous too).
  - Can receive the element as an argument, and you can still use all the proxy methods inside the function.

  - Example:

  ```javascript
  $("button").do(async (el) => {
    const response = await fetch("https://api.github.com/users/jazzypants1989")
    const data = await response.json()
    el.text(data.name)
  })
  ```

##### DomProxy.defer

- **defer(fn: (el: DomProxy) => void): DomProxy**

  - Schedules a function for deferred execution on the element.

  - This will push the operation to the very end of the internal event loop.

  - Usually, everything will happen in sequence anyways. Given the predictability of each queue, `defer` has limited use cases and should be used sparingly. The whole point of JessQuery is to make things predictable, so you should just put the function at the end of the chain if you can.

  - The only problem is if you set up an event listener using the same variable that has lots of queued behavior-- especially calls to the wait method. Just wrap the wait call and everything after it in defer to ensure that event handlers don't get stuck behind these in the queue.

  - `defer` will capture the element at the time of the call, so this should not be mixed with context switching methods like `parent` or `pickAll`.

  - Honestly, I'm not sure if this even makes much sense. I just spent a bunch of time building a crazy queue system, and I feel like I need to expose it. If you have any ideas for how to make this more useful, please open an issue or PR.

  - Example:

  ```javascript
  const button = $("button")

  button
    .text("this won't do anything for a second because of the wait call")
    .on("click", () => button.text("clicked"))
    .wait(1000)

  //but if we wrap the wait call in defer, the events will not be queued behind it
  button
    .text("this will be immediately responsive due to the defer call")
    .on("click", () => button.text("clicked"))
    .defer((el) => el.wait(1000).text("Yay!"))

  // THIS ONLY OCCURS BECAUSE THE SAME VARIABLE IS USED FOR THE EVENT LISTENER AND THE CHAIN
  $("button")
    .on("click", () => $("button").text("clicked"))
    .wait(1000) // NO PROBLEM HERE
  ```

##### DomProxy.fromJSON

- **fromJSON(url: string, transformFunc: (el: DomProxy, json: any) => void, options?: FetchOptions): DomProxy**

  - Fetches a JSON resource from the provided URL and applies a transformation function which uses the fetched JSON and the proxy's target element as arguments.
  - The transform function can be used to set the text, html, or any other property of the element.
  - The options object can be used to set a fallback message while the fetch is in progress, an error message if the fetch fails, and a callback to execute when the fetch is complete.
  - Example:

  ```javascript
  $("#item").fromJSON("/api/data", (element, json) => {
    element.text(json.value)
  })
  ```

  - Example:

  ```javascript
  $("#item").fromJSON("/api/data", (element, json) => {
    element.html(`<span>${json.description}</span>`)
  })
  ```

  - Example:

  ```javascript
  $('#news-item').fromJSON('/api/news-item', (element, json) => {
     { title, summary } = json;

    element.html(`<h1>${title}</h1>
                  <p>${summary}</p>`);
  },
  {
    error: 'Failed to load news item',
    fallback: 'Loading news item...'
    onSuccess: () => console.log('News item loaded')
  }
  ```

##### DomProxy.fromHTML

- **fromHTML(url: string, options?: FetchOptions): DomProxy**

  - Fetches an HTML resource from the provided URL and inserts it into the proxy's target element.
  - The options object can be used to set a fallback message while the fetch is in progress, an error message if the fetch fails, and a callback to execute when the fetch is complete.
  - The HTML is sanitized by default, which helps prevent XSS attacks.
  - Example: `$('#template').fromHTML('/template.html')`
  - Example: `$('#update').fromHTML('/update.html', { fallback: 'Loading update...', error: 'Failed to load update!' })`
  - Example: `$('#content').fromHTML('/malicious-content.html', { sanitize: false })`

##### DomProxy.fromStream

- **fromStream(url: string, options?: { sse?: boolean; add?: boolean; error?: string; fallback?: string; sanitize?: boolean; onSuccess?: (data: any) => void }): DomProxy**

  - Dynamically fetches data from the provided URL and updates a single DOM element using a stream or Server-Sent Event (SSE).
  - The options object can be used to set a fallback message while the stream is in progress, an error message if the stream fails, and a callback to execute when the stream is complete.
  - The HTML is sanitized by default, which helps prevent XSS attacks.
  - Example: `$('#content').fromStream('/api/data', { sanitize: false })` <-- Only for trusted sources!
  - Example: `$('#liveFeed').fromStream('/api/live', { sse: true, add: true, onSuccess: (data) => console.log('New data received:', data) })`

##### DomProxy.transition

- **transition(keyframes: Keyframe[] | PropertyIndexedKeyframes, options: KeyframeAnimationOptions): DomProxy**

  - Animates the element using the WAAPI.
  - Returns the proxy so you can continue chaining. If you need to return the animation object, use the `animate` method instead.
  - Remember, this method is blocking, so watch out for any event handlers using the same variable.
  - Example: `$('button').transition([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })`
  - [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)

##### DomProxy.wait

- **wait(ms: number): DomProxy**

  - Waits for a specified number of milliseconds before continuing the chain.
  - Returns the proxy so you can continue chaining. If you need to return the animation object, use the `animate` method instead.
  - Remember, this method is blocking, so watch out for any event handlers using the same variable.
  - Example: `$('button').wait(1000)`

##### DomProxy.next

- **next(): DomProxy**

  - Switch to the next sibling of the element in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$('button').css('color', 'red').next().css('color', 'blue')`
  - Expectation: The next sibling of the button will turn blue. The button itself will remain red.

##### DomProxy.prev

- **prev(): DomProxy**

  - Switch to the previous sibling of the element in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$('button').css('color', 'red').prev().css('color', 'blue')`
  - Expectation: The previous sibling of the button will turn blue. The button itself will remain red.

##### DomProxy.first

- **first(): DomProxy**

  - Switch to the first child of the element in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$('button').css('color', 'red').first().css('color', 'blue')`
  - Expectation: The first child of the button will turn blue. The button itself will remain red.

##### DomProxy.last

- **last(): DomProxy**

  - Switch to the last child of the element in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$('button').css('color', 'red').last().css('color', 'blue')`
  - Expectation: The last child of the button will turn blue. The button itself will remain red.

##### DomProxy.parent

- **parent(): DomProxy**

  - Switch to the parent of the element in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$('button').css('color', 'red').parent().css('color', 'blue')`
  - Expectation: The parent of the button will turn blue. The button itself will remain red.

##### DomProxy.ancestor

- **ancestor(ancestorSelector: string): DomProxy**

  - Gets the closest ancestor matching a selector. Uses the `closest` API under the hood.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$('.buttons').css('color', 'red').ancestor('.container').css('color', 'blue')`
  - Expectation: The container will turn blue. The buttons will remain red.

##### DomProxy.pick

- **pick(subSelector: string): DomProxy**

  - Gets the first descendant matching a sub-selector.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$('.container').css('color', 'red').pick('.buttons').css('color', 'blue')`
  - Expectation: The descendants of the container will turn blue. The container itself will remain red.

##### DomProxy.pickAll

- **pickAll(subSelector: string): DomProxyCollection**

  - Gets all descendants matching a sub-selector.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$('.container').css('color', 'red').pickAll('.buttons').css('color', 'blue')`
  - Expectation: The descendants of the container will turn blue. The container itself will remain red.

##### DomProxy.siblings

- **siblings(): DomProxyCollection**

  - Switch to the siblings of the element in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$('button').css('color', 'red').siblings().css('color', 'blue')`
  - Expectation: The siblings of the button will turn blue. The button itself will remain red.

##### DomProxy.kids

- **kids(): DomProxyCollection**

  - Switch to the children of the element in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$('button').css('color', 'red').kids().css('color', 'blue')`
  - Expectation: The children of the button will turn blue. The button itself will remain red.

### DomProxyCollection

A proxy covering a collection of HTML elements that allows you to chain methods sequentially (including asynchronous tasks) and then execute them one after the other. It includes **38** of these custom methods, but you can still use the full DOM API if you need to.

#### DomProxyCollection Methods

##### DomProxyCollection.on

- **on(ev: string, fn: EventListenerOrEventListenerObject): DomProxyCollection**

  - Adds an event listener to the elements.
  - Example: `$$('button').on('click', () => console.log('clicked'))`

##### DomProxyCollection.once

- **once(ev: string, fn: EventListenerOrEventListenerObject): DomProxyCollection**

  - Adds an event listener to the elements that will only fire once.
  - Example: `$$('button').once('click', () => console.log('clicked'))`

##### DomProxyCollection.off

- **off(ev: string, fn: EventListenerOrEventListenerObject): DomProxyCollection**

  - Removes an event listener from the elements.
  - Example: `$$('button').off('click', () => console.log('clicked'))`

##### DomProxyCollection.delegate

- **delegate(event: string, subSelector: string, handler: EventListenerOrEventListenerObject): DomProxyCollection**

  - Delegates an event listener to the elements.
  - Example: `$$('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))`

##### DomProxyCollection.html

- **html(newHtml: string): DomProxyCollection**

  - Change the HTML of the elements with an **UNSANITIZED** string of new HTML. This is useful if you want to add a script tag or something. If you want to sanitize the HTML, use `sanitize` instead.
  - Example: `$$('button').html('<span>Click me!</span>')`

##### DomProxyCollection.sanitize

- **sanitize: (html: string, sanitizer?: (html: string) => string) => DomProxyCollection**

  - Sanitizes a string of untusted HTML, then replaces the elements with the new, freshly sanitized HTML. This helps protect you from XSS Attacks. It uses the setHTML API under the hood, so you can provide your own sanitizer if you want with a second argument.
  - Example: `$$('button').sanitize('<span>Click me!</span>')`
  - MDN Documentation: [setHTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/setHTML)

##### DomProxyCollection.text

- **text(newText: string): DomProxyCollection**

  - Changes the text of the elements while retaining the tag.
  - Example: `$$('.buttons').text('Click me!')`

##### DomProxyCollection.val

- **val(newValue: string | number | (string | number)[] | FileList): DomProxyCollection**

  - Changes the value of all elements in the collection based on their type. For form elements such as inputs, textareas, and selects, the appropriate property (e.g., `value`, `checked`) will be adjusted. For other elements, the `textContent` property will be set.
  - Example: `$$('input[type="text"]').val('New Value')`
  - Example: `$$('input[type="checkbox"]').val(true)`
  - Example: `$$('input[type="radio"]').val('radio1')`
  - Example: `$$('input[type="file"]').val(myFileList)`
  - Example: `$$('select[multiple]').val(['option1', 'option2'])`

##### DomProxyCollection.css

- **css(prop: string | Record<string, string>, value?: string): DomProxyCollection**

  - Adds one or more CSS Rules to the elements. If the first argument is an object, each key-value pair will be added as a CSS Rule. If the first argument is a string, it will be treated as a CSS property and the second argument will be treated as its value.
  - Example: `$$('button').css('color', 'red')`
  - Example: `$$('button').css({ color: 'red', backgroundColor: 'blue' })`

##### DomProxyCollection.addStyleSheet

- **addStyleSheet(cssString: string): DomProxyCollection**

  - Adds a stylesheet to the ENTIRE DOCUMENT (this is useful for things like :hover styles). Got an good idea for how to make this scoped to a single element? Open a PR!
  - Example: `$$('button').addStyleSheet('button:hover { color: red }')`

##### DomProxyCollection.addClass

- **addClass(className: string): DomProxyCollection**

  - Adds a class to the elements.
  - Example: `$$('.buttons').addClass('btn')`

##### DomProxyCollection.removeClass

- **removeClass(className: string): DomProxyCollection**

  - Removes a class from the elements.
  - Example: `$$('.buttons').removeClass('btn')`

##### DomProxyCollection.toggleClass

- **toggleClass(className: string): DomProxyCollection**

  - Toggles a class on the elements.
  - Example: `$$('.buttons').toggleClass('btn')`

##### DomProxyCollection.set

- **set(attr: string, value: string?): DomProxyCollection**

  - Sets an attribute on the elements. If the value is undefined, it will be set to `""`, which is useful for boolean attributes like disabled or hidden.
  - Example: `$$('button').set('disabled')`

##### DomProxyCollection.unset

- **unset(attr: string): DomProxyCollection**

  - Removes an attribute from the elements.
  - Example: `$$('button').unset('disabled')`

##### DomProxyCollection.toggle

- **toggle(attr: string): DomProxyCollection**

  - Toggles an attribute on the elements.
  - Example: `$$('button').toggle('disabled')`

##### DomProxyCollection.data

- **data(key: string, value?: string): DomProxyCollection**

  - Sets a data attribute on the elements.
  - Example: `$$('button').data('id', '123')`

##### DomProxyCollection.attach

- **attach(...children: (HTMLElement | DomProxy)[]): DomProxyCollection**

  - Attaches children to the elements based on the provided options.
  - The children can be:
    - A string of HTML
    - A CSS selector
    - An HTMLElement
    - A DomProxy
    - An array of any of the above
  - The position can be:
    - 'append' (default): Adds the children to the end of the elements.
    - 'prepend': Adds the children to the beginning of the elements.
    - 'before': Adds the children before the elements.
    - 'after': Adds the children after the elements.
  - The HTML is sanitized by default, which helps prevent XSS attacks.
  - If you want to disable sanitization, set the `sanitize` option to `false`.
  - Example: `$$('button').attach('<span>Click me!</span>')`
  - Example: `$$('button').attach($('.container'), { position: 'prepend' })`
  - Example: `$$('button').attach([$('.container'), '<span>Click me!</span>'], { position: 'before' })`
  - Example: `$$('button').attach('<image src="x" onerror="alert(\'hacked!\')">')` // No XSS attack here!
  - Example: `$$('button').attach('<image src="x" onerror="alert(\'hacked!\')">', { sanitize: false })` // XSS attack here!
  - [Handy StackOverflow Answer for Position Option](https://stackoverflow.com/questions/14846506/append-prepend-after-and-before)

##### DomProxyCollection.cloneTo

- **cloneTo(parentSelector: string, options?: { position: string; all: boolean }): DomProxyCollection**

  - Clone of the elements to a new parent element in the DOM. The original elements remain in their current location. If you want to move the elements instead of cloning them, use `moveTo`.

  - The position can be:

    - 'append' (default): Adds the children to the end of the parent.
    - 'prepend': Adds the children to the beginning of the parent.
    - 'before': Adds the children before the parent.
    - 'after': Adds the children after the parent.

  - The all option will clone the elements into each new parent in the collection. If the all option is not passed, only the first parent in the collection will be used.

  - Example: `$$('div').cloneTo('.target')` // Clones and places inside first .target element (default behavior)
  - Example: `$$('div').cloneTo('.target', { position: 'after' })` // Clones and places after first .target element
  - Example: `$$('div').cloneTo('.target', { all: true })` // Clones and places inside all .target elements
  - Example: `$$('div').cloneTo('.target', { all: true, position: 'before' })` // Clones and places before all .target elements
  - [Handy StackOverflow Answer for Position Option](https://stackoverflow.com/questions/14846506/append-prepend-after-and-before)

##### DomProxyCollection.moveTo

- **moveTo(parentSelector: string, options?: { position: string }): DomProxyCollection**

  - Move the elements to a new parent element in the DOM. The original elements are moved from their current location. If you want to clone the elements instead of moving them, use `cloneTo`.
  - The position can be:
    - 'append' (default): Adds the children to the end of the parent.
    - 'prepend': Adds the children to the beginning of the parent.
    - 'before': Adds the children before the parent.
    - 'after': Adds the children after the parent.
  - The all option can technically be passed, but the elements will simply be attached to the last parent in the collection as there is only one element.
  - Example: `$$('div').moveTo('.target')` // Moves elements inside first .target element (default behavior)
  - Example: `$$('div').moveTo('.target', { position: 'before' })` // Moves elements before first .target element
  - Example: `$$('div').moveTo('.target', { position: 'after' })` // Moves elements after first .target element
  - [Handy StackOverflow Answer for Position Option](https://stackoverflow.com/questions/14846506/append-prepend-after-and-before)

##### DomProxyCollection.become

- **become(replacement: HTMLElement | Array<HTMLElement> | DomProxy, options?: { mode?: "move" | "clone"; match?: "cycle" | "remove" }): DomProxyCollection**

  - The become method is used to replace a single element with a different element from elsewhere in the DOM.
  - Under the hood, it utilizes the native `replaceWith` method but adds extra layers of functionality.
  - The replacement can be a simple HTMLElement, an array of HTMLElements, or another DomProxy instance.
  - Mode:

    - _clone_ (default) - This makes a copy of the replacement element to use for the DomProxy. This clone includes the element, its attributes, and all its child nodes, but does not include event listeners. The original element is left untouched.
    - _move_ - This moves the replacement element to the original element's position. The original element is removed from the DOM. This is the same as calling `replaceWith` directly.

  - Example: `$$('div').become(newElement, {mode: "move"})`
  - Expectation: Replaces div with newElement, literally moving it to the original div's position.

  - Example: `$$('div').become(newElement, {mode: "clone"})`
  - Expectation: Replaces div with a deep clone of newElement, leaving the original newElement untouched.

  - Example: `$$('.buttons').become($$('.otherButtons'))`
  - Expectation: Takes another DomProxy as the replacement. The first element of the DomProxy is chosen for the replacement.

##### DomProxyCollection.purge

- **purge(): DomProxyCollection**

  - Removes the elements from the DOM.
  - Example: `$$('.buttons').purge()`

##### DomProxyCollection.do

- **do(fn: (el: DomProxy) => Promise<void>): DomProxyCollection**

  - Executes an asynchronous function and waits for it to resolve before continuing the chain (can be synchronous too).
  - Example: `$$('button').do(async (el) => { // The elements are passed as an argument
  const response = await fetch('/api')
  const data = await response.json()
  el.text(data.message) // All the methods are still available
})`

##### DomProxyCollection.defer

- **defer(fn: (el: DomProxy) => void): DomProxyCollection**

  - Schedules a function for deferred execution on the elements.

  - This will push the operation to the very end of the internal event loop.

  - Usually, everything will happen in sequence anyways. Given the predictability of each queue, `defer` has limited use cases and should be used sparingly. The whole point of JessQuery is to make things predictable, so you should just put the function at the end of the chain if you can.

  - This only becomes a problem if you set up an event listener using the same variable that has lots of queued behavior-- especially calls to the wait method. Just wrap the wait call and everything after it in defer to ensure that event handlers don't get stuck behind these in the queue.

  - `defer` will capture the elements at the time of the call, so this should not be mixed with context switching methods like `parent` or `pickAll`.

  - Honestly, I'm not sure if this even makes much sense. I just spent a bunch of time building a crazy queue system, and I feel like I need to expose it. If you have any ideas for how to make this more useful, please open an issue or PR.

  - Example:

  ```javascript
  const buttons = $$(".buttons")

  buttons
    .text("this won't do anything for a second because of the wait call")
    .on("click", () => buttons.text("clicked"))
    .wait(1000)

  //but if we wrap the wait call in defer, the events will not be queued behind it
  buttons
    .text("this will be immediately responsive due to the defer call")
    .defer((el) => el.wait(1000).text("Yay!"))

  // THIS ONLY OCCURS BECAUSE THE SAME VARIABLE IS USED FOR THE EVENT LISTENER AND THE CHAIN
  $$(".buttons").on("click", () =>
    $$(".buttons").text("clicked").wait(1000)
  ) // NO PROBLEM HERE
  ``
  ```

##### DomProxyCollection.send

- **send(options: { url?: string, json?: boolean, event?: Event, serializer?: (elements) => void } & FetchOptions) => DomProxyCollection<T>**

  - Sends HTTP requests using each of the current elements as the body of the requests unless otherwise specified.
  - None of the options are required-- not even the URL.

  - If you do not provide a URL the method will:

    - First, look to see if it's in a form with an action property and use that.
    - If it can't find that, it will look to see if the element is a button with a formaction property and use that.
    - If it can't find that, it will try to see if the element is part of a form that has an action property and use that.
    - Finally, if it can't find anything else, it will use the current URL.

  - Unless the `body` option is provided, it will be created automatically based on the element type:

    - If it's a form, the entire form will be serialized using the formData API unless a custom serializer is provided.
    - If it's an input, textarea, or select, the value will be used.
    - If it isn't a form or one of the above elements, we will check to see if the element has a form property or one can be found with the `closest` method. If so, we will serialize the form using the formData API unless a custom serializer is provided.
    - If none of the above, the element's textContent will be used.

  - If the `json` option is set to true, the request will be sent as JSON and the response will be parsed as JSON.
  - Otherwise, the request will be sent as FormData and the response will be parsed as text.

  - Example: `$$('button').send({ url: '/api/submit' })`
  - Example: `$$('button').send({ url: '/api/submit', method: 'GET' })`
  - Example: `$$('button').send({ url: '/api/submit', json: true })`

##### DomProxyCollection.fromJSON

- **fromJSON(url: string, transformFunc: (el: DomProxy, json: any) => void, options?: FetchOptions): DomProxyCollection**

  - Fetches a JSON resource from the provided URL and applies a transformation function which uses the fetched JSON and the proxy's target element as arguments.
  - The transform function can be used to set the text, html, or any other property of the element.
  - The options object can be used to set a fallback message while the fetch is in progress, an error message if the fetch fails, and a callback to execute when the fetch is complete.
  - Example:

  ```javascript
  $$(".item").fromJSON("/api/data", (element, json) => {
    element.text(json.value)
  })
  ```

  - Example:

  ```javascript
  $$(".item").fromJSON("/api/data", (element, json) => {
    element.html(`<span>${json.description}</span>`)
  })
  ```

  - Example:

  ```javascript
  $$('.news-item').fromJSON('/api/news-item', (element, json) => {
     { title, summary } = json;

    element.html(`<h1>${title}</h1>
                  <p>${summary}</p>`);
  },
  {
    error: 'Failed to load news item',
    fallback: 'Loading news item...'
    onSuccess: () => console.log('News item loaded')
  }
  ```

##### DomProxyCollection.fromHTML

- **fromHTML(url: string, options?: FetchOptions): DomProxyCollection**

  - Fetches an HTML resource from the provided URL and inserts it into the proxy's target element.
  - The options object can be used to set a fallback message while the fetch is in progress, an error message if the fetch fails, and a callback to execute when the fetch is complete.
  - The HTML is sanitized by default, which helps prevent XSS attacks.
  - Example: `$$('.template').fromHTML('/template.html')`
  - Example: `$$('.update').fromHTML('/update.html', { fallback: 'Loading update...', error: 'Failed to load update!' })`
  - Example: `$$('.content').fromHTML('/malicious-content.html', { sanitize: false })`

##### DomProxyCollection.fromStream

- **fromStream(url: string, options?: { sse?: boolean; add?: boolean; error?: string; fallback?: string; sanitize?: boolean; onSuccess?: (data: any) => void }): DomProxyCollection**

  - Dynamically fetches data from the provided URL and updates a single DOM element using a stream or Server-Sent Event (SSE).
  - The options object can be used to set a fallback message while the stream is in progress, an error message if the stream fails, and a callback to execute when the stream is complete.
  - The HTML is sanitized by default, which helps prevent XSS attacks.
  - Example: `$$('.content').fromStream('/api/data', { sanitize: false })` <-- Only for trusted sources!
  - Example: `$$('.liveFeed').fromStream('/api/live', { sse: true, add: true, onSuccess: (data) => console.log('New data received:', data) })`

##### DomProxyCollection.transition

- **transition(keyframes: Keyframe[] | PropertyIndexedKeyframes, options: KeyframeAnimationOptions): DomProxyCollection**

  - Animates the elements using the WAAPI.
  - Returns the proxy so you can continue chaining. If you need to return the animation object, use the `animate` method instead.
  - Remember, this method is blocking, so watch out for any event handlers using the same variable.
  - Example: `$$('.buttons').transition([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })`
  - [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)

##### DomProxyCollection.wait

- **wait(ms: number): DomProxyCollection**

  - Waits for a specified number of milliseconds before continuing the chain.
  - Remember, this method is blocking, so watch out for any event handlers using the same variable.
  - Example: `$$('button').wait(1000)`

##### DomProxyCollection.next

- **next(): DomProxyCollection**

  - Switch to the next siblings of the elements in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$$('button').css('color', 'red').next().css('color', 'blue')`
  - Expectation: The next siblings of the buttons will turn blue. The buttons themselves will remain red.

##### DomProxyCollection.prev

- **prev(): DomProxyCollection**

  - Switch to the previous siblings of the elements in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$$('button').css('color', 'red').prev().css('color', 'blue')`
  - Expectation: The previous siblings of the buttons will turn blue. The buttons themselves will remain red.

##### DomProxyCollection.first

- **first(): DomProxyCollection**

  - Switch to the first children of the elements in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$$('button').css('color', 'red').first().css('color', 'blue')`
  - Expectation: The first children of the buttons will turn blue. The buttons themselves will remain red.

##### DomProxyCollection.last

- **last(): DomProxyCollection**

  - Switch to the last children of the elements in the middle of a chain.
  - Example: `$$('button').css('color', 'red').last().css('color', 'blue')`
  - Expectation: The last children of the buttons will turn blue. The buttons themselves will remain red.

##### DomProxyCollection.parent

- **parent(): DomProxyCollection**

  - Switch to the parents of the elements in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$$('button').css('color', 'red').parent().css('color', 'blue')`
  - Expectation: The parents of the buttons will turn blue. The buttons themselves will remain red.

##### DomProxyCollection.ancestor

- **ancestor(ancestorSelector: string): DomProxyCollection**

  - Switch to the closest ancestors matching a selector. Uses the `closest` API under the hood.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$$('.buttons').css('color', 'red').ancestor('.container').css('color', 'blue')`
  - Expectation: The containers will turn blue. The buttons will remain red.

##### DomProxyCollection.pick

- **pick(subSelector: string): DomProxyCollection**

  - Switch to the first descendants matching a sub-selector.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$$('.container').css('color', 'red').pick('.buttons').css('color', 'blue')`
  - Expectation: The buttons will turn blue. The container will remain red.

##### DomProxyCollection.pickAll

- **pickAll(subSelector: string): DomProxyCollection**

  - Switch to all descendants matching a sub-selector.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$$('.container').css('color', 'red').pickAll('.buttons').css('color', 'blue')`
  - Expectation: The buttons will turn blue. The container will remain red.

##### DomProxyCollection.siblings

- **siblings(): DomProxyCollection**

  - Switch to the siblings of the elements in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$$('button').css('color', 'red').siblings().css('color', 'blue')`
  - Expectation: The siblings of the buttons will turn blue. The buttons themselves will remain red.

##### DomProxyCollection.kids

- **kids(): DomProxyCollection**

  - Switch to the children of the elements in the middle of a chain.
  - This will throw an error if the proxy was created as "fixed" (with a second argument of true).
  - Example: `$$('.container').css('color', 'red').kids().css('color', 'blue')`
  - Expectation: The children of the container will turn blue. The container itself will remain red.

### setErrorHandler

Sets an error handler that will be called when an error occurs somewhere in JessQuery. The default behavior is to just log it to the console. You can override this behavior with this method to do something else (or nothing... no judgement here! 😉)

- **handler: (err: Error) => void**

  - The error handler

- Example:

  ```javascript
  setErrorHandler((err) => alert(err.message))
  // Now, you'll get an annoying alert every time an error occurs like a good little developer
  ```

### promisify

Wraps a function in a promise, allowing easy integration into DomProxy chains.. This is particularly useful for things like setTimeout, setInterval, and any older APIs that use callbacks. This works just like building a normal promise: call the resolve function when the function is successful, and call the reject function when it fails. The value that you pass will get passed to whatever method you use to consume the promise.

If the function does not call either resolve or reject within the specified timeout, the promise will automatically reject. Every promise that rejects and any error found inside of a promisified function will get routed through the default error handler (which you can set with the [setErrorHandler](#seterrorhandler) function).

The easiest way the function that you get from this method is to use it to provide values to one of the `DomProxy` methods like text() or html(), but you can also use the [DomProxy.do](#domproxydo) / [DomProxyCollection.do](#domproxycollectiondo) method to execute the function and use the result on the element / elements represented by them.

- **fn: (...args: any[]) => void**

  - The function to promisify

- **timeout?: number**

  - The number of milliseconds to wait before automatically rejecting the promise. If this is not provided, it will be set to 5000ms.

- Example:

  ```javascript
  const fetchApiData = promisify((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "https://jsonplaceholder.typicode.com/todos/1")
    xhr.onload = () => resolve(xhr.responseText)
    xhr.onerror = () => reject(xhr.statusText)
    xhr.send()
  })

  setErrorHandler((err) => $("#display").text(err.message))

  button.on("click", () => {
    display
      .text("Hold on! I'm about to use XHR")
      .wait(500)
      .do(async (el) => {
        const data = await fetchApiData()
        el.text(data)
      })
  })

  // Or remember, you can just pass it into the text method!
  button.on("click", async () => {
    display
      .text("I betcha don't even know what XHR is!")
      .wait(1000)
      .text(fetchApiData())
  })
  ```

## Contributing

If you have any ideas for new features or improvements, feel free to open an issue or a PR. I'm always open to suggestions! I started this as a bit of a joke, but I think it turned into something pretty useful. I'm sure there are a lot of things that could be improved, so I welcome any and all feedback.
