# Props & Tailwind CSS with React — Notes
> Topics: React Props, Tailwind CSS setup with Vite, Reusable Components

---

## 1. Tailwind CSS + React (Vite) Setup

### The Problem
Dependency conflict between:
- `vite`
- `@vitejs/plugin-react`
- `@tailwindcss/vite`

Different packages require different Vite versions → causes **ERESOLVE error** during install.

---

### Step-by-Step Setup (Error-Free)

**Step 1 — Create Vite project**
```bash
npm create vite@latest tailwind-react
```
Select: **React → JavaScript**

**Step 2 — Enter project folder**
```bash
cd tailwind-react
```

**Step 3 — Install base dependencies**
```bash
npm install
```

**Step 4 — Fix to compatible versions**
```bash
npm install vite@7 @vitejs/plugin-react@5
```

**Step 5 — Install Tailwind**
```bash
npm install tailwindcss @tailwindcss/vite
```

**Step 6 — Configure Vite**

`vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Step 7 — Add Tailwind import**

`src/index.css`:
```css
@import "tailwindcss";
```

**Step 8 — Run the project**
```bash
npm run dev
```

---

### Useful Tools
- Install **React Snippet** extension in VS Code for faster component boilerplate.
- Get ready-made components from **[devui.io](https://devui.io)** — copy, paste, customize with props.

---

## 2. Props in React

### What Are Props?
- **Props** = short for *properties*.
- Makes components **reusable** — same component, different data.
- Every component automatically has access to a `props` object.
- By default, `props` is an **empty object** `{}` if nothing is passed.
- Used to **pass values from one component to another** (parent → child).

### Debugging Props
```javascript
console.log(props);           // logs the entire props object
console.log(props.username);  // logs a specific prop value
```

---

### How to Use Props

**Method 1 — Access via `props` object**
```javascript
function Card(props) {
  return <h1>{props.username}</h1>;
}
```

**Method 2 — Destructure directly in function signature (preferred)**
```javascript
function Card({ username, btnText }) {
  return <h1>{username}</h1>;
}
```

---

### Default Prop Values
- Set a default value in the destructured parameter.
- Default is used when the parent does **not** pass that prop.

```javascript
function Card({ username, btnText = "Click here" }) {
  // btnText will be "Click here" if not passed by parent
}
```

This is just standard JavaScript default parameter syntax applied to React.

---

### Passing Props from Parent

`App.jsx`:
```jsx
import Card from "./components/Card";

function App() {
  return (
    <>
      <h1 className='bg-green-400 text-black p-4 rounded-xl mb-4 mx-auto my-10 text-center text-5xl'>
        Tailwind Test
      </h1>

      <Card username="Owl-1" btnText="click me" />
      <Card username="Owl-2" btnText="Visit me" />
    </>
  );
}

export default App;
```

> Same `Card` component is reused with different `username` and `btnText` values — this is the power of props.

---

### Receiving & Using Props in Child

`Card.jsx`:
```jsx
import React from "react";

function Card({ username, btnText = "Click here" }) {
    console.log(username);

    return (
        <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 mx-auto my-1">
            <a href="#">
                <img
                    className="rounded-t-lg"
                    src="https://images.pexels.com/photos/3532552/pexels-photo-3532552.jpeg?auto=compress&cs=tinysrgb&w=400&lazy=load"
                    alt=""
                />
            </a>
            <div className="p-5">
                <a href="#">
                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {username}
                    </h5>
                </a>
                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                    Here are the biggest enterprise technology acquisitions of 2021 so
                    far, in reverse chronological order.
                </p>
                <a
                    href="#"
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                    {btnText}
                </a>
            </div>
        </div>
    );
}

export default Card;
```

---

## 3. Props — Key Takeaways

| Concept | Detail |
|---|---|
| What are props? | Data passed from parent to child component |
| Default value | Set in destructured params: `{ btnText = "Click here" }` |
| Access method | Destructure in function signature — cleaner than `props.x` |
| Use in JSX | Use like a variable: `{username}`, `{btnText}` |
| Props object default | Empty object `{}` if no props are passed |
| Why props? | Makes the same component reusable with different data |

---


<!-- 
In this lecture, we will get to know about props, and as a bonus we will also see tailwindcss
After, this react foundation is over.


How to configure Tailwind with React?
npm create vite@latest

project name: 03-tailwindprops
### React + Tailwind Setup (Short Notes)

**Problem Cause**
Dependency conflict between:

* `vite`
* `@vitejs/plugin-react`
* `@tailwindcss/vite`

Different packages required different **Vite versions**, causing **ERESOLVE error**.

---

### Steps to Avoid the Error

**1️⃣ Create project**

```bash
npm create vite@latest tailwind-react
```

Select: **React → JavaScript**

**2️⃣ Go to project folder**

```bash
cd tailwind-react
```

**3️⃣ Install dependencies**

```bash
npm install
```

**4️⃣ Fix compatible versions**

```bash
npm install vite@7 @vitejs/plugin-react@5
```

**5️⃣ Install Tailwind**

```bash
npm install tailwindcss @tailwindcss/vite
```

---

### Configure Vite

`vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

---

### Add Tailwind

`src/index.css`

```css
@import "tailwindcss";
```

---

### Run project

```bash
npm run dev
```

---

install react snippt extension.


Take components from "devui.io"

Now, props
- it makes the component reusable.
- every component has the access of props.
- props gives an empty object 
- used to pass values from one component to another
- console.loh(props)

how to use values from props?
- console.log(props.username);
we directly destructure it 
function Card({ username, btnText = "Click here" }) {
- use it like we use variables {username}

we need to pass props and handle it and use it as a variable whereever needed

if no one passes prop value and use default value
function Card({ username, btnText = "Click here" }) {
this is basics of function.

App.jsx:
```

import Card from "./components/Card";

function App() {
  
  return (
    <>
      <h1 className='bg-green-400 text-black p-4 rounded-xl mb-4 mx-auto my-10 text-center text-5xl'>Tailwind Test</h1>

      <Card username="Owl-1" btnText="click me" />
      <Card username="Owl-2" btnText="Visit me" />

    </>
  )
}

export default App
```

Card.jsx:
```
import React from "react";

function Card({ username, btnText = "Click here" }) {
    console.log(username);


    return (
        <>


            <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 mx-auto my-1">
                <a href="#">
                    <img
                        className="rounded-t-lg"
                        src="https://images.pexels.com/photos/3532552/pexels-photo-3532552.jpeg?auto=compress&cs=tinysrgb&w=400&lazy=load"
                        alt=""
                    />
                </a>
                <div className="p-5">
                    <a href="#">
                        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {username}
                        </h5>
                    </a>
                    <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                        Here are the biggest enterprise technology acquisitions of 2021 so
                        far, in reverse chronological order.
                    </p>
                    <a
                        href="#"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                        {btnText}
                        <svg
                            className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 10"
                        >

                        </svg>
                    </a>
                </div>
            </div>
        </>
    );
}

export default Card;
```
 -->
