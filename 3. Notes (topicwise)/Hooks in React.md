# ⚛️ React Hooks — Complete Notes for Placements

> **Who is this for?** Someone who knows zero about hooks and wants to understand everything — from what a hook even is, to using every major hook confidently in interviews and projects.

---

## 📌 Table of Contents

1. [What are Hooks?](#1-what-are-hooks)
2. [Why were Hooks introduced?](#2-why-were-hooks-introduced)
3. [Rules of Hooks](#3-rules-of-hooks)
4. [useState](#4-usestate)
5. [useEffect](#5-useeffect)
6. [useRef](#6-useref)
7. [useContext](#7-usecontext)
8. [useReducer](#8-usereducer)
9. [useCallback](#9-usecallback)
10. [useMemo](#10-usememo)
11. [useLayoutEffect](#11-uselayouteffect)
12. [useId](#12-useid)
13. [Custom Hooks](#13-custom-hooks)
14. [Quick Revision Cheatsheet](#14-quick-revision-cheatsheet)
15. [Common Interview Questions](#15-common-interview-questions)

---

## 1. What are Hooks?

**Hooks are special functions in React that let you "hook into" React features inside functional components.**

Before hooks existed (before React 16.8), if you wanted to use features like:
- Storing data (state)
- Running code when a component loads
- Accessing the DOM directly

...you HAD to write a **Class Component**. Class components were complex, hard to read, and hard to reuse logic from.

Hooks solved this. Now you can do everything in simple functions.

```jsx
// A simple functional component using a hook
function Counter() {
  const [count, setCount] = useState(0); // 👈 This is a hook

  return <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>;
}
```

**Simple rule:** Any function that starts with `use` is a hook. Example: `useState`, `useEffect`, `useRef`, etc.

---

## 2. Why were Hooks introduced?

### Problems with Class Components:

| Problem | Explanation |
|---|---|
| **Complex syntax** | You had to write `this.state`, `this.setState`, bind methods, etc. |
| **Hard to reuse logic** | Sharing stateful logic between components needed HOCs or Render Props — both messy |
| **Confusing `this`** | JavaScript's `this` keyword caused bugs |
| **Giant lifecycle methods** | Related logic was split across `componentDidMount`, `componentDidUpdate`, `componentWillUnmount` |

### What Hooks gave us:
- Write components as simple functions
- Share logic easily via **custom hooks**
- Group related logic together
- No more `this`

> 💡 **React 16.8 (Feb 2019)** introduced hooks. Class components still work but are rarely written in new code today.

---

## 3. Rules of Hooks

These are strict rules. Break them → bugs.

### Rule 1: Only call hooks at the top level
```jsx
// ✅ CORRECT
function MyComponent() {
  const [name, setName] = useState("Raj");
  const [age, setAge] = useState(21);
}

// ❌ WRONG — never inside if/else, loops, or nested functions
function MyComponent() {
  if (someCondition) {
    const [name, setName] = useState("Raj"); // BUG!
  }
}
```

**Why?** React tracks hooks by the order they are called. If you put hooks inside conditions, the order can change between renders and React gets confused.

### Rule 2: Only call hooks inside React functions
```jsx
// ✅ CORRECT — inside a component
function MyComponent() {
  const [x, setX] = useState(0);
}

// ✅ CORRECT — inside a custom hook
function useMyHook() {
  const [x, setX] = useState(0);
}

// ❌ WRONG — inside a regular JS function
function normalFunction() {
  const [x, setX] = useState(0); // BUG!
}
```

---

## 4. useState

### What is it?
`useState` lets you add **state** to a functional component. State is simply **data that can change over time**, and when it changes, React re-renders the component.

### Syntax
```jsx
const [stateVariable, setterFunction] = useState(initialValue);
```

### Simple Counter Example
```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0); // count starts at 0

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increase</button>
      <button onClick={() => setCount(count - 1)}>Decrease</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### State with strings
```jsx
function NameInput() {
  const [name, setName] = useState("");

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Enter your name"
    />
  );
}
```

### State with objects
```jsx
function UserForm() {
  const [user, setUser] = useState({ name: "", age: "" });

  const updateName = (e) => {
    setUser({ ...user, name: e.target.value }); // spread old values, update name
  };

  return <input value={user.name} onChange={updateName} />;
}
```

> ⚠️ **Important:** When updating object state, always spread the old state first (`...user`). Otherwise you lose the other fields.

### Functional Updater Pattern
```jsx
// When new state depends on old state, use a function
setCount(prevCount => prevCount + 1);

// Why? If you call setCount multiple times quickly:
// setCount(count + 1) ← uses stale value (BAD)
// setCount(prev => prev + 1) ← always uses latest value (GOOD)
```

### State Batching (React 18+)
React batches multiple state updates in the same event handler into a single re-render for performance.
```jsx
function handleClick() {
  setCount(c => c + 1);
  setName("Raj");
  // React does ONE re-render for both — not two
}
```

### Where is useState used?
- Form inputs
- Toggle buttons (show/hide)
- Counters
- Modal open/close state
- Any UI data that changes

---

## 5. useEffect

### What is it?
`useEffect` lets you run **side effects** in your component. Side effects are things that happen "outside" of rendering — like:
- Fetching data from an API
- Setting up event listeners
- Updating the document title
- Setting up timers

### Syntax
```jsx
useEffect(() => {
  // your side effect code here

  return () => {
    // cleanup (optional) — runs before the next effect or when component unmounts
  };
}, [dependency1, dependency2]); // dependency array
```

### The Dependency Array — This is key to understanding useEffect

| Dependency Array | When does the effect run? |
|---|---|
| No array `useEffect(() => {})` | Runs after **every** render |
| Empty array `useEffect(() => {}, [])` | Runs **only once** — on mount (like componentDidMount) |
| With values `useEffect(() => {}, [count])` | Runs on mount + whenever `count` changes |

### Example 1: Run once on mount (fetch data)
```jsx
import { useState, useEffect } from "react";

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []); // [] = run only once when component mounts

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}
```

### Example 2: Run when a dependency changes
```jsx
function SearchResults({ query }) {
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query) {
      fetch(`/api/search?q=${query}`)
        .then(res => res.json())
        .then(data => setResults(data));
    }
  }, [query]); // re-runs every time 'query' changes

  return <div>{results.length} results</div>;
}
```

### Example 3: Cleanup — Event Listeners
```jsx
function WindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize); // add listener

    return () => {
      window.removeEventListener("resize", handleResize); // cleanup!
    };
  }, []); // only add/remove once

  return <p>Window width: {width}px</p>;
}
```

> ⚠️ **Why cleanup?** If you don't remove event listeners or clear timers, they keep running even after the component is gone from the screen → memory leak.

### Example 4: Update document title
```jsx
function PageTitle({ title }) {
  useEffect(() => {
    document.title = title;
  }, [title]); // runs whenever title prop changes
}
```

### Where is useEffect used?
- API calls / data fetching
- Subscriptions (WebSocket, Firebase)
- DOM manipulation
- Setting up / clearing timers
- Syncing with external systems

---

## 6. useRef

### What is it?
`useRef` gives you a **mutable box** that persists across renders. It has two main uses:

1. **Access a DOM element directly** (like `document.getElementById` in React)
2. **Store a value that doesn't cause re-render when changed**

### Syntax
```jsx
const myRef = useRef(initialValue);
// Access value: myRef.current
```

### Use Case 1: Accessing DOM elements
```jsx
import { useRef } from "react";

function FocusInput() {
  const inputRef = useRef(null);

  const handleFocus = () => {
    inputRef.current.focus(); // directly focuses the input
  };

  return (
    <div>
      <input ref={inputRef} placeholder="Click button to focus me" />
      <button onClick={handleFocus}>Focus Input</button>
    </div>
  );
}
```

### Use Case 2: Storing previous value
```jsx
import { useState, useRef, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    prevCountRef.current = count; // save current count after render
  });

  return (
    <p>
      Current: {count} | Previous: {prevCountRef.current}
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </p>
  );
}
```

### Use Case 3: Storing a timer ID (without re-render)
```jsx
function Timer() {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null); // store timer ID, won't cause re-render

  const start = () => {
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const stop = () => {
    clearInterval(timerRef.current); // use the stored ID to clear
  };

  return (
    <div>
      <p>{seconds}s</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### useState vs useRef — Key Difference

| Feature | useState | useRef |
|---|---|---|
| Causes re-render on change? | ✅ Yes | ❌ No |
| Value persists across renders? | ✅ Yes | ✅ Yes |
| Used for UI data? | ✅ Yes | ❌ No (use for DOM/side data) |

### Where is useRef used?
- Focusing inputs automatically
- Playing/pausing video elements
- Storing timer IDs
- Tracking if a component is mounted
- Storing previous state values

---

## 7. useContext

### What is it?
`useContext` lets you read a **global value** (called Context) anywhere in your component tree without passing props through every level.

### The Problem it Solves: Prop Drilling
```
App (has user data)
  └── Navbar
        └── UserProfile (needs user data)
```

Without context, you'd pass `user` as a prop through every level. With large trees, this becomes a nightmare. That's called **prop drilling**.

### How to use it — 3 steps

**Step 1: Create a Context**
```jsx
import { createContext } from "react";

export const ThemeContext = createContext("light"); // default value
```

**Step 2: Provide the value (wrap your components)**
```jsx
import { ThemeContext } from "./ThemeContext";

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Navbar />       {/* These can now access "dark" anywhere */}
      <MainContent />
    </ThemeContext.Provider>
  );
}
```

**Step 3: Consume the value anywhere**
```jsx
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

function Navbar() {
  const theme = useContext(ThemeContext);
  return <nav className={theme}>I know the theme is: {theme}</nav>;
}
```

### Real example: User Authentication Context
```jsx
// AuthContext.js
import { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for convenience (we'll cover this in section 13)
export function useAuth() {
  return useContext(AuthContext);
}
```

```jsx
// In any deeply nested component:
function ProfileButton() {
  const { user, logout } = useAuth();
  return <button onClick={logout}>Logout {user?.name}</button>;
}
```

### Where is useContext used?
- Theme (dark/light mode)
- Logged-in user data
- Language/locale settings
- Shopping cart data
- Any truly global data

> ⚠️ **Don't overuse Context.** For local state, use `useState`. Context is for genuinely global data.

---

## 8. useReducer

### What is it?
`useReducer` is an alternative to `useState` for managing **complex state logic**. Instead of calling a setter directly, you **dispatch actions** and a **reducer function** decides how to update state.

Think of it like Redux but built into React.

### Syntax
```jsx
const [state, dispatch] = useReducer(reducerFunction, initialState);
```

### The Reducer Function
```jsx
function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    case "RESET":
      return { count: 0 };
    default:
      return state;
  }
}
```

### Full Counter Example
```jsx
import { useReducer } from "react";

const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case "INCREMENT": return { count: state.count + 1 };
    case "DECREMENT": return { count: state.count - 1 };
    case "RESET":     return { count: 0 };
    default:          return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
      <button onClick={() => dispatch({ type: "RESET" })}>Reset</button>
    </div>
  );
}
```

### When to use useReducer vs useState?

| Situation | Use |
|---|---|
| Simple single value (count, name, toggle) | `useState` |
| Multiple related state values | `useReducer` |
| Next state depends on previous in complex ways | `useReducer` |
| State transitions have names (INCREMENT, SUBMIT, etc.) | `useReducer` |

### Shopping Cart Example (complex state)
```jsx
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.item] };
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
}

function Cart() {
  const [cart, dispatch] = useReducer(cartReducer, { items: [] });

  const addItem = (item) => dispatch({ type: "ADD_ITEM", item });
  const removeItem = (id) => dispatch({ type: "REMOVE_ITEM", id });
}
```

---

## 9. useCallback

### What is it?
`useCallback` **memoizes a function** — it returns the same function reference between renders, unless its dependencies change.

### Why do we need this?
In React, every time a component re-renders, all functions inside it are **recreated** (new references in memory).

This is a problem when you pass functions to child components wrapped in `React.memo`, because a new function reference will cause the child to re-render unnecessarily.

### Syntax
```jsx
const memoizedFn = useCallback(() => {
  // function body
}, [dependencies]);
```

### Example — Without useCallback (problem)
```jsx
const Child = React.memo(({ onClick }) => {
  console.log("Child re-rendered!");
  return <button onClick={onClick}>Click</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // ❌ New function created on every Parent re-render
  // → Child re-renders even though nothing relevant changed
  const handleClick = () => console.log("clicked");

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Parent Count: {count}</button>
      <Child onClick={handleClick} />
    </>
  );
}
```

### Example — With useCallback (solution)
```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // ✅ Same function reference returned every render
  // → Child does NOT re-render unnecessarily
  const handleClick = useCallback(() => {
    console.log("clicked");
  }, []); // no dependencies = never recreated

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>Parent Count: {count}</button>
      <Child onClick={handleClick} />
    </>
  );
}
```

### With dependencies
```jsx
const fetchData = useCallback(() => {
  fetch(`/api/data?id=${userId}`);
}, [userId]); // recreated only when userId changes
```

### useCallback + useEffect (avoid infinite loop)
```jsx
function App() {
  const [data, setData] = useState(null);

  // Without useCallback, fetchData is new on every render
  // → useEffect sees new dependency → runs again → infinite loop!
  const fetchData = useCallback(async () => {
    const res = await fetch("/api/data");
    setData(await res.json());
  }, []); // stable reference

  useEffect(() => {
    fetchData();
  }, [fetchData]); // now safe — fetchData doesn't change
}
```

### Where is useCallback used?
- Passing callbacks to memoized child components
- Functions as useEffect dependencies
- Event handlers in performance-sensitive components

---

## 10. useMemo

### What is it?
`useMemo` **memoizes a computed value** — it caches the result of an expensive calculation and only recomputes it when dependencies change.

### Syntax
```jsx
const memoizedValue = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);
```

### Example — Expensive calculation
```jsx
import { useState, useMemo } from "react";

function ExpensiveList({ items, filter }) {
  // ❌ Without useMemo — runs on EVERY render
  // const filteredItems = items.filter(item => item.includes(filter));

  // ✅ With useMemo — only recalculates when items or filter change
  const filteredItems = useMemo(() => {
    console.log("Filtering..."); // you'll see this only when needed
    return items.filter(item => item.toLowerCase().includes(filter.toLowerCase()));
  }, [items, filter]);

  return (
    <ul>{filteredItems.map(item => <li key={item}>{item}</li>)}</ul>
  );
}
```

### useMemo vs useCallback

| Hook | Memoizes | Returns |
|---|---|---|
| `useMemo` | A **value** (result of calculation) | The computed value |
| `useCallback` | A **function** | The function itself |

```jsx
// These two are equivalent:
const memoizedFn = useCallback(fn, [deps]);
const memoizedFn = useMemo(() => fn, [deps]);
```

### When to use useMemo?
- Filtering/sorting large arrays
- Complex mathematical calculations
- Creating derived data from props/state
- Preventing unnecessary re-renders of child components that receive objects as props

> ⚠️ **Don't over-optimize.** `useMemo` has its own overhead. Only use it when you've identified a genuine performance bottleneck. Premature optimization is bad.

---

## 11. useLayoutEffect

### What is it?
`useLayoutEffect` is almost identical to `useEffect` — it runs a side effect after the DOM is updated. The key difference is **timing**.

| Hook | When does it run? |
|---|---|
| `useEffect` | After the browser has painted the screen (async) |
| `useLayoutEffect` | After DOM updates but **before** the browser paints (sync) |

### When do you need this?
When you need to **measure the DOM** or **make DOM changes** that must happen before the user sees anything, to avoid visual flicker.

### Example
```jsx
import { useState, useLayoutEffect, useRef } from "react";

function Tooltip({ text }) {
  const tooltipRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    // Measure the DOM element BEFORE the browser paints
    // This prevents a flash of wrong position
    const rect = tooltipRef.current.getBoundingClientRect();
    setPosition({ top: rect.top, left: rect.left });
  }, []);

  return <div ref={tooltipRef} style={position}>{text}</div>;
}
```

### Simple Rule
- **99% of the time → use `useEffect`**
- Use `useLayoutEffect` only when you need to read/write the DOM synchronously before paint to prevent visual flicker

---

## 12. useId

### What is it?
`useId` generates a **unique, stable ID** for accessibility attributes like `htmlFor` and `aria-` attributes. It's useful when you need matching IDs for label-input pairs.

### Syntax
```jsx
const id = useId();
```

### Example
```jsx
import { useId } from "react";

function FormField({ label }) {
  const id = useId(); // generates something like ":r1:"

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" />
    </div>
  );
}

// You can use this component multiple times
// Each instance gets a unique ID — no conflicts!
function Form() {
  return (
    <>
      <FormField label="Name" />
      <FormField label="Email" />
      <FormField label="Phone" />
    </>
  );
}
```

> Before `useId`, developers had to track and manually assign IDs — a pain when reusing components.

---

## 13. Custom Hooks

### What is it?
A custom hook is a **function you write yourself** that uses built-in hooks inside it. It lets you **extract and reuse stateful logic** across multiple components.

**Naming rule:** Must start with `use` (e.g., `useFetch`, `useToggle`, `useLocalStorage`)

### Example 1: useToggle
```jsx
// hooks/useToggle.js
import { useState } from "react";

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue(v => !v);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return { value, toggle, setTrue, setFalse };
}

export default useToggle;
```

```jsx
// Using it anywhere
function Modal() {
  const { value: isOpen, toggle, setFalse: closeModal } = useToggle(false);

  return (
    <>
      <button onClick={toggle}>Open Modal</button>
      {isOpen && (
        <div className="modal">
          <p>Modal content</p>
          <button onClick={closeModal}>Close</button>
        </div>
      )}
    </>
  );
}
```

### Example 2: useFetch (very common in interviews!)
```jsx
// hooks/useFetch.js
import { useState, useEffect } from "react";

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort(); // cleanup on unmount
  }, [url]);

  return { data, loading, error };
}

export default useFetch;
```

```jsx
// Use it in any component — super clean!
function UserList() {
  const { data: users, loading, error } = useFetch("/api/users");

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>
  );
}
```

### Example 3: useLocalStorage
```jsx
import { useState } from "react";

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}
```

```jsx
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage("theme", "light");
  return <button onClick={() => setTheme(t => t === "light" ? "dark" : "light")}>
    Current: {theme}
  </button>;
}
```

### Why Custom Hooks are powerful
- Extract complex logic out of components
- Reuse across multiple components
- Easy to test in isolation
- Makes components clean and readable

---

## 14. Quick Revision Cheatsheet

| Hook | One-line summary | Common use case |
|---|---|---|
| `useState` | Store data that changes and triggers re-render | Form inputs, counters, toggles |
| `useEffect` | Run code after render / on dependency change | API calls, event listeners, timers |
| `useRef` | Mutable box that persists without re-render | DOM access, timer IDs, prev values |
| `useContext` | Read global values without prop drilling | Theme, auth, language |
| `useReducer` | Complex state with actions | Shopping cart, form with many fields |
| `useCallback` | Memoize a function reference | Pass stable callbacks to child components |
| `useMemo` | Memoize an expensive computed value | Filter/sort large lists |
| `useLayoutEffect` | Like useEffect but fires before paint | DOM measurement to prevent flicker |
| `useId` | Generate unique accessible IDs | Form label-input pairing |
| Custom Hooks | Extract reusable stateful logic | useFetch, useToggle, useLocalStorage |

---

## 15. Common Interview Questions

### Q1: What is the difference between `useState` and `useRef`?
**Answer:** Both persist values across renders, but `useState` causes a re-render when updated while `useRef` does not. Use `useState` for UI-related data. Use `useRef` for DOM references, timer IDs, or values you want to track without triggering a render.

---

### Q2: What is the dependency array in `useEffect`?
**Answer:** It controls when the effect runs:
- No array → runs after every render
- Empty array `[]` → runs once on mount
- `[dep]` → runs on mount and whenever `dep` changes

---

### Q3: What happens if you forget cleanup in `useEffect`?
**Answer:** Memory leaks. For example, if you add an event listener but don't remove it, it keeps running after the component unmounts. Cleanup runs when the component unmounts or before the next effect runs.

---

### Q4: What is the difference between `useCallback` and `useMemo`?
**Answer:** `useCallback` memoizes a **function**. `useMemo` memoizes a **computed value**. `useCallback(fn, deps)` is equivalent to `useMemo(() => fn, deps)`.

---

### Q5: When would you use `useReducer` instead of `useState`?
**Answer:** When state logic is complex — multiple related values, state transitions with names, or when the next state depends on the previous state in non-trivial ways. Good analogy: `useState` is like a variable, `useReducer` is like a mini-Redux.

---

### Q6: What is a custom hook? Why are they useful?
**Answer:** A function starting with `use` that contains other hooks. They let you extract and reuse stateful logic across components. Example: `useFetch` wraps data fetching logic so any component can call it cleanly.

---

### Q7: Why can't you call hooks inside an if statement?
**Answer:** React tracks hooks by their call order. If hooks are inside conditions, the order can change between renders, breaking React's internal tracking. This is the first Rule of Hooks.

---

### Q8: What is the difference between `useEffect` and `useLayoutEffect`?
**Answer:** `useEffect` runs after the browser paints. `useLayoutEffect` runs after DOM mutations but before the browser paints. Use `useLayoutEffect` to avoid visual flicker when measuring or manipulating DOM elements.

---

### Q9: What is prop drilling and how does `useContext` solve it?
**Answer:** Prop drilling is passing props through multiple intermediate components just to reach a deeply nested child. `useContext` creates a global value that any component can read without receiving it as a prop.

---

### Q10: Can you call a custom hook inside another custom hook?
**Answer:** Yes! That's one of the powerful features of hooks. Custom hooks can compose other hooks freely, allowing you to build complex behaviors from simple pieces.

---

*Notes by Raj | React Hooks — Placement Prep | March 2026*