# React Interview Questions & Answers (Q81 – Q100)

> Principal / Expert-level React interview notes — detailed answers, code examples, and key points.

---

## Q81. What is the Flux of Data in React and why is it unidirectional?

### Answer

React enforces a **unidirectional (one-way) data flow** — data always moves in one direction through the component tree: from **parent to child** via props.

### How One-Way Data Flow Works

```
State (Source of Truth)
       ↓
   Props passed to child
       ↓
   Child renders UI
       ↓
   User interacts (event)
       ↓
   Child calls callback (from parent)
       ↓
   Parent updates state
       ↓
   Re-render flows down again
```

### Code Example

```jsx
// Parent owns state
function App() {
  const [count, setCount] = useState(0);

  return (
    // Data flows DOWN via props
    <Counter count={count} onIncrement={() => setCount(c => c + 1)} />
  );
}

// Child receives data, emits events UP
function Counter({ count, onIncrement }) {
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={onIncrement}>+</button>
    </div>
  );
}
```

### Why Unidirectional?

| Benefit | Explanation |
|---|---|
| **Predictability** | State changes have a clear, traceable origin |
| **Debuggability** | Easy to find where state lives and what changed it |
| **Consistency** | UI always reflects the current state — no sync issues |
| **Testability** | Pure components with props are easy to unit test |

### Two-Way Binding vs One-Way (Angular vs React)

```
Angular (two-way): Model ↔ View  (both can update each other)
React (one-way):   State → View → Event → State update → View
```

React's one-way flow avoids the cascading update bugs common in two-way binding frameworks.

---

## Q82. What is stale closure in React hooks and how do you fix it?

### Answer

A **stale closure** occurs when a function inside a hook **captures an outdated value** of a variable from a previous render — because the function was created when that value was different and hasn't been recreated since.

