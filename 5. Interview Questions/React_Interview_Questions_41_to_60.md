# React Interview Questions & Answers (Q41 – Q60)

> Expert-level React interview notes — detailed answers, code examples, and key points.

---

## Q41. What is Code Splitting and how does it differ from Lazy Loading?

### Answer

### Code Splitting

**Code Splitting** is the process of breaking your JavaScript bundle into **smaller chunks** that can be loaded independently. Instead of sending one giant JS file to the browser, you send smaller pieces.

- Done at the **build level** by tools like Webpack or Vite
- Results in multiple `.js` chunk files
- Reduces the **initial bundle size**

### Lazy Loading

**Lazy Loading** is the **runtime strategy** of loading those chunks **only when needed** — for example, when a user navigates to a route or a component becomes visible.

```
Code Splitting = How bundles are divided (build-time)
Lazy Loading   = When those bundles are fetched (runtime)
```

### Route-Based Code Splitting (most common)

```jsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

const Home      = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings  = lazy(() => import('./pages/Settings'));

function App() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings"  element={<Settings />} />
      </Routes>
    </Suspense>
  );
}
```

### Component-Level Splitting

```jsx
// Heavy chart library loaded only when Chart is rendered
const HeavyChart = lazy(() => import('./HeavyChart'));

function Analytics({ showChart }) {
  return (
    <div>
      {showChart && (
        <Suspense fallback={<div>Loading chart...</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

### Benefits

- Faster **Time to Interactive (TTI)**
- Lower **initial bundle size**
- Better performance on slow networks / mobile

---

## Q42. What is memoization in React and when should you use it?

### Answer

**Memoization** is an optimization technique that **caches the result** of an expensive computation or the reference of a function/component, and returns the cached version when inputs haven't changed.

### Three Memoization Tools in React

| Tool | Memoizes | Use Case |
|---|---|---|
| `React.memo` | Component renders | Prevent child re-renders |
| `useMemo` | Computed values | Expensive calculations |
| `useCallback` | Function references | Stable callbacks for children |

### `React.memo` — Memoize a Component

```jsx
const ExpensiveList = React.memo(({ items }) => {
  return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
});
// Re-renders ONLY when `items` reference changes
```

### `useMemo` — Memoize a Value

```jsx
const sortedData = useMemo(() => {
  return [...rawData].sort((a, b) => a.score - b.score);
}, [rawData]);
// Recalculates only when rawData changes
```

### `useCallback` — Memoize a Function

```jsx
const handleDelete = useCallback((id) => {
  setItems(prev => prev.filter(item => item.id !== id));
}, []); // stable reference across renders
```

### When to Use Memoization

Use when:
- A child component re-renders too often with same props
- A computation is genuinely expensive (large sort/filter/transform)
- A callback is passed to a memoized child

Avoid when:
- The computation is trivial (memoization overhead outweighs benefit)
- Props change on every render anyway
- Premature optimization without profiling

---

## Q43. How does React handle events? What are Synthetic Events?

### Answer

React does **not** attach event listeners directly to individual DOM nodes. Instead, it uses a single **event delegation** pattern — attaching one listener at the **root** of the app and routing events from there.

### Synthetic Events

React wraps the browser's native event object in a **`SyntheticEvent`** — a cross-browser wrapper that normalizes event properties across all browsers.

```jsx
function Button() {
  const handleClick = (e) => {
    console.log(e.type);          // "click"
    console.log(e.target);        // DOM node
    console.log(e.nativeEvent);   // original browser event
    e.preventDefault();           // works cross-browser
    e.stopPropagation();
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### React vs Native DOM Events

| Feature | React | Native DOM |
|---|---|---|
| Event names | camelCase (`onClick`) | lowercase (`onclick`) |
| Listener attachment | Root delegation | Per element |
| Event object | SyntheticEvent | Native Event |
| Cross-browser | Normalized | Varies |

### Event Pooling (Pre React 17)

Before React 17, SyntheticEvents were **pooled** (reused). Accessing `e` asynchronously would return null. React 17+ removed pooling — events are now regular objects.

### Common Events

```jsx
<input onChange={handleChange} />
<form onSubmit={handleSubmit} />
<div onMouseEnter={handleHover} onMouseLeave={handleLeave} />
<div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} />
<img onLoad={handleLoad} onError={handleError} />
```

---

## Q44. What is the difference between controlled and uncontrolled forms? Which is better?

### Answer

### Controlled Forms (Recommended)

React state is the **single source of truth** for form values. Every change updates state.

```jsx
function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email"    value={form.email}    onChange={handleChange} />
      <input name="password" value={form.password} onChange={handleChange} type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

**Pros:** Real-time validation, dynamic disabling, instant access to values
**Cons:** More boilerplate, re-renders on each keystroke

### Uncontrolled Forms

Form values live in the **DOM**. Accessed via `ref` on submit.

```jsx
function LoginForm() {
  const emailRef    = useRef(null);
  const passwordRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(emailRef.current.value, passwordRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={emailRef}    name="email" />
      <input ref={passwordRef} name="password" type="password" />
      <button type="submit">Login</button>
    </form>
  );
}
```

**Pros:** Less boilerplate, fewer re-renders, great for file inputs
**Cons:** No real-time validation, less React-idiomatic

### Which is Better?

Use **controlled** for most forms. Use **uncontrolled** for simple forms, file uploads, or performance-critical cases.

### Libraries That Simplify Forms

- **React Hook Form** (uncontrolled under the hood, high performance)
- **Formik** (controlled, feature-rich)
- **Zod / Yup** (schema validation)

---

## Q45. What is tree shaking and how does it relate to React apps?

### Answer

**Tree shaking** is a dead code elimination technique used by bundlers (Webpack, Vite, Rollup) to **remove unused exports** from your final bundle.

### How It Works

```javascript
// utils.js — exports three functions
export const add      = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// App.js — only uses `add`
import { add } from './utils';
// After tree shaking: subtract and multiply are NOT in the bundle
```

### In React Context

```jsx
// Imports the entire lodash library
import _ from 'lodash';
const result = _.debounce(fn, 300);

// Tree-shakeable — only imports debounce
import debounce from 'lodash/debounce';
```

### Requirements for Tree Shaking

- **ES Modules** (`import`/`export`) — CommonJS (`require`) is NOT tree-shakeable
- Bundler support (Webpack, Vite, Rollup all support it)
- `"sideEffects": false` in `package.json`

### Impact on React Apps

- Reduces final bundle size significantly
- Critical for libraries like `lodash`, `date-fns`, `MUI`, `antd`
- React itself is tree-shakeable from v16+

---

## Q46. What is the difference between `React.createElement` and JSX?

### Answer

**JSX is syntactic sugar** — Babel compiles every JSX expression into a `React.createElement()` call.

### JSX → createElement

```jsx
// JSX
const element = (
  <div className="container">
    <h1>Hello</h1>
    <p>World</p>
  </div>
);

// Compiled by Babel
const element = React.createElement(
  'div',
  { className: 'container' },
  React.createElement('h1', null, 'Hello'),
  React.createElement('p',  null, 'World')
);
```

### `React.createElement` Signature

```
React.createElement(type, props, ...children)
```

| Argument | Description |
|---|---|
| `type` | HTML tag string `'div'` or React component |
| `props` | Object of attributes / null |
| `...children` | Child elements or text |

### React 17+ New JSX Transform

From React 17, you no longer need to `import React from 'react'` in every file. Babel automatically imports a new JSX runtime:

```jsx
// Old (React 16 and below) — needed React in scope
import React from 'react';
const el = <h1>Hello</h1>;

// New (React 17+) — no React import needed
const el = <h1>Hello</h1>; // Babel handles it automatically
```

---

## Q47. What is `getDerivedStateFromProps`? When should it be used?

### Answer

`static getDerivedStateFromProps(props, state)` is a **class component lifecycle method** that runs **before every render** (mount and update). It returns an object to merge into state, or `null` to change nothing.

### Syntax

```jsx
class EmailInput extends React.Component {
  state = { email: '' };

  static getDerivedStateFromProps(props, state) {
    if (props.userEmail !== state.email) {
      return { email: props.userEmail };
    }
    return null;
  }

  render() {
    return <input value={this.state.email} />;
  }
}
```

### Key Points

- It is `static` — no access to `this`
- Runs on **every render** — both mount and update
- Should return `null` or a partial state object
- Rarely needed — most use cases have better alternatives

### Common Mistakes and Better Alternatives

| Anti-pattern | Better Approach |
|---|---|
| Copy props to state to read later | Read directly from `this.props` |
| Reset state when prop changes | Use `key` prop to remount |
| Compute derived value from props | Use `render()` or `useMemo` |

> `getDerivedStateFromProps` is considered an **escape hatch**. In 99% of cases, you don't need it.

---

## Q48. What is `getSnapshotBeforeUpdate`?

### Answer

`getSnapshotBeforeUpdate(prevProps, prevState)` is a lifecycle method called **right before React updates the DOM**. Whatever it returns is passed as the third argument to `componentDidUpdate`.

### Use Case — Scroll Position Preservation

```jsx
class ChatWindow extends React.Component {
  listRef = React.createRef();

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (prevProps.messages.length < this.props.messages.length) {
      const list = this.listRef.current;
      return list.scrollHeight - list.scrollTop;
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot !== null) {
      const list = this.listRef.current;
      list.scrollTop = list.scrollHeight - snapshot;
    }
  }

  render() {
    return (
      <div ref={this.listRef} style={{ overflowY: 'scroll', height: 300 }}>
        {this.props.messages.map(m => <p key={m.id}>{m.text}</p>)}
      </div>
    );
  }
}
```

### When to Use

- Preserve **scroll position** before a DOM update
- Read DOM layout information before it changes (e.g., element size)

### Functional Equivalent

Use `useLayoutEffect` — it runs synchronously after DOM mutations, before paint.

---

## Q49. How does React handle lists and why are keys important?

### Answer

### Rendering Lists

```jsx
const fruits = ['Apple', 'Banana', 'Cherry'];

function FruitList() {
  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}
```

### Why Keys Matter

Keys help React's **reconciliation algorithm** identify which elements have changed, been added, or removed — enabling efficient DOM updates.

### Without Keys (or bad keys)

```
Old list: [A, B, C]
New list: [X, A, B, C]  ← X inserted at beginning

Without keys → React re-renders A, B, C (thinks everything shifted)
With keys    → React inserts X, reuses A, B, C DOM nodes
```

### Rules for Good Keys

```jsx
// Stable, unique ID from data
{items.map(item => <Item key={item.id} item={item} />)}

// Unique string value (if no ID)
{items.map(item => <Item key={item.slug} item={item} />)}

// Index — breaks on reorder/insert/delete
{items.map((item, i) => <Item key={i} item={item} />)}

// Random — new key every render = remount every time
{items.map(item => <Item key={Math.random()} item={item} />)}
```

### When Index as Key is OK

Only safe when:
1. The list is **static** and never reorders
2. Items are never **inserted** or **deleted** in the middle
3. Items have **no state** of their own

---

## Q50. What is Zustand and how does it compare to Redux?

### Answer

**Zustand** is a lightweight, modern React state management library. It provides a simple, hook-based API with minimal boilerplate.

### Basic Zustand Example

```jsx
import { create } from 'zustand';

const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset:     () => set({ count: 0 }),
}));

