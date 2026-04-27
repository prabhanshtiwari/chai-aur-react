 # React Context API + Local Storage — Complete Notes
### Lecture: Building a Todo App (Project #10)

---

## 📌 What We Are Building

A **To-Do App** with the following features:
- Add a new todo
- Edit an existing todo (inline editing)
- Delete a todo
- Toggle complete/incomplete (with strikethrough styling)
- **Persist data using Local Storage** (data survives page refresh)

---

## 🧠 Core Concepts Covered

1. **Context API** — share state across components without prop drilling
2. **Local Storage** — browser-based key-value storage to persist data
3. **useEffect** — run side effects (like reading/writing localStorage)
4. **useState** — manage component-level and app-level state
5. **Array methods** — `map`, `filter`, spread (`...`) for immutable state updates

---

## 📁 Project Structure

```
src/
├── contexts/
│   ├── TodoContext.js    ← defines the context, useTodo hook, TodoProvider
│   └── index.js         ← re-exports everything from TodoContext.js
├── components/
│   ├── TodoForm.jsx      ← input form to add new todos
│   ├── TodoItem.jsx      ← individual todo row (edit, delete, toggle)
│   └── index.js         ← re-exports components
└── App.jsx               ← root, holds state + logic, wraps with provider
```

---

## 🔧 Project Setup

```bash
# Create Vite + React project
npm create vite@latest 10todocontextLocal -- --template react

cd 10todocontextLocal
npm install

# Install Tailwind CSS (follow Tailwind docs for Vite)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Configure `tailwind.config.js` and add Tailwind directives to `index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🗂️ Step 1: Create the Context — `src/contexts/TodoContext.js`

```js
import { createContext, useContext } from "react";

// createContext() creates a new Context object.
// We pass a DEFAULT VALUE to it — this is the shape/structure of the context.
// This default is only used if a component is NOT wrapped inside the Provider.
// Think of it as documentation: "here's what this context will provide."

export const TodoContext = createContext({
  todos: [
    {
      id: 1,
      todo: "Todo msg",   // the text of the todo
      completed: false,   // whether the todo is done
    },
  ],

  // These function signatures tell consumers what methods are available.
  // The actual implementation is written OUTSIDE (in App.jsx).
  // This is just a placeholder/type hint — functions do nothing by default.
  addTodo: (todo) => {},
  updateTodo: (id, todo) => {},
  deleteTodo: (id) => {},
  toggleComplete: (id) => {},
});

// Custom hook — instead of writing useContext(TodoContext) everywhere,
// we create useTodo() as a shorthand.
// Any component that calls useTodo() gets access to the full context value.
export const useTodo = () => {
  return useContext(TodoContext);
};

// TodoContext.Provider is the wrapper component that makes values available.
// We export it with a simpler name "TodoProvider" to avoid writing
// <TodoContext.Provider value={...}> everywhere — just <TodoProvider value={...}>
export const TodoProvider = TodoContext.Provider;
```

**Key Points:**
- `createContext(defaultValue)` — the default value is only used when there is NO matching Provider above the component in the tree.
- `useContext(context)` — subscribes a component to the context. Re-renders on value change.
- Exporting `TodoContext.Provider` as `TodoProvider` is a convenience alias.

---

## 📤 Step 2: Re-export via `src/contexts/index.js`

```js
// This is a barrel file — it re-exports everything from one place.
// Benefit: any file that needs context just imports from "../contexts"
// instead of "../contexts/TodoContext"
// Makes imports cleaner and easier to refactor later.

export { TodoContext, TodoProvider, useTodo } from "./TodoContext";
```

---

## ⚙️ Step 3: App.jsx — State, Logic, and Provider

This is where **all the business logic lives**. The context only declares *what* methods exist; App.jsx defines *how* they work.

```jsx
import { useState, useEffect } from 'react'
import { TodoProvider } from './contexts'
import './App.css'
import TodoForm from './components/TodoForm'
import TodoItem from './components/TodoItem'

function App() {

  // ─── STATE ─────────────────────────────────────────────────────────────────
  // todos is an array of todo objects: [{ id, todo, completed }, ...]
  // Starts empty — local storage will populate it via useEffect on mount.
  const [todos, setTodos] = useState([])


  // ─── FUNCTION: addTodo ─────────────────────────────────────────────────────
  // Accepts a todo object (with `todo` and `completed` fields).
  // Generates a unique ID using Date.now() (current timestamp in milliseconds).
  // Spreads the new todo at the FRONT of the array using the callback form of setState.
  // Callback form (prev => ...) is used to safely access the latest state.
  const addTodo = (todo) => {
    setTodos((prev) => [{ id: Date.now(), ...todo }, ...prev])
    //                   ↑ new todo at front    ↑ all old todos after it
  }


  // ─── FUNCTION: updateTodo ──────────────────────────────────────────────────
  // Accepts the id of the todo to update, and the new todo object.
  // Uses map() to loop over all todos:
  //   - If the current todo's id matches, replace it with the new todo.
  //   - Otherwise, keep the old todo as-is.
  const updateTodo = (id, todo) => {
    setTodos((prev) =>
      prev.map((prevTodo) =>
        prevTodo.id === id ? todo : prevTodo
        //                ↑ match found → replace  ↑ no match → keep original
      )
    )
  }


  // ─── FUNCTION: deleteTodo ──────────────────────────────────────────────────
  // Uses filter() to keep only todos whose id does NOT match the given id.
  // The matched todo is excluded from the new array → effectively deleted.
  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
    //                              ↑ keep all todos EXCEPT the one with matching id
  }


  // ─── FUNCTION: toggleComplete ──────────────────────────────────────────────
  // Flips the `completed` boolean of a specific todo.
  // map() finds the matching id, then spreads all existing properties
  // and overrides only `completed` with its negated value (!prevTodo.completed).
  const toggleComplete = (id) => {
    setTodos((prev) =>
      prev.map((prevTodo) =>
        prevTodo.id === id
          ? { ...prevTodo, completed: !prevTodo.completed }
          //   ↑ copy everything  ↑ flip true→false or false→true
          : prevTodo
      )
    )
  }


  // ─── useEffect #1: Load from Local Storage on Mount ───────────────────────
  // Runs ONCE when the component mounts (empty dependency array []).
  // Reads todos from localStorage, parses the JSON string back to an array,
  // and sets state — so the page loads with saved data.
  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem("todos"))
    // localStorage.getItem("todos") returns a JSON string or null
    // JSON.parse() converts the string back to a JavaScript array of objects

    if (todos && todos.length > 0) {
      setTodos(todos) // only update state if there's actual data
    }
  }, []) // [] means: run only once, on first render


  // ─── useEffect #2: Save to Local Storage whenever todos changes ────────────
  // Runs every time the `todos` state changes.
  // Converts the todos array to a JSON string and saves it to localStorage.
  // This keeps localStorage in sync with the in-memory state automatically.
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
    // localStorage only stores strings, so we must stringify the array.
    // JSON.stringify() converts array/objects → JSON string
  }, [todos]) // re-runs whenever todos array changes


  // ─── JSX: Provide context + render components ──────────────────────────────
  return (
    // TodoProvider wraps the whole UI.
    // The `value` prop is what gets shared with ALL child components via context.
    // Any component inside here can call useTodo() to access these values.
    <TodoProvider value={{ todos, addTodo, updateTodo, deleteTodo, toggleComplete }}>
      <div className="bg-[#172842] min-h-screen py-8">
        <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
          <h1 className="text-2xl font-bold text-center mb-8 mt-2">Manage Your Todos</h1>

          <div className="mb-4">
            <TodoForm /> {/* Form to add new todos */}
          </div>

          <div className="flex flex-wrap gap-y-3">
            {/* Loop over todos array, render one TodoItem per todo */}
            {todos.map((todo) => (
              <div key={todo.id} className='w-full'>
                {/* key={todo.id} is required by React for list rendering performance.
                    Using a stable unique ID (not index) is strongly recommended. */}
                <TodoItem todo={todo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </TodoProvider>
  )
}

export default App
```

---

## 📝 Step 4: TodoForm Component — `src/components/TodoForm.jsx`

This component handles user input and calls `addTodo` from context.

```jsx
import React, { useState } from 'react'
import { useTodo } from '../contexts/TodoContext';
// useTodo() gives us access to everything in the TodoContext

function TodoForm() {
    // Local state for the input field — tracks what the user is currently typing
    const [todo, setTodo] = useState("")

    // Pull addTodo from context — no need to pass it as a prop!
    // This is the power of Context API — any nested component can access shared state.
    const { addTodo } = useTodo()

    const add = (e) => {
        e.preventDefault() // Prevent default form submission (page reload)

        if (!todo) return // Guard clause: don't add empty todos

        // addTodo expects an object with `todo` (string) and `completed` (boolean)
        addTodo({ todo, completed: false })
        // { todo } is shorthand for { todo: todo } — ES6 property shorthand

        setTodo("") // Clear the input field after adding
    }

    return (
        // onSubmit fires when user presses Enter or clicks the Add button
        // because the button type is "submit"
        <form onSubmit={add} className="flex">
            <input
                type="text"
                placeholder="Write Todo..."
                className="w-full border border-black/10 rounded-l-lg px-3 outline-none duration-150 bg-white/20 py-1.5"
                value={todo}           // controlled input — value tied to state
                onChange={(e) => setTodo(e.target.value)} // update state on every keystroke
            />
            <button type="submit" className="rounded-r-lg px-3 py-1 bg-green-600 text-white shrink-0">
                Add
            </button>
            {/* type="submit" means clicking this button triggers the form's onSubmit */}
        </form>
    );
}

export default TodoForm;
```

**Key Concepts:**
- **Controlled Input**: `value={todo}` + `onChange` keeps React state as the single source of truth for the input.
- No need to add an `onClick` to the button — `type="submit"` automatically triggers `onSubmit`.
- `addTodo` is consumed from context directly — **no prop drilling needed**.

---

## 🧩 Step 5: TodoItem Component — `src/components/TodoItem.jsx`

This is the most complex component. It handles: display, inline editing, toggle complete, and delete.

```jsx
import React, { useState } from 'react'
import { useTodo } from '../contexts/TodoContext';

// Receives a single `todo` object as prop from App.jsx's map loop
function TodoItem({ todo }) {

    // ── Local state: is this specific todo in edit mode? ──────────────────────
    // Each TodoItem manages its OWN edit mode independently.
    const [isTodoEditable, setIsTodoEditable] = useState(false)

    // ── Local state: the current text shown in the input field ───────────────
    // Initialized with todo.todo (the todo's text from props/context)
    // This is what the user edits — it's separate from the saved context value
    // until the user clicks Save.
    const [todoMsg, setTodoMsg] = useState(todo.todo)

    // Pull methods from context
    const { updateTodo, deleteTodo, toggleComplete } = useTodo()


    // ── editTodo: Save the edited text ────────────────────────────────────────
    // Called when user clicks the Save (📁) button.
    // Calls updateTodo with the todo's id + a new object that:
    //   - Copies all existing properties with spread (...todo)
    //   - Overrides only `todo` (the text) with the new value from local state
    const editTodo = () => {
        updateTodo(todo.id, { ...todo, todo: todoMsg })
        setIsTodoEditable(false) // Exit edit mode after saving
    }

    // ── toggleCompleted: Flip the completed status ────────────────────────────
    // Calls the context's toggleComplete with just the todo's id.
    // The actual flipping logic lives in App.jsx's toggleComplete function.
    const toggleCompleted = () => {
        toggleComplete(todo.id)
    }

    return (
        // Dynamic background color based on completion status
        // Completed → green background; Incomplete → purple background
        <div
            className={`flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300 text-black ${
                todo.completed ? "bg-[#c6e9a7]" : "bg-[#ccbed7]"
            }`}
        >
            {/* ── Checkbox: toggle complete ──────────────────────────────────── */}
            <input
                type="checkbox"
                className="cursor-pointer"
                checked={todo.completed}         // reflects actual completed value from context
                onChange={toggleCompleted}        // flip it on change
            />

            {/* ── Text input: shows todo text, becomes editable in edit mode ─── */}
            <input
                type="text"
                className={`border outline-none w-full bg-transparent rounded-lg ${
                    isTodoEditable ? "border-black/10 px-2" : "border-transparent"
                    // Shows border only in edit mode — invisible border when read-only
                } ${
                    todo.completed ? "line-through" : ""
                    // Strikethrough text when todo is completed
                }`}
                value={todoMsg}                          // controlled by local state
                onChange={(e) => setTodoMsg(e.target.value)} // update local state on type
                readOnly={!isTodoEditable}               // non-editable unless in edit mode
            />

            {/* ── Edit / Save Button ─────────────────────────────────────────── */}
            <button
                className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0 disabled:opacity-50"
                onClick={() => {
                    if (todo.completed) return; // Can't edit a completed todo

                    if (isTodoEditable) {
                        editTodo();              // If already in edit mode → save
                    } else {
                        setIsTodoEditable((prev) => !prev); // Toggle into edit mode
                    }
                }}
                disabled={todo.completed} // Button is grayed out for completed todos
            >
                {isTodoEditable ? "📁" : "✏️"}
                {/* Shows Save icon when editing, Edit icon when not */}
            </button>

            {/* ── Delete Button ──────────────────────────────────────────────── */}
            <button
                className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0"
                onClick={() => deleteTodo(todo.id)} // Directly call context's deleteTodo
            >
                ❌
            </button>
        </div>
    );
}

export default TodoItem;
```

---

## 📦 Step 6: Components Barrel File — `src/components/index.js`

```js
// Barrel file — re-exports all components from one place
// Benefit: import { TodoForm, TodoItem } from './components'
// instead of separate imports from each file

import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

export { TodoForm, TodoItem }
```

---

## 🗄️ Local Storage — Deep Dive

### What is Local Storage?
- Built into the **browser** (not specific to React, Vue, or any framework)
- Stores data as **key-value pairs**
- Data **persists** across page refreshes and browser restarts
- Limit: ~5MB per origin
- All values are stored as **strings** — objects/arrays must be serialized

### Core API

```js
// STORE data (must convert objects/arrays to string first)
localStorage.setItem("key", JSON.stringify(value))

// RETRIEVE data (must parse string back to object/array)
const value = JSON.parse(localStorage.getItem("key"))

// REMOVE a specific item
localStorage.removeItem("key")

// CLEAR everything
localStorage.clear()
```

### Why `JSON.stringify` / `JSON.parse`?

```js
// localStorage only stores strings.
// If you store an array directly, it gets converted poorly:
localStorage.setItem("todos", [{ id: 1, todo: "test" }])
// Stored as: "[object Object]" ← WRONG!

// Correct approach:
localStorage.setItem("todos", JSON.stringify([{ id: 1, todo: "test" }]))
// Stored as: '[{"id":1,"todo":"test"}]' ← correct JSON string

// When reading back:
const todos = JSON.parse(localStorage.getItem("todos"))
// Converts string back to JavaScript array of objects
```

### How to Inspect in Browser
Right-click → Inspect → Application tab → Storage → Local Storage → your domain

---

## 🔁 useEffect Patterns for Local Storage

### Pattern 1: Load on Mount (once)

```js
useEffect(() => {
  // Runs only once when component mounts
  const stored = JSON.parse(localStorage.getItem("todos"))
  if (stored && stored.length > 0) {
    setTodos(stored) // populate state with saved data
  }
}, []) // empty array = run once on mount
```

### Pattern 2: Save on State Change

```js
useEffect(() => {
  // Runs whenever `todos` changes
  localStorage.setItem("todos", JSON.stringify(todos))
}, [todos]) // dependency = todos → runs on every todos update
```

**Why two separate `useEffect`s instead of one?**
- If you put both in one effect with `[todos]` as dependency:
  - On mount → reads from storage ✓
  - On todos change → tries to GET and then SET → causes unnecessary reads
- Two separate effects = **clear separation of concerns**:
  - Effect 1: **Read** once on load
  - Effect 2: **Write** every time todos changes

---

## 🔑 Key Concept: The `key` prop in Lists

```jsx
{todos.map((todo) => (
  <div key={todo.id}>  {/* ← REQUIRED */}
    <TodoItem todo={todo} />
  </div>
))}
```

- React uses `key` to identify which items changed/added/removed in a list
- **Use a stable unique ID** (like `todo.id` from `Date.now()`) — not array index
- **Why not index?**
  - If item 2 is deleted, item 3 becomes index 2 → React gets confused
  - Can cause bugs with controlled inputs, animations, and state
  - Using a stable ID: only the deleted item disappears, others stay untouched

---

## 🧵 Immutable State Updates — Core Pattern

React state must **never be mutated directly**. Always return a new array/object.

### Adding an item

```js
// ❌ Wrong — mutates existing array
prev.push(newTodo)

// ✓ Correct — creates a new array
setTodos((prev) => [newTodo, ...prev])
```

### Updating an item (map)

```js
setTodos((prev) =>
  prev.map((item) =>
    item.id === id
      ? { ...item, todo: newText }  // new object with updated field
      : item                         // unchanged items stay the same
  )
)
```

### Deleting an item (filter)

```js
setTodos((prev) =>
  prev.filter((item) => item.id !== id)
  // Returns new array without the matching item
)
```

### Toggling a boolean field

```js
setTodos((prev) =>
  prev.map((item) =>
    item.id === id
      ? { ...item, completed: !item.completed }  // flip the boolean
      : item
  )
)
```

---

## 🏗️ Context API — Full Flow Summary

```
┌─────────────────────────────────────────────────────┐
│                      App.jsx                        │
│                                                     │
│  const [todos, setTodos] = useState([])             │
│  const addTodo = (todo) => { ... }                  │
│  const updateTodo = (id, todo) => { ... }           │
│  const deleteTodo = (id) => { ... }                 │
│  const toggleComplete = (id) => { ... }             │
│                                                     │
│  <TodoProvider value={{ todos, addTodo, ... }}>     │
│    ┌─────────────────────────────────────────────┐  │
│    │  <TodoForm />                               │  │
│    │   └─ useTodo() → gets { addTodo }           │  │
│    │                                             │  │
│    │  <TodoItem todo={todo} />                   │  │
│    │   └─ useTodo() → gets { updateTodo,         │  │
│    │                         deleteTodo,          │  │
│    │                         toggleComplete }     │  │
│    └─────────────────────────────────────────────┘  │
│  </TodoProvider>                                    │
└─────────────────────────────────────────────────────┘
```

**No prop drilling!** Both `TodoForm` and `TodoItem` reach into the context directly via `useTodo()` — even if they're nested 10 components deep.

---

## 🐛 Debugging Tips from the Lecture

1. **Check hook calls**: Forgot `()` after `useTodo`? → will crash
2. **Compare IDs correctly**: When doing `prevTodo.id === id`, make sure you compare `.id` (not the whole object)
   ```js
   // ❌ Wrong — comparing object reference
   prevTodo === id

   // ✓ Correct — comparing the id field
   prevTodo.id === id
   ```
3. **Use `console.log`** inside functions to verify they're being called
4. **Check Local Storage** via DevTools: Application → Local Storage

---

## 📊 All Methods & What They Do

| Method | Parameters | What It Does |
|---|---|---|
| `addTodo` | `todo` (object) | Prepends new todo with generated ID to array |
| `updateTodo` | `id`, `todo` (object) | Replaces matched todo with new object |
| `deleteTodo` | `id` | Filters out the todo with matching ID |
| `toggleComplete` | `id` | Flips `completed` boolean on matched todo |

