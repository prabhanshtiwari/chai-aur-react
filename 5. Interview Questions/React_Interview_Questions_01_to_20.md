# React Interview Questions & Answers (Top 20)

> Comprehensive notes for React interviews — detailed answers, code examples, and key points.

---

## Q1. What is React and what are its key features?

### Answer

React is an **open-source JavaScript library** developed by Facebook (Meta) for building **user interfaces**, especially Single Page Applications (SPAs). It focuses only on the **View layer** of MVC architecture.

### Key Features

- **Component-Based Architecture** — UI is split into small, reusable components.
- **Virtual DOM** — React maintains a lightweight copy of the real DOM. On state/props change, it diffs the Virtual DOM and updates only the changed parts.
- **Unidirectional Data Flow** — Data flows from parent to child via props, making the app easier to debug.
- **JSX (JavaScript XML)** — Allows writing HTML-like syntax inside JavaScript.
- **Declarative UI** — You describe *what* the UI should look like; React handles *how* to update it.
- **Hooks** — Introduced in React 16.8, they allow using state and lifecycle features in functional components.
- **Rich Ecosystem** — Backed by tools like React Router, Redux, React Query, etc.

---

## Q2. What is the Virtual DOM? How does it work?

### Answer

The **Virtual DOM (VDOM)** is a lightweight, in-memory representation of the real DOM. React uses it to optimize UI updates.

### How It Works (Step by Step)

1. When a component's state or props change, React creates a **new Virtual DOM tree**.
2. It compares this new tree with the **previous Virtual DOM tree** using a process called **Diffing**.
3. React identifies the **minimal set of changes** needed.
4. It then **patches** only those changes to the real DOM (called **Reconciliation**).

### Why It's Faster

- Direct DOM manipulation is slow because the browser must re-render layout, styles, etc.
- Virtual DOM batches multiple updates and applies them in one pass.

```
State Change → New VDOM → Diff with Old VDOM → Patch Real DOM
```

---

## Q3. What is JSX? Is it mandatory in React?

### Answer

**JSX (JavaScript XML)** is a syntax extension for JavaScript that looks like HTML. It is used to describe what the UI should look like.

```jsx
const element = <h1>Hello, World!</h1>;
```

### JSX is NOT mandatory

Under the hood, JSX is converted by Babel to `React.createElement()` calls:

```jsx
// JSX
const element = <h1 className="title">Hello</h1>;

// Equivalent without JSX
const element = React.createElement('h1', { className: 'title' }, 'Hello');
```

### Why Use JSX?

- More readable and expressive
- Allows mixing HTML structure with logic
- Compile-time error checking

### Rules of JSX

- Every JSX expression must have a **single root element** (or use `<>...</>` Fragment)
- Use `className` instead of `class`
- Use `htmlFor` instead of `for`
- Self-closing tags must be closed: `<img />`
- JavaScript expressions go inside `{}`

---

## Q4. What are Components in React? Difference between Class and Functional Components?

### Answer

A **Component** is an independent, reusable piece of UI. Components accept inputs called **props** and return React elements.

### Functional Components

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

- Plain JavaScript functions
- Use Hooks for state and lifecycle
- Simpler, preferred approach today

### Class Components

```jsx
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}
```

- ES6 classes extending `React.Component`
- Use `this.state` and `this.setState()`
- Have lifecycle methods like `componentDidMount`, `componentDidUpdate`

### Comparison Table

| Feature | Functional | Class |
|---|---|---|
| Syntax | Function | ES6 Class |
| State | `useState` Hook | `this.state` |
| Lifecycle | `useEffect` | Lifecycle methods |
| `this` keyword | Not needed | Required |
| Performance | Slightly better | Slightly heavier |
| Recommended | ✅ Yes (modern) | ❌ Legacy |

---

## Q5. What are Props and State? How are they different?

### Answer

### Props (Properties)

- **Passed from parent to child** components
- **Read-only** — a child cannot modify its own props
- Used to configure a component