// No Provider needed — use anywhere
function Counter() {
  const { count, increment, decrement } = useCounterStore();
  return (
    <div>
      <p>{count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

### Zustand vs Redux

| Feature | Zustand | Redux (Toolkit) |
|---|---|---|
| Boilerplate | Minimal | Moderate |
| Provider required | No | Yes |
| Bundle size | ~1KB | ~15KB |
| DevTools | Via middleware | Excellent built-in |
| Async actions | Simple | RTK Query |
| Learning curve | Very low | Moderate |
| Best for | Small-medium apps | Large, complex apps |

### Zustand vs Context API

- **Context** re-renders all consumers on every update
- **Zustand** uses **subscriptions** — only components that use specific state re-render

---

## Q51. What is React Query (TanStack Query)?

### Answer

**React Query (TanStack Query)** is a powerful data-fetching and server-state management library for React. It handles caching, background refetching, pagination, mutations, and more.

### The Problem It Solves

Without React Query, you typically write repetitive boilerplate in every component:

```jsx
const [data, setData]       = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError]     = useState(null);

useEffect(() => {
  fetch('/api/users').then(r => r.json()).then(setData).catch(setError).finally(() => setLoading(false));
}, []);
```

### With React Query

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetching
function UserList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey:  ['users'],
    queryFn:   () => fetch('/api/users').then(r => r.json()),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <Spinner />;
  if (isError)   return <p>Error: {error.message}</p>;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// Mutation (POST/PUT/DELETE)
function AddUser() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newUser) => fetch('/api/users', { method: 'POST', body: JSON.stringify(newUser) }),
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return <button onClick={() => mutation.mutate({ name: 'Alice' })}>Add User</button>;
}
```

### Key Features

- **Automatic caching** — no duplicate requests
- **Background refetching** — data stays fresh
- **Stale-while-revalidate** — show cached data, update in background
- **Pagination and infinite scroll** support
- **Optimistic updates**
- **DevTools** for debugging

---

## Q52. What is the difference between `memo`, `useMemo`, and `useCallback` in detail?

### Answer

All three are memoization tools but operate at different levels.

### `React.memo` — Component Level

```jsx
const Avatar = React.memo(({ src, alt }) => {
  console.log('Avatar rendered');
  return <img src={src} alt={alt} />;
});
// Parent re-renders → Avatar does NOT re-render if src & alt unchanged
```

### `useMemo` — Value Level

```jsx
const filtered = useMemo(
  () => products.filter(p => p.name.includes(query)),
  [products, query]
);
```

### `useCallback` — Function Level

```jsx
const handleSubmit = useCallback(() => {
  submitForm(userId);
}, [userId]);
```

### How They Work Together

```jsx
const Parent = ({ data }) => {
  const processed  = useMemo(() => heavyProcess(data), [data]);
  const handleClick = useCallback((id) => deleteItem(id), []);

  return <Child items={processed} onDelete={handleClick} />;
};

const Child = React.memo(({ items, onDelete }) => { /* ... */ });
```

### Summary

```
React.memo    → Should I re-render this component?
useMemo       → Should I recalculate this value?
useCallback   → Should I recreate this function?
All three     → "Only if dependencies changed"
```

---

## Q53. What is Hydration in React?

### Answer

**Hydration** is the process where React **attaches event listeners and interactivity** to server-rendered HTML that already exists in the DOM — without re-rendering or replacing the existing HTML.

### How It Works

```
Server → Renders full HTML → Sends to browser
Browser → Displays HTML immediately (fast first paint)
React JS loads → "Hydrates" the HTML (attaches events, state)
```

### Code Example

```jsx
// React 18 hydration
import { hydrateRoot } from 'react-dom/client';

hydrateRoot(
  document.getElementById('root'),
  <App />
);
```

### Hydration Mismatch Errors

Occur when server-rendered HTML doesn't match what React expects to render on the client.

```jsx
// Causes mismatch — Date differs between server and client
function Timestamp() {
  return <p>{new Date().toString()}</p>;
}

// Fix — use useEffect to run only on client
function Timestamp() {
  const [time, setTime] = useState('');
  useEffect(() => setTime(new Date().toString()), []);
  return <p>{time}</p>;
}
```

### Selective Hydration (React 18)

React 18 introduced **selective hydration** — React can hydrate parts of the page independently and prioritize hydrating components the user is interacting with first.

---

## Q54. What is the Context + useReducer pattern?

### Answer

Combining **Context API** with **`useReducer`** creates a lightweight, built-in state management solution — a Redux-like pattern without any external libraries.

### Implementation

```jsx
// 1. Create context
const CartContext  = React.createContext();
const CartDispatch = React.createContext();

// 2. Reducer
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

// 3. Provider component
function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  return (
    <CartContext.Provider value={state}>
      <CartDispatch.Provider value={dispatch}>
        {children}
      </CartDispatch.Provider>
    </CartContext.Provider>
  );
}