---

## 📐 Todo Object Structure

```js
{
  id: 1716000000000,   // Date.now() — unique timestamp-based ID
  todo: "Learn React", // the todo text (string)
  completed: false     // whether it's done (boolean)
}
```

---

## 💡 Important Concepts Recap

| Concept | Explanation |
|---|---|
| `createContext(default)` | Creates context with a default shape (used when no Provider exists above) |
| `useContext(Context)` | Subscribes component to context, triggers re-render on value change |
| Custom hook (`useTodo`) | Wraps `useContext` for cleaner, reusable access |
| `Context.Provider` | Wraps components that need access; `value` prop is what's shared |
| Barrel file (`index.js`) | Re-exports multiple items from one place for cleaner imports |
| `JSON.stringify` | Converts JS object/array → JSON string (for localStorage) |
| `JSON.parse` | Converts JSON string → JS object/array (reading from localStorage) |
| `useEffect(fn, [])` | Runs once on component mount |
| `useEffect(fn, [dep])` | Runs whenever `dep` changes |
| `readOnly` input | Text input that shows content but doesn't allow editing |
| Controlled input | Input whose value is bound to React state via `value` + `onChange` |

---

## 🚀 Why Context API over Prop Drilling?

**Without Context (Prop Drilling):**
```
App → passes addTodo as prop → Layout → passes it → TodoSection → passes it → TodoForm
```
Every intermediate component must pass it down even if it doesn't use it.

**With Context:**
```
App defines addTodo → wraps everything in Provider
TodoForm calls useTodo() → gets addTodo directly
```
No intermediate components involved. Cleaner, more scalable.

---

## ⚠️ When to Use Context API vs Redux?

- **Context API**: Good for small-to-medium apps, theme/auth/simple state
- **Redux Toolkit**: Better for large apps with complex state, many slices, time-travel debugging
- The lecturer mentions: "After Context API, we'll learn Redux Toolkit — confidence here is important!"

---

*These notes cover the full lecture on React Context API + Local Storage with a practical Todo App. Revisit the toggle and update logic multiple times if needed — it clicks after 2-3 reads!*


<!-- Transcript:

