# React Interview Questions & Answers (Q61 – Q80)

> Senior / Advanced React interview notes — detailed answers, code examples, and key points.

---

## Q61. What is the Compound Component Pattern?

### Answer

The **Compound Component Pattern** is a design pattern where multiple components work together to share implicit state, giving the consumer flexible control over how the UI is composed — without excessive prop drilling.

Think of it like HTML's `<select>` and `<option>` — they work together but you control how they're structured.

### Problem Without the Pattern

```jsx
// Rigid API — hard to customize layout or order
<Tabs
  items={[
    { label: 'Home',    content: <Home /> },
    { label: 'Profile', content: <Profile /> },
  ]}
/>
```

### Solution — Compound Components

```jsx
// Flexible API — consumer controls structure
<Tabs>
  <Tabs.List>
    <Tabs.Tab id="home">Home</Tabs.Tab>
    <Tabs.Tab id="profile">Profile</Tabs.Tab>
  </Tabs.List>

  <Tabs.Panel id="home">
    <Home />
  </Tabs.Panel>
  <Tabs.Panel id="profile">
    <Profile />
  </Tabs.Panel>
</Tabs>
```

### Implementation Using Context

```jsx
const TabsContext = React.createContext();

function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(null);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabList({ children }) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Tab = function Tab({ id, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  return (
    <button
      className={activeTab === id ? 'active' : ''}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ id, children }) {
  const { activeTab } = useContext(TabsContext);
  return activeTab === id ? <div>{children}</div> : null;
};
```

### Benefits

- Maximum **flexibility** for the consumer
- Shared **implicit state** without prop drilling
- Clean, readable JSX usage
- Common in UI libraries like Radix UI, Headless UI, Reach UI

---

## Q62. What is the Provider Pattern in React?

### Answer

The **Provider Pattern** uses React Context to **inject shared dependencies** (state, services, theme, auth) into a component subtree through a single wrapper component.

### Basic Structure

```jsx
// 1. Create context
const AuthContext = React.createContext(null);

// 2. Provider component encapsulates logic
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (credentials) => {
    const userData = await loginApi(credentials);
    setUser(userData);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook for clean access
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

// 4. Wrap the app
function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

// 5. Use anywhere in the tree
function Navbar() {
  const { user, logout } = useAuth();
  return user ? <button onClick={logout}>Logout {user.name}</button> : <LoginLink />;
}
```

### Nesting Multiple Providers

```jsx
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Router />
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
```

### Best Practices

- Always create a **custom hook** (`useAuth`, `useTheme`) to consume context
- Throw an error if context is consumed outside its provider
- Split contexts that change at different rates to prevent unnecessary re-renders

---

## Q63. What is the Observer Pattern and how does it apply to React?

### Answer

The **Observer Pattern** defines a one-to-many dependency: when one object (the **subject**) changes state, all its **observers** are notified and updated automatically.

In React, this pattern is used in:
- **Event emitters** — subscribe/unsubscribe to events
- **State management libraries** — Zustand, Redux (components subscribe to store)
- **Custom event buses** — cross-component communication

### Simple Event Bus Implementation

```jsx
// eventBus.js
class EventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    this.listeners[event] = (this.listeners[event] || []).filter(cb => cb !== callback);
  }

  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }
}

export const eventBus = new EventBus();

// ComponentA — emits
function ComponentA() {
  return (
    <button onClick={() => eventBus.emit('user:updated', { name: 'Alice' })}>
      Update User
    </button>
  );
}

// ComponentB — observes
function ComponentB() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handler = (data) => setUser(data);
    eventBus.on('user:updated', handler);
    return () => eventBus.off('user:updated', handler); // cleanup
  }, []);

  return <p>{user ? `User: ${user.name}` : 'No user'}</p>;
}
```

### React's Built-in Observer-like Hooks

- `useSyncExternalStore` — subscribe to external stores correctly
- Context + useReducer — components observe shared state

---

## Q64. What is `useSyncExternalStore`?

### Answer

`useSyncExternalStore` is a React 18 Hook designed for **subscribing to external data sources** (outside React state) in a way that is safe with concurrent rendering.

### Why It Exists