### Example of Stale Closure

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // BUG: count is always 0 here — stale closure!
      // This function was created when count = 0
      // and never recreated because dependency array is []
      console.log('count:', count); // always logs 0
      setCount(count + 1);          // always sets to 1 (0 + 1)
    }, 1000);

    return () => clearInterval(interval);
  }, []); // <-- empty array means effect never re-runs

  return <p>{count}</p>;
}
```

### Fix 1 — Functional Updater Form

```jsx
useEffect(() => {
  const interval = setInterval(() => {
    // Functional form always gets latest state — no closure issue
    setCount(prev => prev + 1);
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

### Fix 2 — Add to Dependency Array

```jsx
useEffect(() => {
  const interval = setInterval(() => {
    console.log('count:', count); // now gets latest count
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(interval);
}, [count]); // re-creates effect when count changes
```

### Fix 3 — useRef to Store Latest Value

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    countRef.current = count; // always up to date
  }, [count]);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('count:', countRef.current); // always latest
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return <p>{count}</p>;
}
```

### Where Stale Closures Commonly Occur

- `setInterval` / `setTimeout` inside `useEffect` with `[]`
- Event listeners attached in `useEffect` with `[]`
- `useCallback` with missing dependencies
- Async functions inside `useEffect`

---

## Q83. What is the React Fiber architecture?

### Answer

**React Fiber** is the complete rewrite of React's core reconciliation engine, introduced in **React 16**. It replaced the old stack-based reconciler to enable **incremental rendering**.

### Problems with the Old Reconciler (Stack)

- Rendering was **synchronous and uninterruptible**
- Long renders would **block the main thread** — causing dropped frames and janky UI
- Could not prioritize urgent updates (user input) over background work

### What Fiber Solves

React Fiber splits rendering into **units of work** (fibers). Each fiber represents one component in the tree. React can:

- **Pause** work and come back to it
- **Abort** low-priority work if a higher-priority update arrives
- **Reuse** previously completed work
- **Prioritize** urgent updates (user input, animations) over slow ones (data fetch render)

### Fiber Node Structure

Every component in the tree has a corresponding **fiber node**:

```
Fiber Node {
  type          // component function or DOM tag
  key           // reconciliation key
  child         // first child fiber
  sibling       // next sibling fiber
  return        // parent fiber
  pendingProps  // new incoming props
  memoizedProps // props from last render
  memoizedState // state from last render
  effectTag     // what DOM operation is needed (INSERT, UPDATE, DELETE)
  alternate     // pointer to the work-in-progress twin
}
```

### Double Buffering — Work In Progress Tree

Fiber maintains **two trees**:
- **Current tree** — what's currently rendered on screen
- **Work-in-progress tree** — the new tree being built in the background

When the new tree is complete, React **swaps** them atomically (commit phase).

```
Current Tree        Work-In-Progress Tree
(on screen)         (being calculated)
    ↕ alternate pointers connect corresponding nodes
```

### Two Phases of Fiber Rendering

1. **Render Phase (async, interruptible)** — React traverses the fiber tree, diffs, marks what changed. Can be paused / aborted.
2. **Commit Phase (sync, uninterruptible)** — React applies all DOM mutations at once. Cannot be interrupted.

### Why This Enables Concurrent Mode

Because the render phase is interruptible, React 18's Concurrent features (`useTransition`, `useDeferredValue`, Suspense) are possible — they depend on React being able to pause and prioritize renders.

---

## Q84. What is windowing (virtualization) and when should you use it?

### Answer

**Windowing (virtualization)** is a performance technique where only the **visible rows/items** in a large list are rendered in the DOM at any given time, instead of all items.

### The Problem

```jsx
// Renders 10,000 <div> nodes in the DOM — extremely slow
function HugeList({ items }) {
  return (
    <div>
      {items.map(item => <Row key={item.id} item={item} />)}
    </div>
  );
}
```

With 10,000 rows, the initial render is slow and scrolling is janky because the browser must manage 10,000 real DOM nodes.

### The Solution — Virtualization

Only render what's **visible in the viewport** (e.g., 20 rows), and swap them in/out as the user scrolls.

```
Viewport shows rows 50-70
→ Only those 20 rows exist in the DOM
→ Scrolling down: rows 51-71 rendered, row 50 removed
```

### Using `react-window`

```jsx
import { FixedSizeList } from 'react-window';

const Row = ({ index, style }) => (
  // style contains position/height — required for virtualization
  <div style={style}>
    Row {index}
  </div>
);

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={600}       // visible height of the list container
      itemCount={10000}  // total number of items
      itemSize={50}      // height of each row in px
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### Variable Size Items

```jsx
import { VariableSizeList } from 'react-window';

const getItemSize = (index) => (index % 2 === 0 ? 50 : 80); // alternating heights

<VariableSizeList
  height={600}
  itemCount={items.length}
  itemSize={getItemSize}
  width="100%"
>
  {Row}
</VariableSizeList>
```

### Libraries

| Library | Features |
|---|---|
| `react-window` | Lightweight, simple, fixed/variable sizes |
| `react-virtual` (TanStack) | Hook-based, flexible, no wrapper required |
| `react-virtuoso` | Auto-sizing, sticky headers, reverse scroll (chats) |
| `@tanstack/virtual` | Framework-agnostic core |

### When to Use

- Lists with **500+ items**
- Tables with many rows
- Infinite scroll feeds
- Chat message lists
- File explorers

---

## Q85. What is the difference between client-side and server-side data fetching in React?

### Answer

### Client-Side Data Fetching

Data is fetched **in the browser** after the component mounts, typically using `useEffect` or React Query.

```jsx
// Standard client-side fetch with React Query
function UserProfile({ userId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn:  () => fetch(`/api/users/${userId}`).then(r => r.json()),
  });

  if (isLoading) return <Skeleton />;
  return <div>{data.name}</div>;
}
```

**Flow:**
```
Browser loads → Component mounts → useEffect fires → fetch() → setState → re-render
```

**Pros:** Simple, works anywhere, dynamic per-user data
**Cons:** Waterfall loading, flash of loading state, poor SEO

### Server-Side Data Fetching

Data is fetched **on the server** before HTML is sent to the browser. No loading state visible to user.

```jsx
// Next.js — getServerSideProps
export async function getServerSideProps({ params }) {
  const user = await db.users.findById(params.id); // direct DB access!
  return { props: { user } };
}

function UserProfile({ user }) {
  // user is already available — no loading state
  return <div>{user.name}</div>;
}
```

```jsx
// Next.js App Router — React Server Component
async function UserProfile({ params }) {
  const user = await db.users.findById(params.id); // async in component!
  return <div>{user.name}</div>;
}
```

**Pros:** No loading flicker, great SEO, can access DB directly, secrets stay on server
**Cons:** Slower TTFB (time to first byte), server infrastructure needed

### Comparison Table

| Feature | Client-Side | Server-Side |
|---|---|---|
| Data available | After mount | Before render |
| Loading state | Visible | Not needed |
| SEO | Poor | Excellent |
| Server required | No | Yes |
| DB / secrets access | No (via API) | Yes (direct) |
| Personalised per user | Yes | Yes |
| Caching | React Query cache | HTTP cache / CDN |

---

## Q86. What are React design patterns? List the most important ones.

### Answer

React design patterns are reusable solutions to common architectural problems.

### 1. Container / Presentational Pattern

Separate **logic** from **UI**.

```jsx
// Container — handles logic
function UserListContainer() {
  const { data, isLoading } = useFetchUsers();
  if (isLoading) return <Spinner />;
  return <UserList users={data} />;
}

// Presentational — pure UI, easy to test and reuse
function UserList({ users }) {
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

### 2. Compound Components Pattern

Multiple components share implicit state. *(See Q61)*

### 3. Provider Pattern

Inject shared state via Context. *(See Q62)*

### 4. Render Props Pattern

Share logic via function prop. *(See Q34)*

### 5. Higher-Order Component (HOC) Pattern

Function that wraps a component with extra behavior. *(See Q13)*

### 6. Custom Hook Pattern

Extract and reuse stateful logic. *(See Q23)*

### 7. Controlled Component Pattern

Form inputs driven by React state. *(See Q15)*

### 8. Observer Pattern

Event bus / pub-sub for decoupled communication. *(See Q63)*

### 9. Proxy / Facade Pattern

Wrap third-party libraries to decouple from implementation.

```jsx
// Instead of using axios directly everywhere
// Create a facade so swapping to fetch is easy

// api.js
export const getUser = (id) => axios.get(`/users/${id}`).then(r => r.data);

// Component — only depends on getUser, not axios
const user = await getUser(id);
```

### 10. State Reducer Pattern

Give consumers control over state updates.

```jsx
function useToggle({ reducer = (s, a) => s } = {}) {
  const [on, dispatch] = useReducer(
    (state, action) => reducer(toggleReducer(state, action), action),
    false
  );
  return { on, toggle: () => dispatch({ type: 'TOGGLE' }) };
}
```

### Pattern Selection Guide

| Problem | Pattern |
|---|---|
| Reusing logic | Custom Hooks |
| Sharing global state | Provider + Context |
| Flexible component API | Compound Components |
| Logic + UI separation | Container/Presentational |
| Cross-cutting concerns (auth, logging) | HOC |
| Sharing rendering control | Render Props |

---

## Q87. What is the difference between `React.StrictMode` double invocation and actual bugs?

### Answer

`React.StrictMode` **intentionally double-invokes** certain functions in development to help detect **impure side effects** — functions that should be pure but aren't.

### What Gets Double-Invoked

- Functional component render functions
- `useState` and `useReducer` initializer functions
- `useMemo` and `useCallback` callbacks
- Class component constructors, `render`, and `shouldComponentUpdate`
- `getDerivedStateFromProps`

### Why Double Invocation Detects Bugs

React assumes render functions are **pure** (same input → same output, no side effects). Double-invoking them exposes code that breaks this assumption.

```jsx
// BUG — impure render: side effect in render
let renderCount = 0;

function BadComponent() {
  renderCount++; // side effect! increments twice in StrictMode
  console.log('rendered', renderCount); // logs 1, 2 instead of 1 — caught!
  return <div>{renderCount}</div>;
}

// CORRECT — pure render
function GoodComponent({ count }) {
  return <div>{count}</div>; // no side effects
}
```

### Double Invocation Is NOT a Bug

If you see `console.log` running twice in development — that's StrictMode working correctly:

```jsx
function App() {
  console.log('render'); // logs TWICE in dev — normal with StrictMode
  return <div>Hello</div>;
}
```

### Real Bugs StrictMode Catches

```jsx
// Bug 1: External variable mutation in render
let counter = 0;
function Counter() {
  counter += 1; // mutates external state in render — StrictMode exposes this
  return <p>{counter}</p>;
}

// Bug 2: Non-idempotent initialization
function Component() {
  const [state] = useState(() => {
    someExternalArray.push('item'); // impure initializer — runs twice → 2 items added
    return someExternalArray.length;
  });
}
```

### StrictMode Only in Development

All double-invocation behaviour is **completely removed in production builds**. It has zero performance impact on production.

---

## Q88. What is the `act()` utility in React Testing?

### Answer

`act()` is a testing utility that ensures all **state updates, effects, and re-renders** triggered by an action are processed and flushed **before you make assertions** in tests.

### Why It's Needed

React batches state updates and runs effects asynchronously. Without `act()`, your test assertions might run before React has finished updating the DOM.

### Usage with React Testing Library

React Testing Library wraps its utilities (`fireEvent`, `userEvent`, `render`) in `act()` automatically — so you rarely need to call it directly.

```jsx
import { render, screen, fireEvent } from '@testing-library/react';

test('increments counter on click', () => {
  render(<Counter />);

  // fireEvent is already wrapped in act()
  fireEvent.click(screen.getByRole('button', { name: /increment/i }));

  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});
```

### When You Need `act()` Explicitly

For async state updates not triggered by user events:

```jsx
import { act } from 'react';

test('loads user data', async () => {
  render(<UserProfile userId={1} />);

  // Wrap async operations that cause state updates
  await act(async () => {
    await Promise.resolve(); // let useEffect + fetch complete
  });

  expect(screen.getByText('Alice')).toBeInTheDocument();
});
```

### With `userEvent` (Recommended over `fireEvent`)

```jsx
import userEvent from '@testing-library/user-event';

test('submits form', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);

  await user.type(screen.getByLabelText('Email'), 'alice@example.com');
  await user.type(screen.getByLabelText('Password'), 'secret123');
  await user.click(screen.getByRole('button', { name: /login/i }));

  expect(screen.getByText('Welcome, Alice!')).toBeInTheDocument();
});
```

### Key Points

- RTL's utilities auto-wrap in `act()` — you usually don't call it manually
- Use `await act(async () => { ... })` for async effects not triggered by RTL utilities
- The warning `"not wrapped in act(...)"` means an async state update happened after your test ended — fix by awaiting properly

---

## Q89. How do you test React components? What are the best practices?

### Answer

### Testing Pyramid for React

```
       E2E Tests (few)           ← Playwright, Cypress
     Integration Tests (some)   ← React Testing Library
   Unit Tests (many)             ← Jest, Vitest