```
हां जी कैसे हैं आप सभी स्वागत है आप सभी
का चाय और कोड और हमारी प्लेलिस्ट चाहे और
रिएक्ट के अंदर तो रिएक्ट के अंदर ऑलरेडी
आप लोगों ने काफी सपोर्ट दिखाए काफी
प्रोजेक्ट्स हम बना चुके हैं लेकिन अब तो
धड़ाधड़ प्रोजेक्ट बनाएंगे यह वीडियो
हमारा है कांटेक्ट एपी के अंदर हाथ में
क्या सोचा था कांटेक्ट
नहीं नहीं इतनी आसानी से नहीं जब तक पूरा
कॉन्फिडेंस नहीं देंगे पूरा अच्छा से नहीं
समझा देंगे तब तक कांटेक्ट एपी नहीं
छोड़ेंगे क्योंकि कांटेक्ट एपी के बाद हम
रिडक्स टूल किट वगैरा भी देखेंगे तो यहां
पे कॉन्फिडेंस होना जरूरी है तो बेसिक
आपको ऑलरेडी ए गया है लेकिन अब एक छोटा सा
बेसिक प्रोजेक्ट इसके अंदर बना लेते हैं
सिर्फ कांटेक्ट एपी नहीं हम इसके साथ-साथ
थोड़ा सा लोकल स्टोरेज के बड़े में भी
देखेंगे तो लोकल स्टोरेज भी हमारा कर हो
जाएगा कांटेक्ट एपी का रिवीजन भी हो जाएगा
और एक प्रोजेक्ट भी बन जाएगा अब प्रोजेक्ट
हमारा बड़ा ही बेसिक है मैं वो भी बताता
हूं कौन सा प्रोजेक्ट है लेकिन ध्यान
रखिएगा कोई भी प्रोजेक्ट छोटा या बड़ा
नहीं होता कंपलेक्सिटी किसी के अंदर भी
इंट्रोड्यूस की जा शक्ति है तो ऐसा ही कुछ
हम करेंगे इस वीडियो का हमारा टारगेट बहुत
ही छोटा सा है हम सिर्फ ₹300 कमेंट्स तार
डिसाइड कर रहे हैं आप मुझे पता है आप लोग
एक ही दिन में ही कर देंगे एक दिन क्या
कुछ तीन-चार घंटे में आप लोग कर डॉग और
काफी मेहनत यहां पे भी चल रही है काफी
वीडियो हम भी बना रहे हैं थोड़ा सा शेर
लाइक सब्सक्राइब वगैरा का कम आप भी करिए
जितना ज्यादा आप मेहनत करेंगे उतना ही
हमें मोटिवेशन मिलेगा सही बात है की नहीं
चलिए इस वीडियो के अंदर हम शुरू करते हैं
हमारा बेसिक ओवरव्यू कांटेक्ट आप और सबसे
पहले तो देखते हैं की बनाने क्या वाले हैं
क्योंकि जब तक वो नहीं देखेंगे तब तक मजा
कैसे आएगा सही बात है की नहीं चलिए आ सबसे
पहले तो ये हमारा गेट अप का अपोजिट ट्री
आपने भी देख ही लिया होगा गेट अप का
रिपोजिटरी यहां पर अवेलेबल है जिनको नहीं
पता पता दीजिएगा की यहां पे मिलता है चाय
और कोड आए थे चौधरी की गाथा पर पॉजिटिव
में एक फाइल मैंने ऑलरेडी पुश कर दिया
यहां पे एक घंटे पहले जी फाइल के अंदर
आपके नोट्स हैं तो वो वहां पे ले लेना ये
जो चीज है ये हम बनाने वाले हैं अब आप
कहेंगे सर ये तो तू डू है इसमें तो मजा ही
नहीं आता अरे तू डू से बेस्ट कोई चीज नहीं
है अगर आपको अच्छे से बनाने ए जाए तो इसके
बाद का सर कम एक्जेक्टली से होता है अब
ट्विटर भी तू डू ही है युटुब के वीडियो
वगैरा वो भी है बस एक वीडियो का स्ट्रिंग
ए जाता उसके अंदर है हां वो सब भी बताऊंगा
किस तरह से वो सब बैक हाथ वगैरा बनते हैं
उन पे भी कम करेंगे हम बट ये हमारा बेसिक
तू डू है अब सबसे अच्छी बात क्या है की
स्टूडियो के अंदर हम कुछ स्टूडियो एड करते
हैं जैसे की लर्न जस एड कर हमने उसके बाद
हमने एड कर लर्न रिएक्ट और उसके बाद सपोज
करिए आपको सीखना है लर्न एन नोट्स सीखना
है आपको या बैक और सीखना है या दस सीखना
है आपका जो मां करें आप सीखो नहीं रॉक रहा
है आपको तो ये हमने किया अब सबसे अच्छी
बात ये है की इसको अब हम रिफ्रेश करेंगे
तब ये सारे यही पे रहते हैं क्योंकि ये
सारे के सारे लोकल स्टोरेज में सब हैं अगर
आप तब क्लोज करके भी बाद में वापस आओगे तब
भी यही रहेंगे क्योंकि लोकल स्टोरेज में
से है हां पूरा प्रोजेक्ट डिलीट करके उसके
बाद आओगे तो नहीं मिलेगा क्योंकि लोकल
स्टोरेज में ही है आप राइट क्लिक करके
लोकल स्टोरेज भी देख सकते हैं अच्छा अब
यहां पे क्या है देखिए हमारे पास कुछ
इंपॉर्टेंट टास्क हैं सबसे पहले तो हम
जैसे इसको टिक मार्क कर देते हैं तो एक नई
कस इंप्लीमेंट हो जाति है ये क्या है सी
एसएससी तो है कोई ऐसा थोड़ी ना है तू डू
ओरिजनली मैं क्रैक डॉ हो गया है स्ट्राइक
ऑफ हो गया है कस है बस लाइन थ्रू
बेड हो रही है उसके अलावा यहां पर देखेंगे
तो आपके पास एक एडिट बटन भी है तो यहां पर
अभी आपके पास टेक्स्ट है लेकिन आपने ऐसा
फीचर कई जगह देखा होगा की जैसे आप एडिट पे
क्लिक करते हैं तो वो टेक्स्ट ही अपने आप
एडिटेबल बन गया नहीं नहीं वो टेक्स्ट
एडिटर नहीं बंता है वहां पे एक इनपुट
फील्ड ए जाता है वो इनपुट फील्ड के अंदर
जो भी वहां पे टैक्स लिखा होता है उसको हम
पिक करते हैं और इनपुट फील्ड के अंदर रख
देते हैं वहां पे उसकी वैल्यू को अब यहां
पे अगर हम जो भी लिखेंगे और ये डीसा हमने
लिखा और यहां पे से का बटन ए गया है तो ये
से बटन जैसे क्लच क्लिक होगा वो इनपुट
फील्ड वहां से है जाएगा और आपका एक नॉर्मल
टेक्स्ट फूल हो जाएगा तो ऐसा कुछ मैजिक
नहीं होता की अपने आप वो टेक्स्ट ही हमारा
क्लिक केवल बन गया है वहां पे इनपुट फील्ड
ए जाता है उसकी कस इस तरह से लिखी जाति है
ताकि दिखे नहीं उसके अलावा आपको जिसको
डिलीट करना है रिमूव करना है आप रिमूव कर
ही सकते हैं रिमूव करने के लिए हर एक की
आईडी लगेगी तो आपको आईडी पास करनी पड़ेगी
और ये रिमूव कर डॉग ऐसे रिमूव होता है
एडिट करते टाइम भी आइडिया लगती है और एडिट
हो जाता है तो बड़ा ही बेसिक सा फ्लो है
अच्छा तो ये सर कम हम करेंगे किस तरह से
एड करेंगे अब इसको दो पार्ट में डिवाइड
करेंगे ये हमारा टॉप लिस्ट होगा जो हमारा
प्लेटफॉर्म है और यह हमारा लिस्ट की लिस्ट
है और ट्रेड्स का फॉर्म है ओके यहां पर आप
जाओगे तो आपको यहां पर तू डू कांटेक्ट एपी
notes.md करके आपको फाइल मिल जाएगी यहां
पे तो यहां पे फॉर्म हमने आपको दे रखा है
और ये आइटम्स भी हमने आपको दे रखें हैं
इसमें कस वगैरा सब लिखी हुई है क्योंकि
वहां पे इतना ज्यादा परिसर है नहीं मैं
फिर भी आपको ओवरव्यू दूंगा पूरा सा चिंता
मत कीजिए और देखिए एक इनपुट फील्ड यह रहा
हमारा बेसिक सा ये हमारे तू डू के आइटम्स
हैं जो नीचे वाला बॉटम पार्ट है ये वाला
जो है ये हमारे आइटम्स है सारे के सारे अब
इसमें हम इनको भी देखेंगे किस तरह से
हमारा देखिए एक इनपुट फाइल ये रहा जो की
टिक मार्क वाला है उसके बाद एक हमारा ये
रहा इनपुट फील्ड जो की है तू डू एडिटेबल
है नहीं है उसे पे सर पे उसके बाद हमारा
जो एडिटर से बटन है वो भी हमारे पास है तो
कौन सा हम यहां पे आईकॉन या लोगो शो
करेंगे वो भी डिपेंड करेगा की कौन से मोड
में है जैसे अभी हमने यहां पे एडिट वाला
शो कर रखा है अब यहां पे से वाला शो
करेंगे तो उसके पीछे भी जो लॉजिक है वो भी
हम सर का सर देखेंगे अच्छे से पढ़ेंगे और
डिलीट तो डिलीट है वहां पे एक मेथड आपने
कॉल करना है डिलीट तू डू एडिट और डिलीट के
लिए नहीं लगता है इतना भी हमें पता है ठीक
है तो इसकी तो हेल्प हम लेंगे लेंगे
प्रोजेक्ट सेटअप करते हैं और सबसे
इंपॉर्टेंट बात यह प्रोजेक्ट हमें करना है
कॉन्टेक्स्ट एपी से हम जहां फॉक्स कर रहे
हैं वो ये नहीं है की बटन ग्रीन होना
चाहिए या इसकी लेंथ इतनी हनी चाहिए वो कम
हम कर ही नहीं रहे हैं ऑलरेडी बोट
ट्यूटोरियल है मार्केट में जो आपको यू
क्लांस बनाना बताते हैं अच्छे ट्यूटोरियल
हैं नेटफ्लिक्स क्लोन अमेजॉन क्लोन उनको
देखिए यहां हम समझ रहे हैं बिजनेस लॉजिक
फंक्शनैलिटी कैसे एड होती है क्योंकि और
ऑफ डी दे वो जो अमेजॉन के यू है
नेटफ्लिक्स के यूआई है वो जब नहीं
दिलवाएंगे बिजनेस लॉजिक ही जब डलवाएंगे तो
इस पे हम फॉक्स करते हैं तो आते हैं हमारे
वापस से प्रोजेक्ट के अंदर
और एक नया प्रोजेक्ट हम यहां पे क्रिएट
करते हैं इसको डिलीट कर लेते हैं एक और
नया प्रोजेक्ट हम यहां पर क्लिक करते हैं
तो वही हमारा नम क्रिएट
और लेटेस्ट ही बना लेते हैं
ओके तो इस प्रोजेक्ट का नाम हमारे पास है
10th प्रोजेक्ट हमारा 10th और इसका नाम है
तू कांटेक्ट और लोकल स्टोरेज भी है वैसे
तो इसमें
लिख लेते हैं लोकल ठीक है
पैकेज का नाम भी से है हमें जाना है
रिएक्ट के साथ जावास्क्रिप्ट के साथ यही
टेलबिन का ऑप्शन दे देते तो भी बहुत अच्छा
होता ठीक है ये हम चले गए इसके अंदर और
बोला नम इंस्टॉल कर दो प्लीज ये जब तक
इंस्टॉल करता है तब तक हमारे टेल विंड पर
चलते हैं डॉक्स पर जाते हैं और प्रेम वी
गाइड स्वीट की गाइड बाटाङो जी यह बेसिक हम
कॉपी कर लेते हैं यहां से
और यूजुअली जल्दी हो जाता है कम आज नहीं
हुआ है नहीं हुआ क्या कर सकते
हैं यह हमारा कंटेंट है इसको ले लेते हैं
रख लेते हैं यह लीजिए आपका कांटेक्ट
से किया और क्या चाहिए
हमें जरूर नहीं है तो इंडेक्स कस को लिया
और सब कुछ हटाए और पेस्ट कर दिया यही
चाहिए
और हेलो वर्ल्ड
है और app.j सेक्स के अंदर जाकर
अप डॉट जीएस और जितना भी जो सब है इसको
मिनिमाइज करके रिमूव करते हैं
और देखते हैं
हमने तो एक्चुअली
आंखों में चुप रहा है यह बात तो मैं मानता
हूं तो हम क्या करते हैं
पैकेज के अंदर एड कर देना चाहिए
थी बट ठीक है वह सब तो हम बाद में देखेंगे
किस तरह से हमारे इंडेक्स कॉम्पोनेंट्स
हैं क्या है वह सब हम देखेंगे बाद में अभी
के लिए करते हैं सबको क्लोज क्योंकि एक एक
बार सॉरी देखिए फंक्शनैलिटी क्योंकि अभी
जो हम फॉक्स कर रहे हैं वो एक्चुअली में
वर्किंग पर कम फंक्शनैलिटी पे ज्यादा कर
रहे हैं तो सबसे पहले तो हम बात करेंगे की
इसके लिए आपको क्या-क्या एडिशनल चीज चाहिए
की तो ये बताइए सबसे पहले की package.gs
में कुछ चाहिए क्या कुछ इंस्टॉल करना
पड़ेगा आंसर बताइए कमेंट क्षेत्र में हां
जी एकदम सही जवाब कुछ नहीं इंस्टॉल करना
पड़ेगा कांटेक्ट एपीआर डायरेक्टली अवेलेबल
होता है ऐसे एपी फॉर्मेट में आज एन बुक्स
फॉर्मेट में तो हम डायरेक्टली इस को उसे
कर सकते हैं ठीक है अब उसे करने का तरीका
अगर आपको याद नहीं है तो आप आराम से गूगल
अगर आप जाकर या फिर डॉक्यूमेंट में जाकर
यह सब आराम से देख सकते हैं कोई ऐसी
दिक्कत वाली बात नहीं है ठीक है हम यहां
पर डायरेक्टली इसको कर लेते हैं तो हम
क्या करते हैं
सोर्स के अंदर जाते हैं और एक नया फोल्डर
बनाते हैं सबसे पहले इस फोल्डर का नाम
देते हैं हम कांटेक्ट क्योंकि हम यहां पे
सारे के सारे कॉन्टैक्ट्स रखना वाले हैं
कांटेक्ट रखना के लिए मैंने आपको दो-तीन
तरीके बताए थे उनमें से एक तरीका हम उसे
करेंगे अभी यहां पे हम एक न्यू फाइल
क्रिएट करते हैं और उसको बोलते हैं अपने
युटुब के कांटेक्ट
जयस ऑफ कोर्स
में क्या है हमारे पास रिटायर्ड में कुछ
जीएस वगैरा नहीं मिल रहा है इसलिए मैंने
इसका नाम डॉट जस रखा है अब क्या-क्या दो
चीज लगेगी एक आपका क्रिएट कॉन्टैक्ट्स
लगेगा एक आपका उसे कॉन्टेक्स्ट लगेगा
क्योंकि अगर वो प्रोवाइडर वाला जो ड्रामा
है डॉट प्रोवाइडर वगैरा नहीं करना तो उसे
कॉन्टेक्स्ट लगेगा तो एक बार के लिए हम
इंपोर्ट कर लेते हैं वही हमारा बेसिक
क्रिएट कांटेक्ट
है और यह सब आएंगे कहां से अगर आपको याद
हो तो यह सब रिएक्ट से ही आते हैं ठीक है
कोई दिक्कत नहीं ठीक है जी चलिए अब इसके
बाद क्या करना है आपको एक कॉन्टेक्स्ट को
एक्सपोर्ट करना है ठीक है जी कर देते हैं
तू डू कॉन्टेक्स्ट ये लीजिए अब तू डू
कांटेक्ट कैसे बनेगा क्रिएट कॉन्टैक्ट्स
है इतना तो आपको पता है नहीं जी क्रिएट
फैक्ट्री नहीं क्रिएट कांटेक्ट हांजी ये
क्या है एक ऑब्जेक्ट है ठीक है जी
ऑब्जेक्ट के अंदर आएगा क्या वो वैल्यू
डिस्कस कर लेंगे हम कोई दिक्कत वाली बात
ही नहीं है उसके अंदर अच्छा उसके बाद
क्या-क्या आएगा हमारे पास इसको एक्सपोर्ट
कर लेते हैं ठीक है तो इसको भी एक्सपोर्ट
कर देते हैं क्योंकि हमें वो बार-बार ना
उसे कॉन्टेक्स्ट के अंदर वो वापस से
कांटेक्ट डालो इंपोर्ट करके वो नहीं करना
तो हमें हॉकी डायरेक्टली एक्सपोर्ट कर
देते हैं जो यूज्ड तू डू करके जो पहले भी
हमने किया था तो ठीक है ये लीजिए हम
एक्सपोर्ट कर देते हैं कंस और ये हमारा तू
डू
कर देते हैं
की इतना ज्यादा एक्स्ट्राऑर्डिनरी कम नहीं
करेगा बस एक मेथड है और कुछ भी नहीं है
यह लीजिए बस इतना सा कम है अच्छा जी इसके
अंदर कैसे करेंगे रिटर्न करना पड़ेगा हां
जी रिटर्न कर देंगे क्या करेंगे यह उसे
कॉन्टेक्स्ट जो आपने बुलाया था इसको
कांटेक्ट चाहिए होता है ना तो हम में फाइल
में ना करके यहां करके और सीधा एक्सपोर्ट
कर रहे हैं ऐसे ताश कम है कौन सा कांटेक्ट
देना है इसको एक बात याद रखिएगा जब भी उसे
कॉन्टेक्स्ट रख लोग उसे उसे कॉन्टेक्स्ट
को एक कॉन्टेक्स्ट देना पड़ेगा की किसके
बड़े में बात कर रहे हैं कांटेक्ट का मतलब
होता है संदर्भ किस चीज के बड़े में हम
बात कर रहे हैं तो जैसे आप टोडोस के बड़े
में बात कर रहे हो लॉगिन के बड़े में बात
कर रहे हो तो जो भी सेपरेट आपने चीज राखी
है उसके बड़े में हम यहां पे बात कर रहे
हैं ठीक है अब हम क्या करते हैं एक
प्रोवाइडर भी यहां से एक्सपोर्ट करते हैं
याद होगा अगर आपको तो क्योंकि मैं क्या
चाहता हूं की वहां पे में फाइल के अंदर
जाके ना सब कुछ रेप करना पड़ेगा तू डू
कॉन्टैक्ट्स डॉट प्रोवाइडर तो वो नहीं
करता है सीधा सही एक्सपोर्ट कर लेते हैं
तो एक वेरिएबल एक्सपोर्ट होता है इसमें और
कुछ नहीं आता इसका नाम हम दे देते हैं
यहां पे तू डू प्रोवाइडर
यह इसलिए करते हैं क्योंकि वहां पर मेरे
को यह एन लिखना पड़े तो डू कांटेक्ट
प्रोवाइडर बस यह ना लिखना पड़े इसकी वजह
से मैं ये लिखना हूं वरना कोई दिक्कत नहीं
है अब यहां पर कुछ इंपॉर्टेंट चीज है पहले
बात तो एक ही टुडू का जवाब कांटेक्ट बना
रहे हो तो ऑब्वियस सी बात है कोई ना कोई
डिफॉल्ट वालुज होगी वो डिफॉल्ट आपका जो
स्टोर के अंदर वालुज होगी वो डिफॉल्ट
वालुज भी चाहिए प्लस अभी तक हमने जो देखा
था वो सिर्फ यह देखा था की आपने छोटे-छोटे
कम किया थे की थीम मिल गया वो मिल गया तो
उससे इतना ज्यादा अंदाज़ नहीं ग रहा था की
एक्चुअली मैं कम इसमें होता कैसे है
क्या-क्या फंक्शंस होते हैं क्या-क्या
वालुज होती है कैसे-कैसे पास होता है तो
ये बड़ा ही एक इंटरेस्टिंग एग्जांपल हमारे
सामने है की ये जो हमारी रिएक्ट अप है ना
ये काफी कम कर रही है अब देखिए बाय
डिफॉल्टर तो ये क्या है आर्स हैं सारे के
सारे ठीक है मां लिया इरेज़ हैं अराइज के
अंदर आपके कुछ ना कुछ तू डू हैं टाइटल मां
लीजिए तू डू के हर एक तू डू का एक यूनिक
आईडी भी होगा अगर डेटाबेस होता तो आईडी
खुद जेनरेट हो जाते हैं अब नहीं है तो हम
जेनरेट करेंगे हम रिस्पांसिबल उसके लिए तो
बहुत तरीके हैं आईडी जेनरेट करने के लिए
रेंडम स्ट्रिंग दाल सकते हो नंबर्स में
दाल सकते हो डेट भी उसे कर सकते और तरीके
आपको जो ठीक लगे वो करिए अभी उसे पर चर्चा
नहीं करेंगे कैसे क्या होता है उसके अलावा
कंप्लीटेड भी है ठीक है अब यहां पर मैथर्ड
देखिए ये तो आपका बेसिक हो गया तू डू बना
कैसे है ठीक है आईडी हो गया उसका टाइटल हो
गया और उसके अंदर एक कंप्लीटेड भी हो गया
की फल से ट्रू है ठीक है ये तो हो गया
बेसिक स्ट्रक्चर हर एक तू डू का ये सब तू
डू में पाया जा रहा है लेकिन फंक्शनैलिटी
कितनी है देखिए एड तू डू है तू डू एड कर
सकते हो यहां पे आके एडिट भी कर का रहे हो
हां जी एडिट भी कर रहा हूं ये एडिट है
क्या है नहीं ये एक्चुअली में टॉगल है तो
आप टॉगल भी कर का रहे हो कंप्लीट या
अनकंप्लीट अनकंप्लीट बोल लो ठीक है उसके
अलावा ये प्रॉपर एक एडिट है जहां पे आप तो
दो को चेंज कर का रहे हो ठीक है अब ऐसा तो
नहीं की आपने यहां क्लिक कर और ये तू डू
एडिट हो गया तो उसके साथ एक आईडी लगेगा जी
एडिट में आईडी लगेगा अच्छा उसके अलावा ये
तो ठीक है आप यहां पर डिलीट भी कर का रहे
हो हां जी ये भी कर का रहे हैं तो आप और
रीड भी कर का रहे हो सारे ट्रूडूस की
लिस्टिंग भी हो रही है हां जी लिस्टिंग भी
हो रही है सारे के सारे तो फंक्शनैलिटी तो
काफी है की नहीं तो अभी फंक्शनैलिटीज को
हम लिखेंगे कैसे कोर्ट के अंदर या फिर
हमारे कांटेक्ट के अंदर क्योंकि ये
फंक्शनैलिटी तो देखिए कॉम्पोनेंट्स में
जान वाली है अब ऐसा तो है नहीं की यहां पे
लिखा है तो यही उसे होगी ये जहां भी
फंक्शनैलिटी डिफाइन है मैं तो चाहता हूं
की मैं अगर 10 कंपोनेंट के अंदर भी एक
कंपोनेंट बनाऊं तो वहां पे फंक्शनैलिटी
डायरेक्टली उसे हो जाए यही बात है तो किस
तरह से ये कम होता है यहां पे हमें थोड़ा
और ओवर भी मिलेगा तो देखिए एक्चुअली में
क्या होता है की जैसे आपने कॉन्टेक्स्ट
बनाया इस कॉन्टेक्स्ट के अंदर क्या करेंगे
सबसे पहले यहां पे एक न्यू लाइन में आते
हैं और सबसे पहले मैंने बनाया एक टस नाम
से एक अरे ठीक है अब इस यर के अंदर हम
क्या करेंगे हर एक फूल जो होगी वो इस तरह
से एड होती जाएगी ठीक है हर एक जो अपना
टुडू होगा वो एक ऑब्जेक्ट होगा इस तरह से
एड करेंगे ठीक है अब एक हर एक तू डू किस
तरह से बनेगा हर एक टुडू के पास एक आईडी
होगी अभी हम आईडी वन ले लेते हैं बाद में
देखेंगे किस तरह से इंक्रीमेंट करते हैं
जरूरी नहीं है आपको वन तू लेना है आप फोर
से स्टार्ट करो कोई दिक्कत वाली बात ही
नहीं है और उसके बाद हमने एक तू डू ले
लिया तो इसको आप तू डू बोल दो टाइटल बोल
दो तू डू मैसेज बोलो मैं तो तू भी बोल लेट
हूं और इसको हम बोल लेते हैं एक बेसिक सा
तू डू मैसेज ठीक है अब ठीक है मैसेज भी ए
गया अब और क्या चीज चाहिए
तो हम इसको बोल देते हैं कंप्लीटेड और
कंप्लीटेड की वैल्यू है
इसी तरह होते जाएंगे लेकिन अभी क्या करता
हूं मैं एक तू डू ही एड करता हूं ताकि
मेरे को मॉडल याद रहे बाद में आके मैं
इसको डिलीट कर दूंगा क्योंकि बाय डिफॉल्ट
तो एम्टी ही ऑब्जेक्ट की स्टेटस अरे चाहिए
मुझे तो भाई डिफॉल्ट इतना कम हो गया ठीक
है अब क्या है ये तो आपके पास हो गया ये
क्या है प्रॉपर्टी है तो जी तरह से आप अगर
देखना चाहें तो ये कुछ इस तरह से ही तो है
की जैसे मैंने बोला थीम और ये बोल दिया
डार्क तो वेरिएबल तो है कल मिलकर और ऑफ डी
दे अब वेरिएबल में हमें अरे मिल गया और यर
के अंदर ऑब्जेक्ट मिल गया तो इतने को
घबराने वाली बात तो है नहीं ये जैसे थीम
डार्क मिला था एक वेरिएबल वैसे अब यहां पे
मिल गया मुझे पता है डाटा टाइप क्या है
अगर मैं पहले यहां पर सिर्फ एक स्ट्रिंग
एक्सपेक्ट कर रहा था तो अबकी बार में और
एक्सपेक्ट करूंगा तो लूप लगाना होगा बस
इतनी सी तो कहानी है ठीक है अब हमने आपको
याद हो तो पिछले वाले उसके अंदर अगर आपको
याद नहीं हो तो मैं फिर भी बता देता हूं
आपको जो ये थीम्स पिक्चर हमने लिया था तो
उसके अंदर भी कुछ इसी तरह के कांटेक्ट
हमने लगाएं थे तो देखिए पिछली बार क्या था
तीन मोड था हमारा लाइट तो स्ट्रिंग था बस
ये एक्सपेक्ट किया था उसके अलावा आप कुछ
फंक्शन भी पास कर रहे थे गौर करने वाली
बात ये थी की फंक्शन के अंदर फंक्शनैलिटी
नहीं लिखी जा रही थी सिर्फ ये बोला जाता
है की आप एक फंक्शन हो कांटेक्ट एपी और जब
हम रिड्यूस के बड़े में बात करेंगे ये एक
थोड़ा सा डिफरेंस है इनके अंदर तो इनकी
फंक्शनैलिटी कहां लिखी जाति है अगर आपको
याद हो तो app.js के अंदर हमने यहां पे
फंक्शनैलिटी लिखी थी इसकी की अच्छा आप
मेथड हो तो इस तरह से कम करोगे ये का ये
रिपीट हम यहां पे भी करेंगे की आपके पास
ये तो हो गए में आपके प्रॉपर्टीज अब आपको
लखनी पड़ेगी फंक्शनैलिटीज और फंक्शनैलिटीज
के अंदर डेफिनिशन नहीं लिखने हैं सिर्फ
उनके नाम लिखने हैं यहां पे जैसे पर
एग्जांपल ये आपने लिखा एड तू डू अब एड तू
डू कैसी फंक्शनैलिटी है कुछ नहीं आप एक तू
डू मुझे पास करोगे तो दो मतलब तू डू से
मेरा मतलब है मैसेज ये मैसेज आप जैसे मेरे
को पास करोगे तो एक फंक्शन
कम करेगा क्या कम करेगा नहीं पता ये कौन
कम करेगा यह सब डिसाइड हम कहां करेंगे यह
सब हम बाहर में app.js में वहां डिसाइड कर
देंगे वैसे तो आप चाहे तो किसी भी फाइल
में डिसाइड करके और वहां पे भी इंपोर्ट ले
सकते हो कोई दिक्कत नहीं है वहां पे बट
उसेसुअली
कॉन्टैक्ट्स के लिए नहीं बना है वहां बहुत
बड़े प्रोजेक्ट के लिए हमें रीडर जस्ट
आइडिया ऐसी स्टेट मैनेजमेंट लाइब्रेरी का
उसे करना पड़ता है तो इसीलिए अभी बेसिक कर
फंक्शनैलिटी इसी तरह से डिफाइन होती है
मोस्ट ऑफ डी कांटेक्ट मोस्ट ऑफ डी इसलिए
कहा है क्योंकि ऐसा नहीं है की हर बार यही
है अच्छे-अच्छे लोग हैं अच्छे-अच्छे तरीके
हैं सबके अपने तरीके हैं सब सही है ठीक है
तो पहले कम तो हो गया एड तू डू का ठीक है
अब अपडेट भी करोगे इसको अच्छा अपडेट टॉगल
नहीं है अपडेट में पूरा का पूरा अपडेट
होता है तो अपडेट करोगे तो किस तरह से
करोगे अब देखो अपडेट जब हम यहां पे कर रहे
हैं इसको तो अपडेट में ये वैल्यू तो आप
देख ही रहे हो मुझे एटलिस्ट कुछ ना कुछ तो
हो गई और कौन सी वाली अपडेट करनी है उसका
आईडी भी डॉग तो दो चीज डिमांड करेंगे यहां
पे आईडी तो लेंगे लेंगे और एक तू डू भी
लेंगे क्योंकि अपडेट है
उसके बाद क्या करना है वो अभी चिंता वाली
बात नहीं है अभी अपडेट हो गया मां लिया
अपडेट हो गया अच्छा डिलीट करोगे तब भी यही
होगा की ये डिलीट अगर स्पेलिंग सही है तो
डिलीट हां जी डिलीट तो दो डिलीट में
सीधा बस क्लिक करो डिलीट बस आईडी तो चाहिए
तो आईडी ले लेते हैं ये लीजिए आईडी ले
लिया आपने और यह लीजिए फंक्शनैलिटी हो गई
आपकी अच्छा अब एक लास्ट वाला हमारा टॉगल
कंप्लीट तो इसको बोल देते हैं हम तो पागल
कंप्लीट
क्या है यह वाला आप इस टॉगल कंप्लीट में
क्या होगा कुछ नहीं एक जो फील्ड है आपके
पास वो अपडेट हो जाएगा बाकी कम कस अपना
करेगी ठीक है तो उसके लिए क्या लगेगा आईडी
लगेगा बिल्कुल लगेगा इतना तो आप समझ ही
गया ये लीजिए आईडी लगेगा
यह लीजिए तो हमने क्या कर देखिए
फंक्शनैलिटी पर हमने बात ही नहीं कारी है
हमने सिर्फ ये बोला है की ये जो कांटेक्ट
है इसमें क्या-क्या मैथर्ड हैं और
क्या-क्या वालुज हैं मेरे पास अब अच्छी
बात यह है क्योंकि टड्स सर का सर यहां पे
जब भी मुझे कांटेक्ट का एक्सेस मिलेगा
मेथड की फंक्शनैलिटी तो मैं कहानी और
लिखूंगा app.js में लिखूंगा लेकिन जो
वैल्यू से मुझे पता है की प्रोड्यूस से
लेनी है तो मेरा कंपोनेंट कोई भी हो मैं
वालुज यही से लूंगा ठीक है इतनी तो कहानी
हो गई क्लियर चलिए अब इसको करते हैं से अब
हम क्या करते हैं ये कहानी तो हो गई लेकिन
अच्छा अब एक और चीज मैं आपको यहां पे
बताता हूं अक्सर वैसे तो हमने पुराने वाले
फाइल में भी यही सभी किया था ऐसा कोई
दिक्कत वाली बात है नहीं लेकिन यहां पर
मैं आपको एक दूसरा अप्रोच भी बताता हूं
वैसे कुछ खास है नहीं इसमें इतना कुछ
रॉकेट साइंस फेयर नहीं कॉन्टैक्ट्स में
राइट क्लिक करके एक न्यू फाइल बना लीजिए
और इसका नाम दे दीजिए
index.js अभी फटाफट से कमेंट क्षेत्र में
ये बताओ की इंडेक्स और जस फाइल क्यों बनाई
है हां पॉज कर लो आराम से वीडियो को कमेंट
लिखो पहले कमेंट जरूरी है तब तक हम भी
पानी पी रहे हैं आज तो चाय नहीं है
चाय बनाएंगे इस वीडियो के बाद बनाएंगे
ताकि हम सर का सर इंपोर्ट इधर ले लेने और
फिर जिसको भी कुछ भी इंपोर्ट करवाना हो इस
फाइल से ही ले तो अगर आपने ऐसा कहा है या
इसको खाने की कोशिश करिए कमेंट में तो
एकदम आप करेक्ट हो तो हम क्या करेंगे सीधा
का सीधा वालुज यही से ले लेंगे तो आप
डायरेक्टली भी कर सकते हो की एक्सपोर्ट कर
दो क्या करना है एक्सपोर्ट बहुत साड़ी चीज
एक्सपोर्ट करनी है कहां से करनी है फ्रॉम
यह ले लेते हैं हम डॉट कॉम
प्रोवाइडर भी कर देता हूं और उसके बाद एक
यह उसे तू डू ये भी कर देता हूं अब उसे तू
डू वगैरा करने से फायदा पता है क्या होगा
की आपने उसे तू डू कर दिया है तो उसके पास
अपने आप कॉन्टैक्ट्स है तो कॉन्टैक्ट्स
में से सर फिल्टर करके मैं निकाल लूंगा तो
ज्यादा कुछ एक्सपोर्ट नहीं करना पड़ा वरना
पड़ा है एक-एक मेथड ये सब एक्सपोर्ट करो
ये करो बड़ा ड्रामा हो जाता है तो एक लाइन
लिखिए सिर्फ आपने होगा यह की अब आपका जो
भी फाइल नाम बड़ा है ये तू डू कॉन्टैक्ट्स
लॉगिन कॉन्टैक्ट्स वगैरा सब यही पे एक बार
में कर लेते हैं तो हम थोड़ा सा आसन हो
जाता है बस और कुछ नहीं है इससे ज्यादा
ठीक है जी चलिए इतना कम तो हो गया हमारे
पास की हमारा कांटेक्ट रेडी अब आपको
कॉन्टैक्ट्स के बड़े में तो कोई चिंता खास
करने की जरूर नहीं है अब हम चलते हैं
क्योंकि असली कम यही पे ही होगा ऐसा जितना
भी बड़ा कोई कम है नहीं आराम से हो जाता
है तो देखिए सबसे पहले चीज क्या है इसके
अंदर क्या लिखेंगे
वो तो हमारे पास मिल जाएगा नोट्स के अंदर
तो हम चलते हैं पहले क्रोम पे और हमारी
आइटम है
तू डू फॉर्म है और यह
तो मैं इसको कॉपी कर लेट हूं और बैक जाते
हैं
और वैल्यू
आइटम यहां पे डालने पढ़ेंगे ठीक है वो भी
दाल देंगे कोई दिक्कत नहीं है इसको कर
देते हैं से क्योंकि इस पे ज्यादा कम नहीं
है अब इसको करते हैं रिमूव अब देखिए सबसे
पहले चीज टोडोस आपके पास कॉन्टैक्ट्स
आएंगे कहानी ना कहानी स्टोर रखोगे हां जी
रखोगे स्टोर रख के यूबी चेंज हो रहा है
इतना खाने की जरूर नहीं थी सर स्टेट में
ही रखोगे हां जी बिल्कुल सही तो ये लीजिए
कौन स्टार्ट ए गया अब इसको क्या करेंगे ये
लीजिए तो दो और यहां पे ए गए सेट
तू डू कहां से आएंगे अरे बहुत आसन कम है
उसे स्टेट से आएंगे अच्छा बाय डिफॉल्ट
क्या वैल्यू होगी भाई डिफॉल्ट वैल्यू होगी
एमटीआर है जैसे स्टेट हमारा बनेगा
तो नल होगा प्रॉब्लम
तो ये पता ग जाएगा की अगर लूप ग रहा है तो
उसमें एक भी वैल्यू नहीं है तो मैं वहां
पे उसे हिसाब से कम कर सकता हूं ठीक है अब
एक-एक करके फंक्शनैलिटी हम देखते हैं सबसे
पहले बेसिक फंक्शनैलिटी बेसिक फंक्शनैलिटी
क्या दिखे रही है एड करनी है वैल्यू हां
जी एड करते टाइम हम फॉर्म वगैरा वो सबसे
एड कर लेंगे लेकिन फंक्शनैलिटी हम साड़ी
यही डिफाइन कर लेते हैं अच्छा फंक्शनैलिटी
यहां पे क्यों डिफाइन कर रहे हैं और
एक्चुअली में कर कैसे का रहे हैं वो सब भी
तो हमें देखना पड़ेगा की साहब ऐसा कैसे कर
का रहे हो हां जी उसको करने के लिए क्या
है सबसे पहले यहां पे मुझे चाहिए गैस तू
डू प्रोवाइडर क्योंकि सब कुछ इस के अंदर
रेप होगा तो ये लीजिए तू डू
प्रो नहीं सजेशन में तो नहीं ए रहा है एक
बार से करके इसको रीलोड कर ले
रे लोड कर लेते विंडो
नहीं ए रहा है
पसंद नहीं है मुझे मैन्युअल ऐसे लिखना बट
ठीक है क्या कर सकते हैं
तो इसको इंपोर्ट करते हैं हमें चाहिए
कुछ चाहिए फ्रॉम
कॉन्टैक्ट्स में से चाहिए अब कांटेक्ट में
से हमें चाहिए तू डू प्रोवाइडर
जी अब क्या करना है
और इसको भी यहां पर आप कर देंगे हम हमारे
कैसे में लिखा है क्या
इसमें होना चाहिए
अच्छा अब इसको प्रॉब्लम क्या है माउस ओवर
करके देखते हैं ये का रहा है तू डू
प्रोवाइडर हस नो कॉरस्पॉडिंग क्लोजिंग
टाइम अच्छा जी आपको ये प्रॉब्लम है ठीक है
जी
यह लीजिए आपकी प्रॉब्लम सॉल्व हो गई
तो दो प्रोवाइडर
अच्छा जी अब यहां पर तू प्रोवाइडर क्या का
रहे हैं
तो दो प्रोवाइड
आपको बड़ी प्रॉब्लम है तू डू प्रोवाइडर
ठीक है अब क्या यह बताइए सबसे इंपॉर्टेंट
बात की तू डू प्रोवाइडर हमने इस तरह से
लिख दिया है तो क्या हमारा कम कंप्लीट हो
गया है जो भी छोटी सी मिस्टेक वगैरा कारी
हम मिस्टेक तो देते हैं मुझे बॉर्डर करती
है ऐसी चीज क्योंकि कोड आपका ना
स्ट्रक्चरल और एन मतलब यूनी ऐसा होना
चाहिए की जो पूरा फ्लो मेरा है तो अगर
आपने कहा नहीं यहां से कम खत्म नहीं हुआ
है तो आप एकदम करेक्ट हो क्योंकि सिर्फ
प्रोवाइडर प्रोवाइड भी तो करना चाहिए और
क्या प्रोवाइड करेगा प्रोवाइडर तो अगर आप
यहां पर करोगे तो ये साड़ी वालुज भी तो
प्रोवाइड करेगा हां जी तो उसके लिए वैल्यू
ये एक मोस्ट इंपॉर्टेंट चीज है इसके लिए
अच्छा तू डू प्रोवाइडर आप क्या-क्या
प्रोवाइड करेगा तो यहां पे एक और क्योंकि
आपने इंपोर्ट कर लिए तो आप सीधे ही यहां
पे इस तरह से लिख सकते हैं किंडली प्रेसेस
एक तरह से दी स्ट्रक्चर कर रहा हूं मैं
चाहूं तो उसको ला के वालुज फिर वैल्यू डॉट
ये वो कर सकता हूं बट यहां पे अगर आप जैसे
देखेंगे आपके पास मैथर्ड ए गए एड तू डू
उसके बाद अपडेट तू डू और और कहते हैं
डिलीट था
को डिलीट तो दो ए गया और क्या
साड़ी वालुज आपके पास ए गई अब आपको ध्यान
रखना वाली यह बात है की यह जो टस है ये
एक्चुअली में प्रॉपर्टी है तो वालुज ए रही
है एड तू डू अपडेट तू डू ये साड़ी हमारे
पास मैथर्ड हैं तो मेथड ए रहे हैं अब
एक-एक करके देखते हैं की मैथर्ड किस तरह
से कम करेंगे तो पहले हम क्या करते हैं
उसको डिफाइन कर लेते हैं तो ये लीजिए एड
तू डू अच्छा इनका नाम एकदम से रखना है तो
डोस नहीं कर देना है जो लोअर के इस
अप्परकेस रखा है वो आगे आईटी इसे रखना है
तभी उसके अंदर वो फंक्शनैलिटी जाएगी तो ये
लीजिए आपका ये पहले मेथड तैयार अब देखना
पड़ेगा कॉन्टैक्ट्स में से की तू डू कम
कैसे करता है तू डू को कम करने के लिए
टुडू चाहिएगा उसको ठीक है अब तू डू वैल्यू
है तो स्ट्रिंग वैल्यू है इससे मत करिए की
तू डू क्या होगा वो एक स्ट्रिंग है इससे
ज्यादा कुछ भी नहीं है तो यहां पे हम आए
और उसको बोला की ये लो जी आपको हम दे
देंगे ठीक है तो ये तू डू यहां से मिल रहा
है क्या नहीं एक्चुअली मैं ये यहां से
नहीं मिल रहा है ये हमें मिलेगा जब हम
यहां पे मैनेज तू डू के अंदर करेंगे उसे
फॉर्म के अंदर से हमें मिलेगा तो वो मैं
अभी आपको करता हूं कैसे अभी एडम करो आपके
पास आए अच्छा इसका यह मतलब नहीं है की
स्टेट में से आए स्टेट में तो आपके पास
सारीज हैं क्योंकि याद रखिए आपने जब वालुज
ली है तो यहां पे आपने सारे ट्राई दिए हैं
तो हमें सिर्फ वैल्यू का जिक्र कर रहे हैं
यहां पे जितनी भी स्टेटस वगैरा सब कर रहे
हैं सब मैनेज कर रहे हैं इंडिविजुअल तू डू
आपके पास नहीं है अभी ठीक है ये सिर्फ एड
करने के लिए फंक्शनैलिटी हम डिफाइन कर रहे
हैं कहां से वैल्यू आएगी वो भी आपको पता ग
जाएगा अभी ठीक है अब हम क्या करते हैं अब
हमें क्या करना है एक्चुअली में ये हमारा
जो तू डू है ये जाना चाहिए किसके अंदर इस
एरिया के अंदर ये जो एमटीआर है बट ये सारे
के अंदर हो सकता है ऑलरेडी एक्जिस्टिंग
वालुज हो हां जी हो बिल्कुल हो सकता और
होगा ही तो हम क्या करेंगे सबसे पहले
हमारे सेट तू डू इसको कॉल करेंगे ये लीजिए
सेट तू डू अब इस सेट तू दूज के अंदर आपने
अगर ये तू डू इस तरह से पास कर दिया तो
क्या हो जाएगा पुरानी साड़ी वैल्यू डिलीट
हो जाएगी उसे तू डू एरिक के अंदर और सिर्फ
एक नई वैल्यू सेट हो जाएगी अब ऑब्वियस सी
बात है आप ये तो नहीं चाहते की पुरानी
साड़ी वालुज डिलीट हो जाए तो हमें क्या
चाहिए पुरानी स्टेट का एक्सेस चाहिए की
आपके पास कितने टेटस थे पहले अब अगर आपने
मेरा इंटरव्यू वाला वह क्वेश्चन देखा हो
जब हमने एक वालुज अपडेट कारी थी 16 17 18
19 तो वो ही वाला एग्जैक्ट कॉन्सेप्ट
हमारे कम आएगा तो अगर आपको इसकी स्टेट की
वैल्यू चाहिए तो हमें पता है की यहां पे
इस तरह से हमारे पास एक कॉल बैक होता है
जिसको हम उसे कर सकते हैं यहां पे आपके
पास प्रेफ बोल लो ओल्ड तू डू बोल लो जो
मर्जी आप बोलो पर बात ये है की आपके पास
पुराना यर यहां पे मिल जाता है अब पुराना
अरे मिल गया तो अब क्या करो पुराने अरेस्ट
से एक नायरा बना दो नए बनाकर क्या करोगे
पुरानी वैल्यू भी दाल दो और नई वालुज भी
दाल दो ठीक है अब पुरानी वालुज डालने के
लिए क्या करना पड़ेगा कुछ भी नहीं यह
लीजिए हमने डिस्ट्रक्टर क्लासिक
जावास्क्रिप्ट का कॉन्सेप्ट यह लीजिए
प्रेम तो पुरानी साड़ी वालुज ली और उनसे
स्प्रेड कर दिया है यहां पे ठीक है बड़ा
ही बेसिक में पढ़ा है अब जो नई वैल्यू से
आप कहां रखना चाहते हो नया जो टुड्डू है
आप चाहे तो यहां रख दो आपको लगता है नहीं
नहीं मैं तो स्टार्ट में इंजेक्टर करूंगा
आपके ऊपर है आप जैसा चाहे कर सकते हो तो
ये लीजिए मैं ये मैंने नया तोड़ू रख लिया
अब गलती क्या करें यहां पे की आपको
एक्चुअली में तू डू बनाना पड़ेगा हां जी
क्योंकि अगर आप कांटेक्ट में देखोगे तो
हमने टुडू इस तरह से एक ऑब्जेक्ट बनाया है
ऐसा नहीं की सिर्फ स्ट्रिंग एड कर दिया
अगर आपको स्ट्रिंग एड करनी है स्ट्रिंग एड
करो आप यहां पे बस चेंज कर दो की मेरे पास
आईडी वगैरा कुछ नहीं है आईडी नहीं होगी तो
प्लीज लूप लगाने में प्रॉब्लम आएगी तो ठीक
है दो वालुज ली है हमने तीन वैल्यू लेनी
है ठीक है तो अभी तीन वालुज है तो अब मैं
डायरेक्ट इस तरह से त्रुटि तो दे नहीं
सकता मैं दूंगा एक ऑब्जेक्ट ठीक है अब इस
ऑब्जेक्ट के अंदर क्या-क्या लेंगे आ इस
ऑब्जेक्ट के अंदर पहले तो एक आईडी दूंगा
अब मुझे नहीं पता आईडी क्या डन मैं हो
सकता है तू दे डन बट हर बार तू थोड़ी ना
दूंगा तो कुछ ना कुछ डायनेमिक वैल्यू
चाहिए की तो सबसे इजी है मेरे पास अभी
date.nav कर देता हूं ताकि हर बार अलग डेट
होगी और वो कम हो जाएगा हमारे पास ठीक है
आईडी आपके पास ए गई है और उसके बाद हम
क्या करेंगे आईडी ए गई अब हमारे पास में
और बाकी जितनी भी वालुज हैं तो यहां पे हम
ये तू डू ले लेते हैं ठीक है तू भी अपने
आप में एक ऑब्जेक्ट है की नहीं तो वो पूरा
मैंने स्प्रेड कर दिया और एक आईडी वहां पर
इंजेक्टर कर दी ठीक है अगर ये ज्यादा
परिसर आपको ग रहा है तो आपको थोड़ा सा जो
स्कॉट का बेसिक आपको ब्रशप करना पड़ेगा की
किस तरह से ये सर का सर कम हुआ है अगर ये
भी थोड़ा परिसर ग रहा है पक्की बात है
रिवीजन बट मुझे बता देना मैं आपका इसी
टॉपिक पे और रिवीजन करवा दूंगा थोड़ा सा
ठीक है ओके जी चलिए ये कम हो गया हमारा
तोड़ू का अब हम नेक्स्ट क्या करेंगे
ऑब्वियस सी बात है नेक्स्ट हमारा अपडेट तू
डू तो नेक्स्ट आते हैं हमारे अपडेट तू पे
और अपडेट तू क्या है उसको भी एक आईडी भी
चाहिएगा और एक तू डू भी चाहिएगा दोनों
चाहिए होता है इसको तो क्योंकि अपडेट करना
है ना
यह लीजिए अच्छा जी अब कौन सा आईडी कौन सा
अपडेट हो तो देखिए इसको करने के लिए आपको
सबसे पहले ही पता होना चाहिए
तो एक लूप लगाना पड़ेगा लूप लगाकर फाइंड
करना पड़ेगा की कौन सी आईडी वाले एरर की
प्रॉपर्टी को आप अपडेट करना चाहते हो और
उसमें हम नया तोड़ू अपना एड कर देंगे ठीक
है तो वही कॉल करते हैं हमारा सेट तू डू
मुझे पता है इसके पास एक कॉल बैक है तो ये
लीजिए प्रीवियस वैल्यू ले ली हमने कॉल बैक
में और हमारा ये लीजिए कॉल बैक लगा दिया
ठीक है अब मैं नहीं चाहता की मैं रिटर्न
वगैरा कुछ करूं तो मैं इसको हटा दूंगा
पहले तो और ये जो प्रेप वैल्यू है इस पर
एक लूप लगा देते हैं मैप लीजिए पर एच
लीजिए आपका जो मां करें लीजिए कोई दिक्कत
वाली बात नहीं है अब यहां पे पता है मुझे
की मैप लगाऊंगा तो मेरे पास हर एक तू डू
यहां पे मिल जाएगा जी हर एक तू डू मिल
जाएगा हर एक तू डू क्या है एक ऑब्जेक्ट है
और हर एक ऑब्जेक्ट के अंदर एक आईडी है ठीक
है तो यहां पर भी हम लेते हैं तो इसको बोल
देते हैं
इतना तो आपको पता ही है मैप तो आपको पता
ही होगा और ये हमारा कॉल बैक हो गया ठीक
है ये इस तरह से कॉल बैक हो गया ठीक है अब
इसके अंदर क्या करना है आपको ये हर एक
प्रेप तू डू जो आप मिल रहा है उसके साथ
आपका एक आइडिया है यहां पे ये लीजिए हर के
पास ऑब्जेक्ट के पास एक आइडिया है अब उसके
साथ आपको क्या मैच करना है डबल इक्वल साइन
लगा के हम मैच कर लेते हैं ट्रिपल इक्वल
लगा देते हैं और आईडी मैच करनी है अब याद
रखिएगा ये जो प्रीव तू डू आपने लिखा है ये
तो है हर एक जो आईडी आप लिख रहे हैं ये
लिख रहे हैं जो अपडेट तू डू के अंदर आईडी
गई हुई है ठीक है ये हो गया कम तो अब क्या
करना है हमें की अगर ये ट्रू है तो कुछ
करो और अगर जल है तो कुछ करो ठीक है अगर
ट्रू है तो कुछ और करेंगे जल है तो कुछ और
करेंगे अगर ट्रू है तो क्या करो अगर वो
आईडी मिल गई है तो मैं टूटू दाल दो ना
इतना तो कम है तो अगर ट्रू है तो उसके
इसमें इस तू डू को उसे कर लो ठीक है और
अगर नहीं मिली है तो क्या करूं तो जो
पुराना है उसको रहने दो आज आईटी इस पुराना
है तो कुछ देना तो पड़ेगा ना उसको तो एक
कम करो उसके अंदर क्या करो ये प्रेप तू डू
जो है जो प्रीवियस आपका टुडे ऐसे टिप्स
पड़ा रहने दो चेंज करना ही नहीं है ना ठीक
है यह बड़ा थोड़ा सा परिसर हो सकता है
आपको लगे लेकिन बड़ा इजी सा लॉजिक है एक
बार दोबारा समझा देता हूं की हमने सेट तू
डू कॉल कर बस इतना सा आपको पता होना चाहिए
की यह ट्रेड्स जो है वो अरे है उसके अंदर
बहुत साड़ी वालुज हैं अब मुझे क्या करना
है ये फाइंड करना है सिंपली की कौन सा ऐसा
तू है जो आईडी से मैच कर रहा है ताकि मैं
उसके अंदर नया टूट गया एड कर डन तो मेरे
को पता है की मैं पुरी प्रीवियस स्टेट
पूरे यर की मैं इस तरह से ले सकता हूं तो
मैंने प्रीवियस यर की पुरी स्टेट ली और
मुझे अरे मिल गया होगा अरे मिलते ही मैंने
उसके अंदर क्या कर लूप लगाया मैप लगा के
लूप लगा दिया आप पर आईटी से लगा लो कोई
दिक्कत नहीं है अब आपने क्या कर उसके अंदर
सिंपली कहा की हर एक एलिमेंट पे जो और
उसका आईडी फाइंड करो तो मेरे को यहां पे
मुझे पता है मैप के अंदर ये प्रेप तू डू
हर एक एलिमेंट है तो पहले वन पे जाएगा तू
पे जाएगा थ्री पे जाएगा और मैंने उससे
क्वेश्चन पूछ लिया की यार एक कम करना एक
चीज बताना की ये जो प्रीव है प्रेप तू डू
एक एलिमेंट उसकी आईडी क्या मैच करते हैं
ये जो आईडी आपने मुझे दी है अगर मैच करती
है तो कुछ करो अगर नहीं करती तो कुछ करो
तो यहां पे इस तरह फिर से अपने कम कर लिया
ठीक अगर आपको इसको और अच्छे से समझना है
तो कुछ नहीं इस तरह से आप कई बार आया करिए
यहां पे तो आपने जैसे बोला प्रेस डॉट मैप
तो यह लीजिए prabh.map हो गया अब इसके
अंदर क्या कर आपने एन सारे के सारे मैप
करेंगे तो एच वैल्यू आपके पास मिल जाएगी
तो ये हमने लिखा इ वाल ठीक है और ये लीजिए
ये ए गया आपके पास इस तरह से वैल्यू अब
हमने क्या करना है यहां पे एक क्वेश्चन
पूछना है एच वैल्यू से तो आईएफ ल
स्टेटमेंट लगा के यहां पे चेक कर लो इस
स्टेटमेंट में क्या चेक करेंगे हम की ये
जो एच वेल है हमारी इसके पास मुझे पता है
ये ऑब्जेक्ट है तो डॉट आईडी मैंने लगा
दिया और उसको चेक कर लूंगा क्या आप बराबर
हो मेरी आईडी के अगर आप बराबर हो आईडी के
तो हमारे उसको आज आईटी इस रहने दो क्योंकि
वो इंडिविजुअल एलिमेंट्री तो चेंज कर रहे
हैं तो यहां पे तू डू रख लेंगे और वरना
हेल्थ के इसमें हम कर देंगे तो इस तरह से
अगर आपको समझ में आए तो आप एक्सपेंड करके
लिखिए वरना डिस्कार्ड है और डिस्कशन करिए
ठीक है तो ये हो गए हमारी सेकंड
फंक्शनैलिटी ठीक है जी अब हमारे पास डिलीट
फंक्शनैलिटी डिलीट भी कुछ इस तरह से होगी
लेकिन उसमें ये की इतना तामझाम नहीं चाहिए
आईडी वगैरा सब तो डिलीट फंक्शनल टीवी देख
लेते हैं
यह लीजिए डिलीट तो दो आगे आईटी इसे लिखना
यह वाला ही डिलीट तू डू वरना फंक्शनैलिटी
चाहिए डिलीट करने के लिए ये लीजिए आपका
डिलीट हो गया अच्छा अब डिलीट करने के लिए
क्या करना पड़ेगा ये हमारा कॉल बैक ए गया
ठीक है तो सबसे पहले वही
अब आपको पता है की प्रीवियस का एक्सेस तो
लेना पड़ेगा उसमें तो कोई ई नहीं है तो
आपने कहा की ठीक है मुझे ये लीजिए
प्रीवियस वालुज का एक्सेस दे दो अब
प्रीवियस वालुज के एक्सेस तो मिल गया
लेकिन अब आपको उसे पर मैप तो लगाना ही
पड़ेगा अच्छा मैप यहां पे एक अच्छा
सिंटेक्स नहीं है अधिकतर आप डिलीट जाप
करोगे तो डिलीट करते टाइम हम क्या करते
हैं की देखिए ये आपके पास ओरिजिनल है अब
आपको बनाना है
के अंदर वो साड़ी वालुज हनी चाहिए जो आपने
आईडी दिया है वो तो नहीं होना चाहिए बाकी
सब हनी चाहिए ठीक है दोबारा से बताता हूं
आपके पास पुराने वालुज हैं अब नया अरे
मेरे को इस तरह से बनाना है क्योंकि डिलीट
करना है ना डिलीट का मतलब क्या है की पूरा
जो ग्रुप है उसमें एक वैल्यू नहीं है बाकी
साड़ी वालुज तो है तो बस वही कम मुझे करना
है तो उसके लिए एक बड़ा अच्छा सा जवाब
स्किट के अंदर मेथड आता है फिल्टर तो
मैंने ये प्रयोग लिया और उसके ऊपर एक
फिल्टर लगा दिया
ठीक है अब यह फिल्टर ग गया फिल्टर मुझे
पता है हर एक वालुज के पास जाएगा तो उसको
टुडू बोल्डो प्रीव तू डू बोलो जो आपको
बोलना है बोलो वेरिएबल का नाम है तो किस
तरह से करना पड़ेगा मुझे बोलना पड़ेगा की
आप साड़ी वालुज तो आने दो लेकिन सिर्फ एक
वैल्यू वो मत आने दो जो की आईडी है तो
ऑब्वियस सी बात है ये जो फिल्टर है ये तो
तू स्टेटमेंट पे क करता है तो ठीक है तो
क्या है मैं इस तरह से बोल दूंगा की तू डू
डॉट आईडी जो है वो मैच नहीं करनी चाहिए
हमारी आईडी से
ठीक है तो जो जो मैच नहीं करेगा वो तो आता
जाएगा जो मैच कर जाएगा वो वहीं र जाएगा वो
रिटर्न होगा ही नहीं कभी ठीक है तो यह
हमने बेसिक लिया और बड़ा ही इजीली हमने ये
डिलीट फंक्शनैलिटी भी बना दी अच्छा अब
सबसे इंटरेस्टिंग और थोड़ा सा बिजनेस
लॉजिक यहां पे क्योंकि सबसे जो
इंटरेस्टिंग है ना ये चेक मार्क है ये चेक
मार्क के अंदर क्या करना होता है आपको
एक्चुअली में इस ऑब्जेक्ट के अंदर जाना
पड़ेगा इस बार और आपको एक कंप्लीटेड चेक
जो वैल्यू है इसको आपको टॉगल करना पड़ेगा
यानी की अगर ट्रू है तो जल कर दो जल है तो
ट्रू कर दो इतना ही कम है इसके अंदर कोई
खास नहीं है ठीक है
तो अब हम क्या करते हैं अगर आपको याद हो
तो अपडेट में भी कुछ ऐसे ही किया था मैप
लगाया था पूरा सर कम किया था ऑलमोस्ट से
कम ऐसा यहां पे भी होगा ठीक है चलते हैं
अब हम करते हैं
पागल कंप्लीट ठीक है जी और उसको बोलते हैं
क्या चाहिए
मुझे पता है आदर्श ज्यादा कमेंट क्षेत्र
में अपनी असली बताएंगे की हां सर इतना इजी
तो नहीं है थोड़ा सा डिफिकल्टी हो रही है
शायद दो बार देखना पड़ेगा वीडियो हो सकता
है कर बार देखना पड़े हां जी जो लोग कहते
हैं ना की अरे प्रोड्यूस तो कुछ नहीं होते
टोडोस बना के देखो कभी फिर आपको पता लगेगा
कितने आसन होते हैं कितने डिफिकल्ट होते
हैं तो आते हैं
मुझे पता है यर की हर एक प्रीवियस स्टेट
का मुझे एक्सेस चाहिए तो ये लीजिए
प्रीवियस एक्सेस मिल गया है आपको स्टेट का
ये लीजिए अच्छा जी प्रीवियस एक्सिस मिल
गया है तो मुझे रिटर्न नहीं करना पड़ेगा
इसलिए मैं यहां से ये हट्टा हूं ठीक है अब
क्या है ठीक है हर एक प्रेफ पे मुझे मैप
लगाना है ठीक है जी मैप लगा दीजिए अब आपने
मैप लगाया तो आपको क्या पड़ेगा हर एक मैप
के अंदर आपको वैल्यू को एक्सेस मिल जाएगा
तो ये लीजिए मैंने उसको बोल दिया वैल्यू
को प्रेयर तू डू बोलो कुछ भी बोलो आपके
मर्जी है
तो मुझे क्या करना पड़ेगा पहले फाइंड करना
पड़ेगा की क्या वो जो प्रेप तू डू है वो
वही वाला जो आईडी आपने मुझे पास कारी है
तो फिल्टर में तो मैं क्या देख रहा था की
वो वाला दो जो आईडी का ना हो तो हमने वो
वाला लॉजिक लगाया अब मुझे मैच करना है
उसको की वो ये तभी तो इस को अपडेट करूंगा
मैं तो हम क्या करते हैं एक क्वेश्चन इससे
पूछ लेते हैं की आपका ये जो प्रेप तू डू
है ना क्या ये मैच करता है मेरी आईडी से
है अगर मैच करता है तो वह अपना बेसिक
टरनरी ऑपरेटर अगर मैच करता है तो कुछ करो
नहीं करता है तो कुछ और करो तो यहां पे तो
ए जाएगा हमारा जल पार्ट और यहां पर ए
जाएगा हमारा ट्रू पार्ट ठीक है जी अब सबसे
आई कम अगर मैच नहीं करता है तो क्या करो
कुछ मत करो हज आईटी इस प्रीव तू दुगो
प्रीव तू डू रहने दो तो यह लीजिए प्रीफेड
होगा रहने दिया ठीक है अगर मैच कर जाता है
तो क्या करूं हां यहां बड़ा इंटरेस्टिंग
है अगर मैच कर जाता है तो उसके अंदर क्या
करना पड़ेगा की बाकी साड़ी वालुज तो आगे
आईटी इसे रखो बस एक वैल्यू चेंज कर दो ठीक
है तो आपको मैं देख लिया होगा स्प्रेड
ऑपरेटर का उसे होगा क्योंकि बाकी साड़ी
वालुज को अभी आगे आईटी इसे रखना है तो
क्या करेंगे हम यहां पे ये लीजिए
ऑब्जेक्टिव तो हमारा ठीक है तो हमने क्या
कर पहले तो साड़ी वालुज ले लो ये लीजिए
प्रेफ तू डू तो अब क्या हुआ साड़ी वालुज ए
गई आपके पास ठीक है साड़ी वैल्यू से मेरा
मतलब है यह साड़ी वालुज ए गई ठीक है अब
इसमें से सिर्फ एक प्रॉपर्टी चेंज करनी है
तो ठीक है कोमा लगा के चेंज कर दो उसको बस
ये कम करो कंप्लीटेड उसको ओवरनाइट करते
हैं एक तरह से तो ये वाली जो वैल्यू है
कंप्लीट इसको उठाते हैं ये लीजिए और ये
लीजिए कंप्लीटेड जो वैल्यू है इसको क्या
करो ये प्रॉपर्टी कर देते हैं क्या
ओवरनाइट करें इसको की जो भी उसे पर पहले
से वैल्यू है उसके सामने एक्सक्लेमेशन
साइन लगा देते हैं तो ट्रू जल हो जाएगा
कंप्लीटेड यह लो बस इतना सही तो कम था तो
पहले मैंने
एक-एक वैल्यू के अंदर घुसने की वह वैसी
रहने दो कॉपी करो नहीं पहले साड़ी ले लो
एक और राइट कर देंगे बस इतना सा ही तो कम
है ठीक है तो यह हो गई आपकी फंक्शनैलिटी
ठीक है अभी तक तो हो गया कम अब यहां पे आप
प्लीज कोई ना कोई अच्छा अपडेट तू डू में
हमारा थोड़ा सा इशू ग रहा है अपडेटेड तू
डू तो हमने अपडेटेड तू डू लिखा है क्या
हां जी अपडेटेड तू डू लिखा है एक्चुअली
मैं इसको कर देते हैं अपडेट तू डू ताकि ये
वालुज हमारे पास मिल पे और यहां पर हमारे
पास अपडेटेड तू की जगह अपडेट तू डू ठीक है
अब यहां पर प्लीज कोई कमेंट कर दीजिएगा की
टाइम स्टांप के साथ में यहां पे आपका पूरा
बेसिक कॉन्टैक्ट्स का फंक्शनैलिटी खत्म हो
गया है यहां से हम स्टार्ट कर रहे हैं
हमारे लोकल स्टोरेज की फंक्शनैलिटी
के अंदर लोकल स्टोरेज भी पढ़ेंगे आराम से
लीजिए दो-तीन दिन जो लोग लगा के रखते हैं
क्या अरे डेली वीडियो डालो नहीं इन वीडियो
में आपको लगेगा दो तीन दिन ठीक है अब लोकल
स्टोरेज क्या है इतना बड़ा परिसर चीज है
नहीं अगर लोकल स्टोरेज के बड़े में आपको
पढ़ना भी होना तो आप सीधा गूगल पे जाइए और
देखिए रिएक्ट का लोकल स्टोरेज
जावास्क्रिप्ट का लोकल स्टोरेज को अलग
नहीं है वो ब्राउज़र का लोकल स्टोरेज है
अब आप रिएक्ट के थ्रू उसको एक्सेस करो
जावास्क्रिप्ट के थ्रू एक्सेस करो व्यू के
थ्रू ए एक्सेस करो वो कुछ अलग है नहीं
उसके अंदर तो अगर आप जाके यहां पे लोकल
स्टोरेज देखेंगे एन इन जावा स्क्रिप्ट तो
आपका सर का सर यहां से w3school से देख लो
कोई दिक्कत नहीं है तो w3 स्कूल में आप
देखोगे दो ही एग्जांपल है सेट आइटम और गेट
आइटम बस इतना ही है कम एक्चुअली में और
कुछ है भी नहीं इसके दादा ये अलाउ करता है
आपको की वालुज के अंदर साड़ी की साड़ी चीज
रखना बट एक ही इसका इशू आता है छोटा सा की
वालुज एक बार इसमें रख देते है ना तो
साड़ी स्ट्रिंग फॉर्मेट में हो जाति है तो
आपको ना वालुज लेते टाइम लेते टाइम उसको
ना कई बार जेसन में आपको कन्वर्ट या दी
कन्वर्ट करना पड़ता है तो आपको इस तरह से
दिखेगा हालांकि यहां पे इन्होंने एग्जांपल
नहीं दिया है मन पे देख लेते हैं हम
रेफरेंस पे आ वैसे तो आपको डायरेक्टली मिल
जाएगा ये तो बस एक इतना सा ध्यान प्रश्न
आता है की जब भी वालुज वहां से लोग तो
साड़ी स्ट्रिंग है जिस में कन्वर्ट करना
पड़ेगा वो खुद भी जेसन से नहीं कर पता
स्ट्रिंग से करता है तो उसको वालुज जेसन
स्ट्रिंग में देनी पड़ती है अब बस और कुछ
भी नहीं है तो लोकल स्टोरेज यहां पे आपको
मिल जाएगा सेशन स्टोरेज वगैरा इसके बड़े
में और देख लीजिएगा और कुछ है नहीं इसमें
देखिए यहां पे भी वही एग्जांपल है सेट
आइटम वगैरा तो यहां पे जेसन का वो कुछ दे
नहीं रखा है इन्होंने बट इतना सा ध्यान
रखना है आपको तो चलिए वापस चलते हैं अब
देखिए सबसे इंपॉर्टेंट बात की जैसे ही
मेरी एप्लीकेशन लोड होती है हो सकता है
आपने उसके अंदर रखें हो है ना हो सकता है
ये तो
जैसे की यह मेरी रिएक्ट अप है इसको मैं
रिफ्रेश करता हूं तो तू है यहां पर तो वह
सबसे पहले लोड हो जानी चाहिए
फर्स्ट टाइम आपके लोड होती है कौन सा ऐसा
मेथड है जो क्वेरी कर सकता है लोकल
स्टोरेज से या मैं को एक फंक्शन बना डन की
यह वाला फंक्शन कॉल करके लोकल स्टोरेज में
जो साड़ी वालुज लेकर आओ जो भी इसके अंदर
है और उसको स्टूडियो में इंसर्ट कर दो
बताइए कौन सा मेथड है वो मेथड है आपका उसे
इफेक्ट तो यहां पर जाते हैं हम सबसे पहले
तो हम क्या करेंगे साड़ी वालुज लेते हैं
तो ये लीजिए उसे इफेक्ट उसे कर लेते हैं
उसका ये लीजिए उसे इफेक्ट है क्या हमारे
पास उसे स्टेट तो है
उसे इफेक्ट ठीक है जी अब हम क्या करते हैं
पहले तो साड़ी वालुज निकलते हैं और हमारा
कोई डिपेंडेंसी आर्स में
हटा देते हैं ठीक है जी अब सबसे पहले क्या
करना है कुछ भी नहीं आपको साड़ी वालुज लेक
आनी है अच्छा वालुज लेक कैसे आओगे देखिए
लोकल स्टोरेज ना डायरेक्टली एक्सेस कर
सकते हो जब तक रिएक्ट में हो गौर से
सुनिएगा जब तक आप सर्वर साइड रेंडरिंग की
बात नहीं कर रहे हैं क्योंकि सर कम सर्वर
पे हो गया तो ब्राउज़र पे कभी आए नहीं तो
लोकल स्टोरेज कैसे कम करेगा तो लोकल स्टोर
से कुछ नहीं बोलना पड़ता है आपको बोलना
पड़ेगा गेट आइटम अब आपने देखा है यहां पे
की आपको कोई भी आइटम जब लेना है तो आप उसे
आइटम का बस बताओ की क्या की वैल्यू आपने
स्टोर करिए तो जैसे इन्होंने बोला है की
लास्ट नाम लिया हो देखिए सेट करते टाइम
आपको बतानी पड़ती है की की क्या रखोगे और
वैल्यू क्या रखोगे और गेट करते टाइम आप बस
उसकी का नाम रखो और आपको मिल जाति है
वैल्यू तो अभी तक हमने कोई नाम रखा नहीं
है पर जो भी आप नाम रखना चाहूं जैसे सपोज
करो मैं उसका नाम टोडोस रखूंगा तो मैं बोल
देता हूं अभी मैं गेट कर रहा हूं क्योंकि
मैंने सेट नहीं किया है गेट करना पहले
जरूरी है क्यों वो भी बताते उसका भी फ्लो
अब यह आपको वालुज दे देगा रिटर्न आप इसको
कौन सा लॉक करके देखोगे तो रिटर्न आपको
वैल्यू दे देगा लेकिन जैसा की मैंने आपको
बताया की ये साड़ी की साड़ी वैल्यू होती
है स्ट्रिंग में और हमें तो कैसे चाहिए जी
सर में चाहिए क्योंकि जैसा नहीं तो है
पूरा का पूरा जो एक्चुअली मैं स्ट्रक्चर
प्रिजर्व रगेगा| तो कुछ नहीं इसको कट करिए
बड़ा इजी से कम है आप बोलिए जेसन डॉट
पार्ट्स ये आपको डायरेक्टली जावास्क्रिप्ट
देता है और ये मेथड आपके पास है तो इसको
बस मेथड के अंदर ये वालुज रख दीजिए बस हो
गया अब इसको स्टोर कर लेते हैं एक वेरिएबल
में इसको बोल देते हैं तोड़ू ये लीजिए हो
गया बस इतना सा लोकल स्टोरेज है हां जी
मुझे पता है आपको हंसी ए रही है बट इतना
ही हेलो 50% हो गया है एक लाइन में एक
लाइन और सिखाऊंगा बच्चा हुआ 50% हो जाएगा
अब क्या करना है अब करना कुछ नहीं है बस
आपको वालुज को सेट करनी है अगर उसमें कुछ
हो तो यहां पर एक कंडीशन चेक रख लेते हैं
छोटा सा की पहले तो बताओ तू डू है की नहीं
है आपके पास अगर है ही नहीं वो वैल्यू
हो जाएगी और एक और हम क्वेरी पूछ लेते हैं
आपका मां करें तो पूछिए मैं पूछना चाहूंगा
उससे
लेकिन जो आपके पास
कुछ लेंथ भी है की नहीं है क्योंकि मुझे
पता है हां हमने बोला है की वो जेसन है
लेकिन एंड ऑफ डी दे तो मुझे क्या तू डू
एरर ही है अरे के अंदर ऑब्जेक्ट्स है तो
ये स्ट्रक्चर भी अगर मुझे प्रिजर्व करना
है ना तो भी जेसन से प्रिजर्व होगा
स्ट्रिंग में नहीं मिलता ये स्ट्रक्चर तो
आपसे जरूर उम्मीद नहीं है जेसन का मतलब
करली भी रस्सी हो जेसन का मतलब रेज भी हो
सकता है हां जी हो सकता है इस पे कभी और
चर्चा करेंगे बट हो सकता है और मैं एक और
सवाल इससे क्या करता हूं प्रोड्यूस तो है
ठीक है लेकिन लेंथ के आपकी जीरो से बड़ी
है या कुछ है क्या उसे अरे वगैरा के अंदर
तो तो हम उसको सेट करें वरना क्यों नहीं
एम्टी तो पहले भी था ही तो क्या ही खास कर
रहे थे हम ठीक है तो ये आगे हमारी वालुज
तब हम कॉल करेंगे अपने सेट तू डू उसको और
सेट तू डू उसको बोलेंगे की ये लो जी आप ये
टोडोस ले लो ठीक है यह तो कम हो गया हमारा
एक उसे इफेक्ट में पर क्या हम मल्टीपल उसे
इफेक्ट उसे कर सकते हैं
उसमें कोई दिक्कत वाली बात नहीं है लेकिन
अब क्या है हमारे पास एक और लोकल स्टोरेज
के अंदर हम कम करेंगे देखिए यह तो कम है
जब आपने एप्लीकेशन यहां पर लोड कारी साड़ी
की साड़ी वालुज ए गई लेकिन एक और कम है
मेरे पास की जैसे ये साड़ी वालुज मेरे पास
यहां टोडोस में एड हो रही है मैं उसके बाद
उसको लोकल स्टोरेज में एड करवाना चाहता
हूं ठीक है लोकल स्टोरेज में कब एड करवाना
चाहता हूं जब ये यहां पे टोडोस में जाए
हालांकि जहां कांटेक्ट एपी के थ्रू रही है
लेकिन एंड ऑफ डी दे कॉन्टेक्स्ट एपी भी तो
यहां पे ये प्रोवाइडर है ही तो ये
प्रोवाइडर मेरे को प्रोड्यूस दे रहा है तो
जैसे ही उसके अंदर वैल्यू चल जाए वहां से
वैल्यू मुझे मिल जाएगी यहां पे और जैसे
इसके अंदर कुछ भी चेंज हो तो मेरे को वो
वालुज लोकल स्टोरेज में एड करनी है अब
आपके दिमाग में सबसे पहले आएगा की यार ये
उसे इफेक्ट बनाया तो है इसके अंदर एक
डिपेंडेंसी है के अंदर दाल देते हैं और एक
और मेथड लिख देते हैं हां कर सकते हो
लेकिन प्रॉब्लम क्या होगी उसके अंदर कुछ
भी चेंज आएगा ना तो ये वापस उसको गेट भी
करेगा हां तो मैं नहीं चाहता ये पूरा का
पूरा मेथड रन हो तो एक ऑप्शन कई ऑप्शन से
आपके पास और ऑप्टिमाइज ऑप्शन पे हम बात
करेंगे है लेकिन एक ऑप्शन जो की कहानी से
भी गलत नहीं है की आप एक और उसे इफेक्ट
लिख सकते हो कई एप्लीकेशन में एक से
ज्यादा उसे इफेक्ट भी होते हैं तो ये
लीजिए उसे इफेक्ट में क्या-क्या होगा एक
तो मेथड होगा जो जो भी आप बोलोगे वो कम
करेगा और एक उसका डिपेंडेंसी अरे होगा ठीक
है डिपेंडेंसी अरे मैं अभी हमारे पास ये
तोड़ू है वही स्टेट वाला तू है वही दाल
दिया हमने और क्या करवाना चाहते हो उससे
आप ज्यादा कुछ खास तो है नहीं वही लोकल
स्टोरेज लेते हैं लोकल स्टोरेज के अंदर हम
क्या करेंगे डॉट सेट आइटम पिछली बार गेट
आइटम क्या था अबकी बार सेट आइटम किया सेट
आइटम के अंदर की और वैल्यू देनी पड़ती है
तो ये हो गए हमारे की को टड्स अब याद
रखिएगा जो भी आपने की इसका यहां नाम दिया
है ना लेते टाइम वही देते टाइम पे रखिएगा
ये देते टाइम ज्यादा जरूरी है लेते टाइम
पे आप सी बात जरूरी है ही ये तो हो गई की
अब इसी तरह से लिखा हुआ था यहां पे
बेयरिंग की और वैल्यू देखिए इसने स्ट्रिंग
में दिया है डायरेक्टली स्ट्रिंग में ही
देना पड़ता है लेकिन मुझे स्ट्रक्चर मुझे
पता है मैं तो अरे ले रहा हूं फिर मेरा
लोकल स्टोरेज लगा ही नहीं हां जी तो आप
क्या कर सकते हो वापस से ये अपना जेसन डॉट
पार्ट्स वाला मेथड उसे करो इसके अंदर एक
और मेथड आपको मिलता है जीएम डॉट
स्ट्रिंग में कन्वर्ट कर देता है नाम से
ही पता ग रहा है स्ट्रिंग की फाइल
स्ट्रिंग की फाइट कर दो सबको और ये अपनी
प्रोड्यूस हमने यहां पे पास कर दी बस हो
गया अब आपको चाहिए तो आप इसको एक वेरिएबल
में स्टोर कर लो कोई खास जरूर तो है नहीं
क्या करेंगे उसे वेरिएबल का तो हमारे पास
ये कम हो गया ठीक है तो फंक्शनैलिटी आपने
देखा की हमने काफी परिसर कर दिए बस एक
प्रोड्यूस के अंदर भी लेकिन अब आप देख रहे
हैं की हमने जी तरह से इसको बनाया है तो
एक्चुअली में लोकल स्टोरेज में तो ये दो
उसे इफेक्ट वगैरा अपने आप हर बार कम कर
रहे हैं आपको कुछ नहीं करना है किसी यूजर
को फंक्शनैलिटी या जो भी डेवलपर कर रहा है
उसको कुछ देखना सोचना ही नहीं है क्योंकि
ये ऑटोमेटिक हो रहा है अच्छा किसी भी
कंपोनेंट को जो भी डिजाइन कर रहा है उसे
कंपोनेंट वाले को भी कुछ नहीं देखना है
क्योंकि एड तू डू ये साड़ी फंक्शनैलिटी तो
मिल ही रही है आपको तो आप सीधा कांटेक्ट
ही पैसे वहां पे ले लो जी भी कंपोनेंट में
लेना चाहे हां जी वहां पे भी ले सकते हैं
तो अब हम चलते हैं कॉम्पोनेंट्स बनाने की
तरफ कॉम्पोनेंट्स बनाने में हमारे को
थोड़ी सी सहूलियत रहेगी क्योंकि नोट्स है
हमारे पास में तो एक नया फोल्डर हम यहां
पे बनाते हैं और उसको नाम देते हैं कंपो
नेट ठीक कॉम्पोनेंट्स में हमारे पास
ज्यादा कुछ खास नहीं है इंडेक्स फाइल तो
बनेगी बनेगी हमारे पास वो भी बनाएंगे हम
लेकिन एक पहले न्यू फाइल बनाते हैं हम
यहां पे सबसे पहले हमारी
सेक्स हो गया हमारे पास में और आईएफसी
करके रख देते हैं एक बार में ताकि खुश रहे
वो परेशान नहीं कर रहे हैं हमें और एक
हमारे पास नई फाइल और बनाते हैं ये तो तू
डू का फॉर्म हो गया और एक टूटू के आइटम भी
चाहिएंगे तू डू आइटम जीएस
अरे कम ऑन जीएस ये लीजिए यहां पे भी
आईएफसी करके रख देते हैं ताकि परेशान ना
करें क्योंकि मैं एक्चुअली मैं एक और
इंडेक्स फाइल यहां पे बनाऊंगा ताकि साड़ी
चीजों को एक साथ ले लो इंडेक्स
की चलेगी क्योंकि हम एक्चुअली में तो जगह
से रिटर्न कर रहे हैं यहां पे तो अब क्या
करो कुछ नहीं इंपोर्ट करके उनको एक्सपोर्ट
कर दो
फॉर्म ले लिया
बस इनको एक्सपोर्ट कर दो
आइटम ले लिया बस इतना ही होता है
रॉकेट साइंस होती नहीं है इसके अंदर ठीक
है जी
है अब हम क्या करेंगे यह साड़ी फाइल्स
करते हैं बैंड एक बार
और चलते हैं हमारे पास तू डू फॉर्म के
अंदर अच्छा तू डू फॉर्म में जान से पहले
हम क्या करेंगे सबसे पहले हमारे नोट्स को
कंसर्ट करेंगे जो की मैंने आपके लिए
ऑलरेडी पुश कर दिए हैं गेट पे तो हमारे
पास यह आइटम है और ये हमारा फॉर्म है तो
फॉर्म का हमारा यह फंक्शन है आगे आईटी इसे
और यह रिटर्न कर रहा है तो ये रहा हमारा 2
फॉर्म कॉपी करिए सिंपल सा या फिर आपको
यहां पे मिल जाएगा कॉपी कॉपी करिए और सीधा
का सीधा इसको ले आई फंक्शन से लेक यहां तक
यह लीजिए यह ले हम यहां पर
इनपुट एलिमेंट है और यह यहां पर बटन है
फंक्शनैलिटी
हम खुद भी एड कर सकते हैं ऐसा कुछ रॉकेट
साइंस है नहीं फंक्शनैलिटी तू डू फॉर्म की
ठीक है अब तू डू फॉर्म के अंदर सबसे पहले
क्या है आपको कुछ इतने ज्यादा चीजों की
जरूर है ही नहीं यहां पे सबसे पहले तो
स्टेट डिफाइन करनी है स्टेट कहां से ये
इंडिविजुअल तू डू के लिए ठीक है और ये
लीजिए सेट तू डू ठीक है जी ये ए गया सेट
तू डू कहां से आएगा उसे स्टेट से आएगा ये
लीजिए उसे स्टेट डिफॉल्ट वैल्यू क्या होगी
एम्टी होगी कोई थोड़ी ना चाहता हूं मैं
वहां पर ठीक है जी अच्छा ये जो है ये मेरा
क्या है एड तू डू है क्योंकि फॉर्म है अब
एड तू डू की फंक्शनैलिटी तो मेरे पास अप
डॉट j6 में हां जी और ये जो एड तू डू है
ये फंक्शनैलिटी तो यहां से मैंने इसके
अंदर इंजेक्टर कर दी है लेकिन वापस भी तो
चाहिए ना वो फंक्शनैलिटी वो कहां से लूंगा
हां जी उसे तू डू सेलो
से क्यों उसे तू डू से क्योंकि यहां जाकर
जब मैं देखा हूं तो यह जो उसे कॉन्टेक्स्ट
है यह तो कम कहीं नहीं है क्योंकि इसने
यूज्ड तू डू दे दिया है और उसे
कॉन्टेक्स्ट के पास ही तो सर कांटेक्ट है
यह सब कुछ इस के लिए तो कॉन्टैक्ट्स बनाया
है बस अब तो क्या कम करना है जहां भी
कंपोनेंट में चाहिए कहानी ड्रिलिंग वगैरा
कुछ नहीं करनी सीधा एक लाइन लखनी है और
साड़ी वालुज मुझे मिल जाएगी जो भी
फंक्शनैलिटी चाहिए मैं यहां से
एक्सट्रैक्ट कर लूंगा और उसको बोलूंगा
कहां से लो ये लो यूज्ड तू डू से लेक आओ
क्या चाहिए उसे तू डू से बताइए अब आप
बताइए मुझे ये तो हद तू डू बस अब करना
क्या है वो वालुज लेनी है एड तू डू के
अंदर पास करनी है एड तू डू की एक्सपेक्ट
करता है की आप मेरे को एक तू डू डॉग अच्छा
कम क्या करूंगा कम यहां पे नहीं बताया कम
कम बताया है f.gs में क्या कम करते हो जी
कुछ नहीं मैं तू डू उसको लेट हूं प्रीवियस
वालुज को सारे को स्टार्ट कर लेट हूं अब
प्रीवियस वालुज मैंने यहां पे स्प्रेड कर
लिया साड़ी की साड़ी ठीक है जी उसके बाद
ये रही वालुज हमारे पास में तो हमने क्या
कर डेट डॉट नो करके मैंने यहां ले लिया है
और बाकी वालुज को आगे आईटी इसे स्प्रेड कर
दिया है ठीक है जी
उसको स्प्रेड कर दिया है मतलब ऑब्जेक्ट
दूंगा तभी तो स्प्रेड करोगे ऐसे कोई हवा
में थोड़ी ना कर डॉग हां जी सही बात है तो
मेथड बनाया जाए उसके लिए हां जी बिल्कुल
बनाया जाए तो ये रहा हमारा उसे तू डू ए
गया बेसिक तो मेथड बनाते हैं उसका नाम
देते हैं एड तू डू जो भी आपको नाम देना है
कोई फर्क नहीं पड़ता है यहां पे इवेंट
आएगा ठीक है जी
ठीक है जी इवेंट ए गया अब क्या करना
पड़ेगा सबसे पहले तो आई डॉट
प्रीवेंट डिफॉल्टर
प्रीवेंट अगर लिख पाया
तो अगर उसके अंदर कुछ है ही नहीं तो यह
करेंगे सिंपल सा रिटर्न कर देते हैं अब एक
ही लाइन का रिटर्न है तो क्यों ही कर ली
ब्रेसेज उसे करने तो यह लीजिए रिटर्न
रिटर्न ठीक है अगर नहीं है उसके अंदर कोई
वालुज है तो क्या करो कुछ नहीं एड तू डू
को कॉल करते हैं यह लीजिए
तो गलती होती है क्योंकि फंक्शनैलिटी जब
ऐसे डिफाइन कर राखी है आपने की प्रीवियस
वैल्यू के अंदर तू डू तो आप दे दो
स्ट्रिंग में कोई दिक्कत नहीं है लेकिन
यहां पर कर क्या रहे हो वो भी तो देखो की
स्प्रेड कर रहे हो ठीक है अरे स्प्रेड हुआ
लेकिन यहां पर आप ऑब्जेक्ट भी तो स्प्रेड
कर रहे हो तो कुछ दो तो स्प्रेड करने के
लिए ऐसा कैसे स्ट्रिंग दे डॉग तो कैसे कम
चलेगा हां जी तो उसके लिए क्या करेंगे हम
इस तरह से कभी पास ही नहीं करेंगे हम क्या
करेंगे एक ऑब्जेक्ट पास करेंगे
हो सकता है आप आईडी पास करो आईडी के अंदर
यहां पर हम डेट डॉट नो पास कर देते हैं
चलिए ठीक है ये भी कर सकते हो आप और क्या
वालुज पास करोगे
इस तरह से और फिर क्या करेंगे कंप्लीटेड
कंप्लीटेड भी पास करेंगे डिफॉल्ट वॉल्यूम
इस तरह से साड़ी वालुज में दे रहा हूं अब
साड़ी वालुज दे तो सकता हूं और कोई दिक्कत
वाली बात भी नहीं है यहां पे फंक्शनैलिटी
सिर्फ इतनी सी होगी बस ये वाली लाइन गायब
हो जाएगी इतनी सी है ना और ये आप आगे ए
स्टूडेंट दे दो तो वो भी स्प्रेड करके आप
आगे आईटी इसे यहां लगा दो और बस हो गया कम
लेकिन अगर क्योंकि आपने यहां पे डेट डॉट
ना दे रखा है तो एक्चुअली मैं आपको डेट
डॉट ना हो यहां पे देने की जरूर है नहीं
तो हटा देते हैं ठीक है जी और आईटी ट्रू
कॉल और तू डू आपको पता है नए सिंटेक्स के
अंदर अगर आपके फील्ड का नाम और आपकी वालुज
का नाम से है तो हम यह भी कर सकते हैं तो
यह अलग वीडियो आपने सेंड कर दिया वहां पे
और कंप्लीटेड हमने जल दे दिया तो आई थिंक
अब आपको थोड़ा सा कनेक्ट हो रहा होगा
अच्छा ये जो फंक्शनैलिटी थोड़ी कम समझ में
ए रही थी अगर मैं थोड़ा सा सब्र बनाया
रखना कुछ लोगों ने छोड़ दिया होगा उनके
लिए कमेंट करेगा की हां मुझे बाद में समझ
में ए गया सर का सर बाद में सारे डॉट
क्लिक हो गए जैसे की क्रिस्टोफर नोलन की
मूवी देख रहे थे बाद में सारे डॉट कनेक्ट
करवा देता हूं मैं तो अब मुझे समझ में आया
की अच्छा था यह वालुज इस तरह से स्प्रेड
हो रही है मैं चाहूं तो इसको हटा के यहां
पे अगर कंफ्यूज हो रहा हूं तो मैं यहां पे
भी लिख सकता हां जी बिल्कुल लिख सकते थे
कोई दिक्कत वाली बात ही नहीं थी ठीक है तो
ये सारे की साड़ी वालुज हो गई हमारे पास
अब क्या करना है देखिए ये जो हमारा फील्ड
है ये जो तू डू लेकर आया है तो उसे फील्ड
के अंदर भी तो टुडू लिखा होगा तो उसको भी
गैप कर देते हैं क्योंकि वो इस फील्ड से
ही तो वैल्यू ले रहा होगा तो एक बार एड
टूटू तो हो गया अब हमारा क्या करो ये सेट
तू डू कॉल कर लो और वैल्यू एम्टी कर दो बस
ठीक है थोड़ा सा क्लीन अप हो गया हमारा
ठीक है तो इतना तो हो गया अब ये इनपुट जो
है क्योंकि फॉर्म है ऑब्वियस सी बात है
ऑटोमेटेकली सबमिट हो जाएगा तो टाइप सबमिट
होगा तो ये अपने आप एड यहां पे ए जाएगा तो
पहले तो ऑन सबमिट लगाते हैं यहां पे ऑन
सबमिट
तो सबमिट होने पर क्या करो ये एड या जो भी
आपने मेथड का नाम दिया है वो आप यहां पे
ले लो ठीक है इनपुट के अंदर क्या-क्या
वालुज होगी इनपुट के अंदर सबसे पहले चीज
तो वायर अप करना पड़ेगा हां इसको वायरिंग
बोलते हैं की वायरिंग हो जाए इनपुट की
हमारी स्टेट के साथ तो उसे वायरिंग को ही
बोलते हैं ये तू डू बस आपने वो वेरिएबल
वहां पे दाल दे इस को वायरिंग बोलते हैं
अच्छा इसमें कुछ भी चेंज आए तो क्या हो
कुछ भी चेंज हो तो हमारे स्टेटमेंट डालो
ना और क्या करना है बिल्कुल तो ठीक है जी
ये भी रख लेते हैं की ऑन चेंज हो तो क्या
हो ऑन चेंज हो तो जो भी आपका इवेंट है उसे
इवेंट से हम कॉल कर लेंगे किसको अपने सॉरी
के अंदर क्या करना पड़ेगा ये बताओ मुझे
कमेंट क्षेत्र में बताओ सेट तू डू में
क्या करोगे
आपसे पूछ रहा हूं पता तो पड़ेगा अगर यहां
ऑफलाइन क्लास में बैठे होते मेरे सामने
ए जाता है तो पक्का म्यूट करवा के पूछता
जबरदस्ती पूछता ठीक है अगर आपने बोला है
तो आप एकदम सही ठीक है बड़ा ही बेसिक सा
है एड बटन पर कोई फंक्शनैलिटी कॉल करने की
जरूर नहीं है क्योंकि यह टाइप सबमिट है
ऑटोमेटिक के लिए सबमिट हो जाएगा टाइम भी
बैक गया कस भी नहीं लखनी पड़ेगी
फंक्शनैलिटी भी समझ में ए गई अच्छा अब हम
चलते हैं हमारे तू डू आइटम के अंदर
क्योंकि ये जो तू आइटम है ना ये भी थोड़ा
सा परिसर ज्यादा तो नहीं है थोड़ा सा
परिसर है यहां पे हम क्या है थोड़ा सा इन
चीजों पर डिस्कस नहीं करेंगे क्योंकि आप
समझ में ए गई है की ऑन चेंज वैल्यू कितनी
बार करेंगे वही वही तो वो तो समझ में ए
चुका है मैं तो अब चलते हैं तू डू आइटम पे
पहले लेक आते हैं इसके नोट्स तो यहां से
आपको तू डू फॉर्म मिल गया है ये तू डू
आपको ये मिल जाएगा तो यहां से लीजिए कॉपी
ये किया कॉपी और तू डू आइटम ये हमारे पास
आगे आईटी इसे लेफ्ट है ये किया पेस्ट
ठीक है तो यह सब हमने यहां पर दाल दिया और
यह सब हमारा फंक्शनैलिटी वैरियेबल्स वगैरा
यह सब रखें हुए हैं एक बार इस पर भी और भी
देख लेंगे कोई दिक्कत वाली बात ही नहीं है
पहले आते हैं फंक्शनैलिटी पे अब
फंक्शनैलिटी हमारे पास कितनी है इस आइटम
के अंदर क्योंकि अगर आप देखेंगे तो ये
अपने आप में एक आइटम है तो पहले
फंक्शनैलिटी तो ये टॉगल वाली है की आइटम
हमारा एडिटेबल है की नहीं क्योंकि देखिए
एडिटेबल है तो ही तो क्लिक कर रहे हैं अगर
ये टिक मार्क हो गया है तो अभी एडिटेबल ही
नहीं है तो कोई ना कोई स्टेट तो होगी जो
बताएगी की अभी एडिट वाला उसको देना है
ऑप्शन की नहीं देना है तो उसे हिसाब से
मैं कम करना पड़ेगा ठीक है अब हमें ये भी
है की भाई जैसे ही एडिट अगर मैं कर दूंगा
यही पे तो एडिट कर रहा हूं तो ये तू डू का
मैसेज मुझे अपडेट करना पड़ेगा हां जी ये
भी करना पड़ेगा और उसके बाद अगर डिलीट कर
दूंगा तो डिलीट वाली फंक्शनैलिटी भी आनी
चाहिए तो ये सब तो मुझे फंक्शनैलिटी चाहिए
की चाहिए तो इसको देखते हैं कैसे हैंडल
करेंगे देखिए यहां पे सबसे पहले और
इंपॉर्टेंट चीज है कांटेक्ट लेक आना
क्योंकि इस से तो सारे फंक्शनैलिटी आएगी
तो हम क्या करते हैं सबसे पहले हम करते
हैं कुछ वालुज हमें चाहिए की तो वालुज हम
ले आएंगे कहां से लेंगे उसे
कांटेक्ट
उसे तू डू वापस से याद ए गया उसे तू डू
ठीक है
अब क्या क्या फंक्शनैलिटी आपको यहां से
चाहिए वो आप स्टार्ट कर लो जैसे मुझे पता
है अपडेट
तू चाहिए
अपडेटेड ठीक है जी और क्या चाहिए
अपडेट तू हो गई कंप्लीट डिलीटेड तू डू
ठीक है और
कंप्लीटेड आई थिंक तीन में कम हो जाएगा
अगर कुछ चाहिए तो वो भी ले लेंगे हम ठीक
है अब क्या करते हैं सबसे पहले बनाते हैं
स्टेट ज्यादा नहीं दो ही स्टेट हमें लगेगी
पहले तो एक लगेगी हमारा की एडिटोरियल है
की नहीं इंट्रोड्यूस के लिए लगेगी तो हम
क्या करते हैं
एक्चुअली में हम यहां पर सिंटेक्स भी उसे
कर सकते हैं
क्योंकि आपको पता है जैसे एडिट पर क्लिक
कर डॉग तो स्टेट चेंज होगी तो यहां से ये
वालुज भी तो लेनी पड़ेगी इसके अंदर हां ये
भी लेनी पड़ेगी तो ये लीजिए
एक तू डू मैसेज
और सेट तू डू मैसेज
है और यह वैल्यू साड़ी आएगी उसे स्टेट से
यह लीजिए उसे स्टेट ए गया और बाय डिफॉल्टर
वैल्यू क्या होगी जो भी आपका तू डू है उसे
टुडू के अंदर आपको डॉट तू डू ठीक है अब
क्या है एक्चुअली में अगर आप गौर से
देखेंगे तो हमारे app.js के अंदर बाद जाता
हूं क्योंकि मुझे पता है यहां जस्ट
कंफ्यूज हो आप लेकिन देखिए अगर आप app.js
के अंदर जाएंगे तो हमारे पास फॉर्म की
इनफॉरमेशन तो हमें पता है यहां पे लखनी है
लेकिन यहां पर जब आप आइटम डॉग तो उसके
अंदर आपको लूप लगा के देना पड़ेगा क्योंकि
हमने देखिए सारे लिए हैं तो यहां पे
एक्चुअली में हम लूप लगाने वाले हैं तू डू
डॉट आइटम हर एक आइटम क्या होगा एक सिंगल
तू डू ठीक है तो जी तरह से हमने यहां पे
बोला है हर एक आइटम क्या होगा इस तरह से
होगा तो ये इतना इतना ऑब्जेक्ट आप पास
करोगे
नोट्स फाइल है वहां पे मैंने इसको ऑलरेडी
डिस्ट्रक्टर कर लिया क्योंकि ऑब्जेक्ट मिल
ही रहा था और ये तू डू मिल रहा था तो हां
जो पूरा ऑब्जेक्ट है उसको मैंने तुङो बोल
दिया तो तू du.udo मैंने यहां पे वैल्यू
ले लिया ठीक है हां अब समझ में आया आपको
थोड़ा सा ही है ठीक है जी अब क्या करना है
अब करनी है फंक्शनैलिटी पे बात तो एडिट तू
डू करना पड़ेगा सबसे पहले क्योंकि उसके
बाद कैसे स्टेट में हम मेडल करेंगे वो तो
हम कर ही लेंगे उसमें कोई दिक्कत नहीं है
पहले सबसे पहले लिखने हैं फंक्शनैलिटी को
तो यहां पे हमने बोला एडिट तू डू क्योंकि
एडिट तू डू अपने आप में एक फंक्शनैलिटी है
और वो आपकी जो टस है उनको एडिट करती है तो
यह लीजिए तो सबसे पहले क्या कॉल करना
पड़ेगा अपडेट तू डू ठीक है अपडेट ही तो कर
रहे हैं यहां पे क्लिक करने के बाद हो
क्या रहा है ये अपडेट ही तो हो रहा है
जैसे यहां पे मैंने क्लिक कर तो ये अपडेट
ही तो हो रहे हैं सारे के सारे हैं ठीक है
तो इसको एक बार रिफ्रेश कर लेते हैं ये
क्लिक कर अपडेट हो रहा है अपडेट होते टाइम
क्या है कौन सा वाला तू डू अपडेट कर रहा
हूं तो आईडी तो लगेगी हां जी आईडी बिल्कुल
लगेगी उसके बाद क्या लगेगा जो नया आपको
टुडू है वो तू डू मैसेज भी लगेगा हां जी
तो ठीक है तो इसको हम चलते हैं तो ये डेट
तू डू ठीक है अब अपडेट तू कम कैसे करेगा
सबसे पहले चीज क्या चाहिए तू डू आईडी दे
दूंगा कोई दिक्कत नहीं है ये लीजिए
दूसरी क्या चीज है पूरा का पूरा तू डू पास
करना तो ऐसे मत पास कर देना क्योंकि तू डू
क्या है ऑब्जेक्ट है तो ऑब्जेक्ट कैसे पास
करोगे ये लीजिए ऑब्जेक्ट हमने पास कर दिया
अब इस ऑब्जेक्ट के अंदर क्या है पहले तो
आप स्प्रेड कर लो जो एक्जिस्टिंग वालुज है
तो ये लो मैंने उसको तू डू बोल दिया ये सर
स्प्रेड कर लिया जो भी इसके अंदर वालुज थी
ठीक है अब उसके बाद क्या करना है मुझे
अपडेट किसको करना है सिर्फ एक प्रॉपर्टी
अपडेट करनी है कौन सी वाली ये तू डू
क्योंकि आईडी तो से रहने दो और उसके अलावा
उसका जो ट्रू जल है वो भी से रहने दो वो
क्यों छेड़ना है तो पहले पुरी की पुरी
वालुज स्प्रेड कर ली और सिर्फ एक
प्रॉपर्टी अपडेट कर ली जैसे की पहले कारी
थी ठीक है उसको बोला तू डू अब तू डू का
अंदर क्या वैल्यू ए गई आपके पास नया मेरे
पास ये तू डू मैसेज ए गया ठीक है मैसेज
कहां से आया ये स्टेटस आया
ठीक है ओके एक बार दोबारा बताता हूं की तू
क्या था अपडेट के टाइम आपको आइडिया दोनों
चाहिए था अब तू तू मुझे पता है ऐसा दिखता
है तो पहले स्प्रेड करना ही पड़ेगा इसको
ठीक है तो मैंने क्या बोला उसको की पहले
तो आप स्प्रेड हो जो एक-एक प्रॉपर्टी
इंडिविजुअल हो गई है मेरे पास उसमें से
सिर्फ एक प्रॉपर्टी को अपडेट कर रहा हूं
ताकि मेरे पास अपडेशन ए जाए एक बार मेरे
पास अपडेशन ए गया है अब उसको मेरे को
बताना पड़ेगा इस स्टूडियो एडिटर नहीं है
तो उसको जल कर देंगे हम की भाई होगा जब तक
कम होना था अब उसको जल कर दो तो सेट तू डू
एडिटेबल इसको कर दो जल
ठीक है अब एक और फंक्शनैलिटी हमारे पास है
यहां पर वह फंक्शनैलिटी क्या है आपको टॉगल
करना पड़ेगा इसको टॉगल कंप्लीट तो टॉगल
कंप्लीट की फंक्शनैलिटी तो हम ऑलरेडी लिख
चुके हैं कहां पर लिख चुके हैं ये अपने
app.js के अंदर जीएस के अंदर ये रही हमारी
टॉगल वाली फंक्शनैलिटी तो जो भी कम था वो
तो हम यही पे पूरा दिमाग अपना लगा चुके
हैं यहां पे क्या करना है अब इस फॉर्म के
अंदर आइटम के अंदर सॉरी की फंक्शनैलिटी को
बस कॉल करना तो ठीक है जी कर देते हैं ये
लीजिए कॉन्स्टंट और इसको क्या बोले तो अगर
कंप्लीट टॉगल कंप्लीट क्योंकि टॉगल
कंप्लीट तो हमारे पास यहां से ए रहा है तो
टॉगल कंप्लीटेड तो ए रहा है हमारे पास फिर
टॉगल
कंप्लीट एक्चुअली में आईडी
पहले मैं जा के देखा हूं एक्चुअली मैं
टॉगल कंप्लीटेड कहां से आया है
तो टॉगल कंप्लीट है हमारे पास यहां पे तो
पागल कंप्लीट ओके
है तो कांटेक्ट सर टॉगल कंप्लीट ठीक है
जी और हम बना रहे टॉगल कंप्लीटेड कुछ और
नाम रखना है तो रख दीजिएगा खुद ही दिक्कत
नहीं है उसके अंदर अगर आपको कन्फ्यूजन हो
रहा है तो यह मेथड है जो मैं कॉल करूंगा
उसे बटन पर क्लिक करने के बाद फिर क्या
करूंगा फिर मैं मेरा ये टॉगल कंप्लीट जो
मेरे पास कांटेक्ट आया है देखिए कहां से
कौन सी वाली है ये इंपॉर्टेंट है नाम उसका
क्या है उससे कोई फर्क नहीं पड़ता है ये
मेरा लोकल मेथड का नाम है यह मेरे
कांटेक्ट से जो भी ए रही वैल्यू उसका नाम
है ठीक है जी तो इसको क्या चाहिएगा टॉगल
करने के लिए आईडी तो लगेगा तो ये लो तू डू
जो आपने पास कर है इस पूरे कंपोनेंट के
अंदर प्राप्त किया है ना देखिए ऐसा नहीं
है कांटेक्ट अगर आप उसे कर रहे हैं तो ये
जो प्रॉप है ये पास करना पाप हो गया है
नहीं ऐसा नहीं होता है ठीक है तो ये आपने
आईडी पास कर दिया ठीक है अच्छा अब यहां पर
मैं आपको बाकी के कंपोनेंट को ओवरव्यू
देता हूं क्योंकि वो बड़ा इंटरेस्टिंग है
तो देखिए यह हमारा एक इंडिविजुअल कंपोनेंट
है
कंप्लीटेड वगैरा सब उसके बेसिस पर आपकी
स्ट्राइकिंग हो रही है तो जो बैकग्राउंड
कलर वगैरा देख रहे हो यह सब कस का कमल है
बेस्ट आईएसपी की आपका तू डू कंप्लीटेड है
की नहीं है क्योंकि एक्सेस आपके पास तो है
ही तो आप चेक कर सकते हो कभी भी उसके अंदर
डॉट कंप्लीट एड की वैल्यू ट्रू है या जल
है तो अपने वहीं से चेक करके ज्यादा कुछ
नहीं उसका बैकग्राउंड कलर चेंज कर दिया है
इधर ग्रीन कर दिया या फिर हमने उसको ये कर
दिया है और इसी तरह से आप उसको चेक करके
स्ट्राइक थ्रू वगैरा का भी ऑप्शंस और आप
दे सकते हो उसके बाद आपके पास इनपुट फील्ड
है ये हमारा इनपुट फील्ड चेक बॉक्स है तो
चेक है या नहीं है वो हमें देखना पड़ेगा
तू डू डॉट कंप्लीटेड से क्योंकि हर एक तू
डू के पास वो वैल्यू है ऑन चेंज पर क्या
करना पड़ेगा ये टॉगल कंप्लीट है तो ये जो
टॉगल कंप्लीटेड हमने यहां पे लिखा है इसको
कॉल कर रहे हैं बस और ये अपने आप
कॉन्टैक्ट्स लेक कम कर रहा है ठीक है उसके
बाद हमारे पास ये इनपुट फील्ड है हमारे
पास अभी इनपुट फील्ड रीड ओनली है या नहीं
है इस पे डिपेंड करेगा सर कम तो यहां पे
है ये अभी भी इनपुट फील्डिंग लेकिन ये रीड
ओनली है अभी अभी रीड ओनली कब चेंज होगा जब
ये तू डू वेजिटेबल होगा तो हमने क्या कर
ऑन चेंज पर यही पर एक सेट तू डू मैसेज
यहां पे कॉल कर दिया वालुज हमने ओके वो ले
लिए ठीक है और इसी तरह से हमारे पास ये
बाकी के भी कम हुए हैं बटन आपको कौन सा
वालुज शो करनी है एडिटेबल है नहीं है तो
हम कौन सा उसको आईकॉन शो करें एडिट वाला
आईकॉन शो करें या से वाला आईकॉन शो करें
तो एडिट टेबल पे भी कर रखा है बड़ा ही
बेसिक सा कम है और यहां पे हमने डिलीट कर
भी है डिलीट तू डू डायरेक्टली कॉल कर दे
और आईडी पे यहां पे दे दिए क्योंकि फालतू
एक और मेथड कॉल करते हैं वो सब करते हैं
तो बेसिक हमारे पास ये आइटम हो गया है ठीक
है जी अब क्या करना है अब हमें जाना है
हमारे अप डॉट जस्स के अंदर क्योंकि हमारे
कॉम्पोनेंट्स वगैरा रेडी हैं तो एक फाइनल
चीज जो हमें करनी है वो कुछ भी नहीं इतना
सा कम है बस की आप सिंपली यहां पे आई और
उन कॉम्पोनेंट्स को कॉल कर लीजिए अब देखिए
यहां पे कंपोनेंट कॉल करना तो बहुत इजी है
तो यहां पे हमने क्या कर सिर्फ अपना तू डू
का जो फॉर्म है वो यहां पे कॉल कर लीजिए
ये लीजिए 22 फॉर्म ए गया और सेल्फ
क्लोजिंग ठीक है तू डू फॉर्म ए गया है
हमारे पास में यहां पे एक्चुअली मैं
फंक्शनैलिटी थोड़ी सी इंटरेस्टिंग है
क्योंकि यहां पर क्या करना पड़ेगा जो आपके
पास कॉन्टैक्ट्स अप प्रोड्यूस ले थे उनके
ऊपर लूप लगाना पड़ेगा लूप के अंदर हम एक
तू डू आइटम को प्रॉप भी पास करेंगे और
उसको कॉल भी करेंगे ठीक है तो यहां पर हम
आते हैं अपनी जावास्क्रिप्ट स्टार्ट करते
हैं ये लीजिए और उसको बोला तू डू ये सारे
टोडोस हैं इस पे लगा दीजिए मैप और इस जो
भी आपको लगाना है यूजुअली मैं मैप उसे
करता हूं बट ऐसेट रीजन नहीं है बस आदत है
ठीक है अब इसके पास आपको क्या होगा हर एक
तू डू के पास ये जाएगा ठीक है जी और ये
हमारा ये वैल्यू ए गई ठीक है अब यहां पे
करली ब्रेसेज का ध्यान रखना क्योंकि करली
ब्रेसलेट लगे तो रिटर्न करना पड़ेगा
रिटर्न की शब्द उसे करना पड़ेगा अगर आपको
मां नहीं है तो आप यहां पर पेरैंथेसिस उसे
कर सकते हैं इसका मतलब ऑटो रिटर्न होता है
तो इसके अंदर हम यहां पे एड कर लेते हैं
वालुज तो सबसे पहले क्या कर यहां पे एक
देव हमने ये कॉल कर लिया ठीक है जी और इस
दीव का ये लीजिए हमने ये वैल्यू बना दी अब
क्योंकि मुझे पता है लूप के अंदर ये देव
रिपीट होगा और हर एक देव यूनिक है या नहीं
है ये कैसे पता लगाऊं तो उसे टाइम पे
हमारे पास कम आई है किस
और अगर की नहीं उसे करें होगा कुछ नहीं
वार्निंग देगा लेकिन परफॉर्मेंस आगे जाकर
इतनी ज्यादा डिग्रेड हो जाति है जिसकी कोई
हद नहीं क्योंकि रिएक्ट को पता ही नहीं ना
टॉम के अंदर कैसे चेंज करें हो सकता है
तीन टोडोस एक जैसे दिखते हो पर क्या
गारंटी की वो अलग ही है तो उसकी गारंटी की
हमें गारंटी की गारंटी लेनी पड़ती है वैसे
के लिए तो ये हमारे पास किस हो गई अब हमें
पता है की तू डू के अंदर डॉट आईडी अब आप
का रहे होंगे सर रेस ही तो है तो यहां पे
मैप के अंदर में इंडेक्स वैल्यू भी ले लेट
हूं और इंडेक्स को यहां पे देता हूं
इंडेक्स से इतना अच्छा परफॉर्मेंस नहीं
आता इनफैक्ट कई उसके ड्रॉबैक्स भी हैं
पिटफॉल्स भी हैं तो ज्यादातर आपको अच्छे
प्रोगामर यही एडवाइस देंगे की इंडेक्स को
अवॉइड करो अगर लास्ट ऑप्शन वही है तो करना
ही पड़ेगा फिर तो कोई कर ही नहीं है अगर
ऑप्शन ही नहीं है तो फिर तो क्या सही क्या
गलत कम तो करना ही है तो वहां पे इनके दे
दो पर अगर आपके पास ऑप्शन है की यूनिक
आईडी है या डेटाबेस से कुछ वालुज ए रही है
तो उसकी यूनिक इड ही लो क्योंकि क्या होगा
अगर आपके डेटाबेस में मां लो थर्ड वैल्यू
हो गई वहां से तो अरे तो रिस्ट्रक्चर कर
लगा और आपकी कीज को सबको रिस्ट्रक्चर करना
पड़ेगा और यूनिक आईडी है ना तो सिर्फ एक
वो एलिमेंट गायब हो जाएगा हां ये थोड़ा सा
एक शो होता है ठीक है तो ये हो गया हमारे
पास वालुज अब हम क्या करेंगे यहां पे
एक्चुअली में इस दीव के अंदर एक क्लास नाम
भी एड करनी पड़ेगी क्योंकि हां नोट्स में
जब ये प्रोजेक्ट बनाया था तो हेड कर दी
पड़ी थी वो एन कुछ नहीं ब्लू दास फूल हां
बस इतनी सी है ज्यादा नहीं करवाऊंगी आपसे
और यहां पर जो वैल्यू ए गई है मेरे पास
उसे वैल्यू के अंदर आप क्या करो अपना तू
डू आइटम कॉल कर लो तो ये रहा हमारा तू डू
आइटम और ये लीजिए उसकी वालुज सिर्फ इतने
से कम नहीं होगा क्योंकि उसको एक कंपोनेंट
क्रॉप पास करना होगा अब ऐसा नहीं है की
प्रॉपर पास करना ही प्रॉब्लम हो गई है तो
अगर ये चल रहा होगा हां जी चल तो रहा है
देखते हैं एक बार की कितने पे आए कितनी
एरर्स कारी हमने तो ये हमारा थोड़ा सा ये
विथ वगैरा ठीक है सॉर्ट कर देंगे इसको भी
तो अब यहां पे इसको बोलते हैं टेस्ट एड
करते हैं तो टेस्ट एड हो रहा है और रीलोड
कर रहे हैं तो वो यही पे र रहा है ये सबसे
इंपॉर्टेंट चेक है हमारे लोकल स्टोरेज के
लिए बाकी तो देखिए यूआई फैंसी नाइस अगर
आपका यू आई से नहीं दिखे रहा है ग रहा है
कोई दिक्कत वाली बात नहीं है युवा ही
थोड़ी ना मास्टरी करना है वो टैलेंट के
अंदर या किसी कस के कोर्स में करेंगे चेक
मार्क्स वगैरा इसमें आपका कुछ है नहीं
एक्चुअली मैं रोल क्योंकि ये सब हमने
डिजाइन करें हैं एडिट वगैरा फंक्शनैलिटी
जो है वो साड़ी की साड़ी हमने डिजाइन कारी
है टेस्ट वन वगैरा से करके यहां पे जो
साड़ी फंक्शनैलिटी वो हमने डिजाइन कारी है
यहां पे एन रिमूव फंक्शनैलिटी ये सब आपके
हो सकता है चल रही हो हो सकता है नहीं चल
रही हो उसके लिए क्या करना पड़ेगा
एक्चुअली मैं आपको जाके तू डू आइटम के
अंदर आपको थोड़ा सा डीबगिंग यहां पे करनी
पड़ेगी क्योंकि मां लीजिए मैंने यहां पे
टॉगल कंप्लीटेड रखा है एडिट तू डू रखा है
तो ये सारे के सारे एग्जैक्ट मैच कर रही
है या नहीं कर रही है तो मैं एक बार उसको
क्विकली चेक कर लेट हूं की अपनी मैच कर
रही है नहीं कर रही अगर कुछ ना में नमिंग
कन्वेंशन वो चेंज है तो उसके बड़े में देख
लेते हैं
हां जी तो वापस ए गए कुछ एक छोटे मोटे
बग्स थे उनको मैं यूजुअली वीडियो
रिकॉर्डिंग से हट्टा नहीं उल्टा बैठकें
आपको समझता हूं की कैसे मैंने वो बग्स
फाइंड आउट करें क्या-क्या इश्यूज थे तो
वही सब हम यहां पे देखेंगे तो हमारी
एप्लीकेशन ऑलमोस्ट यहां पर बन गई है तैयार
हो गई है अभी मैं आपको बताता हूं पूरा
इसका एनालाइज कैसे करेंगे डिब्बा कैसे
करेंगे क्योंकि आपके साथ भी हो गई ऐसा
थोड़ी ना एक बार में पुरी एप्लीकेशन बना
डॉग तो अभी एप्लीकेशन हमारी क नहीं कर रही
है इस मोड में वापस से जितनी पहले कम कर
रही थी तो सबसे पहले चीज जो मैंने यहां पे
अच्छी वो थी तू डू फॉर्म के अंदर नहीं
आइटम्स के अंदर मैंने एक गड़बड़ कर राखी
थी की यूज्ड तू डू के बाद में पेरैंथेसिस
लगाना भूल गया था तो आपने शायद ऑलरेडी देख
लिया होगा बट आप अगर नहीं लगाया तो आप भी
लगा दीजिएगा मोस्ट प्रोबेबली आप लोगों ने
ये सब देख लिया होगा एक जो छोटी सी
मिस्टेक मैंने कारी वो थी app.js के अंदर
यहां पे क्या है की जब हमें टॉगल कंप्लीट
ये कर रहे थे तो बाकी के फंक्शनैलिटी तो
हमारे चलने ग गई थी बट एडिट कर का रहे थे
टेस्ट कर का रहे थे टेस्ट वन वन तू थ्री
ये सब हमारा चल रहा था यहां पे से कर का
रहे थे डिलीट नहीं कर का रहे थे लेकिन यह
टॉगल फंक्शनैलिटी नहीं चल रहे थे तो सबसे
पहले मैंने टॉगल फंक्शनैलिटी के लिए तू डू
आईटी आइटम्स के अंदर गया यहां पे देखा
क्या यहां पे कुछ है तो एक्चुअली मैं यहां
फंक्शनैलिटी तो कुछ है ही नहीं बट मैंने
यहां पे फिर भी कौनसा लॉक करके देखें की
क्या ये मेथड रन कर रहे हैं और ऑब्वियस सी
बात है यहां पे रन कर रहे थे कौनसा लोग
हमेशा अच्छे होते हैं रन करने के लिए उसके
बाद में फिर gayab.js में की शायद यहां पे
कुछ इश्यूज हैं तो जब इस कोड को थोड़ा सा
घर के देखा 5-10 मिनट यहां लगा है तो मुझे
पता लगा की यहां पे हम क्या कर रहे हैं
यहां पे मैंने कौन सा लॉक करें ताकि पता
लगे की हम यहां तक तो पहुंच रहे हैं ना
उसे इस स्टेप तक तो ए रहे हैं उसके बाद
सेट तू डू हमने कॉल किया प्रीवियस वैल्यू
साड़ी रिलीज डेट से प्रीवियस वालुज पे सब
पे मैप लगाया हर एक वालुज को प्रोड्यूस
किया और फिर थोड़ी डर बाद ध्यान गया की
pref.edu के अंदर मेरे को आईडी को कंपेयर
करना है तो शायद लिखने लिखने या समझते हुए
मैं ये छोटा सा पार्ट भूल गया था की डॉट
आईडी को कंपेयर करना आईडी से पूरे उसे
ऑब्जेक्ट को नहीं कंपेयर करना वरना वो
ऑब्जेक्ट कभी मैच ही नहीं करेगा फिर तो अब
बस इतना सा छोटा सा यहां एक मिस्टेक था ये
जैसे मैंने से किया है तो ऑब्वियस सी बात
है अब हमारा टॉगल फंक्शनैलिटी चलने ग गया
अब बेस्ट बात यह है की आप राइट क्लिक करके
कभी भी आप इसको इंस्पेक्टर कर सकते हैं और
इसको आप चेक कर सकते हैं अपने एप्लीकेशन
में जाके और स्टोरेज आपको यहां मिलता है
लोकल स्टोरेज के अंदर स्टोरेज मिलेगा और
ये आपको यहां पे टोडोस जो हमने की राखी थी
ये रही साड़ी इड तो जैसे से आप यहां पर
रखते जाएंगे ऑटोमेटिक के लिए अपडेट होती
जाएगी तो इसको बोलते हैं दान विद कांटेक्ट
एपी तो आई थिंक अब आपको थोड़ा सा मजा आया
होगा की हां इतना बड़ा डिटेल लेक्चर तो
यहां पे देखिए आप इसको सिलेक्ट कर सकते
हैं और जैसे सिलेक्ट करेंगे तो आप यहां पे
इसको ड्रॉप डॉ में ओपन कर सकते हैं की हर
एक आईडी स्टूडियो इसी तरह से तो आईडी से
हमारी टाइम के हिसाब से बन रही है कंप्लीट
फल से यहां पे है दान विद कांटेक्ट जैसे
आप इसको टॉगल करते हो तो ऑब्वियस सी बात
है रिफ्रेश हो गया है अब यहां पे वैल्यू
ट्रू ए गई है और ये वैल्यू इस तरह से
हमारे पास ए रही है आप चाहें तो उसको
डिलीट कर दीजिए की अब ये वाला पूरा का
पूरा है मैं इसको डिलीट करना चाहता हूं तो
जैसे ही आप डिलीट करेंगे और रिफ्रेश
करेंगे
अरे बन गया
चिंता मत कीजिए तो यह आपने एक बेसिक
एप्लीकेशन अभी बनाई है जी तरह से कम होता
है अब हम एप्लीकेशन का क्या करेंगे सबसे
पहले तो इसको पुश करेंगे क्योंकि हमारी
10th एप्लीकेशन है आपको अगर बोले कितने
प्रोजेक्ट्स बनाया है तो 10 तो आपने बना
चुके हैं लेकिन अभी तो हम शुरू हुए हैं
अभी तो और कुछ बहुत सारे प्रोजेक्ट बाकी
हैं अभी तो बहुत सिखाएंगे पूरा रिएक्ट
इंडेक्स सिखाएंगे आपको चिंता मत कीजिए और
ये हमारा बेसिक हो गया है इसको बोल देते
हैं आ दान विद अब हो गए हैं एक्चुअली में
दंड भेद कांटेक्ट और लोकल स्टोरेज
यह लीजिए हम कमेंट कर देते हैं
स्टेज तो कुछ किया ही नहीं यह लीजिए स्टेज
कर दिया कमेंट कर दिया और इसको भी पुश कर
देते हैं ताकि आपको सर कोड मिल जाए तो
एक्जेक्टली सर कोड अब आपके पास में है तो
यह हमारा हो गया बेसिक तो अब सबसे जरूरी
बात पहले तो यह बताइए की मजा आया की नहीं
आया हां जी अगर आप ये कहेंगे की देखिए
परिसर था सर थोड़ा सा देखिए लेक्चरर्स
होते ही इसलिए अगर लेक्चरर्स में सिर्फ
आपको वही सीखने को मिल रहा है जो आपको
ऑलरेडी आता था तो लेक्चर बहुत इजी लगेगा
लेकिन लेक्चर का एक्चुअली मैं कम यह है की
आपको थोड़ा सा अनकंफर्ट जॉन में डालें की
हां 80% मुझे आता था 20% में थोड़ी सी
प्रॉब्लम हुई और वो प्रॉब्लम अच्छी बात है
ठीक है तो वीडियो को एक बार देखने में
नहीं होगा कम स्पेशली कांटेक्ट अप जो हमें
थोड़ा सा और कंपलेक्सिटी बधाई है उसको दो
या तीन बार आपको देखना पड़ेगा थोड़ी सी
एफर्ट आपकी तरफ से भी जान पढ़ेंगे इस पूरे
एप्लीकेशन को सिर्फ आप नोट्स के थ्रू आप
बिना मेरा वीडियो के हेल्प लिए आप पूरा
बनाने की कोशिश करेगा एक बार में नहीं
बनेगा दो बार तीन बार मैं बनेगा थोड़ा सा
हेल्प लेनी पड़ेगी फिर दूसरी बार बनाया तो
इस तरह से आपको भी को थ्रू करना पड़ेगा
इतना अच्छा स्ट्रक्चर ऑर्गेनाइजर कंटेंट
आपको मिनिमम से मिनिमम 10 से 15000 के
नीचे तो नहीं मिलेगा तो प्लीज वीडियो को
शेर कर दीजिएगा सब्सक्राइब कर दीजिएगा अभी
तक नहीं किया है तो और दोस्तों में भी शेर
कर दीजिएगा ताकि चैनल पर हमें मोटिवेशन है
ठीक है चलेगा चलिए मिलते हैं आपसे अगली
चाय पे

```

 in this lecture, we will build a project, and learn about context api and local storage

