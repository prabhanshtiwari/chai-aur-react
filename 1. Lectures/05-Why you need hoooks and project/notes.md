# Why You Need Hooks and Project — Notes

## 1. Project Setup

- Tool: **Vite** (fast React project scaffolder)
- Command: `npm create vite@latest`
- Project name: `02counter`
- Framework: **React**, Variant: **JavaScript**

```bash
cd 02counter
npm install
npm run dev
# Runs at http://localhost:5173/
```

---

## 2. The Problem — Variables Don't Update the UI

### Initial `App.jsx` (broken):

```jsx
function App() {
  let counter = 5;

  function increaseValue() {
    console.log("Value increased", counter);
    counter = counter + 1;
  }

  function decreaseValue() {
    console.log("Value decreased", counter);
    counter = counter - 1;
  }

  return (
    <>
      <h1>Chai aur React</h1>
      <h1>Counter value: {counter}</h1>
      <button onClick={increaseValue}>Increase value</button>
      <br />
      <button onClick={decreaseValue}>Decrease value</button>
    </>
  );
}
```

### Why this fails:

- The value of `counter` **does change** in memory (visible in `console.log`)
- But the **UI does NOT re-render** — the displayed value stays frozen at `5`
- React does **not** watch plain JavaScript variables for changes
- React only re-renders the UI when it is explicitly told that state has changed

> **Key Rule:** React reacts to changes in **state**, not in plain variables.

---

## 3. The Solution — React Hooks

### What are Hooks?

- **Hooks** are special functions provided by React that give functional components access to React features like state, lifecycle, context, etc.
- Every hook has a **specific purpose**
- Hooks allow React to **control UI updates**

### Common Hooks:

| Hook | Purpose |
|------|---------|
| `useState` | Manage local component state |
| `useEffect` | Handle side effects (API calls, timers, etc.) |
| `useContext` | Access context values |
| `useReducer` | Manage complex state logic |
| `useInsertionEffect` | For CSS-in-JS libraries (rare) |

---

## 4. `useState` Hook — Deep Dive

### Syntax:

```js
const [stateVariable, setterFunction] = useState(initialValue);
```

- `useState` is imported from React: `import { useState } from "react"`
- It returns an **array of two elements**:
  1. **Current state value** (`counter`) — the value React is tracking
  2. **Setter function** (`setCounter`) — the function you call to update state
- `initialValue` is the value the state starts with (e.g., `0`)

### How it works internally:

1. React stores the state value internally (not just in a JS variable)
2. When you call `setCounter(newValue)`, React:
   - Updates the stored state value
   - **Triggers a re-render** of the component
   - The UI reflects the new value

---

## 5. Fixed `App.jsx` — Using `useState`

```jsx
import { useState } from "react";

function App() {
  const [counter, setCounter] = useState(0);

  return (
    <>
      <h1>Chai aur React</h1>
      <h1>Counter value: {counter}</h1>

      <button onClick={() => setCounter(counter + 1)}>Increase value</button>
      <br />
      <button onClick={() => setCounter(counter - 1)}>Decrease value</button>
    </>
  );
}

export default App;
```

### What changed:

- `let counter = 5` → `const [counter, setCounter] = useState(0)`
- Manual increment/decrement functions → inline arrow functions in `onClick`
- Calling `setCounter(...)` tells React to update state AND re-render the UI

---

## 6. Assignment — Add Boundary Conditions

**Requirements:**
- Counter should **not go below 0**
- Counter should **not go above 20** (implied from solution)

### Assignment Solution:

```jsx
import { useState } from "react";

function App() {
  const [counter, setCounter] = useState(0);

  return (
    <>
      <h1>Chai aur React</h1>
      <h1>Counter value: {counter}</h1>

      <button onClick={() => { if (counter < 20) setCounter(counter + 1) }}>
        Increase value
      </button>
      <br />
      <button onClick={() => { if (counter > 0) setCounter(counter - 1) }}>
        Decrease value
      </button>
    </>
  );
}

export default App;
```

