# React Production-Grade Components — Detailed Notes

> **Series:** Chai aur React  
> **Topic:** Building production-grade reusable components — Container, Footer, Logo, Header, LogoutBtn, Button, Input (with `forwardRef`)

---

## 1. Why Production-Grade Code Matters

In beginner tutorials, a login form is usually written like this:
- One state for email, one for password
- On click of Login button → grab both values from state → dispatch or call API

That works fine. But in **real industry projects**, UI elements like input fields are **extracted into their own reusable components** so that:
- The same `<Input />` can be reused in Login, Register, Profile, etc.
- You only change styling/props in **one place**
- Code becomes **future-proof** and **easy to extend**

> **Key Insight:** Adding a new nav link = just add one object to an array. No touching JSX. That's production thinking.

---

## 2. Container Component

A `Container` is simply a **wrapper div** that enforces consistent width, centering, and padding across the whole app.

```jsx
// src/components/container/Container.jsx

import React from 'react'

function Container({ children }) {
    // w-full       → takes full width
    // max-w-7xl    → but won't exceed 1280px (standard max)
    // mx-auto      → centers horizontally
    // px-4         → padding on left and right so content doesn't touch edges
    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            {children}  {/* renders whatever is placed inside <Container> */}
        </div>
    );
}

export default Container
```

**Why use Container?**  
If you ever need to change the max-width of ALL pages (say from 1280px to 80%), you change it in ONE place — the Container component.

---

## 3. Logo Component

A simple component that displays the site logo. Accepts an optional `width` prop so it can be sized differently in Header vs Footer.

```jsx
// src/components/Logo.jsx

import React from 'react'

// width has a default value of "100px"
// If parent passes width="70px", that overrides the default
function Logo({ width = "100px" }) {
    return (
        <div>Logo</div>
        // In a real project, replace this with an <img> tag:
        // <img src="/logo.png" style={{ width }} alt="Logo" />
    )
}

export default Logo
```

---

## 4. Footer Component

Footer content is mostly **hardcoded** (static links, copyright text). It uses:
- `Link` from `react-router-dom` (NOT `<a>` tags — `<a>` causes full page reload)
- The `Logo` component
- Tailwind classes for layout

```jsx
// src/components/footer/Footer.jsx

import React from 'react'
import { Link } from 'react-router-dom'   // react-router-dom ka Link — no page reload
import Logo from '../Logo'

function Footer() {
  return (
    <section className="relative overflow-hidden py-10 bg-gray-400 border border-t-2 border-t-black">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="-m-6 flex flex-wrap">

          {/* Logo + Copyright section */}
          <div className="w-full p-6 md:w-1/2 lg:w-5/12">
            <div className="flex h-full flex-col justify-between">
              <div className="mb-4 inline-flex items-center">
                <Logo width="100px" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  &copy; Copyright 2023. All Rights Reserved by DevUI.
                </p>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="w-full p-6 md:w-1/2 lg:w-2/12">
            <div className="h-full">
              <h3 className="tracking-px mb-9 text-xs font-semibold uppercase text-gray-500">
                Company
              </h3>
              <ul>
                <li className="mb-4">
                  <Link className="text-base font-medium text-gray-900 hover:text-gray-700" to="/">
                    Features
                  </Link>
                </li>
                <li className="mb-4">
                  <Link className="text-base font-medium text-gray-900 hover:text-gray-700" to="/">
                    Pricing
                  </Link>
                </li>
                <li className="mb-4">
                  <Link className="text-base font-medium text-gray-900 hover:text-gray-700" to="/">
                    Affiliate Program
                  </Link>
                </li>
                <li>
                  <Link className="text-base font-medium text-gray-900 hover:text-gray-700" to="/">
                    Press Kit
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Support + Legals columns follow same pattern... */}

        </div>
      </div>
    </section>
  )
}

export default Footer
```

**Key Point:** `Link` from `react-router-dom` must be used instead of `<a href>` inside React apps to avoid full page reloads.

---

## 5. LogoutBtn Component

This button handles the entire **logout flow**:
1. Calls the Appwrite `logout()` service (which returns a Promise)
2. On success → dispatches `logout` action to Redux store (clears auth state)

```jsx
// src/components/Header/LogoutBtn.jsx

import React from 'react'
import { useDispatch } from 'react-redux'          // to dispatch actions to Redux store
import authService from '../../appwrite/auth'       // Appwrite service that handles actual API call
import { logout } from '../../store/authSlice'      // Redux action to clear user from store

function LogoutBtn() {
    const dispatch = useDispatch()

    const logoutHandler = () => {
        // authService.logout() returns a Promise (Appwrite deletes the session)
        authService.logout().then(() => {
            // Only after successful logout, update the Redux store
            dispatch(logout())
        })
        // Homework: Add .catch() to handle errors gracefully
    }

    return (
        <button
            className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
            onClick={logoutHandler}
        >
            Logout
        </button>
    )
}

export default LogoutBtn
```

---

## 6. Header Component

The Header is the most **interesting and complex** component. It demonstrates:
- **Array-driven nav items** (production pattern)
- **Conditional rendering** based on auth status
- `useSelector` to read from Redux store
- `useNavigate` for programmatic navigation

### 6a. Nav Items Array Pattern

Instead of writing each nav button manually in JSX, we define an **array of objects**. This is the production standard.

```jsx
const navItems = [
    {
        name: 'Home',
        slug: "/",
        active: true               // always visible
    },
    {
        name: "Login",
        slug: "/login",
        active: !authStatus,       // visible only when NOT logged in
    },
    {
        name: "Signup",
        slug: "/signup",
        active: !authStatus,       // visible only when NOT logged in
    },
    {
        name: "All Posts",
        slug: "/all-posts",
        active: authStatus,        // visible only when logged IN
    },
    {
        name: "Add Post",
        slug: "/add-post",
        active: authStatus,        // visible only when logged IN
    },
]
```

**Why this pattern?**  
To add a new nav item, just add one object to the array. No JSX changes needed. Easy to maintain.

### 6b. Full Header Component

```jsx
// src/components/header/Header.jsx

import React from 'react'
import { Container, Logo, LogoutBtn } from '../index'   // from barrel export
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'               // read auth state from Redux
import { useNavigate } from 'react-router-dom'          // for programmatic navigation

function Header() {
  // Read auth status from Redux store
  // state.auth.status is true = logged in, false = logged out
  const authStatus = useSelector((state) => state.auth.status)

  // useNavigate gives us a function to navigate programmatically
  // Difference from <Link>: navigate() is called from JS code (onClick), not JSX
  const navigate = useNavigate()

  const navItems = [
    { name: 'Home',      slug: "/",          active: true },
    { name: "Login",     slug: "/login",     active: !authStatus },
    { name: "Signup",    slug: "/signup",    active: !authStatus },
    { name: "All Posts", slug: "/all-posts", active: authStatus },
    { name: "Add Post",  slug: "/add-post",  active: authStatus },
  ]

  return (
    <header className='py-3 shadow bg-gray-500'>
      <Container>
        <nav className='flex'>

          {/* Logo wrapped in Link — clicking logo goes to home */}
          <div className='mr-4'>
            <Link to='/'>
              <Logo width='70px' />
            </Link>
          </div>

          {/* Nav items — ml-auto pushes them to the right */}
          <ul className='flex ml-auto'>
            {navItems.map((item) =>
              item.active ? (  // only render if active is true
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}  // navigate to slug on click
                    className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
                  >
                    {item.name}
                  </button>
                </li>
              ) : null  // if not active, render nothing
            )}

            {/* Show LogoutBtn ONLY when user is authenticated */}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>

        </nav>
      </Container>
    </header>
  )
}

export default Header
```

### 6c. `useNavigate` vs `<Link>`

| | `<Link>` | `useNavigate()` |
|---|---|---|
| **Used in** | JSX (declarative) | JavaScript logic (imperative) |
| **Example** | `<Link to="/login">Login</Link>` | `navigate("/login")` |
| **When to use** | Simple navigation in JSX | Navigate after an event (form submit, button click, etc.) |

Both come from `react-router-dom`. Both do the same thing — SPA navigation without page reload.

---

## 7. Barrel Export — `index.js`

Instead of importing from long paths everywhere, we **export everything from one file**:

```js
// src/components/index.js

import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Container from "./container/Container";
import Logo from "./Logo";
import LogoutBtn from "./Header/LogoutBtn";   // Note: LogoutBtn lives inside Header folder

// Re-export everything — now any file can do:
// import { Header, Footer, Container } from '../index'
export { Header, Footer, Container, Logo, LogoutBtn };
```

---

## 8. Button Component

A **generic, reusable Button** that accepts customizable colors, classes, and any other HTML button attributes.

```jsx
// src/components/Button.jsx

import React from "react";

export default function Button({
    children,               // text/content inside the button (e.g. "Login", "Submit")
    type = "button",        // default type is "button" (prevents accidental form submit)
    bgColor = "bg-blue-600", // default background color (can be overridden)
    textColor = "text-white", // default text color
    className = "",         // extra classes from parent (merged in)
    ...props                // any other HTML attributes (onClick, disabled, aria-*, etc.)
}) {
    return (
        <button
            // Merge: base styles + dynamic bg + dynamic text + custom classes
            className={`px-4 py-2 rounded-lg ${bgColor} ${textColor} ${className}`}
            type={type}
            {...props}   // spread all other props (onClick, disabled, etc.) onto the button
        >
            {children}
        </button>
    );
}
```

**Why `...props` spread?**  
If a parent passes `disabled`, `aria-label`, `data-id`, or any HTML attribute, it gets automatically applied. You don't need to explicitly list every possible prop.

**Usage examples:**
```jsx
<Button>Submit</Button>
<Button bgColor="bg-red-500" className="mt-4">Delete</Button>
<Button type="submit" disabled>Loading...</Button>
```

---

## 9. Input Component with `forwardRef`

This is the most **advanced** component in this lecture.

### 9a. The Problem — Why forwardRef?

When you build a reusable `<Input />` component, the **actual `<input>` HTML element lives inside** that component. But the **parent** (e.g., LoginPage) needs to:
- Read the current value
- Focus the input programmatically
- Validate on submit

Normally, `ref` only works on DOM elements directly. If you do `ref={emailRef}` on `<Input />`, React doesn't forward that ref to the internal `<input>` — you get `null`.

**Solution: `React.forwardRef`** — it passes the ref *through* the component to the actual DOM element inside.

> **Interview Answer:** "forwardRef is used when a parent component needs a ref to a DOM element that lives inside a child component. A classic example is a reusable Input field — the Input component is separate, but the Login page needs access to the actual input DOM node."

### 9b. `useId` Hook

`useId()` generates a **unique ID** on each render. Used here to:
- Set `id` on the `<input>` element
- Set `htmlFor` on the `<label>` element

This links the label to the input (accessibility), so clicking the label focuses the input.

### 9c. Full Input Component

```jsx
// src/components/Input.jsx

import React, { useId } from 'react'

// React.forwardRef wraps the entire component
// It receives (props, ref) — where ref is passed from the parent
const Input = React.forwardRef(function Input(
    {
        label,              // optional label text (e.g. "Email Address")
        type = "text",      // input type: text, password, email, number, etc.
        className = "",     // extra classes from parent
        ...props            // all other input attributes: placeholder, value, onChange, etc.
    },
    ref                     // the ref forwarded from the parent component
) {

    const id = useId()  // generates a unique ID like ":r1:", ":r2:", etc.

    return (
        <div className='w-full'>

            {/* Only render label if `label` prop was provided */}
            {label && (
                <label
                    className='inline-block mb-1 pl-1'
                    htmlFor={id}    // links this label to the input with matching id
                >
                    {label}
                </label>
            )}

            <input
                type={type}
                className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
                ref={ref}       // THIS is the magic — forwards the ref to the real <input> DOM node
                id={id}         // matches htmlFor on the label above
                {...props}      // spreads: placeholder, value, onChange, onFocus, disabled, etc.
            />

        </div>
    )
})

export default Input
```

### 9d. How to USE the Input component in a parent