Before React 18, using `useEffect` + `useState` to subscribe to external stores caused **tearing** — different components reading the store at different times during a concurrent render, showing inconsistent data.

### Syntax

```jsx
const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?);
```

- `subscribe(callback)` — registers a callback, called when the store changes; returns an unsubscribe function
- `getSnapshot()` — returns the current value from the store
- `getServerSnapshot()` — optional, for SSR

### Example — Subscribe to Browser Online Status

```jsx
import { useSyncExternalStore } from 'react';

function subscribe(callback) {
  window.addEventListener('online',  callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online',  callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function NetworkStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot);
  return <p>You are {isOnline ? 'online' : 'offline'}</p>;
}
```

### Example — Custom Store

```jsx
// Simple external store
let count = 0;
const listeners = new Set();

const countStore = {
  increment() { count++; listeners.forEach(l => l()); },
  getSnapshot() { return count; },
  subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb); },
};

function Counter() {
  const value = useSyncExternalStore(countStore.subscribe, countStore.getSnapshot);
  return <button onClick={countStore.increment}>Count: {value}</button>;
}
```

### When to Use

- Building custom state management libraries
- Subscribing to browser APIs (scroll position, media queries)
- Wrapping legacy non-React stores

---

## Q65. What is React's Reconciliation algorithm in depth?

### Answer

React's **Reconciliation** is the process of comparing the previous Virtual DOM tree with the new one and computing the minimal set of DOM operations to apply.

### Core Algorithm Rules

#### Rule 1 — Different Element Types

If root element type changes, React **tears down** the old tree and builds a new one from scratch.

```jsx
// Old: <div><Counter /></div>
// New: <span><Counter /></span>
// → Counter is unmounted and remounted (loses state)
```

#### Rule 2 — Same Element Type — DOM Nodes

React keeps the same DOM node and updates only **changed attributes**.

```jsx
// Old: <div className="before" title="stuff" />
// New: <div className="after" title="stuff" />
// → Only className attribute is updated
```

#### Rule 3 — Same Element Type — Components

React keeps the same component instance (state is preserved) and updates props.

#### Rule 4 — Keys in Lists

Without keys, React diffs by **position**. With keys, React diffs by **identity**.

```jsx
// Without keys — React sees: position 0 changed, 1 changed, 2 changed (3 updates)
// [A, B, C] → [X, A, B, C]

// With keys — React sees: new item X inserted (1 insert, 0 updates)
// [A:keyA, B:keyB, C:keyC] → [X:keyX, A:keyA, B:keyB, C:keyC]
```

### React Fiber — The Modern Reconciler

**React Fiber** (introduced in React 16) is the reimplementation of the reconciliation engine that enables:

- **Incremental rendering** — split work into chunks
- **Priority-based scheduling** — urgent updates (user input) over background ones
- **Pause, abort, or reuse work** — the basis of Concurrent Mode
- **Better error handling** — Error Boundaries

### Heuristics React Makes

- Reconciliation is O(n) — linear time — because React assumes:
  - Elements at different levels are rarely moved across the tree
  - Elements of the same type stay the same
  - Keys uniquely identify elements across renders

---

## Q66. What is the difference between `React.lazy` and dynamic `import()`?

### Answer

### Dynamic `import()` (JavaScript)

A **native JavaScript feature** that returns a Promise resolving to the module. It triggers code splitting in bundlers.

```javascript
// Plain JavaScript — returns a Promise
import('./HeavyModule').then(module => {
  module.doSomething();
});
```

Used for: loading libraries, utilities, or non-component code on demand.

### `React.lazy()` (React)

A **React wrapper** around dynamic `import()` specifically for **lazy-loading React components**. It integrates with `Suspense` to show a fallback while loading.

