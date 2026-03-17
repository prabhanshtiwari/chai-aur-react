# React `useState` – State Batching & Functional Updates

> **Topic:** React State Batching & the Functional Update Pattern in `useState`
> **Context:** Common React interview question / scenario

---

## Why This Topic Matters

- Frequently asked in **React interviews** — both as a theory question and as a live coding scenario.
- It is a **foundational React concept** (not just a surface-level one).
- Even though it touches JavaScript, it is considered a **React-specific interview question**.

---

## The Classic Interview Scenario

The interviewer asks you to build a simple **counter app** in React with:
- An **Increment** button (adds 1)
- A **Decrement** button (subtracts 1)

A basic implementation looks like this:

```jsx
const [counter, setCounter] = useState(15);

// In JSX:
<h2>{counter}</h2>
<button onClick={() => setCounter(counter + 1)}>Add Value</button>
<button onClick={() => setCounter(counter - 1)}>Remove Value</button>
```

---

## The Follow-Up Trap Question

Once you write the basic counter, the interviewer **duplicates the `setCounter` call** inside the click handler multiple times:

```jsx
<button onClick={() => {
  setCounter(counter + 1);
  setCounter(counter + 1);
  setCounter(counter + 1);
  setCounter(counter + 1);
}}>Add Value</button>
```

### The Question:
> **"Without running the code — if `counter` is currently `15` and I click Add, what will the new value be?"**
> Options: `15`, `16`, `17`, `18`, `19`, or `20`?

### The Surprising Answer: **`16`** (not `19`)

Even though `setCounter(counter + 1)` is called **4 times**, the counter only increments by **1**.

---

## Why Does This Happen? — State Batching

### Core Concept: React **batches** state updates

React (using the **Fiber** architecture and its **diffing algorithm**) does **not** apply state updates one-by-one in real time. Instead:

1. All `setState` calls inside a single event handler are **collected into a batch**.
2. React sends the **entire batch** to be processed **together** at once.
3. Since all 4 calls reference the **same stale value** of `counter` (which is `15`), they all compute `15 + 1 = 16`.
4. The batch has **4 identical operations** → React sees them as the same work repeated → final result: `16`.

> Think of it like sending 4 identical letters in one envelope — only one action happens.

### Key Insight:
> `counter` inside the event handler refers to the **snapshot value at the time of render**, not a live/mutable variable. Calling `setCounter(counter + 1)` multiple times does **not** chain the updates.

---

## The Fix — Functional Update Pattern

To properly chain state updates (when each update depends on the previous one), pass a **callback function** to the setter instead of a direct value:

```jsx
<button onClick={() => {
  setCounter(prevCounter => prevCounter + 1);
  setCounter(prevCounter => prevCounter + 1);
  setCounter(prevCounter => prevCounter + 1);
  setCounter(prevCounter => prevCounter + 1);
}}>Add Value</button>
```

### How This Works:

- `setCounter` accepts a **callback function** as an argument.
- React calls each callback **sequentially**, passing the **latest updated state** as the argument (`prevCounter`).
- Each call gets the result of the previous call → updates chain correctly.
- Result: `15 → 16 → 17 → 18 → 19` → **final value: `19`** ✅

### Analogy (Promises):
> Similar to `.then().then().then()` chaining in Promises — each `.then()` receives the resolved value of the previous one.

---

## Naming the Callback Parameter

The parameter name inside the callback is just a **variable name** — you can call it anything:

```jsx
// All of these are valid and equivalent:
setCounter(prevCounter => prevCounter + 1);
setCounter(counter => counter + 1);      // shadows outer counter, but works
setCounter(c => c + 1);
```

> **Best Practice:** Use a consistent, meaningful name like `prevCounter` across all calls to avoid confusion during interviews and code reviews.

---

## `let` vs `const` for State Destructuring

```jsx
const [counter, setCounter] = useState(15);  // ✅ Fine
let [counter, setCounter] = useState(15);    // ✅ Also fine
```

- Using `const` is perfectly valid because the **array/object reference** isn't being reassigned — React manages the underlying state internally.
- Both work; `const` is the more common convention.

---

## Summary Table

| Approach | Code | Result (starting at 15, 4 calls) |
|---|---|---|
| Direct value | `setCounter(counter + 1)` × 4 | `16` ❌ (batched, stale value) |
| Functional update | `setCounter(prev => prev + 1)` × 4 | `19` ✅ (chained correctly) |

---

## Key Takeaways

1. React **batches** multiple `setState` calls in a single event handler for performance.
2. Direct value updates (e.g., `setCounter(counter + 1)`) all read the **same stale snapshot** — they do NOT chain.
3. The **functional update pattern** (`setCounter(prev => prev + 1)`) always receives the **latest state** and chains correctly.
4. This behavior is powered by React's **Fiber architecture** and its batching/diffing mechanism.
5. In practice, avoid multiple redundant state updates — compute the final value upfront. The functional update pattern is for cases where chaining is genuinely required.
6. The setter function (e.g., `setCounter`) **accepts either a value or a callback function**.