```jsx
// In LoginPage.jsx (example usage)
import React, { useRef } from 'react'
import Input from '../components/Input'

function LoginPage() {
    const emailRef = useRef(null)    // create a ref

    const handleSubmit = () => {
        console.log(emailRef.current.value)  // directly access DOM input value
        emailRef.current.focus()             // or programmatically focus it
    }

    return (
        <div>
            {/* Pass the ref — forwardRef ensures it reaches the <input> inside */}
            <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                ref={emailRef}
            />
            <button onClick={handleSubmit}>Login</button>
        </div>
    )
}
```

---

## 10. Summary Table

| Component | Key Concept | Important Props |
|---|---|---|
| `Container` | Wrapper with max-width + centering | `children` |
| `Logo` | Reusable logo with configurable size | `width` (optional, default `"100px"`) |
| `Footer` | Static content, uses `Link` from react-router | — |
| `LogoutBtn` | Calls Appwrite service + dispatches Redux action | — |
| `Header` | Array-driven nav + conditional rendering + `useNavigate` | — |
| `Button` | Generic button with customizable styles + `...props` spread | `children`, `type`, `bgColor`, `textColor`, `className`, `...props` |
| `Input` | `forwardRef` to expose internal `<input>` ref to parent | `label`, `type`, `className`, `ref`, `...props` |

---

## 11. Key Concepts Recap

### Conditional Rendering
```jsx
// Pattern 1: ternary
item.active ? <li>...</li> : null

// Pattern 2: && short-circuit (most common)
authStatus && <LogoutBtn />
// If authStatus is false, nothing renders. If true, LogoutBtn renders.
```

### Props Spread `...props`
```jsx
function Button({ className, ...props }) {
    return <button className={className} {...props} />
    // All other props (onClick, disabled, type, etc.) passed through automatically
}
```

### Template Literals for className
```jsx
// Combine fixed classes + dynamic variable
className={`px-4 py-2 ${bgColor} ${textColor} ${className}`}
```

### One-liner component (no return keyword needed)
```jsx
// These are equivalent:
function Container({ children }) {
    return <div className="...">{children}</div>
}

// Arrow function one-liner (no return, no parentheses needed for single expression)
const Container = ({ children }) => <div className="...">{children}</div>;
```

---

## 12. forwardRef — Interview Deep Dive

**Q: What is `forwardRef` and when do you use it?**

> `React.forwardRef` is a higher-order function that lets a **parent component pass a `ref` down to a DOM element inside a child component**.
>
> Normal `ref` only works on raw DOM elements (`<input>`, `<div>`, etc.). When you create a custom component like `<Input />`, the ref gets attached to the component instance, not the internal DOM node.
>
> **Real-world use case:** A reusable `<Input />` component — the Login page needs to read/focus the actual `<input>` DOM node inside it. With `forwardRef`, we wrap the component and pass the ref through to the internal `<input ref={ref} />`.

**Q: What's the syntax?**
```jsx
const MyInput = React.forwardRef(function MyInput(props, ref) {
    return <input ref={ref} {...props} />
})
```

**Q: What is `useId`?**
> `useId()` is a React hook that generates a unique, stable ID for accessibility. Used to connect `<label htmlFor={id}>` with `<input id={id}>`, so clicking the label focuses the input.

---

> 💡 **Final Note from the lecture:** Production-grade code isn't complicated — it's just the same basics applied thoughtfully. The array nav pattern, forwardRef, props spreading — these look scary at first but become second nature. The goal is that when you see this in a real codebase or interview, you **recognize it** and know exactly what it does.