```jsx
import { lazy, Suspense } from 'react';

// React.lazy wraps the dynamic import
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Key Differences

| Feature | `dynamic import()` | `React.lazy()` |
|---|---|---|
| Returns | Promise | Lazy component |
| Works with Suspense | No | Yes |
| Used for | Any JS module | React components only |
| Needs `Suspense` wrapper | No | Yes |
| Default export required | No | Yes |

### Important: `React.lazy` requires a **default export**

```jsx
// HeavyComponent.jsx
export default function HeavyComponent() { ... } // must be default
```

---

## Q67. What is the difference between imperative and declarative programming in React?

### Answer

### Imperative Programming

You describe **how** to do something — step by step instructions.

```javascript
// Imperative — manually manipulating DOM
const btn = document.getElementById('btn');
btn.textContent = 'Loading...';
btn.disabled = true;
fetch('/api/data').then(res => res.json()).then(data => {
  btn.textContent = 'Done';
  btn.disabled = false;
  document.getElementById('list').innerHTML = data.map(d => `<li>${d.name}</li>`).join('');
});
```

### Declarative Programming

You describe **what** you want — React figures out how to make the DOM match.

```jsx
// Declarative — describe the desired state
function DataLoader() {
  const [loading, setLoading] = useState(false);
  const [data,    setData]    = useState([]);

  const loadData = async () => {
    setLoading(true);
    const res = await fetch('/api/data');
    setData(await res.json());
    setLoading(false);
  };

  return (
    <>
      <button disabled={loading} onClick={loadData}>
        {loading ? 'Loading...' : 'Done'}
      </button>
      <ul>{data.map(d => <li key={d.id}>{d.name}</li>)}</ul>
    </>
  );
}
```

### Why Declarative Is Better in React

- Easier to **reason about** — UI is a function of state
- Less prone to bugs — no manual DOM sync
- More **predictable** — same state always produces same UI
- Easier to test

```
UI = f(state)   ← React's core mental model
```

---

## Q68. What is `React.Children` API and when to use it?

### Answer

`React.Children` is a utility that provides methods for working with the `children` prop safely — handling cases where `children` may be `undefined`, a single element, or multiple elements.

### Methods

#### `React.Children.map(children, fn)`

```jsx
function List({ children }) {
  return (
    <ul>
      {React.Children.map(children, (child, i) => (
        <li key={i}>{child}</li>
      ))}
    </ul>
  );
}

<List>
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
</List>
```

#### `React.Children.count(children)`

```jsx
function Carousel({ children }) {
  const total = React.Children.count(children);
  return <p>Showing {total} slides</p>;
}
```

#### `React.Children.only(children)`

```jsx
// Throws if children is not exactly one element
function Wrapper({ children }) {
  React.Children.only(children); // enforce single child
  return <div className="wrapper">{children}</div>;
}
```

#### `React.Children.toArray(children)`

```jsx
function SortedList({ children }) {
  const arr = React.Children.toArray(children);
  const sorted = arr.sort((a, b) => a.props.value - b.props.value);
  return <ul>{sorted}</ul>;
}
```

#### `React.Children.forEach(children, fn)`

Like `map` but returns nothing — for side effects.

### Why Not Use `children.map()` Directly?

- `children` can be `undefined`, a single element, or an array
- `React.Children.map` handles all cases safely without throwing

---

## Q69. How does batching work in React and what changed in React 18?

### Answer

**Batching** is React's strategy of **grouping multiple state updates into a single re-render** to improve performance.

### React 17 — Partial Batching

Only batched updates inside **React event handlers**:

```jsx
// Inside React event handler — batched (1 re-render)
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
}

// Inside setTimeout/Promise — NOT batched (2 re-renders in React 17)
setTimeout(() => {
  setCount(c => c + 1); // re-render 1
  setFlag(f => !f);     // re-render 2
}, 1000);
```

### React 18 — Automatic Batching (Everywhere)

React 18 batches updates in **all contexts** by default:

```jsx
// setTimeout — now batched in React 18 (1 re-render)
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f); // only 1 re-render
}, 1000);

// Promises — batched
fetch('/api').then(() => {
  setData(result);
  setLoading(false); // 1 re-render
});

