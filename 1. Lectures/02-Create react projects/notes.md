# React – Lecture Notes
## Creating & Cleaning a React Project

---

## Requirements

- VS Code Editor
- Node.js
- Browser

---

## Key Concepts

- **React Documentation:** [react.dev](https://react.dev)
- **Bundlers:** Vite, Parcel
- **React + React DOM** → Web Applications
- **React + React Native** → Mobile Apps
- **npm** – Node Package Manager (installs packages)
- **npx** – Executes packages without installing them globally

---

## Method 1: Create React App (CRA)

### Setup

```bash
npx create-react-app 01basicreact
```

> Note: This method is **time-consuming** and generates a **bulkier** project.

---

### Understanding `package.json`

Contains:
- Project name, version
- **Dependencies:** `react`, `react-dom`
- **Testing libraries:** `jest-dom`, `react`, `user-event`
- `react-scripts` – scripts runner for CRA
- `web-vitals` – for performance measurement
- **Browser list** – defines target browsers for linting/compilation

### Scripts in `package.json`

| Script | Purpose |
|---|---|
| `start` | Start project in development environment |
| `build` | Generate optimized HTML, CSS, JS for production |
| `test` | Run test cases |
| `eject` | Expose internal configuration (irreversible) |

---

### Running the Project

```bash
npm run start
```

- `public/index.html` contains just:
  ```html
  <div id="root"></div>
  ```
  (rest are comments)
- React mounts the entire app inside this `#root` div.

---

### Building for Production

```bash
npm run build
```

- Generates a `build/` folder containing: static assets, JS bundles, CSS
- **Important:** The `build/` folder is what gets served to users in production — **not** the `src/` folder.

---

## Method 2: Vite (Recommended)

### Setup

```bash
npm create vite@latest
cd 01vitereact
npm install
npm run dev
```

- **Vite** is faster and produces a leaner project than CRA.
- Official docs: [vite.dev](https://vite.dev)

---

## Cleaning the CRA Project (`01basicreact`)

### Files to Delete

```
setupTest.js
reportWebVitals.js
logo.svg
App.test.js
App.css
index.css
```

### Remaining files in `src/`
- `index.js`
- `App.js`

### Clean `App.js`

```js
function App() {
  return (
    <h1>Chai aur React</h1>
  );
}

export default App;
```

### Clean `index.js`

```js
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Run & Verify

```bash
cd 01basicreact
npm run start
```

**Output on screen:** `Chai aur React`

---

## Cleaning the Vite Project (`01vitereact`)

### Files/Folders to Delete

```
assets/
App.css
index.css
```

### Remaining files in `src/`
- `main.jsx`
- `App.jsx`

> **Note:** Vite uses `.jsx` extension instead of `.js`

### Clean `main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### Clean `App.jsx`

```jsx
function App() {
  return (
    <h1>Chai aur React with Vite | Prabhansh Tiwari</h1>
  )
}

export default App
```

### Run & Verify

```bash
npm run dev
```

**Output on screen:** `Chai aur React with Vite | Prabhansh Tiwari`

---

## CRA vs Vite – Quick Comparison

| Feature | CRA | Vite |
|---|---|---|
| Setup speed | Slow | Fast |
| Project size | Bulkier | Leaner |
| Entry file | `index.js` | `main.jsx` |
| Component extension | `.js` | `.jsx` |
| Dev command | `npm run start` | `npm run dev` |
| Build folder | `build/` | `dist/` |

---

## Key Takeaways

- Most day-to-day work happens inside the **`src/`** folder.
- The **`build/`** (CRA) or **`dist/`** (Vite) folder is served in production.
- CRA and Vite both mount the React app into `<div id="root">` in `index.html`.
- Vite is the **modern, preferred** approach due to speed and simplicity.
- Always clean up boilerplate files when starting fresh to keep the project minimal.

<!-- 
In this lecture, we will create a small project

### Requirements
- V S Code Editor
- NodeJS
- Browser

React Documentation: react.dev
How to react these docs?

Vite , Parcel: Bundler

React + React DOM -> Web Applications
React + React Native -> Mobile Apps

npm & npx

How to create react project?
Method 1:

```
npx create-react-app 01basicreact
```
This is time taking...

We understand about the project from package.json file.
Here, we see the project name, version, depenndencies, scripts etc.
We have react, react dom.
We also have testing libraries like jest-dom, react, user-event
We also have react scripts and web vitals.
web vitals is concerned about performance.

we also have some scripts.
start: to start project in development environment
build: generate html, css , js, before production
test: to run test cases
eject: 

linting process
we also have browser list

How to start project:
```
npm run start
```

We just have 
```
<div id="root"></div>
```
other are comments..

Then,
```
npm run build
```
now, we have a folder named "build"
this build folder has static assets, js, css etc

note: build folder is served in the production to the user not src folder

This is done using create-react-app
This way of creating project is timetaking and bulkier.


Method 2: (using vite/parcel bundler)
We will use vite to create react app.

Vite: https://vite.dev/

```
npm create vite@latest
```
cd 01vitereact
npm install
npm run dev

Till now, we have created react app using both methods.

most of the time, we work with src folder


Now, lets discuss on project created using CRA
in 01basicreact

first, we will delete some files

setupTest.js
reportWebVitals.js
logo.svg
App.test.js
App.css
index.css

Now, src has two files
index.js and App.js

Now, we clear out some code from both the files.

App.js
```
function App() {
  return (
    <h1>Chai aur React</h1>
  );
}

export default App;
```

index.js:
```
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Check if the project is running
```
cd 01basicreact
npm run start
```

Now, we can see "Chai aur React" on the screen.

This is how the project made using create-react-appp works



Now, lets discuss on project created using vite
in 01vitereact,

first, we will delete some files

assets/
App.css
index.css

Now, src has two files
main.jsx and App.jsx

Now, we clear out some code from both the files.


main.jsx:
```
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

App.jsx:
```
function App() {
  
  return (
    <h1>Chai aur React with Vite | Prabhansh Tiwari</h1>
  )
}

export default App
```
Now, we can see "Chai aur React with Vite | Prabhansh Tiwari" on the screen.

This is how the project made using create-react-appp works

Now, run
```
npm run dev
```


make notes, never miss any point
now, we learnt to create react project and to clean the project





 -->