<!-- Transcript:
```
हां जी कैसे हैं आप सभी सबसे पहले तो एक
कम करिए कमेंट क्षेत्र में अटेंडेंस लगाइए
की कौन-कौन है इस वीडियो को कब देखना है
तो अपनी डेट और टाइम बिल्कुल लिखने जाएगा
क्योंकि ये सबसे बेस्ट तरीका है ये ट्रैक
करने का की इस वीडियो को कब तक लोग देख
रहे हैं कब-कब देख रहे हैं कितने लोग
वीडियो अपलोड होते ही ए जाते हैं कितने
लोग हफ्ते बर्बाद एक महीना बाद एक साल बाद
कब आते हैं हां बाय डी वे यह ध्यान रखा
गया है सीरीज के अंदर की एक्चुअली में
सीरीज इतनी जल्दी अपडेटेड ना हो जितने भी
पैकेज हैं जितना भी क स्लो है वह सब हम इस
तरह से पूरा सिख रहे हैं ताकि इनके इसको
अपडेट भी है तो हम बहुत ही आसानी से उसको
अपडेट भी कर लेने है ना ठीक है तो चलिए इस
वीडियो के अंदर हम क्या करेंगे इस वीडियो
के अंदर हम थोड़ा सा कॉम्पोनेंट्स के ऊपर
वापस से बात करेंगे हमारी जो सीरीज है ये
चाय और रिएक्ट के साथ में तो देखिए कुछ
चीज बड़ी बेसिक तरीके से कराई जाति है बट
मैं नहीं चाहता की उनको इतना बेसिक करके
इतना आसन कर डन क्योंकि ऑलरेडी आसन कम तो
हम पीछे सखी चुके हैं इसमें कोई दिक्कत
वाली बात ही नहीं है व्हाट तू डू वगेरा तो
कर चुके हैं लेकिन अब मैं आपको चाहता हूं
की प्रोडक्शन ग्रेट में कम कैसा होता है
इंडस्ट्रीज में कम कैसा होता है कहां पे
किन चीजों का कैसे ध्यान रखा जाता है एक
सबसे बेस्ट एग्जांपल लेट हूं पहले मैं
आपके साथ में स्क्रीन शेर करता हूं एक
छोटा सा एग्जांपल यहां पर बड़ा ही इजी
एग्जांपल है देखिए सपोज करिए की हमारे पास
यहां पे एक यह फॉर्म है अब इस फॉर्म के
अंदर सपोज करिए की हमारे पास में ये एक
हमारा ईमेल का बटन है या इनपुट फॉर्म है
और एक हमारे पास में पासवर्ड का फॉर्म है
और एक हमारे पास में ये लोग इन बटन है तो
सपोज करिए यहां पे हम लिख लेते हैं
टेक्स्ट का ये लीजिए लॉगिन ठीक है तो ये
हमने यहां पे लॉगिन लिख लिया और ये लॉगिन
ए गया अब इस फॉर्म को बनाना बहुत ही आसन
कम है आपको पता है एक इनपुट फील्ड लोग
उसको स्टेट में स्टोर कर लोग एक पासवर्ड
फील्ड लोग उसको स्टेट में स्टोर कर लोग
जैसे ही लॉगिन क्लिक होता है तो उसके अंदर
आप ये दोनों की वैल्यू आप स्टेट से ले लोग
हो सकता है दो स्टेट ना बना के आप सिर्फ
एक ऑब्जेक्ट ले लो की दोनों की स्टेट वहीं
पे हो वालुज आप एड कर लोग ऑन चेंज पर आप
इवेंट ट्रिगर कर लोग और स्टेट के अंदर
वालुज अपडेट कर लोग इतना तो सभी को
ऑलमोस्ट आता है हमने टोडोस के अंदर ये सब
कुछ सिख चुके हैं और इसीलिए मैं कहता हूं
बनाया करो क्योंकि उसमें
तब भी आप मेरे साथ कनेक्ट हो का रहे हो की
हां यह कोई इतना बड़ा कम नहीं है लोग इन
के अंदर में एक छोटा सा मेथड बना सकता हूं
ऑन सबमिट पर या फिर सिर्फ लॉगिन के ऑन
क्लिक पे की जब भी ऑन क्लिक हो दोनों
स्टेट की वालुज लो और डिस्पैच कर दो सीधा
सीधा एक कोई इवेंट या फिर अगर आप डायरेक्ट
ही करना चाहते हैं तो हम सर्विस से एक
मेथड ले लेंगे और उसे मेथड के अंदर वो
दोनों इनपुट फाइल के अंदर दाल देंगे वालुज
अपनी ईमेल और पासवर्ड और सेंड कर देंगे
अपराइट को या जो भी सर्विस आप उसे कर रहे
हो तो ये तो हुआ बड़ा ही बेसिक सिंटेक्स
अक्सर आपको ट्यूटोरियल में इसी तरह का
सिंटेक्स सिखाया जाता है इनफैक्ट मैं भी
आगे कई ट्यूटोरियल के अंदर यही सिंटेक्स
उसे करूंगा लेकिन इस वीडियो के अंदर मैं
चाहता हूं आप थोड़ा सा प्रोडक्शन ग्रेट की
तरफ जो क्योंकि वहां पे अगर कुछ ऐसा ए जाए
जब के अंदर दे वन पे तो आप सरप्राइज ना हो
उसके अंदर क्या होता है ये जो आपका इनपुट
फील्ड है ना इसको एक्चुअली में अलग से
कंपोनेंट बनाया जाता है और इस सेपरेट
कंपोनेंट को बनाने से फायदा क्या है इसको
बड़ा ही प्रॉप रिलेटेड बनाया जाता है की
इसके अंदर क्या लेबल पास करोगे क्या प्लेस
होल्डर होना चाहिए कैसी स्टाइलिंग हनी
चाहिए बड़ा ही हम इस तरह से बनाया जाता है
ताकि इनपुट फील्ड के अंदर भी ये कम ए
रजिस्टर में भी कम ए जाए या कहानी और भी
अगर इनपुट फील्ड कम में लेना है तो हम
वहां पर भी कम में ले सकें तो यह कंपोनेंट
बेस डिजाइन जो है ना बड़ी ही आम है सारे
के सारे एप्लीकेशंस में जो भी रिएक्ट करते
हैं तो मैं सोच रहा था की आपको थोड़ा सा
एक टेस्ट दें एक हिंट दें की इस लेवल के
हायर कॉम्पोनेंट्स भी कैसे बनाया जाते हैं
कुछ होता नहीं है उसमें ज्यादा खास बड़ा
ही बेसिक्स है पर उसके बड़े में हम थोड़ी
सी चर्चा करेंगे तो ये बेसिक अप्रोच ना
लेक हम थोड़ी सी कॉम्पोनेंट्स स्पेसिफिक
अप्रोच लेंगे ताकि थोड़ा सा देखिए परिसर
अभी आपको लगता है और इतना परिसर क्यों
बनाया लेकिन जैसे आप इंडस्ट्री में जाओगे
ना उसे दिन याद करोगे की आ सर ने थोड़ा सा
तो वहां पे परेशान किया था थोड़ा सा
कंपलेक्सिटी इंट्रोड्यूस कारी थी बट आज जब
के अंदर थोड़ा आराम है इनफैक्ट मैं अपने
साथियों को भी समझा का रहा हूं की अरे चाय
और कोर्ट से पढ़ लिया होता तो इतना सब कुछ
इजी लगता है ये सब है ना तो थोड़ी सी
परेशानी आज के परेशानी अच्छी है तो थोड़ी
सी परेशानी हम लेंगे यहां पे ओके तो अब
हमारे पास में ये है हमने बनाया है
कॉम्पोनेंट्स कॉम्पोनेंट्स के अंदर है
हमारे पास में फूटर और हेडर अच्छा फूटर को
भी मैं दो पार्ट में डिवाइड करने वाला हूं
यहां पे एक होगा हमारा बेसिक सॉरी हेडर को
एक होगा हमारा बेसिक हेडर और एक होगा उसका
लॉगआउट बटन तो वो भी हम करेंगे यहां पे
ठीक है कॉम्पोनेंट्स के अंदर अभी हम क्या
है एक-एक करके नए कॉम्पोनेंट्स बनाते जाते
हैं सबका मैं उसे कैसे भी आपको बताता
जाऊंगा और ये एक ऑलमोस्ट सिमिलर है आप
जहां पे भी एप्लीकेशन बनाएंगे और वहां पे
भी आपको इस तरह के एप्लीकेशंस में इस तरह
के कॉम्पोनेंट्स मिलेंगे सबसे पहले और आम
जो है वो है कंटेनर तो इसके अंदर मैं
बनाता हूं सिंपल सा अपना
कंटेनर डॉट जी एसएस ऑफ कोर्स
है और आईएफसी लिख देते हैं यह कंटेनर बन
गया हमारा अच्छा इस कंटेनर के अंदर है
क्या देखिए कंटेनर क्या होता है आपकी
प्रॉपर्टीज एक्सेप्ट करता है आज एन
चिल्ड्रन अब चिल्ड्रन तो सिर्फ एक नाम है
आप जो चाहे रख सकते हैं कंटेनर क्या होता
है सिर्फ एक बॉक्स होता है जिसके अंदर ऊपर
और नीचे कुछ है जैसे हमारा में अप डॉट
जेएस के ऊपर हेड है नीचे है कंटेनर के
अंदर हम क्या है सिर्फ हाइट वेट स्टाइलिंग
प्रॉपर्टीज डिफाइन करते हैं उसके अंदर जो
भी वालुज होती है एड आज आईटी इस डिस्क
लेकर ए लेते हैं आप आगे जाके नेक्स्ट में
बनोगे किसी भी बनोगे ये आम कॉन्सेप्ट है
जो आपके पास हमेशा रहेगा अच्छा इसके अंदर
हम क्या करते हैं सबसे पहले तो कुछ
क्लासेस एड कर देते हैं तो क्लास नाम अब
कौन-कौन सी क्लास एड करनी है देखिए विथ तो
चाहिए फूल पर इससे फायदा पता है क्या है
अब कंटेनर की कभी सपोज करिए विथ मुझे 80%
ही चाहिए सारे एलिमेंट्स के अंदर तो बस
इसमें कंटेनर शिफ्ट कर दूंगा और हो जाएगा
कम तो ये बड़ा ही आम है बड़ा ही अच्छा
राहत है एक हम यहां पे और ये देखिए ये
साड़ी की साड़ी क्लासेस ना तेल वन की
क्लासेस हैं तो जैसे-जैसे हमें लगा की ये
वाली क्लास एड करनी चाहिए नहीं करनी चाहिए
उसे हिसाब से हमने इसको और ऑप्टिमाइज करता
है देव इन पे ये कुछ भी ऐसा नहीं था जब
हमने प्रोजेक्ट बनाया था ऐवेंंचुअली
थोड़ा-थोड़ा अपडेट होता है आप भी करोगे
इसको और अपडेट इस तरह से मैक्स ऑटो कर
देता हूं ताकि लेफ्ट और राइट से मार्जिन
हमें ऑटो मिल जाए मतलब सेंटर के अंदर ए
जाए और पेंडिंग एक्स हमने इसको फोर दी थी
क्योंकि थोड़ा सा हमें बाद में पता लगा की
पेंडिंग का इश्यूज ए रहा है इसके अंदर
अच्छा इसके बाद क्या करना है ये कंटेनर है
आगे आईटी इसे कंटेनर को हटाओ और यहां पे
अपने चिल्ड्रन इंट्रोड्यूस कर दो
है तो यह हमने चिल्ड्रन यहां पर
इंट्रोड्यूस कर दिया बस इतना सा कम है अब
यहां पर एक और इंटरेस्टिंग चीज बताता हूं
यह जस्ट स ए एक्स्ट्रा बोनस मां लो देखिए
जब भी आपकी इस तरह की एक ही लाइन रिड्यूस
हो रही है हमेशा जरूरी नहीं है की रिटर्न
के अंदर ही पेरैंथेसिस आए आप चाहे तो
ऑप्शनली हटा सकते हैं जैसे के अंदर हम कई
बार हटा देते हैं वो करीब से तो यहां पे
इस तरह से आप इसको भी हटा सकते हैं यहां
पे कोई एरर नहीं आएगा से लाइन में उसको
दाल दीजिए तो ये सिंटेक्स भी आपको कई बार
हो सकता है आप कॉरपोरेट में कम कर रहे हैं
कहानी पे कुछ कर रहे हैं तो इस तरह का मिल
जाएगा यहां मेरा रेकमेंडेशन सिर्फ
रिकमेंडेशन है कोई कंपलसरी नहीं है की
यहां पे एक सेमी कोलोन भी लगा दो जिससे
थोड़ा सा क्लेरिटी ए जाति है की हां ये एक
ही लाइन है वरना कई बार लाइन ब्रिक्स कर
इनका इशू हो जाता है बट इतना कोई ज्यादा
प्रॉब्लम वाली बात नहीं देखिए एक ही लाइन
है तो ये एक लाइन में होना जरूरी है तो बस
इतना सा कम है
अब इसके अंदर मां लीजिए कभी मेरे को इसका
कंटेनर कंटेनर का सिर्फ बैकग्राउंड ब्लैक
देना पड़ा है कुछ और तो मैं सिर्फ यहां पे
आके कम कर दूंगा ठीक है तो ये तो हो गया
हमारा कंटेनर का कम ठीक है जी कंटेनर हो
गया अब आते हैं हमारे फूटर के अंदर देखिए
फूटर के अंदर तो ऑब्वियस सी बात है
ज्यादातर जो कंटेंट है वो हार्डकोर है तो
मैं भी अपने नोट्स में से लूंगा आगे आईटी
इसे और आपके सामने यहां पे पेस्ट कर देंगे
सीधा इससे ज्यादा कुछ नहीं करने वाले आपको
अगर चेंज लगता है फुट में तो बी झिझक जाइए
और चेंज करिए मैं अपने नोट्स में से यहां
पे एड कर दूंगा सर का सर माल और आपको अगर
कुछ और इसके अंदर एड करना है तो आप अपना
माल एड कर दीजिए ठीक है कोई दिक्कत इसमें
कुछ नहीं तो हम क्या करते हैं सीधा ये
रिटर्न के अंदर देखिए एक सिंगल लाइन भी
हमारा इसमें जावा स्क्रिप्ट नहीं है मैं
आज आईटी इस पेस्ट करके आपको दिखता हूं ये
हमने लिया आप भी अपने गेट अप पे जाएगा
मेरे और वहां से नोट्स में से ये नोट्स
क्या सीधा फाइल में से आगे आईटी इसे ले
लीजिएगा तो कुछ नहीं हमने यहां पे कुछ
क्लासेस एड कर राखी है अब ये तेलविन की
क्लास तो है नहीं की हम यहां पे ज्यादा
फॉक्स करें कोई फायदा नहीं है देखिए ये
लिखने को तो मैं लिख देता हूं और 2 घंटा
और वीडियो बड़ा लेट है लेकिन फायदा नहीं
है ना उसे 2 घंटे का हो सकता है मैं सीधा
एक फूटर लिख के बस फूटर पे था एफिलिएट
वगैरा जितना भी सब है कुछ हो नहीं रहा है
इसे ये सब ब्लैक है एकदम और पूरे और पूरे
सर का सर हमारे पास ये जितना भी है इस तरह
से लेकिन एक इंपॉर्टेंट चीज है आप यहां पे
देख रहे होंगे लिंक
कहां से आता है कमेंट क्षेत्र में बताओ
मुझे की ये लिंक कहां से इंपोर्ट होगा हां
जी इस लिंक को अगर आपको इंपोर्ट करना है
तो रिएक्ट राउटर डम से ही होगा तो हम ये
लिंक ले लेते हैं रिएक्ट राउटर डॉ अच्छा
इसके अलावा हमारे पास क्या है एक ये लोगो
भी है हमारे पास में इस लोगों को भी हमें
इंपोर्ट करना पड़ेगा इसका विथ ही एक्सेप्ट
करता है की लोगो इस तरह से तो मैं क्या
करता हूं एक बेसिक लोगों कंपोनेंट बना
देता हूं वैसे तो उसके अंदर एक इमेज है हम
ऑनलाइन को इमेज ले लेते हैं अपना ही लेते
हैं यहां पे तो हम क्या करते हैं इस फूटर
को एक बार क्लोज करते हैं कॉम्पोनेंट्स के
अंदर एक नई फाइल बना लेते हैं जिसका नाम
रख देते हैं सीधा ही लोगों को फोल्डर के
अंदर नहीं है लोगो डॉट जेएस
है और अपना आईएफसी यह लीजिए बन गया है
आपका लोगो अब इसके अंदर हमने क्या है
एक्चुअली में जब प्रोजेक्ट बनाया था तब
हमने यहां पर एक इमेज रिटर्न कारी थी और
इसी के लिए इसकी स्टाइलिंग विथ वगेरा यह
सब है तो यहां पे एक ऑप्शनल प्रॉपर्टी हम
ले रहे हैं ऑप्शनल इसलिए क्योंकि यहां पे
जब मैं विथ देता हूं तो तो ये प्रॉपर्टी
होगी कंपलसरी बट मगर यही पर वैल्यू दे
देता हूं की 100 पिक्सल का चाहिए या फिर
मुझे मां लीजिए सपोज करिए 100% चाहिए तो
आप उसे तरह से दे सकते हैं तो मैं यहां पे
100% तो नहीं दूंगा इसको 100 पिक्सल ही
दूंगा क्योंकि ज्यादा बड़ा हो जाएगा वरना
ये लोगों ठीक है और अगर विद देता भी है तो
हम यहां पे उसे भी करना चाहें तो कर सकते
हैं अभी मैं इसको आज आईटी इसे लोगो रख
देता हूं क्योंकि और कोई मुझे लगता नहीं
की कुछ है मेरे पास बाद में देखेंगे
क्योंकि इतना बड़ा कोई बड़ा कम है नहीं
अभी इंटरेस्टिंग बात ये है की इस लोगो को
भी इंपोर्ट करना पड़ेगा वरना प्रॉब्लम
आएगी तो ये इंपोर्ट लोगो फ्रॉम करंट
डायरेक्टरी लोगो एक डायरेक्टरी बाहर गए और
लोगो मिल गया बस यही है अगर इसमें कुछ एरर
वगैरा आई तो हम बाद में सॉल्व कर लेंगे
बाकी तो और कोई मुझे ऐसा सच दिखे नहीं रहा
तो फूटर हो गया लोगो हो गया
ठीक है जी लोगों का कंपोनेंट का कम हो गया
अब आते हैं हमारे हेडर के पास अभी जो हेडर
है ना यह बड़ा ही इंटरेस्टिंग है इसको हम
पूरा का पूरा बनाएंगे यहां पे क्योंकि ये
बड़ा इंटरेस्टिंग है हेडर ना थोड़ा सा
ऑप्शनल है क्योंकि साड़ी वालुज हम एक बार
मैं नहीं दिखाना चाहते हैं और स्पेशली लोग
आउट किसको दिखाना है किसको नहीं दिखाना है
ये तो ऑब्वियस सी बात है हमें जज ही करना
पड़ेगा जज कैसे करेंगे कोई लॉगिन है या
नहीं उसके बेसिस पे तो एक कम करते हैं
हेडर के अंदर पहले एक नई फाइल बना लेते
हैं जिसका नाम हम रखते हैं यहां पे लोग
आउट बटन राइट क्लिक न्यू फाइल और इसका नाम
रखते हैं
लोग आउट
यह लीजिए लॉगआउट बटन रख देते हैं
अच्छा जी अब आपके पास यह लोग आउट बटन ए
गया और आप एक्सपोर्ट डिफॉल्ट भी अपने कर
दिया इतना कम तो ठीक है लेकिन लोग आउट के
बाद ऑब्वियस सी बात है आपको कुछ ना कुछ
एक्शन लेना पड़ेगा कुछ डिस्पैच करना
पड़ेगा तो लोग आउट के लिए आपको स्टोर से
स्लाइस भी लाना पड़ेगा स्लाइस मतलब
रिड्यूस सर लाना पड़ेगा एक तरह से एक्शन
और डिस्पैच भी लाना पड़ेगा तो दो कम तो
चाहिएंगे तो सबसे पहले तो ले आते हैं
उसे डिस्पैच फ्रॉम रिएक्ट रिडक्शन ठीक है
जी उसके बाद हमें और सर्विस भी लगेगी
क्योंकि लोग आउट एक्चुअली
सर्विस ही लिखित हमने सर्विसेज नहीं लिखी
थी और इसको लेकर आएंगे हम डॉट डॉट स्लैश
एक बार और और हम जाएंगे अपने आप राइट के
अंदर और अपराइट के अंदर हमने ये कनफ्लिक्ट
के अंदर लिख रखा है ठीक है उसके अलावा कोई
सजेशन नहीं है और लोग आउट की एक
इंडिविजुअल सर्विस भी लानी पड़ेगी हां जी
तभी तो लोग आउट होगा
ये लीजिए लोग आउट ले आए और ये लोग आउट
आएगा हमारे पास में आ फीचर्स फीचर्स था
हमारे पास है ही नहीं
लोग आउट कहां से आएगा स्टोर में से हां जी
तो
फ्रॉम के अंदर जाएंगे एक डायरेक्टरी बैक
एक और डायरेक्ट थ्री बैक और हमारे पास ये
रस तोर और स्टोर के अंदर है हमारे पास में
और स्लाइस यहां से आएगा हमारे पास ठीक है
जी ठीक है जी इंपोर्ट का कम तो हो गया अब
सबसे पहले क्या करना पड़ेगा एक डिस्पैच
बना लेते हैं क्योंकि डिस्पैच करना ही
पड़ेगा कुछ ना कुछ तो यह लीजिए
डिस्पैच
अगर लिख पे तो ठीक है और यह
एक बटन बनेगा तो एक लोग आउट हैंडलर बनाना
ही बनाना पड़ेगा तो एक लोग आउट हैंडलर बना
लेते हैं तो इसको बोल लेते हैं लोग आउट
हैंडलर ये लीजिए और ये हो गया
अब लॉगआउट हैंडलर के अंदर होगा क्या कम
सबसे पहले और सर्विस उसे करो और सर्विस
हमने उसे कारी
है अब इस और सर्विस के अंदर से क्या चाहिए
डायरेक्टली हमने एक मेथड बनाया हुआ है लोग
आउट सजेशन पे मत जाएगा आप अपना दिमाग
लगाइएगा आई है लेकिन यही से ऊपर भी अभी आप
हैं वहां पे ये लोग आउट कर अब लॉगआउट करने
से होगा क्या देखिए लॉगआउट अपने आप में ना
एक प्रॉमिस है यहां पे ये ध्यान रखिएगा बस
एक छोटी सी बात स्टोर के अंदर जाते हैं और
स्लाइस
ऑथराइज के अंदर ये लोग आउट तो ये जो है ना
ये अपने आप में जितने भी रिड्यूसर्स वगैरा
हैं अप राइट के पास ही जैसे भी जाते हैं
ये सारे के सारे एक्चुअली में क्या है
एक्चुअली में यहां नहीं सॉरी
कहां गए कहां गए हम यह अप्राइट के अंदर यह
कौन से आपके अंदर और यह हमारा है लोग आउट
तो यह जो लॉगआउट आपको मिलता है अप्राइट से
देखिए ट्राई कैच है यह जैसे डिलीट सेशन हो
जाता है ये अपने आप में मोस्ट ऑफ डी चीज
है अप्राइट के अंदर एक प्रोमाइज होती है
तो इसको सबसे अच्छी बात ये है की आपने
जैसे लोग आउट कॉल कर दिया अब आपको मिलेगा
एक प्रॉमिस तो प्रॉमिस को हैंडल करने के
लिए लीजिए डॉट दें लगा दीजिए आपका मां
करें डॉट कैच भी लगा सकते हैं मैं आपके
लिए तोड़ू छोड़ना हूं एक होमवर्क और ये
लीजिए हमने इस तरह से ये उसे कर लिया अब
अगर लोग आउट सक्सेसफुली हो गया है तो एक
डिस्पैच भी कर देते हैं लोग आउट का ताकि
स्टोर के अंदर जो इंपॉर्टेंट इनफॉरमेशन है
वो अपडेटेड रहे बस इतना सही तो कम था ठीक
है अब यहां पर आपको एक बटन बनाना है तो हम
क्या करेंगे सीधा सा एक बटन ही बना देते
हैं डायरेक्टली क्योंकि इस जो कंपोनेंट के
अंदर है 50 चीज़ हम कर नहीं रहे हैं सिर्फ
एक बटन नहीं ले रहे हैं तो ये लीजिए बटन
और इस बटन को कर देते हैं और ये लीजिए बटन
और इस बटन के अंदर सीधा सा लिख देते हैं
लोग आउट
अच्छा बटन के अंदर कुछ क्लासेस हमने एड
कारी है आपका मां करें तो एड करिए मां
करें मत करिए कोई दिक्कत वाली बात नहीं है
मैं भी डायरेक्टली नोट्स में से ही एक
क्लासेस लूंगा क्योंकि जितना भी डिजाइनिंग
का पार्ट था वो तो वैसे भी हम ज्यादा
फॉक्स कर नहीं रहे हैं ये लीजिए बस कुछ आ
क्लासिक क्लासेस लिख दिया यहां पे बस
थॉट्स आईटी तो ये तो हो गया है आपका अब
बटन ठीक है जी लोग आउट बटन है अब हेडर के
अंदर हम क्या करेंगे सारे के सारे लिंक
रखेंगे लेकिन लोग आउट दिखाना या नहीं
दिखाना ये हम कंडीशनरी रेंडर करेंगे
कंडीशनली रेंडर मतलब बोले तो कंडीशनल
रेंडर मतलब आ की चेक करेंगे पहले की यूजर
लॉगिन है या नहीं है अगर लोग दिन है तो ही
तो लॉगआउट बटन दिखाने का सेंस है वरना
क्यों नहीं दिखाना है उसको है की नहीं कोई
दिक्कत नहीं चलिए तो इसके अंदर सबसे पहले
क्या चाहिएगा देखिए सबसे पहले तो हमें
क्या-क्या चाहिएगा
की एक तो कंटेनर भी ले लेते हैं क्योंकि
यहां पे हम थोड़ा सा कंटेनर का उसे करके
देख लेते हैं आपका मां हो तो कर ही नहीं
तो कोई दिक्कत नहीं है तो हम अच्छा
कंटेनर्स वगैरा हमने एक्सपोर्ट नहीं करें
यहां पे
एक्चुअली में कंटेनर्स वगैरा हमें सब
index.js से चाहिए थे पहले तो क्लोज करते
हैं बहुत साड़ी फाइल्स ओपन हो गई है
ठीक है हेडर भी क्लोज करते हैं और
index.js तो इसके अंदर कंटेनर आते हैं
बहुत कुछ ले आए हम यहां पे एक्चुअली में
सब यही से लाना चाहिए था इंपोर्ट
कंटेनर फ्रॉम कंटेनर ठीक है जी इसको भी
एक्सपोर्ट करते हैं
वैसे तो ठीक है देखते हैं लोगों यहां पर
ले आते हैं बाकी फाइल्स में अपडेट कर
देंगे
और यहां पर
यहां से लाना ज्यादा सही राहत आप
क्या-क्या चाहिए हमें एन कुछ चीज चाहिए की
क्या क्या चाहिएगा एक तो
कंटेनर और एक चाहिएगा आपका लोगो
अब यह हमें चाहिएगा लॉगआउट बटन भी चाहिएगा
बटन तो हम लेकर नहीं आया यहां पर
हां इसी तरह से रियल वर्ल्ड प्रोजेक्ट
बनते हैं
लोग आउट बटन फ्रॉम इंडेक्स वैसे तो यहां
पर लिख सकते हो की आप चाहे तो यहां पर
हम हैदर के अंदर है तो हम यह भी लिख सकते
हैं
वरना कई लोगों को समझ में नहीं आएगा यहां
पर क्या होगा रिडक्शन के लिए कुछ लिंक भी
लगेंगे तो लिंक भी ले लेते हैं अब लिंक तो
आपको पता ही है
सिलेक्ट भी लगेगा
है क्योंकि सिलेक्ट होगा तभी तो स्टोर में
जाकर देख पाऊंगा की यूजर लोग दिन है या
नहीं है तो सिलेक्ट लगेगा लगेगा तो उसे
सिलेक्ट कर लिया रिएक्ट रिडक्शन अब लॉगआउट
भी ले आते हैं तो इंपोर्ट करके
लोग आउट
लोग आउट तम ले आई लोग आउट बटन
इसके बड़े में हमने बात नहीं कारी है इसके
बड़े में भी करेंगे दो चीज एक उसे नेविगेट
है एक नेवीगेशन है दोनों के यूजेस में
थोड़ा सा अंतर है ये आपको रिएक्ट राउटर डॉ
से मिलता है कभी भी किसी को किसी नेवीगेशन
में फोर्सफुली करना है या कुछ इस तरह से
तो उसे नेविगेट और ये सब उसे आते हैं
ज्यादा कुछ खास है नहीं बड़ा ही बेसिक सा
एक ही बार में समझा दूंगा आपको कोई दिक्कत
नहीं आएगी आपको ठीक है अब सबसे पहले तो
चलते हैं हमें क्या चाहिए स्टेट में से
निकालना पड़ेगा की
ऑथेंटिकेटेड है या नहीं है तो कैसे
निकलेंगे इसको बोल देते हैं और स्टेटस
अबाउट स्टेटस कहां से आएगा ये उसे सिलेक्ट
कर लिया तो है आपने ये लीजिए उसे सिलेक्ट
के अंदर क्या है हमें पता है की ये कॉल
बैक मिलता है ये लीजिए कॉल बैक इसके अंदर
आपको स्टेट का एक्सेस मिल जाता है अब इसके
अंदर क्या करो स्टेट डॉट डॉट तो आपको मिल
जाएगा
तो स्टोर में नहीं चलते हैं तो यहां पे
देखिए इस तरह से स्टेटस तो ये बस यही
स्टेटस कर रहे हैं
और इसीलिए बोला स्टेट डॉट स्टेटस तो यहां
पर
स्टेटस एक छोटा सा टाइप हो गया स्टेटस तो
हां इस तरह के टाइप करेंगे आराम से बैठ के
बहुत सारे होने वाले हैं कंफर्म बात है
अच्छा नेविगेट लिया है तो यह उसे नेविगेट
से बना लेते हैं जैसे डिस्पैच से बनाते
हैं इस तरह से नेविगेट उसे नेविगेट हो गया
अच्छा अब एक इंटरेस्टिंग चीज है
इस तरह की नेवीगेशन बार जब भी बंटी है ना
तो एक्चुअली में एक अरे बनाया जाता है और
उसके ऊपर लूप किया जाता है तो इसको बोल
देते हैं नाइफ आइटम्स और यह राहत है
आपके तो ये हो गया हमारा ये फर्स्ट और
इसके अंदर अलग-अलग ऑब्जेक्ट इस तरह से
रखें जाते हैं कॉमर्स सेपरेटेड तो जो भी
ऑब्जेक्ट्स की वालुज है आप इस तरह से
लिखिए अक्सर आपको ये दिखेगा की इसी तरह से
क्योंकि इसका फायदा पता है क्या है एक-एक
वालुज लिखोगे तो हर बार एक नया बटन आया था
उसे बटन को आपको लगाना पड़ता है बट
प्रोडक्शन ग्रिड एप्स में क्या होता है की
हम सीधा इस तरह से ऑब्जेक्ट बनाते हैं तो
ऑब्जेक्ट में एक और वैल्यू एड कर दो और बस
नेवीगेशन बार में एड हो जाति है तो ये
बड़ा ही आम एक्सटेंड है सिंटेक्स है तो
यहां पे हम इसका नाम लिख देते हैं होम तो
ठीक है जी ये नाम होम हो गया इसका स्लग भी
चाहिएगा हमें स्लग एक्चुअली में क्या है
की यूआरएल कहां पे जा रहा है तो हम नहीं
नाम दिया है ऐसा कुछ है नहीं ये लीजिए
स्लैश पर जा रहा है स्लग उसका
आपका नाम करें तो यूआरएल दे दीजिए आपका जो
भी और एक हम दे देंगे एक्टिव
तो एक्टिव की वैल्यू है ट्रू यहां पर तो
इस तरह से एक्चुअली हम सारे के सारे ये
फील्स बना लेते हैं मैं नोट्स में से अपने
सारे फील्स ले आता हूं ताकि हमें यहां पे
टाइम वेस्ट ना करना पड़े इसको रिमूव करते
हैं और ये लीजिए तो हमने क्या लिया है
यहां पे होम है जो स्लैश पर जा रहा है
लॉगिन स्लैश लॉगिन पे जा रहा है आ एक्टिव
डिपेंड करेगा और स्टेटस पे और उसके बाद
साइन अप है वो भी एक्टिव डिपेंड करेगा की
और स्टेटस पे है और उसके बाद जो पोस्ट है
यहां पे एड पोस्ट है ये सब बेसिक है
लॉगआउट हम चेकिंग करेंगे अब देखिए ये
एक्टिव रहेगा नहीं रहेगा ये सब हम पूछेंगे
और स्टेटस में हमने ऑलरेडी उसे सिलेक्ट
करके उसे करके स्टेट से पूछ लिया है की आप
एक्टिव हो या नहीं हो अब जिन-जिन पर
एक्टिव ट्रू होगा वो हम यहां पे डिस्प्ले
करेंगे तो वो हम बेसिक अपना कंडीशन
रेंडरिंग करेंगे और चेक करेंगे ये कौन-कौन
से आइटम एक्टिव है एक्टिव है तो डिस्प्ले
कर दो नहीं है तो वो किसी और शो करना है
देखिए यूजर अगर लॉगिन है तो उसको लॉगिन और
साइन अप वाला बटन दिखाना ही क्यों है ना
तो इतना सा कम हम करेंगे तो ठीक है चलिए
यहां पे आते हैं सबसे पहले हम यहां पे
इसको चेंज करते हैं हम हेड को और एक्चुअली
में हैदर ही ले लेते हैं यह लीजिए हैदर अब
इस हेडर के अंदर एक दो क्लासेस है जो हमने
एड कारी थी बाद में आपका मां करें करिए
मां नहीं करें मत करिए यहां पे कोई दिक्कत
नहीं है बैटिंग ले ली और उसके बाद शैडो भी
ले ली और बैकग्राउंड हमने इसका ग्रे कर
दिया था बाद में ठीक है ये 500 हो गया ठीक
है अब इसके अंदर हमें चाहिए कंटेनर तो ये
लीजिए कंटेनर ले आए और ये कंटेनर और कर
दिया अब सब कुछ है जो आपका नेवीगेशन बार
भी है वो कंटेनर के अंदर ही है अब इसके
अंदर हम क्या करेंगे एक नायाब कंपोनेंट
लेंगे और उसके बाद सबसे पहले हम लोगो लगा
देंगे फ्लेक्सी लेंगे इसके अंदर और उसके
बाद आ अनलोडेड लिस्ट के अंदर लूप लगा
देंगे बस इतना सा कम है तो ये हमने नया
लिया
और ये लीजिए ना अब और कर दिया अब इस नए
बार के अंदर ही सर का सर कम करेंगे सबसे
पहले तो एक दीव ले लेते हैं ये लीजिए एक
दीव ले लिया इस दीव के अंदर हमारा लोगो
लगा देंगे ठीक है इस दीव के अंदर भी कुछ
क्लासेस हैं वो भी एड कर डन मैं यहां पे
ज्यादा नहीं है मार्जिन राइट है एक फोर का
और के अंदर भी क्लास नहीं हमने लगा रखा है
सिर्फ फ्लेक्स लिख रखा है और कुछ भी नहीं
है ठीक है ये अब एक दीव क्यों है क्योंकि
लोगो है यहां पे लगाना था अब आपको अगर
लगता है अच्छा लोगो लगाना तो आप अच्छे से
लगाइए आ सबसे पहले मैं यहां पे लिंक लगा
देता हूं ताकि जहां पर भी ये जाए आराम से
जा पे ये लीजिए एक लिंक तो ये एक तरह से
हमने इसको रेप कर दिया है और ये वैल्यू ए
गई अब क्या करना है लोगो लगाना है जी ये
लीजिए लोगो
है यह हमारा लोगो और विथ भी दे देते हैं
ऑप्शनल अगर आपको पास कर दें की नहीं ओवर
करनी है मुझे तो नहीं चाहिए मुझे तो 70
पिक्सल चाहिए तो उसे तरह से आप दे सकते हो
एक्सेप्ट कर रहे हैं कुछ उसे तो कर नहीं
रहे हो के अंदर
समझने के लिए आपको ये वालुज हो गई हमारे
पास में ये वैल्यू ए गई है ओके तो लोगो ए
गया है अब क्या करना है इस दीव के बाहर
जाना है ठीक है जी अब इस दीव के बाहर क्या
है हमारे पास है और जिसके अंदर हम कराएंगे
लूप वैसे तो सजेशन काफी अच्छे मिल गए हैं
बट मैं एक-एक लाइन आपको यहां पे करके
दिखाऊंगा अनलोडेड लिस्ट मिल गया ये लीजिए
उन ऑर्डर लिस्ट के अंदर क्लास एक यह क्लास
नहीं है हमारे पास में और क्लास नाम के
अंदर फ्लेक्स है और म दास ऑटो है ठीक है
जी अब क्या करना है अब इन स्टार्ट करनी है
अपनी जावास्क्रिप्ट अब जावास्क्रिप्ट के
अंदर मुझे पता है की ये जो नया आइटम है
अभी अभी जो एरर बताएं आपने नया आइटम
कुछ
नया आइटम छोटी सी स्पेलिंग
मुझे पता है यह लीजिए कॉल बैक हो गया आपका
इस तरह से अब कॉल बैक के अंदर में ये करली
बेसिस नहीं लगाऊंगा क्योंकि मुझे
डायरेक्टली लिखना है तो ज्यादा बटर राहत
है की आप इस पेरेंटी से लगा के क्योंकि
रिटर्न स्टेटमेंट नहीं लिखना पड़ता और कोई
बात नहीं है तो सबसे पहले मैप के अंदर
मुझे पता है की मुझे हर एक आइटम मिलेगा
नया आइटम के अंदर हर एक आइटम है ठीक है जी
अब यहां पे आते हैं और यहां पे हम क्या
करना चाहते हैं की आइटम एक्टिव है या नहीं
है उसे बेसिस पे हम कम करेंगे पूरा का
पूरा ठीक है तो एक बार इसको कंट्रोल सी कर
देता हूं अभी मैं क्या चाहता हूं इसको भी
एक बार जो रिटर्न कर रहा हूं उससे पहले भी
एक बार इसको क्लोज कर डन ठीक है
अब क्या करना है नेक्स्ट लाइन पर जाते हैं
सबसे पहले पूछूंगा की आइटम जो है वह
एक्टिव है या नहीं अगर आइटम एक्टिव है तो
तो कुछ करेंगे वरना कुछ और करेंगे ठीक है
इतना तो समझ में आया बड़ा ही बेसिक था अगर
है तो कुछ करेंगे वरना कुछ और अब कुछ क्या
करेंगे देखिए कुछ नहीं करना मुझे नल ही
करना है तो वहां पे मैं कुछ डिस्प्ले करना
ही नहीं चाहता हूं इतनी सी बात है अच्छा
अगर आइटम निकाला तो क्या करना चाहते हो तो
मैं कुछ डिस्प्ले करना चाहता हूं तो
डिस्प्ले क्या करना चाहते हो एक ली करना
चाहता हूं डिस्प्ले यह लीजिए और एरर्स हो
गई ये गण अब क्योंकि ये चीज जो रिपीट हो
रही है याद रखिएगा कई लोग क्या करते हैं
सी यू ल पे या कहानी और भी चीज लगा देते
हैं जो चीज रिपीट हो रही है जो एचटीएमएल
एलिमेंट रिपीट हो रहा है वहां पे मुझे किस
लगानी होती है ये तो हमने पहले ही पढ़
लिया था तो ये हमने लगे की और की क्या है
हर आइटम का जो नाम है वो यूनिक है वैसे तो
ये कोई अच्छी गारंटी नहीं है की ये नाम
यूनिक होगा या नहीं होगा बट ठीक है अभी के
लिए कम चल जाएगा हमारा इतनी कोई बुरी बात
भी नहीं है
ओके जी यहां पर ए गए हैं अब क्या चाहिए अब
एक बटन चाहिए आपको इस बटन के अंदर ही कहां
चले गए हां जी इस बटन के अंदर ही सर का सर
नेवीगेशन वाला कम होगा और कुछ भी नहीं है
इतना तो वहां से जहां पे जाए वो नेविगेट
उसे करके हम कर लेंगे तो सबसे पहले लेकर
आते हैं एक बटन ये लीजिए बटन ए गया अब इस
लिक के अंदर एक बटन है बटन के अंदर
टेक्स्ट जो है सबसे इजी कम है टैक्स लिखना
क्योंकि वो सिर्फ है आइटम डॉट नाम यह
लीजिए तो ये बटन बन गया हमारा अब इस बटन
के अंदर कुछ प्रॉपर्टीज लखनी पड़ेगी वरना
कहानी यूआरएल पे जाएगा ही नहीं सबसे पहले
इस बटन पे ऑन क्लिक अगर होता है तो क्या
करूं इस बटन पर ऑन क्लिक होता है तो हम
क्या करेंगे यह हमारा इस तरह से लेंगे कॉल
बैक और इसको बोलेंगे की आप नेविगेट उसे
करो अच्छा नेविगेट कहां से आया हां जी
इंटरेस्टिंग बात है नेविगेट कहां से आया
नेविगेट आया हमारे पास से रिएक्ट राउटर से
यह जो नेविगेट
से हमारे पास में अच्छा जी नेविगेट कम
कैसे करता है नेविगेट कम करने के लिए बहुत
ही आसन कम है उसको सिर्फ और का दो यह
फ्लैश साइन अप स्लैश लॉगिन जो भी देना है
वो आप दे दो लिंक से भी दे सकते हैं कोई
बुरी बात नहीं है नेविगेट से भी दे सकते
हैं तो नेविगेट करवा देगा वो भी
एक्जेक्टली से है रिएक्ट राउटर से मिलता
है दोनों से ही तरीके हैं तो ये नेविगेट
हमारे पास मेथड मिल गया इसके अंदर एक
आर्गुमेंट पास करना पड़ता है की कहां लेक
जाऊं तो आर्गुमेंट मेरे पास है आइटम डॉट
स्लग के अंदर ठीक है कोई परिसर था ही नहीं
इसके अंदर हां इसमें थोड़ी सी क्लास नहीं
एड करनी पड़ेगी क्योंकि क्लासेस हमारे पास
हैं नोट्स में से मैं मेरे पास जो नोट्स
है उसमें से क्लासेस एड कर देता हूं कस
जहां भी हो गया मैं इसी तरह से एड करेंगे
मेरे को कस पे टाइम वेस्ट करना ही नहीं है
यहां पे ठीक है अच्छा जी अब यहां तक तो
मामला है ठीक की ठीक है सर कोई दिक्कत
वाली बात नहीं है की एक आइटम बनाया हमें
रेफरेंस समझ में ए गया की ठीक है काफी आसन
कर देता है फ्यूचर प्रूफिंग कर देता है
कोड की और इसी तरह से आप प्रोडक्शन में भी
लिखेंगे ठीक है अब देखिए अनलोडेड के अंदर
आपने लिस्ट आइटम तो लिख दिया यहां तक तो
मामला ठीक है
लेकिन एक लोग बटन का मामला भी तो है उसको
कैसे भूल गए देखिए जब इनफॉरमेशन आपके पास
है ही यहां पर इसको मिनिमाइज करते हैं तो
इनफॉरमेशन जब आपके पास है ही की और स्टेटस
के अंदर आपके पास है ही तो साउथ स्टेटस से
पूछ लेते हैं और अगर आउटस्टैटर्स ट्रू
होगा ऑथेंटिकेटेड है बांदा तो उसको लॉगआउट
दिखा दें अगर नहीं है तो लॉगआउट नहीं
दिखाएंगे बस इतना सा कम है तो चलिए इसके
बाद हम क्या करते हैं ये सारे तो लिस्ट
आइटम अपने आप ए जाएंगे हमारे पास में
लेकिन एक और यहां पर रिएक्ट स्टार्ट कर
लेते हैं और उसको बोलते हैं क्या है की
मुझे और स्टेटस बताओ अब और स्टेटस के बाद
क्या है की इस तरह का कोड आप कई बार
लिखेंगे एम परसेंट एम परसेंट और उसके बाद
ये बैलेंस
इस तरह से अब यह जो कोड होता है बड़ा
इंटरेस्टिंग होता है यहां पर अगर यह ट्रू
होगा तो ही यह चीज डिस्प्ले
भी दिखेगा कई युटयुबर्स भी उसे करते हैं
और बेसिक रिकेट्स इन टैक्स सभी लोग उसे
करेंगे क्यों नहीं करें तो ये जो स्टेटस
तो कोई भी ऐसी चीज हम कई बार कैलकुलेट
करते हैं तो अगर ये ट्रू होगी तो ये
दिखेगा वरना दिखेगा ही नहीं तो बड़ा ही आम
सा लॉजिक है और कई जगह उसे होता है तो
यहां पे क्या करते हैं एक अलग ले लेते हैं
और ली क्या क्या सजेशन ए जाते हैं यह
लीजिए
अंदर एक कंपोनेंट जो है हमारा ये लॉगआउट
बटन ये हमने यहां पे शो कर दिया बस इतना
सा कम है तो अगर ऑथेंटिकेटेड हो तो लोग
आउट बटन लो वरना क्यों नहीं चाहिए आपको
लोग आउट बटन है की नहीं तो ये बड़ा
इंटरेस्टिंग है कॉन्सेप्ट हमारा की किस
तरह से हेडर्स और ये सब डिजाइन होते हैं
ये सर कम तो अब हम क्या करेंगे छोटा सा और
कम देखिए हमने कई जगह आपको देखा हो तो
हमने कई जगह बंट्स डिजाइन करें हमने
लॉगआउट बटन भी डिजाइन कराया और भी कई तरह
के बटंस डिजाइन करें तो कई बार आपको ऐसा
भी इंटेक्स मिलेगा की आम बटन डिजाइन कर
लेते हैं जहां पर भी चाहिएगा उसे बटन को
ले आएंगे क्योंकि कब तक यह क्लासेस
लिखेंगे है की नहीं तो एक आम बटन अक्सर
डिजाइन किया जाता है आगे जाके मैं कभी
आपको रेडिक्स यूआई वगैरा सब सिखाऊंगा तो
वहां पे भी आप देखेंगे की एक आम बटन का
यूआई डिजाइन किया ही जाता है तो हम भी
यहां पे कुछ आम यूड कर लेते हैं और जो
स्टार्टिंग में एक बात कारी थी इनपुट की
वो भी फाइनली कर लेते हैं क्योंकि ये तो
बड़ा ही बेसिक है हां कोड थोड़ा सा लेंडी
था लेकिन पैसे की कम है इतना ज्यादा कुछ
है नहीं ओके जी तो यहां तक तो मामला है
सेट हमारा अब चलते हैं कॉम्पोनेंट्स में
और एक नई फाइल हम डिजाइन कर लेते हैं
सिंपल सा बटन
इसको दे देते हैं नाम सीधा बटन चाहिए
सेक्स कुछ भी नहीं एक आम सा बटन कुछ एक दो
जगह उसे करके देख लेंगे और इस तरह के मैं
आपको सिंटेक्स दिखाना छह रहा था की
एक्चुअली में किस तरह से ये आम डिजाइन
किया जाते हैं तो ये हो गया हमारा बटन
अच्छा अब बटन के अंदर क्या होता है सबसे
इंटरेस्टिंग जो चीज होती है ना वो
क्या-क्या पैरामीटर एक्सेप्ट कर रहे हो और
उनको यूजेस का तरीका तो ये पैरामीटर है अब
क्या क्या है सबसे पहले तो पैरामीटर जो ये
अक्सर लोग लेते हैं वो होता है अपना
चिल्ड्रन अब चिल्ड्रन को उसे कहां करते
हैं देखिए चिल्ड्रन का सबसे इजी उसे है
सबसे पहले तो इसको यहां से हटाए क्योंकि
बटन डिजाइन कर रहे हैं तो एक बटन ही ले
लेते हैं तो ये लीजिए बटन ये ए गया आपका
बटन ये लीजिए तो बटन के अंदर इस तरह से
यहां पे चिल्ड्रन दे दिए जाते हैं तो जो
भी टेक्स्ट पास होगा वो टेक्स्ट यहां पे
अक्सर लोग इसको चिल्ड्रन कहते हैं और
इसीलिए लोग परेशान हो जाते हैं कुछ भी
नहीं इसको आप टेक्स्ट भी बोल सकते थे यहां
पे टेक्स्ट वीरेंद्र कर सकते थे या इसको
बटन टेक्स्ट भी बोल सकते थे तो हां फैंसी
शब्द उसे करते हैं प्रोग्राम्स कम ही है
की नहीं ठीक है तो चलिए
है अब इसके बाद टाइप भी यहां पर डिफाइन कर
देते हैं की हमारा जो टाइप है वह डिफॉल्ट
बटन है अगर कोई और देता है की सबमिट है
कुछ है तो हम उसे हिसाब से कर लेंगे बट
बाय डिफॉल्ट वालुज देते हैं एक हम यहां पर
बीजी कलर भी दे देते हैं इसको बीजी कलर हम
यहां पे देंगे ब्लू आ 600 दे देते हैं 500
से 100 आपका जो मां करें ये है डिफॉल्ट
वालुज अगर कोई वैल्यू देता है तो ओवरराइट
कर देंगे नहीं देगा तो इसी तरह से कर
देंगे उसके बाद हमें चाहिए का एक टेक्स्ट
कलर टेक्स्ट कलर टेक्स्ट हम व्हाइट दे
देते हैं यहां पे उसके अलावा एक क्लास नाम
भी हम लेते हैं क्लास नाम मत ही लेते हैं
ज्यादातर और उसके अलावा और हम प्रॉप्स को
भी और ले लेते हैं की और कुछ भी प्रॉप्स
आपने पास करें तो उसको भी स्प्रेड कर लेते
हैं अच्छा ये जो सिंटेक्स है ना ये थोड़ा
सा लोगों को प्रोडक्शन में जब जाते हैं
वहां थोड़ा सा कंफ्यूज करता है ये क्लास
नाम ब्लैक के और प्रॉप्स को क्यों स्प्रेड
कर है बताते हैं आपको क्यों कर है क्योंकि
देखिए बटन के अंदर क्या है सबसे पहले तो
क्लास नाम तो क्लास नाम है कुछ क्लासेस आप
एड करते हो अब क्लासेस जो एड होती है ना
वो इस तरह से एड नहीं होती है सबसे पहले
और इसकी जगह लगाइए बैक टेक्स्ट ठीक है है
अब बैक टेक्स्ट ऐसे तो उसे कर नहीं सकते
हां जी क्योंकि बैक टेक्स्ट तो है
जावास्क्रिप्ट का सिंटेक्स तो यहां पे
पहले करली बरस लाइए और फिर लाइए बैक
टेक्स्ट अब ये स्ट्रिंग है ठीक है तो इसके
अंदर हमने लिख दिया की पेंडिंग एक्स में
चाहिए 4 और उसके बाद पेंडिंग ए पे चाहिए
तू और और भी कोई है जैसे राउंडेड दास लोग
तो यह तो हो गई हमारी जो तलविन की क्लासेस
है या आपको जो क्लासेस लखनी है वो लिख
दिया आपने अच्छा लेकिन कुछ क्लासेस आपने
अलाउ कर रहा है की यूजर भी पास कर ले
क्योंकि क्लास नाम में एम्टी ले रखा है बट
अगर पास करियो यूजर दें तो क्या करें तो
यहां पे कुछ नहीं एक डॉलर साइन और ये
लीजिए और अब यहां पे आप सीधा सा वेरिएबल
का नाम रख दीजिए जो भी आपके पास है तो ये
क्लास नाम अच्छा सिर्फ इतना ही नहीं ये जो
बीग कलर टेक्स्ट कलर ये भी तो वेरिएबल है
हां तो इन वैरियेबल्स को भी इंजेक्टर कर
दीजिए कोई दिक्कत वाली बात नहीं है तो ये
लीजिए बीजी कलर हो गया और क्या क्या है
बताइए टेक्स्ट कलर है टेक्स्ट कलर भी
इंजेक्टर कर दीजिए अब आप कभी भी प्रोडक्शन
में जाओगे कहानी इंटर्नशिप करोगे कुछ भी
करोगे ना तो आपको कोड समझ में आएगा
उन्होंने कितना भी परिसर दिखाओ क्यों और
कोर्ट में पढ़कर जा रहा हूं अच्छा देखिए
एक प्रॉपर्टी तो है क्लास नाम बट और भी तो
प्रॉपर्टीज हो शक्ति है हां जी बिल्कुल हो
शक्ति है क्योंकि ये अटरीब्यूट्स ही तो है
बटन के तो और भी अगर यूजर ने दी हो तो
कहां लिए वो हमने लिए एक्चुअली में
प्रॉप्स में और यहां स्प्रेड कर दी है
स्प्रेड से क्या हुआ जितनी भी प्रॉपर्टीज
दी है वो साड़ी हमने ले ली अब उसको क्या
करेंगे यहां पे आई और एक और यहां पे आप
स्टार्ट कर दीजिए चावास्क्रिप्ट सेंटर्स
और ये जो है आप आगे आईटी इस स्प्रेड वाला
लीजिए यहां पे और इसको पूरा का पूरा
प्रॉप्स लिख दीजिए अब क्या होगा यूजर ने
जो भी कुछ एडिशनल प्रॉपर्टी पास करिए जैसे
हमें तो याद है टाइप अगर किसी ने प्ले
सोल्डर पास कर दिया तो तो वो भी तो वैसे
तो बटन में प्ले सोल्डर नहीं होता है जस्ट
इन एग्जांपल बता रहा हूं कुछ और अगर दे
दिया हो तो आप समझ गए बात को भावनाएं
समझिए तो आप यहां पे उसको इस तरह से
डिस्प्ले कर सकते हैं तो ये बड़ा एक आम
सेंटेंस है आगे जाके आप देखेंगे रेड एक्स
यू ए वगैरा परिसर जब देखेंगे वहां पे भी
ऐसा का ऐसा ही कम हो रहा है अब देखिए ये
क्या ये जो सिंटेक्स है ना हम रिपीट करने
वाले हैं हमारे इनपुट बटन के अंदर लेकिन
वहां पे एक छोटा सा नया हक भी आपको
पढ़ाएंगे की एक फॉरवर्ड रेफरेंस का होता
है तो पहले हम चलते हैं हमारे यहां पे और
थोड़ा सा गूगल सर्च करके आपको दिखाई हैं
बड़ा ही रेयरली यूज्ड होता है बट काफी
अच्छा है
ना हम पढ़ने हैं हमारे रिएक्ट
कहानी पर रिएक्ट ऑफिशल अच्छा
है
मैं सोच रहा था रिएक्ट और डेप्थ पे ही अगर
मिल जाए तो
लिगसी के अंदर तो है वैसे तो उसे तो सब
जगह होता है तो यहां पर क्या है की एक
बड़ा इंटरेस्टिंग
इनपुट प्रॉप्स ठीक है यहां पे तो कोई शूज
है और डायरेक्टली मैं आपको बता देता हूं
फॉरवर्ड ड्रॉप यहां पे शायद उन्होंने कुछ
एग्जांपल ले रखा हुआ अच्छा तो जिसके थ्रू
बता दें
ठीक है यहां पे भी देखिए एग्जांपल तो इस
की बात हो रही है की कई बार क्या होता है
ये यूजर के स्टेट से जो फॉर्म है ना इसी
तरह से बनाए जाते हैं की ये इनपुट अलग है
ये इनपुट अलग है और यहां पे लॉगिन लेकिन
जहां पे भी आपका पेज होगा वहां पे तो
इनपुट कंबाइन होगा और वहां पे भी उसकी
स्टेट का एक्सेस तो चाहिए गए क्योंकि ये
जो कंपोनेंट ऑफ सेपरेटली बनोगे उसमें तो
स्टेट नहीं रखना वाले वो तो एक इंडिविजुअल
कंपोनेंट है तो कंपोनेंट कहानी और है उसे
कहानी हो रहा है तो कंपोनेंट यहां है तो
उसकी स्टेट तो यही हनी चाहिए थी लेकिन
उसकी स्टेट का एक्सेस तो यहां पे चाहिए
आपको तो कुछ तो ऐसा चाहिएगा की मेरे को
उसका रेफरेंस मिल जाए तो यही एक एग्जांपल
है हमारे फॉरवर्ड रेफरेंस का बस कभी आपसे
कोई पूछे की ये फॉरवर्ड रेफरेंस कम कहां
था तो ये वन ऑफ डी बेस्ट एग्जांपल है जो
मैं अभी आपको करके दिखाऊंगा कई बार एडवांस
रिएक्ट के जो इंटरव्यूज वगैरा होते हैं
वहां पे इस तरह का क्वेश्चन पूछा जाता है
की फॉरवर्ड रेप का कोई एग्जांपल बताओ किस
तरह से तो सबसे बेस्ट एग्जांपल यही है की
सर देखिए हम एक लॉगिन फॉर्म बना रहे हैं
अपना उसे लॉगिन फॉर्म के अंदर हमारे पास
इनपुट फील्ड अलग है तो वही से इनपुट फील्ड
हम यूजर नाम में भी पासवर्ड में भी सब जगह
उसे करेंगे और यहां पर लॉगिन पेज है लेकिन
इसकी स्टेट का एक्सेस तो मुझे यहां
चाहिएगा ना तो इसका रेफरेंस देना पड़ेगा
मुझे इसके अंदर तो वहां पर हमारे पास में
कम में आता है एक रिएक्ट का हक जिसका नाम
है फॉरवर्ड रेफरेंस हां इसीलिए लोग कहते
हैं की एक्चुअली में आप रिएक्ट का कोई सा
भी कोर्स ले लीजिए कुछ भी पढ़ लीजिए जब तक
आपने असली प्रोडक्शन ग्रेट के प्रोजेक्ट्स
नहीं बना है आपको इंटरव्यू और पकड़ेगा
क्योंकि आप कोई सा भी टोटल देख लीजिए देख
के देखिए युटुब पे आपको कोई फॉरवर्ड
रेफरेंस का नहीं रेफरेंस देगा वो तभी आएगा
जब आप इस तरह की प्रोडक्शन ग्रेट एप्स
बनाएंगे और जिन्होंने सिख लिया सोचते हैं
तो बेसिक सा ये इसका क्या ट्यूटोरियल
बनाना मैंने भी यही सोचा अक्सर इसलिए इसके
ट्यूटोरियल नहीं है ओके काफी थ्योरी बताइए
आपको बट हो सकता है इस थ्योरी से आपका कोई
इंटरव्यू क्लियर हो जाए तो ठीक है वसूली
हो जाएगी ठीक है चलिए एक नई फाइल बनाते
हैं यहां पे ये अपने आप में एक
इंटरेस्टिंग है इसको प्लीज गौर से देखिएगा
इनपुट डॉट जेएस पहले बटन इसलिए बनाया
क्योंकि 90% कम बटन का ही करेंगे 10% कम
इनपुट का करेंगे तो हम ले आते हैं सबसे
पहले अपना आईएफसी इसे ले आते हैं
आईएफसी इंपोर्ट हो गया हमारा इनपुट ए चुका
है अच्छा यहां पर क्या है आपको कुछ इतिहास
वगैरा भी कई बार लगती है आपके ऊपर है आप
उसे करना चाहे आईडी इस नहीं करना चाहे मैं
तो यूजुअली कहता हूं की ठीक है अगर आपको
आइडिया उसे करनी है तो एटलिस्ट कर लीजिए
याद आपको हमने आईडी खाए उसे कारी थी लेबल
के अंदर हां जी यहां पे भी करेंगे तो
एक्चुअली मैं आईडी इस तरह से तो नहीं आई
उसे आईडी यह लीजिए उसे आईडी कैसे उसे करते
हैं याद है भूल गए भूल गए याद तो हनी
चाहिए
और आईडी से कैसे उसे आईडी ठीक है अच्छा
यहां पर इनपुट क्या क्या लोग यही सबसे
इंटरेस्टिंग बात है देखिए इनपुट के अंदर
क्या-क्या लेंगे ठीक है आपको पता है की
इनपुट के अंदर हम क्या क्या ले सकते हैं
अपने लेबल्स वगैरा सब कुछ ले सकते हैं
लेकिन लेकिन एक मिनट पहले वापस आई देखिए
अब क्या है की हम इसको थोड़ा सा चेंज
करेंगे की किस तरह से वैल्यू होती है और
हम एक्सपोर्ट भी थोड़ा सा चेंज करेंगे
एक्सपर्ट डिफॉल्ट तो इनपुट रखेंगे मैं
इसको पहले बना लेट हूं एक सिंपल सा अरा
फंक्शन क्योंकि फंक्शन में थोड़ा सा और
इजीली आपको समझ में भी कर सकते हैं बट
वहां थोड़ा सा इजीली समझ में ए जाएगा
स्पेशली जब आप किसी को भी ऐसे हुक्स के
अंदर मन अप करें ना तो थोड़ा सा अरा
फंक्शन ले लेना दिखने में इजी हो जाता है
बाकी होता कुछ नहीं फंक्शनैलिटी दिखने में
इजी हो जाता है तो इसको हम नाम वही अपना
इनपुट देंगे क्योंकि यही हम एक्सपोर्ट कर
रहे हैं तो ये लीजिए इनपुट और इसको हम
क्या करेंगे सर जो है कुछ इसी तरह से
लिखना है लेकिन लेकिन लिखने से पहले मैं
सब कुछ यहां पे लूंगा रिएक्ट डॉट और ये जो
फॉरवर्ड रेफरेंस है इसके अंदर मैं सब कुछ
यहां पे एन रेप अप कर दूंगा ठीक है ये
लीजिए फॉरवर्ड रेफरेंस बस रेप अप हो गया
अब इसके अंदर में एक फंक्शन डिफाइन करूंगा
क्योंकि एक्चुअली में जो कम है वो इसके
अंदर है तो आप चाहे तो यहां पे भी आप
फंक्शन उसे कर सकते हैं कॉल बैक है
बेसिकली तो हम इस तरह से उसे कर लेते हैं
तो ये हुआ हमारा इनपुट ये रहा इनपुट और ये
रेस की डेफिनेशन ठीक है अब डेफिनेशन के
अंदर ऑब्वियस सी बात है आपको रिटर्न करना
है तो अभी तो हम क्या करते हैं
h1 रिटर्न कर देता हूं अभी टेंपरेरी h1 और
उसको बोल देता हूं टेस्ट तो एटलिस्ट वाइस
अब हम सही है तो है इस स्टेप बाय स्टेप यह
साड़ी इसलिए
स्टेप बाय स्टेप समझ में आयाम क्या कर रहे
हैं कोर्ट का समझ में आना जरूरी है
फैंसीनेस से ज्यादा ठीक है यह ए गया आपके
पास इनपुट ठीक है जी अब इसके अंदर
क्या-क्या लेने वाले हो आप वो देखो सबसे
पहले तो आप लोग लेबल क्योंकि इनपुट कई जगह
उसे होने वाला है कई जगह यूजर नाम होगा कई
जगह पासवर्ड होगा तो एक लेबल तो देना बंता
ही बंता है अच्छा लेवल दे दिया उसके बाद
क्या चाहिए उसके बाद इसका टाइप पता होना
चाहिए क्योंकि हो सकता है पासवर्ड टाइप हो
सकता है क्या हो लेकिन बाय डिफॉल्ट वैल्यू
दे देते हैं की हमारे पास टेक्स्ट वैल्यू
है टेक्स्ट एक्चुअली में स्ट्रिंग में
देना पड़ता है ये लीजिए तो ये हो गया
हमारे पास में की टाइप भी आपने दे दिया और
क्या चाहिए क्लास नाम आपको पता है क्लास
नाम जब भी लेते हैं मोस्ट ऑफ डी केसेस में
हम इसकी डिफॉल्ट प्रॉपर्टी एम्टी लगा देते
हैं ऐसे स्ट्रिंग जरूर नहीं हर बार लगे
आपको कुछ और क्लासेस देनी है तो आप दीजिए
एक आपको पता है की आप प्रॉप्स भी लेते हो
प्रॉप्स क्योंकि जितने भी और कोई
प्रॉपर्टी बोल दी तो वह भी हम एड कर देंगे
ठीक है अच्छा उसके अलावा यहां पे क्या
होता है इसको जो भी उसे करेगा वो एक
रेफरेंस भी पास करेगा हां जी ये रेफरेंस
बहुत ही जरूरी है इसलिए मैंने कहा यहां पे
थोड़ा सा पेन हम लेंगे क्योंकि ये कुछ नई
चीज इंट्रोड्यूस करें लेकिन याद रखिए एक
लेक्चर का कम ये नहीं की आपको हमेशा
कंफर्ट में रखें एक लेक्चर का कम ये भी
होता है की आपको थोड़ा सा कंफर्ट जॉन से
बाहर निकले ताकि आप थोड़ा सा और रिसर्च
अपना कर पाएं अब इसको उसे कैसे करना है
इसकी चिंता मत कीजिए हम बनाएंगे इसको काफी
जगह उसे करेंगे इस इनपुट को तो आपको समझ
में ए जाएगा की अच्छा ऐसे रेफरेंस आपने
पास किया है ठीक है अब आते हैं यहां पे
इसके ज्यादा चिंता मत कीजिए ये मैं आपको
बताऊंगा यही एक्चुअली मैं रीजन है फॉरवर्ड
रेफरेंस यहां पे उसे करने का इसके बगैर तो
रेफरेंस ही नहीं मिलेगा तो फिर क्या ही कर
लेंगे आगे जाके ठीक है ये आप चलिए मैं
आपको रेफरेंस में उसे आएगा करते हैं इसको
भी इंतजाम करते हैं अब सबसे पहले तो आते
हैं यहां पे इसके अंदर हम इसको करते हैं
वापस से ये इस तरह से और बोल देते हैं की
एक है आपके पास दीप ये लीजिए अब लाइफ के
अंदर पहले तो क्लास नाम एड कर लेते हैं
क्लास नहीं है हमारे पास विथ फूल जो भी
एलिमेंट है उसकी वेट फूल ले लो ठीक है जी
अब इसके बाद स्टार्ट करते हैं अपनी
जावास्क्रिप्ट अब जावास्क्रिप्ट में अगर
किसी ने लेबल पास किया है तो वही से
सिंटेक्स अगर लेवल पास हुआ है तो एम
परसेंट लगा के तो हम इसको डिस्प्ले
कराएंगे तो डिस्प्ले क्या करेंगे सिंपल सा
वही लेबल तो लेवल के अंदर देखिए आपने एक
क्लास में हमें तो कोई क्लास नाम चाहिए
नहीं लेवल के अंदर आ एक्चुअली मैं लेवल के
अंदर क्लासेस हैं हमारे पास तो हम ये वाली
क्लासेस हम उसे कर लेते हैं ये लीजिए यहां
पे एक इंटर कर देते हैं ताकि आपको समझ में
आए क्या क्या हमने वालुज ली है और ये
लीजिए और ये लीजिए तो अब हमने क्या-क्या
उसे कर है देखिए एक-एक करके पढ़ने हैं
सबसे पहले तो लैब अगर लेबल दिया है तो
लेबल कंपोनेंट डिस्प्ले होगा ये हम परसेंट
से समझ में ए गया क्लास में आपको जो
डिस्प्ले करनी है वो क्लास नाम दीजिए कोई
दिक्कत वाली बात नहीं है उसके बाद हमने
क्या कर है एक एचटीएमएल 4 मिली है
एचटीएमएल फोर किस लिए क्योंकि आप तो देखिए
हमने उसे आईडी से उसे करके और एक्चुअली
में बनाना तो चाहिए था पर हमने बनाया नहीं
वो इसलिए हमारा यहां पर सिंटेक्स सही नहीं
आया तो हम क्या करते हैं एक आईडी बना लेते
हैं और इससे यूआईडी ये लीजिए अब क्या करना
है एचटीएमएल फोर के अंदर सीधा ही आईडी लिख
लेट है इससे क्या होगा हर बार एक यूनिक
आईडी जेनरेट होगी और एचटीएमएल का ये थोड़ा
सा सो परपज से मां लीजिए सो तो नहीं
कहेंगे इसको एक्सेसिबिलिटी कहेंगे
एक्सेसिबिलिटी परपज के लिए हमने इसको उसे
कर लिया आपका मां करता है नहीं करना नहीं
समझ में ए रहा हटा दीजिए कोई इतनी दिक्कत
वाली बात नहीं है प्रोडक्शन में भी कम ही
उसे होता है इतना कुछ खास नहीं है ठीक है
तो ये तो कम हो गया हमारा लेवल का
है अब यह लेबल यह वाला चावल यहां पर खत्म
अच्छा ठीक है अब क्या चाहिए अब चाहिए
इनपुट असली कम तो शिखा ही है ना तो यह
लीजिए एक इनपुट एलिमेंट हमारे पास में ए
गया सेल्फ क्लोजिंग इनपुट अच्छा इनपुट के
अंदर क्या-क्या लगेगा हां वो सबसे
इंटरेस्टिंग बात है सबसे पहले तो इनपुट का
टाइप तो बताना ही पड़ेगा तो टाइप अगर यूजर
ने दिया है तो ठीक है वरना हम हमारे पास
डिफॉल्ट में टेक्स्ट टाइप तो है ही ठीक है
जी मेजर कम तो हो गया यही खत्म पे अच्छा
क्लासेस भी तो आपने लिए हैं तो ठीक है जी
आ यहां पे लिख दीजिए डॉलर और इस तरह से और
क्लास नाम लिख दें इस तरह से लिख डन इस
तरह से नहीं ऐसे नहीं लिख सकते क्योंकि
हमें पता है इस तरह से सिंटेक्स नहीं
चलेगा ठीक है तो क्या करना पड़ेगा क्लास
नाम लीजिए अब क्लास नाम हमें बैक टेक्स्ट
उसे करना है तो बैक टिप्स के लिए ये तो
डबल को सिंगल को चाहिए तो नहीं चलेगा तो
पहले जो स्क्रिप्ट स्टार्ट करनी पड़ेगी
फिर हमें बैक टेक्स्ट लगेगा और बैक
टेक्स्ट के बाद आपके जितनी कस है तेलविन
की और लिख दीजिए और सबसे और में क्या करिए
ये इस तरह से वेरिएबल इंजेक्टर कर दीजिए
और क्लास में लिख दीजिए ताकि यूजर ने जो
पास कारी है वो हमारी क्लास में आगे आईटी
इसे ए जाए ठीक है यह हो गया हमारा बेसिक
अच्छा यहां पर भी कुछ ए गए क्या आप ये
लीजिए अरे बहुत ज्यादा सजेशन दे रहे हो
ठीक है अब हमारे पास भी कुछ क्लासेस हैं
एक्चुअली में तो हम उनको भी एड करेंगे
ऑब्वियस सी बात है तो हम हमारी क्लासेस भी
ले आते हैं और बाकी जितनी क्लासेस थे वो
तो हमने ले आया और बाकी अगर आपने कोई पास
करें तो उसको यहां पे हम ये सिंपल सा डॉलर
क्लास में हमने एड कर दिया है अच्छा अब एक
इंटरेस्टिंग चीज सबसे पहले क्या करें ये
जो रेप है और रेफरेंस को आपने जो यूजर से
लिया है आज एन प्रॉप उसको यहां पे पॉज कर
दो यही वो चीज है जो रेफरेंस देगी आपको
अपने पैरंट कंपोनेंट के अंदर इसी के लिए
हमने अपना फॉरवर्ड रेफरेंस उसे कर है की
कंपोनेंट अलग है लेकिन रेफरेंस होना चाहिए
तो रेफरेंस वहां से पास भी किया जाएगा और
यहां से फिर स्टेट का एक्सेस लिया जाएगा
तभी तो इनपुट में जो भी फूल हो रहा है वो
सब लोगों के वरना तो ऑन क्लिक वगेरा ये सब
लगेगा कहां ऑन चेंज वगैरा कहां से लगेगा
हां इसी तरह से लिखा जाता है ये आपको कई
जगह दिखेगा आप भी प्रोडक्शन ग्रेट कोड
लिखोगे तो वहां पे भी लिखा जाएगा जो भी
वैल्यू है और कुछ भी पास करें तो प्रॉप्स
यहां पे लिख लो अच्छा उसके अलावा यहां पर
हम आईडी पास कर देते
हैं की जो भी एक यूनिक आईडी जेनरेट हुई है
वो आपके लेबल में भी ग गई है और आपके इस
इनपुट फील्ड में भी ग गया ताकि वहां पे
कोई क्लिक करें सिलेबस पे तो ऑटोमेटेकली
इस इनपुट पर हाईलाइट हो जाए और कर्सर वहां
पे चल जाए ताकि वो लिख पे तो देखिए काफी
इजी था लेकिन हमने इसको जान पूछ के थोड़ा
सा परिसर बनाया ताकि हम कुछ नया पढ़ पे
हैं देखिए इजी ना इसमें करना था तो वही
लॉगिन फॉर्म बनाया था कर देता फिर आप कहते
हैं की हां ठीक है समझ में भी ए गया वहां
पे भी आप खुश थे कोई दिक्कत वाली बात नहीं
थी बट मेरा ये मानना है की एक स्टेप आगे
लेक जाना स्टूडेंट को ताकि हम इंडिया के
अंदर या जहां से भी आप पढ़ रहे हैं हिंदी
वाले स्टूडेंट भी ना कुछ एक्स्ट्रा
ऑर्डिनरी कर पे और वो एक्स्ट्रा ऑर्डिनरी
तभी करेंगे जब इस तरह के प्रोडक्शन ग्रेट
कोड पढ़ेंगे इजी इजी तो देखिए आप कर ही
देते हैं ना वो ये लूप फंक्शन के अंदर
फैंस हुए थे लेकिन अब थोड़ा सा प्रोडक्शन
ग्रिड अप में आया थोड़ी परेशानी हो रही है
कुछ लेक्चरर्स दोबारा देख रहे हैं यही है
असली कोडिंग और यही से सीखने हैं ठीक है
तो चीज आसन नहीं होगी थोड़ा सा दिक्कत
आएगी और आने भी चाहिए दिक्कत नहीं आएगी तो
हम सीखेंगे कैसे ठीक है तो अभी तो काफी
बड़ा लेक्चर हो गया है ये हमारा ओके
ऑलमोस्ट 43 मिनट्स 44 मिनट का हो गया है
तो इसको तो हम यही रेप अप करते हैं अगर
क्रश हो गया तो फिर दोबारा से इतना सर
बनाना पड़ेगा आई थिंक अब आप रिलेट कर का
रहे हैं की जब इतना बड़ा लेक्चर क्रश होता
है तो और फिर दोबारा से बनाना होता है तो
कितनी मेहनत लगती है इस मेहनत के लिए एक
कमेंट तो बंता है फटाफट से एक कमेंट
छोड़ते जाएगा अगर आपको अच्छा लगा तो और
चलिए मिलते हैं अगले वीडियो में अभी कुछ
कॉम्पोनेंट्स और है और है थोड़े से और है
चलिए बनाते हैं उनको अगले वीडियो के अंदर
```

