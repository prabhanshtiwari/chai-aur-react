# React Components — Detailed Notes
### Series: Chai aur Code | Topic: Production-Grade React Components

---

## Table of Contents
1. [Select Component](#1-select-component)
2. [PostCard Component](#2-postcard-component)
3. [Login Component (with React Hook Form)](#3-login-component)
4. [Signup Component](#4-signup-component)
5. [AuthLayout / Protected Route](#5-authlayout--protected-route)
6. [Key Concepts Summary](#6-key-concepts-summary)

---

## 1. Select Component

### What is it?
A reusable dropdown (`<select>`) component that accepts options as a prop, shows a label for accessibility, and supports all native HTML select attributes via prop spreading.

### Why `React.forwardRef`?
When you build a custom input/select component, parent components sometimes need direct access to the underlying DOM element (e.g., for focusing or reading values). `React.forwardRef` enables you to pass a `ref` through your component down to the native element.

> **Bug Hint from the video:** If you write the component normally (without `forwardRef`) and try to pass a `ref` from outside, it silently does nothing. This is a tricky bug — no error, just broken behavior.

```jsx
import React, { useId } from 'react'

// We wrap the function in React.forwardRef so the parent can pass a ref
// and it will reach the actual <select> DOM element
function Select(
  {
    options,       // Array of option strings, e.g. ["India", "USA", "UK"]
    label,         // Optional label text shown above the select
    className = '', // Extra CSS classes (defaults to empty string to avoid "null" in className)
    ...props       // All other props (onChange, value, disabled, etc.) passed directly to <select>
  },
  ref              // The forwarded ref from the parent component
) {

  // useId generates a unique ID — used to link <label> and <select> for accessibility
  const id = useId()

  return (
    <div className='w-full'>

      {/* Only render label if the `label` prop is provided */}
      {label && (
        <label htmlFor={id} className=''>
          {label}
        </label>
      )}

      <select
        {...props}   // Spread all extra props first (so our explicit props below can override if needed)
        id={id}      // Links to the label's htmlFor for accessibility
        ref={ref}    // Attach the forwarded ref to the actual DOM element
        className={`px-3 py-2 rounded-lg bg-white text-black outline-none 
                    focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
        // ⚠️ Assignment: If className is null/undefined, the above will print "null" or "undefined"
        // Fix: use className={`... ${className || ''}`} or default param className = ''
      >
        {/* options?.map — optional chaining prevents crash if options is undefined/null */}
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

    </div>
  )
}

// Export wrapped in forwardRef — this is the "easy syntax" shown at export time
// Alternative: you can also wrap inline: export default React.forwardRef(function Select(...) {...})
export default React.forwardRef(Select)
```

### Key Points
- `useId()` creates a stable unique ID — great for linking labels and inputs.
- `options?.map(...)` — the `?.` (optional chaining) prevents runtime crashes if `options` is `undefined`.
- **`className` default value assignment** is a small but important production detail — passing `null` would literally render `class="... null"` in the DOM.
- **`React.forwardRef`** can be applied either inline around the function or at the export statement.

---

## 2. PostCard Component

### What is it?
A card UI component that displays a blog post's thumbnail image and title, and wraps everything in a clickable link to the post's detail page.

### Where does the image URL come from?
Appwrite (the backend service used here) stores images by their **file ID**, not a URL. To display the image, you call `appwriteService.getFilePreview(fileId)` which returns a usable URL.

```jsx
import React from 'react'
import appwriteService from "../appwrite/config"  // Appwrite service with file preview method
import { Link } from 'react-router-dom'           // React Router's Link for client-side navigation

// Props come directly from Appwrite's document structure:
// $id       → Appwrite's auto-generated document ID (note the $ prefix — that's Appwrite's convention)
// title     → Post title
// featuredImage → Appwrite File ID of the post's thumbnail (NOT a URL, just an ID)
function PostCard({ $id, title, featuredImage }) {

  return (
    // Link wraps the entire card — clicking anywhere navigates to the post page
    // We use relative path: /post/[id]
    <Link to={`/post/${$id}`}>

      <div className='w-full bg-gray-100 rounded-xl p-4'>

        {/* Image container */}
        <div className='w-full justify-center mb-4'>
          <img
            // getFilePreview converts file ID → actual image URL
            src={appwriteService.getFilePreview(featuredImage)}
            alt={title}           // Alt text for accessibility
            className='rounded-xl'
          />
        </div>

        {/* Post title */}
        <h2 className='text-xl font-bold'>{title}</h2>

      </div>
    </Link>
  )
}

export default PostCard
```

### Key Points
- Appwrite uses `$id` with a dollar sign — this is their naming convention for system fields.
- `getFilePreview(featuredImage)` — converts the stored file ID into a displayable URL.
- The entire card is a `<Link>` — no need for an `onClick` handler.
- Use `alt={title}` for image accessibility.

---

## 3. Login Component

### What is React Hook Form?
`react-hook-form` is a library that manages form state and validation **without manually writing `useState` for each field**. It improves performance by avoiding unnecessary re-renders.

### The 3 things you always use from `useForm()`:
| Name | What it does |
|------|-------------|
| `register` | Connects an input field to the form — tracks its value automatically |
| `handleSubmit` | Wraps your submit function — passes all field values as a `data` object |
| `formState` | Contains `errors`, `isSubmitting`, etc. (not used here but available) |

> **Common confusion:** `register` is NOT about user registration/signup. It's a form library keyword that "registers" (connects) an input field to the form tracking system.

```jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
// ↑ Renaming the imported action to "authLogin" to avoid name conflict
// with our local function also named "login"
import { Button, Input, Logo } from "./index"
import { useDispatch } from "react-redux"
import authService from "../appwrite/auth"
import { useForm } from "react-hook-form"

function Login() {
  const navigate = useNavigate()   // For programmatic navigation after login
  const dispatch = useDispatch()   // To update Redux store after successful login

  // useForm gives us register (to connect inputs) and handleSubmit (to handle form submission)
  const { register, handleSubmit } = useForm()

  // Local state to store and display error messages
  const [error, setError] = useState("")

  // Our actual login logic — receives `data` object with all field values
  // data = { email: "user@example.com", password: "secret123" }
  const login = async (data) => {
    setError("")  // Clear previous errors every time user tries to submit

    try {
      // Step 1: Create a session with Appwrite using email + password
      const session = await authService.login(data)

      if (session) {
        // Step 2: Fetch the current logged-in user's profile data
        const userData = await authService.getCurrentUser()

        // Step 3: If user data exists, store it in Redux store and navigate home
        if (userData) dispatch(authLogin(userData))
        navigate("/")
      }
    } catch (error) {
      // If anything fails, show the error message to the user
      setError(error.message)
    }
  }

  return (
    <div className='flex items-center justify-center w-full'>
      <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>

        {/* Logo */}
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <Logo width="100%" />
          </span>
        </div>

        <h2 className="text-center text-2xl font-bold leading-tight">
          Sign in to your account
        </h2>

        {/* Link to Signup page */}
        <p className="mt-2 text-center text-base text-black/60">
          Don&apos;t have any account?&nbsp;
          <Link to="/signup" className="font-medium text-primary transition-all duration-200 hover:underline">
            Sign Up
          </Link>
        </p>

        {/* Conditionally show error message */}
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

        {/* FORM — onSubmit uses handleSubmit from react-hook-form */}
        {/* handleSubmit(login) means: validate → collect all field values → call login(data) */}
        <form onSubmit={handleSubmit(login)} className='mt-8'>
          <div className='space-y-5'>

            {/* 
              {...register("email", { options })} connects this input to the form
              - "email" is the KEY in the data object passed to login()
              - required: true → field must be filled
              - validate.matchPatern → custom regex validation for email format
              ⚠️ Note: "matchPatern" has a typo (missing 't') — should be "matchPattern"
                 but it works — it's just the name you give the validator
            */}
            <Input
              label="Email: "
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: true,
                validate: {
                  matchPatern: (value) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    "Email address must be a valid address",
                  // ↑ If regex test returns false, the string message becomes the error
                }
              })}
            />

            {/* 
              Password field — simpler, just required
              - "password" is the KEY in the data object
            */}
            <Input
              label="Password: "
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: true,
              })}
            />

            {/* Submit button — type="submit" triggers the form's onSubmit */}
            <Button type="submit" className="w-full">
              Sign in
            </Button>

          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
```

### How does `register` work? (Simple Explanation)

```
Normal approach (manual):
  const [email, setEmail] = useState("")
  <input value={email} onChange={(e) => setEmail(e.target.value)} />

React Hook Form approach:
  <input {...register("email")} />
  // react-hook-form silently tracks the value internally
  // When form submits → data = { email: "whatever user typed" }
```

### Email Regex Explained
```
/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/

^\w+          → starts with one or more word characters
([.-]?\w+)*   → optionally followed by . or - then more word chars
@             → must have @
\w+           → domain name
(\.\w{2,3})+$ → ends with .com / .in / .org etc. (2-3 chars)
```
> **Tip:** For regex patterns, use [regexr.com](https://regexr.com) or ChatGPT — you don't need to memorize them.

---

## 4. Signup Component

Very similar to Login. Key differences: 3 fields (name, email, password), calls `createAccount` instead of `login`.

```jsx
import React, { useState } from 'react'
import authService from '../appwrite/auth'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../store/authSlice'  // Redux action to set auth state
import { Button, Input, Logo } from './index.js'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'

function Signup() {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const dispatch = useDispatch()
  const { register, handleSubmit } = useForm()

  // Called when form is submitted
  // data = { name: "John", email: "john@example.com", password: "secret" }
  const create = async (data) => {
    setError("")  // Always clear errors on fresh submit attempt
    try {
      // Step 1: Create the account in Appwrite
      const userData = await authService.createAccount(data)

      if (userData) {
        // Step 2: Fetch the full current user object from Appwrite
        // (createAccount doesn't always return the complete user profile)
        const userData = await authService.getCurrentUser()

        // Step 3: Store user in Redux and go to home
        if (userData) dispatch(login(userData))
        navigate("/")
      }
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>

        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <Logo width="100%" />
          </span>
        </div>

        <h2 className="text-center text-2xl font-bold leading-tight">
          Sign up to create account
        </h2>

        {/* Link back to login */}
        <p className="mt-2 text-center text-base text-black/60">
          Already have an account?&nbsp;
          <Link to="/login" className="font-medium text-primary transition-all duration-200 hover:underline">
            Sign In
          </Link>
        </p>

        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

        <form onSubmit={handleSubmit(create)}>
          <div className='space-y-5'>

            {/* Name field — simplest, just required */}
            <Input
              label="Full Name: "
              placeholder="Enter your full name"
              {...register("name", {
                required: true,
              })}
            />

            {/* Email with regex validation — same as Login */}
            <Input
              label="Email: "
              placeholder="Enter your email"
              type="email"
              {...register("email", {
                required: true,
                validate: {
                  matchPatern: (value) =>
                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                    "Email address must be a valid address",
                }
              })}
            />

            {/* Password — required only */}
            <Input
              label="Password: "
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: true,
              })}
            />

            <Button type="submit" className="w-full">
              Create Account
            </Button>

          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
```

---

## 5. AuthLayout / Protected Route

### The Big Idea
This component acts as a **guard/wrapper** for pages. Before rendering a page's content, it checks:
- Is the user authenticated?
- Should this page be for authenticated users only (like Dashboard), or for unauthenticated users only (like Login page)?

### Why do we need this?
Without protection:
- A logged-in user can visit `/login` again (weird UX)
- A logged-out user can visit `/dashboard` (security issue)

This component handles both cases.

```jsx
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'      // To read auth status from Redux store
import { useNavigate } from 'react-router-dom' // For redirecting the user

// Props:
// children      → The actual page content to render if check passes
// authentication → true  = "this page is for LOGGED IN users" (default)
//               → false = "this page is for LOGGED OUT users" (Login, Signup pages)
export default function Protected({ children, authentication = true }) {

  const navigate = useNavigate()

  // loader = true initially (we're still checking auth status)
  // We show a loading indicator until the check is complete
  const [loader, setLoader] = useState(true)

  // Read the current auth status from Redux store
  // authStatus = true  → user is logged in
  // authStatus = false → user is NOT logged in
  const authStatus = useSelector(state => state.auth.status)

  useEffect(() => {
    /*
     * LOGIC EXPLANATION:
     *
     * Case 1: authentication = true (page needs login)
     *   - If authStatus !== true → user is NOT logged in → redirect to /login
     *   - If authStatus === true → user IS logged in → do nothing (show the page)
     *
     * Case 2: authentication = false (page is for guests only, like Login/Signup)
     *   - If authStatus !== false → user IS logged in → redirect to / (home)
     *   - If authStatus === false → user is NOT logged in → do nothing (show login page)
     *
     * In both cases, the condition `authStatus !== authentication` catches the
     * "mismatch" situation — when user's actual auth state doesn't match what the
     * page expects.
     */

    if (authentication && authStatus !== authentication) {
      // Page requires login, but user is NOT logged in → go to login
      navigate("/login")

    } else if (!authentication && authStatus !== authentication) {
      // Page is for guests only, but user IS already logged in → go to home
      navigate("/")
    }

    // Either way, once we've checked, stop showing the loader
    setLoader(false)

  }, [authStatus, navigate, authentication])
  // ↑ Re-run this effect whenever auth status changes (e.g., user logs in/out)

  /*
   * SIMPLER ALTERNATIVE (mentioned in video — easier to understand):
   *
   * useEffect(() => {
   *   if (authStatus === true) {
   *     navigate("/")         // Already logged in? Go home
   *   } else if (authStatus === false) {
   *     navigate("/login")    // Not logged in? Go to login
   *   }
   *   setLoader(false)
   * }, [authStatus, navigate])
   *
   * This works fine for basic cases but doesn't handle the guest-only pages scenario.
   */

  // While checking → show loading text
  // After checking → show the actual page content (children)
  return loader ? <h1>Loading...</h1> : <>{children}</>
}
```

### How to Use It (in your Router setup)

```jsx
// In your App.jsx or router config:

// Protected page — only for logged-in users
<Route path="/dashboard" element={
  <Protected authentication={true}>
    <Dashboard />
  </Protected>
} />

// Guest-only page — redirect to home if already logged in
<Route path="/login" element={
  <Protected authentication={false}>
    <Login />
  </Protected>
} />
```

---

## 6. Key Concepts Summary

### React Hook Form — Quick Reference

```
import { useForm } from 'react-hook-form'

const { register, handleSubmit } = useForm()

// In JSX:
<form onSubmit={handleSubmit(yourFunction)}>
  <input {...register("fieldName", { required: true })} />
</form>

// yourFunction receives:
// data = { fieldName: "user typed value" }
```

### `React.forwardRef` — When to Use

```
// Use when parent needs a ref to your component's inner DOM element
const MyInput = React.forwardRef(function(props, ref) {
  return <input ref={ref} {...props} />
})

// Parent:
const inputRef = useRef()
<MyInput ref={inputRef} />
inputRef.current.focus() // Works!
```

### Why `...register("name")` must be spread

```jsx
// register("email") returns an object like:
// { name: "email", onChange: fn, onBlur: fn, ref: fn }

// Without spread — only one property applied, others lost:
<input register={register("email")} />  // ❌ Wrong

// With spread — all properties applied correctly:
<input {...register("email")} />  // ✅ Correct
```

### Import Renaming to Avoid Conflicts

```js
// When you have a local function AND an imported item with the same name:
import { login as authLogin } from '../store/authSlice'
// Now:
// login    → your local async function
// authLogin → the Redux action creator
```

### Error Handling Pattern for Forms

```js
const [error, setError] = useState("")

const submit = async (data) => {
  setError("")          // 1. Clear old errors
  try {
    await someApiCall() // 2. Try the operation
  } catch (error) {
    setError(error.message) // 3. Catch and display error
  }
}