```

### Tools

- **Jest / Vitest** — test runner and assertion library
- **React Testing Library (RTL)** — renders components, queries DOM like a user
- **Mock Service Worker (MSW)** — mock API calls at the network level
- **Playwright / Cypress** — full browser E2E tests

### React Testing Library Philosophy

> "Test behavior, not implementation details."

Test what the **user sees and does**, not internal state or component structure.

```jsx
// Component
function LoginForm({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  return (
    <form onSubmit={() => onLogin({ email, password })}>
      <label>
        Email
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      <button type="submit">Login</button>
    </form>
  );
}
```

```jsx
// Test — tests behavior, not internals
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  test('calls onLogin with email and password', async () => {
    const mockLogin = jest.fn();
    const user = userEvent.setup();

    render(<LoginForm onLogin={mockLogin} />);

    await user.type(screen.getByLabelText('Email'),    'alice@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      email:    'alice@example.com',
      password: 'secret',
    });
  });
});
```

### RTL Query Priority (Best to Worst)

1. `getByRole` — most accessible, matches what screen readers see
2. `getByLabelText` — for form fields
3. `getByPlaceholderText` — avoid if label is available
4. `getByText` — for buttons, headings, paragraphs
5. `getByDisplayValue` — for current form values
6. `getByTestId` — last resort, implementation detail

### Best Practices

- Avoid testing **implementation details** (state variable names, private methods)
- Mock at the **network level** (MSW) not component level
- Write tests from the **user's perspective**
- Use `getByRole` as the primary query
- Test **error states** and **loading states** too
- Prefer `userEvent` over `fireEvent` (more realistic)

---

## Q90. What is the difference between unit, integration, and E2E tests in React?

### Answer

### Unit Tests

Test a **single component or function in isolation**, mocking all dependencies.

```jsx
// Unit test — isolated component with mocked props
test('Button renders correct label', () => {
  render(<Button label="Submit" onClick={jest.fn()} />);
  expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
});

