# ⚛️ React Interview Preparation — 50 Essential Questions & Answers

> **For:** First-time React job seekers  
> **Level:** Beginner to Intermediate  
> **Format:** Question → Concept → Answer → Example (where applicable)

---

## 📚 Table of Contents

1. [Core React Fundamentals (Q1–Q10)](#core-react-fundamentals)
2. [JSX & Rendering (Q11–Q17)](#jsx--rendering)
3. [Components & Props (Q18–Q24)](#components--props)
4. [State & Lifecycle (Q25–Q32)](#state--lifecycle)
5. [Hooks (Q33–Q40)](#hooks)
6. [Event Handling & Forms (Q41–Q44)](#event-handling--forms)
7. [Performance & Advanced (Q45–Q50)](#performance--advanced)

---

## Core React Fundamentals

---

### Q1. What is React?

**Answer:**  
React is an **open-source JavaScript library** developed by Facebook (Meta) for building **user interfaces**, especially single-page applications (SPAs). It allows developers to build reusable UI components and efficiently update the DOM using a **virtual DOM**.

> 💡 Key Point: React is a *library*, not a full framework like Angular.

---

### Q2. What are the key features of React?

**Answer:**

| Feature | Description |
|---|---|
| **Virtual DOM** | React uses a virtual representation of the DOM to minimize real DOM updates |
| **Component-Based** | UI is broken into small, reusable components |
| **Unidirectional Data Flow** | Data flows from parent → child via props |
| **JSX** | JavaScript syntax extension that looks like HTML |
| **Hooks** | Functions that let you use state and lifecycle features in functional components |

---

### Q3. What is the Virtual DOM? How does it work?

**Answer:**  
The **Virtual DOM (VDOM)** is a lightweight in-memory representation of the real DOM.

**How it works:**
1. When state/props change, React creates a new Virtual DOM tree.
2. React **diffs** the new tree against the previous one (reconciliation).
3. Only the **changed parts** are updated in the real DOM.

> 💡 This makes React much faster than directly manipulating the DOM on every change.

---

### Q4. What is the difference between React and ReactDOM?

**Answer:**

| | React | ReactDOM |
|---|---|---|
| **Purpose** | Core library — defines components, JSX, hooks | Renders React components to the browser DOM |
| **Package** | `react` | `react-dom` |
| **Example use** | `React.createElement()`, `useState` | `ReactDOM.createRoot().render()` |

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

---

### Q5. What is JSX?

**Answer:**  
JSX stands for **JavaScript XML**. It is a syntax extension that allows you to write HTML-like code inside JavaScript. JSX is **not valid JavaScript** — it gets compiled to `React.createElement()` calls by Babel.

```jsx
// JSX
const element = <h1>Hello, World!</h1>;

// Compiled to:
const element = React.createElement('h1', null, 'Hello, World!');
```

---

### Q6. What is the difference between Real DOM and Virtual DOM?

**Answer:**

| | Real DOM | Virtual DOM |
|---|---|---|
| **Update Speed** | Slow — re-renders entire tree | Fast — only re-renders changed nodes |
| **Memory** | Higher memory usage | Lightweight JS object |
| **Direct Manipulation** | Yes | No — synced to real DOM via diffing |

---

### Q7. What is reconciliation in React?

**Answer:**  
**Reconciliation** is the process React uses to compare the new Virtual DOM with the previous one and determine the **minimum set of changes** needed to update the real DOM.

React uses a **diffing algorithm** that assumes:
- Two elements of different types produce different trees.
- Keys help identify which items in a list have changed.

---

### Q8. What is a React Element vs a React Component?

**Answer:**

| | React Element | React Component |
|---|---|---|
| **What it is** | A plain object describing what to render | A function or class that returns elements |
| **Example** | `<h1>Hello</h1>` | `function App() { return <h1>Hello</h1>; }` |
| **Mutable?** | Immutable | Can manage state |

---

### Q9. What is Create React App (CRA)?

**Answer:**  
`create-react-app` is an officially supported toolchain for creating React applications with **zero configuration**. It sets up webpack, Babel, and ESLint automatically.

```bash
npx create-react-app my-app
cd my-app
npm start
```

> ⚠️ In 2024+, **Vite** is the more popular modern alternative due to faster build times.

---

### Q10. What is Babel in React?

**Answer:**  
**Babel** is a JavaScript transpiler that converts modern JavaScript (ES6+) and JSX into browser-compatible JavaScript (ES5). Without Babel, browsers cannot understand JSX syntax.

---

## JSX & Rendering

---

### Q11. What are the rules of JSX?

**Answer:**
1. **Return a single root element** — Wrap multiple elements in a `<div>` or `<>` (Fragment).
2. **Close all tags** — `<img />`, `<input />`
3. **Use `className` instead of `class`**
4. **Use camelCase for attributes** — `onClick`, `onChange`, `tabIndex`
5. **JavaScript expressions inside `{}`**

```jsx
function App() {
  return (
    <>
      <h1 className="title">Hello</h1>
      <p>{2 + 2}</p>
    </>
  );
}
```

---

### Q12. What are React Fragments?

**Answer:**  
Fragments let you group multiple elements **without adding an extra DOM node**.

```jsx
// Using <React.Fragment>
return (
  <React.Fragment>
    <h1>Title</h1>
    <p>Body</p>
  </React.Fragment>
);

// Shorthand
return (
  <>
    <h1>Title</h1>
    <p>Body</p>
  </>
);
```

---

### Q13. How do you render a list in React?

**Answer:**  
Use the `.map()` method. Always provide a **unique `key` prop** to each list item.

```jsx
const fruits = ['Apple', 'Banana', 'Mango'];

function FruitList() {
  return (
    <ul>
      {fruits.map((fruit, index) => (
        <li key={index}>{fruit}</li>
      ))}
    </ul>
  );
}
```

> ⚠️ Prefer a unique ID over `index` as key when items can reorder.

---

### Q14. What is the purpose of the `key` prop?

**Answer:**  
Keys help React identify **which items in a list have changed, been added, or removed**. They must be **unique among siblings** and should be **stable** (not change between renders).

---

### Q15. What is conditional rendering in React?

**Answer:**  
Displaying different UI based on a condition. Common patterns:

```jsx
// Ternary operator
{isLoggedIn ? <Dashboard /> : <Login />}

// && operator (short-circuit)
{isLoading && <Spinner />}

// if/else with early return
function Greeting({ isLoggedIn }) {
  if (isLoggedIn) return <h1>Welcome back!</h1>;
  return <h1>Please sign in.</h1>;
}
```

---

### Q16. What is the difference between `null`, `undefined`, and `false` in JSX?

**Answer:**  
All three render **nothing** in JSX — they are valid children but produce no output.

```jsx
// None of these render anything:
return null;
return false;
return undefined;
```

> ⚠️ `0` is falsy but **does render** in JSX! Use `count > 0 && <Component />` instead of `count && <Component />`.

---

### Q17. How does React handle comments in JSX?

**Answer:**  
Use JavaScript comments inside curly braces:

```jsx
return (
  <div>
    {/* This is a JSX comment */}
    <h1>Hello</h1>
  </div>
);
```

---

## Components & Props

---

### Q18. What is a Component in React?

**Answer:**  
A component is a **reusable, independent piece of UI**. It accepts inputs (props) and returns JSX describing what should appear on screen.

There are two types:
- **Functional Components** (preferred, modern)
- **Class Components** (legacy)

```jsx
// Functional Component
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

---

### Q19. What is the difference between Functional and Class Components?

**Answer:**

| | Functional Component | Class Component |
|---|---|---|
| **Syntax** | JavaScript function | ES6 class extending `React.Component` |
| **State** | `useState` hook | `this.state` |
| **Lifecycle** | `useEffect` hook | `componentDidMount`, `componentDidUpdate`, etc. |
| **Boilerplate** | Minimal | More verbose |
| **Performance** | Slightly better | Slightly heavier |
| **Modern use** | ✅ Recommended | ❌ Legacy |

---

### Q20. What are Props?

**Answer:**  
**Props** (short for properties) are **read-only inputs** passed from a parent component to a child component. Props allow components to be dynamic and reusable.

```jsx
// Parent
function App() {
  return <Greeting name="Rahul" age={25} />;
}

// Child
function Greeting({ name, age }) {
  return <p>{name} is {age} years old.</p>;
}
```

> 💡 **Props are immutable** — a child component must never modify its own props.

---

### Q21. What are Default Props?

**Answer:**  
Default props provide fallback values if a prop is not passed.

```jsx
function Button({ label = 'Click Me', color = 'blue' }) {
  return <button style={{ background: color }}>{label}</button>;
}
```

Or using `defaultProps` (older syntax):

```jsx
Button.defaultProps = {
  label: 'Click Me',
  color: 'blue',
};
```

---

### Q22. What is prop drilling?

**Answer:**  
**Prop drilling** is the process of passing props through multiple levels of components that don't need them, just to reach a deeply nested component that does.

```
App → Parent → Child → GrandChild (needs the data)
```

**Solutions:** React Context API, Redux, Zustand.

---

### Q23. What are children props?

**Answer:**  
`props.children` refers to the **content between opening and closing tags** of a component.

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}

// Usage
<Card>
  <h2>Title</h2>
  <p>Description</p>
</Card>
```

---

### Q24. What is the difference between controlled and uncontrolled components?

**Answer:**

| | Controlled | Uncontrolled |
|---|---|---|
| **State managed by** | React (`useState`) | DOM itself |
| **Access value via** | `state` variable | `ref` |
| **Example** | `<input value={val} onChange={...}/>` | `<input ref={inputRef} />` |
| **Recommended** | ✅ Yes | For simple/legacy cases |

---

## State & Lifecycle

---

### Q25. What is State in React?

**Answer:**  
**State** is a built-in React object used to store **data that can change over time**. When state changes, React re-renders the component.

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

---

### Q26. What is the difference between State and Props?

**Answer:**

| | State | Props |
|---|---|---|
| **Managed by** | The component itself | Parent component |
| **Mutable?** | ✅ Yes (via setter) | ❌ No (read-only) |
| **Purpose** | Internal data | External configuration |

---

### Q27. What is `setState` (class component) and how does it work?

**Answer:**  
In class components, `setState()` is used to update state. It is **asynchronous** and triggers a re-render.

```jsx
this.setState({ count: this.state.count + 1 });

// Functional form (safe for async updates):
this.setState(prevState => ({ count: prevState.count + 1 }));
```

---

### Q28. What are React Lifecycle Methods?

**Answer:**  
Lifecycle methods are special methods in **class components** that run at specific stages of a component's life:

```
Mounting         →  Updating           →  Unmounting
─────────────────────────────────────────────────────
constructor()       shouldComponentUpdate()  componentWillUnmount()
render()            render()
componentDidMount() componentDidUpdate()
```

**Functional equivalent using `useEffect`:**

```jsx
useEffect(() => {
  // componentDidMount
  return () => {
    // componentWillUnmount
  };
}, []); // empty array = run once
```

---

### Q29. What does `componentDidMount` do?

**Answer:**  
It runs **after the component is first rendered** (mounted) to the DOM. Ideal for:
- API calls / data fetching
- Setting up subscriptions
- DOM manipulation

```jsx
componentDidMount() {
  fetch('/api/data').then(res => res.json()).then(data => this.setState({ data }));
}
```

---

### Q30. What does `componentDidUpdate` do?

**Answer:**  
Runs **after every re-render** (when props or state change). Useful for side effects based on state changes.

```jsx
componentDidUpdate(prevProps, prevState) {
  if (prevState.count !== this.state.count) {
    console.log('Count changed!');
  }
}
```

---

### Q31. What does `componentWillUnmount` do?

**Answer:**  
Runs **just before the component is removed** from the DOM. Used for cleanup:
- Clearing timers
- Cancelling API calls
- Removing event listeners

---

### Q32. What happens when you call `setState` with the same value?

**Answer:**  
React uses **Object.is()** to compare the new state with the old state. If they are the same, React **bails out** (skips re-render). This is an optimization.

---

## Hooks

---

### Q33. What are React Hooks?

**Answer:**  
Hooks are **functions** that let you "hook into" React features (state, lifecycle, context, etc.) from **functional components**. Introduced in React 16.8.

**Rules of Hooks:**
1. Only call hooks **at the top level** (not inside loops, conditions, or nested functions).
2. Only call hooks **inside React functional components** or custom hooks.

---

### Q34. What is `useState`?

**Answer:**  
`useState` is a hook that lets you add **state** to a functional component.

```jsx
const [state, setState] = useState(initialValue);
```

```jsx
function Toggle() {
  const [isOn, setIsOn] = useState(false);
  return (
    <button onClick={() => setIsOn(!isOn)}>
      {isOn ? 'ON' : 'OFF'}
    </button>
  );
}
```

---

### Q35. What is `useEffect`?

**Answer:**  
`useEffect` lets you perform **side effects** in functional components (data fetching, subscriptions, timers, DOM updates).

```jsx
useEffect(() => {
  // Side effect here

  return () => {
    // Cleanup (optional)
  };
}, [dependencies]); // dependency array
```

**Dependency array behavior:**

| Dependency Array | When it runs |
|---|---|
| Not provided | After every render |
| `[]` | Only once (on mount) |
| `[value]` | Whenever `value` changes |

---

### Q36. What is `useRef`?

**Answer:**  
`useRef` returns a **mutable ref object** whose `.current` property persists across renders.

**Two main uses:**
1. Accessing DOM elements directly
2. Storing mutable values without causing re-renders

```jsx
function InputFocus() {
  const inputRef = useRef(null);

  return (
    <>
      <input ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}
```

---

### Q37. What is `useContext`?

**Answer:**  
`useContext` lets you consume a **React Context** without prop drilling.

```jsx
// 1. Create context
const ThemeContext = React.createContext('light');

// 2. Provide it
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// 3. Consume it
function Button() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click</button>;
}
```

---

### Q38. What is `useReducer`?

**Answer:**  
`useReducer` is an alternative to `useState` for **complex state logic**. It works like Redux — you dispatch actions and a reducer function handles state transitions.

```jsx
const initialState = { count: 0 };

function reducer(state, action) {
  switch (action.type) {
    case 'increment': return { count: state.count + 1 };
    case 'decrement': return { count: state.count - 1 };
    default: return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </>
  );
}
```

---

### Q39. What is `useMemo`?

**Answer:**  
`useMemo` **memoizes** the result of an expensive computation so it only recalculates when dependencies change.

```jsx
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

> 💡 Use it only when you have a genuinely expensive calculation. Don't overuse it.

---

### Q40. What is `useCallback`?

**Answer:**  
`useCallback` memoizes a **function reference** so it doesn't get recreated on every render.

```jsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

> 💡 Useful when passing callbacks to child components wrapped in `React.memo`.

**Difference:**
- `useMemo` → memoizes a **value**
- `useCallback` → memoizes a **function**

---

## Event Handling & Forms

---

### Q41. How does event handling work in React?

**Answer:**  
React uses **SyntheticEvents** — a cross-browser wrapper around native browser events. Event handlers are passed as **camelCase props**.

```jsx
function Button() {
  function handleClick(e) {
    e.preventDefault(); // prevent default behavior
    console.log('Clicked!', e.target);
  }

  return <button onClick={handleClick}>Click Me</button>;
}
```

> 💡 Don't call the function: use `onClick={handleClick}` not `onClick={handleClick()}`.

---

### Q42. How do you handle forms in React?

**Answer:**  
Use **controlled components** — form elements whose value is controlled by React state.

```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ email, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

### Q43. What is `e.preventDefault()` and when do you use it?

**Answer:**  
`e.preventDefault()` stops the **default browser behavior** for an event. Most commonly used in form submissions to prevent page reload.

```jsx
<form onSubmit={e => {
  e.preventDefault(); // prevents page refresh
  // handle form logic
}}>
```

---

### Q44. How do you pass arguments to event handlers?

**Answer:**

```jsx
// Using arrow function wrapper
<button onClick={() => handleDelete(id)}>Delete</button>

// Using bind
<button onClick={handleDelete.bind(this, id)}>Delete</button>
```

---

## Performance & Advanced

---

### Q45. What is `React.memo`?

**Answer:**  
`React.memo` is a **Higher-Order Component (HOC)** that memoizes a functional component. The component only re-renders if its **props change**.

```jsx
const MyComponent = React.memo(function MyComponent({ name }) {
  return <div>{name}</div>;
});
```

> 💡 Best for components that receive the same props frequently and are expensive to render.

---

### Q46. What is a Higher-Order Component (HOC)?

**Answer:**  
A **HOC** is a function that takes a component and returns a **new enhanced component**. It's a pattern for reusing component logic.

```jsx
function withLogger(WrappedComponent) {
  return function EnhancedComponent(props) {
    console.log('Rendering:', WrappedComponent.name);
    return <WrappedComponent {...props} />;
  };
}

const LoggedButton = withLogger(Button);
```

---

### Q47. What is the Context API?

**Answer:**  
Context provides a way to share data (like theme, language, auth) **globally** across the component tree without prop drilling.

```jsx
// Create
const UserContext = React.createContext(null);

// Provide
<UserContext.Provider value={currentUser}>
  <App />
</UserContext.Provider>

// Consume
const user = useContext(UserContext);
```

---

### Q48. What is lazy loading in React?

**Answer:**  
**Lazy loading** defers the loading of components until they are needed, reducing initial bundle size.

```jsx
import React, { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

---

### Q49. What are Error Boundaries?

**Answer:**  
Error Boundaries are **class components** that catch JavaScript errors in their child component tree and display a **fallback UI** instead of crashing.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) return <h1>Something went wrong.</h1>;
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

### Q50. What is the difference between `npm start` and `npm run build`?

**Answer:**

| Command | Purpose |
|---|---|
| `npm start` | Starts **development** server with hot reloading — for development only |
| `npm run build` | Creates an **optimized production** build in the `/build` folder |

> 💡 Always use `npm run build` before deploying to production. The build is minified, tree-shaken, and optimized for performance.

---

## 🏁 Quick Revision Cheatsheet

| Topic | Key Terms |
|---|---|
| **Core** | Virtual DOM, Reconciliation, JSX, Babel |
| **Components** | Functional, Class, Props, State, Children |
| **Hooks** | useState, useEffect, useRef, useContext, useMemo, useCallback, useReducer |
| **Patterns** | HOC, Render Props, Controlled Components |
| **Performance** | React.memo, Lazy Loading, useMemo, useCallback |
| **Advanced** | Context API, Error Boundaries, Suspense |

---

## 💬 Tips for the Interview

1. **Think out loud** — explain your thought process, not just the answer.
2. **Give examples** — whenever possible, show a small code snippet in your head.
3. **Admit what you don't know** — say "I haven't used that yet, but here's how I'd approach it" instead of guessing.
4. **Connect concepts** — e.g., "useCallback is like useMemo, but for functions."
5. **Practice building small components** — Todo list, Counter, Form, Search filter.

---

*Happy coding! ⚛️ You've got this.*