// In JSX:
{error && <p className="text-red-600">{error}</p>}
```

### `useNavigate` vs `<Link>`

| `<Link to="/path">` | `useNavigate()` |
|---------------------|-----------------|
| User must click | Programmatic (automatic) |
| Declarative in JSX | Called inside functions |
| Good for nav menus | Good for post-login redirects |

---

> **Video Tip:** If you're ever stuck on logic — pause, step back, think in plain English about what you want to do, THEN write code. This habit alone separates good developers from great ones.



<!-- Transcript:
```
हां जी स्वागत है आपका वापस से चाय और कोड
में और कुछ और नई चीजें सीखते हैं लास्ट
वीडियो में हमने कुछ इनपुट एलिमेंट्स बटंस
ये सब बनाने देखे थे प्रोफेशनल तरीके से
प्रोडक्शन ग्रेड कोड के अंदर उसी चीज का
मैं थोड़ा सा आपका रिवीजन और करवाना चाहता
हूं थोड़ा सा कंफ्यूजन में भी डालूंगा जान
पूछ के कुछ एक जगह अगर आप मुझे पकड़ पाए
कहां हमने मिस्टेक करी है किस तरह से करी
है तो वह भी पकड़िए बड़ा इंटरेस्टिंग होगा
अच्छा सा होगा पहले ही कंपोनेंट में कर
देंगे मिस्टेक और हिंट दिया आपको ठीक है
तो चलिए चलते हैं हमारे स्क्रीन के ऊपर अब
देखिए यह है हमारी स्क्रीन और यहां पे
हमें और भी कंपोनेंट्स बनाने हैं तो सबसे
पहला एक कंपोनेंट अगर आपको याद हो शायद तो
हमने एक सेलेक्ट बटन भी बनाया था ड्रॉप
डाउन बटन जहां पे एक्टिव डीएक्टिव वो सब
था तो वो अब हम बनाएंगे तो यह है हमारा
सेलेक्ट बटन तो क्यों नहीं लिख रहे हैं
भाई लिखिए प्लीज न्यू फाइल और ये रहा
सेलेक्ट तो ये रहा सेक्टड जए सेक्ट
कंपोनेंट जए सेलेक्ट फील्ड आपका जो मन करे
वो नाम लिखिए अभी मैं इसका नाम सिंपली
सेक्टड जए एक रख देता हूं जी जीस एक् तो
जरूरी है ये अपना आरएफसी सिंपल सा अपना ये
सेलेक्ट कंपोनेंट है अब देखिए इंटरेस्टिंग
बात क्या है सेलेक्ट कंपोनेंट हमने लिया
एज इट इज ही रखते हैं और प्रॉपर्टीज
क्या-क्या लोगे देखिए सेलेक्ट के लिए सबसे
पहले तो ऑप्शंस देना जरूरी है ना ऑप्शंस
नहीं होंगे तो मैं किस पे सेलेक्ट
करवाऊंगी कुछ क्योंकि वही तो ऑप्शन होता
है ड्रॉप डाउन के अंदर ठीक है जी लेबल भी
देना पड़ेगा हां जी क्योंकि इनपुट फील्ड
टाइप है लेबल तो बनता है थोड़ी सी
एक्सेसिबिलिटी का ध्यान रख लें क्लास नेम
यूजुअली लोग देते हैं और हम इसको एमटी रख
देते हैं आपका मन करे तो इसको एमटी रखिए
लेकिन एक और तरीका भी होता है कि अगर
क्लास नेम एमटी नहीं है तो इस तरह से भी
रख सकते हैं कोई दिक्कत वाली बात नहीं
वैसे कोई दिक्कत नहीं आती है और उसके बाद
हम क्या करते हैं सारे प्रॉप्स को स्प्रेड
कर लेते हैं डॉट डॉट डॉट और अपने ये
प्रॉप्स ये लीजिए क्या हो गया प्रॉप्स ठीक
है ये वैल्यूज तो हमने ले ली और एक और
वैल्यू क्या लेते हैं आपको पता है कि यहां
पे ये सब तो ऑब्जेक्ट आता ही आता है साथ
में एक रेफ भी आता है रेफरेंस ठीक है जी
इतना तो हमें पता है और रिएक्ट के साथ
क्या करो एक आईडी भी ले लो ताकि वही आईडी
html4 में लगा देंगे वही उस इनपुट फील्ड
में लगा द देंगे कोई ऐसी दिक्कत है ही
नहीं यूज आईडी यह लीजिए अब यूज आईडी बनाते
हैं सबसे पहले तो यहां पर चलते हैं
कॉन्स्ट आईडी इक्वल ट यूज आईडी बड़ा ही
बेसिक सा था यहां तक तो काम हो गया अब
चलिए अपना यह फॉर्म बनाने की कोशिश करते
हैं तो फॉर्म आपको पता है हमने पहले भी
बनाया था इस डिव को यूज कर लेते हैं
ज्यादा कुछ क्लास नेम हम लिखते भी नहीं
आपको पता है यूजुअली इसमें विड्थ फुल कर
देते हैं ताकि जितना भी विड्थ एक्चुअली
में हो वह सारा मिल जाए अच्छा जी अब सबसे
पहली चीज क्या है सबसे पहली चीज वही अपना
लेबल वाला सिंटेक्स कि लेबल अगर है तो हम
डिस्प्ले करा देंगे तो एंड लेबल अब इसके
अंदर यहां पर आए हैं तो ओबवियस सी बात है
यह लीजिए लेबल को यह लीजिए इस तरह से लेबल
हो गया ओके इसको हम नेक्स्ट लाइन पर ले आए
तो थोड़ा सा ठीक रहेगा यहीं पर लिख लेते
हैं लेबल के अंदर एक तो होता है हमारा
html4 और य html4 कहां से आ जाएगा यह
लीजिए आईडी डाल दी उसके अंदर ठीक है कोई
दिक्कत नहीं है क्लास नेम एमटी रख देते
हैं पर आपको चाहिए तो आप प्लीज ऐड कर सकते
हैं इसमें कोई इशू नहीं है ओके तो तो यहां
पे हो गया हमारे पास में लेबल हम लेबल की
एक्चुअली में वैल्यूज यहां पे जरूरत है
नहीं हमें वैसे तो बट ठीक है अगर आप कह
रहे हैं तो ये लेबल रख लेते हैं अगर लेबल
है तो ये लेबल फॉर क्योंकि लेबल के
एग्जैक्ट यहां पे आईडी मतलब कोई वैल्यू
डालने की जरूरत नहीं क्योंकि वो वैल्यू है
भी नहीं हमारे पास में तो ये सिर्फ एक
लेबल हमने डाल लिया ताकि आईडी वहां पे रहे
बिहाइंड द सीन तो रहे एटीएल का स्ट्रक्चर
ना बिगड़े ठीक है अब आते हैं हमारे पास
नेक्स्ट मुद्दे की बात हमारे पास चाहिए एक
सेलेक्ट एलिमेंट तो ये लीजिए आ गया
सेलेक्ट एलिमेंट और ये वैल्यूज अब सेले के
अंदर आते हैं ऑप्शंस ठीक है ऑप्शंस भी ऐड
कर देंगे पहले सेलेक्ट के अंदर कुछ
प्रॉपर्टीज ऐड करनी है हां जी करनी है
यूजर ने जितने भी प्रॉप्स दिए हैं सारे के
सारे पास कर दो यहां पे यह तो हमें पता है
अब देखिए सबसे लास्ट में पास करो पहले पास
कर दो कोई फर्क पड़ता नहीं है वहां पे
आईडी चाहिए हां जी आईडी चाहिए आईडी की
वैल्यू क्या चाहिए वही जो सेम आईडी ऊपर से
जनरेट हुआ वही आईडी की वैल्यू दे दो ठीक
है जी थोड़ा सा स्क्रॉल कर लें रेफरेंस भी
जो दिया था वो रेफरेंस ले लीजिए ये जो
रेफरेंस था यहां पर जो मिल रहा था यह
रेफरेंस हमने दे दिया इतना तो हम सीख चुके
थे क्लास नेम थोड़ी सी क्लास नेम लगेगी तो
ये लीजिए क्लास नेम अब ओबवियस सी बात है
वही सेम सिंटेक्स कि ये कर्ली ब्रेसस लो
और उसके अंदर बैक टेक्स लगाओ और अपनी
क्लासेस ऐड कर दो हां जी हमारे पास नोट्स
में कुछ क्लासेस हैं क्योंकि हम यहां पे
अभी के लिए फिलहाल टेल विनट पढ़ने नहीं आए
हैं ये लीजिए और कुछ वैल्यूज है तो डॉलर
यह लीजिए क्लास नेम अब सिंपल सा एक
प्रॉब्लम पता है क्या है यहां पे अगर नल
भी होगा तो भी उससे कुछ होगा नहीं अगर
किसी ने कुछ पास नहीं करा तो मुझे बेटर
सिंटेक्स ये लगता है कि क्लास नेम के अंदर
एमटी स्ट्रिंग्स हो तो प्लीज नोट डाउन कर
लीजिएगा य छोटा सा असाइनमेंट है जो आपको
करना है ठीक है यहां तक तो हो गया काम
हमारा सेलेक्ट की वैल्यूज का यह पूरा
हमारा सेलेक्ट का चल रहा है अब सेलेक्ट के
अंदर ऑप्शंस भी देने पड़ेंगे हां जी
बिल्कुल देने पड़ेंगे तो ऑप्शंस तो लूप
करने पड़ेंगे क्योंकि ऑप्शंस एक्चुअली में
यहां पे भी ऑप्शंस है ऑप्शंस एक एरे ही
मिलता है आपको यूजुअली तो बाय डिफॉल्ट एक
एर ले लीजिए क्योंकि इन केस प्रॉब्लम हो
सकती है तो उस प्रॉब्लम को अवॉइड करने के
लिए नोट्स में लिखना पड़ेगा ना हां जी
नोट्स तो लिखने पड़ेंगे तो यह हमने चलाया
तो यह हमारे पास है ऑप्शंस अब ऑप्शंस के
अंदर हम क्या करेंगे डॉट मैप डायरेक्ट ली
नहीं लिखेंगे लिख सकते हो कोई दिक्कत नहीं
है बट हो सकता है ऑप्शंस में वैल्यू ही ना
हो तो अगर ऑप्शंस के अंदर वैल्यू ही नहीं
है तो लूप करोगे तो पक्का क्रैश करेगा 101
पर क्रैश करेगा उसका एक छोटा सा सलूशन यह
है ऑप्शनली लूप कर लो उसके अंदर कि अगर
वैल्यू है उसके अंदर लूप करने लायक तो हम
लूप कर लेंगे हां जी छोटा-छोटा सिंटेक्स
है छोटी-छोटी बातें हैं आप यहां पे आते
हैं पूरे वीडियोस को लॉन्ग लेक्चर को
ध्यान से सुनते हैं इसलिए पता लग जाती है
आपको और भी तरीके हैं आप इसको चाहे तो
इफल्स से चेक कर सकते थे कि ऑप्शंस अगर जी
से वैल्यू ज्यादा है उसकी लेंथ की तो आप
करें वो भी चलता है एक ही बात है ओके तो
यह हो गया हमारा इसके अंदर आपको मिल जाएगा
एक ऑप्शन ऑप्शंस के अंदर एक ऑप्शन मिल
जाएगा इंडेक्स की खास जरूरत है नहीं यह
लीजिए हमारे पास ये यह वाला यूज कर लेते
हैं ओके अब इसके अंदर क्या करना है इसके
अंदर हमें ऑप्शंस लेने है तो यह लीजिए यह
ऑप्शन हो गया हमारे पास में ये ऑप्शन एंड
हो गया ऑप्शन के अंदर वैल्यू क्या है वही
ऑप्शन कितनी बार ऑप्शन लिखेंगे ठीक है ये
ऑप्शन लिख दिया अब इसके अंदर की भी तो तो
लगानी पड़ेगी देखिए की का बेस्ट तरीका है
वैसे तो आप इंडेक्स भी लगा सकते थे बट
ऑप्शन भी तो यूनिक है अपने आप में तो कौन
मना कर रहा है इसको की से यूज़ करने के
लिए वैसे तो और बेटर ऑप्शन हो सकते थे बट
ठीक है इंपॉर्टेंट ये मत भूलिए बस यहां पे
कि वैल्यू भी ऑप्शन में देनी पड़ती है तो
हां जो एक्चुअली में एरे की वैल्यू आ रही
है कितनी जगह ऑप्शन लिख दिया है अ 1 दोती
चा इतनी सी देर में चार बार ऑप्शन लिख
दिया है अच्छा अब गलती पकड़ी किसी ने गलती
तो नहीं कह सकते बट हां एक छोटा सा बग है
जिसको ढूंढते ढूंढते परेशान जाओगे लेकिन
नहीं आएगा क्योंकि यह कंपोनेंट आपने
सेपरेटली बनाया सेलेक्ट तो वो जो रिएक्ट
का फॉरवर्ड रेफ है वो तो चाहिए का चाहिए
वो तो लिखा ही नहीं हां जी तो क्या सर
दोबारा से लिखना पड़ेगा पूरा कोड नहीं
नहीं एक्चुअली में मैंने आपको ये जो इनपुट
लिख के बताया था ये सिर्फ मैं आपको
सिंटेक्सिस से अवेयर करा रहा हूं कि देखिए
इस तरह से भी लिखा जाता है बट हो सकता है
कुछ डेवलपर ने किसी और तरीके से लिखा हो
तो कई जगह आपको हो सकता है इस तरह से मिल
जाए और जब ये एक्सपोर्ट हो रहा है तो यहां
पे क्या करते हैं इसको आप पेंसिस में रैप
कर सकते हो उप्स यह रैप हो गया और हम क्या
कर सकते हैं रिएक्ट डॉट फॉरवर्ड रेफ यह भी
ऑप्शन है अब आप कहोगे सर यह जब इतना आसान
वाला था तो आपने यह पहले इतना टफ वाला
क्यों बनाया अगर पहले आसान वाला बना देता
तो यह आप सुनते ही नहीं बात इतनी है कि
नहीं तो यह बात सुननी भी जरूरी है तो ठीक
है यह हो गया हमारा तो इसी तरह से आपका जो
मन करे वो इनपुट एलिमेंट्स आप अलग-अलग बना
लीजिए सेलेक्ट एलिमेंट इनपुट और कोई भी
इनपुट हो तो उसको भी बना लीजिए कोई दिक्कत
नहीं है ओके तो यह तो हो गया हमारा काम अब
हम बताएंगे एक और अपना कंपोनेंट जो कि
बहुत इजी है अब बहुत इजी वाला है अब
एक्चुअली में ऑलमोस्ट सारे इजी है नहीं
सारे तो नहीं अभी और थोड़ा सा
एक्चुअली में इसमें है नहीं ज्यादा कुछ
सीएसएस ही ज्यादा है तो ये रिएक्ट फंक्शनल
कंपोनेंट हमारे पास आ गया लेकिन
इंफॉर्मेशन भी तो चाहिए गी इंफॉर्मेशन
कहां से आएगी सर्विस से
पप राइट
सर्विस
सर सर्विस और सर्विस कहां से आएगी हमारे
पास में एक
डायरेक्ट्रीएंट्री यहां से इसलिए लेनी पड़
रही है ये क्योंकि हमारे पास स्टेट के
अंदर ये नहीं है अवेलेबल और इतना सब क्या
लिख दिया आपने इतना सब तो मैंने बोला ही
नहीं आपको लिखने को अच्छा मल्टी कर्सर चल
रहे थे मेरे ओके ये लीजिए मल्टी कर्सर हटा
देते हैं तो ये हमें यहां से इसलिए लेना
पड़ेगा क्योंकि एक क्वेरी लगानी ही पड़ेगी
और वो सर्विस हमारी क्वेरी लगा देगी अगर
हमारे पास स्टेट में ये सारी चीजें
अवेलेबल होती तो मैं फिर ओबवियस सी बात है
राउटर रिडक्स यूज करता और स्टेट से
इंफॉर्मेशन लेता तो आपको एक मिक्स एंड मैच
पता लग गया अब इस एप्लीकेशन को आप बहुत
आगे तक ले जा सकते हैं एक अपना लिंक भी ले
लेते हैं क्योंकि क्योंकि लगेगा लिंक और
ये रिएक्ट राउटर डम से मिल जाएगा हमें
इतना ही बस चाहिए और कोई खास चाहिए नहीं
ओके यहां पे क्या-क्या मिलेगा इस पोस्ट
कार्ड को डिस्प्ले कराने के लिए आपको कुछ
प्रॉप्स पास करने पड़ेंगे जो आपको सीधा का
सीधा जब भी आप क्वेरी लगाएंगे तो आपको एप
राइट से वापस से मिल जाएगा ये तो वो मैं
आपको और भी आगे दिखा दूंगा एक आपको आईडी
चाहिए हां इसमें आईडी डॉलर आईडी करके लिखा
जाता है अ तो हां ये एप राइट का इशू है
अपना नहीं है इशू तो क्या है उनका
सिंटेक्स है ये टाइटल ले लीजिए और एक अपने
को चाहिए फीचर्ड इमेज
फीचर्ड इमेज वैसे तो बाकी और भी
इंफॉर्मेशन य देता है और इंफॉर्मेशन हमें
चाहिए नहीं आपका मन करे तो और डिस्प्ले कर
दीजिएगा व्यू काउंट वगैरह और अगर कुछ ले
रहे हैं तो हमारा अभी मन नहीं है हम तो
इतने में काम करेंगे सारा का सारा कार्ड
ही
क्लिकब्रिक्स
दे देते हैं और लिंक की खास बात क्या है
कि आपको पूरा यूआरएल नहीं देना पड़ता जहां
पे हो वहां से एजिस्ट आप आगे जा सकते हो
तो हम लिंकिंग कुछ इस तरह से रखेंगे अभी
हमने राउटर डिफाइन नहीं करा बट वहां पे हम
इस तरह से रखेंगे कि जो भी पोस्ट होगा
उसको पोस्ट स्लैश और उसका आईडी तो हम क्या
करते हैं य डॉलर साइन यह लीजिए एक वेरिएबल
इंजेक्ट कर देंगे वेरिएबल का नाम डॉलर
आईडी है अच्छा ये कंफ्यूज कर देता है कई
बार लोगों को एप राइट में कि सर वेरिएबल
का नाम डॉलर आईडी अरे इसको आप ऐसे भी तो
ले सकते थे तब भी तो यही लिखते हैं अब वो
अगर डॉलर आईडी देता है तो उस वेरिएबल में
क्यों छेड़छाड़ कर उसको डॉलर आईडी बोल
लेते हैं तो हां कई बार ऐसे सिंटेक्स हो
जाते हैं हो सकता है लोगों को थोड़ा बहुत
कंफ्यूज कर दे बट इतना भी कोई कंफ्यूजन
वाली बात है नहीं ओके तो अब हम करते हैं
हमारे लिंक के अंदर क्या डिस्प्ले करना है
यह पूरा सीएसएस है बस इतना सा ही काम था
यहां पे आते हैं क्लास नेम ऐड कर लेते हैं
विड्थ चाहिए फुल यह विड्थ हम बाद में
कंट्रोल कर लेंगे बीजी ड ग्रे 100 100 यूज
कर लेते हैं और राउंडेड एक्सेल थोड़ा सा
राउंडेड कार्ड मिल जाएगा अच्छा लगेगा
पेडिंगटन रख देते हैं थोड़ा अच्छा पैडिट
रहेगी मजा आएगा बस और तो क्या है इसके
अंदर भी एक डिव है जब हमने कार्ड्स बनाए
थे तो इस तरह से ही बनाए थे अब क्या कर
सकते हैं और इसके अंदर विड्थ वापस से फुल
ले लीजिए और हमने क्या जस्टिफाई सेंटर
यूज़ करा था जस्टिफाई सेंटर और क्या लिया
था मार्जिन बॉटम फोर ये
लीजिए ओके ये याद नहीं रहते हैं नोट्स में
से रेफरेंस देखते रहते हैं क्योंकि
क्लासेस सीएसएस वगैरह बिल्कुल याद नहीं
करते हैं बाकी देखिए जो लॉजिक पार्ट है
उसमें तो क्या ही देखना लॉजिक पार्ट तो आप
बस बोलते जाइए जितना आप बोलेंगे समझेंगे
खुद समझाएंगे उतना आप आराम से काम कर
लेंगे ठीक है अब इसके अंदर क्या है कुछ
नहीं ज्यादा एक इमेज लिया है और एक
टेक्स्ट लिया है हमने पहले इमेज ले लेते
हैं क्योंकि इमेज एक्चुअली में एक डिव के
अंदर है तो ये
सेंटर ओके एक बार मैं चेक कर लूं हां ये
तो ऐसे ही है इसके अंदर है हमारे पास एक
इमेज तो पहले एक ले लेते हैं इमेज ये
लीजिए इमेज आ गई इमेज के बाद क्या है
हमारे पास में ये जब डिव एंड हो जाता है
यहां पे तब हमारे पास में एक h2 है बस
इतना सा ही काम है h2 के अंदर वैल्यू जो
आपको दे रखी है ये लीजिए टाइटल ले लीजिए
और इमेज के अंदर क्या वैल्यू रखनी है अब
इमेज के अंदर यहां पे सोर्स के अंदर
वैल्यू डालनी है सोर्स के अंदर स्ट्रिंग
डालना है स्ट्रिंग डायरेक्ट नहीं डाल सकता
तो क्या करो कर्ली ब्रेसेज लो ये लीजिए
कर्ली ब्रेसेज ले लिया अब कोई री कोई
जरिया है क्या आपके पास जहां से आप एक
इमेज का प्रीव्यू ले पाओ अगर आपको याद हो
हम एप राइट में गए थे
कॉन्फिनेट फाइल प्रीव्यू नाम से एक मेथड
बनाया था जो सीधा फाइल आईडी आपको दे देता
है और यहां से जो आपको रिसोर्स मिलता है
रिटर्न बैक जो मिलता है इस फाइल आईडी को
पास करने के बाद वह सीधा का सीधा ही आपको
एक यूआरएल मिलता है तो हम क्या करते हैं
इस सोर्स से ही सीधा पूछ लेते हैं कि हमें
आईडी तो मिल ही रहा है जो भी इसको कॉल कर
रहा है इस कार्ड को वो आईडी तो दे ही रहा
है हमें तो डायरेक्ट ही पास कर देते हैं
ठीक है जी कर देते हैं तो एप राइट की जो
आपने सर्विस बनाई थी वहां पे एक मेथड जो
आपने बनाया था गेट फाइल प्रीव्यू अब इसके
अंदर क्या करो अ सीधा का सीधा जो आईडी है
वो पास कर दो अपनी फीचर्ड इमेज का ये
फीचर्ड इमेज ही एक्चुअली में क्योंकि हम
डेटाबेस के अंदर आईडी स्टोर करा रहे हैं
तो पोस्ट की आईडी तो ये आईडी है और इमेज
की आईडी अपने आप में हर उस पोस्ट के साथ
रहेगी तो वो आईडी अपने आप यहां से चल
जाएगी ठीक है अब इसके बाद क्या है ऑल
टेक्स्ट के अंदर ठीक है टाइटल डाल देते
हैं अपना कि किसकी है थोड़ा सा अच्छा
लगेगा बस और तो क्या हो जाएगा और क्या
चाहिए क्लास नेम भी ऐड कर देते हैं ये
लीजिए क्लास नेम उसका राउंडेड
डैश राउंडेड एक्सेल ले लेते हैं ठीक है
यहां पे भी हमारे जो h2 है इसके साथ भी
कुछ क्लासेस ऐड कर देते हैं वैसे तो देखिए
आपके मन के ऊपर है जितना क्लासेस आप को ऐड
करनी है करिए नहीं करना मत करिए कोई ऐसे
खास दिक्कत नहीं है फंक्शनैलिटी पर ज्यादा
फोकस है हमारा टेक्स्ट ड एक्सेल और क्या
चाहिए काफी कुछ आ गए फॉन्ट बोल्ड वगैरह
टेक्स्ट ग्रे बस इतना ही लेते हैं अभी
टेक्स्ट ग्रे वगैरह बाद में देखेंगे ठीक
है तो ये तो हो गया आपका जी पोस्ट कार्ड
तो देखा आपने पोस्ट कार्ड इतना कोई
डिफिकल्ट नहीं है सर्विसेस हो चाहे रिडक्स
हो हम थोड़ा सा काम आसान कर लेते हैं
हमारा चलिए इतना तो हो गया आपके पास इसको
भी हम हटा देते हैं अब चलते हैं हमारे
थोड़े से अच्छे कंपोनेंट्स के पास जहां से
आपको थोड़ी सी और क्लेरिटी मिलेगी थोड़ा
सा काम करना पड़ेगा बट क्लेरिटी अच्छी मिल
जाएगी
आपको अब हम चलते हैं हमारे लॉगिन देखिए ये
लॉगिन पेज नहीं है ये लॉगिन कंपोनेंट्स हम
बना रहे हैं ठीक है तो लॉगइन कंपोनेंट जब
हम बनाएंगे देखिए मैंने आपको यहां पर भी
बताया था जब हम थोड़ा सा डिस्कस कर रहे थे
कि हम चाहे तो डायरेक्टली इस तरह से भी
बना सकते हैं इनपुट वगैरह बट एक्चुअली में
हम इस तरह से पूरा नहीं कर रहे हैं
क्योंकि देखिए आप आज चाहे इसको स्किप कर
दें लेकिन इवेंचर में जाएंगे किसी भी
कंपनी में स्टार्टअप में काम करेंगे तो
कुछ
कॉम्प्लेक्शन नहीं है वो इन फ्यूचर
स्केलेबिलिटी के लिए है वहां पे जब कॉम
बहुत बड़ी एप्लीकेशन हो जाती है तो वहां
पे काम आते हैं तो एक हम जो यहां पे यूज़
कर रहे हैं जो हमने ऑलरेडी इंस्टॉल कर रखा
है वो रिएक्ट हुक फॉर्म है वैसे तो इससे
भी
कॉम्प्लेक्शन स्टार्टेड एपीआई वगैरह इसके
रिसोर्सेस वगैरह सब पढ़ सकते हो देखिए
गेटिंग स्टार्टेड में इसने पूरा दे रखा है
रजिस्टर फील्ड्स वगैरह इन सब का हम यूज़
करेंगे हम ऑलमोस्ट इसी तरह से यूज़ करने
वाले हैं बट यहां पे एक जो चीज लोगों को
अक्सर कंफ्यूज कर देती है वह है यह
रजिस्टर यह रजिस्टर कोई साइनअप रजिस्टर
वाला नहीं है यह रजिस्टर क्या है एक्चुअली
में फॉर्म हैंडलिंग का एक तरीका है देखिए
सेलेक्ट फील्ड में भी डॉट डॉट स्ल रजिस्टर
लिखा जा रहा है इसका एक सिंटेक्स है यह
सिंटेक्स हम यूज़ करते हैं यहां पे उसके
बाद हैंडल सबमिट है हैंडल सबमिट तो एक
मेथड है जो आपको बनाना ही पड़ता है उसका
कोई ऑप्शन नहीं है अपने पास लेकिन यह जो
रजिस्टर है ना यह अक्सर लोगों को कंफ्यूज
करता है तो आप चिंता मत कीजिए अ
डॉक्यूमेंटेशन से ही देख रहे हैं हम सारा
का सारा लेकिन इसको कैसे यूज करते हैं वो
मैं आपको एक थोड़ा सा इस डॉक्यूमेंटेशन से
भी आसान तरीका बता सकता हूं तो उसी तरीके
के पेपर हम काम करेंगे तो फटाफट से कमेंट
सेक्शन के अंदर अपनी अटेंडेंस दे दो आज
थोड़ी सी लेट हो गई ना अटेंडेंस फटाफट
कमेंट सेक्शन में अटेंडेंस देके आओ तब तक
मैं यहां पे एक नई फाइल बनाता हूं तो नई
फाइल बनाते हैं और इसका नाम दे देते हैं
पहले लॉग इन रजिस्टर भी बना ही लेंगे साथ
के साथ कोई दिक्कत नहीं है ओके अपना
आरएफसी ये लीजिए लॉगइन कंपोनेंट बन गया
उप्स
और एस्केप ठीक है अब यहां पे पहले तो हम
इंपोर्ट कर लेते हैं जो जो चीजें हमें
चाहिए गी रिएक्ट तो चाहिए चाहिए स्टेट भी
चाहिए स्टेट भी मैनेज करनी पड़ेगी यहां पे
यूज स्टेट ये तो बेसिक है कोई दिक्कत वाली
बात ही नहीं है इसमें तो अच्छा सबसे पहले
लिंक चाहिए यूज नेविगेट चाएगा क्योंकि
लॉगइन के बाद कहीं तो भेजोगे ना उसको तो
ठीक है और क्लिके बल भी चाहिए तो हम क्या
करते हैं लिंक ले लेते हैं और क्या चाहिए
हमें यूज नेविगेट दोनों ही ले लेते हैं जो
काम में आएगा वो ठीक है नहीं आएगा उसको
हटा देंगे ठीक है
नेवी गेट फ्रॉम रिएक्ट राउटर डम अच्छा
उसके अलावा हमें क्या चाहिए जो हमारी ऑथ
स्लाइस है ना उसके अंदर से भी लॉगिन चाहिए
हमें ठीक है तो अगर आपको याद हो हम इसको
एक्चुअली में लेके आते हैं स्टोर से स्टोर
के अंदर हमारे पास है यह ऑ स्लाइस है
क्या-क्या हमने लिया है लॉग इन और लॉग आउट
हमने लिया है ठीक है लॉग इन लॉग आउट को
थोड़ा सा हां एक और चीज आपको बता देता हूं
वैसे तो आप ऐसे भी कर सकते हो तो इंपोर्ट
कर लो आप अपना यह लॉगइन यह थ स्टोर से ऑथ
स्लाइस से लेकिन अगर आपको इसका नाम चेंज
करना हो वैसे तो ज्यादा जरूरत है नहीं
इसको चेंज करने की बट आप चाहो तो इसको ऐसे
भी लिख सकते हो ऑथ लॉगइन अ बस होता कुछ
नहीं है वो लॉगिन ही है बट हम उसको अपने
पूरे सोर्स कोड में ऑथ लॉगइन बोलेंगे हां
ये सिंटेक्स भी आप कई बार देखोगे अब आप
कहोगे सर इतना क्या इंट्रोड्यूस करने की
जरूरत है ये सारे सिनेरियो हैं आगे जाके
इन सिनेरियो में पढ़ोगे और उसके बाद सोर्स
कोड समझ में नहीं आएगा कैसे ओपन सोर्स
वगैरह में कंट्रीब्यूट करोगे जब मल्टीपल
सोर्स कोड ही समझने में दिक्कत हो रही है
चीजें कि है ओके और क्या-क्या चाहिए देखिए
बटन तो चाहिए चाहिए अभी जस्ट बनाया इतनी
कहानी करी थी उसके बाद इनपुट भी चाहिए और
क्या चाहिए और सेलेक्ट भी चाहिए सेलेक्ट
चाहिए क्या यहां पे नहीं लॉगिन में तो कोई
सेलेक्ट है ही नहीं लोगो ले लेते हैं वैसे
तो लोगो में ऐसा कुछ है नहीं अ
लोगो ठीक है जी आप तो आ जाएंगे कहां से अ
डॉट स् इंक्स से ये लीजिए आ गए आप ओके
उसके बाद ऑथ की सर्विस तो लगेगी लगेगी
इंपोर्ट लॉगिन बना रहे हो थ की सर्विस तो
लगेगी लगेगी ठीक है और डिस्पैच भी लगेगा
तो ठीक है डिस्पैच ले लेते हैं पहले सजेशन
में आ गया है तो और थ की सर्विस ले लेते
हैं यह लीजिए
थ
सर्विस सजेशन नहीं आ रहे थ सर्विस फ्रॉम
कहां से आएगी हम क्या करते हैं एक
डायरेक्टरी बाहर जाते हैं पप राइट के अंदर
जाते हैं और बोलते हैं उससे कि आप यह ऑथ
दीजिए हमें तब हम थ सर्विस आप से ले लेंगे
ठीक है जी और सबसे इंपॉर्टेंट चीज यह
लगेगा हमें यूज फॉर्म फ्रॉम रिएक्ट हुक
फॉर्म जब भी आप रिएक्ट फॉर्म यूज करोगे
आपको यही एक ट्यूटोरियल देना है टाइम
स्टैंप ऐड कर देना कि यहां से हमारा यूज
फॉर्म रिएक्ट का फॉर्म जो है वो सारा का
सारा स्टार्ट हो रहा है एक बार ये
ट्यूटोरियल देखोगे बस उसके बाद आपको सारा
समझ में आ जाएगा सिर्फ एक एग्जांपल उसके
बाद तो मेरे आगे आगे आप जवाब दोगे कि हां
किस तरह से यूज करना है अच्छा अब क्या
करते हैं पहले सबसे पहले जितनी सर्विसेस
वगैरह सब हमने इतना सारा ड्रामा लिया है
उनको हम यूज कर लेते हैं पहले लॉजिक पार्ट
में तो सबसे पहले नेविगेट तो लोगे ही लोगे
है ना इसीलिए तो लेके आया यूज नेविगेशन
ठीक है डिस्पैच भी तो लाए हो तो डिस्पैच
भी ले आए ठीक है जी डिस्पैच भी आ गया
अच्छा यूज फॉर्म लेके आए हो यूज फॉर्म में
क्या होता है देखिए यूज फॉर्म के अंदर
हमने क्या करा है एक तो बोला है उसको
रजिस्टर और एक बोला है हैंडल सबमिट एज इट
इज ले आते हैं ठीक है अभी के लिए आगे जाके
मैनिपुलेशन वगैरह भी सीख जाएंगे तो हम
क्या करते हैं एक तो ले लेते हैं अपना
रजिस्टर सजेशन में कुछ ज्यादा ही है और एक
ले लेते हैं अपने हैंडल
सबमिट ये लीजिए और यह हो गया हमारा एंड और
ये यूज फॉर्म से आ गया अभी के लिए इतना ही
एज इट इज ज्यादा
कॉम्प्लेक्टेड इसलिए कर रहे हैं क्योंकि
एरर्स डिस्प्ले कराने के लिए क्योंकि
एरर्स भी तो आ सकती है और सेट एरर अभी के
लिए उसके अंदर नल दे देते हैं या फिर एमटी
स्ट्रिंग दे देते हैं ये लीजिए आपके ऊपर
है जैसा भी चाहे ठीक है अब क्या है सबसे
पहले तो हम एक मेथड बनाएंगे यहां पे जो कि
होगा हमारे पास में लॉगइन अच्छा हमारे पास
तो हैंडल सबमिट है हां जी हैंडल सबमिट है
पर मेथड का नाम लॉगइन दे रहे हो हां देंगे
इसीलिए ही लॉगइन देंगे ताकि आप कंफ्यूज ना
हो कि हैंडल सबमिट नाम से मेथड बनाना था
ना नहीं नहीं यूसेज थोड़ा सा अलग है
इसीलिए जान पूछ के यहां पे हम उस मेथड का
नाम लॉग इन देंगे ठीक है लॉगइन में होगा
कुछ खास नहीं वही लॉगइन करेंगे बस और क्या
अस सिंक मेथड होगा क्योंकि ऑब्स सी बात है
इंफॉर्मेशन सबमिट होगी वापस आएगी काफी कुछ
हो सकता है और यहां पे हम देंगे अपना यह
डाटा अ डाटा के अंदर क्या है वह भी
बताएंगे अभी आपको और यह लीजिए यह हो गया
हमारा बेसिक अच्छा सबसे पहले क्या करो
जैसे ही लॉगइन जब भी सेट करो तो सबसे पहले
एरर्स को एमटी आउट कर दो यह एक बेसिक
फंक्शन लिटी है जितने भी लॉगइन फॉर्म
रजिस्टर फॉर्म बनाओगे इसी तरह से ही बनाना
क्योंकि एरर्स हैं लेकिन जैसे ही आपने
सबमिशन स्टार्ट करा अब तो एरर क्लीन हो ही
जानी चाहिए थी तो वहां पे एरर्स को क्लीन
कर दो उसके बाद हम क्या करेंगे एक ट्राई
कैच सेशन करते हैं देखते हैं सेंड करके
देखते हैं अपना सारा डाटा कि एक्चुअली में
वो डाटा जाता भी है या नहीं जाता है तो हम
ट्राई कैच यूज़ करते हैं बेसिक सा ये हो
गया हमारा ट्राई कैच ये लीजिए अगर एरर आया
तो हम क्या करेंगे अब यहां पे सबसे अच्छी
बात है कि मैं सेट एरर दोबारा से यूज कर
सकता हूं और उस एरर के अंदर जो भी एरर
मैसेज है वो मैंने स्टेट में सेव कर लिया
है अब कंडीशनल रेंडरिंग कर लूंगा कि एरर
दिखाना है नहीं दिखाना टॉप पर दिखाना है
हर इनपुट प जैसे भी कर सके वो हम कर लेंगे
बाद में अब आते हैं ट्राई कैच पे ट्राई
कैच में असं लगा रखा है तो अवेट करना ही
पड़ेगा कि मैं यहीं पर रुकना चाहता हूं
आगे नहीं बढ़ना चाहता और हम क्या करेंगे
एक ऑ सर्विस है इसके पास एक हमें को पता
है मेथड है एक लॉगिन तो यह लीजिए लॉगिन
हमने मेथड ले
लिया यह लीजिए लॉगिन ले लिया ओके लॉगिन के
पास भेज दो डेटा डेटा के अंदर क्या है वो
हम देखेंगे अभी क्योंकि टा पूरा रैपर आपको
मिल जाता है तो चिंता मत कीजिए ऑब्जेक्ट
ही जाएगा वहां पर उसके बारे में भी हम बता
देंगे ठीक है अब क्या करो यहां से जो भी
आपके पास रिस्पांस आता है वो आता है
एक्चुअली में एक
सेशन यह लीजिए आपने एक वेरिएबल में स्टोर
करके रख लिया अब अगर सेशन है तो यूजर लगड
इन है अगर सेशन नहीं मिला है तो मतलब यूजर
लगड इन नहीं है तो हमें चेक करना पड़ेगा
तो पहले इफ एल्स लगाइए ये लीजिए इ एल्स
लगाते हैं आप क्या करिए सबसे पहले चेक
करिए सेशन है भी या नहीं है अगर सेशन है
तो क्या करिए सबसे पहले तो हम यूजर डाटा
निकालते हैं तो यह लीजिए यूजर डटा यूजर
डाटा कैसे निकलेगा अवेट से ही निकलेगा
हमेशा ध्यान रखिएगा यूजर डाटा ऐसे ही
निकलेगा क्योंकि यूजर डाटा कोई सेशन से
नहीं निकाल रहे हैं आप गेट करंट यूजर मेथड
को कॉल करके निकाल रहे हैं तो हम क्या कर
रहे हैं अपनी य ऑथ सर्विस है इसको बोल रहे
हैं कि आप क्या करो गेट करंट यूजर हां जी
गेट करंट यूजर को कॉल कर दो कोई मैं आपको
पैरामीटर देने की जरूरत नहीं है अगर हमारे
पास अब यूजर डाटा आया है तो क्या करना
पड़ेगा डिस्पैच करना पड़ेगा तो
इफ हमारे पास यूजर डटा आता है तो ही हम ये
काम करेंगे तो डायरेक्टली कर लेते हैं इफ
यूजर डाटा आया है तो आप क्या करो सीधा का
सीधा ही डिस्पैच करा दो हां डिस्पैच करा
देते हैं ये लीजिए डिस्पैच वन लाइनर ही कर
देते हैं तो डिस्पैच कराने के टाइम क्या
करना पड़ेगा ऑथ लॉगिन ऑथ लॉगिन क्यों
इसीलिए क्योंकि ये जो डिस्पैच है ना ये हम
जो स्टोर से लेके आए हैं क्योंकि लॉगिन
लॉगइन क्या है थोड़ा सा कंफ्यूज हो जाते
हैं हम इसीलिए क्योंकि देखिए यहां पे भी थ
सर्विस लॉगइन कर रहे हैं यहां पे भी लॉगइन
तो हमने क्या करा ऑथ लॉगइन बना लिया या
फिर आप इसको स्टोर लॉगइन भी बोल सकते थे
जो भी आपका मन करे तो हमने इसलिए बोल दिया
और यहां पे हमने सारा यूजर डाटा पास कर
दिया अब देखिए सबसे अच्छी बात क्या है कि
ये जो लॉगइन है ना हमारे स्टोर के अंदर
हमने जो लिखा है अ ये सिर्फ लॉगइन वाला
कॉल करेंगे स्टेटस तो अपने आप ये ट्रू सेट
कर देगा वो तो हमने कर ही रखा है हर बार
कि लॉगिन अगर कॉल कर रहे हो तो स्टेटस
ट्रू हो ही जाएगा आपका और यह डाटा आपके
पास हो जाएगा अब चेकिंग हमने यहां ऑलरेडी
कर लि कि यूजर डाटा है तो कॉल करेंगे वरना
करेंगे ही नहीं तो कभी भी मिस मैच नहीं
होगा अच्छा अब यूजर अगर यहां पर आ चुका है
पूरा काम उसका अगर हो गया है तो उसको यहां
रखना ही क्यों है हां क्योंकि लॉगइन तो हो
गया है लॉगइन कर गया तो उसको कहीं और भेजो
तो भेजते टाइम क्या करेंगे नेविगेट कर दो
उसको राउट पे बस राउट नहीं सॉरी रूट पे
यहां पे लॉगइन हमने कर दिया है नेविगेट कर
दिया है क्योंकि लिंक पे अगर करते हैं तो
वो क्या है खुद से नेविगेट नहीं होता लिंक
पे हमेशा क्लिक करना पड़ता है नेविगेट से
आप प्रोग्रामेटिकली उसको कहीं और भेज सकते
हो ठीक है तो काफी काम हुआ यहां पे ये
सारा काम था लॉजिक का अच्छा जी ठीक है अब
आते हैं हमारे लॉगइन के ऊपर अब लॉगइन पे
क्या है जितनी क्लासेस वगैरह सब होगी ना
वो तो हम देखिए कॉपी पेस्ट करेंगे क्योंकि
वहां पर मेरे को टाइम वेस्ट नहीं करना है
जहां इंपॉर्टेंट काम है हमारा वहां पर हम
एक्चुअली में डिस्कशन करेंगे तो चलिए इसको
हटाते हैं सबसे पहले और यहां
पे ये लीजिए सबसे पहले यहां पर क्लास नेम
क्लासेस हम डायरेक्टली ऐड करेंगे सजेशन से
नहीं लेंगे हमारे पास है नोट्स के अंदर
ऑलरेडी लिख रखी है सारी क्लासेस ये तो हो
गया हमारा पहला डिव ठीक है जी अब इस डिव
के अंदर एक और डिव है हां जी बहुत सारे
डिब्स बनाए हुए हैं यहां पे ठीक है क्लास
नेम हमने ऐड कर दी और क्लास नेम के अंदर
कुछ भी नहीं है सीधा का सीधा वैल्यूज है
बस ये इस पर ज्यादा चर्चा करने की कोई
दिक्कत है नहीं डिव है उसके अंदर क्लासेस
हैं इधर-उधर वैल्यूज को सिंपली सेव कर रही
है अच्छा इसके बाद एक और डिव है जहां पर
हमने अपना लोगो रखा है तो मैं वो भी आपके
सामने डायरेक्टली ले आता हूं कुछ भी नहीं
यहां से यहां तक का कोड आया है हमारे पास
में ठीक है इसको लेते हैं ये लीजिए कुछ भी
नहीं इसमें कुछ क्लासेस है लोगो ऐड कर
दिया आपने विड्थ वगैरह ले आए लोगो हमने
यहां पे लोगो लाए थे क्या हम हां जी ये
लोगो लाए थे हम और हमने एज इट इज उसको
डिस्प्ले कर दिया है तो यहां तक भी कोई
दिक्कत है नहीं उसके बाद क्या है हमारे
पास में इस डिव के बाद एक h2 लिखा हुआ है
साइन इन वाला इस डिव के बाद में तो ये एक
h2 हम लिया है कि साइन इन टू योर अकाउंट
अब देखिए
एटीएमएल पढ़ा चुका हूं चैनल पे तो उसमें
कोई हमें इतनी प्रॉब्लम वाली बात नहीं है
अच्छा h2 के बाद क्या है हमारे पास में
कुछ लिंक्स वगैरह है तो ये पैराग्राफ
वगैरह है इसको भी मैं ले आता हूं यहां पे
तो h2 के बाद यह बेसिक हमारे पास में ले
आया अब इसमें क्या है कुछ नहीं डोंट हैव
एन अकाउंट तो हमने रीडायरेक्ट करवा दिया
उसको साइन अप पे तो लोग ब क्लिक करके साइन
अप पे भी जा सकते हैं ठीक है अभी तक तो
कोई दिक्कत नहीं है अच्छा अब इंटरेस्टिंग
चीज क्या आती है कि पैराग्राफ के बाद अ
जिसके बाद भी नहीं है तो हम यहां पे एरर
डिस्प्ले करवाना चाहते हैं तो एरर कैसे
डिस्प्ले करेंगे एरर डिस्प्ले के लिए एक
हमने जावास्क्रिप्ट ओपन करा अगर एरर है तो
डिस्प्ले कराओ वही अपना पुराना क्लासिक
सिंटेक्स m पर वाला ये लीजिए आप चाहे तो
फल्स भी लगा सकते हैं यहां पे बट ये बड़ा
ही बेसिक सा सिंटेक्स है तो यह हमने एक
पैराग्राफ
लिया और इस पैराग्राफ के अंदर हमारे पास
क्लास टेक्स्ट रेड वगैरह खुद ही सजेशन
इसने दे दिया है कि ठीक है क्योंकि
यूजुअली एरर्स इसी तरह से होता है अ वैसे
हमारे पास खुद की क्लासेस भी हैं हम वही
ज्यादा प्रेफर करेंगे कि उन्हीं को ऐड कर
दें वरना कल को इधर-उधर सिंटेक्स हट गया
तो इतनी जो मेहनत करी थी प्रोजेक्ट बनाने
में व वापस से करनी पड़ जाएगी ज्यादा तो
नहीं बट हां क्लासेस ही हैं ठीक है इतना
तो काम हो गया कि जी एरर्स वगैरह आपके पास
आ गई है सारा काम हो गया है अब
इंटरेस्टिंग कहानी स्टार्ट होती है यहां
से आपकी फॉर्म की तो सबसे पहले बनेगा एक
फॉर्म ठीक है जी तो बना लेते हैं फॉर्म ये
लीजिए एक फॉर्म अब फॉर्म के अंदर क्या है
यह आपको एक्शन वगैरह कुछ नहीं रखा है
फॉर्म के अंदर एक मेजर एक्टिविटी जो होती
है वो होती है ऑन सबमिट ये लीजिए अच्छा ऑन
सबमिट पे क्या करना चाहते हो यहां देखिएगा
गौर से किस तरह से होता है यह जो फॉर्म
लेके आए थे आप इससे क्या निकाला आपने
रजिस्टर निकाला एक हैंडल सबमिट निकाला तो
फॉर्म जब भी सबमिट होगा तो वहां पे हैंडल
सबमिट ही यूज़ होगा हैंडल सबमिट एक मेथड
है जहां पे आप अपना मेथड देते हो कि मैं
इस तरह से फॉर्म को हैंडल करूंगा समझे
यहां पे कई बार लोग कंफ्यूज हो जाते हैं
कि हैंडल सबमिट जब एक मेथड ही है तो मैं
मेरा नाम भी हैंडल सबमिट रखता हूं नहीं
नहीं नहीं हैंडल सबमिट एक्चुअली में एक
कीवर्ड अब बन चुका है क्योंकि ये यूज
फॉर्म से हमारे पास आया है और यह अपने आप
में एक मेथड है तो प्लीज इस नाम से मत
बनाइए हैंडल सबमिट आपको जो भी नाम रखना है
हैंडल सबमिट छोड़ के रखिएगा क्योंकि फॉर्म
जब पूरा सबमिट होगा तो हैंडल सबमिट
एक्चुअली में इवेंट है ये भी एक इवेंट है
वो कॉल होता है अब ये इवेंट इसलिए जरूरी
है क्योंकि आपके जितने भी इनपुट फील्ड्स
वगैरह वहां पर दोगे वहां पर हम इस रजिस्टर
को यूज करते हैं तो ऑटोमेटिक जो आपने
वैल्यूज वहां लिखी है उनका स्टेट आपको
मैनेज नहीं करना है वहां से अपने आप वो
वैल्यूज पिक करेगा और हैंडल सबमिट होते
टाइम वो सारी वैल्यूज ले लेगा समझे इसलिए
हम यूज करते हैं इसको तो यह थोड़ा सा एक
छोटा सा कांसेप्ट है ज्यादा कुछ नहीं है
बट हां समझना जरूरी है और इसी तरह से
मोस्टली डिजाइन होते हैं ओके इतना तो हो
गया हमारे पास में अब क्या करते हैं यहां
पर क्लास नेम भी एक ऐड है देखिए क्लासेस
वैसे तो मुझे ज्यादा पसंद आती नहीं है बट
क्या करें इनके बगैर काम भी नहीं चलता है
मार्जिन टॉप एक एट का है बस और कुछ भी
नहीं है इतना तो चलेगा ठीक है ये आ गया
हमारे पास में फॉर्म अब फॉर्म के अंदर
क्या है फिर से एक डिव है ठीक है जी ये
डिव इस डिव के अंदर कुछ नहीं क्लासेस है
क्लासेस भी नहीं क्लास ही है स्पेस डवा ड
फ एक वाई एक्सिस पे स्पेसिंग ले रखे है
अच्छा अब देखिए यहां पर जो मैं इनपुट
बनाने वाला हूं इस इनपुट को एक बार आप देख
लेंगे तो आप भी अगला इनपुट बना देंगे द
अगर गौर से देखा तो देखिए सबसे पहले मैंने
लिया एक इनपुट ये इनपुट कौन सा वाला है
हां मेरा जो कंपोनेंट है वो वाला इनपुट है
ठीक है जी ये हमने एक इनपुट बना दिया
सेल्फ क्लोजिंग ही बना लेते हैं इनपुट को
सबसे पहले तो एक लेबल पास कर रहा हूं मैं
अच्छा ये लेबल मैंने पास करा ईमेल का ईमेल
कलन कुछ इस तरह से जो भी मेरे को करना था
तो लेबल वैल्यू ओवरराइट हो जाएगी वहां पे
हां जी प्लेस होल्डर पास कर देता हूं ये
लीजिए एंटर योर ईमेल अच्छा अब प्लेस
होल्डर पास कर दिया वहां पर तो हम हमारे
इनपुट में प्लेस होल्डर कभी एक्सपेक्ट ही
नहीं कर रहे थे अच्छा हां यह तो है ही बात
क्योंकि मैंने यहां पर बाकी प्रॉप्स भी
डिस्प्ले करवा रखे हैं कि आप बाकी के
जितने प्रॉप्स है वो इनपुट में डिस्प्ले
कर दो तो इस तरह के अगर और भी प्रॉप्स हैं
तो वह भी अपने आप में आ जाएंगे अच्छा इसके
अलावा आप क्या कर सकते हो एक यहां पे टाइप
भी दे सकते हो अब टाइप तो टेक्स्ट ही है
लेकिन ईमेल दे देंगे तो वो रेट वगैरह यह
सब अपना काम कर देगा ठीक है जी अब दूसरी
चीज क्या है अब दूसरी चीज आती है एक यहां
पे जावास्क्रिप्ट हां जी ये जावास्क्रिप्ट
क्या है जितने भी इनपुट फील्ड इस तरह से
बनाओगे चाहे सेलेक्ट होहे कोई भी हो यहां
पे आपको एक सिंटेक्स लिखना होता है
क्योंकि हम यूज फॉर्म यूज कर रहे हैं वह
है डॉट डॉट डॉट रजिस्टर यह डॉट डॉट डॉट
लिखना जरूरी है अगर डॉट डॉट डॉट नहीं
लिखोगे तो पता है क्या होगा कि किसी और
इनपुट में भी अगर आप रजिस्टर यूज करते हो
तो उसकी वैल्यू ओवरराइट हो जाएगी तो हर
बार स्प्रेड करना पड़ेगा इसको यह कंपलसरी
है 100% है ठीक है आप तो स्प्रेड वगैरह
मेरी सीरीज से पढ़ के आए हो तो आपको पता
है कि हां सारी वैल्यूज एक्सट्रैक्ट कर
लेते हैं हम अच्छा यह रजिस्टर अपने आप में
एक यहां पे इसका सिंटेक्स है यूज करने का
तो ये हम इस तरह से यूज करते हैं हां जी
थोड़ा सा वियर्ड है लेकिन यहां पर सबसे
पहला जो है वो हम नाम देंगे ईमेल ये यूनिक
रखना यह हमारा इनपुट जो है ईमेल के लिए है
यह वाला इनपुट हमारा पासवर्ड के लिए तो ये
नेम थोड़ा सा इंपॉर्टेंट है क्योंकि आपका
फाइनल जो ऑब्जेक्ट है स्प्रेड होगा वो जो
डेटा के अंदर आता है वो इसी के बेसिस पर
आता है तो यहां पे ये जो डटा है ना वो इसी
तरह से आता है ठीक है तो यह मेथड जो कॉल
कर रहा है यहां डटा ऐसे ही पास होता
है
ओके जी छोटा सा ब्रेक और वापस आ गए हम ठीक
है आप भी पानी पानी लेके बैठिए आराम से
ठीक है ये तो हो गया हमारा काम कहां पे गए
हम हां ये रहा ईमेल तो पहली तो जो है ये
की वैल्यूज है एक्चुअली में तो रजिस्टर के
अंदर हमने एक वैल्यू तो ले ली अब दूसरी जो
चीज है वो है ऑब्जेक्ट हां जी इस ऑब्जेक्ट
में क्या होता है आप ऑप्शंस पास करते हो
बहुत सारे ऑप्शंस है जितना डॉक्यूमेंटेशन
पढ़ोगे उतने ऑप्शंस मिल जाएंगे आपको तो
देखिए कुछ ऑप्शंस तो मुझे पता है जो यहां
पे यूज होंगे वो हम करेंगे ही देखिए पहला
ऑप्शन तो है हमारे पास रिक्वायर्ड और
रिक्वायर्ड है ट्रू अच्छा दूसरा एक और
ऑप्शन आता है जो मैंने चैट जीपीटी से
लिखवाया है वो है पैटर्न अच्छा क्या है कि
पैटर्न ऐसे नहीं लिखते हैं यहां पे
वैलिडेट लिखना पड़ता है वैलिडेट उसका नाम
है अब वैलिडेट के अंदर क्या कर सकते हो आप
एक ऑब्जेक्ट पास कर सकते हो और फरदर उसके
अंदर आप दे सकते हो कि कौन सा पैटर्न मैच
करना है तो यहां पर इसने दे रखा है अ
मैच मैच नहीं दे रहा सजेशन मैच पैटर्न
हां जी ये मैच पैटर्न ठीक है अब मैच
पैटर्न के अंदर हां इसी तरह से वैल्यू
जाती है और आपको जो भी वैल्यू लिखनी है हम
क्या करते हैं डायरेक्ट वैल्यू को ही लिख
देते हैं अच्छा यहां पे मैंने ये जो है ना
एक छोटा सा मैं सिंटेक्स आपको बताता हूं
यह मैंने एक्चुअली में लिखवाया पूरा का
पूरा चैट जीपीटी से किस तरह का ईमेल
एड्रेस और ये सब वैल्यूज लिखते हैं ठीक है
तो यह मैं डायरेक्टली यहां पे लिख देता
हूं तो यह है क्या एक्चुअली में इसको
बोलते हैं रेक्स रेगुलर एक्सप्रेशन यह
मुझे भी लिखना नहीं आता है मैं आपको एक
रिसोर्स बता देता हूं जब भी आपको चाहिए आप
इस तरह से
जाइएगा
और रेक्स पी रेक्स आर हां जी ये एक
रिसोर्स है मैं भी यहीं से लेता हूं मुझे
जो भी रेगुलर एक्सप्रेशन चाहिए मोस्टली य
कम्युनिटी से ले लेता हूं या फिर मैं चैट
जीपीटी से ले लेता हूं तो जैसे कम्युनिटी
पैटर्न यहां पे है तो आप सर्च कर सकते हो
जैसे मुझे ईमेल का चाहिए था तो मैंने ईमेल
बस सर्च करा और इसने ही मुझे दे दिया होप
फुली थोड़ा जल्दी दे
दे तो यहां से हम सारी वैल्यूज लेते हैं
यह रहा तो ईमेल वैलिडेटर जो भी आपको पसंद
आए वो वाला आप ले सकते हैं बड़े ही
कॉम्प्लेक्शन इस तरह के तो मैंने एक इसमें
से इजी वाला चूज कर लिया कि यार मुझे तो
बेसिक वाला दे दो एक ये तो हमने यह वाला
यूज़ कर लिया आप चाहे तो इसको लोड कर सकते
हो यहां पे तो अब यहां पे आप कोई भी ईमेल
वगैरह लिखोगे तो उसको हाईलाइट वे कर देता
है जैसे सपोज करिए हितेश @ gmail.com इस
तरह से लेंगे तो क्या वह हाईलाइट हो रहा
है नहीं हो रहा है उस तरह से ईमेल
वैलिडेशन और यह सब आपके पास आ जाता है अ
आपको देखना है कि किस तरह से
जावास्क्रिप्ट वगैरह काफी देता है मैंने
इसी में से यह बेसिक पैटर्न यूज़ करा है
और एज इट इज वहां ले लिया यह वाला मैंने
चैट जीपीटी से बनवाया था कि प्लीज मुझे इस
तरह की वैल्यू दे दो अच्छा ए इंटरेस्टिंग
बात क्या है यहां पे जो भी आपका पैटर्न है
वो स्लैशेस के अंदर लिखा जाता है यहां तक
यह है पैटर्न इसके बाद आप लगाओ सीधा डॉट
और बोलो उसको टेस्ट फॉर वैल्यू तो यहां पे
जो भी आपने उस वैल्यू का नाम दिया है उस
वैल्यू का नाम एज इट इज आप यहां लिख देना
तो जो भी वैल्यू मिली है इस एक्सप्रेशन से
टेस्ट हो रही है तो ठीक है अगर नहीं हो
रही तो यहां पे एक और लगता है और यहां पे
ईमेल एड मस्ट बी वैलिड एड्रेस अच्छा यह सब
इंफॉर्मेशन आई कहां से यह सब इंफॉर्मेशन
यहां से आई है कि अप्लाई वैलिडेशन वाला जो
है यह इसने बताया कि किस तरह से वैलिडेशन
करना है तो एगजैक्टली यहां पर भी इन्होंने
यह बताया कि हां आपको अगर रेगुलर
एक्सप्रेशन एसिस्टिंग फॉर्म किस तरह से
आपको अगर चेक करना है तो आप यहां से चेक
कर सकते हो तो हां सारी ग्लोबल वैल्यूज यह
सब यहीं से आ रहा है तो ऐसा कुछ नहीं है
कि हमने कुछ हवा में लिख दिया है यहीं से
डॉक्यूमेंटेशन से पढ़ा है और सारा काम
वहीं से स्कीमा वैलिडेशन का किया है ठीक
है तो देखा जाए तो इतना
कॉम्प्लेक्शन हमने सीखी रिपीट इंफॉर्मेशन
है सबसे पहला हमने क्या सीखा कि जब भी
इनपुट लेंगे सबसे पहले तो हैंडल सबमिट
वाली बात समझ में आई गई है दूसरी चीज क्या
है स्प्रेड करना है रजिस्टर को और यहां पर
देनी है की ईमेल पासवर्ड अलग-अलग फिर देने
है आपको ऑप्शन अब ऑप्शन आपके ऊपर है आप
देना चाहे दीजिए नहीं देना चाहे वैलिडेट
वगैरह मत दीजिए बस मैंने इसलिए दिया है कि
अ
कस्टम इनपुट फील्ड लिया है यह लीजिए हो
गया तैयार अब इस इनपुट फील्ड में
क्या-क्या चाहिए लेबल ले लेते हैं एक तो
यह लीजिए लेबल पासवर्ड हमने ले लिया टाइप
भी दे देते हैं उसको ये लीजिए टाइप
पासवर्ड हमने दे दिया प्लेस होल्डर भी दे
देते हैं क्योंकि वहां पे भी तो वैल्यूज
सारी एक्सपेक्ट कर रहे हैं हम ठीक है यह
तो हो गया बेसिक अब क्या करना है अब हमें
क्या करना है यह अपने जावास्क्रिप्ट ओपन
करना है स्प्रेड करना जरूरी है यह लीजिए
रजिस्टर रजिस्टर क्या है इस तरह से काम
में आता है सबसे पहले की देनी पड़ेगी इसको
ये लीजिए की दे देते हैं तो की हम नाम दे
देते हैं पासवर्ड उसके बाद और क्या देना
है ऑब्जेक्ट्स पास कर सकते हैं यह लीजिए
ऑब्जेक्ट्स मन करे तो पास करिए मन करे तो
मत करिए जैसे मेरा मन यहां पे नहीं है तो
मैं एक सिर्फ रिक्वायर्ड को ट्रू करके
यहां पे पास कर देता हूं बस इतना ही है
मुझे नहीं जाना उस वैलिडेट में इतना सब ये
सब नहीं करना मुझे तो मत करिए कोई दिक्कत
वाली बात नहीं है ठीक है तो ये तो हो गया
हमारा इनपुट अच्छा अब इनपुट फील्ड हो गया
तो एक बटन भी चाहिए तो ये लीजिए हमारा
कस्टम डिजाइन बटन अब तो क्योंकि बना ही
लिया है तो बटन ये लीजिए अब इस बटन के
अंदर वैल्यूज कैसे पास करनी पड़ेगी वो सब
अ तो देखिए बटन आपके ऊपर है कैसे वैल्यूज
पास करो क्या नहीं करो आपके ऊपर है टोटली
हम यहां पर डायरेक्टली लिख देते हैं साइन
इन आप चाहो तो चिल्ड्रेंस वगैरह वो सब पास
करके भी आप पूरी तरह से यूज करना है तो
आपके ऊपर है आप यूज करिए जैसे ये बटन है
हमने यहां पर चिल्ड्रन दे रखा है तो
चिल्ड्रन पास कर लो और आपको अगर और किसी
तरह से पास करना है तो और तरह से कर लेना
ये हम देख लेंगे बाद में इसमें कोई लोड
नहीं
आता और सही से देख लेंगे ठीक है तो टाइप
हम यहां पर पास कर देते हैं टाइप सबमिट है
इस बटन का और क्लास नेम जो है विथ फुल है
ठीक है इतना ही बहुत है अभी के लिए तो ठीक
है तो बेसिक आपको फॉर्म पता लग गया कि किस
तरह से डिजाइन होते हैं बट इतनी जल्दी
थोड़ना छोडूंगा रिवीजन करा के मानूंगा मैं
सिखा के मानूंगा आपको ताकि बेस्ट
प्रोडक्शन ग्रेड आप सीख जाओ तो इस वीडियो
के पोर्शन के अंदर हमने देखा कि एक्चुअली
में ये जो यूज फॉर्म है इतना भी डिफिकल्ट
नहीं है लग रहा था ऊपर ऊपर से बट अगर एक
बार आप चाय और कोड पे आए हैं तो आपको पता
है कि ठीक है हैंडल सबमिट एक इवेंट है
इवेंट हैंडल कर लूंगा रजिस्टर अपने आप में
भी वो भी एक इवेंट ही है हैंडल कर लेते
हैं और सबसे अच्छी बात यह है कि अपने आप
में एक ऑब्जेक्ट पूरा बना देता है जो भी
आपकी वैल्यूज है यहां पर मैं आपको रिकमेंड
करूंगा कि आप यहां पे ना एक कंसोल लॉक भी
करके देखिएगा डाटा का कोशिश करूंगा मैं भी
इस तरह के कंसोल लॉग्स आपको एक सेपरेट
वीडियो में दिखा पाऊं बट ठीक है अब आपको
काफी कुछ पता लग गया है अब क्या करते हैं
इसका करते हैं रिवीजन अच्छा रिवीजन कैसे
होगा रिवीजन ऐसे होगा कि लॉगइन फॉर्म तो
बन गया है साइन अप भी तो बाकी है साइन अप
का हम रिवीजन कर लेते हैं अब तो मजा ही
आएगा ठीक है यह लेते हैं
हम सा अपड जए ये लीजिए अपना आरएफसी ये
लीजिए साइन अप फॉर्म हो गया हमारे पास में
ओके तो साइन अप फॉर्म में सबसे पहले
क्या-क्या लगेगा रिएक्ट तो लगेगा ही लगेगा
यूज स्टेट भी लगेगा क्योंकि एरर्स वाली
हां जी यूज स्टेट अब आपको समझ में आने लग
गया है अब आप मुझसे आगे जा रहे हैं यूज
स्टेट यह लीजिए ओके ऑथ सर्विस तो लगेगी ही
लगेगी तो सबसे पहले ऑथ सर्विस ले आते हैं
यह लीजिए ऑ सर्विस फ्रॉम एप राइट ऑथ ठीक
है थ सर्विस ले आए और क्या लगेगा लिंक और
नेविगेट ठीक है क्योंकि यूजर क्लिक करके
लॉगिन पे भी जा सकता है और अगर कर लिया
लॉगइन तो हम फोर्सफुली नेविगेट करा देंगे
तो हम ले आते हैं इंपोर्ट एक तो ले आते
हैं लिंक और यूज नेविगेट अब तो सजेशन
आएंगे ही एआई इसीलिए तो अच्छा है लॉगइन भी
ले आते हैं स्टोर से ले आते हैं अपने
लॉगिन अ लॉगइन लॉगइन लॉगइन लॉगिन हां
एक्चुअली में लाना तो लॉगिन ही है क्योंकि
वहां पे भी साइन अप एक बार देख लेते हैं
हमने लॉगइन के अंदर क्या करा है लॉगिन के
अंदर भी हमने ऑथ का लॉगइन करवाया है
डिस्पैच में हमने
डिस्पैच के अंदर हमने गेट करंट यूजर
करवाया है और ऑ सर्विस के अंदर हमने लॉगइन
कॉल कर दिया है एक्चुअली में हमें
एक्चुअली में यहां पर साइन अप कॉल करना
चाहिए था वह ज्यादा बेटर रहता ठीक है तो
एक बार मैं इसको थोड़ा सा इवेलुएट कर ले
ऑथ लॉगिन ठीक है इसको हम बाद में देखेंगे
छोटी मटी मिस्टेक्स वगैरह ये सब जो फ्लो
का है हम देखेंगे बेसिक कहानी तो आपको समझ
में आ ही गई है छोटी मोटी डीबगिंग भी तो
करनी पड़ेगी क्योंकि इतना सारा कोड लिख
रहे हैं डीबगिंग अभी तक एक बार भी नहीं
करी है कर भी नहीं सकते अभी पर देखेंगे
इसको बाद हम फ्लो को और कैसे सुधार सकते
हैं ओके तो लॉग इन ले आते हैं स्टोर से
ठीक है जी और क्या चाएगा वो कंपोनेंट्स भी
तो चाहिए गे इतने सारे जो हैं ये लीजिए
बटन
चाहिए बटन और क्या था है इनपुट लोगो हां
इनपुट लोगो वो सब इंडेक्स से ले आओ
डिस्पैच और फॉर्म भी चाहिए ठीक है डिस्पैच
भी आ गया और एक फॉर्म भी चाहिए ठीक है
इतना तो हमें पता है अ देख लेंगे और
क्या-क्या चाएगा देखिए जरूरी नहीं है हम
यहां पे जो एप्लीकेशन बना रहे हैं ना वो
एग्जैक्ट लाइन बाय लाइन चले जरूरी ये है
कि जो जो भी लिख रहे हैं जो भी फ्लो है वह
हमें समझ में आए ताकि बाद में भी तो
डीबगिंग कर पाए तो ठीक है जितने भी लेके
आए इनसे वेरिएबल तो बनाने ही है तो
नेवी नेविगेट ले आओ ठीक है जी एरर भी
चाहिए होंगे यह लीजिए एरर सेट एरर यूज
स्टेट एमटी ठीक है चलेगा डिस्पैच भी चाहिए
डिस्पैच भी चाहिए और क्या चाहिए वह जो
पुराना काम किया था रजिस्टर और हैंडल
सबमिट फॉर्म वो भी चाहिए ठीक है इतना काम
तो चाहिए चाएगा अब क्या करते हैं
एक मेथड बनाते हैं जैसे वहां पे लॉगइन
मेथड बनाया था ऑलमोस्ट सेम वैसे ही और नाम
हैंडल सबमिट नहीं रखेंगे नाम या तो साइन
अप रखिए या फिर आप रखिए अ क्रिएट रखिए जो
भी आपका नाम रखना है और ओबवियस सी बात है
क्योंकि काफी डाटा है असं में ही जाएगा
डाटा हमारे पास आएगा इस तरह से ये लीजिए
अब सबसे पहले क्या करना है हमें पता है हर
बार यही करते हैं कि एरर्स को एमटी आउट
करते हैं सबसे पहले तो फिर अपना ट्राई कैच
यूज़ करते हैं ट्राय कैच के अंदर हमारे
पास ये वैल्यूज आ गई है कैच के अंदर तो
कैच के अंदर क्या करेंगे अपना सेट एरर बस
ये तो आपको अब रट गया है ठीक है जी ओके अब
काम क्या करना है सबसे पहले क्या करो कि
सर्विस यूज करो और सर्विस को बोलो कि आप
एक साइन अप है तो साइन अप के अंदर मैं एक
अकाउंट क्रिएट करूंगा ठीक है अच्छा कई बार
क्या करिए ये जैसे मैं सोचता हूं ना तो आप
भी एक सेकंड के लिए स्टेप बैक लीजिए और
सोचिए मैं अभी भी प्रोडक्शन कोड या जो भी
लिखता हूं वो इसी तरह से लिखता हूं हां
बोलता नहीं हूं इतना ऑब् वियस पर मन में 1
मिनट के लिए मैं सोचता हूं कि मैं करने
क्या जा रहा हूं इससे थोड़ा सा एडवांटेज
मिलता है ठीक है जरूरी नहीं हर बार कॉपी
पन लिखो एक मिनट के लिए शांति दो सोचो तो
ठीक है यहां पे क्या करना पड़ेगा एक ऑथ
सर्विस लेनी पड़ेगी ऑथ सर्विस से साइन अप
करना पड़ेगा मैंने उसका नाम दिया है
क्रिएट अकाउंट अक्सर मैं भूल जाता हूं तो
मैं जाके चेक कर लेता हूं तुरंत अ नाम
दिया है हमने उसका क्रिएट पोस्ट नहीं नहीं
क्रिएट पोस्ट तो नहीं दिया ऑथ में दिया है
सॉरी नाम दिया है हमने इसका क्रिएट अकाउंट
ठीक है साइन अप है क्रिएट अकाउंट हमारे
पास मेथड है ये सारी ईमेल पासवर्ड नेम ठीक
है तीन चीजों का इनपुट बनाना पड़ेगा ठीक
है इतना तो करके देखते हैं अ वेट तो डालना
ही पड़ेगा क्योंकि टाइम लगेगा अ एराइड भी
तो दूसरे कॉन्टिनेंट में है ठीक है
डेटाबेस हमेशा दूसरे कॉन्टिनेंट में होता
है तो हम लेते हैं ऑ सर्विस ये लीजिए ऑ
सर्विस में डॉट क्रिएट नहीं है हमारे पास
हमारे पास क्रिएट अकाउंट है तो सजेशन प मत
जाइएगा क्रिएट अकाउंट सजेशन हेल्प करते
हैं नो डाउट बट कई बार प्रॉब्लम में भी
डाल देते हैं ठीक है अगर डाटा आएगा यहां
से तो उसको स्टोर कर लेते हैं एक वेरिएबल
में यूजर कंस्ट अगर लिख पाए सही से तो
यूजर डाटा ठीक है जी इतना काम तो सही से
हो गया है ठीक है जी अब अगर डाटा सही से
बन गया है और यूजर डाटा आपके पास आया है
तो क्या करो तो करंट यूजर ले लो ठीक है जी
सबसे पहले वही करते हैं तो इफ हम क्या
करते हैं यूजर डाटा आपके पास आया है तो
यहां पर आओ और सबसे पहले अवेट करो और ऑ
सर्विस यूज कर लो यह रही ऑ सर्विस डॉट गेट
करंट यूजर यूज कर लेते हैं कोई इसमें
जरूरत नहीं है और यूजर डटा निकाल लेते हैं
यहां
से यूजर डाटा ठीक है जी यूजर डाटा हमने
निकाल लिया है अब ठीक है अब अगर यूजर डटा
यहां पर मिला है और करंट यूजर आप ले पा
रहे हो तो हमें स्टोर अपडेट करना पड़ेगा
ठीक है जी तो
इफ
[संगीत]
यूजर यूजर डाटा आपके पास मिला है तो आप
क्या करो डिस्पैच कर दो डिस्पैच करना है
वही लॉगिन को ही क्योंकि एक ही लॉगिन है
हमारे पास स्टोर के अंदर और यूजर डाटा
आपने पास कर दिया है अब अगर यूजर डाटा पास
हो गया है यहां पे तो नेविगेट करवा दो ठीक
है जी फोर्सफुली नेविगेट करा देते हैं
नेविगेट कहां स्लैश पे ही करा देते हैं
ठीक है तो आपने देखा हमने कितना सोच सोच
के कितना अच्छे तरीके से हमने पूरा का
पूरा डिजाइन करा है तो कई लोग जो कहते हैं
मुझसे लॉजिक नहीं बन रहा वो लॉजिक इसलिए
नहीं बन रहा आप सोच नहीं रहे आप सीधा कोड
लिखना चाह रहे हैं एक मिनट के लिए स्टेप
बैक लो आराम से सोचो चीजों को करो ठीक है
अ ओके तो अब हम क्या करते हैं हमारे पास
सबसे पहले तो अ कुछ डिब्स वगैरह हैं उनको
लेके आते हैं तो वो बड़ा बेसिक सा है यह
साइन अप वगैरह के डिब्स हैं तो यह साइन अप
का डिव है इसको क्लोज करते हैं तो
आइए जी सजेशन नो
सजेशन यह
लीजिए
डिव तो यहां पर हम आते
हैं यह लीजिए आप खुश और आप भी खुश ठीक है
जी दोनों खुश तो यह डिव वाला काम तो हो
गया चलिए ठीक है कुछ भी नहीं बेसिक ही डिव
था और इसके अंदर क्या है हमारे पास
वैल्यूज कुछ नहीं है एस सच पहले वाले के
डिव के अंदर हमारे पास लोगो आ जाएगा तो
ठीक है जी ये डिव के अंदर हम लोगो डाल
देते हैं यह लीजिए इस डिव के अंदर यह लोगो
डाल दिया ठीक है बस वो तो बेसिक स ही है
एग्जैक्ट सेम सिंटेक्स है और कुछ नहीं है
उसके अंदर और हम यहां पे h2 और वो लिंकिंग
वगैरह कर देते हैं पैराग्राफ
की वही सेम एग्जैक्ट पिछले वाले कंपोनेंट
से कॉपी पेस्ट कर रहे हैं तो वही सेम साइन
अप टू क्रिएट एन अकाउंट क्योंकि साइन अप
वाला पेज है ऑलरेडी हैव एन अकाउंट तो लिंक
दे दो उसको तो यहां पे वो नेविगेट कर
जाएंगे अच्छा पैराग्राफ के बाद अब हमें
एरर्स डिस्प्ले करानी है तो वही रिवीजन
अपना यह लीजिए अगर आपके पास एरर है तो
क्या करो डिस्प्ले कराओ कुछ तो अपना m पर
लेते हैं और उसको बोलते हैं कि टेक्स्ट
रेड और मार्जिन ए टेक्स्ट सेंटर सजेशंस
बड़े अच्छे हैं इस बार क्योंकि एगजैक्टली
पिछली फाइल में से उठा लिया उसने
इंटेलिजेंस है बस थोड़ा सा स्टेरॉइड पे है
ठीक है अब चाहिए क्या फॉर्म चाहिए ठीक है
तो वही वाला सिंटेक्स रिवीजन करेंगे इस
बार एक लो फॉर्म ठीक है फॉर्म में एक्शन
तो नहीं चाहिए क्या चाहिए हैंडल सबमिट
चाहिए हैंडल सबमिट एक्चुअली में ऑन सबमिट
इवेंट है तो ऑन सबमिट के अंदर आएगा हैंडल
सबमिट हैंडल सबमिट है एक मेथड वह मेथड
क्या करता है जहां पर भी आप उसको ले जाना
चाहो वहां ले जाते हैं तो क्रिएट मेथड हम
कॉल करेंगे उसके अंदर से उसके अंदर से
इसलिए कॉल करेंगे क्योंकि डाटा मिलेगा ठीक
है डाटा अपने आप नहीं मिलेगा कोई ऐसा
मैजिक नहीं होगा वोह रजिस्टर वाला यूज
करना पड़ेगा रजिस्टर अपने आप में कीवर्ड
है चाहे लॉगिन में यूज करो चाहे कहीं भी
यूज करो वो अपने आप में कीवर्ड है तो यहां
पर एक लेते हैं छोटा सा डिव और डिव के
अंदर कुछ क्लासेस है ज्यादा नहीं है छोटी
सी कुछ क्लासेस है स्पेस ही है वही वाला
सेम है स्पेस डवा ड फ यह हो गया हमारा अब
आते हैं इनपुट पे यहां है इंटरेस्टिंग
रिवीजन ओके जी तो यह आया इनपुट कर दिया
सेल्फ क्लोजिंग ठीक है जी अब इनपुट के
अंदर हमें पता है कि यहां पर वैल्यूज
चाहिए आपको नेम ईमेल और पासवर्ड ठीक है
अबकी बार क्या है जो फील्ड है ना उसमें
ज्यादा मैं आपको रिजेक्स वगैरह नहीं
करूंगा वो एक जगह आपको बता दिया बस बताने
का काम था अब यहां पर थोड़ा सा इजी करते
हैं इसको ठीक है अब इनपुट के अंदर क्या
चाहिए नेम चाहिए तो ठीक है सबसे पहले तो
दे दो एक लेबल लेबल
लबल लेबल कई बार तो सजेशन गजब ही हो जाते
हैं अ इसको बोलते हैं कि आप दो मुझे नेम
ठीक है जी फुल नेम दे दो लो फुल नेम आपका
मन करे जैसे लीजिए अ प्लेस होल्डर भी ले
लेते हैं अ एंटर योर फुल नेम ठीक है अब
क्या चाहिए यह जावास्क्रिप्ट और चाहिए डॉट
डॉट डॉट रजिस्टर हमेशा पहली बार भी लिख
रहे हो तब भी रजिस्टर इसी तरह से लिखना
ऐसा मत सोचना कि ये तो पहली बार ही लिख
रहा हूं तो अभी स्प्रेड करने की क्या
जरूरत नहीं नहीं सिंटेक्स है प्रॉब्लम
आएगी तो यह हो गया हमारे पास में नेम और
इसको चाहिए ऑब्जेक्ट तो यह हमने
जावास्क्रिप्ट क्लोज कर दिया अच्छा जी अ
प्रॉब्लम यह यहां पे है हां अभी ठीक है अब
इसके अंदर क्या-क्या देखना है आपके ऊपर है
क्या देखना चाहते हो मैं तो एक ही लिखूंगा
रिक्वायर्ड ट्रू बस अपना हो गया काम अपन
इससे ज्यादा नहीं करने वाले ठीक है अच्छा
इसको और कॉपी पेस्ट करके कर सकते हैं ईमेल
एड्रेस हां जी अब क्योंकि समझ में आ गई है
बात तो हम क्या कर सकते हैं यहां पर जाके
वह ईमेल वाला है वो सिंटेक्स पूरा का पूरा
ही ले लेते हैं क्योंकि अब तो बात समझ में
आ ही चुकी है तो ये लो इनपुट ले एज इट इज
और यहां पर पेस्ट कर दो देखो जब तक आपको
समझ में आ रही है ना बात तब तक कॉपी पेस्ट
करने में कोई बुराई नहीं अगर आंख बंद करके
कॉपी पेस्ट हो रहा है ना तो प्रॉब्लम है
तो प्रॉब्लम है इसको एक और यहां पर ले आते
हैं यह लीजिए इनपुट ये हो गया नेम का यह
हो गया ईमेल का और अब एक पासवर्ड का
पासवर्ड का क्योंकि छोटा है तो लिख लेते
हैं रिवीजन भी हो जाएगा इनपुट सेल्फ
क्लोजिंग ओके क्या क्या चाहिए सबसे पहले
चाहिए लेबल सजेशन दो
भाई नहीं देंगे
मनी नहीं है इनका सजेशन देने हां दे तो
रहे हैं लेबल हो गया
पासवर्ड टाइप भी पासवर्ड हां जी प्लेस
होल्डर भी दे दो इतना दे रहे हो तो प्लेस
होल्डर एंटर योर पासवर्ड ठीक है जी अब
क्या है यह जावास्क्रिप्ट चाहिए और चाहिए
रजिस्टर मैं ज्यादातर ये जो एआई है ना
इसलिए यूज करता हूं ये जो फालतू चीजें है
ना प्लेस होल्डर टाइप इनको टाइप करने में
काफी टाइम लगता है तो कोपायलट अपना काम कर
देता है और देखिए जिस तरह से इंटेलिसेंस आ
गया है वैसे ही अभ एआई भी आ चुका है इससे
भागने का कोई सेंस नहीं है बेटर है अडॉप्ट
कर लो मैं तो करने वालों में से हूं ठीक
है पासवर्ड दे देते हैं रिक्वायर्ड ट्रू
दे देते हैं अब यहां पे देखिए आया एरर
क्यों आया एरर क्योंकि पैंथिस मिसमैच है
तो आपको ही करना पड़ेगा यह लीजिए और यह
लीजिए ठीक है ओके अब क्या देना है ठीक है
जी यह तो हो गया हमारा फॉर्म इनपुट अब दे
देते हैं एक बटन यह लीजिए बटन आ गया है
हमारे पास में और बटन में दे देते हैं
क्रिएट अकाउंट कोई अगर और वैल्यूज होगी
कुछ तरह से देखना होगा तो भी हम देख लेंगे
बटन में एक ही इंपॉर्टेंट चीज है यहां पे
टाइप सबमिट वरना क्या वो सबमिट होगा नहीं
और क्लास नेम भी दे देते हैं विड्थ फुल बस
इतना ही काम है तो यह हमारे पास वैल्यूज आ
गई है यहां पर कुछ एरर्स हैं क्या है ये
एक्चुअली में हाईलाइट इस तरह से है कई बार
ये हाईलाइट वाला कलर प्रॉब्लम करता है ठीक
है इसको सेव करते हैं क्लोज करके वापस ओपन
करते हैं हां यह कई बार इतना ज्यादा
इंडेंटेशन लेवल पर चल जाता है ना तो यह
थोड़ा सा हाईलाइट का इशू होता है इसको हम
लेके आते हैं यहां पे ताकि यह छोटा सा जो
इशू है यह जाए ठीक है हां छोटी-छोटी चीजें
वैसे तो यह रेबो बड़ा अच्छा है इंडेंटेशन
का काफी एग्जांपल आईडिया दे देता है ठीक
है जी तो यह काम आपका हो गया हमने बनाए
साइनअप इनपुट फॉर्म अ देखा कि रिएक्ट हुक
फॉर्म कैसे वर्क करता है काफी इंटरेस्टिंग
चीजें देखी अच्छा अभी हमारी चीजें कंप्लीट
नहीं हुई है क्योंकि हमें एक रियल टाइम
एडिटर बनाना है तो अभी हम रियल टाइम एडिटर
के बारे में पढ़ेंगे और फिर हम एक ही यहां
पे एक्चुअली मैं दो सिंटेक्स अ हम देंगे
एक्चुअली में एक और सिंटेक्स बनाना है अ
उसको भी हम बना ही लेते हैं इसी वीडियो के
अंदर फिर हम जो अपना रियल टाइम एडिटर है
और जो पोस्ट का पेज है जहां पर आप इमेज भी
अपलोड कर पा रहे हो और रियल टाइम आपको
टाइटल स्लग सब मिल रहा है वो हम एक साथ
देख लेंगे तो एक बड़ा ही इंटरेस्टिंग
कंपोनेंट है वो भी ऑथेंटिकेशन से रिलेटेड
ही है और काफी जगह आप यूज करोगे इसको भी
हम एक्चुअली में यहीं डील कर लेते
हैं ओके काफी है अगर आपको लगे कभी भी कि
नहीं रेस्ट चाहिए ब्रेक चाहिए तो वीडियो
पॉज करिए आराम से आइए और कमेंट सेक्शन में
यहां ऐड कर देना कि इस मूमेंट पे हम
ऑथेंटिकेशन लेआउट के बारे में बात कर रहे
हैं अ यह बड़ा ही इंटरेस्टिंग लेआउट है
काफी जगह यूज करोगे आगे जाके नेक्स्ट यर्स
वगैरह भी करोगे यह एक्चुअली में एक
मैकेनिज्म है कि किस तरह से पेजेस को या
राउट्स को प्रोटेक्ट किया जाता है क्योंकि
देखिए अभी तक हमने कोई प्रोटेक्शन
मैकेनिज्म नहीं लिखा है ऑथ के अंदर हमारे
को पता है कि स्टेट है हमारे पास लॉगिन है
नहीं है बट उसका यूज नहीं कर रहे हम कुछ
भी कैसे प्रोटेक्ट करेंगे तो हम क्या एक
कंटेनर बनाते हैं कंटेनर में क्या होता है
कुछ नहीं होता है कंटेनर अपने आप में खाली
होता है उसके अंदर वैल्यूज शो करनी है
नहीं करनी बस वो डिसाइड करता है तो यह
एक्चुअली में एक प्रोटेक्टेड कंटेनर है
उसी के थ्रू हम बात करेंगे इसका तो हम
पहले लेते हैं आरएफसी रिएक्ट फंक्शनल
कंपोनेंट आप इसका नाम ऑथ लेआउट भी डाल
सकते हो लेकिन हम क्या करेंगे इसका नाम
डाल देते हैं सीधे इसको हटाते हैं यहां से
और एक्सपोर्ट कर देते हैं यहीं पे ही
एक्सपोर्ट
डिफॉल्ट और इसका नाम हम दे देते हैं यहां
पे प्रोटेक्टेड ऑथ लेआउट भी दे सकते हो
लेकिन हम यहां पे प्रोटेक्टेड नाम देखें
अच्छा अ फाइल का नेम और फंक्शन का नेम अलग
हो सकता है कोई प्रॉब्लम नहीं है अब
प्रोटेक्टेड इसलिए दे रहे हैं क्योंकि हम
कंडीशनली रेंडर करेंगे कि क्या उसके
चिल्ड्रन को रेंडर करना है या नहीं करना
है तो प्रॉप के अंदर आपको देखो एक तो
चिल्ड्रन मिलेगा वापस से कंटेनर ही है एक
तो चिल्ड्रन मिलेगा आपको और एक चीज क्या
मिलेगी आपको
ऑथेंटिकेशन
ऑथेंटिकेशन अब ऑथेंटिकेशन की हम क्या
वैल्यू मान रहे हैं ट्रू अब हमने तो मानी
है ट्रू लेकिन हो सकता है कोई भी जो इस
कंपोनेंट को कॉल कर रहा है वो वैल्यू
फाल्स दे दे तो हम क्या करेंगे यहां पे
सिर्फ उसकी बेस प वैल्यू चेक करेंगे कि
हमारा ऑथ स्टेटस क्या है नहीं है
ऑथेंटिकेशन वगैरह का तो उस बेसिस पे हमारे
पास वैल्यू आ जाएगी और इसको अपडेट हम कर
देंगे ठीक है अभी तक कुछ नहीं है एक सिर्फ
बेसिक कंपोनेंट है हमारे पास में अब
एक्चुअली में जो इंटरेस्टिंग चीजें आती है
वो आती है यहां से ओके सबसे पहले क्या
करते हैं हमें कुछ अ वेरिएबल स्टेट्स
वगैरह चाहिए गी अ सबसे पहले तो यहां पे
लीजिए यूज स्टेट यूज इफेक्ट लीजिए सबसे
पहले तो यूज स्टेट तो चाहिए चाहिए उसकी तो
वगर कुछ काम होगा ही नहीं बट यूज इफेक्ट
यहां पे बहुत जरूरी है उसके अलावा हमें
सेलेक्टर भी चाहिए क्योंकि कुछ चीजें
पूछनी पड़ेगी अपने स्टोर से कि साहब यह तो
इंफॉर्मेशन दो ही दो यूज सिलेक्टर
अ यूज सेलेक्टर फ्रॉम रिएक्ट रिडक्स और
नेविगेशन भी चाहिए ताकि हम यूजर को कहीं
और रीडायरेक्ट वगैरह कर पाए तो रीडायरेक्ट
नहीं है एक्चुअली में अब रिएक्ट राउटर डॉम
में वो यूज नेविगेट है तो थोड़ा से सजेशंस
पुराने होते हैं कई बार एआई के अंदर यूज
नेविगेट नेविगेशन नहीं है यूज नेविगेट है
फ्रॉम रिएक्ट राउटर डम यह हो गया हमारा
काम ठीक है जी ओके इतना काम काम तो हो गया
सबसे पहले तो य नेविगेट लेके आए तो काम
में ले ही लेते हैं इसको ठीक है और उसके
अलावा एक स्टेट लगती है हमारे पास यहां पर
लोडिंग मान लीजिए लोडर मान लीजिए जो आपका
मन करे तो हम इसको लोडर सेट लोडर और बाय
डिफॉल्ट स्टेट अपनी ट्रू है ठीक है अब
क्या है सबसे पहले आपको पूछना पड़ेगा ऑथ
स्टेटस से कि भाई आप लगड इन हो या नहीं हो
ठीक है हम उससे पूछेंगे डायरेक्टली डिपेंड
नहीं करेंगे जो यूजर पास कर रहा है
कंपोनेंट में नहीं हम पहले स्टोर से
पूछेंगे तो हम क्या करते हैं उसको नाम
देते हैं ऑथ स्टेटस और ऑथ स्टेटस कहां से
आएगा यूज सिलेक्टर से सिलेक्टर से सेलेक्ट
करना पड़ेगा सिलेक्टर में अपना स्टेट है
जो मुझे बता देगा स्टेट डड स्टेटस ठीक है
इसके बेसिस पर मैं सारे काम करूंगा ठीक है
लेकिन डायरेक्टली काम नहीं करूंगा पहले
मेरे को एक यूज इफेक्ट चाहिए यूज इफेक्ट
ही मुझे बताएगा कि भाई आपको मुझे लॉगिन पर
भेजना है कि होम पेज पर भेजना है या क्या
काम करना है और किस-किस फील्ड में कुछ
चेंज होता है तो मैं एक्चुअली में दोबारा
से चेकिंग करूं या नहीं करूं ठीक है तो यह
हो गया हमारा यूज इफेक्ट ये लीजिए और इसके
बाद ये अपना डिपेंडेंसी एरे आ गया है और
ये लीजिए आपका एंड हो गया यहां पे ठीक है
अब सबसे पहले डिपेंडेंसी एरे की बात कर
लेते हैं एंटर करके किस-किस चीज पे
डिपेंडेंट हो आप ठीक है मैं एक तो
डिपेंडेंट हूं ऑथ स्टेटस ऑथ स्टेटस में
कुछ भी चेंज होता है क्योंकि मैं स्टोर से
पूछ के आया हूं तो ये यूज सिलेक्टर अपने
आप मॉनिटरिंग करता है उसमें कुछ भी चेंज
हो तो इस यूज इफेक्ट को दोबारा रन कर देना
अच्छा यूजर अगर कभी भी नेविगेट होके आया
कहीं से तो नेविगेट में कुछ भी चेंज है
नेविगेट में चेंज क्या नेविगेट भी अपने आप
में ध्यान रखता है कि यूजर कहीं से कहीं
और तो नहीं गया तो उसमें कुछ भी चेंज हो
रहा है तब भी मैं इसको रन करना चाहता हूं
और एक हमारे पास में ऑथेंटिकेशन तो यूजर
ने अगर कुछ ऑथेंटिकेशन वगैरह भेजा है तो
उसके बेसिस प भी चेंजेज हो तो कर लेना
अच्छा अब क्या करना है अब देखिए सबसे पहले
तो हमें इफ एल्स पे चेक करना है यह लीजिए
हमारे पास में और यहां पे इसको ले आते हैं
और दूसरा कंडीशन भी एक चेक करेंगे हम पहले
एक कंडीशन पर बात करते हैं देखिए सबसे
पहले आपके पास ऑथेंटिकेशन तो यूजर ने भेजा
सपोज स करिए ट्रू और उसके बाद मैं चेक भी
करूंगा सिर्फ यूजर के कहे पे नहीं मानूंगा
मैं दोबारा से चेक क्योंकि यूजर भेजना
चाहेगा इस तरह से ही डिजाइन होते हैं ये
आप कहे तो अगर आपको थोड़ा सा कंफ्यूजन लग
रहा है तो आप यूजर से लो ही मत ये जो
ऑथेंटिकेशन इक्वल्स टू ट्रू है ये लो ही
मत आप यूजर से आप सीधा सब कुछ डिसाइड करो
ऑथ स्टेटस के बेस पे हां इस तरह से आप और
इंप्रूव कर सकते हो एप्लीकेशन को बट मैं
आपको सारे सिनेरियो यहां पे कवर करके
दिखाना चाहता हूं तो हम लेंगे सिंपल सा
यहां पे m पर m पर और एक और लॉजिक चेक
करते हैं कि क्या हमारा ऑथ स्टेटस जो है
क्या वो नॉट इक्वल टू है ऑथेंटिकेशन के
अच्छा अब यह जो स्टेटस है यह हो सकता है
कुछ लोगों को थोड़ा सा कंफ्यूज कर दे तो
इस परे हम बात करेंगे थोड़ा सा नेविगेट
करेंगे हम लॉगइन पे एक मिनट में आते हैं
इसके ऊपर एक और कंडीशन पहले चेक कर लेते
हैं उसके बाद आपको और कंडीशन आपको इसको
अच्छे से मैं रिफाइन करके दिखाऊंगा तो यह
हमने एक और इफ लिया है यहां पे और इसका भी
कंडीशनल रेंडरिंग हम कर देते हैं यहां पे
ये लीजिए यहां पे क्या चेक कर रहा हूं अगर
ऑथेंटिकेशन फाल्स है है तो ये रहा हमारा
ऑथेंटिकेशन तो हम दूसरी चीज चेक कर लेंगे
एंड दो कंडीशन चेक कर रहा हूं ऑथ स्टेटस अ
नॉट इक्वल टू ये तो सेम ही रहेगा थ नॉट
इक्वल टू
ऑथेंटिकेट
ऑथेंटिकेशन तो भी हम इस केस में भी
रीडायरेक्ट कर देंगे नेविगेट को यूज करते
हुए और ये लीजिए अच्छा अब इस पे हो सकता
है थोड़ा सा आपको इशू हो जाए तो सबसे पहले
तो यहां आते हैं एक सेट लोडर भी कर लेते
हैं वरना भूल जाएंगे इसको सेट लोडर को
फाल्स कर देते हैं ठीक है ओके अब इस पे
थोड़ी सी चर्चा करते हैं क्योंकि मुझे पता
है थोड़ा सा हो सकता है कंफ्यूजन है देखिए
यूजर ने तो ऑथेंटिकेशन में अगर कुछ नहीं
भेजा तो मैं ट्रू ही मान रहा हूं ठीक है
अब यहां पे मैं क्या चेक कर रहा हूं कि ऑथ
स्टेटस और ऑथेंटिकेशन क्योंकि एंड दोनों
कंडीशन का ट्रू होना जरूरी है तो यह
कंडीशन तो ट्रू है अगर आपने यूज़र से कुछ
भी नहीं लिया है तो यह कंडीशन तो ट्रू है
ही है ठीक है मान लिया बात कि यह तो ट्रू
है तो इसका फाइनल तो मेरे पास आ गया है
ट्रू तो यहां पे मैं लिख लेता हूं यह ट्रू
है और m पर के साथ चेक करूंगा दूसरी
कंडीशन मेरे पास अब दूसरी कंडीशन क्या है
कि ऑथ स्टेटस जो है वह इक्वल नहीं है
ऑथेंटिकेशन के तो सपोज करिए ऑ स्टेटस जो
है उसने आपको दिया फॉल्स कि भाई आप
ऑथेंटिकेटेड नहीं हो और मैं चेक कर रहा
हूं नॉट इक्वल्स टू ऑथेंटिकेशन जो कि आपको
ट्रू ही दे रहा है तो फॉल्स इक्वल नहीं है
ट्रू के फॉल्स इक्वल नहीं है ट्रू के तो
इसका फाइनल रिजल्ट क्या आएगा इसका फाइनल
रिजल्ट आएगा ट्रू क्योंकि बात सही है तो
जब दोनों ट्रू है तो मैं क्या करूं ने ट
कर दूं लॉग इन पे क्योंकि होम पे तो भेजना
ही नहीं आपको तो आप देख रहे हैं किस तरह
से मैंने काम किया कि दोनों स्टेटस ट्रू
है क्योंकि ये तो ट्रू आ ही रहा है आपके
पास और मैंने यहां पर चेक कर लिया कि अगर
आपने मुझे फॉल्स दिया है और ऑथेंटिकेशन
में अगर मेरे पास फॉल ये मिला है इस तरह
से तो आपको लॉग इन पे जाना चाहिए क्योंकि
आप ऑथेंटिकेटेड हो ही नहीं तो मैं यहीं पे
चेक कर लूंगा अच्छा इसको भी इवेलुएट करते
हैं दूसरी वाली कंडीशन को भी अब जो दूसरी
वाली कंडीशन उसम मैंने चेक करा है कि नॉट
ऑथेंटिकेटेड तो देखिए ऑथेंटिकेटेड में तो
हर बार ट्रू आ ही रहा है ठीक है
ऑथेंटिकेटेड में ट्रू आ ही रहा है तो हमने
मान लिया ऑथेंटिकेटेड में ट्रू है बट उसने
कहा नॉट ट्रू अच्छा तो यह कन्वर्ट हो गया
फाल्स में ठीक है जी और दूसरी कंडीशन क्या
चेक कर रहे हो दूसरी कंडीशन चेक कर रहे हो
ऑथ स्टेटस नॉट इक्वल टू ऑथेंटिकेशन ठीक है
जी अब यहां पे तो पहले आया था ट्रू ठीक है
जी ट्रू आ रहा है अब मैं चेक कर रहा हूं
नॉट इक्वल्स टू ऑथ स्टेटस तो इस बार सपोज
करिए कि ऑथ स्टेटस आपका ट्रू है ठीक है तो
सपोज करिए आप ऑथेंटिकेटेड हो तो ये ट्रू
है ऑथेंटिकेशन आपको स्टेटस दे दिया ट्रू
तो ट्रू नॉट इक्वल्स टू ट्रू ठीक है जी
ट्रू नॉट इक्वल्स टू ट्रू क्या ये
स्टेटमेंट सही है नहीं नहीं ट्रू तो ट्रू
के इक्वल ही होता है तो एक्चुअली में ये
कंडीशन हो जाएगी आपके पास वापस से फॉल्स
तो फॉल्स एंड फॉल्स का जो m परट आता है उस
हिसाब से हमने उसको नेविगेट कर दिया ये m
पर पे तो अगर यह आपको स्टेटस थोड़ा सा
कंफ्यूज ंग लग रहा है क्योंकि मुझे लग रहा
है शायद यह हो तो हम इसको वापस से
रीडायरेक्ट या फिर री रिटर्न करने की
कोशिश करेंगे यह थोड़ा सा मैंने यहां पर
बट आपको लगता है कि नहीं इसको राइट करना
चाहिए तो यहां पे हम एक टू डू लिख लेते
हैं अपने लिए छोटा सा कि हम यह काम करेंगे
बाद
में टू डू मेक इट मोर इजी तो एक बार हम जब
एप्लीकेशन कंप्लीट कर लेंगे तो हम उस
हिसाब से इसको दोबारा से एक रिवीजन कर
लेंगे कमेंट सेक्शन में बता दीजिएगा वैसे
तो देखिए बहुत इजी अगर हो जाएगा अगर आप
सिर्फ और सिर्फ अपने ऑ स्टेटस से पूछते
हैं एक बार मैं छोटा सा कोड लिख के दिखाता
हूं क्योंकि आप भी तो कुछ करेंगे ही तो
वहां पे भी हम बहुत आसानी से कर सकते हैं
तो अगर सपोज करिए मैं एक इफ स्टेटमेंट
लेता हूं यहां पे और ऑ स्टेटस के बेसिस प
लेता हूं कि ऑ स्टेटस अगर
हमारा अगर ट्रू आता
है ठीक है और ऑथेंटिकेशन से मुझे अभी कोई
मतलब नहीं है वैसे तो मतलब होगा आगे जाके
बट अभी आप इसके बेसिस प लेना चाहते हैं
अगर तो तो ऑथ स्टेटस अगर ट्रू है तो आप
सिंपल क्या करिए नेविगेट कर दीजिए कि
ऑथेंटिकेटेड है तो नेविगेट यहां कर दीजिए
और अगर आपके पास दूसरा है तो एल्स केस में
क्या करेंगे तो एल्स केस में एक्चुअली में
एल्स के बाद भी इफ चेक करना पड़ेगा इफ
हमारा ऑथ स्टेटस अगर फॉल्स है तो क्या
करना चाहिए तो आपको नेविगेट कर देना चाहिए
लॉग इन पे तो नेविगेट कर देना चाहिए लॉगइन
पे हां इससे भी कर सकते हैं लेकिन एक और
कंडीशन मैंने इसलिए दीी क् थोड़ा सा हो
जाए तो अभी के लिए हम इसको कमेंट कर देते
हैं क्योंकि इतना इजी तो नहीं देंगे आपको
ठीक है अ बट हां चर्चा करेंगे इस पे भी
चर्चा करेंगे थोड़ा सा है
या फिर आप यहां तक आ गए तो यूज इफेक्ट में
कुछ भी चेंज हो रहा है यह तो समझ में आ ही
गया होगा आपको तो यह सारा का सारा कंडीशन
वापस से रन होगा अब देखिए कंडीशन कुछ भी
रन हो रहा है या नहीं हो रहा आपका सेट
लोडर यहां पे फाल्स हो ही जा रहा है हर
हाल में और सेट लोडर के बेसिस पे हम क्या
करेंगे लोडर के बेसिस पे हम शो करेंगे
यूजर को क्योंकि यहीं पे चेक हो जाएगा
रीडायरेक्शन का काम हो जाएगा तो यहां पे
क्या है कुछ ज्यादा काम करने की जरूरत
नहीं है यहां पे सीधा आप रिटर्न कर सकते
हो एक्चुअली मैं इस कर्ली ब्रेसस की भी
सॉरी पेंसिस की भी जरूरत नहीं है हम सीधा
ही यहां पे लोडर के बेस पे चेक कर सकते
हैं कि अगर लोडर ट्रू है तो लोडिंग बोल दो
और अगर लोडिंग ट्रू नहीं है तो आप
चिल्ड्रन डिस्प्ले कर दो जो भी आपके
चिल्ड्रन है ठीक है अच्छा हो सकता है आपको
यह चीज ऑथेंटिकेशन वाली थोड़ी सी
कॉम्प्लेक्टेड है हमारे पास में एक्चुअली
में जब हम राउटिंग सेटअप करेंगे तब आपको
लगेगा कि हां यह वाला जो काम है ना अ यह
थोड़ा सा हम यहां पे चीटिंग कर जाएंगे अगर
ये इतना इजी करेंगे तो क्योंकि ऑथेंटिकेशन
तो आएगा ही आएगा अगर आपको यह थोड़ा सा
क्या करिए यहां पे एक वेरिएबल ले लीजिए हो
सकता है कई लोग बहुत जस्ट बेसिक फेज में
है अभी प्रोग्रामिंग के ज्यादा नहीं पता
तो आप क्या कर लीजिए यहां पे एक वेरिएबल
भी ले सकते हैं अ लेट ऑथ वैल्यू कुछ इस
तरह से और यहां पे एक-एक करके आप वैल्यू
को ले लीजिए कि ऑथ स्टेटस क्या है तो ये
ऑथ स्टेटस की आप वैल्यू ले लीजिए कि उसके
अंदर वैल्यू क्या डालनी है तो ऑड स्टेटस
अगर ट्रू है तो उसके अंदर ट्रू वैल्यू डाल
दीजिए अगर फॉल्स है तो फाल्स वैल्यू डाल
दीजिए तो ये इतना आपको नहीं करना पड़ेगा
आप सीधे यहां पे ऑथ वैल्यू पे देखिए
मल्टीपल तरीके इसलिए बता रहा हूं क्योंकि
मैं चाहता हूं आपको आसानी से समझ में आए
चीजें बट थोड़ा तो लॉजिक लगाना पड़ेगा
नहीं समझ में आ रहा चैट जीपीटी यूज़ करिए
यह कोड एज इट इज बोलिए चैट जीपीटी को मुझे
और एक्सप्लेन करके बताओ तो हां तरीके काफी
हैं जिसको जो तरीका समझ में आ जाए मेरी
बेस्ट कोशिश यही रहती है कि वहां से उसको
आ जाए जितने आपके फाउंडेशन स्ट्रांग होंगे
ना उतना आपको यहां पे कम दिक्कत आएगी
ओके अब इसका यूज़ कैसे करना है हां यूसेज
तो अभी नहीं देख सकते हम यूसेज तो इस
प्रोटेक्टेड राउट का हम तभी देखेंगे जब हम
राउटर सेट करेंगे अभी तक हमने राउटर सेट
नहीं करा है तो राउटर सेट करेंगे त अब हम
देखेंगे थोड़ा सा इंटरेस्टिंग कांसेप्ट है
नया कांसेप्ट है बट हां चिंता मत कीजिए
दोबारा एक दो बार रिवीजन कराऊंगा तब आपको
और समझ में आ जाएगा अगर आपको इस वीडियो के
अंदर 50 60 पर समझ में आया तो बहुत है मोर
देन इनफ है ओके जी तो चलते हैं ये तो काम
हो गया हमारा ऑथ स्टेटस ऑथ लेआउट वाला काम
ओके जी अब नेक्स्ट वीडियो के अंदर हम
बनाएंगे थोड़ा सा हमारा पोस्ट फॉर्म जो कि
बड़ा है ज्यादा कुछ प्रॉब्लम नहीं है उसके
अंदर बट थोड़ा सा बड़ा फॉर्म है और एक
आरटीई भी बनाना पड़ेगा हमें आरटीई है
हमारा रियल टाइम टेक्स्ट एडिटर उसमें कुछ
भी नहीं है दो कंपोनेंट आते हैं बस आरटी
से और एज इट इज काम हो जाता है अ तो बड़ा
ही इंटरेस्टिंग रहा यह जर्नी हमारी काफी
बड़े वीडियोस भी हैं थोड़े
कॉम्प्लेक्शन कर रहे हैं उनको इजी करें बट
इतने ही इजी हो सकते हैं बाकी तो आपका
फाउंडेशन काम आएगा चलिए मिलते हैं अगले
वीडियो के
अंदर
```

Create a new file:
src/components/Select.jsx:
```
import React, {useId} from 'react'