// 4. Custom hooks for clean access
const useCart     = () => useContext(CartContext);
const useCartDispatch = () => useContext(CartDispatch);

// 5. Usage anywhere in the tree
function ProductCard({ product }) {
  const dispatch = useCartDispatch();
  return (
    <button onClick={() => dispatch({ type: 'ADD_ITEM', payload: product })}>
      Add to Cart
    </button>
  );
}
```

### When to Use This Pattern

- Medium-sized apps that don't need Redux
- Feature-scoped state (cart, auth, theme)
- When Context alone is too simple and Redux is too heavy

---

## Q55. What is `React.cloneElement`?

### Answer

`React.cloneElement` **clones a React element** and optionally merges new props into the clone. It allows a parent component to inject or override props on its children.

### Syntax

```jsx
React.cloneElement(element, [props], [...children])
```

### Example — Injecting Props into Children

```jsx
function RadioGroup({ children, selectedValue, onChange }) {
  return (
    <div>
      {React.Children.map(children, child =>
        React.cloneElement(child, {
          checked:  child.props.value === selectedValue,
          onChange: onChange,
        })
      )}
    </div>
  );
}

<RadioGroup selectedValue="b" onChange={setValue}>
  <RadioButton value="a" label="Option A" />
  <RadioButton value="b" label="Option B" />
  <RadioButton value="c" label="Option C" />