```jsx
function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}

// Usage
<Button label="Submit" onClick={handleSubmit} />
```

### State

- **Internal** to a component — managed by the component itself
- **Mutable** — updated using `setState` or `useState`
- Changes trigger a re-render

```jsx
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

### Key Differences

| Feature | Props | State |
|---|---|---|
| Source | Parent component | Component itself |
| Mutability | Immutable (read-only) | Mutable |
| Who manages it | Parent | Component |
| Triggers re-render | Yes (when parent re-renders) | Yes (when updated) |

---

## Q6. What are React Hooks? List the most important ones.

### Answer

**Hooks** are special functions introduced in **React 16.8** that let you use state and lifecycle features in **functional components**.

### Why Hooks?

- Eliminated the need for class components
- Reusable stateful logic across components
- Cleaner, more readable code

### Most Important Hooks

#### `useState` — Manage local state
```jsx
const [value, setValue] = useState(initialValue);
```

#### `useEffect` — Side effects (API calls, subscriptions, DOM updates)
```jsx
useEffect(() => {
  // Runs after render
  fetchData();

  return () => {
    // Cleanup (like componentWillUnmount)
  };
}, [dependency]); // Runs only when dependency changes
```

#### `useContext` — Access React Context without prop drilling
```jsx
const theme = useContext(ThemeContext);
```

#### `useRef` — Access DOM elements or persist values without re-render
```jsx
const inputRef = useRef(null);
inputRef.current.focus();
```

#### `useMemo` — Memoize expensive calculations
```jsx
const result = useMemo(() => expensiveFunction(a, b), [a, b]);
```

#### `useCallback` — Memoize callback functions (prevent re-creation)
```jsx
const handleClick = useCallback(() => doSomething(id), [id]);
```

#### `useReducer` — Complex state management (like Redux pattern)
```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

### Rules of Hooks

1. Only call hooks at the **top level** — not inside loops, conditions, or nested functions
2. Only call hooks from **React functional components** or custom hooks

---

## Q7. What is the `useEffect` Hook? Explain with lifecycle equivalents.

### Answer

`useEffect` lets you perform **side effects** in functional components — things like data fetching, subscriptions, timers, and DOM manipulations.

### Syntax
```jsx
useEffect(() => {
  // Effect code
  return () => { /* Cleanup */ };
}, [dependencies]);
```

### Behavior based on dependency array

| Dependency Array | When it runs |
|---|---|
| Not provided | After **every** render |
| `[]` (empty array) | Only once — on **mount** |
| `[a, b]` | When `a` or `b` changes |

### Lifecycle Equivalents

```jsx
// componentDidMount
useEffect(() => {
  console.log('Mounted');
}, []);

// componentDidUpdate
useEffect(() => {
  console.log('count updated');
}, [count]);

// componentWillUnmount
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer); // Cleanup
}, []);
```

---

## Q8. What is the Context API? When to use it?

### Answer

**Context API** is a React mechanism to **share data globally** across the component tree without passing props at every level (avoiding **prop drilling**).

### When to Use

- Theme (dark/light mode)
- User authentication data
- Language/locale settings
- Any data needed by many deeply nested components

### How to Use

```jsx
// 1. Create Context
const ThemeContext = React.createContext('light');

// 2. Provide Context
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Toolbar />
    </ThemeContext.Provider>
  );
}

// 3. Consume Context
function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
```

### Context vs Redux

| Feature | Context API | Redux |
|---|---|---|
| Setup complexity | Low | High |
| Best for | Simple global state | Complex, large-scale state |
| DevTools | Limited | Excellent |
| Performance | Can cause unnecessary re-renders | Optimized with selectors |

---

## Q9. What is prop drilling and how to avoid it?

### Answer

**Prop drilling** is when you pass data through multiple layers of components that don't need the data themselves — just to reach a deeply nested component.