function Select({
    options,
    label,
    className,
    ...props
}, ref) {
    const id = useId()
  return (
    <div className='w-full'>
        {label && <label htmlFor={id} className=''></label>}
        <select
        {...props}
        id={id}
        ref={ref}
        className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
        >
            {options?.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
  )
}

export default React.forwardRef(Select)
```

create a new file:
src/components/PostCard.jsx:
```
import React from 'react'
import appwriteService from "../appwrite/config"
import {Link} from 'react-router-dom'

function PostCard({$id, title, featuredImage}) {
    
  return (
    <Link to={`/post/${$id}`}>
        <div className='w-full bg-gray-100 rounded-xl p-4'>
            <div className='w-full justify-center mb-4'>
                <img src={appwriteService.getFilePreview(featuredImage)} alt={title}
                className='rounded-xl' />

            </div>
            <h2
            className='text-xl font-bold'
            >{title}</h2>
        </div>
    </Link>
  )
}


export default PostCard
```

we will use react-hook-form

create a new file :
src/components/Login.jsx:
```
import React, {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { login as authLogin } from '../store/authSlice'
import {Button, Input, Logo} from "./index"
import {useDispatch} from "react-redux"
import authService from "../appwrite/auth"
import {useForm} from "react-hook-form"

function Login() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()
    const [error, setError] = useState("")

    const login = async(data) => {
        setError("")
        try {
            const session = await authService.login(data)
            if (session) {
                const userData = await authService.getCurrentUser()
                if(userData) dispatch(authLogin(userData));
                navigate("/")
            }
        } catch (error) {
            setError(error.message)
        }
    }

  return (
    <div
    className='flex items-center justify-center w-full'
    >
        <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
        <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight">Sign in to your account</h2>
        <p className="mt-2 text-center text-base text-black/60">
                    Don&apos;t have any account?&nbsp;
                    <Link
                        to="/signup"
                        className="font-medium text-primary transition-all duration-200 hover:underline"
                    >
                        Sign Up
                    </Link>
        </p>
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
        <form onSubmit={handleSubmit(login)} className='mt-8'>
            <div className='space-y-5'>
                <Input
                label="Email: "
                placeholder="Enter your email"
                type="email"
                {...register("email", {
                    required: true,
                    validate: {
                        matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                        "Email address must be a valid address",
                    }
                })}
                />
                <Input
                label="Password: "
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                    required: true,
                })}
                />
                <Button
                type="submit"
                className="w-full"
                >Sign in</Button>
            </div>
        </form>
        </div>
    </div>
  )
}