First, lets see what we are building:

 We will build a To-do app
 the data is stored in local storage


now, lets setup project first.
build a vite + react project named "10todocontextLocal" and integrate Tailwind

create a file in src/context/todoContext.js:
```
import { createContext, useContext } from "react";

export const TodoContext = createContext({
  todos: [
    {
      id: 1,
      todo: " Todo msg",
      completed: false,
    },
  ],
  addTodo: (todo) => {},
  updateTodo: (id, todo) => {},
  deleteTodo: (id) => {},
  toggleComplete: (id) => {},
});

export const useTodo = () => {
  return useContext(TodoContext);
};

export const TodoProvider = TodoContext.Provider;

```


create a file in src/context/todoContext.js:
```
export { TodoContext, TodoProvider, useTodo } from "./TodoContext";

```

update App.jsx:
```
import { useState, useEffect } from 'react'
import {TodoProvider} from "./contexts"

import './App.css'

function App() {
  const [todos, setTodos] = useState([]);

  const addTodo = (todo) => {
    setTodos((prev) => [{ id: Date.now(), ...todo }, ...prev])
  }

  const updateTodo = (id, todo) => {
    setTodos((prev) => prev.map((prevTodo) => (prevTodo.id === id ? todo : prevTodo)))
  }

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const toggleComplete = (id) => {
    //console.log(id);
    setTodos((prev) =>
      prev.map((prevTodo) =>
        prevTodo.id === id ? {
          ...prevTodo,
          completed: !prevTodo.completed
        } : prevTodo))
  }


  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem("todos"))

    if (todos && todos.length > 0) {
      setTodos(todos)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])


  return (
    <TodoProvider value={{ todos, addTodo, updateTodo , deleteTodo, toggleComplete}}>
      <div className="bg-[#172842] min-h-screen py-8">
        <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
          <h1 className="text-2xl font-bold text-center mb-8 mt-2">Manage Your Todos</h1>
          <div className="mb-4">
            {/* Todo form goes here */}
          </div>
          <div className="flex flex-wrap gap-y-3">
            {/*Loop and Add TodoItem here */}
          </div>
        </div>
      </div>
    </TodoProvider>
  )
}

export default App
```


