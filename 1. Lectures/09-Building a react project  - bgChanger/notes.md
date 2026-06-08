# React Project 4 — Background Color Changer (`04bgChanger`)

> **Concepts Covered:** `useState`, inline styles, `onClick` handlers, Tailwind CSS, Vite setup
> **Project Type:** Beginner / Concept-building project

---

## Why This Project?

- After learning React basics (state, props), the next step is **building back-to-back projects** to gain confidence.
- Even small projects matter — *"every brick, no matter how small, builds the house."*
- Starting simple is intentional. More complex projects on the English channel require these fundamentals.
- Along the way you may pick up **interview tips**, **good coding practices**, and **CSS patterns**.
- This is officially **Project #4** (Counter was also a project — don't discount early work).

---

## What the Project Does

A **full-screen background color changer**:
- The entire screen is a colored `div`.
- A **fixed bottom bar** contains color buttons.
- Clicking a button changes the background color of the screen to that color.
- Colors used: Red, Green, Blue, Grey, Yellow, Pink, Purple, Olive, White, Black (11 colors total).

---

## Project Setup

### 1. Create Vite Project

```bash
npm create vite@latest
# Project name: 04bgChanger
# Framework: React
# Variant: JavaScript

cd 04bgChanger
npm install
```

### 2. Install & Configure Tailwind CSS

```bash
npm install -D tailwindcss
npx tailwindcss init
```

**`tailwind.config.js`** — Update `content` array to include your source files:
```js
content: ["./index.html", "./src/**/*.{js,jsx}"]
```

**`index.css`** (or your main CSS file) — Add the three Tailwind directives at the top:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 3. Cleanup

Remove unnecessary boilerplate:
- Delete `App.css` (not needed)
- Delete everything inside the `assets/` folder
- In `App.jsx`, clear out the return statement's `div` content
- Keep `index.css` (needed for Tailwind directives)

---

## Building the App

### State Setup

```jsx
const [color, setColor] = useState("olive")
```

- `color` — holds the current background color (a string).
- `setColor` — updates the state and triggers a re-render.
- **Default value is `"olive"`** — that's why the screen is olive on first load / after refresh (see interview question below).
- Naming convention: state variable → `color`, setter → `setColor` ✅ (good practice).

---

### Full `App.jsx`

```jsx
import { useState } from "react"

function App() {
  const [color, setColor] = useState("olive")

  return (
    <>
      <div
        className="w-full h-screen duration-200"
        style={{ backgroundColor: color }}
      >
        <div className="fixed flex flex-wrap justify-center bottom-12 inset-x-0 px-2">
          <div className="flex flex-wrap justify-center gap-3 shadow-lg bg-white px-3 py-2 rounded">

            <button
              onClick={() => setColor("red")}
              className="outline-none px-4 py-1 rounded-full text-white shadow-lg"
              style={{ backgroundColor: "red" }}
            >Red</button>

            <button
              onClick={() => setColor("green")}
              className="outline-none px-4 py-1 rounded-full text-white shadow-lg"
              style={{ backgroundColor: "green" }}
            >Green</button>

            <button
              onClick={() => setColor("blue")}
              className="outline-none px-4 py-1 rounded-full text-white shadow-lg"
              style={{ backgroundColor: "blue" }}
            >Blue</button>

            {/* Add more buttons: grey, yellow, pink, purple, white, black — your homework */}

          </div>
        </div>
      </div>
    </>
  )
}

export default App
```

---

## Code Breakdown — Element by Element

### Outer `div` (Full Screen Background)

```jsx
<div
  className="w-full h-screen duration-200"
  style={{ backgroundColor: color }}
>
```

| Tailwind Class | What it does |
|---|---|
| `w-full` | Width: 100% |
| `h-screen` | Height: 100vh (full viewport height) |
| `duration-200` | CSS transition duration of 200ms (smooth color change) |

- **Inline style** `style={{ backgroundColor: color }}` — injects the state variable `color` as the background.
- In React inline styles: properties use **camelCase** → `backgroundColor` (not `background-color`).
- Syntax is `style={{ propertyName: "value" }}` — outer `{}` is JSX expression, inner `{}` is the JS object.
- To inject a variable: since you're already inside `{}`, just write the variable name directly — **no extra `{}` needed**.

### Fixed Bottom Bar (Outer Positioning Div)

```jsx
<div className="fixed flex flex-wrap justify-center bottom-12 inset-x-0 px-2">
```

| Tailwind Class | What it does |
|---|---|
| `fixed` | `position: fixed` — stays at the bottom regardless of scroll |
| `flex flex-wrap` | Flexbox with wrapping (buttons wrap to next line on small screens) |
| `justify-center` | Centers buttons horizontally |
| `bottom-12` | 48px from the bottom of the viewport |
| `inset-x-0` | Sets `left: 0` and `right: 0` (full width from left to right edge) |
| `px-2` | Horizontal padding of 8px |

> **Note:** `inset-x-0` is a Tailwind shorthand for setting both `left` and `right` to 0 simultaneously.

### Inner Bar (Button Container)

```jsx
<div className="flex flex-wrap justify-center gap-3 shadow-lg bg-white px-3 py-2 rounded">
```

| Tailwind Class | What it does |
|---|---|
| `flex flex-wrap` | Flexbox with wrapping |
| `justify-center` | Centers buttons |
| `gap-3` | Consistent gap between all buttons |
| `shadow-lg` | Large drop shadow |
| `bg-white` | White background for the pill/bar |
| `px-3 py-2` | Horizontal padding 12px, vertical padding 8px |
| `rounded` | Rounded corners |