</RadioGroup>
```

### Common Use Cases

- **Component libraries** — inject classNames, event handlers
- **Layout components** — pass layout-specific props to children
- **Form groups** — inject `name`, `onChange` to all child inputs

### `cloneElement` vs Render Props vs Context

| Method | When to use |
|---|---|
| `cloneElement` | Inject props from parent to direct children |
| Render Props | Share logic and render control |
| Context | Share data deep in the tree |

---

## Q56. What is `React.createPortal` and how does event bubbling work with it?

### Answer

`ReactDOM.createPortal(child, container)` renders a React component **outside its parent's DOM node**, while keeping it in the **React component tree**.

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
    document.getElementById('modal-root')
  );
}
```

### Event Bubbling Behaviour

Even though the portal renders outside the parent in the **DOM tree**, events still bubble up through the **React component tree**.

```jsx
function Parent() {
  const handleClick = () => console.log('Parent clicked!');

  return (
    <div onClick={handleClick}>
      <p>I am the parent</p>
      {ReactDOM.createPortal(
        <button>Click me (inside portal)</button>,
        document.body
      )}
    </div>
  );
}
// Clicking the portal button WILL trigger handleClick on Parent
// even though the button is in <body> in the DOM
```

### Why This Is Intentional

- Portal content is still a **child** in the React tree
- React's event system is based on the **component tree**, not the DOM tree
- Allows portals to access parent's Context, state, etc.