now, we will create components.

make a new file
src/components/TodoForm.jsx:
```
import React, { useState } from 'react'
import { useTodo } from '../contexts/TodoContext';

function TodoForm() {
    const [todo, setTodo] = useState("")
    const { addTodo } = useTodo()

    const add = (e) => {
        e.preventDefault()

        if (!todo) return

        addTodo({ todo, completed: false })
        setTodo("")
    }

    return (
        <form onSubmit={add} className="flex">
            <input
                type="text"
                placeholder="Write Todo..."
                className="w-full border border-black/10 rounded-l-lg px-3 outline-none duration-150 bg-white/20 py-1.5"
                value={todo}
                onChange={(e) => setTodo(e.target.value)}
            />
            <button type="submit" className="rounded-r-lg px-3 py-1 bg-green-600 text-white shrink-0">
                Add
            </button>
        </form>
    );
}

export default TodoForm;
```

make a new file
src/components/TodoItem.jsx:
```
import React, { useState } from 'react'
import { useTodo } from '../contexts/TodoContext';

function TodoItem({ todo }) {
    const [isTodoEditable, setIsTodoEditable] = useState(false)
    const [todoMsg, setTodoMsg] = useState(todo.todo)
    const { updateTodo, deleteTodo, toggleComplete } = useTodo()

    const editTodo = () => {
        updateTodo(todo.id, { ...todo, todo: todoMsg })
        setIsTodoEditable(false)
    }
    const toggleCompleted = () => {
        //console.log(todo.id);
        toggleComplete(todo.id)
    }

    return (
        <div
            className={`flex border border-black/10 rounded-lg px-3 py-1.5 gap-x-3 shadow-sm shadow-white/50 duration-300  text-black ${todo.completed ? "bg-[#c6e9a7]" : "bg-[#ccbed7]"
                }`}
        >
            <input
                type="checkbox"
                className="cursor-pointer"
                checked={todo.completed}
                onChange={toggleCompleted}
            />
            <input
                type="text"
                className={`border outline-none w-full bg-transparent rounded-lg ${isTodoEditable ? "border-black/10 px-2" : "border-transparent"
                    } ${todo.completed ? "line-through" : ""}`}
                value={todoMsg}
                onChange={(e) => setTodoMsg(e.target.value)}
                readOnly={!isTodoEditable}
            />
            {/* Edit, Save Button */}
            <button
                className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0 disabled:opacity-50"
                onClick={() => {
                    if (todo.completed) return;

                    if (isTodoEditable) {
                        editTodo();
                    } else setIsTodoEditable((prev) => !prev);
                }}
                disabled={todo.completed}
            >
                {isTodoEditable ? "📁" : "✏️"}
            </button>
            {/* Delete Todo Button */}
            <button
                className="inline-flex w-8 h-8 rounded-lg text-sm border border-black/10 justify-center items-center bg-gray-50 hover:bg-gray-100 shrink-0"
                onClick={() => deleteTodo(todo.id)}
            >
                ❌
            </button>
        </div>
    );
}

export default TodoItem;
```