### Buttons

```jsx
<button
  onClick={() => setColor("red")}
  className="outline-none px-4 py-1 rounded-full text-white shadow-lg"
  style={{ backgroundColor: "red" }}
>Red</button>
```

| Tailwind Class | What it does |
|---|---|
| `outline-none` | Removes default browser focus outline |
| `px-4 py-1` | Horizontal padding 16px, vertical 4px |
| `rounded-full` | Fully rounded / pill shape |
| `text-white` | White text color |
| `shadow-lg` | Drop shadow on button |

- Button background color is set via **inline style** (`style={{ backgroundColor: "red" }}`) so each button visually shows its own color.
- The **text content** (`Red`, `Green`, `Blue`) is hardcoded — this is intentional for simplicity.

---

## Key Concept — Why `onClick={() => setColor("red")}` and NOT `onClick={setColor("red")}`

This is a **critical interview concept** and a common React mistake.

### The Problem with `onClick={setColor("red")}`

- `onClick` expects a **function reference** — something it will *call later* when the user clicks.
- `setColor("red")` **immediately executes** `setColor` during render and passes its **return value** (which is `undefined`) to `onClick`.
- So `onClick` receives `undefined`, not a function. It won't work correctly.

### The Fix — Wrap in an Arrow Function

```jsx
onClick={() => setColor("red")}
```

- `() => setColor("red")` is an **arrow function** (a new function definition).
- `onClick` receives this function and **calls it only when the button is clicked**.
- Inside the arrow function, `setColor("red")` is called with the desired argument.

### Why not just `onClick={setColor}`?

```jsx
onClick={setColor}  // This works BUT...
```

- This passes the function reference correctly.
- **Problem:** You can't pass arguments this way. `setColor` will receive the click `Event` object as its argument instead of `"red"`.
- So if you need to pass a specific value (like `"red"`), you **must** wrap it in an arrow function callback.

### Summary

| Syntax | What happens | Correct? |
|---|---|---|
| `onClick={setColor("red")}` | Executes immediately on render, passes return value | ❌ |
| `onClick={setColor}` | Passes function ref, but can't pass "red" as arg | ❌ (for this use case) |
| `onClick={() => setColor("red")}` | Passes a new function that calls `setColor("red")` on click | ✅ |

> This is **not a React-specific issue** — it's JavaScript syntax. Understanding this is key for interviews.

---

## Interview Question Embedded in the Project

**Q: When you refresh the page, why does the background show `olive` instead of `blue` (the last color button added)?**

**A:** Because the **initial/default state value** is `"olive"`:
```jsx
const [color, setColor] = useState("olive")
```
React initializes state from `useState()` on every fresh page load. It has no memory of what color was showing before the refresh (no persistence). The state always resets to the default value — `"olive"` in this case.

---

## Tailwind Inline Styles vs Tailwind Classes — When to Use Which?

| Scenario | Approach |
|---|---|
| Static, known color (e.g., white background on bar) | Tailwind class (`bg-white`) |
| Dynamic, state-driven color (e.g., screen background changes) | Inline style (`style={{ backgroundColor: color }}`) |
| Button's own fixed color for visual identification | Inline style (`style={{ backgroundColor: "red" }}`) |

> You **can** use Tailwind classes for static colors and inline styles for dynamic ones — mixing both is perfectly valid.

---

## Your Homework

Add the remaining color buttons to the button bar. Each one follows the exact same pattern:

```jsx
<button
  onClick={() => setColor("yellow")}
  className="outline-none px-4 py-1 rounded-full text-white shadow-lg"
  style={{ backgroundColor: "yellow" }}
>Yellow</button>
```

Colors to add: **Grey, Yellow, Pink, Purple, White, Black** (and any others you want).

---

## Key Takeaways

1. **`useState`** is used whenever a value needs to be reflected in the UI — here, the color string.
2. **Inline styles** in React use camelCase and a JS object: `style={{ backgroundColor: color }}`.
3. **`onClick` needs a function, not a value** — always wrap setter calls with arguments inside an arrow function `() => setColor("red")`.
4. **Default state value** is what shows on initial load / refresh — not whatever was last clicked.
5. Tailwind's `fixed`, `inset-x-0`, `bottom-12` combo is a reliable pattern for a **fixed bottom bar**.
6. `duration-200` on the background div gives a **smooth color transition animation** for free.
7. Even small, "childish" projects build real understanding — don't skip them.

<!-- 
make a vite project named "04bgChanger" and integrate tailwindCSS.

App.jsx:
```
import { useState } from "react"


function App() {
  const [color, setColor] = useState("olive")

  return (
    <>
      <div className="w-full h-screen duration-200"
        style={{ backgroundColor: color }}
      >
        <div className="fixed flex flex-wrap justify-center bottom-12 inset-x-0 px-2">
          <div className="flex flex-wrap justify-center gap-3 shadow-lg bg-white px-3 py-2 rounded">
            <button
              onClick={() => setColor("red")}
              className="outline-none px-4 py-1 rounded-full text-white shadow-lg"
              style={{backgroundColor: "red"}}
            >Red</button>
            <button
              onClick={() => setColor("green")}
              className="outline-none px-4 py-1 rounded-full text-white shadow-lg"
              style={{ backgroundColor: "green" }}
            >Green</button>
            <button
              onClick={() => setColor("blue")}
              className="outline-none px-4 py-1 rounded-full text-white shadow-lg"
              style={{ backgroundColor: "blue" }}
            >Blue</button>
            
          </div>
        </div>
      </div>

    </>
  )
}

export default App
``` -->