export default Login
```


create a new file :
src/components/Signup.jsx:
```
import React, {useState} from 'react'
import authService from '../appwrite/auth'
import {Link ,useNavigate} from 'react-router-dom'
import {login} from '../store/authSlice'
import {Button, Input, Logo} from './index.js'
import {useDispatch} from 'react-redux'
import {useForm} from 'react-hook-form'

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const dispatch = useDispatch()
    const {register, handleSubmit} = useForm()

    const create = async(data) => {
        setError("")
        try {
            const userData = await authService.createAccount(data)
            if (userData) {
                const userData = await authService.getCurrentUser()
                if(userData) dispatch(login(userData));
                navigate("/")
            }
        } catch (error) {
            setError(error.message)
        }
    }

  return (
    <div className="flex items-center justify-center">
            <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
            <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight">Sign up to create account</h2>
                <p className="mt-2 text-center text-base text-black/60">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-primary transition-all duration-200 hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
                {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

                <form onSubmit={handleSubmit(create)}>
                    <div className='space-y-5'>
                        <Input
                        label="Full Name: "
                        placeholder="Enter your full name"
                        {...register("name", {
                            required: true,
                        })}
                        />
                        <Input
                        label="Email: "
                        placeholder="Enter your email"
                        type="email"
                        {...register("email", {
                            required: true,
                            validate: {
                                matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                "Email address must be a valid address",
                            }
                        })}
                        />
                        <Input
                        label="Password: "
                        type="password"
                        placeholder="Enter your password"
                        {...register("password", {
                            required: true,})}
                        />
                        <Button type="submit" className="w-full">
                            Create Account
                        </Button>
                    </div>
                </form>
            </div>

    </div>
  )
}

export default Signup
```

create a new file:
src/components/AuthLayout.jsx:
```
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

export default function Protected({ children, authentication = true }) {

    const navigate = useNavigate()
    const [loader, setLoader] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        //TODO: make it more easy to understand

        // if (authStatus ===true){
        //     navigate("/")
        // } else if (authStatus === false) {
        //     navigate("/login")
        // }

        //let authValue = authStatus === true ? true : false

        if (authentication && authStatus !== authentication) {
            navigate("/login")
        } else if (!authentication && authStatus !== authentication) {
            navigate("/")
        }
        setLoader(false)
    }, [authStatus, navigate, authentication])

    return loader ? <h1>Loading...</h1> : <>{children}</>
}

```






































 -->
