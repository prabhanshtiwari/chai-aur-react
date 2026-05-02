# ⚛️ React Interview Preparation — Questions 51–100

> **Level:** Intermediate to Advanced  
> **For:** First job seekers who've covered the basics  
> **Companion to:** React Interview Questions (Q1–Q50)

---

## 📚 Table of Contents

1. [React Router (Q51–Q57)](#react-router)
2. [State Management (Q58–Q64)](#state-management)
3. [Custom Hooks (Q65–Q68)](#custom-hooks)
4. [Advanced Patterns (Q69–Q74)](#advanced-patterns)
5. [Styling in React (Q75–Q78)](#styling-in-react)
6. [Testing in React (Q79–Q83)](#testing-in-react)
7. [Performance Optimization (Q84–Q89)](#performance-optimization)
8. [TypeScript with React (Q90–Q93)](#typescript-with-react)
9. [Real-World & Conceptual (Q94–Q100)](#real-world--conceptual)

---

## React Router

---

### Q51. What is React Router and why is it used?

**Answer:**  
React Router is the standard **client-side routing library** for React. Since React apps are SPAs (Single Page Applications), the page never actually reloads. React Router lets you **map URLs to components**, enabling navigation without full page refreshes.

```bash
npm install react-router-dom
```

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

### Q52. What is the difference between `<Link>` and `<a>` tag in React Router?

**Answer:**

| | `<a>` (HTML) | `<Link>` (React Router) |
|---|---|---|
| **Behavior** | Full page reload | Client-side navigation (no reload) |
| **Performance** | Slower | Faster — only re-renders changed components |
| **Usage** | External links | Internal app navigation |

```jsx
// ❌ Causes full page reload
<a href="/about">About</a>

// ✅ Client-side navigation
import { Link } from 'react-router-dom';
<Link to="/about">About</Link>
```

---

### Q53. What is `useNavigate`?

**Answer:**  
`useNavigate` is a hook that lets you **programmatically navigate** to a route (e.g., after a form submission or login).

```jsx
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const navigate = useNavigate();

  function handleSubmit() {
    // ... login logic
    navigate('/dashboard'); // redirect after login
  }

  return <button onClick={handleSubmit}>Login</button>;
}
```

> 💡 `navigate(-1)` goes back, `navigate(1)` goes forward — like browser history.

---

### Q54. What is `useParams`?

**Answer:**  
`useParams` returns an object of **URL parameters** from the current route.

```jsx
// Route definition
<Route path="/user/:id" element={<UserProfile />} />

// Inside UserProfile component
import { useParams } from 'react-router-dom';

function UserProfile() {
  const { id } = useParams();
  return <h1>User ID: {id}</h1>;
}
```

---

### Q55. What is `useLocation`?

**Answer:**  
`useLocation` returns the **current URL location object**, including pathname, search (query string), and state.

```jsx
import { useLocation } from 'react-router-dom';

function CurrentPage() {
  const location = useLocation();
  console.log(location.pathname); // e.g., "/about"
  console.log(location.search);   // e.g., "?name=Rahul"
  return <p>You are at: {location.pathname}</p>;
}
```

---

### Q56. What are nested routes in React Router?

**Answer:**  
Nested routes let you render **child routes inside a parent layout**. Use `<Outlet />` in the parent to tell React Router where to render the child.

```jsx
<Routes>
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<Overview />} />
    <Route path="settings" element={<Settings />} />
    <Route path="profile" element={<Profile />} />
  </Route>
</Routes>

// DashboardLayout.jsx
function DashboardLayout() {
  return (
    <div>
      <Sidebar />
      <Outlet /> {/* Child route renders here */}
    </div>
  );
}
```

---

### Q57. What is a 404 / Not Found route in React Router?

**Answer:**  
Use `path="*"` as a catch-all route for unmatched URLs.

```jsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="*" element={<NotFound />} /> {/* catch-all */}
</Routes>
```

---

## State Management

---

### Q58. What is the Context API and when should you use it?

**Answer:**  
The **Context API** is React's built-in solution for sharing state globally across components without prop drilling.

**When to use Context:**
- Theme (dark/light mode)
- Language / locale
- Auth state (logged-in user)
- Small to medium apps

**When NOT to use it:**
- Frequently updating data (causes many re-renders)
- Large-scale apps (use Redux/Zustand instead)

```jsx
const AuthContext = React.createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// Consumer
const { user } = useContext(AuthContext);
```

---

### Q59. What is Redux and why is it used?

**Answer:**  
**Redux** is a predictable **state management library** for JavaScript applications. It stores the entire application state in a single **store**.

**Core concepts:**

| Concept | Description |
|---|---|
| **Store** | Single source of truth — holds all state |
| **Action** | A plain object describing what happened `{ type: 'INCREMENT' }` |
| **Reducer** | Pure function that takes current state + action → returns new state |
| **Dispatch** | Function to send an action to the store |
| **Selector** | Function to read state from the store |

> 💡 Modern Redux uses **Redux Toolkit (RTK)** which eliminates boilerplate.

---

### Q60. What is Redux Toolkit (RTK)?

**Answer:**  
Redux Toolkit is the **official, recommended way** to write Redux logic. It reduces boilerplate significantly.

```jsx
import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1; },
    decrement: state => { state.value -= 1; },
  },
});

export const { increment, decrement } = counterSlice.actions;

const store = configureStore({
  reducer: { counter: counterSlice.reducer },
});
```

---

### Q61. What is the difference between Context API and Redux?

**Answer:**

| | Context API | Redux |
|---|---|---|
| **Built into React?** | ✅ Yes | ❌ No (external library) |
| **Best for** | Low-frequency global data | Frequent, complex state changes |
| **DevTools** | ❌ No | ✅ Powerful Redux DevTools |
| **Middleware** | ❌ No | ✅ Yes (for async, logging) |
| **Boilerplate** | Low | Medium (RTK reduces it) |
| **Performance** | Re-renders all consumers | Fine-grained subscriptions |

---

### Q62. What is Zustand?

**Answer:**  
**Zustand** is a small, fast, and minimal state management library for React. It is simpler than Redux and has less boilerplate.

```jsx
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}));

function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
```

---

### Q63. What is lifting state up?

**Answer:**  
When two sibling components need to share the same state, you **move the state to their closest common parent** — this is called lifting state up.

```
Before:                     After:
ComponentA (has state)      Parent (has state)
ComponentB (needs state)    ├── ComponentA (receives via props)
                            └── ComponentB (receives via props)
```

---

### Q64. What is derived state and when should you avoid storing it?

**Answer:**  
**Derived state** is data that can be **computed from existing state or props**. You should not store it separately — just compute it during render.

```jsx
// ❌ Bad — storing derived state
const [firstName, setFirstName] = useState('Rahul');
const [fullName, setFullName] = useState('Rahul Kumar'); // derived!

// ✅ Good — compute it
const [firstName, setFirstName] = useState('Rahul');
const [lastName, setLastName] = useState('Kumar');
const fullName = `${firstName} ${lastName}`; // derived on the fly
```

---

## Custom Hooks

---

### Q65. What are Custom Hooks?

**Answer:**  
A **custom hook** is a JavaScript function whose name starts with `use` and that can call other hooks inside it. They let you **extract and reuse stateful logic** across components.

```jsx
// Custom hook
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

// Usage
function MyComponent() {
  const width = useWindowWidth();
  return <p>Window width: {width}px</p>;
}
```

---

### Q66. Write a custom hook for fetching data (`useFetch`).

**Answer:**

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(url)
      .then(res => res.json())
      .then(data => { setData(data); setLoading(false); })
      .catch(err => { setError(err); setLoading(false); });
  }, [url]);

  return { data, loading, error };
}

// Usage
function Posts() {
  const { data, loading, error } = useFetch('https://jsonplaceholder.typicode.com/posts');
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return <ul>{data.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}
```

---

### Q67. Write a custom hook for local storage (`useLocalStorage`).

**Answer:**

```jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const setStoredValue = (newValue) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, setStoredValue];
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

---

### Q68. What is the difference between a custom hook and a utility function?

**Answer:**

| | Custom Hook | Utility Function |
|---|---|---|
| **Can use hooks?** | ✅ Yes | ❌ No |
| **Name convention** | Starts with `use` | Any name |
| **Stateful?** | ✅ Can hold state | ❌ Stateless only |
| **Example** | `useFetch`, `useForm` | `formatDate`, `capitalize` |

---

## Advanced Patterns

---

### Q69. What is the Render Props pattern?

**Answer:**  
A **render prop** is a technique where a component receives a **function as a prop** and calls it to determine what to render. It enables sharing behavior between components.

```jsx
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div onMouseMove={e => setPosition({ x: e.clientX, y: e.clientY })}>
      {render(position)} {/* calling the render prop */}
    </div>
  );
}

// Usage
<MouseTracker render={({ x, y }) => <p>Mouse: {x}, {y}</p>} />
```

> 💡 Custom Hooks have largely replaced Render Props in modern React.

---

### Q70. What is code splitting?

**Answer:**  
**Code splitting** is breaking your app's JavaScript bundle into **smaller chunks** that are loaded only when needed. This reduces initial load time.

```jsx
// Without code splitting — entire app loads at once
import HeavyDashboard from './HeavyDashboard';

// With code splitting — loads only when accessed
const HeavyDashboard = React.lazy(() => import('./HeavyDashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyDashboard />
    </Suspense>
  );
}
```

---

### Q71. What is `React.StrictMode`?

**Answer:**  
`<React.StrictMode>` is a development-only tool that highlights potential problems in your application. It:
- Detects unexpected side effects
- Warns about deprecated APIs
- Intentionally double-invokes some functions (like render, useState initializer) to catch bugs

```jsx
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

> 💡 It has **no effect in production** — only shows warnings in development.

---

### Q72. What is the difference between `React.cloneElement` and spreading props?

**Answer:**

| | `React.cloneElement` | Spread Props |
|---|---|---|
| **Use case** | Add/override props on an existing React element | Pass props to a newly created element |
| **When** | When you receive children and want to inject props | When you create the element yourself |

```jsx
// cloneElement — injecting props into children
function Wrapper({ children }) {
  return React.cloneElement(children, { className: 'highlighted' });
}

// Spread — passing props along
function Button({ onClick, ...rest }) {
  return <button onClick={onClick} {...rest} />;
}
```

---

### Q73. What is the Compound Component pattern?

**Answer:**  
**Compound components** are a set of components that work together and share implicit state via Context. Example: `<select>` and `<option>` in HTML.

```jsx
// A Tab component system
function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabContext.Provider>
  );
}

Tabs.Tab = function Tab({ index, label }) {
  const { activeTab, setActiveTab } = useContext(TabContext);
  return (
    <button
      onClick={() => setActiveTab(index)}
      style={{ fontWeight: activeTab === index ? 'bold' : 'normal' }}
    >
      {label}
    </button>
  );
};

// Usage
<Tabs>
  <Tabs.Tab index={0} label="Home" />
  <Tabs.Tab index={1} label="About" />
</Tabs>
```

---

### Q74. What is the difference between imperative and declarative programming in React?

**Answer:**

| | Imperative | Declarative |
|---|---|---|
| **What you describe** | *How* to do something (step by step) | *What* you want the result to be |
| **Example** | Vanilla JS DOM manipulation | React JSX |

```js
// Imperative (vanilla JS)
const el = document.createElement('h1');
el.textContent = 'Hello';
document.body.appendChild(el);

// Declarative (React)
return <h1>Hello</h1>;
```

> 💡 React is declarative — you describe the UI state and React figures out how to update the DOM.

---

## Styling in React

---

### Q75. What are the different ways to style React components?

**Answer:**

| Method | Description | Example |
|---|---|---|
| **Inline styles** | JS object passed to `style` prop | `style={{ color: 'red' }}` |
| **CSS files** | Import a `.css` file | `import './App.css'` |
| **CSS Modules** | Scoped CSS per component | `styles.button` |
| **Styled Components** | CSS-in-JS library | `` styled.button`...` `` |
| **Tailwind CSS** | Utility-first CSS classes | `className="text-red-500"` |

---

### Q76. What are CSS Modules?

**Answer:**  
CSS Modules automatically scope class names **locally to the component**, preventing naming conflicts.

```css
/* Button.module.css */
.btn {
  background: blue;
  color: white;
}
```

```jsx
import styles from './Button.module.css';

function Button() {
  return <button className={styles.btn}>Click Me</button>;
}
// Renders as: <button class="Button_btn__xK2a9">
```

---

### Q77. What are Styled Components?

**Answer:**  
**Styled Components** is a CSS-in-JS library that lets you write actual CSS inside your JavaScript using tagged template literals.

```jsx
import styled from 'styled-components';

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.primary ? 'blue' : 'black'};
`;

function App() {
  return <Title primary>Hello World</Title>;
}
```

**Benefits:** scoped styles, dynamic styling via props, no class name conflicts.

---

### Q78. What is Tailwind CSS and how does it work with React?

**Answer:**  
Tailwind is a **utility-first CSS framework**. Instead of writing custom CSS, you apply pre-built utility classes directly in JSX.

```jsx
function Card() {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 max-w-sm">
      <h2 className="text-xl font-bold text-gray-800">Hello</h2>
      <p className="text-gray-500 mt-2">This is a card component.</p>
    </div>
  );
}
```

**Pros:** Extremely fast to build UI, consistent design, no CSS files.  
**Cons:** JSX can look cluttered with many classes.

---

## Testing in React

---

### Q79. What is React Testing Library (RTL)?

**Answer:**  
**React Testing Library** is the recommended testing utility for React. It encourages testing components **the way a user would interact with them** — by querying DOM elements, not implementation details.

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('renders greeting', () => {
  render(<Greeting name="Rahul" />);
  expect(screen.getByText('Hello, Rahul!')).toBeInTheDocument();
});
```

---

### Q80. What is Jest?

**Answer:**  
**Jest** is a JavaScript testing framework (by Meta) used to write and run tests. It provides:
- Test runner
- Assertions (`expect`, `toBe`, `toEqual`)
- Mocking
- Code coverage reports

React Testing Library is typically used *with* Jest.

---

### Q81. What is the difference between `getBy`, `queryBy`, and `findBy` in RTL?

**Answer:**

| Query | When element is absent | When to use |
|---|---|---|
| `getBy...` | Throws an error | When element **must** exist |
| `queryBy...` | Returns `null` | When element **may or may not** exist |
| `findBy...` | Throws after timeout | For **async** elements |

```jsx
screen.getByText('Submit');        // throws if not found
screen.queryByText('Error msg');   // returns null if not found
await screen.findByText('Loaded'); // waits for async render
```

---

### Q82. What is snapshot testing?

**Answer:**  
Snapshot testing captures a **rendered component's output** and saves it to a file. On subsequent runs, it compares the output against the saved snapshot to detect unexpected changes.

```jsx
import renderer from 'react-test-renderer';

test('renders correctly', () => {
  const tree = renderer.create(<Button label="Click" />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

> ⚠️ Snapshot tests are easy to write but can be fragile. Don't rely on them too heavily.

---

### Q83. What is mocking in React testing?

**Answer:**  
**Mocking** replaces real implementations (API calls, modules, functions) with fake ones during tests so tests run faster and in isolation.

```jsx
// Mocking a fetch call
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ name: 'Rahul' }),
  })
);

test('fetches user', async () => {
  render(<UserProfile />);
  const name = await screen.findByText('Rahul');
  expect(name).toBeInTheDocument();
});
```

---

## Performance Optimization

---

### Q84. What causes unnecessary re-renders in React?

**Answer:**  
Common causes:
1. Parent re-renders → child re-renders (even if props didn't change)
2. State updates inside a component
3. New object/array/function references passed as props
4. Context value changes

**Solutions:**
- `React.memo` — skip re-render if props are same
- `useMemo` — memoize expensive computed values
- `useCallback` — memoize callback functions
- Split Context — don't put unrelated state in same context

---

### Q85. What is the React DevTools Profiler?

**Answer:**  
The **React DevTools Profiler** is a browser extension tool that lets you record and analyze component renders to identify performance bottlenecks.

**It shows:**
- Which components rendered
- How long each render took
- Why the component re-rendered

> 💡 Install "React Developer Tools" in Chrome/Firefox to access it.

---

### Q86. What is debouncing and how is it used in React?

**Answer:**  
**Debouncing** delays executing a function until after a user stops triggering it (e.g., typing). Useful for search inputs to avoid calling an API on every keystroke.

```jsx
import { useState, useEffect } from 'react';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer); // cleanup on each keystroke
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) fetchResults(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

---

### Q87. What is virtualization (windowing) in React?

**Answer:**  
**Virtualization** renders only the **visible items** in a long list instead of all of them. This dramatically improves performance for large datasets.

Libraries: `react-window`, `react-virtual`, `TanStack Virtual`

```jsx
import { FixedSizeList } from 'react-window';

function Row({ index, style }) {
  return <div style={style}>Row {index}</div>;
}

<FixedSizeList height={400} itemCount={10000} itemSize={35} width="100%">
  {Row}
</FixedSizeList>
```

---

### Q88. What is `React.PureComponent`?

**Answer:**  
`React.PureComponent` is a class component that implements `shouldComponentUpdate` with a **shallow comparison** of props and state. It prevents re-renders if props/state haven't changed.

```jsx
class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.name}</div>;
  }
}
```

> 💡 Functional equivalent: `React.memo()`

> ⚠️ Only does **shallow** comparison — won't detect nested object changes.

---

### Q89. What is tree shaking and how does it relate to React apps?

**Answer:**  
**Tree shaking** is a build optimization that **removes unused code** from your final bundle. Modern bundlers (Webpack, Vite, Rollup) do this automatically.

In React apps:
- Import only what you need: `import { useState } from 'react'` ✅
- Avoid: `import React from 'react'` then using only `useState` ❌ (older pattern)
- Use `React.lazy` for components not needed on first load

---

## TypeScript with React

---

### Q90. What is TypeScript and why use it with React?

**Answer:**  
**TypeScript** is a **statically typed superset of JavaScript**. It catches type errors at compile time rather than runtime.

**Benefits in React:**
- Autocomplete for props and state
- Catch bugs before running the app
- Better code documentation
- Safer refactoring

```tsx
// JavaScript
function Greeting({ name }) { ... }

// TypeScript
interface Props {
  name: string;
  age?: number; // optional
}

function Greeting({ name, age }: Props) { ... }
```

---

### Q91. How do you type `useState` in TypeScript?

**Answer:**

```tsx
// TypeScript infers type from initial value
const [count, setCount] = useState(0); // inferred as number

// Explicit typing
const [user, setUser] = useState<User | null>(null);

interface User {
  id: number;
  name: string;
}
```

---

### Q92. How do you type props in TypeScript React?

**Answer:**

```tsx
// Using interface (preferred)
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

function Button({ label, onClick, disabled = false, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={variant}>
      {label}
    </button>
  );
}
```

---

### Q93. What is `React.FC` and should you use it?

**Answer:**  
`React.FC` (or `React.FunctionComponent`) is a TypeScript generic type for functional components. It was popular earlier but is now **somewhat discouraged** because it implicitly includes `children` in props (even if you don't want it).

```tsx
// Old way (with React.FC)
const MyComponent: React.FC<Props> = ({ name }) => <div>{name}</div>;

// Modern way (recommended)
function MyComponent({ name }: { name: string }) {
  return <div>{name}</div>;
}
```

---

## Real-World & Conceptual

---

### Q94. How do you fetch data in React?

**Answer:**  
Most common approaches:

```jsx
// 1. useEffect + fetch (basic)
useEffect(() => {
  fetch('/api/users')
    .then(res => res.json())
    .then(data => setUsers(data));
}, []);

// 2. async/await inside useEffect
useEffect(() => {
  async function loadData() {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  }
  loadData();
}, []);

// 3. Using a library (recommended for production)
// react-query / TanStack Query
const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
```

---

### Q95. What is TanStack Query (React Query)?

**Answer:**  
**TanStack Query** (formerly React Query) is a powerful library for **data fetching, caching, background refetching, and synchronization** in React apps.

```jsx
import { useQuery } from '@tanstack/react-query';

function Users() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error!</p>;
  return <ul>{data.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

**Benefits:** automatic caching, background updates, refetching, no manual loading states.

---

### Q96. What is the difference between `useEffect` and `useLayoutEffect`?

**Answer:**

| | `useEffect` | `useLayoutEffect` |
|---|---|---|
| **When it runs** | **After** browser paints | **Before** browser paints (synchronous) |
| **Use case** | Data fetching, subscriptions | DOM measurements, animations |
| **Performance** | Non-blocking (better) | Blocks paint (use sparingly) |

```jsx
useLayoutEffect(() => {
  // Runs synchronously after DOM update but BEFORE the browser paints
  // Use for: reading DOM dimensions, avoiding flicker in animations
}, []);
```

---

### Q97. What is the difference between `React.createContext` and passing props?

**Answer:**

| | Prop Passing | Context |
|---|---|---|
| **Best for** | 1-2 levels of components | Deeply nested components |
| **Maintenance** | Gets messy with depth | Clean, centralized |
| **Performance** | Selective re-renders | All consumers re-render on change |
| **Explicitness** | Very explicit (good) | Implicit (harder to trace) |

> 💡 **Rule of thumb:** Use props by default. Reach for Context only when prop drilling becomes a problem (3+ levels deep).

---

### Q98. What happens when you update state inside a `useEffect` without proper dependencies?

**Answer:**  
It can cause an **infinite loop**:

```jsx
// ❌ Infinite loop!
useEffect(() => {
  setCount(count + 1); // triggers re-render → effect runs again → repeat
}); // no dependency array

// ✅ Correct — runs only once
useEffect(() => {
  setCount(prev => prev + 1);
}, []); // empty array = only on mount
```

> 💡 Always include the correct dependencies. Use `eslint-plugin-react-hooks` to catch missing deps.

---

### Q99. What is Portals in React?

**Answer:**  
**Portals** let you render a component's DOM node **outside its parent hierarchy** while keeping it in the React tree. Commonly used for modals, tooltips, and dropdowns.

```jsx
import { createPortal } from 'react-dom';

function Modal({ children }) {
  return createPortal(
    <div className="modal-overlay">{children}</div>,
    document.getElementById('modal-root') // renders here in DOM
  );
}

// index.html needs: <div id="modal-root"></div>
```

> 💡 Even though the modal is rendered outside `#root`, React events still bubble through the React tree normally.

---

### Q100. What are the most common React interview mistakes to avoid?

**Answer:**

| Mistake | Correct Approach |
|---|---|
| Mutating state directly: `state.count = 1` | Always use setter: `setCount(1)` |
| Using index as key in dynamic lists | Use unique, stable IDs |
| Missing cleanup in `useEffect` | Return a cleanup function |
| Calling hooks conditionally | Hooks must be at the top level always |
| Forgetting `e.preventDefault()` in forms | Add it to prevent page reload |
| Over-using `useEffect` | Many effects can be replaced with event handlers |
| Storing derived state | Compute it during render instead |
| Not handling loading/error states | Always handle all async states |

---

## 🏁 Complete Topics Revision Map (Q1–Q100)

```
React Interview (Q1–Q100)
├── Fundamentals       Q1–Q10   Virtual DOM, JSX, Babel
├── JSX & Rendering    Q11–Q17  Lists, keys, conditional rendering
├── Components/Props   Q18–Q24  Functional, class, prop drilling
├── State/Lifecycle    Q25–Q32  useState, lifecycle methods
├── Hooks              Q33–Q40  All major hooks
├── Events/Forms       Q41–Q44  SyntheticEvents, controlled inputs
├── Performance (1)    Q45–Q50  memo, HOC, lazy loading
├── React Router       Q51–Q57  Navigation, params, nested routes
├── State Management   Q58–Q64  Context, Redux, Zustand
├── Custom Hooks       Q65–Q68  useFetch, useLocalStorage
├── Advanced Patterns  Q69–Q74  Render props, code splitting
├── Styling            Q75–Q78  CSS Modules, Tailwind, Styled Components
├── Testing            Q79–Q83  RTL, Jest, snapshot, mocking
├── Performance (2)    Q84–Q89  DevTools, debounce, virtualization
├── TypeScript         Q90–Q93  Types, interfaces, React.FC
└── Real-World         Q94–Q100 Data fetching, React Query, Portals
```

---

## 💡 Final Interview Tips

1. **Build projects** — a Todo app, a Weather app, a small e-commerce UI. Employers love to ask "walk me through a project you built."
2. **Know the WHY** — don't just memorize answers. Understand *why* React does things the way it does.
3. **Practice on StackBlitz or CodeSandbox** — interviewers often ask you to write code live.
4. **Study one state management library** — at minimum, understand Context API. Bonus: know RTK basics.
5. **Read error messages** — React's error messages are very descriptive. Show you can debug.

---

*You now have 100 React interview questions covered. Go build something! ⚛️*