// Unit test — pure utility function
test('formatPrice formats to USD', () => {
  expect(formatPrice(1999)).toBe('$19.99');
});
```

**Fast, many, focused on a single unit.**

### Integration Tests

Test how **multiple components work together**, including real child components and real hooks — but still mock network/DB.

```jsx
// Integration test — tests the full form + validation + submission flow
test('shows error when submitting empty form', async () => {
  render(<ContactForm />); // renders form + validation + button together

  await userEvent.click(screen.getByRole('button', { name: /send/i }));

  expect(screen.getByText('Email is required')).toBeInTheDocument();
  expect(screen.getByText('Message is required')).toBeInTheDocument();
});
```

**Slower than unit, more confidence, mock network layer.**

### End-to-End (E2E) Tests

Test the **entire application** in a real browser — real network (or MSW), real DB, real navigation.

```javascript
// Playwright E2E test
test('user can login and see dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.fill('[name="email"]',    'alice@example.com');
  await page.fill('[name="password"]', 'secret123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard');
  await expect(page.getByText('Welcome, Alice!')).toBeVisible();
});
```

**Slowest, fewest, highest confidence.**

### Comparison Table

| Feature | Unit | Integration | E2E |
|---|---|---|---|
| Speed | Very fast | Medium | Slow |
| Confidence | Low | Medium | High |
| Scope | One unit | Multiple components | Full app |
| Network | Mocked | Mocked (MSW) | Real / MSW |
| Quantity | Many | Some | Few |
| Tool | Jest/Vitest | RTL + Jest | Playwright, Cypress |

---

## Q91. What is the purpose of `React.createContext` vs `useContext`?

### Answer

They serve different but complementary roles in React's Context API.

### `React.createContext` — Creates the Context Object

```jsx
// Creates a Context with an optional default value
const ThemeContext = React.createContext('light'); // 'light' is the default

// Returns two components:
// ThemeContext.Provider — wraps the tree and provides a value
// ThemeContext.Consumer — legacy way to consume (replaced by useContext)
```

The **default value** is only used when a component consumes the context **without a Provider** above it in the tree.

### `useContext` — Consumes the Context

```jsx
function ThemedButton() {
  // Reads the nearest ThemeContext.Provider's value above in the tree
  const theme = useContext(ThemeContext);
  return <button className={theme}>Click me</button>;
}
```

### Full Example

```jsx
// 1. Create
const UserContext = React.createContext(null);

// 2. Provide
function App() {
  const [user] = useState({ name: 'Alice', role: 'admin' });
  return (
    <UserContext.Provider value={user}>
      <Dashboard />
    </UserContext.Provider>
  );
}

// 3. Consume (anywhere in the tree)
function Avatar() {
  const user = useContext(UserContext);
  return <img src={`/avatars/${user.name}.jpg`} alt={user.name} />;
}
```

### `useContext` vs `Context.Consumer`

```jsx
// Old way — Context.Consumer (verbose)
<UserContext.Consumer>
  {user => <Avatar user={user} />}
</UserContext.Consumer>