create a file:
src/components/container/Container.jsx:
```
import React from 'react'

function Container({ children }) {
    return <div className="w-full max-w-7xl mx-auto px-4">{children}</div>;

}

export default Container
```
Now, we will update our Footer.jsx:
src/components/footer/Footer.jsx:
```
import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../Logo'

function Footer() {
  return (
    <section className="relative overflow-hidden py-10 bg-gray-400 border border-t-2 border-t-black">
      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="-m-6 flex flex-wrap">
          <div className="w-full p-6 md:w-1/2 lg:w-5/12">
            <div className="flex h-full flex-col justify-between">
              <div className="mb-4 inline-flex items-center">
                <Logo width="100px" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  &copy; Copyright 2023. All Rights Reserved by DevUI.
                </p>
              </div>
            </div>
          </div>
          <div className="w-full p-6 md:w-1/2 lg:w-2/12">
            <div className="h-full">
              <h3 className="tracking-px mb-9  text-xs font-semibold uppercase text-gray-500">
                Company
              </h3>
              <ul>
                <li className="mb-4">
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Features
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Pricing
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Affiliate Program
                  </Link>
                </li>
                <li>
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Press Kit
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full p-6 md:w-1/2 lg:w-2/12">
            <div className="h-full">
              <h3 className="tracking-px mb-9  text-xs font-semibold uppercase text-gray-500">
                Support
              </h3>
              <ul>
                <li className="mb-4">
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Account
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Help
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Customer Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="w-full p-6 md:w-1/2 lg:w-3/12">
            <div className="h-full">
              <h3 className="tracking-px mb-9  text-xs font-semibold uppercase text-gray-500">
                Legals
              </h3>
              <ul>
                <li className="mb-4">
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className=" text-base font-medium text-gray-900 hover:text-gray-700"
                    to="/"
                  >
                    Licensing
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Footer
```