```
App → Layout → Sidebar → UserMenu → Avatar (needs user)
```

Every intermediate component must accept and pass `user` even if they don't use it.

### How to Avoid Prop Drilling

1. **Context API** — Share data globally
2. **Redux / Zustand / Jotai** — External state management
3. **Component Composition** — Pass components as children/props
4. **Custom Hooks** — Encapsulate and share logic

```jsx
// Component Composition approach
function Layout({ sidebar }) {
  return <div>{sidebar}</div>;
}

<Layout sidebar={<UserMenu user={user} />} />
```

---

## Q10. What is React.memo? How does it optimize performance?

### Answer

`React.memo` is a **Higher Order Component (HOC)** that memoizes a component. It **prevents re-rendering** if the component's props haven't changed.

### Syntax

```jsx
const MyComponent = React.memo(function MyComponent({ name }) {
  return <div>{name}</div>;
});
```

### How It Works

- On re-render, React compares previous and new props (shallow comparison)
- If props are the same → **skips re-render**
- If props changed → **re-renders normally**

### When to Use

- Component renders frequently but props rarely change
- Expensive/slow rendering components
- Pure display components (no side effects)

### When NOT to Use

- When props change often (memoization overhead outweighs benefit)
- Components with complex object/array props (shallow compare may fail)

### Use with `useCallback`

```jsx
const Parent = () => {
  const handleClick = useCallback(() => console.log('clicked'), []);
  return <Child onClick={handleClick} />;
};

const Child = React.memo(({ onClick }) => <button onClick={onClick}>Click</button>);
```

---

## Q11. Explain the React component lifecycle.

### Answer

Every React component goes through three phases: **Mounting**, **Updating**, and **Unmounting**.

### Class Component Lifecycle Methods

#### Mounting Phase
- `constructor()` — Initialize state and bind methods
- `static getDerivedStateFromProps()` — Sync state with props
- `render()` — Return JSX
- `componentDidMount()` — API calls, subscriptions (runs once after mount)

#### Updating Phase (state/props change)
- `shouldComponentUpdate()` — Return false to prevent re-render
- `render()` — Re-renders JSX
- `componentDidUpdate(prevProps, prevState)` — Side effects after update

#### Unmounting Phase
- `componentWillUnmount()` — Cleanup timers, subscriptions

### Functional Equivalent (Hooks)

```jsx
useEffect(() => {
  // componentDidMount
  fetchData();

  return () => {
    // componentWillUnmount
    cleanup();
  };
}, []);

useEffect(() => {
  // componentDidUpdate for specific dep
}, [dependency]);
```

---

## Q12. What is Redux? How does it work with React?

### Answer

**Redux** is a predictable **state management library** for JavaScript apps. It stores the entire app state in a single **store**.

### Core Concepts

- **Store** — Single source of truth; holds all application state
- **Action** — Plain object describing *what happened* `{ type: 'INCREMENT', payload: 1 }`
- **Reducer** — Pure function that takes state + action and returns new state
- **Dispatch** — Sends an action to the store
- **Selector** — Reads data from the store

### Data Flow

```
UI Event → dispatch(action) → Reducer(state, action) → New State → UI re-renders
```

### Basic Example

```jsx
// Reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT': return { count: state.count + 1 };
    default: return state;
  }
}

// In Component (React-Redux)
const count = useSelector(state => state.count);
const dispatch = useDispatch();

<button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
```

### When to Use Redux

- Large application with complex state
- State shared across many unrelated components
- Need for time-travel debugging / DevTools

---

## Q13. What are Higher-Order Components (HOC)?

### Answer

A **Higher-Order Component** is a function that **takes a component and returns a new component** with enhanced functionality. It's a pattern for reusing component logic.

```
HOC = (Component) => EnhancedComponent
```

### Example — Authentication HOC

```jsx
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const isLoggedIn = useAuth();
    if (!isLoggedIn) return <Redirect to="/login" />;
    return <WrappedComponent {...props} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
```