// Modern way — useContext (clean)
const user = useContext(UserContext);
```

### Key Points

- `createContext` runs once — at module level, outside components
- `useContext` runs inside a component — re-renders the component when context value changes
- If the Provider value changes, **all** `useContext` consumers re-render
- To prevent unnecessary re-renders, split contexts or memoize the value

---

## Q92. How do you prevent unnecessary re-renders in React?

### Answer

Re-renders are not always bad — React is fast. But when components render too often with the same output, it's wasted work.

### 1. `React.memo` — Skip re-render if props unchanged

```jsx
const PriceTag = React.memo(({ price, currency }) => {
  return <span>{currency}{price}</span>;
});
```

### 2. `useMemo` — Cache expensive computed values

```jsx
const sortedItems = useMemo(
  () => [...items].sort((a, b) => a.price - b.price),
  [items]
);
```

### 3. `useCallback` — Stable function references for memoized children

```jsx
const handleDelete = useCallback((id) => {
  setItems(prev => prev.filter(i => i.id !== id));
}, []);

<ItemList items={items} onDelete={handleDelete} />
```

### 4. Split State — Keep state close to where it's used

```jsx
// Bad — top-level state causes entire tree to re-render on every keystroke
function App() {
  const [search, setSearch] = useState('');
  return (
    <>
      <SearchInput value={search} onChange={setSearch} />
      <HeavyDashboard /> {/* re-renders on every keystroke! */}
    </>
  );
}

// Good — state isolated in SearchInput component
function App() {
  return (
    <>
      <SearchInput />       {/* owns its own state */}
      <HeavyDashboard />    {/* never re-renders due to search */}
    </>
  );
}
```

### 5. Split Context — Separate frequently-changing from stable values

```jsx
// Bad — one context causes all consumers to re-render on any change
const AppContext = React.createContext();

// Good — separate contexts, consumers only re-render for their part
const UserContext  = React.createContext(); // rarely changes
const ThemeContext = React.createContext(); // may change
const CartContext  = React.createContext(); // changes often
```

### 6. `key` to Reset Component State

```jsx
// Force a fresh mount (reset all state) by changing key
<UserProfile key={userId} userId={userId} />
```

### 7. Avoid Object / Array Literals in JSX

```jsx
// Bad — new object reference every render → breaks React.memo
<Component style={{ color: 'red' }} />

// Good — stable reference
const style = { color: 'red' }; // defined outside component
<Component style={style} />
// OR use useMemo
const style = useMemo(() => ({ color: 'red' }), []);
```

### Debugging Re-renders

Use **React DevTools Profiler** → enable "Highlight updates when components render" → interact with UI → see which components flash (re-render).

---

## Q93. What is the difference between `React.memo` with custom comparator and `shouldComponentUpdate`?

### Answer

Both allow **fine-grained control** over whether a component should re-render, but for functional vs class components.

### `shouldComponentUpdate` — Class Component

```jsx
class ExpensiveChart extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    // Re-render only if data array length changed
    return nextProps.data.length !== this.props.data.length;
  }

  render() {
    return <Chart data={this.props.data} />;
  }
}
```

Returns `true` → re-render. Returns `false` → skip.

### `React.memo` with Custom Comparator — Functional Component

```jsx
function Chart({ data, title }) {
  return <div>{/* expensive chart render */}</div>;
}

// Custom comparator — returns true = EQUAL = skip re-render
//                     returns false = NOT EQUAL = re-render
const MemoizedChart = React.memo(Chart, (prevProps, nextProps) => {
  // Skip re-render if only data length is the same
  return prevProps.data.length === nextProps.data.length
      && prevProps.title === nextProps.title;
});
```

### Key Difference in Return Value Logic

| Method | Return `true` means | Return `false` means |
|---|---|---|
| `shouldComponentUpdate` | **Re-render** | Skip render |
| `React.memo` comparator | **Skip render** (props are equal) | Re-render (props changed) |

They are **opposite** — easy to confuse!

### Deep Comparison Example

```jsx
import { isEqual } from 'lodash';

const DeepMemoComponent = React.memo(
  ({ config }) => <ExpensiveUI config={config} />,
  (prev, next) => isEqual(prev.config, next.config) // deep compare
);
```

> Use deep comparison sparingly — running `isEqual` on every render can be more expensive than just re-rendering.

---

## Q94. What is the difference between controlled inputs and `defaultValue`?

### Answer

### Controlled Input — `value` prop

Value is fully **controlled by React state**. The input always displays exactly what's in state.

```jsx
function ControlledInput() {
  const [text, setText] = useState('');
  return (
    <input
      value={text}                          // controlled by state
      onChange={e => setText(e.target.value)} // required to allow typing
    />
  );
}
```

If you provide `value` without `onChange`, the input becomes **read-only** (React warns you).

### Uncontrolled Input — `defaultValue` prop

Sets the **initial value** only. After mount, the DOM manages the value. React doesn't track changes.

```jsx
function UncontrolledInput() {
  const ref = useRef(null);

  const handleSubmit = () => {
    console.log(ref.current.value); // read when needed
  };

  return (
    <input
      defaultValue="Initial text"  // sets value once on mount
      ref={ref}
    />
  );
}
```

### `defaultChecked` for Checkboxes

Same pattern applies to checkboxes:

```jsx
// Controlled
<input type="checkbox" checked={isChecked} onChange={e => setChecked(e.target.checked)} />

