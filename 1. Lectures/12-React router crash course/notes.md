# React Router DOM — Detailed Notes
> Based on Chai aur React playlist by Chai Code (YouTube)

---

## Table of Contents
1. [What is React Router DOM?](#1-what-is-react-router-dom)
2. [Project Setup](#2-project-setup)
3. [Building Components](#3-building-components)
4. [Installing React Router DOM](#4-installing-react-router-dom)
5. [Layout Component & Outlet](#5-layout-component--outlet)
6. [Creating a Router — Two Ways](#6-creating-a-router--two-ways)
7. [RouterProvider — Mounting the Router](#7-routerprovider--mounting-the-router)
8. [Link vs Anchor Tag](#8-link-vs-anchor-tag)
9. [NavLink vs Link](#9-navlink-vs-link)
10. [Dynamic Routes with useParams](#10-dynamic-routes-with-useparams)
11. [Data Loading with loader & useLoaderData](#11-data-loading-with-loader--useloaderdata)
12. [Full Code Summary](#12-full-code-summary)
13. [Key Concepts Cheatsheet](#13-key-concepts-cheatsheet)

---

## 1. What is React Router DOM?

React Router DOM is a **client-side routing library** for React applications. It allows you to create multi-page experiences in a Single Page Application (SPA) without actual full-page reloads.

### Important Points:
- React Router DOM is **NOT** a built-in/core part of React.
- It is a **third-party library** made by Remix (now part of Shopify ecosystem).
- Official Documentation: [reactrouter.com](https://reactrouter.com)
- It intercepts the browser's URL changes and renders the appropriate components accordingly.

### Why do we need it?
In a traditional multi-page website, clicking a link causes the browser to fetch a new HTML page from the server. React is a SPA framework — there is only one `index.html`. React Router DOM handles URL changes on the client side, swapping out components without reloading the page, making navigation fast and smooth.

---

## 2. Project Setup

### Create Vite Project
```bash
npm create vite@latest 07reactRouter -- --template react
cd 07reactRouter
npm install
```

### Integrate Tailwind CSS
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

In `tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

In `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 3. Building Components

Before adding routing logic, we first build out the UI components. This is a good practice — build the UI first, then wire up routing.

### Folder Structure
```
src/
├── components/
│   ├── header/
│   │   └── Header.jsx
│   ├── footer/
│   │   └── Footer.jsx
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Contact.jsx
│   ├── User.jsx
│   ├── Github.jsx
│   └── Layout.jsx
├── main.jsx
└── App.jsx (may not be needed if Layout handles everything)
```

### Header.jsx
```jsx
import React from 'react'
import { Link, NavLink } from 'react-router-dom'

function Header() {
  return (
    <header className='shadow sticky z-50 top-0'>
      <nav className='bg-white border-gray-200 px-4 lg:px-6 py-2.5'>
        <div className='flex flex-wrap justify-between items-center mx-auto max-w-screen-xl'>
          <Link to="/">
            <img
              src="https://alexharkness.com/wp-content/uploads/2020/06/logo-2.png"
              className='mr-3 h-12'
              alt='Logo'
            />
          </Link>
          <div className='flex items-center lg:order-2'>
            <Link
              to="#"
              className='text-gray-800 hover:bg-gray-50 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2'
            >
              Log in
            </Link>
            <Link
              to="#"
              className='text-white bg-orange-700 hover:bg-orange-800 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2'
            >
              Get Started
            </Link>
          </div>
          <div className='hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1'>
            <ul className='flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0'>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? 'text-orange-700' : 'text-gray-700'} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                  }
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? 'text-orange-700' : 'text-gray-700'} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                  }
                >
                  About
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? 'text-orange-700' : 'text-gray-700'} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                  }
                >
                  Contact
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/github"
                  className={({ isActive }) =>
                    `block py-2 pr-4 pl-3 duration-200 ${isActive ? 'text-orange-700' : 'text-gray-700'} border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-orange-700 lg:p-0`
                  }
                >
                  Github
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
```

### Footer.jsx
```jsx
import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className='bg-white m-4'>
      <div className='w-full max-w-screen-xl mx-auto p-4 md:py-8'>
        <div className='sm:flex sm:items-center sm:justify-between'>
          <Link to="/" className='flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse'>
            <img
              src="https://alexharkness.com/wp-content/uploads/2020/06/logo-2.png"
              className='h-8'
              alt='Logo'
            />
          </Link>
          <ul className='flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0'>
            <li><Link to="/about" className='hover:underline me-4 md:me-6'>About</Link></li>
            <li><Link to="#" className='hover:underline me-4 md:me-6'>Privacy Policy</Link></li>
            <li><Link to="#" className='hover:underline me-4 md:me-6'>Licensing</Link></li>
            <li><Link to="/contact" className='hover:underline'>Contact</Link></li>
          </ul>
        </div>
        <hr className='my-6 border-gray-200 sm:mx-auto lg:my-8' />
        <span className='block text-sm text-gray-500 sm:text-center'>
          © 2023 <Link to="/" className='hover:underline'>Chai aur React™</Link>. All Rights Reserved.
        </span>
      </div>
    </footer>
  )
}

export default Footer
```

### Home.jsx
```jsx
import React from 'react'

function Home() {
  return (
    <div className='w-full'>
      <h1 className='text-3xl font-bold text-center mt-10'>Home Page</h1>
    </div>
  )
}

export default Home
```

### About.jsx
```jsx
import React from 'react'

function About() {
  return (
    <div className='w-full'>
      <h1 className='text-3xl font-bold text-center mt-10'>About Page</h1>
    </div>
  )
}

export default About
```

### Contact.jsx
```jsx
import React from 'react'

function Contact() {
  return (
    <div className='w-full'>
      <h1 className='text-3xl font-bold text-center mt-10'>Contact Page</h1>
    </div>
  )
}

export default Contact
```

---

## 4. Installing React Router DOM

```bash
npm install react-router-dom
```

This installs the latest version of React Router DOM. After installing, you can import components from `react-router-dom`:

```js
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements, Link, NavLink, Outlet, useParams, useLoaderData } from 'react-router-dom'
```

---

## 5. Layout Component & Outlet

### What is a Layout?

A **Layout** is a wrapper component that holds the parts of the page that remain **constant** across multiple routes — like the Header and Footer. Only the content in the middle changes based on the URL.

### The `<Outlet />` Component

`<Outlet />` is a special component from `react-router-dom` that acts as a **placeholder**. React Router replaces `<Outlet />` with the component matched by the current route.

Think of it as a "slot" — the Header and Footer stay fixed, and the Outlet slot gets filled with the correct page component.

```
URL: /about
┌─────────────────┐
│     Header      │  ← always rendered
├─────────────────┤
│   <Outlet />    │  ← replaced by <About /> 
│   (About Page)  │
├─────────────────┤
│     Footer      │  ← always rendered
└─────────────────┘
```

### Layout.jsx
```jsx
import React from 'react'
import Header from './components/header/Header'
import Footer from './components/footer/Footer'
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <>
      <Header />
      <Outlet />   {/* This is where child route components render */}
      <Footer />
    </>
  )
}

export default Layout
```

**How it works:**
- When the user visits `/`, the `<Home />` component fills the `<Outlet />`
- When the user visits `/about`, the `<About />` component fills the `<Outlet />`
- Header and Footer are always visible regardless of the route

---

## 6. Creating a Router — Two Ways

React Router provides two syntaxes to define your route structure.

### Method 1: Object/Array Syntax (JSON-style)

This is the more "JavaScript" way. You define routes as an array of objects.

```jsx
import { createBrowserRouter } from 'react-router-dom'
import Layout from './Layout'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'

const router = createBrowserRouter([
  {
    path: "/",          // root path
    element: <Layout />, // render Layout for root
    children: [          // nested routes inside Layout
      {
        path: "",        // "" means index (default child of "/")
        element: <Home />
      },
      {
        path: "about",   // maps to "/about"
        element: <About />
      },
      {
        path: "contact", // maps to "/contact"
        element: <Contact />
      }
    ]
  }
])
```

**Key notes:**
- `path: "/"` is the root. The Layout component wraps all children.
- `path: ""` (empty string) renders as the **index route** at `/`.
- `children` is an array of nested route objects rendered inside `<Outlet />`.

---

### Method 2: JSX Syntax using `createRoutesFromElements`

This is a more **JSX-friendly** way. It looks similar to the old `<Switch>/<Route>` pattern and is more readable for developers coming from React Router v5.

```jsx
import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import User from './components/User'
import Github, { githubInfoLoader } from './components/Github'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="user/:userid" element={<User />} />
      <Route
        path="github"
        element={<Github />}
        loader={githubInfoLoader}   // loader fetches data before the component renders
      />
    </Route>
  )
)
```

**How `createRoutesFromElements` works:**
- It converts JSX `<Route>` elements into the same object format as Method 1 internally.
- Both methods produce the same result — it's just a matter of preference.

**Which one to use?**
- Use **Method 2 (JSX)** if you prefer a cleaner, more readable structure (recommended for beginners).
- Use **Method 1 (Object)** if you prefer programmatic/dynamic route generation.

---

## 7. RouterProvider — Mounting the Router

Once you've created your router, you need to tell React to use it. You do this by wrapping your app with `<RouterProvider>` in `main.jsx`.

```jsx
// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router' // or define router here

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

**What does `RouterProvider` do?**
- It is the top-level component that provides routing context to the entire application.
- It takes the `router` object (created using `createBrowserRouter`) as a prop.
- It replaces the old `<BrowserRouter>` wrapper from React Router v5.

> ⚠️ Note: In React Router v6.4+, `RouterProvider` + `createBrowserRouter` is the **recommended** approach because it enables features like data loading (`loader`), actions, and deferred data. The older `<BrowserRouter>` still works but doesn't support these advanced features.

---

## 8. Link vs Anchor Tag

### The Problem with `<a>` tags

In standard HTML, clicking an `<a href="/about">` tag causes the browser to:
1. Make a new HTTP request to the server
2. Download the new HTML page
3. Reload the entire page (losing all React state)

This defeats the purpose of a Single Page Application!

### The Solution: `<Link>` from React Router

```jsx
// ❌ BAD — causes full page reload
<a href="/about">About</a>

// ✅ GOOD — client-side navigation, no page reload
import { Link } from 'react-router-dom'
<Link to="/about">About</Link>
```

**The `to` attribute:**
- `to` is the equivalent of `href` in anchor tags.
- It specifies the path to navigate to.
- It can be a string: `to="/about"` or an object: `to={{ pathname: '/about', search: '?id=1' }}`

**How `Link` works internally:**
- `<Link>` renders as an `<a>` tag in the DOM.
- But it intercepts the click event, prevents the default browser navigation, and uses the History API to update the URL.
- React Router then re-renders the matching component — no server request is made.

```jsx
// Usage in Header
import { Link } from 'react-router-dom'

<Link to="/">Home</Link>
<Link to="/about">About</Link>
<Link to="/contact">Contact</Link>
```

---

## 9. NavLink vs Link

`NavLink` is a special version of `Link` that knows whether it's "active" (i.e., the current URL matches its `to` prop).

### Key Difference

| Feature | `Link` | `NavLink` |
|---|---|---|
| Navigation | ✅ Yes | ✅ Yes |
| Active state detection | ❌ No | ✅ Yes |
| Styling based on active | ❌ No | ✅ Yes |
| Use case | General navigation | Navigation menus/tabs |

### How to use NavLink

The `className` prop of `NavLink` can accept a **function** that receives `{ isActive, isPending }` and returns a class string:

```jsx
import { NavLink } from 'react-router-dom'

<NavLink
  to="/about"
  className={({ isActive }) =>
    isActive ? 'text-orange-700 font-bold' : 'text-gray-700'
  }
>
  About
</NavLink>
```

- When the user is on `/about`, `isActive` is `true`, so the orange + bold style is applied.
- On any other route, `isActive` is `false`, so the grey style is applied.

**Why use NavLink?**
- Perfect for navigation bars where you want to highlight the currently active link.
- Removes the need to manually track the current route with `useState` or `useLocation`.

---

## 10. Dynamic Routes with `useParams`

### What are Dynamic Routes?

Sometimes you want a URL like `/user/john` or `/user/jane` where the username is dynamic (changes based on who is logged in or what is clicked). You can't hardcode every possible user.

React Router allows **dynamic segments** in paths using the `:paramName` syntax.

### Defining a Dynamic Route

```jsx
<Route path="user/:userid" element={<User />} />
```

Here `:userid` is a URL parameter (a dynamic segment). It matches any value placed in that position of the URL.

Examples:
- `/user/john` → `:userid` = `"john"`
- `/user/42` → `:userid` = `"42"`
- `/user/prabhansh` → `:userid` = `"prabhansh"`

### Reading the Parameter: `useParams()`

Inside the `User` component, use the `useParams()` hook to access the dynamic value from the URL.

```jsx
// components/User.jsx
import React from 'react'
import { useParams } from 'react-router-dom'

function User() {
  const { userid } = useParams()
  // useParams() returns an object like { userid: "john" }
  // We destructure to get the value of :userid from the URL

  return (
    <div className='bg-gray-600 text-white text-3xl p-4 text-center'>
      User: {userid}
    </div>
  )
}

export default User
```

**How it works step by step:**
1. User visits `/user/prabhansh`
2. React Router matches the route `user/:userid`
3. `useParams()` returns `{ userid: "prabhansh" }`
4. We destructure `userid` and render it: `User: prabhansh`

**Navigating to a dynamic route:**
```jsx
// You can use Link with a dynamic path
<Link to={`/user/${username}`}>View Profile</Link>
```

---

## 11. Data Loading with `loader` and `useLoaderData`

This is one of the most powerful features introduced in React Router v6.4. It allows you to **fetch data before the component renders**, rather than after (which is the traditional `useEffect` approach).

### The Problem with `useEffect` for Data Fetching

```jsx
// ❌ Traditional approach — data loads AFTER component mounts (causes loading flash)
function Github() {
  const [data, setData] = useState([])

  useEffect(() => {
    fetch("https://api.github.com/users/prabhanshtiwari")
      .then(response => response.json())
      .then(data => {
        setData(data)
      })
  }, [])

  return <div>Followers: {data.followers}</div>
}
```

**Problems with this approach:**
1. Component renders first with empty data → shows blank/loading state
2. Data fetches AFTER render → causes a "flicker" or loading state
3. Not ideal for SEO (server-side considerations)
4. Harder to handle errors cleanly

---

### The Solution: `loader` + `useLoaderData`

React Router's `loader` function is defined **outside** the component and runs **before** the component renders. By the time the component mounts, the data is already available.

#### Step 1: Define the loader function (in the component file)

```jsx
// components/Github.jsx

// Loader function — defined outside the component
// This runs BEFORE the component renders
export const githubInfoLoader = async () => {
  const response = await fetch("https://api.github.com/users/prabhanshtiwari")
  return response.json()
  // Whatever you return here is available inside the component via useLoaderData()
}
```

> 💡 The loader function must be `async` and **return** the data (or a Response object). React Router will wait for this promise to resolve before rendering the component.

#### Step 2: Attach the loader to the route

```jsx
// In your router configuration
import Github, { githubInfoLoader } from './components/Github'

<Route
  path="github"
  element={<Github />}
  loader={githubInfoLoader}   // ← attach loader here
/>
```

#### Step 3: Access the data in the component using `useLoaderData`

```jsx
// components/Github.jsx
import React from 'react'
import { useLoaderData } from 'react-router-dom'

function Github() {
  const data = useLoaderData()
  // data is already populated when the component renders!
  // No loading state needed for the initial render.

  return (
    <div className='text-center m-4 bg-gray-600 text-white p-4 text-3xl'>
      Github followers: {data.followers}
      <img src={data.avatar_url} alt="Git picture" width={300} />
      <h1>{data.name}</h1>
    </div>
  )
}

export default Github

export const githubInfoLoader = async () => {
  const response = await fetch("https://api.github.com/users/prabhanshtiwari")
  return response.json()
}
```

### Comparison: useEffect vs loader

| | `useEffect` Approach | `loader` Approach |
|---|---|---|
| When data loads | After component renders | Before component renders |
| Initial render state | Empty/loading state | Data already available |
| User experience | Flickering/loading indicator | Smooth, instant content |
| Code location | Inside the component | Outside the component |
| Error handling | Manual `try/catch` in useEffect | Built-in via `errorElement` |
| React Router feature | No (generic React) | Yes (v6.4+) |

### How the loader optimizes performance

When the user clicks a link to `/github`:
1. React Router intercepts the navigation
2. **Before** rendering `<Github />`, it calls `githubInfoLoader()`
3. It waits for the fetch to complete
4. Then it renders `<Github />` with the data already available
5. `useLoaderData()` returns the resolved data synchronously

This means the user sees the complete page immediately instead of a blank screen followed by data.

---

## 12. Full Code Summary

### main.jsx (with router)
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom'
import './index.css'
import Layout from './Layout'
import Home from './components/Home'
import About from './components/About'
import Contact from './components/Contact'
import User from './components/User'
import Github, { githubInfoLoader } from './components/Github'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="user/:userid" element={<User />} />
      <Route
        path="github"
        element={<Github />}
        loader={githubInfoLoader}
      />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

### Layout.jsx
```jsx
import React from 'react'
import Header from './components/header/Header'
import Footer from './components/footer/Footer'
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}

export default Layout
```

### User.jsx
```jsx
import React from 'react'
import { useParams } from 'react-router-dom'

function User() {
  const { userid } = useParams()
  return (
    <div className='bg-gray-600 text-white text-3xl p-4 text-center'>
      User: {userid}
    </div>
  )
}

export default User
```

### Github.jsx
```jsx
import React from 'react'
import { useLoaderData } from 'react-router-dom'

function Github() {
  const data = useLoaderData()
  return (
    <div className='text-center m-4 bg-gray-600 text-white p-4 text-3xl'>
      Github followers: {data.followers}
      <img src={data.avatar_url} alt="Git picture" width={300} />
      <h1>{data.name}</h1>
    </div>
  )
}

export default Github

export const githubInfoLoader = async () => {
  const response = await fetch("https://api.github.com/users/prabhanshtiwari")
  return response.json()
}
```

---

## 13. Key Concepts Cheatsheet

| Concept | Import | Purpose |
|---|---|---|
| `createBrowserRouter` | `react-router-dom` | Creates the router object using HTML5 history API |
| `createRoutesFromElements` | `react-router-dom` | Converts JSX `<Route>` elements to route objects |
| `Route` | `react-router-dom` | Defines a single route with `path` and `element` |
| `RouterProvider` | `react-router-dom` | Mounts the router; wraps the entire app |
| `Outlet` | `react-router-dom` | Placeholder where child route components render |
| `Link` | `react-router-dom` | Client-side navigation; replaces `<a>` tag |
| `NavLink` | `react-router-dom` | Like `Link` but adds active state styling |
| `useParams` | `react-router-dom` | Hook to read dynamic URL parameters (`:paramName`) |
| `useLoaderData` | `react-router-dom` | Hook to access data returned by a route's `loader` |
| `loader` | Route prop | Async function that fetches data before component renders |

---

### Quick Rules to Remember

1. **Never use `<a href>` for internal navigation** — always use `<Link to>` or `<NavLink to>`.
2. **`Outlet` is the slot** — place it in Layout where child pages should appear.
3. **Dynamic params use `:name` syntax** — access them with `useParams()`.
4. **`loader` runs before render** — much better than `useEffect` for initial data fetching.
5. **`NavLink` for navbars** — use the `isActive` callback to highlight the current page.
6. **`RouterProvider` replaces `<BrowserRouter>`** in React Router v6.4+.

---

> 📌 This concludes the React Router crash course from Chai aur React. Practice by building your own project with multiple routes, dynamic parameters, and API loaders!

<!-- Project Details:
- 

---

This lecture itself is a crash course of react router.

React Router DOM:
- It is not essential core part of REACT.
- It is a third party library.

visit "reactrouter.com" for docs

Create a vite project "07reactRouter" and integrate tailwind

first we will build components then talk about functionality
make "components" folder in "src" folder.
make header/Header.jsx:
```

```
make footer/Footer.jsx:
```

``
How to install react router:(refer documentation)
```
npm install react-router-dom
```



We use link in place of a tag,
Explain Link tag attribute "to":
Why dont we use anchor tag but use Link form react router dom?

NavLink: provide addition things

Link vs Navlink in react router



Summary:

First, we created components:

In Layout, we have an <Outlet /> from react-router-dom.
After this, we can use nesting of components.

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="user/:userid" element={<User />} />
      <Route
        path="github" 
        element={<Github />} 
        loader={githubInfoLoader}
      />
    </Route>
  )
)

Then, we use routerprovider :
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

We created router in two ways:
1. 
```
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />
      }, 
      {
        path: "about",
        element: <About />
      },
      {
        path: "contact",
        element: <Contact />
      }
    ]
  }
])
```

2. 
```

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="user/:userid" element={<User />} />
      <Route
        path="github" 
        element={<Github />} 
        loader={githubInfoLoader}
      />
    </Route>
  )
)
```

we use useParam() to get the data from the url to display:
```
import React from 'react'
import { useParams } from 'react-router-dom'

function User() {
    const { userid } = useParams();
  return (
    <div className='bg-gray-600 text-white text-3xl p-4 text-center'>User: {userid}</div>
  )
}

export default User
```

Then, we learnt how to optimize things when we have API calls:
```
import React, { useEffect, useState } from 'react'
import { useLoaderData } from 'react-router-dom'


function Github() {

    const data = useLoaderData();

    // const [data, setData] = useState([]);
    // useEffect(() => {
    //     fetch("https://api.github.com/users/prabhanshtiwari")
    //     .then(response => response.json())
    //     .then(data => {
    //         console.log(data);
    //         setData(data);
    //     })
    // }, [])
  return (
      <div className='text-center m-4 bg-gray-600 text-white p-4 text-3xl'>Github followers: {data.followers}
          <img src={data.avatar_url} alt="Git picture" width={300} />
          <h1>{ data.name}</h1>
      </div>
  )
}

export default Github

export const githubInfoLoader = async() => {
    const response = await fetch("https://api.github.com/users/prabhanshtiwari");
    return response.json();
}
```



 -->
