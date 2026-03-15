# Lecture 03 — React Flow and Folder Structure
## CRA vs Vite: Deep Dive

---

## Folder Structure — CRA Project (`01basicreact`)

| Folder / File | Purpose |
|---|---|
| `build/` | Production output — ignore during development |
| `node_modules/` | All installed dependencies (from `package.json`) |
| `src/` | All your working code lives here |
| `public/` | Static assets served as-is |
| `.gitignore` | Lists files/folders Git should not track |
| `package-lock.json` | Locked, stable versions of all dependencies |
| `README.md` | Markdown documentation file |

### `public/` folder contents

| File | Purpose |
|---|---|
| `index.html` | The **one and only** HTML page loaded — this is the SPA shell |
| `favicon.ico` | Browser tab icon |
| `logo192.png`, `logo512.png` | App icons |
| `manifest.json` | Used for mobile/PWA — meta tags are read from here |
| `robots.txt` | Instructions for search engine crawlers |

---

## The SPA Concept

> **JS comes into HTML only via a `<script>` tag** — this is the fundamental rule.

- React apps are **Single Page Applications (SPA)**
- There is only **one HTML file** (`index.html`) that ever loads
- Everything else is injected into it dynamically by React

---

## `public/index.html` — Key Parts

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Web site created using create-react-app" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

- `<noscript>` — shows a message if JavaScript is **disabled** in the browser
- `<div id="root"></div>` — the **mount point** where React injects the entire app
- `%PUBLIC_URL%` — CRA placeholder that resolves to the public folder path at build time

---

## How React Injects JS into HTML

### In CRA
- `react-scripts` is responsible for injecting `index.js` into `index.html`
- In the browser source, you'll see this added automatically:
  ```html
  <script defer src="/static/js/bundle.js"></script>
  ```

### In Vite
- No `react-scripts` — Vite uses a **direct script tag** in `index.html`:
  ```html
  <script type="module" src="/src/main.jsx"></script>
  ```
- `type="module"` enables ES module syntax directly in the browser

---

## `src/index.js` (CRA) — Line by Line

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- `ReactDOM.createRoot(document.getElementById('root'))` — stores a reference to the `<div id="root">` DOM node
- `root.render(...)` — renders the component tree into that DOM node
- `<React.StrictMode>` — development-only safety wrapper; helps catch potential issues (does **not** affect production)
- `<App />` — a **function** that returns HTML elements (JSX)

### Virtual DOM — Key Concept
- React has its own **Virtual DOM**
- It compares Virtual DOM with the real DOM (**diffing / reconciliation**)
- Only the **changed elements** are updated in the real DOM — this makes React efficient

---

## `src/main.jsx` (Vite) — Same Concept, Different Syntax

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- Same logic as CRA's `index.js` — create root, render app
- No functional difference — just Vite's style of imports

---

## Creating & Using a Custom Component

### In Vite (`01vitereact`)

**`src/Chai.jsx`** (new file):
```jsx
function Chai() {
    return (
        <h3>Chai is Ready</h3>
    )
}

export default Chai;
```

**`src/App.jsx`** — importing and using it:
```jsx
import Chai from "./Chai";

function App() {
  return (
    <Chai />
  )
}

export default App
```

**Output on screen:** `Chai is Ready`

---

### In CRA (`01basicreact`)

**`src/chai.js`** (new file):
```js
function Chai(){
    return (
        <h2>Chai in CRA App</h2>
    )
}
export default Chai;
```

**`src/App.js`** — importing and using it:
```js
import Chai from "./chai";

function App() {
  return (
    <>
      <h1>Chai aur React | Prabhansh Tiwari</h1>
      <Chai />
    </>
  );
}

export default App;
```

---

## The Fragment Rule — Returning Multiple Elements

- A component can export **only one root element**
- To return multiple elements, **wrap them** using:
  - `<div>...</div>` — adds an actual DOM element
  - `<>...</>` — **Fragment**, adds no extra DOM element (preferred)

```jsx
function App() {
  return (
    <>
      <Chai />
      <h1>This is second line</h1>
    </>
  )
}
```

- `<></>` is called a **Fragment**

---

## Rules for Creating Components ⚠️

| Rule | Details |
|---|---|
| Function name must start with **uppercase** | `function Chai()` ✅ — `function chai()` ❌ |
| File name should also start with **uppercase** | `Chai.jsx` ✅ — not enforced but best practice |
| Use `.jsx` extension when returning HTML (JSX) | Required in Vite; works in CRA too |
| Export only **one root element** per component | Wrap multiple elements in `<>...</>` |
| We are writing **HTML through JS** | That's what JSX is — JS + XML syntax |