// Native event listeners — batched
element.addEventListener('click', () => {
  setA(1);
  setB(2); // 1 re-render
});
```

### Opting Out of Batching

Use `flushSync` when you need an immediate DOM update:

```jsx
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => setCount(c => c + 1)); // forces immediate re-render
  // DOM is updated here
  flushSync(() => setFlag(f => !f));     // another immediate re-render
}
```

### Why Batching Matters

- Fewer re-renders = better performance
- Avoids intermediate states (e.g., `loading: true, data: null` flash)

---

## Q70. What is the `useDebugValue` Hook?

### Answer

`useDebugValue` is a Hook used inside **custom hooks** to display a **label in React DevTools**, making it easier to debug complex custom hooks.

### Syntax

```jsx
useDebugValue(value);
useDebugValue(value, formatFn); // formatFn defers formatting until DevTools is open
```

### Example

```jsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handle = () => setIsOnline(navigator.onLine);
    window.addEventListener('online',  handle);
    window.addEventListener('offline', handle);
    return () => {
      window.removeEventListener('online',  handle);
      window.removeEventListener('offline', handle);
    };
  }, []);

  // Shows "OnlineStatus: Online" or "OnlineStatus: Offline" in DevTools
  useDebugValue(isOnline ? 'Online' : 'Offline');

  return isOnline;
}
```

### With a Format Function (Deferred)

```jsx
function useAuth() {
  const [user] = useState({ name: 'Alice', role: 'admin', lastLogin: new Date() });

  // Format function only runs when DevTools inspects the hook
  useDebugValue(user, u => `${u.name} (${u.role}) — last login: ${u.lastLogin.toLocaleDateString()}`);

  return user;
}
```

### Key Points

- Only useful for **custom hooks** — not regular components
- Has no effect on production behaviour
- Use the format function for expensive formatting (deferred until DevTools opens)
- Don't overuse — only add when the debug value genuinely helps

---

## Q71. What is Server Components in React (RSC)?

### Answer

**React Server Components (RSC)** are components that render **exclusively on the server** and send the resulting HTML (or a serialized component tree) to the client — **without shipping their JavaScript** to the browser.

### Server Component vs Client Component

| Feature | Server Component | Client Component |
|---|---|---|
| Renders on | Server only | Client (browser) |
| JS sent to browser | No | Yes |
| Can use hooks | No | Yes |
| Can fetch data | Yes (directly, async) | Via useEffect / React Query |
| Can use browser APIs | No | Yes |
| Can handle events | No | Yes |
| File convention (Next.js 13+) | Default | `'use client'` at top |

### Example (Next.js App Router)

```jsx
// app/users/page.jsx — Server Component (default)
// No 'use client' — renders on server, zero JS sent to browser

async function UsersPage() {
  // Direct async data fetch — no useEffect, no loading state
  const users = await fetch('https://api.example.com/users').then(r => r.json());

  return (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  );
}

export default UsersPage;
```

```jsx
// components/LikeButton.jsx — Client Component
'use client'; // marks as client component

import { useState } from 'react';

export function LikeButton() {
  const [liked, setLiked] = useState(false);
  return <button onClick={() => setLiked(!liked)}>{liked ? 'Liked' : 'Like'}</button>;
}
```

### Benefits of RSC

- **Smaller bundle** — server component code never reaches the browser
- **Direct backend access** — query DB, read files, use secrets
- **Automatic code splitting** — only client components ship JS
- **Better performance** — less JS = faster Time to Interactive

---

## Q72. What is the difference between `useEffect` cleanup and `componentWillUnmount`?

### Answer

Both are used for **cleanup** (removing event listeners, cancelling subscriptions, clearing timers) when a component is removed from the DOM.

### `componentWillUnmount` — Class Component

Runs **once** when the component is permanently removed.

```jsx
class Timer extends React.Component {
  componentDidMount() {
    this.interval = setInterval(() => console.log('tick'), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval); // runs once on unmount
  }