make a new file
src/components/index.js:
```
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";

export {TodoForm, TodoItem}
```


Update App.jsx:
```
import { useState, useEffect } from 'react'
import { TodoProvider } from './contexts'
import './App.css'
import TodoForm from './components/TodoForm'
import TodoItem from './components/TodoItem'

function App() {
  const [todos, setTodos] = useState([])

  const addTodo = (todo) => {
    setTodos((prev) => [{ id: Date.now(), ...todo }, ...prev])
  }

  const updateTodo = (id, todo) => {
    setTodos((prev) => prev.map((prevTodo) => (prevTodo.id === id ? todo : prevTodo)))


  }

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const toggleComplete = (id) => {
    //console.log(id);
    setTodos((prev) =>
      prev.map((prevTodo) =>
        prevTodo.id === id ? {
          ...prevTodo,
          completed: !prevTodo.completed
        } : prevTodo))
  }

  useEffect(() => {
    const todos = JSON.parse(localStorage.getItem("todos"))

    if (todos && todos.length > 0) {
      setTodos(todos)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])




  return (
    <TodoProvider value={{ todos, addTodo, updateTodo, deleteTodo, toggleComplete }}>
      <div className="bg-[#172842] min-h-screen py-8">
        <div className="w-full max-w-2xl mx-auto shadow-md rounded-lg px-4 py-3 text-white">
          <h1 className="text-2xl font-bold text-center mb-8 mt-2">Manage Your Todos</h1>
          <div className="mb-4">
            {/* Todo form goes here */}
            <TodoForm />
          </div>
          <div className="flex flex-wrap gap-y-3">
            {/*Loop and Add TodoItem here */}
            {todos.map((todo) => (
              <div key={todo.id}
                className='w-full'
              >
                <TodoItem todo={todo} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </TodoProvider>
  )
}

export default App
```



 -->
