# React Interview Questions & Answers (Q21 – Q40)

> Advanced React interview notes — detailed answers, code examples, and key points.

---

## Q21. What is the difference between `useRef` and `useState`?

### Answer

Both `useRef` and `useState` persist values across renders, but they serve very different purposes.

### `useState`

- Stores a value that **affects the UI**
- Updating state **triggers a re-render**
- Returns `[value, setter]`

```jsx
const [count, setCount] = useState(0);
setCount(count + 1); // triggers re-render
```

### `useRef`

- Stores a **mutable value** that does NOT trigger a re-render
- Returns an object `{ current: value }`
- Commonly used to reference **DOM elements** or persist timers/intervals

```jsx
// DOM access
const inputRef = useRef(null);
inputRef.current.focus(); // directly manipulates DOM

// Persisting value without re-render
const timerRef = useRef(null);
timerRef.current = setInterval(() => {}, 1000);
```

### Comparison Table

| Feature | `useState` | `useRef` |
|---|---|---|
| Triggers re-render | ✅ Yes | ❌ No |
| Stores UI-affecting data | ✅ Yes | ❌ No |
| DOM access | ❌ No | ✅ Yes |
| Mutable | Via setter only | Direct `.current` mutation |
| Common use | UI state | DOM refs, timers, previous values |

### Common pattern — store previous value

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const prevCount = useRef(0);

  useEffect(() => {
    prevCount.current = count;
  });

  return <p>Now: {count}, Before: {prevCount.current}</p>;
}
```

---

## Q22. What is `useReducer`? When should you use it over `useState`?

### Answer

`useReducer` is a Hook for managing **complex state logic**. It follows the same pattern as Redux — state transitions are described via **actions** and handled by a **reducer function**.

### Syntax

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

### How It Works

```jsx
// 1. Define initial state
const initialState = { count: 0, step: 1 };

// 2. Define reducer — pure function
function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + state.step };
    case 'DECREMENT':
      return { ...state, count: state.count - state.step };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'RESET':
      return initialState;
    default:
      throw new Error('Unknown action');
  }
}

// 3. Use in component
function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
    </div>
  );
}
```

### `useReducer` vs `useState`

| Scenario | Use |
|---|---|
| Simple, independent values | `useState` |
| Multiple related state fields | `useReducer` |
| Next state depends on previous | `useReducer` |
| Complex update logic | `useReducer` |
| Sharing logic across components | `useReducer` + Context |

---

## Q23. What are Custom Hooks? How do you create one?

### Answer

A **Custom Hook** is a JavaScript function whose name starts with `use` and that **calls other hooks** inside it. Custom hooks let you **extract and reuse stateful logic** across multiple components.

### Rules

- Name must start with `use`
- Can call other hooks inside
- Each component using the hook gets its own isolated state

### Example — `useFetch` Custom Hook

```jsx
// useFetch.js
import { useState, useEffect } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}

