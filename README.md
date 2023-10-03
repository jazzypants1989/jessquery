# jessquery

`jessquery` is a light wrapper around the browser's native DOM API with less verbosity and more convenience methods. It's just like jQuery, except with a smaller footprint and a different name. It doesn't do quite as much, but most of jQuery's features have been subsumed by the browser itself.

The main difference? jQuery is 80kb before gzip. jessquery is 2kb before gzip-- 800 bytes after gzip. So, you get most of the convenience at a fraction of the cost.

## Installation

```bash
npm install jessquery
pnpm install jessquery
yarn add jessquery
bun install jessquery
```

## Usage

```javascript
import { $, $$ } from "jessquery"

// Select a single element
const button = $("#button")

// Select multiple elements
const buttons = $$(".buttons")

// Have fun!
button.on("click", () => console.log("clicked"))
buttons.addClass("btn")
```

## Interfaces

### $()

- **$(selector: string): DomElement**
  - Selects a single element.
  - Example: `$("#button")`

### $$()

- **$$(selector: string): DomElementCollection**
  - Selects multiple elements.
  - Example: `$$(".buttons")`

### DomElement

A representation of an HTML element enriched with extra methods for easier manipulation.

#### Methods

- **on(ev: string, fn: EventListenerOrEventListenerObject): DomElement**

  - Adds an event listener to the element.
  - Example: `$('button').on('click', () => console.log('clicked'))`

- **css(prop: string, value: string): DomElement**

  - Adds a CSS Rule to the element.
  - Example: `$('button').css('color', 'red')`

- **addClass(className: string): DomElement**

  - Adds a class to the element.
  - Example: `$('button').addClass('btn')`

- **removeClass(className: string): DomElement**

  - Removes a class from the element.
  - Example: `$('button').removeClass('btn')`

- **toggleClass(className: string): DomElement**

  - Toggles a class on the element.
  - Example: `$('button').toggleClass('btn')`

- **setAttribute(attr: string, value: string): DomElement**

  - Sets an attribute on the element.

- **append(htmlString: string): DomElement**

  - Appends an additional element to the element.
  - Example: `$('button').append('<span>Click me!</span>')`

- **remove(): DomElement**

  - Removes the element from the DOM.
  - Example: `$('button').remove()`

- **html(newHtml: string): DomElement**

  - Changes the HTML of the element.
  - Example: `$('button').html('<span>Click me!</span>')`

- **text(newText: string): DomElement**

  - Changes the text of the element.
  - Example: `$('button').text('Click me!')`

- **animate(keyframes: Keyframe[] | PropertyIndexedKeyframes, options: KeyframeAnimationOptions): DomElement**
  - Animates the element using the WAAPI.
  - Example: `$('button').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })`
  - [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)

### DomElementCollection

A collection of DomElement instances with similar enhanced methods for bulk actions.

#### Methods

- **on(ev: string, fn: EventListenerOrEventListenerObject): DomElementCollection**

  - Adds an event listener to the elements.
  - Example: `$$('button').on('click', () => console.log('clicked'))`

- **addClass(className: string): DomElementCollection**

  - Adds a class to the elements.
  - Example: `$$('.buttons').addClass('btn')`

- **removeClass(className: string): DomElementCollection**

  - Removes a class from the elements.
  - Example: `$$('.buttons').removeClass('btn')`

- **toggleClass(className: string): DomElementCollection**

  - Toggles a class on the elements.
  - Example: `$$('.buttons').toggleClass('btn')`

- **setAttribute(attr: string, value: string): DomElementCollection**

  - Sets an attribute on the elements.

- **append(htmlString: string): DomElementCollection**

  - Appends an additional element to the elements.
  - Example: `$$('.container').append('<span>New Element</span>')`

- **remove(): DomElementCollection**

  - Removes the elements from the DOM.
  - Example: `$$('.buttons').remove()`

- **appendTo(target: string): DomElementCollection**

  - Appends the elements to a target.
  - Example: `$$('.buttons').appendTo('.container')`

- **find(subSelector: string): DomElementCollection**

  - Finds descendants matching a sub-selector.
  - Example: `$$('.container').find('.buttons')`

- **closest(ancestorSelector: string): DomElementCollection**

  - Gets the closest ancestor matching a selector.
  - Example: `$$('.buttons').closest('.container')`

- **delegate(event: string, subSelector: string, handler: EventListenerOrEventListenerObject): DomElementCollection**

  - Delegates an event listener to the elements.
  - Example: `$$('.container').delegate('click', '.buttons', (e) => console.log('Button clicked'))`

- **animate(keyframes: Keyframe[] | PropertyIndexedKeyframes, options: KeyframeAnimationOptions): DomElementCollection**

  - Animates the elements using the WAAPI.
  - Example: `$$('.buttons').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000 })`
  - [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Element/animate)

- **css(prop: string, value: string): DomElementCollection**

  - Adds a CSS Rule to the elements.
  - Example: `$$('.buttons').css('color', 'red')`

- **html(newHtml: string): DomElementCollection**

  - Changes the HTML of the elements.
  - Example: `$$('.container').html('<span>New Content</span>')`

- **text(newText: string): DomElementCollection**
  - Changes the text of the elements.
  - Example: `$$('.buttons').text('Click me!')`