### Logic explained:

- `if (counter < 20) setCounter(counter + 1)` → Only increments if counter is below 20
- `if (counter > 0) setCounter(counter - 1)` → Only decrements if counter is above 0
- This prevents the counter from going **below 0** or **above 20**

---

## 7. Key Takeaways

- Plain JS variables do **not** trigger UI re-renders in React
- React controls when and how the UI updates
- `useState` is the foundational hook for managing **reactive data** in components
- Always use the **setter function** (e.g., `setCounter`) to update state — never mutate the state variable directly
- `useState` can hold any value: numbers, strings, booleans, arrays, objects

---

## 8. Quick Reference

```jsx
import { useState } from "react";

// Declaration
const [value, setValue] = useState(initialValue);

// Reading state
<p>{value}</p>

// Updating state (triggers re-render)
setValue(newValue);

// Conditional update
if (condition) setValue(newValue);
```

<!-- # Why you need hooks and project

We will make a simple counter project.

First, create project using vite: 02counter

prabhanshtiwari@DESKTOP-8BI65Q2:~/mywork/chai-aur-react/1. Lectures/05-Why you need hoooks and project/code$ npm create vite@latest

> npx
> "create-vite"

│
◇  Project name:
│  02counter
│
◇  Select a framework:
│  React
│
◇  Select a variant:
│  JavaScript
│
◇  Install with npm and start now?
│  No
│
◇  Scaffolding project in /home/prabhanshtiwari/mywork/chai-aur-react/1. Lectures/05-Why you need hoooks and project/code/02counter...
│
└  Done. Now run:

  cd 02counter
  npm install
  npm run dev

prabhanshtiwari@DESKTOP-8BI65Q2:~/mywork/chai-aur-react/1. Lectures/05-Why you need hoooks and project/code$ cd 02counter
  npm install
  npm run dev

added 183 packages, and audited 184 packages in 2m

47 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities

> 02counter@0.0.0 dev
> vite


  VITE v8.0.0  ready in 3379 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

---

App.jsx:
```

function App() {
  let counter = 5;

  function increaseValue() {
    console.log("Value increased", counter);
    counter = counter + 1;

  }

  function decreaseValue() {
    console.log("Value decreased", counter);
    counter = counter - 1;
  }


  return (
    <>
      <h1>Chai aur React</h1>
      <h1>Counter value: {counter}</h1>

      <button onClick={increaseValue}>Increase value</button>
      <br />
      <button onClick={decreaseValue}>Decrease value</button>
    </>
  )
}

export default App
```
Here, the value of counter is changing but it is not reflecting in Ui. Value of variable is changing but not reflecting in UI

How to fix this?
Note: React react on the changes in the value of the variable.

React provides methods called hooks which updates data in application.
There are lots of hooks like: useContext, useState, useEffect, useReducer, useInsertionEffect, 

Every hook has a special task.
React control UI updation.

App.jsx:
```
import { useState } from "react";

function App() {

  const [counter, setCounter] = useState(0);

  return (
    <>
      <h1>Chai aur React</h1>
      <h1>Counter value: {counter}</h1>

      <button onClick={() => setCounter(counter + 1)}>Increase value</button>
      <br />
      <button onClick={() => setCounter(counter - 1)}>Decrease value</button>
    </>
  )
}

export default App
```
explain useState hook and its use...

asssignment: create a method to decrease value so that it doesn't go below 0.

assignment:
```
import { useState } from "react";

function App() {

  const [counter, setCounter] = useState(0);

  return (
    <>
      <h1>Chai aur React</h1>
      <h1>Counter value: {counter}</h1>

      <button onClick={() => { if (counter < 20) setCounter(counter + 1) }}>Increase value</button>
      <br />
      <button onClick={() => { if (counter > 0) setCounter(counter - 1) }}>Decrease value</button>
    </>
  )
}

export default App
```


 -->