// Usage in any component
function UserList() {
  const { data, loading, error } = useFetch('https://api.example.com/users');

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### Other Common Custom Hooks

- `useLocalStorage(key, initial)` — sync state with localStorage
- `useDebounce(value, delay)` — debounce rapidly changing values
- `useWindowSize()` — track window dimensions
- `useOnClickOutside(ref, handler)` — detect clicks outside element
- `usePrevious(value)` — track previous value

---

## Q24. What is `React.StrictMode`? What does it do?

### Answer

`React.StrictMode` is a development tool that **highlights potential problems** in your application. It does **nothing in production** — it only runs in development mode.

### Usage

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### What StrictMode Does

1. **Double-invokes** render functions, constructors, and function components to detect side effects — helps find impure renders
2. **Double-invokes** `useState`, `useMemo`, and `useReducer` initializers
3. **Warns** about deprecated lifecycle methods (`componentWillMount`, `componentWillUpdate`, etc.)
4. **Detects** unexpected side effects in `useEffect`
5. **Warns** about legacy `findDOMNode` usage
6. **Warns** about legacy Context API usage

### Key Point

> If you see a component rendering twice in dev mode — that's StrictMode working correctly. It is intentional.

---

## Q25. What is the difference between `key` prop and `ref` prop?

### Answer

### `key` Prop

- A **special hint** for React's reconciliation algorithm
- Helps React identify which items have changed, been added, or removed in a **list**
- Not accessible inside the component — it's not a real prop
- Should be **stable, unique, and predictable**

```jsx
// ✅ Use stable IDs as keys
{users.map(user => <UserCard key={user.id} user={user} />)}

// ❌ Avoid index as key (causes bugs on reorder/delete)
{users.map((user, index) => <UserCard key={index} user={user} />)}
```

### `ref` Prop

- Used to **access the underlying DOM element** or component instance
- Accessible via `useRef()` or `createRef()`
- Used for direct DOM manipulation (focus, scroll, animations)

```jsx
const inputRef = useRef(null);

<input ref={inputRef} />

// Programmatic focus
inputRef.current.focus();
```

### Key Differences

| Feature | `key` | `ref` |
|---|---|---|
| Purpose | List reconciliation | DOM / instance access |
| Accessible in component | ❌ No | ✅ Yes |
| Causes re-render | ❌ No | ❌ No |
| Used with | Lists/arrays | DOM elements, class instances |

---

## Q26. What is `forwardRef` in React?

### Answer

`React.forwardRef` allows a **parent component to pass a `ref` down to a child component's DOM element**. By default, refs do not pass through functional components.

### Problem Without `forwardRef`

```jsx
// This won't work — ref won't point to the input
function Input(props) {
  return <input {...props} />;
}

const ref = useRef();
<Input ref={ref} /> // ❌ ref is null
```

### Solution with `forwardRef`

```jsx
const Input = React.forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// Parent
function Form() {
  const inputRef = useRef(null);

  const focusInput = () => inputRef.current.focus();

  return (
    <>
      <Input ref={inputRef} placeholder="Type here..." />
      <button onClick={focusInput}>Focus Input</button>
    </>
  );
}
```

### Use Cases

- Building reusable **UI component libraries** (inputs, modals, tooltips)
- Wrapping third-party components
- Exposing DOM methods to parent

### Combine with `useImperativeHandle`

```jsx
const Input = React.forwardRef((props, ref) => {
  const innerRef = useRef();

  useImperativeHandle(ref, () => ({
    focus: () => innerRef.current.focus(),
    clear: () => { innerRef.current.value = ''; }
  }));

  return <input ref={innerRef} {...props} />;
});
```

---

## Q27. What is Server-Side Rendering (SSR) vs Client-Side Rendering (CSR) in React?

### Answer

### Client-Side Rendering (CSR)

- Browser downloads a **minimal HTML shell + JS bundle**
- JavaScript runs in browser to render the UI
- Used by standard React apps (`create-react-app`)

```
Request → Server sends empty HTML + JS → JS executes → UI renders
```

**Pros:** Rich interactions, fast after initial load, cheap server
**Cons:** Slow initial load, poor SEO (content not in HTML)

### Server-Side Rendering (SSR)

- Server renders the full HTML for each request
- Browser receives **fully populated HTML**
- JavaScript then "hydrates" (attaches event listeners)
- Used by **Next.js**

```
Request → Server renders full HTML → Browser displays → JS hydrates
```

**Pros:** Fast first paint, excellent SEO, good for slow devices
**Cons:** Server load, slower time-to-interactive for complex pages

### Static Site Generation (SSG)

- HTML is pre-built at **build time** (not per request)
- Fastest possible delivery via CDN
- Used by Next.js (`getStaticProps`)

### Comparison Table

| Feature | CSR | SSR | SSG |
|---|---|---|---|
| Render location | Browser | Server | Build time |
| SEO | Poor | Excellent | Excellent |
| Initial load | Slow | Fast | Fastest |
| Server cost | Low | High | Very Low |
| Use case | Dashboards, apps | E-commerce, blogs | Docs, marketing sites |

---

## Q28. What is Next.js and how does it differ from React?

### Answer

**Next.js** is a **React framework** built on top of React that provides a full-featured production environment with built-in SSR, routing, API routes, and more.

### React vs Next.js

| Feature | React (plain) | Next.js |
|---|---|---|
| Type | UI Library | Full Framework |
| Routing | Manual (React Router) | File-based (automatic) |
| SSR / SSG | Manual setup | Built-in |
| API Routes | Separate backend | Built-in `/api` folder |
| SEO | Poor by default | Excellent |
| Image optimization | Manual | Built-in `<Image />` |
| Code splitting | Manual | Automatic |

### Key Next.js Features

```
pages/
  index.js         → route: /
  about.js         → route: /about
  api/
    users.js       → API endpoint: /api/users
```

### Data Fetching in Next.js

```jsx
// SSG — build time
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data } };
}

// SSR — per request
export async function getServerSideProps(context) {
  const data = await fetchData(context.params.id);
  return { props: { data } };
}

// ISR — regenerate after N seconds
export async function getStaticProps() {
  return { props: { data }, revalidate: 60 };
}
```

---

## Q29. What is React Suspense?

### Answer

**`React.Suspense`** is a component that lets you **declaratively wait** for something (a lazy component, data fetch) to load, and show a **fallback UI** in the meantime.

### With Lazy Loading

```jsx
import { Suspense, lazy } from 'react';

const ProfilePage = lazy(() => import('./ProfilePage'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfilePage />
    </Suspense>
  );
}
```

### Nested Suspense Boundaries

```jsx
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <Suspense fallback={<FeedSkeleton />}>
    <Feed />
  </Suspense>
  <Suspense fallback={<SidebarSkeleton />}>
    <Sidebar />
  </Suspense>
</Suspense>
```

### React 18 — Suspense for Data Fetching

With React 18 and libraries like **React Query** or **Relay**, Suspense can also handle async data loading:

```jsx
// Component "suspends" while data loads
function UserProfile({ userId }) {
  const user = use(fetchUser(userId)); // experimental use() hook
  return <div>{user.name}</div>;
}
```

### Key Points

- `fallback` prop accepts any React element (spinner, skeleton, etc.)
- Multiple Suspense boundaries allow **fine-grained loading states**
- Works best with concurrent features in React 18

---

## Q30. What are React Portals?

### Answer

**React Portals** allow you to render a child component **outside the parent component's DOM hierarchy**, while still maintaining React's event system.

### Syntax

```jsx
import ReactDOM from 'react-dom';

function Modal({ children, onClose }) {
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>,
    document.getElementById('modal-root') // renders HERE in DOM
  );
}
```

```html
<!-- index.html -->
<div id="root"></div>
<div id="modal-root"></div>  <!-- Portal target -->
```

### Why Use Portals?

- **Modals / Dialogs** — Need to escape parent's `overflow: hidden` or `z-index`
- **Tooltips / Popovers** — Must appear above all content
- **Notifications / Toasts** — Fixed position overlays

### Key Behaviour

- Even though the Portal renders outside the parent DOM, **React events still bubble up** through the React component tree (not the DOM tree)
- Context still works normally inside portals

---

## Q31. What is the Flux Architecture?

### Answer

**Flux** is an application architecture pattern created by Facebook as an alternative to MVC. It enforces a **unidirectional data flow** and was the inspiration for Redux.

### Core Concepts

- **Action** — An object describing what happened `{ type, payload }`
- **Dispatcher** — Central hub that broadcasts actions to all stores
- **Store** — Holds application state and logic; updates in response to actions
- **View** — React components that read from stores and dispatch actions

### Data Flow

```
Action → Dispatcher → Store → View → (user interaction) → Action
```

### Flux vs Redux

| Feature | Flux | Redux |
|---|---|---|
| Stores | Multiple stores | Single store |
| Dispatcher | Required | Not needed |
| State mutation | Allowed in store | Reducers return new state |
| Complexity | Higher | Lower |
| Ecosystem | Less tooling | Rich tooling (DevTools) |

> Redux is essentially a simplified, more opinionated implementation of Flux.

---

## Q32. What is the difference between `React.Component` and `React.PureComponent`?

### Answer

### `React.Component`

- Re-renders **every time** `setState` is called or parent re-renders
- No built-in optimization
- Use `shouldComponentUpdate` to manually control re-renders

### `React.PureComponent`

- Automatically implements `shouldComponentUpdate` with a **shallow comparison** of props and state
- Re-renders only if props or state have actually changed (by reference/value)
- Performance optimization for class components

```jsx
class RegularComponent extends React.Component {
  render() {
    console.log('RegularComponent rendered');
    return <div>{this.props.name}</div>;
  }
}

class OptimizedComponent extends React.PureComponent {
  render() {
    console.log('OptimizedComponent rendered');
    return <div>{this.props.name}</div>;
  }
}
```

### Caveats of PureComponent

- **Shallow comparison only** — nested objects/arrays won't detect deep changes
- If you mutate state/props directly, PureComponent may skip necessary re-renders

### Modern Equivalent

`React.PureComponent` (class) ≈ `React.memo` (functional)

---

## Q33. What is the `children` prop in React?

### Answer

The **`children` prop** is a special built-in prop that contains whatever is passed **between the opening and closing tags** of a component.

### Basic Usage

```jsx
function Card({ children, title }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Usage
<Card title="Welcome">
  <p>This is passed as children.</p>
  <button>Click Me</button>
</Card>
```

### `React.Children` API

Utility methods for working with `children`:

```jsx
function List({ children }) {
  return (
    <ul>
      {React.Children.map(children, (child, index) => (
        <li key={index}>{child}</li>
      ))}
    </ul>
  );
}
```

### Useful Methods

- `React.Children.map(children, fn)` — iterate children
- `React.Children.count(children)` — count children
- `React.Children.toArray(children)` — convert to flat array
- `React.Children.only(children)` — assert single child

### Render Props Pattern (advanced children)

```jsx
function DataProvider({ children }) {
  const data = useFetchData();
  return children(data); // children is a function!
}

<DataProvider>
  {(data) => <Chart data={data} />}
</DataProvider>
```

---

## Q34. What is the Render Props Pattern?

### Answer

**Render Props** is a pattern for sharing logic between components by passing a **function as a prop** (or as `children`) that returns JSX. The component calls this function to decide what to render.

### Example — Mouse Tracker

```jsx
class MouseTracker extends React.Component {
  state = { x: 0, y: 0 };

  handleMouseMove = (e) => {
    this.setState({ x: e.clientX, y: e.clientY });
  };

  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)} {/* render prop */}
      </div>
    );
  }
}

// Usage
<MouseTracker render={({ x, y }) => (
  <p>Mouse at ({x}, {y})</p>
)} />
```

### With `children` as a function

```jsx
<MouseTracker>
  {({ x, y }) => <p>Mouse at ({x}, {y})</p>}
</MouseTracker>
```

### Render Props vs HOC vs Custom Hooks

| Pattern | Code style | Nesting | Flexibility |
|---|---|---|---|
| HOC | Wraps component | Can cause deep nesting | Moderate |
| Render Props | Function prop | Less nesting | High |
| Custom Hooks | Hook function | No nesting | Highest |

> Today, **Custom Hooks** are preferred over both HOC and Render Props for most use cases.

---

## Q35. What is `useImperativeHandle` Hook?

### Answer

`useImperativeHandle` customizes the **instance value exposed to parent components** when using `ref`. It lets you expose specific methods instead of the entire DOM node.

### Syntax

```jsx
useImperativeHandle(ref, () => ({
  // methods to expose
}), [deps]);
```

### Example

```jsx
const FancyInput = React.forwardRef((props, ref) => {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    clear: () => { inputRef.current.value = ''; },
    getValue: () => inputRef.current.value,
  }));

  return <input ref={inputRef} {...props} />;
});

// Parent
function Form() {
  const inputRef = useRef(null);

  return (
    <>
      <FancyInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
      <button onClick={() => inputRef.current.clear()}>Clear</button>
    </>
  );
}
```

### When to Use

- Building reusable component libraries
- When you want to **limit what a parent can do** with a child's DOM node
- Exposing imperative methods like `play()`, `pause()`, `scroll()`, `reset()`

---

## Q36. What are React Fragments?

### Answer

**React Fragments** let you group multiple children elements **without adding an extra DOM node**.

### Problem Without Fragments

```jsx
// ❌ Adds unnecessary <div> wrapper to the DOM
function Columns() {
  return (
    <div>
      <td>Column 1</td>
      <td>Column 2</td>
    </div>
  );
}
```

### Solution with Fragments

```jsx
// ✅ No extra DOM node
function Columns() {
  return (
    <React.Fragment>
      <td>Column 1</td>
      <td>Column 2</td>
    </React.Fragment>
  );
}

// Short syntax
function Columns() {
  return (
    <>
      <td>Column 1</td>
      <td>Column 2</td>
    </>
  );
}
```

### When Fragments with `key` are needed

Short syntax `<>` does NOT support `key`. Use full `<React.Fragment>` when rendering lists:

```jsx
{items.map(item => (
  <React.Fragment key={item.id}>
    <dt>{item.term}</dt>
    <dd>{item.description}</dd>
  </React.Fragment>
))}
```

---

## Q37. What is the difference between `useLayoutEffect` and `useEffect`?

### Answer

Both hooks run after rendering, but at **different times** in the browser's rendering process.

### `useEffect`

- Runs **asynchronously after** the browser paints the screen
- Does not block visual updates
- Best for: API calls, subscriptions, logging

```jsx
useEffect(() => {
  document.title = 'New Title'; // runs after paint
}, []);
```

### `useLayoutEffect`

- Runs **synchronously after** DOM mutations but **before** the browser paints
- Blocks the browser paint until it finishes
- Best for: DOM measurements, synchronous animations, preventing flickers

```jsx
useLayoutEffect(() => {
  const rect = divRef.current.getBoundingClientRect();
  setHeight(rect.height); // measure before paint, no flicker
}, []);
```

### Execution Order

```
Render → DOM Updated → useLayoutEffect → Browser Paint → useEffect
```

### When to Use Which

| Scenario | Hook |
|---|---|
| API calls, subscriptions | `useEffect` |
| DOM measurements (width, height) | `useLayoutEffect` |
| Animations that need DOM size | `useLayoutEffect` |
| Avoiding visual flicker | `useLayoutEffect` |
| Everything else | `useEffect` (default choice) |

> ⚠️ Prefer `useEffect` by default. Only switch to `useLayoutEffect` if you see visual flickering or need synchronous DOM reads.

---

## Q38. What is the `useTransition` Hook (React 18)?

### Answer

`useTransition` is a React 18 Hook that lets you mark certain state updates as **non-urgent (transitions)**. This allows React to keep the UI responsive while rendering slow updates in the background.

### Syntax

```jsx
const [isPending, startTransition] = useTransition();
```

### Example — Search with Large List

```jsx
import { useState, useTransition } from 'react';

function SearchPage({ items }) {
  const [query, setQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState(items);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e) {
    const value = e.target.value;
    setQuery(value); // Urgent — update input immediately

    startTransition(() => {
      // Non-urgent — filter 10,000 items in background
      setFilteredItems(items.filter(item => item.includes(value)));
    });
  }

  return (
    <>
      <input value={query} onChange={handleSearch} />
      {isPending && <p>Updating list...</p>}
      <ul>
        {filteredItems.map(item => <li key={item}>{item}</li>)}
      </ul>
    </>
  );
}
```

### Key Points

- Urgent updates (typing) remain instant
- Non-urgent updates (filtering, pagination) are deferred
- `isPending` is `true` while the transition is in progress
- Related: `useDeferredValue` — defers re-rendering a specific value

---

## Q39. What is Concurrent Mode in React 18?

### Answer

**Concurrent Mode** (Concurrent React) is a set of new features in **React 18** that allow React to **interrupt, pause, resume, or abandon renders** to keep the UI responsive.

### Key Concept

Previously, React rendering was **synchronous and uninterruptible** — once started, a render couldn't be paused. Concurrent React uses a **priority-based scheduler** to manage work.

### How to Enable

```jsx
// React 18 — creates a concurrent root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
```

### New Concurrent Features

| Feature | What it does |
|---|---|
| `useTransition` | Mark updates as non-urgent |
| `useDeferredValue` | Defer re-rendering a slow value |
| `Suspense` (enhanced) | Better data-fetching integration |
| Automatic Batching | Batch state updates in async code too |
| `startTransition` | API version of `useTransition` |

### Automatic Batching (React 18)

```jsx
// Before React 18 — two separate renders inside setTimeout
setTimeout(() => {
  setCount(c => c + 1); // render 1
  setFlag(f => !f);     // render 2
}, 1000);

// React 18 — automatically batched into ONE render
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // → only 1 re-render
}, 1000);
```

---

## Q40. What are some common React anti-patterns to avoid?

### Answer

### 1. ❌ Mutating State Directly

```jsx
// WRONG
state.items.push(newItem);
setState(state);

// CORRECT
setState(prev => ({ ...prev, items: [...prev.items, newItem] }));
```

### 2. ❌ Using Index as Key in Dynamic Lists

```jsx
// WRONG — breaks on reorder/delete
{items.map((item, i) => <Item key={i} />)}

// CORRECT
{items.map(item => <Item key={item.id} />)}
```

### 3. ❌ Overusing State (Derived State)

```jsx
// WRONG — fullName is derived, don't store it in state
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState(''); // ❌

// CORRECT — compute it
const fullName = `${firstName} ${lastName}`;
```

### 4. ❌ Calling Hooks Conditionally

```jsx
// WRONG — violates Rules of Hooks
if (isLoggedIn) {
  const [data, setData] = useState(null); // ❌
}

// CORRECT — always call hooks at top level
const [data, setData] = useState(null);
```

### 5. ❌ Not Cleaning Up `useEffect`

```jsx
// WRONG — memory leak
useEffect(() => {
  const subscription = subscribe();
}, []);

// CORRECT — cleanup
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

### 6. ❌ Prop Drilling Instead of Context

Passing props 4+ levels deep makes code hard to maintain. Use Context or a state manager.

### 7. ❌ Anonymous Functions in JSX (for memoized children)

```jsx
// WRONG — new function reference every render, breaks React.memo
<Button onClick={() => handleClick(id)} />

// CORRECT
const handleClick = useCallback(() => onClick(id), [id]);
<Button onClick={handleClick} />
```

### 8. ❌ Giant Components

Split large components into smaller, focused ones. Each component should do one thing well.

### 9. ❌ Fetching Data Without Loading/Error States

Always handle all three states: loading, error, and success.

### 10. ❌ Not Using React DevTools

Skipping profiling leads to shipping slow apps. Always profile before optimising.

---

## Summary Cheat Sheet (Q21–Q40)

| Topic | Key Points |
|---|---|
| `useRef` vs `useState` | ref = no re-render, DOM access; state = triggers render |
| `useReducer` | Complex state, action-based updates, Redux-like pattern |
| Custom Hooks | Reusable stateful logic, name starts with `use` |
| StrictMode | Dev-only; double-invokes renders to detect side effects |
| `forwardRef` | Pass ref through functional components to DOM nodes |
| SSR vs CSR | SSR = SEO + fast paint; CSR = rich SPA; SSG = static |
| Next.js | React framework with built-in routing, SSR, SSG, API routes |
| Suspense | Fallback UI while lazy component or data loads |
| Portals | Render outside parent DOM, events still bubble in React tree |
| Flux | Unidirectional data flow pattern (inspired Redux) |
| PureComponent | Shallow prop/state comparison, skips unnecessary renders |
| children prop | Content between component tags; can be function (render prop) |
| Render Props | Share logic via function prop that returns JSX |
| `useImperativeHandle` | Expose specific methods from child via ref |
| Fragments | Group elements without extra DOM wrapper |
| `useLayoutEffect` | Synchronous, before paint — for DOM measurements |
| `useTransition` | Mark slow updates as non-urgent to keep UI responsive |
| Concurrent Mode | React 18 — interruptible renders, priority scheduler |
| Anti-patterns | Avoid mutating state, index keys, conditional hooks, no cleanup |

---

*Keep practising and you'll ace that React interview! 🚀*
