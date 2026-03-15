---

# Detailed Notes: Custom React & JSX Deep Dive

Let's go section by section, unpacking every line of code and the reasoning behind it.

---

## Part 1 — What is React actually doing?

Before any code, understand the core problem React solves: the browser only understands real DOM nodes (`document.createElement`, `appendChild`, etc.). React sits in between — it lets you describe your UI as JavaScript objects, then handles the grunt work of turning those descriptions into real DOM.

The lecture builds this from scratch so you can see exactly what that "grunt work" is.

### The HTML setup

```html
<div class="root"></div>
<script src="./customReact.js"></script>
```

Two things to notice here. First, the `div` with class `root` is just an empty container — it has nothing in it. React (or our custom version) will inject everything into it at runtime via JavaScript. This is the foundation of a Single Page Application: your HTML is essentially a blank shell, and JS populates it.

Second, there's no `type="module"`, no bundler, no build step. Just a raw script tag. This is intentional — the lecture strips away all tooling so you focus only on the concept.

### The React element — a plain JavaScript object

```js
const reactElement = {
  type: "a",
  props: {
    href: "https://google.com",
    target: "_blank",
  },
  children: "Click me to visit Google",
};
```

This object is the heart of everything. It's not a DOM element — it's just a plain JS object with three fields:

`type` tells the renderer what HTML tag to create. It could be `"a"`, `"div"`, `"h1"`, anything.

`props` is an object of HTML attributes. Every attribute you'd write in HTML (`href`, `target`, `class`, `id`, etc.) lives here as a key-value pair.

`children` is the content that goes inside the tag. Here it's a string, but in real React it can be another element object, an array of element objects, a number, anything.

This structure — `{ type, props, children }` — is the universal shape of a React element. Everything React does flows from this object.

### The `customRender` function — explained line by line

This is the most important piece. Let's walk through the entire function:

```js
function customRender(reactElement, container) {
```

It takes two arguments: the element object to render, and the real DOM node to inject into (our `div.root`).

```js
  const domElement = document.createElement(reactElement.type);
```

`document.createElement` is a native browser API. We pass it `reactElement.type` — which is `"a"` — and it creates a real `<a>` DOM node. At this point it exists in memory but isn't in the page yet.

```js
  domElement.innerHTML = reactElement.children;
```

We set the inner content. `innerHTML` parses the string and puts it inside the element. If `children` were another element object instead of a string, this is where React would recurse — but we keep it simple here.

```js
  for (const prop in reactElement.props) {
    if (prop === "children") continue;
    domElement.setAttribute(prop, reactElement.props[prop]);
  }
```

This loop is the key improvement over the naive approach. The naive approach (shown commented out in the lecture) was:

```js
domElement.setAttribute('href', reactElement.props.href)
domElement.setAttribute('target', reactElement.props.target)
```

That's brittle — if you add a new prop, you have to write another line. The loop handles any number of props automatically. `for...in` iterates over every key in the `props` object. We skip `"children"` with `continue` because children are handled separately via `innerHTML`.

`domElement.setAttribute(prop, value)` is another native browser API — it sets an HTML attribute on a DOM node. So for `href` it's equivalent to writing `<a href="...">` in HTML.

```js
  container.appendChild(domElement);
}
```

Finally, we insert the now-fully-configured DOM node into the container. `appendChild` attaches it as a child of the container element, which makes it appear on the page. Before this line, the element existed in memory but was invisible. After this line, it's in the DOM and the user can see it.

```js
const mainContainer = document.querySelector("#root");
customRender(reactElement, mainContainer);
```

`document.querySelector("#root")` finds our empty `div` in the HTML. Then we call our custom render function. This is exactly what `createRoot(document.getElementById('root')).render(reactElement)` does in real React.

Here's a visual of that whole flow:---

## Part 2 — JSX and what it compiles to

Now the lecture shifts to how real React projects work — specifically the Vite + JSX setup.

### What JSX actually is

JSX looks like HTML inside JavaScript:

```jsx
const anotherElement = (
  <a href="https://google.com" target="_blank">Visit Google</a>
)
```