### Common Use Cases

- Authentication / Authorization
- Logging / Analytics
- Error boundaries
- Theming
- Data fetching wrapper

### HOC vs Hooks

| Feature | HOC | Custom Hook |
|---|---|---|
| Reuse logic | Yes | Yes |
| Wraps component | Yes (adds a layer) | No |
| JSX nesting | Can cause "wrapper hell" | Clean |
| Modern preference | Less preferred | Preferred |

---

## Q14. What is Lazy Loading and Code Splitting in React?

### Answer

**Code Splitting** breaks your JavaScript bundle into smaller chunks that are loaded **on demand**, rather than loading the entire app upfront.

**Lazy Loading** delays loading a component until it's needed.

### `React.lazy` and `Suspense`

```jsx
import React, { Suspense, lazy } from 'react';

// Lazy load the component
const Dashboard = lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  );
}
```

### Route-based Code Splitting

```jsx
import { BrowserRouter, Route } from 'react-router-dom';

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));

<Suspense fallback={<Spinner />}>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
</Suspense>
```

### Benefits

- Faster initial page load
- Reduces bundle size
- Better performance on low-end devices

---

## Q15. What are Controlled vs Uncontrolled Components?

### Answer

### Controlled Components

Form elements whose value is **controlled by React state**. Every keystroke updates state.

```jsx
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
```

- Single source of truth: React state
- Validation on every keystroke
- More verbose but predictable

### Uncontrolled Components

Form elements that manage their own state via **DOM ref**. Values read when needed (e.g., on submit).

```jsx
function UncontrolledInput() {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };

  return <input ref={inputRef} />;
}
```

- DOM manages state
- Less re-renders
- Simpler for basic forms

### When to Use

| Scenario | Use |
|---|---|
| Real-time validation | Controlled |
| Simple forms, file upload | Uncontrolled |
| Dynamic form fields | Controlled |

---

## Q16. What is React Router? Explain key concepts.

### Answer

**React Router** is the standard library for routing in React applications. It enables navigation between views without full page reloads.

### Key Components (v6)

```jsx
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/user/:id" element={<UserProfile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// Access route params
function UserProfile() {
  const { id } = useParams();
  return <div>User: {id}</div>;
}

// Programmatic navigation
function Login() {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>;
}
```

### Key Concepts

- **`BrowserRouter`** — Uses HTML5 history API
- **`Routes` / `Route`** — Defines path-to-component mapping
- **`Link`** — Navigation without page reload
- **`useNavigate`** — Programmatic navigation
- **`useParams`** — Access URL params
- **`useLocation`** — Access current URL/location object
- **Nested Routes** — Child routes render inside parent

---

## Q17. What is the difference between `useMemo` and `useCallback`?

### Answer

Both are **memoization hooks** that optimize performance by preventing unnecessary recalculation or re-creation.

### `useMemo` — Memoizes a **computed value**

```jsx
const expensiveValue = useMemo(() => {
  return items.filter(item => item.active).length;
}, [items]);
```

- Returns a **cached result** of a function
- Recalculates only when dependencies change
- Use for expensive calculations

### `useCallback` — Memoizes a **function reference**

```jsx
const handleClick = useCallback(() => {
  doSomething(userId);
}, [userId]);
```

- Returns a **cached function reference**
- Recreates function only when dependencies change
- Use when passing callbacks to memoized child components

### Quick Comparison

| Hook | Memoizes | Returns | Use Case |
|---|---|---|---|
| `useMemo` | Result of a function | Cached **value** | Expensive computations |
| `useCallback` | The function itself | Cached **function** | Stable callback refs for children |

```jsx
// Think of it this way:
useMemo(() => computeValue(), [dep])
// is equivalent to:
useCallback(computeValue, [dep]) // but returns the fn, not its result
```

---

## Q18. What are Error Boundaries in React?

### Answer

