# React Re-Rendering & State — When Does a Component Re-Render?

> **Source:** Chai aur Code (Hindi tutorial by Hitesh Choudhary)
> **Topic:** React Interview Question — When does a component re-render? (Primitive vs Non-Primitive state values, Pass by Value vs Pass by Reference)

---

## 1. Why This Question Is Asked in React Interviews

- This question **appears to be a React question** but is actually a **JavaScript question** disguised as one.
- Companies ask it because most developers skip JavaScript fundamentals and jump directly into React.
- If your JS foundation is weak → you will introduce bugs in production that take days to fix.
- Companies prefer not to hire candidates with a weak foundation, as project bugs become inevitable.

> **Key insight:** React is just JavaScript. If you understand JS data types deeply, you automatically understand React's re-rendering behavior.

---

## 2. Project Setup

The demo uses a basic **Vite + React** project.

```jsx
import { useState } from 'react'

function App() {
  const [value, setValue] = useState(1); // initial state = 1

  const clickMe = () => {
    console.log("logged");
  }

  console.log("App rendered", Math.random()); // to track re-renders

  return (
    <div>
      <p>{value}</p>
      <button onClick={clickMe}>Multiply by 5</button>
    </div>
  )
}

export default App
```

**Why `Math.random()` in the console log?**
- So every time the app re-renders, you see a **different random number** in the console.
- This makes it easy to confirm whether a re-render actually happened (you'd see a new log line with a new number).
- Without it, repeated identical log messages could be mistaken for a single render.

---

## 3. React Strict Mode — Why Does the App Render Twice?

On first load, you may see the `"App rendered"` log **twice**.

- This is because the app runs in **React Strict Mode** (default in Vite + React).
- Strict Mode intentionally double-invokes certain functions (like render) during **development only** to help detect side effects.
- In **production**, this double rendering does **not** happen.
- This is not a bug — it's intentional behavior by React for dev-time safety checks.

---

## 4. Experiment 1 — Function with No State Change

```jsx
const clickMe = () => {
  console.log("logged");
  // No setState call here
}
```

**Question:** Does clicking the button re-render the App?

**Answer:** ❌ No re-render.

**Why?**
- `clickMe` only logs to the console. It does **not** update any state.
- React re-renders a component **only** when its state (or props) changes.
- Calling a function alone does nothing to the component's render cycle.

---

## 5. Experiment 2 — Setting State to a New Value

```jsx
const [value, setValue] = useState(1);

const clickMe = () => {
  setValue(value + 1); // state changes each time
}
```

**Question:** Does clicking the button re-render the App?

**Answer:** ✅ Yes, re-render happens every time.

**Why?**
- Every click changes `value` to a new number (2, 3, 4...).
- Since the state value changes, React detects this and triggers a re-render.
- This confirms: **state change → re-render**.

---

## 6. Experiment 3 — Setting State to the SAME Value (Primitive)

```jsx
const [value, setValue] = useState(1);

const clickMe = () => {
  setValue(1); // always setting the same value
}
```

**Question:** Does clicking the button re-render the App after the first click?

**Answer:**
- **First click:** ✅ Re-render happens (React re-renders once as a "safety check").
- **Second click onwards:** ❌ No re-render.

**Why?**
- React uses **Object.is()** comparison internally to check if the new state value is the same as the old one.
- `1 === 1` → same value → React bails out of re-rendering after the initial safety re-render.
- This is React's **bailout optimization** for primitive values.

> **Note on the first re-render after clicking:** React does re-render once even when the value is the same, as a "safety re-render." But from the second click onward, it stops re-rendering.

---

## 7. Experiment 4 — Setting State to the SAME Object (Non-Primitive)

```jsx
const [value, setValue] = useState({ value: 0 });

const clickMe = () => {
  setValue({ value: 0 }); // "same" object — or is it?
}
```

**Question:** Does clicking the button re-render the App?

**Answer:** ✅ Yes — **re-renders every single time**, infinitely.

**Why?** This leads us into the most important concept of this video.

---

## 8. The Core JavaScript Concept — Primitive vs Non-Primitive Data Types

This is the **real** reason for the different re-render behavior.

### Primitive Data Types
- `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`
- Stored and compared **by value**
- `1 === 1` → `true` (same value)
- `"hello" === "hello"` → `true`

### Non-Primitive Data Types (Reference Types)
- `object`, `array`, `function`
- Stored and compared **by reference** (memory address), not by value
- Two objects with identical contents are **NOT equal** in JavaScript:

```js
{ value: 0 } === { value: 0 }  // false ❌
[] === []                        // false ❌
```

- Every time you write `{ value: 0 }`, JavaScript creates a **new object in memory** at a new memory address.
- Even if the contents look identical, they are different references (different boxes in memory).

### The Box Analogy
> Think of each object as a **box**. The contents of two boxes might be the same, but they are still two separate boxes. JavaScript compares the boxes (references), not what's inside them.

This is why:
```jsx
setValue({ value: 0 });
```
...always passes a **brand new object** to `setValue`. React sees a new reference each time → treats it as a new value → **triggers a re-render every time**.

---

## 9. Why `const` Arrays/Objects Can Still Be Mutated

This is a common confusion point that the tutorial addresses:

```js
const arr = [1, 2, 3];
arr.push(4); // This works! Even though arr is const.
```

- `const` prevents **reassignment** of the variable (the reference/pointer).
- It does **not** prevent mutation of the object/array the variable points to.
- When you mutate the contents, the memory address (reference) stays the same.
- This is pass-by-reference behavior in action.

---

## 10. Production Caveat — The `useEffect` Dependency Array Problem

This is where the non-primitive re-render behavior causes **real production performance issues**.

### The Problem

```jsx
useEffect(() => {
  // some side effect
}, [value]); // value = { value: 0 } — an object
```

- If `value` is an **object**, this `useEffect` will run **on every render**.
- Because every render creates a new object reference, React thinks the dependency changed.
- This can cause **infinite loops** or excessive API calls, tanking app performance.

### The Fix

Instead of depending on the entire object, depend on a **specific primitive property** of the object:

```jsx
useEffect(() => {
  // some side effect
}, [value.value]); // ✅ now comparing a primitive number, not an object reference
```

- `value.value` is a **number** (primitive) → compared by value → React correctly detects if it actually changed.
- This is a **critical production optimization** pattern.

> You may not fully appreciate this until you face an infinite re-render in a real project — then it will click immediately.

---

## 11. How React Compares State Values Internally

React uses **`Object.is()`** to compare old and new state values:

| Old Value | New Value | `Object.is()` Result | Re-render? |
|---|---|---|---|
| `1` | `1` | `true` (same) | ❌ No (after 1st safety render) |
| `1` | `2` | `false` (different) | ✅ Yes |
| `{ value: 0 }` | `{ value: 0 }` | `false` (different references) | ✅ Yes (always) |
| `[]` | `[]` | `false` (different references) | ✅ Yes (always) |

---

## 12. Summary — When Does a Component Re-Render?

| Scenario | Re-renders? |
|---|---|
| Function called, no state change | ❌ No |
| State set to a **new primitive value** | ✅ Yes |
| State set to the **same primitive value** | ❌ No (after initial safety render) |
| State set to a **new object/array** (even with same contents) | ✅ Yes — every time |
| `useEffect` dependency is an **object** reference | ✅ Runs every render (bad!) |
| `useEffect` dependency is a **primitive property** of an object | ✅ Only when that value changes |

---

## 13. Key Takeaways

1. **React re-renders are driven by state/prop changes**, but what counts as a "change" depends on JavaScript's comparison rules.

2. **Primitives** are compared by value — same value means no re-render.

3. **Non-primitives (objects, arrays)** are compared by reference — a new object literal `{}` is always a new reference, always triggers re-render.

4. **Never put object/array references directly in `useEffect` dependency arrays** — always drill down to a specific primitive value inside the object.

5. **This is a JavaScript concept first, React second.** React doesn't do anything special — it just uses `Object.is()`, which is standard JS behavior.

6. **In interviews**, questions about re-rendering are really testing your understanding of JS data types, pass-by-value, and pass-by-reference.

7. **Strict Mode double-renders** are only in development — don't be confused by seeing your component render twice on mount.

---

## 14. Code Reference

```jsx
import { useState, useEffect } from 'react'

function App() {

  // Primitive state — same value = no re-render after first
  const [value, setValue] = useState(1);

  // Non-primitive state — same-looking object = re-renders every time
  // const [value, setValue] = useState({ value: 0 });

  const clickMe = () => {
    // Experiment 1: no state change — no re-render
    // console.log("logged");

    // Experiment 2: new primitive value — re-renders
    // setValue(value + 1);

    // Experiment 3: same primitive value — no re-render (after first)
    // setValue(1);

    // Experiment 4: same-looking object — re-renders every time
    // setValue({ value: 0 });
  }

  console.log("App rendered", Math.random());

  // Production pattern — depend on primitive, not object
  useEffect(() => {
    // runs only when value.value actually changes
  }, [value.value]); // ✅ correct

  // useEffect(() => {}, [value]); // ❌ runs every render if value is an object

  return (
    <div>
      <p>{typeof value === 'object' ? value.value : value}</p>
      <button onClick={clickMe}>Click Me</button>
    </div>
  )
}

export default App
```

---