  render() { return <p>Timer running</p>; }
}
```

### `useEffect` Cleanup — Functional Component

The function returned from `useEffect` acts as cleanup. It runs:
1. **Before the effect re-runs** (when dependencies change)
2. **When the component unmounts**

```jsx
function Timer() {
  useEffect(() => {
    const interval = setInterval(() => console.log('tick'), 1000);

    // Cleanup runs: before next effect AND on unmount
    return () => clearInterval(interval);
  }, []); // empty array = run once, cleanup on unmount

  return <p>Timer running</p>;
}
```

### Key Difference — Cleanup on Dependency Change

```jsx
function Profile({ userId }) {
  useEffect(() => {
    const subscription = subscribeToUser(userId);

    return () => {
      // Runs when userId changes (cleanup old subscription)
      // AND when component unmounts
      subscription.unsubscribe();
    };
  }, [userId]); // re-runs when userId changes
}
```

### Summary

| Scenario | Class | Functional |
|---|---|---|
| On unmount | `componentWillUnmount` | `useEffect` cleanup with `[]` |
| On dependency change | `componentDidUpdate` + manual compare | `useEffect` cleanup with `[dep]` |
| Before every re-render | Verbose manual logic | `useEffect` cleanup with no array |

---

## Q73. What is prop types validation in React?

### Answer

**PropTypes** is React's built-in runtime type-checking mechanism. It validates that props passed to a component are of the correct type, logging warnings in the console during development.

### Installation (React 15.5+)

```bash
npm install prop-types
```

### Usage

```jsx
import PropTypes from 'prop-types';

function UserCard({ name, age, email, role, scores, address, onClick }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{age} years old</p>
    </div>
  );
}

UserCard.propTypes = {
  name:    PropTypes.string.isRequired,
  age:     PropTypes.number,
  email:   PropTypes.string,
  role:    PropTypes.oneOf(['admin', 'user', 'moderator']),
  scores:  PropTypes.arrayOf(PropTypes.number),
  address: PropTypes.shape({
    street: PropTypes.string,
    city:   PropTypes.string,
  }),
  onClick: PropTypes.func,
};

// Default values for optional props
UserCard.defaultProps = {
  age:  0,
  role: 'user',
};
```

### Common PropTypes

| Type | Validator |
|---|---|
| String | `PropTypes.string` |
| Number | `PropTypes.number` |
| Boolean | `PropTypes.bool` |
| Function | `PropTypes.func` |
| Array | `PropTypes.array` |
| Object | `PropTypes.object` |
| Any | `PropTypes.any` |
| One of values | `PropTypes.oneOf([...])` |
| One of types | `PropTypes.oneOfType([...])` |
| Array of type | `PropTypes.arrayOf(...)` |
| Object shape | `PropTypes.shape({...})` |
| React node | `PropTypes.node` |
| React element | `PropTypes.element` |

### PropTypes vs TypeScript

- **PropTypes** — runtime checks, development only, zero TypeScript needed
- **TypeScript** — compile-time checks, works in production, much more powerful

For new projects, **TypeScript is preferred** over PropTypes.

---

## Q74. How do you handle global error handling in React?

### Answer

React provides several layers of error handling for different scenarios.

### 1. Error Boundaries (Rendering Errors)

Catch errors in the **render phase** of any child component.

```jsx
class GlobalErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Send to error reporting service
    logErrorToService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h1>Something went wrong.</h1>
          <button onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap at the root level
<GlobalErrorBoundary>
  <App />
</GlobalErrorBoundary>
```

### 2. Try/Catch for Async Errors

Error boundaries don't catch async errors — handle those explicitly.

```jsx
async function fetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (err) {
    reportError(err);
    throw err; // re-throw if needed
  }
}
```

### 3. Global Window Error Handler

For uncaught errors outside React's tree:

```jsx
useEffect(() => {
  const handleError = (event) => {
    console.error('Unhandled error:', event.error);
    reportToService(event.error);
  };

  const handleRejection = (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  };

  window.addEventListener('error',              handleError);
  window.addEventListener('unhandledrejection', handleRejection);

  return () => {
    window.removeEventListener('error',              handleError);
    window.removeEventListener('unhandledrejection', handleRejection);
  };
}, []);
```

### 4. Error Reporting Services

- **Sentry** — most popular, has a React SDK
- **LogRocket** — session replay + error tracking
- **Datadog** — enterprise monitoring

---

## Q75. What is optimistic UI and how do you implement it in React?

### Answer

**Optimistic UI** is a UX pattern where the UI **immediately reflects** the result of an action (assumes success) before receiving confirmation from the server — making the app feel instant.

### Without Optimistic UI (Pessimistic)

```
User clicks Like → Spinner shows → Wait for API → Update UI
(feels slow)
```

### With Optimistic UI

```
User clicks Like → UI updates immediately → API call in background
                                         → On success: confirm
                                         → On error: rollback