// Uncontrolled
<input type="checkbox" defaultChecked={true} />
```

### Comparison Table

| Feature | `value` (controlled) | `defaultValue` (uncontrolled) |
|---|---|---|
| Who manages value | React state | DOM |
| Tracks changes | Yes | No |
| Real-time validation | Easy | Hard |
| Requires `onChange` | Yes (to allow typing) | No |
| Read value | From state | Via `ref.current.value` |

---

## Q95. What are the rules of hooks and why do they exist?

### Answer

React has two essential rules for hooks, enforced by the `eslint-plugin-react-hooks` package.

### Rule 1 — Only Call Hooks at the Top Level

Never call hooks inside loops, conditions, or nested functions.

```jsx
// WRONG
function Component({ isLoggedIn }) {
  if (isLoggedIn) {
    const [user, setUser] = useState(null); // conditional hook!
  }

  for (let i = 0; i < 3; i++) {
    useEffect(() => {}); // hook in a loop!
  }

  function nested() {
    const [val, setVal] = useState(0); // hook in nested function!
  }
}

// CORRECT — always at top level
function Component({ isLoggedIn }) {
  const [user, setUser] = useState(null); // always called
  const [val,  setVal]  = useState(0);   // always called

  useEffect(() => {
    if (isLoggedIn) { /* conditional logic inside hook */ }
  }, [isLoggedIn]);
}
```

### Rule 2 — Only Call Hooks from React Functions

Call hooks only from:
- React functional components
- Custom hooks

```jsx
// WRONG
function regularJsFunction() {
  const [count, setCount] = useState(0); // not a React component or hook!
}

// CORRECT
function useCounter() { // custom hook
  const [count, setCount] = useState(0);
  return { count, increment: () => setCount(c => c + 1) };
}
```

### Why These Rules Exist

React tracks hooks by their **call order** on every render. React uses an internal linked list — hook #1, hook #2, hook #3 — and matches them to the same hooks from the previous render.

```
Render 1: useState(0), useEffect(...), useState('')
          hook[0]      hook[1]         hook[2]

Render 2: useState(0), useEffect(...), useState('')
          hook[0]      hook[1]         hook[2]  ← matches correctly
```

If you call hooks conditionally, the order can change between renders — React loses track of which state belongs to which hook.

```
Render 1: useState(0), useEffect(...)  ← condition was true
          hook[0]      hook[1]

Render 2: useEffect(...)               ← condition is false, useState skipped!
          hook[0]   ← now points to wrong state — BUG!
```

### eslint-plugin-react-hooks

```bash
npm install eslint-plugin-react-hooks --save-dev
```

This plugin enforces both rules at lint time, catching violations before they reach runtime.

---

## Q96. What is the difference between `null`, `undefined`, and `false` in React JSX?

### Answer

React treats certain values as **nothing to render** (they produce no DOM output), while others are rendered as text or throw errors.

### Values That Render Nothing

```jsx
function Demo() {
  return (
    <div>
      {null}       {/* renders nothing */}
      {undefined}  {/* renders nothing */}
      {false}      {/* renders nothing */}
      {true}       {/* renders nothing */}
    </div>
  );
}
// Output: <div></div>
```

### Values That DO Render

```jsx
<div>
  {0}          {/* renders "0" — common bug! */}
  {""}         {/* renders empty string (invisible but present) */}
  {NaN}        {/* renders "NaN" */}
</div>
```

### The `0` Bug — Most Common Mistake

```jsx
// BUG — renders "0" when count is 0
function List({ items }) {
  return (
    <div>
      {items.length && <ItemList items={items} />}
      {/*  ^ When items.length = 0, this renders "0" on screen! */}
    </div>
  );
}

// FIX 1 — convert to boolean
{items.length > 0 && <ItemList items={items} />}

// FIX 2 — ternary
{items.length ? <ItemList items={items} /> : null}
```

### Conditional Rendering Patterns

```jsx
// Short-circuit (guard against the 0 bug with > 0)
{count > 0 && <Badge count={count} />}

// Ternary
{isLoggedIn ? <UserMenu /> : <LoginButton />}

// Nullish coalescing for fallback content
{username ?? 'Guest'}