But this is NOT valid JavaScript. Browsers cannot parse this. It only works because a tool (Babel, or in Vite's case, the esbuild/Rollup pipeline with the React plugin) transforms it before it ever reaches the browser.

That transformation is 100% mechanical — it's a text substitution. Every JSX tag becomes a `React.createElement(...)` call. The above becomes:

```js
const anotherElement = React.createElement(
  "a",
  { href: "https://google.com", target: "_blank" },
  "Visit Google"
)
```

They are completely identical at runtime. JSX is purely a developer convenience — it's easier to read and write, especially for nested UI. But the browser only ever sees the `React.createElement` version.

This is why `import React from 'react'` used to be required at the top of every JSX file even if you never explicitly called `React` in your code — because after compilation, every JSX tag called `React.createElement`. (Modern React with the new JSX transform auto-imports this, which is why newer projects don't need it.)

### `React.createElement` — full signature

```js
React.createElement(type, props, ...children)
```

`type` — a string like `"a"`, `"div"`, `"h1"`, OR a component function like `MyApp`.

`props` — an object of all attributes/props. If there are none, pass `null`.

`...children` — any number of child arguments. This is a rest parameter, so you can pass as many children as you want. Look at the lecture code:

```js
const anotherUser = "Chai air react"

const reactElement = React.createElement(
  "a",
  { href: "https://google.com", target: "_blank" },
  "click me to visit google",   // child 1 — literal string
  anotherUser                   // child 2 — JavaScript variable
)
```

This shows something crucial: variables can be passed directly as children. This is the exact mechanism behind `{variable}` in JSX — `<a>{anotherUser}</a>` compiles to `React.createElement("a", null, anotherUser)`. There's no magic, it's just a function argument.

### What `React.createElement` returns

It returns a plain object — very similar to the `reactElement` object we hand-crafted in Part 1. Something like:

```js
{
  type: "a",
  key: null,
  ref: null,
  props: {
    href: "https://google.com",
    target: "_blank",
    children: ["click me to visit google", "Chai air react"]
  },
  _owner: null,
}
```

Notice that in real React, children get moved inside `props.children` rather than being a top-level field. That's a small difference from our custom version. But the concept is identical — it's just a descriptor object, not a real DOM node.

### `createRoot` and `.render()`

```js
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')).render(reactElement)
```

`react-dom` is a separate package from `react`. This is intentional — the core `react` package only knows about element objects. `react-dom` is the bridge that knows how to turn those objects into actual browser DOM. (There's also `react-native` which turns them into native mobile UI, using the same `react` core.)

`createRoot` is the React 18 API. It creates a "root" — a managed React rendering context attached to a DOM node. Then `.render(element)` takes your element tree and does all the work: `createElement` for each node, `setAttribute` for each prop, `appendChild` into the container — exactly like our `customRender` but far more sophisticated (it handles diffing, updates, events, etc.).

### The `MyApp` component — why it didn't render

The lecture also defines this but doesn't render it:

```jsx
function MyApp() {
  return (
    <div>
      <h1>Custom App !</h1>
    </div>
  )
}
```

A React component is just a function that returns a React element. When you write `<MyApp />` in JSX, it compiles to `React.createElement(MyApp, null)` — notice the function reference is passed as `type`, not the string `"MyApp"`. React then calls `MyApp()` to get the element tree it returns, and renders that.

In the lecture, `createRoot(...).render(reactElement)` renders the manually created `reactElement`, not `<MyApp />`. That's a deliberate choice — to show that `React.createElement` produces the same thing that JSX would.

---

Here's the full JSX-to-DOM pipeline in one view:---

## The big picture — everything side by side

Here's the conceptual equivalence the lecture is trying to drive home. Your handmade `customReact.js` and the real React Vite project are doing the same logical thing:

| Step | Custom React | Real React (Vite) |
|---|---|---|
| Describe UI | Hand-write JS object `{ type, props, children }` | Write JSX, compiled to `React.createElement(...)` |
| Create element | `document.createElement(type)` | Same, internally |
| Set content | `domElement.innerHTML = children` | React handles text nodes |
| Apply attributes | `for...in` loop + `setAttribute` | Same, internally |
| Mount to page | `container.appendChild(domElement)` | `createRoot(node).render(element)` |

The only things that are genuinely different in real React are the things added on top of this base: the ability to re-render when state changes (reconciliation), the virtual DOM diffing algorithm, events, hooks, etc. But the foundational data flow — object → DOM node → page — is exactly what the lecture built.

---

## Key mental models to lock in

**React elements are not DOM elements.** A React element is a cheap, plain JS object. A DOM node is a heavy browser-managed object. React creates many element objects quickly, then makes the minimum necessary DOM changes. This is the whole point of the virtual DOM.

**JSX is a lie (a useful one).** It does not exist at runtime. By the time your code runs in a browser, all JSX has been mechanically replaced with `React.createElement(...)` calls. JSX is just sugar for the developer.

**`react` and `react-dom` are separate.** `react` only knows about elements and components. `react-dom` knows how to turn them into browser DOM. This separation lets React work on native mobile (`react-native`), terminals (`ink`), etc. — same `react` core, different renderer.

**Variables in JSX work because children are function arguments.** `{anotherUser}` in JSX compiles to passing `anotherUser` as an argument to `React.createElement`. There's no template magic — it's literally a function call.

[React Official Repo](https://github.com/facebook/react)

<!-- In this lecture, we will create our own react library.
This will be the bare minimum basic version of the react which gives concept clarity and understand things going under the hood.
In the second portion, we will understand JSX.

index.html:
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Custom React App</title>
</head>
<body>
    <div class="root"></div>
    <script src="./customReact.js"></script>
</body>
</html>
```


customReact.js:
```
function customRender(reactElement, container) {
    /*
    const domElement = document.createElement(reactElement.type) 
    domElement.innerHTML = reactElement.children; 
    domElement.setAttribute('href', reactElement.props.href)
    domElement.setAttribute('target', reactElement.props.target)

    container.appendChild(domElement)
    */
  // in the above code we were repeatiing code to set attribute manually

  const domElement = document.createElement(reactElement.type);
  domElement.innerHTML = reactElement.children;
  for (const prop in reactElement.props) {
    if (prop === "children") continue;
    domElement.setAttribute(prop, reactElement.props[prop]);
  }
  container.appendChild(domElement);
}

const reactElement = {
  type: "a",
  props: {
    href: "https://google.com",
    target: "_blank",
  },
  children: "Click me to visit Google",
};

const mainContainer = document.querySelector("#root");

customRender(reactElement, mainContainer);
```

This is how we create custom React.

---

From vite project,

main.jsx:
```
import React from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'

function MyApp() {
  return (
    <div>
      <h1>Custom App !</h1>
    </div>
  )
}


// const reactElement = {
//     type: "a",
//     props: {
//         href: "https://google.com",
//         target: "_blank",
//     },
//     children: "Click me to visit Google"
// }


const anotherElement = (
  <a href="https://google.com" target='_blank'>Visit Google</a>
)

const anotherUser = "Chai air react"

const reactElement = React.createElement(
  "a",
  { href: "https://google.com", target: "_blank" },
  "click me to visit google",
  anotherUser
)

createRoot(document.getElementById('root')).render(

  reactElement


)
```
{variable}: how to use variable
{evaluated js expression}


make notes, explain things which is explained using code

 -->