**Error Boundaries** are React components that **catch JavaScript errors** anywhere in their child component tree and display a fallback UI instead of crashing the whole app.

### Key Points

- Only available as **Class Components** (no Hook equivalent yet)
- Catches errors during **rendering**, lifecycle methods, and constructors
- Does **NOT** catch: event handlers, async code, SSR errors

### Implementation

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // Send to logging service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### Tip: `react-error-boundary` library

Provides a functional-component-friendly wrapper with `useErrorBoundary` hook.

---

## Q19. What is reconciliation in React?

### Answer

**Reconciliation** is the process React uses to update the DOM efficiently when a component's state or props change.

### How It Works

1. React builds a new **Virtual DOM tree** after a re-render
2. It **diffs** the new tree against the previous one (using the **Diffing Algorithm**)
3. Computes the **minimal set of operations** needed
4. Updates only the necessary parts of the **real DOM**

### Diffing Algorithm Rules

- **Different element types** → Destroy old tree, build new one from scratch
- **Same element type** → Update changed attributes only
- **Lists** → Use `key` prop to identify and match elements

### The `key` Prop in Lists

```jsx
// ❌ Bad — React can't identify which item changed
{items.map(item => <Item data={item} />)}

// ✅ Good — stable, unique key helps React reuse elements
{items.map(item => <Item key={item.id} data={item} />)}
```

### Why keys matter

- Without keys → React re-renders entire list on change
- With stable keys → React reuses existing DOM nodes, only updating what changed

---

## Q20. What are some React performance optimization techniques?

### Answer

### 1. `React.memo`
Prevent functional component re-renders when props don't change.
```jsx
const Child = React.memo(({ value }) => <div>{value}</div>);
```

### 2. `useMemo` and `useCallback`
Memoize expensive values and function references.
```jsx
const sorted = useMemo(() => [...items].sort(), [items]);
const handler = useCallback(() => onClick(id), [id]);
```

### 3. Code Splitting & Lazy Loading
Load components only when needed.
```jsx
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

### 4. Virtualization for Long Lists
Use `react-window` or `react-virtual` to render only visible rows.
```jsx
import { FixedSizeList } from 'react-window';
<FixedSizeList height={500} itemCount={10000} itemSize={35}>
  {Row}
</FixedSizeList>
```

### 5. Avoid Anonymous Functions in JSX
```jsx
// ❌ Creates new function on every render
<button onClick={() => handleClick(id)}>Click</button>

// ✅ Use useCallback
const handleClick = useCallback(() => onClick(id), [id]);
<button onClick={handleClick}>Click</button>
```

### 6. Avoid Unnecessary State
Put data that doesn't affect the UI outside of state (use `useRef` for values that shouldn't trigger re-renders).

### 7. Batching State Updates
React 18 automatically batches multiple `setState` calls — even inside async functions.

### 8. Use Production Build
Always use the minified production build for deployment (`npm run build`).

### 9. Avoid Deeply Nested Component Trees
Flatten component structure where possible to reduce reconciliation work.

### 10. Profiler API & React DevTools
Use React DevTools Profiler to identify slow components and rendering bottlenecks.

---

## Summary Cheat Sheet

| Topic | Key Points |
|---|---|
| Virtual DOM | Diffing + Reconciliation = efficient DOM updates |
| Hooks | `useState`, `useEffect`, `useContext`, `useMemo`, `useCallback`, `useRef` |
| Props vs State | Props = read-only from parent; State = internal, mutable |
| Context API | Avoid prop drilling for global data |
| React.memo | Prevent re-renders when props unchanged |
| Lazy Loading | `React.lazy` + `Suspense` for code splitting |
| HOC | Function that takes a component and returns enhanced component |
| Error Boundary | Catch rendering errors, show fallback UI |
| Reconciliation | Diff VDOM trees, patch only changed real DOM nodes |
| Performance | memo, useMemo, useCallback, virtualization, lazy loading |

---

*Good luck with your React interview! 🚀*