(feels instant)
```

### Implementation Example — Like Button

```jsx
function PostCard({ post }) {
  const [liked,     setLiked]     = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = async () => {
    // 1. Optimistic update — immediate
    const prevLiked     = liked;
    const prevLikeCount = likeCount;
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);

    try {
      // 2. Actual API call
      await toggleLike(post.id);
    } catch (err) {
      // 3. Rollback on error
      setLiked(prevLiked);
      setLikeCount(prevLikeCount);
      showToast('Failed to update like. Please try again.');
    }
  };

  return (
    <button onClick={handleLike}>
      {liked ? 'Unlike' : 'Like'} ({likeCount})
    </button>
  );
}
```

### With React Query

```jsx
const mutation = useMutation({
  mutationFn: toggleLike,
  onMutate: async (postId) => {
    await queryClient.cancelQueries({ queryKey: ['posts'] });
    const previousPosts = queryClient.getQueryData(['posts']);

    // Optimistic update
    queryClient.setQueryData(['posts'], old =>
      old.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked } : p)
    );

    return { previousPosts }; // context for rollback
  },
  onError: (err, postId, context) => {
    queryClient.setQueryData(['posts'], context.previousPosts); // rollback
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
});
```

---

## Q76. What is the difference between `React.createRef` and `useRef`?

### Answer

Both create a mutable ref object with a `.current` property, but they are designed for different component types.

### `React.createRef` — Class Components

Creates a **new ref object** on every render. Used in class components.

```jsx
class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef(); // created once in constructor
  }

  focusInput() {
    this.inputRef.current.focus();
  }

  render() {
    return <input ref={this.inputRef} />;
  }
}
```

### `useRef` — Functional Components

Returns the **same ref object** on every render. Used in functional components.

```jsx
function TextInput() {
  const inputRef = useRef(null); // same object persists across renders

  const focusInput = () => inputRef.current.focus();

  return <input ref={inputRef} />;
}
```

### Key Differences

| Feature | `React.createRef` | `useRef` |
|---|---|---|
| Used in | Class components | Functional components |
| Object persistence | New object each render | Same object across renders |
| Initialization | In constructor | Hook call |
| Extra uses | DOM access only | DOM + persisting any value |

### Using `useRef` to Persist Non-DOM Values

```jsx
function StopWatch() {
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null); // persists timer ID without causing re-render

  const start = () => {
    intervalRef.current = setInterval(() => console.log('tick'), 1000);
    setRunning(true);
  };

  const stop = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  return (
    <div>
      <button onClick={start} disabled={running}>Start</button>
      <button onClick={stop}  disabled={!running}>Stop</button>
    </div>
  );
}
```

---

## Q77. What is the difference between SPA, MPA, and hybrid apps in React?

### Answer

### Single Page Application (SPA)

- Loads **one HTML file** at startup
- Navigation updates the URL and re-renders components via JavaScript — **no full page reload**
- Built with React + React Router

```
Initial Load: index.html + main.js (large bundle)
Navigation:   JavaScript updates DOM → fast, no reload
```

**Pros:** Fast navigation after load, rich interactions, seamless UX
**Cons:** Slow initial load, poor SEO (content loaded by JS), large bundle

**Examples:** Gmail, Trello, Notion

### Multi Page Application (MPA)

- Every route is a **separate HTML page** served from the server
- Full page reload on every navigation

```
/home    → server returns home.html
/about   → server returns about.html (full reload)
```

**Pros:** Great SEO, fast first load per page, simpler architecture
**Cons:** Slower navigation (full reloads), less interactive

**Examples:** Traditional e-commerce sites, news sites

### Hybrid / Universal App (SSR + CSR)

- Server renders the **initial HTML** (good for SEO and first paint)
- React hydrates it on the client for SPA-like interactions
- Built with **Next.js**, Remix, or Gatsby

```
First Load: Server renders full HTML → fast first paint
Navigation: Client-side React Router → no reload (SPA feel)
```

**Pros:** SEO-friendly, fast first load, rich interactions, best of both worlds
**Cons:** More complex setup, server infrastructure needed

### Comparison Table

| Feature | SPA | MPA | Hybrid (SSR) |
|---|---|---|---|
| First load speed | Slow | Fast | Fast |
| Navigation speed | Instant | Slow | Instant |
| SEO | Poor | Excellent | Excellent |
| Complexity | Medium | Low | High |
| Framework | React + Router | Any | Next.js, Remix |

---

## Q78. How does React handle accessibility (a11y)?

### Answer

React has first-class support for building **accessible** applications through standard HTML attributes, ARIA, and best practices.

### 1. Semantic HTML

Always prefer semantic elements over generic `<div>` and `<span>`:

```jsx
// Poor accessibility
<div onClick={submit}>Submit</div>