// Component returning null to hide itself
function Alert({ message }) {
  if (!message) return null; // renders nothing
  return <div className="alert">{message}</div>;
}
```

---

## Q97. What is the difference between `React.PureComponent`, `React.memo`, and manual `shouldComponentUpdate`?

### Answer

All three prevent unnecessary re-renders but differ in how and where they're used.

### `React.PureComponent`

- **Class component** optimization
- Auto-implements `shouldComponentUpdate` with **shallow comparison** of all props and state
- Simple drop-in replacement for `React.Component` when you want automatic optimization

```jsx
class UserCard extends React.PureComponent {
  render() {
    // Only re-renders if props.user or props.onClick reference changes
    return <div>{this.props.user.name}</div>;
  }
}
```

### `React.memo`

- **Functional component** optimization
- Wraps a component and does **shallow comparison** of props by default
- Accepts an optional custom comparator

```jsx
const UserCard = React.memo(function UserCard({ user, onClick }) {
  // Only re-renders if user or onClick reference changes
  return <div>{user.name}</div>;
});
```

### `shouldComponentUpdate`

- **Class component** — manual, full control
- You write the comparison logic yourself
- Can implement deep comparison, partial checks, etc.

```jsx
class UserCard extends React.Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.user.id !== this.props.user.id; // custom logic
  }
  render() { return <div>{this.props.user.name}</div>; }
}
```

### Comparison Table

| Feature | `PureComponent` | `React.memo` | `shouldComponentUpdate` |
|---|---|---|---|
| Component type | Class | Functional | Class |
| Comparison | Auto shallow | Auto shallow (or custom) | Fully manual |
| Custom logic | No | Yes (2nd arg) | Yes |
| Boilerplate | None | None | Some |

### Important Caveat for All Three — Shallow Comparison

```jsx
// All three will RE-RENDER here, even though the data looks the same
// because a NEW array reference is created on every render
<UserCard user={{ name: 'Alice' }} /> // new object every render!

