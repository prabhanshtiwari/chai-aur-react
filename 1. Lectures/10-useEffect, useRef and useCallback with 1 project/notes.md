# 🔐 Lecture Notes — Password Generator Project
### Chai Aur React | Lecture 5 | Hooks Deep Dive: `useCallback`, `useEffect`, `useRef`

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Project Setup](#2-project-setup)
3. [State Variables — What & Why](#3-state-variables--what--why)
4. [useRef Hook](#4-useref-hook)
5. [useCallback Hook — Memoization](#5-usecallback-hook--memoization)
6. [The `passwordGenerator` Function — Deep Dive](#6-the-passwordgenerator-function--deep-dive)
7. [The `copyPasswordToClipboard` Function — Deep Dive](#7-the-copypasswordtoclipboard-function--deep-dive)
8. [useEffect Hook](#8-useeffect-hook)
9. [JSX & UI Breakdown](#9-jsx--ui-breakdown)
10. [Bug Analysis — Random Index Formula](#10-bug-analysis--random-index-formula)
11. [Why `window.navigator.clipboard` Doesn't Work in Next.js](#11-why-windownavigatorclipboard-doesnt-work-in-nextjs)
12. [Concept Summary Table](#12-concept-summary-table)
13. [Full Annotated Code](#13-full-annotated-code)

---

## 1. Project Overview

This project builds a **Password Generator** app using React + Vite + TailwindCSS.

### Features:
- Generate random passwords of customizable length (6–100 characters)
- Toggle inclusion of **numbers** (0–9)
- Toggle inclusion of **special characters** (!@#$%^&* etc.)
- One-click **copy to clipboard** with visual feedback ("Copied!" flash)
- Password **auto-regenerates** whenever any setting changes

### Concepts Covered:
| Hook | Purpose |
|------|---------|
| `useState` | Manage length, toggles, password, copied state |
| `useCallback` | Memoize functions to avoid unnecessary re-creation |
| `useEffect` | Trigger password generation when dependencies change |
| `useRef` | Reference DOM input element for selection + clipboard |

---

## 2. Project Setup

```bash
npm create vite@latest 05passwordGenerator -- --template react
cd 05passwordGenerator
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

In `tailwind.config.js`:
```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

In `index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 3. State Variables — What & Why

```jsx
const [length, setLength] = useState(8)
const [numberAllowed, setNumberAllowed] = useState(false);
const [charAllowed, setCharAllowed] = useState(false)
const [password, setPassword] = useState("")
const [copied, setCopied] = useState(false);
```

| State Variable | Type | Initial Value | Purpose |
|----------------|------|---------------|---------|
| `length` | `number` | `8` | Controls password length via the range slider |
| `numberAllowed` | `boolean` | `false` | Whether digits 0–9 are included in password |
| `charAllowed` | `boolean` | `false` | Whether special characters are included |
| `password` | `string` | `""` | The currently generated password string |
| `copied` | `boolean` | `false` | Drives "Copy" → "Copied!" button label toggle |

### Why separate state for `copied`?
When the user clicks "Copy", we want the button to momentarily say "Copied!" as visual confirmation, then revert to "Copy" after 1 second. This requires a dedicated boolean that's set `true` on copy and reset `false` via `setTimeout`.

---

## 4. `useRef` Hook

```jsx
const passwordRef = useRef(null)
```

### What is `useRef`?
`useRef` creates a **mutable reference object** whose `.current` property persists across renders **without causing re-renders** when changed. It's the React way to directly access a DOM node.

### Why do we need it here?
To copy text to clipboard in a cross-browser safe way, we need to:
1. **Select** the text inside the input field
2. **Call clipboard API** with that selected text

Both operations need a direct reference to the actual DOM `<input>` element — something you can't do with just React state. So we attach the ref to the input:

```jsx
<input
  ...
  ref={passwordRef}
/>
```

Now `passwordRef.current` points directly to the DOM `<input>` node, giving us access to methods like `.select()` and `.setSelectionRange()`.

---

## 5. `useCallback` Hook — Memoization

```jsx
const passwordGenerator = useCallback(() => {
  // function body
}, [length, numberAllowed, charAllowed, setPassword])
```

### What is Memoization?
Memoization is an **optimization technique** where a function's result (or the function itself) is cached so it doesn't need to be recomputed if inputs haven't changed.

### What does `useCallback` do?
`useCallback` **memoizes a function definition** — it returns the same function instance across renders, unless one of its listed dependencies changes.

Without `useCallback`:
```
Render 1 → Creates passwordGenerator (version A)
Render 2 → Creates passwordGenerator (version B) ← new reference, even if logic is identical
Render 3 → Creates passwordGenerator (version C) ← new reference again
```

With `useCallback`:
```
Render 1 → Creates passwordGenerator (version A)
Render 2 → length unchanged → Returns version A (same reference)
Render 3 → length changed  → Creates new version B
```

### Why does this matter?
- **Performance**: Prevents child components from re-rendering unnecessarily when they receive a function as a prop (React uses reference equality for props comparison).
- **useEffect stability**: When `passwordGenerator` is listed as a dependency in `useEffect`, we only want the effect to re-run when the function's *logic* has actually changed (i.e., when `length`, `numberAllowed`, or `charAllowed` changed) — not on every render.

### Syntax:
```jsx
const memoizedFn = useCallback(
  () => { /* function body */ },
  [dep1, dep2, ...]  // dependency array
)
```
The function is recreated **only when** any value in the dependency array changes.

### Dependency Array Rules (same as `useEffect`):
| Scenario | Behavior |
|----------|----------|
| `[]` empty array | Function is created once, never recreated |
| `[a, b]` | Recreated when `a` or `b` changes |
| No array | Recreated on every render (defeats the purpose) |

---

## 6. The `passwordGenerator` Function — Deep Dive

```jsx
const passwordGenerator = useCallback(() => {
  let pass = ""
  let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
  
  if (numberAllowed) str += "0123456789"
  if (charAllowed) str += "!@#$%^&*-_+=[]{}~`"

  for (let i = 1; i <= length; i++) {
    let char = Math.floor(Math.random() * str.length)
    pass += str.charAt(char)
  }

  setPassword(pass)

}, [length, numberAllowed, charAllowed, setPassword])
```

### Step-by-step breakdown:

**Step 1 — Build the character pool:**
```js
let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
```
Start with the full alphabet (upper + lower = 52 characters).

**Step 2 — Conditionally expand the pool:**
```js
if (numberAllowed) str += "0123456789"   // adds 10 chars
if (charAllowed) str += "!@#$%^&*-_+=[]{}~`"  // adds 18 chars
```
The pool grows based on user toggles.

**Step 3 — Random character selection loop:**
```js
for (let i = 1; i <= length; i++) {
  let char = Math.floor(Math.random() * str.length)
  pass += str.charAt(char)
}
```
- Loop runs exactly `length` times (e.g., 8 times for length 8)
- `Math.random()` → float in `[0, 1)` e.g., `0.7341`
- `* str.length` → scales it to `[0, str.length)` e.g., `0.7341 * 70 = 51.38`
- `Math.floor(...)` → integer index e.g., `51`
- `str.charAt(51)` → character at that position e.g., `'z'`

**Step 4 — Update state:**
```js
setPassword(pass)
```
Triggers a re-render with the new password displayed in the input.

### Why is `setPassword` in the dependency array?
`setPassword` is a state setter from `useState`. In React, state setters have **stable references** (they never change). Including it in the dependency array is technically unnecessary but is considered best practice — it documents the complete set of values the function closes over.

---

## 7. The `copyPasswordToClipboard` Function — Deep Dive

```jsx
const copyPasswordToClipboard = useCallback(() => {
  passwordRef.current?.select();
  passwordRef.current?.setSelectionRange(0, 100);
  window.navigator.clipboard.writeText(password);
  setCopied(true);
  setTimeout(() => setCopied(false), 1000);
}, [password])
```

### Line-by-line:

**`passwordRef.current?.select()`**
- Selects all text in the input field (highlights it)
- The `?.` is optional chaining — if `passwordRef.current` is `null` for any reason, it won't throw an error; it just skips the call
- This is a visual UX touch — user can see what was copied

**`passwordRef.current?.setSelectionRange(0, 100)`**
- Sets the selection to characters 0 through 99
- More precise than `.select()` — ensures only the first 100 characters are highlighted (useful for very long passwords)
- Works as a safety fallback on some mobile browsers where `.select()` behaves inconsistently

**`window.navigator.clipboard.writeText(password)`**
- Calls the **Clipboard API** to write the password string to the clipboard
- This is the actual copy operation
- Returns a Promise (though not awaited here — that's fine for a simple use case)
- Requires **HTTPS** or **localhost** to work (browser security restriction)

**`setCopied(true)` + `setTimeout(() => setCopied(false), 1000)`**
- Sets `copied` to `true` → button shows "Copied!"
- After 1000ms (1 second), sets it back to `false` → button reverts to "Copy"
- This creates a satisfying visual feedback loop without a permanent state change

### Why only `[password]` in dependency array?
The function needs access to `password` (the current password string to copy) and `passwordRef` (stable — refs don't change). So only `password` needs to be listed.

---

## 8. `useEffect` Hook

```jsx
useEffect(() => {
  passwordGenerator()
}, [length, numberAllowed, charAllowed, passwordGenerator])
```

### What is `useEffect`?
`useEffect` lets you **run side effects** after a component renders. A "side effect" is anything that reaches outside of React's render cycle — like:
- Fetching data
- Setting up subscriptions or timers
- Directly manipulating the DOM
- Calling a function that updates state (like our `passwordGenerator`)

### How it works here:
- On **initial mount**: `useEffect` runs after the first render → calls `passwordGenerator()` → sets the first password
- On **subsequent renders**: React checks if any value in `[length, numberAllowed, charAllowed, passwordGenerator]` has changed. If yes, it re-runs the effect.

### Trigger Map:
| User Action | What changes | Effect re-runs? |
|-------------|-------------|----------------|
| Move length slider | `length` state changes → `passwordGenerator` recreated | ✅ Yes |
| Check "Numbers" | `numberAllowed` changes → `passwordGenerator` recreated | ✅ Yes |
| Check "Characters" | `charAllowed` changes → `passwordGenerator` recreated | ✅ Yes |
| Click "Copy" | `copied` changes (not in deps) | ❌ No |

### Why is `passwordGenerator` in the dependency array?
Because `passwordGenerator` is created with `useCallback`, its reference only changes when its own dependencies change. So:
- `useEffect` depends on `passwordGenerator`
- `passwordGenerator` depends on `[length, numberAllowed, charAllowed]`

This creates a clean **reactive chain**:

```
User changes length
  → length state updates
  → passwordGenerator is recreated (new reference)
  → useEffect detects change in passwordGenerator
  → useEffect calls passwordGenerator()
  → new password is generated and set in state
  → component re-renders with new password
```

### ⚠️ Without `useCallback`, this would infinite loop!
If `passwordGenerator` were a plain function (not memoized):
1. Every render creates a new `passwordGenerator` reference
2. `useEffect` sees a changed `passwordGenerator` → runs
3. Running calls `setPassword()` → triggers re-render
4. Re-render creates new `passwordGenerator` → repeat ♾️

`useCallback` breaks this cycle by ensuring `passwordGenerator` only gets a new reference when actual dependencies change.

---

## 9. JSX & UI Breakdown

### Overall Layout
```jsx
<div className="w-full max-w-md mx-auto shadow-md rounded-lg px-4 py-3 my-8 bg-gray-800 text-orange-500">
```
- `max-w-md` — caps width at ~448px (card style)
- `mx-auto` — centers horizontally
- `bg-gray-800` — dark background for the card
- `text-orange-500` — default text color is orange (labels inherit this)

### Password Input + Copy Button Row
```jsx
<div className="flex shadow rounded-lg overflow-hidden mb-4">
  <input
    type="text"
    value={password}          // controlled input — driven by state
    className="outline-none w-full py-1 px-3"
    placeholder="Password"
    readOnly                  // user cannot type in it manually
    ref={passwordRef}         // DOM reference for clipboard
  />
  <button
    onClick={copyPasswordToClipboard}
    className='outline-none bg-blue-700 text-white px-3 py-0.5 shrink-0'
  >
    {copied ? "Copied" : "Copy"}  {/* conditional label */}
  </button>
</div>
```
- `readOnly` on the input ensures users can't accidentally edit the generated password
- `shrink-0` on the button prevents it from being squeezed by flexbox

### Range Slider (Length Control)
```jsx
<input
  type="range"
  min={6}
  max={100}
  value={length}
  className='cursor-pointer'
  onChange={(e) => { setLength(e.target.value) }}
/>
<label>Length: {length}</label>
```
- `min={6}` `max={100}` sets bounds
- `value={length}` makes it a controlled input
- `onChange` reads `e.target.value` (string from DOM, React handles comparison fine) and updates `length` state
- Label shows live current value

### Number Toggle Checkbox
```jsx
<input
  type="checkbox"
  defaultChecked={numberAllowed}
  id="numberInput"
  onChange={() => {
    setNumberAllowed((prev) => !prev);
  }}
/>
<label htmlFor="numberInput">Numbers</label>
```
- `defaultChecked` sets the initial checked state from the `numberAllowed` state value
- `onChange` uses the **functional updater form** `(prev) => !prev` which is safer than `!numberAllowed` when state updates are batched
- `htmlFor` / `id` pairing makes the label clickable (clicking "Numbers" text also toggles the checkbox)

### Special Characters Toggle Checkbox
Identical pattern to number toggle — same principles apply.

---

## 10. Bug Analysis — Random Index Formula

```js
let char = Math.floor(Math.random() * str.length)
```

### Potential Bug — The `+1` comment
In the original code there's a comment:
```js
// we added +1 to avoid zeroth value
```
But the actual code does **not** add `+1`. Let's analyze both:

**Current code (correct):**
```js
Math.floor(Math.random() * str.length)
// Range: [0, str.length - 1]
// All indices valid ✅
```

**If `+1` were added (incorrect):**
```js
Math.floor(Math.random() * str.length + 1)
// Range: [0, str.length] 
// str.charAt(str.length) returns "" (empty string)! ❌
// Occasionally produces empty character in password
```

### Conclusion:
The comment is **misleading/stale**. The current formula without `+1` is **correct**. `Math.random()` already has a range of `[0, 1)` — it never returns exactly 1, so `Math.floor(Math.random() * str.length)` always produces a valid index from `0` to `str.length - 1`.

---

## 11. Why `window.navigator.clipboard` Doesn't Work in Next.js

```js
window.navigator.clipboard.writeText(password);
```

### The Root Problem: SSR (Server-Side Rendering)

Next.js renders components on the **server** as well as the client. The `window` object is a **browser-only global** — it is part of the browser's Web API and simply **does not exist in Node.js** (the server environment where Next.js SSR runs).

When Next.js tries to execute `window.navigator.clipboard.writeText(...)` during server-side rendering:
```
ReferenceError: window is not defined
```

### React (Vite/CRA) vs Next.js rendering model:

| | React (Vite) | Next.js |
|--|--|--|
| Where rendering starts | Client (browser) only | Server (Node.js) first |
| `window` available? | ✅ Always | ❌ Not during SSR |
| `document` available? | ✅ Always | ❌ Not during SSR |

### How to Fix in Next.js:

**Option 1 — Check if `window` exists:**
```js
if (typeof window !== "undefined") {
  window.navigator.clipboard.writeText(password);
}
```

**Option 2 — Use `useEffect` (runs only on client):**
```jsx
useEffect(() => {
  // Safe: useEffect never runs on server
  window.navigator.clipboard.writeText(password);
}, [trigger]);
```

**Option 3 — Use Next.js dynamic import with `{ ssr: false }`:**
For entire components that use browser APIs, you can disable SSR for that component:
```jsx
import dynamic from 'next/dynamic'
const PasswordCopier = dynamic(() => import('./PasswordCopier'), { ssr: false })
```

**Option 4 — Use `navigator.clipboard` directly (without `window`):**
In modern browsers, `navigator` is accessible as a global without needing the `window.` prefix. While this doesn't solve the SSR problem by itself, combining it with an `useEffect` or `typeof window !== "undefined"` check makes it cleaner.

### Summary:
> **`window` is a browser concept. Node.js (which powers Next.js SSR) doesn't have a browser. That's why you get the error — you're trying to access something that doesn't exist in the environment where the code is running.**

---

## 12. Concept Summary Table

| Concept | What it does | When to use |
|---------|-------------|-------------|
| `useState` | Stores reactive data | Any data that, when changed, should re-render UI |
| `useRef` | Holds a DOM reference (or mutable value) without triggering re-render | Accessing DOM nodes directly (selection, focus, scroll) |
| `useCallback` | Memoizes a function — returns same reference if deps unchanged | Passing functions as props; functions used in `useEffect` deps |
| `useEffect` | Runs side effects after render | Data fetching, subscriptions, calling functions based on state |
| Dependency Array | Tells React when to re-run effect / re-memoize | Always specify correctly to avoid stale closures or infinite loops |
| Memoization | Caching computed results / function references | Preventing unnecessary recalculations or re-renders |
| Clipboard API | `window.navigator.clipboard.writeText()` | Programmatic copy in browser; guard with `typeof window` in SSR |
| Optional chaining `?.` | Safely access property/method — skips if null/undefined | Working with refs or DOM nodes that might not be mounted yet |

---

## 13. Full Annotated Code

```jsx
import { useState, useCallback, useEffect, useRef } from 'react'

function App() {
  // ── STATE ──────────────────────────────────────────────────────────
  const [length, setLength] = useState(8)           // password length (range: 6-100)
  const [numberAllowed, setNumberAllowed] = useState(false); // include digits?
  const [charAllowed, setCharAllowed] = useState(false)      // include special chars?
  const [password, setPassword] = useState("")               // generated password
  const [copied, setCopied] = useState(false);               // copy button feedback

  // ── REF ────────────────────────────────────────────────────────────
  // Direct reference to the <input> DOM node for text selection
  const passwordRef = useRef(null)

  // ── PASSWORD GENERATOR ─────────────────────────────────────────────
  // Memoized — only recreated when length/numberAllowed/charAllowed changes
  const passwordGenerator = useCallback(() => {
    let pass = ""
    
    // Base character pool: A-Z + a-z
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    
    // Expand pool based on toggles
    if (numberAllowed) str += "0123456789"
    if (charAllowed) str += "!@#$%^&*-_+=[]{}~`"

    // Pick 'length' random characters from the pool
    for (let i = 1; i <= length; i++) {
      // Random index: [0, str.length - 1]
      let char = Math.floor(Math.random() * str.length)
      pass += str.charAt(char)
    }

    setPassword(pass) // Update state → triggers re-render

  }, [length, numberAllowed, charAllowed, setPassword])
  // Dependencies: regenerate function when any of these change

  // ── COPY TO CLIPBOARD ──────────────────────────────────────────────
  // Memoized — only recreated when `password` changes
  const copyPasswordToClipboard = useCallback(() => {
    passwordRef.current?.select();               // highlight input text
    passwordRef.current?.setSelectionRange(0, 100); // precise selection range
    window.navigator.clipboard.writeText(password); // actual copy operation
    setCopied(true);                             // show "Copied!"
    setTimeout(() => setCopied(false), 1000);   // revert after 1s
  }, [password])

  // ── EFFECT ─────────────────────────────────────────────────────────
  // Runs passwordGenerator on mount + whenever settings change
  useEffect(() => {
    passwordGenerator()
  }, [length, numberAllowed, charAllowed, passwordGenerator])

  // ── JSX ────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md mx-auto shadow-md rounded-lg px-4 py-3 my-8 bg-gray-800 text-orange-500">
      
      <h1 className='text-white text-center my-3'>Password generator</h1>
      
      {/* Password display + copy button */}
      <div className="flex shadow rounded-lg overflow-hidden mb-4">
        <input
          type="text"
          value={password}           // controlled: driven by state
          className="outline-none w-full py-1 px-3"
          placeholder="Password"
          readOnly                   // user can't edit it
          ref={passwordRef}          // attach DOM ref
        />
        <button
          onClick={copyPasswordToClipboard}
          className='outline-none bg-blue-700 text-white px-3 py-0.5 shrink-0'
        >
          {copied ? "Copied" : "Copy"}  {/* dynamic label */}
        </button>
      </div>

      {/* Controls row */}
      <div className='flex text-sm gap-x-2'>
        
        {/* Length slider */}
        <div className='flex items-center gap-x-1'>
          <input
            type="range"
            min={6}
            max={100}
            value={length}
            className='cursor-pointer'
            onChange={(e) => { setLength(e.target.value) }}
          />
          <label>Length: {length}</label>
        </div>

        {/* Numbers checkbox */}
        <div className="flex items-center gap-x-1">
          <input
            type="checkbox"
            defaultChecked={numberAllowed}
            id="numberInput"
            onChange={() => {
              setNumberAllowed((prev) => !prev); // functional updater (safe with batching)
            }}
          />
          <label htmlFor="numberInput">Numbers</label>
        </div>

        {/* Special characters checkbox */}
        <div className="flex items-center gap-x-1">
          <input
            type="checkbox"
            defaultChecked={charAllowed}
            id="characterInput"
            onChange={() => {
              setCharAllowed((prev) => !prev)
            }}
          />
          <label htmlFor="characterInput">Characters</label>
        </div>
      </div>
    </div>
  )
}

export default App
```

---

> **Key Takeaway:**  
> This project is a perfect example of React hooks working together as a system:
> - `useState` holds the data
> - `useRef` bridges React and the real DOM
> - `useCallback` keeps function references stable (memoization)
> - `useEffect` reacts to changes and drives side effects
>
> Each hook has a clear, non-overlapping responsibility. Understanding *why* each one is needed (not just what it does) is the hallmark of a strong React developer.


<!-- In this lec, we will make a project and study documentation.
This is a passowrdGenerator application.

Concept of memoization:React gives hooks in which we can optimize things. 

create a vite project named "05passwordGenerator" and integrate TailwindCSS.

useCallback hook: https://react.dev/reference/react/useCallback

useEffect hook: https://react.dev/reference/react/useEffect

```javascriptreact
import { useState, useCallback, useEffect, useRef } from 'react'



function App() {
  const [length, setLength] = useState(8)
  const [numberAllowed, setNumberAllowed] = useState(false);
  const [charAllowed, setCharAllowed] = useState(false)
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false);

  //useRef hook
  const passwordRef = useRef(null)

  const passwordGenerator = useCallback(() => {
    let pass = ""
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    if (numberAllowed) str += "0123456789"
    if (charAllowed) str += "!@#$%^&*-_+=[]{}~`"

    for (let i = 1; i <= length; i++) {
      let char = Math.floor(Math.random() * str.length)     // we added +1 to avoid zeroth value
      pass += str.charAt(char)

    }

    setPassword(pass)


  }, [length, numberAllowed, charAllowed, setPassword])

  const copyPasswordToClipboard = useCallback(() => {
    passwordRef.current?.select();
    passwordRef.current?.setSelectionRange(0, 100);
    window.navigator.clipboard.writeText(password);
    setCopied(true);

    setTimeout(() => setCopied(false), 1000);
  }, [password])

  useEffect(() => {
    passwordGenerator()
  }, [length, numberAllowed, charAllowed, passwordGenerator])
  return (

    <div className="w-full max-w-md mx-auto shadow-md rounded-lg px-4 py-3 my-8 bg-gray-800 text-orange-500">
      <h1 className='text-white text-center my-3'>Password generator</h1>
      <div className="flex shadow rounded-lg overflow-hidden mb-4">
        <input
          type="text"
          value={password}
          className="outline-none w-full py-1 px-3"
          placeholder="Password"
          readOnly
          ref={passwordRef}
        />
        <button
          onClick={copyPasswordToClipboard}
          className='outline-none bg-blue-700 text-white px-3 py-0.5 shrink-0'
        >{copied ? "Copied" : "Copy"}</button>

      </div>
      <div className='flex text-sm gap-x-2'>
        <div className='flex items-center gap-x-1'>
          <input
            type="range"
            min={6}
            max={100}
            value={length}
            className='cursor-pointer'
            onChange={(e) => { setLength(e.target.value) }}
          />
          <label>Length: {length}</label>
        </div>
        <div className="flex items-center gap-x-1">
          <input
            type="checkbox"
            defaultChecked={numberAllowed}
            id="numberInput"
            onChange={() => {
              setNumberAllowed((prev) => !prev);
            }}
          />
          <label htmlFor="numberInput">Numbers</label>
        </div>
        <div className="flex items-center gap-x-1">
          <input
            type="checkbox"
            defaultChecked={charAllowed}
            id="characterInput"
            onChange={() => {
              setCharAllowed((prev) => !prev)
            }}
          />
          <label htmlFor="characterInput">Characters</label>
        </div>
      </div>
    </div>

  )
}

export default App
```


```javascriptreact
 window.navigator.clipboard.writeText(password); // 

This window is not available in nextjs, why?
```

Make detailed notes in english, using the above code, make it detailed and explain everything never miss any point -->