// Accessible
<button type="submit" onClick={submit}>Submit</button>
```

### 2. ARIA Attributes

Use ARIA attributes when native HTML isn't enough. In React, ARIA attributes use their standard names (not camelCase):

```jsx
<button
  aria-label="Close dialog"
  aria-expanded={isOpen}
  aria-controls="menu-id"
  onClick={onClose}
>
  ×
</button>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

### 3. Focus Management

Manage focus for modals, drawers, and route changes:

```jsx
function Modal({ isOpen, onClose, children }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) closeButtonRef.current?.focus(); // focus on open
  }, [isOpen]);

  return isOpen ? ReactDOM.createPortal(
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">Dialog Title</h2>
      {children}
      <button ref={closeButtonRef} onClick={onClose}>Close</button>
    </div>,
    document.getElementById('modal-root')
  ) : null;
}
```

### 4. Form Labels

Always associate labels with inputs:

```jsx
// Using htmlFor
<label htmlFor="email">Email Address</label>
<input id="email" type="email" name="email" />

// Using aria-label (when visible label isn't possible)
<input type="search" aria-label="Search products" />
```

### 5. Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```jsx
function Dropdown({ items }) {
  const handleKeyDown = (e, item) => {
    if (e.key === 'Enter' || e.key === ' ') selectItem(item);
    if (e.key === 'Escape') closeDropdown();
  };

  return (
    <ul role="listbox">
      {items.map(item => (
        <li
          key={item.id}
          role="option"
          tabIndex={0}
          onKeyDown={(e) => handleKeyDown(e, item)}
          onClick={() => selectItem(item)}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

### 6. Tools for Testing Accessibility

- **eslint-plugin-jsx-a11y** — lint-time a11y rules
- **axe-core** / **@axe-core/react** — runtime a11y audit
- **React Testing Library** — encourages accessible queries
- **WAVE** / **Lighthouse** — browser extensions

---

## Q79. What is the difference between `useEffect` with and without dependencies?

### Answer

The **dependency array** is the second argument to `useEffect`. It controls **when** the effect re-runs.

### Case 1 — No Dependency Array

Effect runs after **every render** (mount + every update).

```jsx
useEffect(() => {
  console.log('Runs after EVERY render');
});
```

Use when: logging, or effects that genuinely need to run after each render (rare).

### Case 2 — Empty Array `[]`

Effect runs **once** after initial mount. Cleanup runs on unmount.

```jsx
useEffect(() => {
  const subscription = subscribeToService();
  return () => subscription.unsubscribe();
}, []);
// Equivalent to componentDidMount + componentWillUnmount
```

Use when: initial data fetch, setting up subscriptions, DOM setup.

### Case 3 — With Dependencies `[a, b]`

Effect runs on mount **and** whenever `a` or `b` changes.

```jsx
useEffect(() => {
  fetchUserData(userId);
}, [userId]);
// Runs on mount and every time userId changes
```

Use when: effects that depend on props or state.

### Comparison

| Dependency Array | When Effect Runs |
|---|---|
| None (omitted) | After every render |
| `[]` (empty) | Once after mount |
| `[a, b]` | After mount + when a or b changes |

### Common Mistake — Missing Dependencies

```jsx
// Bug: count is used but not in dependency array
useEffect(() => {
  document.title = `Count: ${count}`; // stale closure!
}, []); // ESLint will warn about this

// Fix
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```

Use the **eslint-plugin-react-hooks** `exhaustive-deps` rule to catch missing dependencies.

---

## Q80. What is the React DevTools and how do you use it for debugging?

### Answer

**React DevTools** is a browser extension (Chrome, Firefox, Edge) that adds React-specific panels to DevTools for inspecting and profiling React applications.

### Installation

Install from the Chrome Web Store or Firefox Add-ons as **"React Developer Tools"**.

### Two Main Panels

#### 1. Components Panel

Inspect the live React component tree:

- **Browse component tree** — see hierarchy, spot unnecessary nesting
- **Inspect props and state** — view current values of any component
- **Edit props/state live** — change values in DevTools to test UI
- **Find component for DOM node** — click the cursor icon then a DOM element
- **Filter components** — hide HOC wrappers, focus on your components

```
App
  └── AuthProvider
        └── Router
              └── Navbar
              └── Main
                    └── UserList ← click to inspect props & state
```

#### 2. Profiler Panel

Record and analyze rendering performance:

- **Record** — click Record, interact with app, stop recording
- **Flame graph** — shows which components rendered and how long each took
- **Ranked chart** — lists components by render time (slowest at top)
- **Why did this render?** — shows the exact prop/state/hook that caused re-render

### Debugging Tips

```jsx
// 1. Name your components — anonymous components show as "Component" in DevTools
// Bad
export default () => <div>Hello</div>;

// Good
export default function UserCard() { return <div>Hello</div>; }

// 2. displayName for HOCs and forwardRef
const MyComponent = React.forwardRef((props, ref) => <div ref={ref} />);
MyComponent.displayName = 'MyComponent';

// 3. useDebugValue in custom hooks
function useUser() {
  const [user] = useState({ name: 'Alice' });
  useDebugValue(user?.name ?? 'not loaded');
  return user;
}
```

### Profiling Workflow

1. Open DevTools → Profiler tab
2. Click the **Record** button (circle)
3. Interact with the slow part of your app
4. Click **Stop**
5. Inspect the flame graph — look for unexpectedly large bars
6. Click a component → see "Why did this render?"
7. Apply `React.memo`, `useMemo`, `useCallback` to fix

---

## Summary Cheat Sheet (Q61–Q80)

| Topic | Key Points |
|---|---|
| Compound Components | Multiple components share implicit state via Context; flexible composition |
| Provider Pattern | Wrap subtree in Context Provider; use custom hook to consume |
| Observer Pattern | Subject notifies observers; used in event buses, state stores |
| `useSyncExternalStore` | Subscribe to external stores safely in Concurrent React |
| Reconciliation (deep) | Fiber: incremental, priority-based; O(n) diffing heuristics |
| `React.lazy` vs `import()` | `import()` = JS Promise; `lazy()` = React component wrapper for Suspense |
| Declarative vs Imperative | React = describe what; DOM manipulation = describe how |
| `React.Children` API | Safe iteration over children: map, count, only, toArray |
| Batching in React 18 | Auto-batching everywhere; opt out with `flushSync` |
| `useDebugValue` | Show custom hook labels in React DevTools; dev-only |
| React Server Components | Server-only render; no JS sent to client; direct DB access |
| useEffect cleanup vs WillUnmount | Cleanup runs before re-run AND on unmount; not just on unmount |
| PropTypes | Runtime type checking in dev; prefer TypeScript for new projects |
| Global Error Handling | Error Boundaries + try/catch + window error listeners + Sentry |
| Optimistic UI | Update UI immediately; rollback on error; great UX pattern |
| `createRef` vs `useRef` | createRef = class components; useRef = functional + persists across renders |
| SPA vs MPA vs Hybrid | SPA = one page; MPA = server pages; Hybrid = SSR + hydration |
| Accessibility (a11y) | Semantic HTML, ARIA, focus management, keyboard nav, eslint-jsx-a11y |
| useEffect dependency array | None = every render; [] = mount only; [deps] = on dep change |
| React DevTools | Components panel (inspect) + Profiler panel (performance) |

---

*Master these concepts and you'll stand out in any senior React interview! 🚀*