// Fix — memoize the object or use stable reference
const user = useMemo(() => ({ name: 'Alice' }), []);
<UserCard user={user} />
```

---

## Q98. How does React handle forms with multiple inputs?

### Answer

### Pattern 1 — Separate State for Each Input

Simple but verbose for many fields:

```jsx
function SignupForm() {
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [age,   setAge]   = useState('');

  return (
    <form>
      <input value={name}  onChange={e => setName(e.target.value)}  name="name" />
      <input value={email} onChange={e => setEmail(e.target.value)} name="email" />
      <input value={age}   onChange={e => setAge(e.target.value)}   name="age" type="number" />
    </form>
  );
}
```

### Pattern 2 — Single Object State with Dynamic Key (Recommended)

```jsx
function SignupForm() {
  const [form, setForm] = useState({
    name: '', email: '', age: '', password: '', role: 'user'
  });

  // Single handler for all inputs using e.target.name
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name"     value={form.name}     onChange={handleChange} placeholder="Name" />
      <input name="email"    value={form.email}    onChange={handleChange} placeholder="Email" type="email" />
      <input name="age"      value={form.age}      onChange={handleChange} placeholder="Age" type="number" />
      <input name="password" value={form.password} onChange={handleChange} placeholder="Password" type="password" />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Pattern 3 — React Hook Form (Production Recommended)

```jsx
import { useForm } from 'react-hook-form';

function SignupForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name',  { required: 'Name is required' })} />
      {errors.name && <p>{errors.name.message}</p>}

      <input {...register('email', { required: true, pattern: /^\S+@\S+$/i })} />
      {errors.email && <p>Valid email required</p>}

      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Comparison

| Pattern | Re-renders per keystroke | Validation | Complexity |
|---|---|---|---|
| Separate state | 1 (per input) | Manual | Low |
| Object state | 1 (whole form) | Manual | Low-Medium |
| React Hook Form | 0 (uncontrolled) | Built-in (+ Zod/Yup) | Low |

---

## Q99. What are the differences between `React 18` and `React 19`?

### Answer

React 19 was released in **December 2024**, introducing significant new features focused on reducing boilerplate for async operations and improving the developer experience.

### React 19 Key Features

#### 1. Actions — Async Functions as Form Actions

React 19 introduces the concept of **Actions** — async functions that handle form submissions, mutations, and pending states automatically.

```jsx
// React 19 — useActionState hook
import { useActionState } from 'react';

async function updateProfile(prevState, formData) {
  const name = formData.get('name');
  try {
    await updateUserApi(name);
    return { success: true, message: 'Profile updated!' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function ProfileForm() {
  const [state, formAction, isPending] = useActionState(updateProfile, null);

  return (
    <form action={formAction}>
      <input name="name" placeholder="Your name" />
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
      {state?.message && <p>{state.message}</p>}
    </form>
  );
}
```

#### 2. `useFormStatus` — Form Submission State

```jsx
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus(); // reads parent form's status
  return <button disabled={pending}>{pending ? 'Submitting...' : 'Submit'}</button>;
}
```

#### 3. `useOptimistic` — Built-in Optimistic UI

```jsx
import { useOptimistic } from 'react';

function LikeButton({ post }) {
  const [optimisticPost, addOptimisticLike] = useOptimistic(
    post,
    (state, liked) => ({ ...state, likes: state.likes + (liked ? 1 : -1), isLiked: liked })
  );

  async function handleLike() {
    addOptimisticLike(!optimisticPost.isLiked); // instant UI update
    await toggleLikeApi(post.id);               // actual API call
  }

  return (
    <button onClick={handleLike}>
      {optimisticPost.isLiked ? 'Unlike' : 'Like'} ({optimisticPost.likes})
    </button>
  );
}
```

#### 4. `use()` Hook — Read Promises and Context

```jsx
import { use } from 'react';

// Unwrap a Promise (suspends until resolved)
function UserProfile({ userPromise }) {
  const user = use(userPromise); // suspends if not resolved
  return <div>{user.name}</div>;
}

// Read Context (alternative to useContext)
const theme = use(ThemeContext);
```

#### 5. Server Actions — Call Server Functions from Client

```jsx
// actions.js — runs on server
'use server';
export async function savePost(formData) {
  await db.posts.create({ title: formData.get('title') });
}

// Component — calls server function directly
import { savePost } from './actions';

function NewPostForm() {
  return (
    <form action={savePost}>
      <input name="title" />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

### React 18 vs React 19 Summary

| Feature | React 18 | React 19 |
|---|---|---|
| Async form handling | Manual | `useActionState` |
| Form pending state | Manual | `useFormStatus` |
| Optimistic updates | Manual / React Query | `useOptimistic` |
| Promise unwrapping | Workarounds | `use()` hook |
| Server functions | Via API routes | Server Actions |
| ref as prop | `forwardRef` needed | Direct `ref` prop |
| Context reading | `useContext` | `use(Context)` |

---

## Q100. What are the most important things to remember for a React interview?

### Answer

### Core Concepts Checklist

**Fundamentals**
- JSX is syntactic sugar for `React.createElement()`
- React renders are pure functions: same input (props + state) → same output (UI)
- `UI = f(state)` — React's core mental model
- Virtual DOM → Diffing → Reconciliation → Minimal DOM update

**Hooks Mastery**
- `useState` — local state, triggers re-render
- `useEffect` — side effects, 3 dependency array modes
- `useContext` — consume context without prop drilling
- `useRef` — DOM access and mutable values that don't trigger re-render
- `useMemo` — memoize computed values
- `useCallback` — memoize function references
- `useReducer` — complex state logic, action-based updates
- Rules of Hooks: top-level only, React functions only

**Performance**
- `React.memo` — skip child re-renders if props unchanged
- Split state close to where it's used
- Split contexts by change frequency
- Virtualize long lists (`react-window`)
- Code split routes with `React.lazy` + `Suspense`
- Profile before optimizing — use React DevTools Profiler

**Patterns**
- Compound Components — flexible, composable UIs
- Provider Pattern — shared state via Context
- Custom Hooks — reusable stateful logic
- Container/Presentational — logic/UI separation

**Architecture**
- Unidirectional data flow (parent → child via props, child → parent via callbacks)
- Context API vs Redux vs Zustand — know when to use each
- SSR vs CSR vs SSG — know the trade-offs

### Common Interview Mistakes to Avoid

- Mutating state directly (always return new objects/arrays)
- Using array index as key for dynamic lists
- Missing cleanup in `useEffect` (memory leaks)
- Calling hooks conditionally (breaks hook order)
- Over-memoizing without profiling first
- Not handling loading and error states in async operations

### Questions to Ask the Interviewer

- What state management solution do you use and why?
- How do you handle performance in production?
- Do you use TypeScript with React?
- What testing strategy does the team follow?
- Are you using Next.js or plain React?

---

## Summary Cheat Sheet (Q81–Q100)

| Topic | Key Points |
|---|---|
| Unidirectional data flow | State → Props → UI → Events → State; predictable, debuggable |
| Stale closure | Outdated value captured in closure; fix with functional updater or `useRef` |
| React Fiber | Incremental rendering; two phases (render/commit); enables Concurrent Mode |
| Windowing / Virtualization | Render only visible rows; `react-window`; use for 500+ item lists |
| Client vs Server data fetching | Client = useEffect/React Query; Server = getServerSideProps / RSC |
| React design patterns | HOC, Render Props, Custom Hooks, Compound, Provider, Container/Presentational |
| StrictMode double invocation | Intentional; catches impure renders; no-op in production |
| `act()` in testing | Flushes state updates + effects before assertions; RTL wraps it automatically |
| Testing best practices | Test behavior not implementation; RTL + Jest; `getByRole` priority |
| Unit vs Integration vs E2E | Unit (fast/isolated), Integration (components together), E2E (full browser) |
| `createContext` vs `useContext` | createContext = creates context object; useContext = consumes nearest Provider |
| Preventing re-renders | memo, useMemo, useCallback, split state, split context, stable references |
| `React.memo` custom comparator | Returns true = skip (equal); opposite of `shouldComponentUpdate` |
| `value` vs `defaultValue` | value = controlled by React; defaultValue = initial value, then DOM controls |
| Rules of Hooks | Top-level only; React functions only; reason: hook order must be stable |
| `null/false/undefined` in JSX | Render nothing; `0` is the common trap — use `> 0 &&` not `&& ` |
| PureComponent vs memo vs SCU | PureComponent & memo = auto shallow; SCU = manual class component |
| Multiple input forms | Object state + dynamic `[name]` key; React Hook Form for production |
| React 18 vs React 19 | R19: Actions, useActionState, useFormStatus, useOptimistic, `use()` hook |
| Interview checklist | Hooks, performance, patterns, architecture, unidirectional flow |

---

*Congratulations — you've covered all 100 React interview questions! You're ready to ace any React interview! 🎉🚀*