Make a new file:
src/components/Logo.jsx:
```
import React from 'react'

function Logo({width = "100px"}) {
  return (
    <div>Logo</div>
  )
}

export default Logo
```


make a new file :
src/components/Header/LogoutBtn.jsx:
```
import React from 'react'
import { useDispatch } from 'react-redux'
import authService from '../../appwrite/auth'
import { logout } from '../../store/authSlice'

function LogoutBtn() {
    const dispatch = useDispatch()
    const logoutHandler = () => {
        authService.logout().then(() => {
            dispatch(logout())
        })
    }
    return (
        <button
            className='inline-bock px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
            onClick={logoutHandler}
        >Logout</button>
    )
}

export default LogoutBtn
```

Update 
src/components/index.js:
```
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Container from "./container/Container";
import Logo from "./Logo";
import LogoutBtn from "./LogoutBtn";

export { Header, Footer, Container, Logo, LogoutBtn };

```

Now, we will update our Header.jsx:
src/components/header/Header.jsx:
```
import React from 'react'
import { Container, Logo, LogoutBtn } from '../index'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()

  const navItems = [
    {
      name: 'Home',
      slug: "/",
      active: true
    },
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
    },
    {
      name: "All Posts",
      slug: "/all-posts",
      active: authStatus,
    },
    {
      name: "Add Post",
      slug: "/add-post",
      active: authStatus,
    },
  ]


  return (
    <header className='py-3 shadow bg-gray-500'>
      <Container>
        <nav className='flex'>
          <div className='mr-4'>
            <Link to='/'>
              <Logo width='70px' />

            </Link>
          </div>
          <ul className='flex ml-auto'>
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className='inline-bock px-6 py-2 duration-200 hover:bg-blue-100 rounded-full'
                  >{item.name}</button>
                </li>
              ) : null
            )}
            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  )
}

export default Header
```

src/components/Button.jsx:
```
import React from "react";

export default function Button({
    children,
    type = "button",
    bgColor = "bg-blue-600",
    textColor = "text-white",
    className = "",
    ...props
}) {
    return (
        <button className={`px-4 py-2 rounded-lg ${bgColor} ${textColor} ${className}`} {...props}>
            {children}
        </button>
    );
}
```

Forward Reference: Explain in detail
asked in interviews

create file:
src/components/Input.jsx:
```
import React, { useId } from 'react'

const Input = React.forwardRef(function Input({
    label,
    type = "text",
    className = "",
    ...props
}, ref) {
    const id = useId()
    return (
        <div className='w-full'>
            {label && <label
                className='inline-block mb-1 pl-1'
                htmlFor={id}>
                {label}
            </label>
            }
            <input
                type={type}
                className={`px-3 py-2 rounded-lg bg-white text-black outline-none focus:bg-gray-50 duration-200 border border-gray-200 w-full ${className}`}
                ref={ref}
                {...props}
                id={id}
            />
        </div>
    )
})

export default Input
```
make detailed notes using the transcript and my given code.
make notes in english in md format.
never miss any point
explain things easily
also use comments in code













 -->