---

## Q57. What are the differences between React 17 and React 18?

### Answer

React 18 introduced major features focused on **concurrency** and **performance**.

### React 18 Key Changes

#### 1. New Root API

```jsx
// React 17
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, document.getElementById('root'));

// React 18
import { createRoot } from 'react-dom/client';
const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

#### 2. Automatic Batching

```jsx
// React 18 — batches EVERYWHERE (setTimeout, Promises, native events)
setTimeout(() => {
  setCount(c => c + 1); // one re-render for both
  setFlag(f => !f);
}, 1000);
```

#### 3. Concurrent Features (opt-in)

- `useTransition` — non-urgent updates
- `useDeferredValue` — defer slow renders
- `startTransition` — mark updates as transitions

#### 4. Suspense SSR Architecture

- Selective hydration — hydrate parts of the page independently
- Streaming HTML from server

#### 5. New Hooks

- `useId` — generate unique IDs for accessibility
- `useTransition`
- `useDeferredValue`
- `useSyncExternalStore` — for external store subscriptions
- `useInsertionEffect` — for CSS-in-JS libraries

### Summary Table

| Feature | React 17 | React 18 |
|---|---|---|
| Root API | `ReactDOM.render` | `createRoot` |
| Batching | Only in event handlers | Everywhere (auto) |
| Concurrent features | No | Yes |
| Suspense SSR | Limited | Streaming + selective hydration |
| New hooks | — | `useId`, `useTransition`, etc. |

---

## Q58. What is `useDeferredValue`?

### Answer

`useDeferredValue` is a React 18 Hook that **defers re-rendering a part of the UI** when it's slow, keeping the rest of the UI responsive. It's the value-level equivalent of `useTransition`.

### Syntax

```jsx
const deferredValue = useDeferredValue(value);
```

### Example — Slow Search Filter

```jsx
import { useState, useDeferredValue, memo } from 'react';

function SearchPage({ items }) {
  const [query, setQuery]       = useState('');
  const deferredQuery           = useDeferredValue(query);

  return (
    <>
      {/* Input updates immediately */}
      <input value={query} onChange={e => setQuery(e.target.value)} />

      {/* List re-renders with slight delay — doesn't block input */}
      <SlowList query={deferredQuery} items={items} />
    </>
  );
}

const SlowList = memo(({ query, items }) => {
  const filtered = items.filter(i => i.includes(query));
  return <ul>{filtered.map(i => <li key={i}>{i}</li>)}</ul>;
});
```

### `useDeferredValue` vs `useTransition`

| Hook | Controls | Use When |
|---|---|---|
| `useTransition` | State updates — wraps the setter | You control the state update |
| `useDeferredValue` | Rendered value — wraps the value | You receive the value from props or can't control update |

---

## Q59. What is `useId` Hook in React 18?

### Answer

`useId` generates a **stable, unique ID** that is consistent between server and client renders. It solves the common problem of generating IDs for accessibility attributes.

### The Problem

```jsx
// Hardcoded — breaks when component is used multiple times
<label htmlFor="email-input">Email</label>
<input id="email-input" type="email" />

// Math.random() — causes hydration mismatch (different on server vs client)
const id = Math.random().toString();
```

### Solution with `useId`

```jsx
import { useId } from 'react';