---

## CRA vs Vite — Script Injection Comparison

| | CRA | Vite |
|---|---|---|
| How JS is injected | `react-scripts` adds `bundle.js` automatically | Manual `<script type="module">` in `index.html` |
| Entry file | `src/index.js` | `src/main.jsx` |
| Weight | Bulkier | Lightweight |
| Extension convention | `.js` (`.jsx` also works) | `.jsx` |

---

## Key Takeaways

- All real work happens inside **`src/`** and **`public/`**
- `index.html` is the **single page** — React injects everything into `<div id="root">`
- React's **Virtual DOM** diffs against the real DOM and updates only what changed
- `<React.StrictMode>` is a **development-only** helper — not a performance concern
- `.jsx` extension is not just cosmetic — some libraries **require** it when JSX is returned
- Component names and file names should **start with uppercase**
- Use **Fragments** `<></>` to return multiple elements without adding extra DOM nodes

<!-- 
In this lecture, we will discuss folder structure, compare projects created using CRA method v/s project created using vite

Lets talk about folder structuress in both type of react app

JS comes into the HTML only using script tag

Exception:

First talk of basicreact project using CRA
build : ignore ot
node_modules: contains all the dependencies of the pachage,json file
src has only two files:  App.js and index.js
We will understand line by line of these files

.gitignore: specifies which files to ignore while pushing into github
package-lock.json: this is package.json file but here the depencies are locked, stable version of depencies are locked
README.md is a marlkdown file
Public folder: contain favicon.ico, index.html, logo.png, robots.txt etc
menifest.json: used for mobile devices, meta tags are seen from menifest.jsonn file
robots.tst: for search engines

All the work is done in src folder and public folder.
index.html is important file located in Public folder
This is the main page that loads
This is a single pages that loads
that's why called SPA(Single page Application)

first we will clean index.js
```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Web site created using create-react-app"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    
    <title>React App</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```
<noscript>You need to enable JavaScript to run this app.</noscript> : This is used to show message when JS is not enabled in any browser.

<div id="root"></div>: 


Now, in src/index.js:

React has its own dom called virtual dom.
It compares with the main dom
then we render the changed elements.

```
const root = ReactDOM.createRoot(document.getElementById('root'));
```: store reference in root about the div having if=root in index.js

```
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```
Render the html elements.
<React.StrictMode> safe mode is for development.
<App />: is a function which returns html element

We are witing HTML through JS.

react-scripts: is responsible adding index.js into index.html
as you can see in source code
<script defer src="/static/js/bundle.js"></script></head>



Now, lets go see how project run in react app made using vite:

In Vite app, there is no scripts.
Then, how the main.jsx file get injected in index.html file?
ans: using the script tag
script type="module" src="/src/main.jsx"></script>

There is not much difference in both the apps.
But Vite app is light weight CRA app is bulkier


Same thing happens in main.jsx as it was happening in index.js  i.e. creating root and rendering the html element

---

Now, we will try to render html elements into the App.jsx

make src/chai.js:
```
function Chai() {
    return (
        <h3>Chai is Ready</h3>
    )
}

export default Chai;
```

App.jsx:
```

import Chai from "./Chai";

function App() {
  
  return (
    <Chai /> // note we can export only one element from here
  )
}

export default App
```
Output: "Chai is Ready" on screen

Note: The component name and name of function should start from uppercase letter.
.jsx is necessary
We can export only one element.
For this we need to wrap it using <div> or <></>
<></>: this is calleld fragment

```

import Chai from "./Chai";

function App() {
  
  return (
    <>
      <Chai />
      <h1>This is second line</h1>
    </>
  )
}

export default App
```

Now, we wwill do the same in CRA project: 01basicreact

chai.js:
```

function Chai(){
    return (
        <h2>Chai in CRA App</h2>
    )
}
export default Chai;
```


App.js:
```

import Chai from "./chai";

function App() {
  return (
    <>
      <h1>Chai aur React | Prabhansh Tiwari</h1>
      <Chai />
    </>
  );
}

export default App;

```

When making a component,
Always make the function name start with capital letter
file name should also start with capital letter, other wise it doesnt give error

Some libraries for us to use .jsx as extension if any html element is being returned
we can also use .jsx extension in CRA app too -->