function FormField({ label, type }) {
  const id = useId(); // generates ":r0:", ":r1:", etc.

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} />
    </div>
  );
}

// Safe to use multiple times — each instance gets a unique ID
<FormField label="Email"    type="email" />
<FormField label="Password" type="password" />
```

### Key Points

- IDs are **stable** — same on server and client (prevents hydration errors)
- Each call to `useId` generates a **unique** ID per component instance
- Not suitable for list keys — use data IDs for those
- You can suffix for multiple related elements:

```jsx
const baseId = useId();
<label htmlFor={`${baseId}-first`}>First Name</label>
<input  id={`${baseId}-first`} />
<label htmlFor={`${baseId}-last`}>Last Name</label>
<input  id={`${baseId}-last`} />
```

---

## Q60. What are some best practices for structuring a large React project?

### Answer

### 1. Feature-Based Folder Structure (Recommended)

```
src/
├── features/
│   ├── auth/
│   │   ├── components/   LoginForm.jsx, SignupForm.jsx
│   │   ├── hooks/        useAuth.js
│   │   ├── api/          authApi.js
│   │   ├── store/        authSlice.js
│   │   └── index.js      (public API of the feature)
│   ├── products/
│   └── cart/
├── shared/
│   ├── components/       Button, Input, Modal (reusable UI)
│   ├── hooks/            useFetch, useDebounce
│   ├── utils/            formatDate, validators
│   └── constants/
├── pages/                Route-level components
├── App.jsx
└── main.jsx
```

### 2. Component Design Principles

- **Single Responsibility** — one component = one job
- **Container / Presentational** — separate logic from UI
- **Keep components small** — under ~200 lines is a good goal

### 3. Custom Hooks for Logic

```jsx
// Fat component — logic mixed with UI
function UserProfile() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchUser().then(setUser).finally(() => setLoading(false)); }, []);
  return loading ? <Spinner /> : <div>{user.name}</div>;
}

// Clean separation
function UserProfile() {
  const { user, loading } = useUser(); // logic in hook
  return loading ? <Spinner /> : <div>{user.name}</div>;
}
```

### 4. Absolute Imports

```json
// jsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src"
  }
}
```

```jsx
// Fragile relative imports
import Button from '../../../shared/components/Button';

// Clean absolute imports
import Button from 'shared/components/Button';
```

### 5. Other Best Practices

- **Co-locate** tests with components (`Button.test.jsx` next to `Button.jsx`)
- **Barrel files** (`index.js`) for clean public APIs of features
- **TypeScript** for type safety in large codebases
- **ESLint + Prettier** for consistent code style
- **Storybook** for documenting and testing UI components in isolation
- **React DevTools Profiler** to find performance bottlenecks

---

## Summary Cheat Sheet (Q41–Q60)

| Topic | Key Points |
|---|---|
| Code Splitting vs Lazy Loading | Splitting = build-time chunks; Lazy = runtime on-demand loading |
| Memoization | `React.memo` (component), `useMemo` (value), `useCallback` (function) |
| Synthetic Events | Cross-browser wrapper, event delegation at root, camelCase names |
| Controlled vs Uncontrolled Forms | Controlled = React state; Uncontrolled = DOM ref |
| Tree Shaking | Dead code elimination; requires ES modules; import specifically |
| JSX vs createElement | JSX compiles to `React.createElement(type, props, children)` |
| getDerivedStateFromProps | Runs before every render; sync state with props; rarely needed |
| getSnapshotBeforeUpdate | Read DOM before update; return value passed to componentDidUpdate |
| Keys in Lists | Must be stable + unique; never use index for dynamic lists |
| Zustand | Lightweight state management; no Provider; hook-based |
| React Query | Server state: caching, refetching, mutations, pagination |
| memo vs useMemo vs useCallback | Component / Value / Function memoization |
| Hydration | Attaches JS interactivity to server-rendered HTML |
| Context + useReducer | Lightweight Redux pattern built into React |
| cloneElement | Clone element and inject/override props |
| Portal event bubbling | Events bubble through React tree, not DOM tree |
| React 17 vs 18 | Auto-batching, concurrent features, new root API, new hooks |
| useDeferredValue | Defer slow value renders to keep UI responsive |
| useId | Stable unique IDs, safe for SSR, accessibility use |
| Project Structure | Feature-based folders, custom hooks, absolute imports, TypeScript |

---

*You're now well-prepared for expert-level React interviews! 🚀*
