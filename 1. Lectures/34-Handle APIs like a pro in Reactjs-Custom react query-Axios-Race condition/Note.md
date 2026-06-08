# API Handling in React — Professional Guide

> Based on: *Chai aur Code* — "Handle APIs like a pro in ReactJS | Custom React Query | Axios | Race Condition"

---

## Table of Contents
1. [Introduction](#introduction)
2. [What is a Black Box API?](#what-is-a-black-box-api)
3. [Edge Cases in Production Code](#edge-cases-in-production-code)
4. [Project Setup](#project-setup)
5. [Backend Setup (Express)](#backend-setup-express)
6. [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
7. [Basic API Call with Axios](#basic-api-call-with-axios)
8. [Handling Edge Cases](#handling-edge-cases)
9. [Custom React Query Hook](#custom-react-query-hook)
10. [AbortController — Handling Race Conditions](#abortcontroller--handling-race-conditions)
11. [React Query Library (Overview)](#react-query-library-overview)
12. [Key Concepts Summary](#key-concepts-summary)

---

## Introduction

Everyone knows how to make a basic API call in React — using `fetch` inside `useEffect`, or using `axios`. But in **production**, there's much more to it:

- Handling **loading states**
- Handling **error states**
- Avoiding **race conditions**
- Writing **reusable custom hooks**
- Understanding tools like **React Query**

This lecture builds a custom Express backend, makes API calls from React, handles all edge cases, writes a **custom React Query hook**, and demonstrates how to cancel stale requests using **AbortController**.

---

## What is a Black Box API?

A **black box API** is an API over which you have **no control**.

- You send a request and get a response.
- You don't know how the server processes it internally.
- You can't control response time, database queries, or internal logic.

**Example:** `https://api.hiteshchoudhary.com/products`  
You get data back, but you have no idea what's happening on the server side.

**Why does this matter?**  
When testing, you can't simulate delays or errors with a black box API. That's why in this lecture, we build our **own backend** — so we have full control (e.g., we can add a `setTimeout` to simulate slow networks).

---

## Edge Cases in Production Code

> *"Edge cases don't mean LeetCode hard problems. It means thinking about all possible scenarios your code might encounter."*

Edge cases to handle in API calls:
- **No response / network failure** → Error state
- **Slow response** → Loading state
- **Stale/cancelled requests** → Race condition handling
- **Multiple rapid requests** → Debouncing (separate topic)
- **Re-fetching after error** → Reset error state before new request

---

## Project Setup

```bash
mkdir api-handling
cd api-handling
mkdir backend frontend
```

---

## Backend Setup (Express)

```bash
cd backend
npm init -y
touch index.js
npm install express
```

Add to `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "start": "node index.js"
  }
}
```

### `backend/index.js`

```js
import express from "express";

const app = express();

app.get("/api/products", (req, res) => {
  const products = [
    { id: 1, name: "Wooden Table",        price: 200, image: "https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg" },
    { id: 2, name: "Office Chair",         price: 150, image: "https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg" },
    { id: 3, name: "Laptop Stand",         price: 40,  image: "https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg" },
    { id: 4, name: "Desk Lamp",            price: 25,  image: "https://images.pexels.com/photos/112811/pexels-photo-112811.jpeg" },
    { id: 5, name: "Bookshelf",            price: 120, image: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg" },
    { id: 6, name: "Gaming Mouse",         price: 35,  image: "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg" },
    { id: 7, name: "Mechanical Keyboard",  price: 80,  image: "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg" },
    { id: 8, name: "Monitor",              price: 220, image: "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg" },
    { id: 9, name: "Headphones",           price: 60,  image: "https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg" },
    { id: 10, name: "Coffee Table",        price: 180, image: "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg" },
  ];

  // Handle search query: GET /api/products?search=wood
  if (req.query.search) {
    const filteredProducts = products.filter((product) =>
      // Case-insensitive match: check if product name includes the search keyword
      product.name.toLowerCase().includes(req.query.search.toLowerCase())
    );
    res.json(filteredProducts);
    return; // IMPORTANT: return after sending response to prevent "headers already sent" error
  }

  // Simulate a slow network (3 second delay) — useful for testing loading states
  setTimeout(() => {
    res.json(products);
  }, 3000);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

**Run the server:**
```bash
npm run start
```

---

## Frontend Setup (React + Vite)

```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install axios
npm run dev
```

### Fix CORS — Using Vite Proxy

Instead of dealing with CORS errors, configure a **proxy** in Vite so that requests to `/api` are forwarded to `localhost:3000`.

```js
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    proxy: {
      // Any request starting with /api will be proxied to localhost:3000
      "/api": "http://localhost:3000",
    },
  },
  plugins: [react()],
});
```

---

## Basic API Call with Axios

The most basic way to call an API when a component mounts:

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Using an IIFE (Immediately Invoked Function Expression) 
    // so we can use async/await inside useEffect
    // (useEffect's callback itself cannot be async)
    ;(async () => {
      const res = await axios.get("/api/products");
      console.log(res.data); // axios wraps data inside res.data
      setProducts(res.data);
    })();
  }, []); // Empty dependency array = run only on mount

  return (
    <>
      <h1>Products: {products.length}</h1>
    </>
  );
}
```

> **Why IIFE?**  
> `useEffect` cannot directly accept an `async` function. The workaround is to define and immediately call an async function inside it.

```js
// This is NOT allowed:
useEffect(async () => { ... }, []);

// This IS allowed (IIFE pattern):
useEffect(() => {
  ;(async () => {
    // your async code here
  })();
}, []);

// The semicolon before ( is a safety practice — it prevents 
// the IIFE from being misinterpreted as a function call on the previous line.
```

---

## Handling Edge Cases

### 1. Error State

If the API call fails, we need to tell the user something went wrong.

```jsx
const [error, setError] = useState(false); // null or false initially = no error

useEffect(() => {
  ;(async () => {
    try {
      setError(false);  // Reset error before each new request (important for retries)
      const res = await axios.get("/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      setError(true); // Set error flag if the call fails
    }
  })();
}, []);

// Render error UI if error occurred
if (error) return <h1>Something went wrong</h1>;
```

### 2. Loading State

Show a loading indicator while the API is in progress.

```jsx
const [loading, setLoading] = useState(false);

useEffect(() => {
  ;(async () => {
    try {
      setLoading(true);  // Start loading
      setError(false);

      const res = await axios.get("/api/products");
      setProducts(res.data);
      setLoading(false); // Stop loading on success
    } catch (err) {
      setError(true);
      setLoading(false); // Stop loading on error too
    }
  })();
}, []);

if (loading) return <h1>Loading...</h1>;
```

### Combined Example

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await axios.get("/api/products");
        setProducts(res.data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    })();
  }, []);

  // Early return pattern for error and loading states
  if (error) return <h1>Something went wrong</h1>;
  if (loading) return <h1>Loading...</h1>;

  return (
    <>
      <h1>Chai aur API in React</h1>
      <h2>Number of products: {products.length}</h2>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price}</p>
          <img src={product.image} alt={product.name} height="200px" />
        </div>
      ))}
    </>
  );
}

export default App;
```

---

## Custom React Query Hook

The loading + error + data pattern is so **common** that it makes sense to extract it into a **reusable custom hook**.

> This is essentially what libraries like **React Query** and **SWR** are doing under the hood!

```jsx
// App.jsx
import App from './App';
import { customReactQuery } from './hooks';

function App() {
  // Just call the hook with any URL — it handles everything!
  const { products, error, loading } = customReactQuery('/api/products');

  if (error) return <h1>Something went wrong</h1>;
  if (loading) return <h1>Loading...</h1>;

  return (
    <>
      <h1>Products: {products.length}</h1>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>{product.price}</p>
          <img src={product.image} alt={product.name} height="200px" />
        </div>
      ))}
    </>
  );
}

// Custom hook — can be moved to a separate file (e.g., hooks/useFetch.js)
const customReactQuery = (urlPath) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await axios.get(urlPath); // urlPath is dynamic
        setProducts(res.data);
        setLoading(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    })();
  }, []); // Dependency array can include urlPath if it changes

  // Return everything the consumer needs
  return { products, error, loading };
};
```

> **Key Insight:** Custom hooks are just regular JavaScript functions that use React hooks (`useState`, `useEffect`, etc.) internally. They must start with `use` by convention.

---

## AbortController — Handling Race Conditions

### The Problem: Race Condition

When a user types in a search box, a new API call fires on **every keystroke**.

```
User types: "m" → "me" → "met" → "meta" → "metal"
```

This fires 5 separate API calls. They may **return out of order** due to network latency:

- Request for "metal" might return before "met"
- The UI might briefly show results for "met" even though the user typed "metal"

This is a **race condition**.

### The Solution: AbortController

`AbortController` is a browser API that lets you **cancel** in-flight requests.

```jsx
useEffect(() => {
  // Step 1: Create a new AbortController for this effect run
  const controller = new AbortController();

  ;(async () => {
    try {
      setLoading(true);
      setError(false);

      // Step 2: Pass the controller's signal to axios
      // This links the request to the controller
      const res = await axios.get('/api/products?search=' + search, {
        signal: controller.signal, // axios will cancel this request if abort() is called
      });

      setProducts(res.data);
      setLoading(false);
    } catch (error) {
      // Step 3: Handle cancellation errors separately
      // When abort() is called, axios throws a cancel error — we don't want to show "Something went wrong"
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return; // Silently ignore — this is expected behavior
      }

      // Only set error for real failures, not cancellations
      setError(true);
      setLoading(false);
    }
  })();

  // Step 4: Cleanup function — runs when:
  // - The component unmounts
  // - The dependency (search) changes and the effect re-runs
  return () => {
    controller.abort(); // Cancel the previous request before starting a new one
  };

}, [search]); // Re-run whenever `search` changes
```

### How the Cleanup Works

Every time `search` changes:
1. The cleanup function from the **previous** effect runs → `controller.abort()` cancels the old request
2. The new effect runs with a **fresh** `AbortController`
3. Only the **latest** request's result updates the UI

> **Important distinction:**
> - `AbortController` solves **race conditions** (ensures order of responses)
> - **Debouncing** reduces the **number of requests** fired
> These are two separate concepts and solve different problems.

---

## React Query Library (Overview)

React Query (now called **TanStack Query**) is a library that handles all of this for you automatically.

```bash
npm install @tanstack/react-query
```

Basic usage:
```jsx
import { useQuery } from '@tanstack/react-query';

function App() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: () => axios.get('/api/products').then(res => res.data),
  });

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Something went wrong</h1>;

  return <div>{data.length} products</div>;
}
```

React Query provides:
- Automatic caching
- Background refetching
- Paginated queries
- Parallel queries
- Loading/error/data states out of the box

> The custom hook we built earlier is essentially a simplified version of what React Query does!

---

## Key Concepts Summary

| Concept | What it solves | How |
|---|---|---|
| **Error state** | API call fails | `try/catch` + `setError` |
| **Loading state** | Waiting for response | `setLoading(true/false)` |
| **Custom hook** | Reusability | Extract logic into `useFetch` / `customReactQuery` |
| **AbortController** | Race conditions | Cancel stale requests on re-render |
| **Debouncing** | Too many API calls | Delay firing until user stops typing |
| **React Query** | All of the above | Third-party library |

### Cleanup Function in `useEffect`

```jsx
useEffect(() => {
  // Setup code here...

  return () => {
    // Cleanup code runs:
    // 1. Before the effect re-runs (when dependency changes)
    // 2. When component unmounts
    controller.abort();
  };
}, [dependency]);
```

This is similar to `componentWillUnmount` in class components. Always clean up:
- Event listeners
- Timers (`clearTimeout`)
- API requests (`AbortController`)

---

## Final App.jsx (Complete Code)

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(''); // Search input state

  useEffect(() => {
    const controller = new AbortController(); // New controller per effect run

    ;(async () => {
      try {
        setLoading(true);
        setError(false);

        // Append search query to URL
        const res = await axios.get('/api/products?search=' + search, {
          signal: controller.signal, // Link request to controller
        });

        setProducts(res.data);
        setLoading(false);
      } catch (error) {
        if (axios.isCancel(error)) {
          // Request was intentionally cancelled — not an error
          console.log('Request cancelled:', error.message);
          return;
        }
        setError(true);
        setLoading(false);
      }
    })();

    // Cleanup: cancel the previous request when search changes
    return () => {
      controller.abort();
    };
  }, [search]); // Re-run when search value changes

  return (
    <>
      <h1>Chai aur API in React</h1>

      {/* Search input — fires API on every keystroke */}
      <input
        type="text"
        placeholder="Search products"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Inline conditional rendering for loading and error */}
      {loading && <h1>Loading...</h1>}
      {error && <h1>Something went wrong</h1>}

      <h2>Number of products: {products.length}</h2>

      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>₹{product.price}</p>
          <img src={product.image} alt={product.name} height="200px" />
        </div>
      ))}
    </>
  );
}

export default App;
```

---

> **Next topics to explore:**
> - Debouncing (reduce number of API calls)
> - Axios interceptors (modify requests/responses globally)
> - React Query in a real project

<!-- Transcript:
```
हां जी स्वागत है आप सभी का चाय और कोर्ट
में उम्मीद करता हूं चाय आपकी तैयार है
क्योंकि कोड हमारा तैयार है तो इस वीडियो
के अंदर हम देखेंगे एपी कैसे हैंडल करते
हैं हमारे रिएक्ट के अंदर और सिर्फ ना की
ये देखेंगे क्योंकि बेसिक अप आपको हैंडल
करना आता चाहिए उसे इफेक्ट के अंदर हो
चाहे डायरेक्ट कोई मेथड पर कॉल हो वो आप
कर लेते हो कुछ भी नहीं एक फेच मेथड लगाना
है एक्सयूवी उसका भी हमने छोटा सा डिस्कशन
कर लिया था इसलिए उसके थ्रू भी ये डॉट गेट
डॉट पोस्ट डाटा वगैरा सब सेंड कर देता हूं
इतना भी कोई बड़ा काम नहीं है आपको करना
आता है ये लेकिन प्रोडक्शन के अंदर
प्रोफेशनली एपी कैसे हैंडल होती है कैसे
कस्टम बुक्स बनाए जाते हैं और किस तरह के
आपके पास और टूल्स अवेलेबल होते हैं या
पैकेज अवेलेबल होते हैं जो की आपकी इस एपी
हैंडलिंग को और इंप्रूव कर सकते हैं जैसे
आपने नाम सुना होगा रिएक्ट क्वेरी वगैरा
के बड़े में तो क्यों एक्जिस्ट करते हैं
और इस वीडियो के अंदर हम अपने कस्टम
रिएक्ट क्वेरी बनाकर देखेंगे हां जी आपने
सही सुना कस्टम रिएक्ट क्वेरी हम बनाएंगे
ताकि हमें समझ में आए की एक्चुअली में और
क्या-क्या इंप्रूवमेंट है जैसे की हमने
स्टार्टिंग में अगर आपको याद हो तो खुद की
रे लाइब्रेरी बनाने की कोशिश कारी थी तो
हमारे काफी कॉन्सेप्ट क्लियर हो गए थे की
रिएक्ट किस तरह से काम करता है तो इस
वीडियो में जैसे ही हम खुद का रिएक्ट
क्वेरी एक बार बनाने की देखेंगे तो हमें
और कॉन्सेप्ट क्लियर होंगे की एपी
हैंडलिंग कैसे होती है रिएक्ट क्वेरी कहां
कहां हेल्प करती है और क्या-क्या चीज
हमारे पास में आ हो शक्ति है अब देखिए जब
मैं बात करता हूं ना की हम यहां पर कस्टम
अपना ये सब काम करेंगे एपी हैंडलिंग
देखेंगे और मैं अक्सर लोगों को बताता हूं
की प्रोफेशनल वर्ल्ड के अंदर एपी इस तरह
से कॉल होती है कुछ स्पेशल नहीं होता है
इनफैक्ट कई बार तो प्रोडक्शन के अंदर
उल्टा ज्यादा लोअर लेवल का कोर्ट लिखा हुआ
होता है लेकिन एक सिर्फ चीज का ध्यान हर
कोई प्रोडक्शन में रखना है वो है एजुकेशन
अब जैसे ना मैं ये एजुकेशन का नाम लेट हूं
तो लोग कहते हैं अच्छा एजुकेशन सर वो लीड
कोड वाले या फिर वो कॉम्पिटेटिव
प्रोग्रामिंग वाले हा केसेस अब देखिए इतनी
अच्छी चीज थी ये लीड कोड और ये
कॉम्पिटेटिव प्रोग्रामिंग और यह सब लोगों
का ब्रेन शार्प करने के लिए और हमने क्या
कर हम बस ग गए उसके अंदर वही आईआईटी वाली
उसको रेस बना के छोड़ दिया और पूरा उसका
जो एसेंस था ना एकदम कल कर दिया है आगे
केसेस का मतलब वो लीड कोड वाले रोजर नहीं
होता है टेस्टिस का मतलब है क्या पॉसिबल
हो सकता है उन चीजों का ध्यान रखते हुए
कोड को लिखना ताकि हो सकता है की एक ही
स्पेशल सिंटेक्स ए गया इसको भी हमारा कोड
हैंडल करना चाहिए एक स्पेशल हमारा एरर है
उसको भी हमारा जो कोड है हैंडल करना चाहिए
तो जितने भी ऐसे पॉसिबल जो नॉन है या आम
है उन केसेस को हैंडल करना और यही
प्रोडक्शन में ज्यादा ध्यान दिया जाता है
तो काफी दुख होता है जब लोग लीड कोड को हक
बैंड करके करते हैं बजाया उसको ब्रेन
शार्पन एक्टिविटी या फिर कंप्यूटर साइंस
को समझना की जगह बस चलिए ठीक है कभी और
बात करेंगे उसमें तो पर अभी चलते हैं
अच्छा एक चीज और ये वीडियो के अंदर भी मैं
आपको एक कस्टम वसंत लिख के दिखाऊंगा
ज्यादा नहीं होगा घबराए मत जो लोग बाईकें
नहीं सीखना चाहते हैं मुश्किल से 15 या 20
लाइन का कोड है जो भी आपको समझ में आएगा
एक एक लाइन पे मैं कस्टम कोड यहां पे
इसलिए लिख रहा हूं क्योंकि मैं आपको कोई
ब्लैक बॉक्स एपी इससे टेस्टिंग नहीं
करवाना चाहता अच्छा कुछ फैंसी शब्द उसे कर
लिए ब्लैक बॉक्स एपी मतलब की वो एपी जिनपे
हमारा कंट्रोल नहीं है बस हमारे पास डाटा
रिसीव हो जाता है बट वो कैसे बिहाइंड डी
सीन काम कर रहा है वो मुझे नहीं पता इस को
ब्लैक बॉक्स बोलते हैं जैसे की आप देखेंगे
स्लैश हितेश चौधरी वहां से रिस्पांस ए
जाता है कैसे रिस्पांस आता है कितनी देर
में आता है क्या क्वेरी हिट हो रही है बैक
हैंड पे क्या कंट्रोलर लिखे हुए हैं वो
कोई आइडिया नहीं है मेरे को वो जैसे भी
उन्होंने इंजीनियर ने लिखा उन्होंने लिखा
मेरा कोई उसमें योगदान नहीं है और वो भी
नहीं सकता तो मेरे पास कंट्रोल नहीं है की
मैं चीजों को मेरे को अगर करना है की यार
इसका रिस्पांस ना दो सेकंड बाद आए तो मैं
नहीं कर सकता वहां पे तो इसलिए मैं कस्टम
कोड लिखना चाहता हूं ताकि हमारे पास
कंट्रोल ज्यादा रहे हैं वरना वहां से तो
रिक्वेस्ट मारूंगा गेट अप के सर्वर अच्छे
हैं वो कभी डिले हो गए ही नहीं और मुझे
डिले चाहिए मैं देना चाहता हूं डिले ताकि
एपी के सारे केसेस में आपको यहां पे शो कर
पाऊं ठीक है इसी को बोलते हैं ब्लैक बॉक्स
एपी सब ब्लैक बस टेस्टिंग अरे कई तरह के
नाम है फैंसी नाम है प्रोग्राम्स को पसंद
होते हैं ओके जी तो चलिए स्क्रीन शेर पर
चलते हैं हां काफी चर्चा हो जाते हैं पर
ये चर्चा है ना एक्सपीरियंस शेयरिंग मैं
इसको मानता हूं और यही एक चीज है जो की इस
चैनल को बाकी चैनल से अलग करते हैं
क्योंकि देखिए तकरीबन तकरीबन 12 साल के
आसपास से कोड लिख रहे हैं पढ़ा भी रहे हैं
प्रोडक्शन में भी बना रहे हैं तो ये साड़ी
जब जर्नी शेर करते हैं तो थोड़ा सा आपका
इंप्रूव हो जाता है एक्सपीरियंस तो ये
हमारे पास में ए गया है हमारा वे एस कोड
एपी हैंडलिंग नाम से एक फोल्डर मैंने यहां
पे रख रखा है दो फोल्डर हम बना लेते हैं
एक बना लेते हैं बैक और और एक और बना देते
हैं हमारा फ्रंट
यह लीजिए बैक और फ्रंट दोनों तैयार ओके जी
पहले चलते हैं
इंटीग्रेटेड टर्मिनल के अंदर और इस बार हम
क्या करेंगे नम इन आईटी
देश ए ऑप्शन दे देते हैं की डिफॉल्ट जो भी
है हमारे को वही ठीक है और एक हमें यहां
पे फाइल चाहिए की आप फाइल हम वही index.gs
रख लेते हैं आपको में डॉट जस server.js जो
रखना है रखो आ कोई इतनी इशू की बात ही
नहीं है ओके एक पैकेज भी चाहिएगा और पीएम
इंस्टॉल एक्सप्रेस काफी देर से हम उसे कर
रहे हैं इस पैकेज को आ और अभी भी उसे
करेंगे और आपको पता ही है क्योंकि मॉडल्स
उसे करने वाले हैं आम जीएस उसे नहीं
करेंगे तो यहां पे लिख देते हैं की टाइप
जो है मोडल उसे करेंगे ताकि वो जो इंपोर्ट
वगैरा के अंदर एरर्स ना आए अगर आपने
पुराना वीडियो नहीं देखा है तो देखिएगा
वहां पे हमने इस चीज के बड़े में काफी
डिस्कशन किया है अब आते हैं अभी तक तो
आपको सर्वर बनाना है एकदम रेडी गया होगा
इसमें क्या है इंपोर्ट एक्सप्रेस
फ्रॉम एक्सप्रेस और एक्सप्रेस से अप बंटी
है कास्ट अप इस वेरिएबल का नाम कुछ भी हो
सकता है अप सबसे पहले क्या करता है
किसी भी पोर्ट पर कर सकता है लिसन लेकिन
पोर्ट एन वेरिएबल में देना है ठीक है
पोर्ट हमारे पास जो है प्रोसेस नव या फिर
पोर्ट हम ले लेते हैं 3000 इसलिए कहता हूं
पायलट ना जब आपको चीज पता हो तो एकदम
स्पीड में काम कर देता है ठीक है तो अप
डॉट लिसन है लिसन के अंदर हमारे पास एक
पोर्ट ए जाता है एक कॉल बैक ए जाता है और
ये सर्वर रन हो रहा है हमारा पोर्ट पे ठीक
है तो ये हो गया हमारा बेसिक अब इसमें
क्या कर दिया है की कुछ हां जी अभी ठीक है
ओके तो इतना काम तो हमारे पास हो गया की
पोर्ट लोशन कर रहा है और ये सर काम हमारा
हो रहा है अब बेसिकली नेक्स्ट मुद्दा आता
है हमारे पास में वो आता है की हमारे को
कुछ रूटिंग चाहिए सपोज कीजिए हमें एक
app.get है स्लैश फ्रॉम कुछ नहीं करने
वाले हमसे सीधा एक एपी आउट लिखेंगे एप्स /
प्रोडक्ट्स और वहां पर कुछ प्रोडक्ट्स की
आपको लिस्टिंग देंगे तो app.get
और एक ही रौतेला एपी स्लैश प्रोडक्ट्स इसी
तरह के आपके पास प्रोडक्ट्स होते हैं
रेस्टोरेंट लिस्ट होती है आईफोन की लिस्ट
है कुछ भी प्रोडक्ट हो सकता है तो ये हम
चलते हैं अपने बेसिक प्रोडक्ट्स के पास
और फिर आता है हमारे पास में
अब यहां पर जो सबसे पहले
रिस्पांस कर सकते हैं बट पहले प्रोडक्ट्स
भी होने चाहिए तो प्रोडक्ट्स मैंने वही
जेनरेट कर लिए हैं कुछ भी नहीं कुछ टेबल्स
हैं तो ये हमारे पास एक प्रोडक्ट्स है जो
की अरे है और ऑब्जेक्ट्स आपका मां करें आप
इसमें वैल्यू चेंज कर देना कुछ नहीं आईडी
है नाम मैंने कुछ वुडनेस की टेबल के नाम
दे दिए हैं क्योंकि यही एक्चुअली में काम
भी है हमारा टेबल्स वगैरा ये सब बनाना तो
वुडन टेबल्स हैं प्राइस है और सबकी एक
इमेज पिक्सल वगैरा से उसे कर लिया तो
इसलिए मुझे वो ही याद आता जाता है तो ये
हमारे पास में सर डाटा हो गया सारे डेटस
है हमारे पास में डाटा के अंदर वैल्यू
फील्स हमारे लिए इंपॉर्टेंट है डाटा क्या
है उससे कोई फर्क नहीं पड़ता है ओके तो ये
हमारे पास हो गए प्रोडक्ट्स अब इन
प्रोडक्ट को क्या करना है मुझे करना है
इनको रेस्पॉन्ड ठीक है जी अब क्या है की
प्रोडक्ट को रेस्पॉन्ड तो मैं करना चाहता
हूं लेकिन मैं नहीं चाहता की इमीडिएट
रिस्पांस है अगर मैं इम्मीडिएटली जेसन में
रिस्पांस कर देता हूं या सीधा बोल देता
हूं रेस डॉट सेंड तो ठीक है काम हो जाएगा
बट मैं चाहता हूं
नेटवर्क ट्रैफिक है डेटाबेस के अंदर बहुत
साड़ी क्वेरीज हो रही है कुछ भी है तो हम
सिमिलाते करेंगे की थोड़ी देर बाद
रिक्वेस्ट आई है आपसे रिलेशन कैसे कर सकते
हैं जी अगर आपने जावा स्क्रिप्ट पड़ी है
मेरे साथ में तो सेट टाइम आउट इस तरह से
होता है मां लीजिए मैं 3 सेकंड का टाइम
ऑर्डर देता हूं आज की डेट में ना तीन
सेकंड बहुत ज्यादा है जब लोगों की आदतें
पद गई है 60 सेकंड की सिर्फ रूल्स देखने
की तो 3 सेकंड तो बहुत ज्यादा लगेंगे ना
तो इसलिए काफी अच्छा सिमुलेशन हो जाता है
तो यहां पे हम आते हैं rest.and और ये
प्रोडक्ट हमने सेंड कर दिए ओके इतना तो
काम हो गया लेकिन ये सब तो हमें पहले से
आता था हां तो थोड़ा सा कुछ एडवांसमेंट भी
तो होना चाहिए ना हां एडवांसमेंट क्या
होगा हम यहां पर एक और चीज एक्सेस करेंगे
की हम चलते हैं हमारे ब्राउज़र पे अब क्या
है सपोज करिए आप जाएंगे लोकल होस्ट 3000
पर आप ऑब्वियस सी बात है जाएंगे स्लैश एपी
स्लैश प्रोडक्ट्स पर लेकिन प्रोडक्ट्स के
बाद यहां पे तो आपको साड़ी लिस्टिंग हो
जाएगी लेकिन मैं चाहता हूं की आप कुछ
फिल्टर भी कर पाया यानी की एक इनपुट फील्ड
आपको देंगे उसमें नाम के बेसिस पे आप सर्च
कर पाव तो क्या होगा आप इस तरह से कुछ
सर्च करेंगे अपने पैरामीटर की मुझे चाहिए
क्वेश्चन मार्क सर्च
इक्वल्स और फिर जो भी आपको नाम देना है
सपोज करें मुझे वुडन देना है तो आप वुडन
इस तरह से दे देंगे या फिर मेटल टेबल सर्च
करनी है तो मेटल इस तरह से दे देंगे तो
इसको मैं एक बार कॉपी करके यहां ले आता
हूं कोड के अंदर ताकि आपको दिखे जय आसानी
से हम क्या करना छह रहे हैं तो ये है
हमारा कोड की इस तरह से लोकल होस्ट 3000 /
प्रोडक्ट और आपने देखा होगा गूगल पे भी
इसी तरह से सर्च होता है अगर आप गूगल पे
भी जाके देखेंगे कुछ भी टेस्ट सर्च करेंगे
कुछ भी टेस्ट बुक टेस्ट है जो भी आपको
सर्च करना है आप सर्च करिए तो देखिए आपको
स्लैश फिर सर्च क्वेश्चन मार्क के = तो
इसी तरह से हम भी कुछ इसी तरह से सर्चिंग
वगैरा कर रहे हैं आप बड़े बेसिक है ऐसा
कोई परिसर बात है नहीं उसके अंदर अच्छा
हमारे डिजिटल लोशन भी ओपन है
ओके जी तो चलते हैं हमारे पास यह तो इसी
तरह से हम यहां पर भी सर्च करना चाहते हैं
अब एक्चुअली में क्या है जब आपको इस तरह
से क्वेरी पैरामीटर मिलते हैं हां जी एक
क्वेश्चन मार्क को क्वेरी पैरामीटर बोलते
हैं तो आपको क्या है की क्वेरी पैरामीटर
देखना पड़ता है की ये सर्च लिखा हुआ है या
फिर यहां पे क्यों लिखा हुआ है या जो भी
उसका नाम है ये नाम जो है ना के = ये बड़ा
इंपॉर्टेंट होता है तो हमारे पास अभी जो
नाम है वो सपोर्ट कर लीजिए सर्च है तो
वसंत में इस तरह की रिक्वेस्ट को कैसे
हैंडल करते हैं की सबसे पहले हम आईएफ
कंडीशन लगा लेते हैं देख लेते हैं उससे
पूछ लेते हैं किस तरह का कोई वैल्यू लिखा
भी है किसी ने की नहीं लिखा है या सीधा
सिर्फ प्रोडक्ट से हैं तो ये गिफ्ट कंडीशन
में हम सर्च कर सकते हैं जो रिक्वेस्ट आई
है ना वहां पे हम पूछ सकते हैं तो इसको
बोलते हैं क्वेरी तो रिक्वेस्ट ए रहा है
कुछ डाटा उसको रिक्वेस्ट बोलते हैं
रिस्पांस जो हम सेंड कर रहे हैं तो
रिक्वेस्ट सर्च तो इसके अंदर जो भी वैल्यू
है तो इक्वल तू के बाद आपकी वैल्यू इस तरह
से एक्सेस हो जाति है बस इतना सा काम है
कौन से लोग भी करके देख सकते हो रिक्वेस्ट
सर्च करो तो आपको मिल जाएगी तो अब मैं
क्या चाहता हूं की यहां पे मुझे क्या
मिलेगा नाम अब इस प्रोडक्ट के अंदर मुझे
पता है की हमारे पास में एक फील्ड है
जिसका नाम नाम तो यह नाम के बेसिस में
प्रोडक्ट्स को फिल्टर करना चाहता हूं अगर
आपको जावास्क्रिप्ट पता है तो बड़ा ही
बेसिक सा है की इस तरह के फिल्टर हम करते
रहते हैं तो हमारे पास क्या करते हैं सारे
प्रोडक्ट्स लो इसके ऊपर लगा दो फिल्टर
फिल्टर आप लगा ही सकते हो अब इस फिल्टर के
अंदर क्या होगा गैलरी लीजिए फिल्टर के
अंदर आपको हर एक प्रोडक्ट का एक्सेस होगा
ये लीजिए प्रोडक्ट का एक्सेस है अब यहां
पे हमें कॉल बैक मिलता है तो हम कॉल बैक
यहां पे उसे कर लेते हैं तो कॉल बैक में
हमने क्या कहा की ये जो प्रोडक्ट है इस
प्रोडक्ट के नाम के अंदर मल्टीपल फील्ड्स
हैं इसके अंदर अगर इंक्लूड है
इंक्लूड क्या इंक्लूड है वो अपनी कंडीशन
दे रहे हैं यहां पे रिएक्ट डॉट सर्च
डॉट नाम
अगर यह हमारे पास मिल रहा है तो यह हमारी
कंडीशन है की प्रोडक्ट और नाम इंक्लूड अगर
हो रहा है तो आपको दे दीजिए अब ये साड़ी
चीज क्या है की हम हॉल कर लेते हैं नए
वेरिएबल के अंदर तो इसको बोल देते हैं
फिल्टर प्रोडक्ट्स
और अगर यह भी कन्ज्यूरिंग ग रहा है तो
टाइम है वापस से यस कट के सीरीज रिवाइज कर
देगा क्योंकि ये बेसिकली एक फिल्टर है और
कुछ भी नहीं है एक फिल्टर मेथड है जावा को
और कुछ भी नहीं है जब-जब वालुज ट्रू होगी
तब ये रिटर्न करेगा तो मैंने क्या देखा है
स्ट्रिंग उसे कारी है बेसिकली प्रोडक्ट का
जो नाम है उसमें जो क्वेरी के अंदर वैल्यू
आपने दी है जैसे मेटल अगर वो उसमें
इंक्लूड है तो एक नया अरा बना दो अरा बना
दो तो हर एक यर के अंदर जाएंगे लूप के
अंदर और हर एक के नाम वैल्यू के अंदर हम
जाएंगे क्योंकि ऑब्जेक्ट है नाम की के
अंदर जाकर देखेंगे की जो भी आपने सर्च
पूछा है जैसे ब्लू पूछा है तो ब्लू
इंक्लूड है की नहीं सब में जी जी में
इंक्लूड है उसको वापस रिटर्न कर दो बस यही
काम हम कर रहे हैं अब ये भी अगर समझ में
नहीं ए रहा है तो तो चिंताजनक बात है
रिएक्ट के हमारे जावास्क्रिप्ट के हमारे
बेसिक्स स्ट्रांग नहीं हुए हैं और फिर
क्या कर दो सिंपली रेस- सेंड कर दो जो नया
वाला अरे बना है फिल्टर प्रोडक्ट ये कर दो
अच्छा एक चीज और यहां पे आने के बाद ना
रिटर्न कर देना क्योंकि अगर ये रिटर्न
नहीं करोगे तो एक्चुअली में क्या है की
रिस्पांस सेंड करने के बाद आपको ये पूरा
का पूरा मेथड ना एग्जिट करना है यहां से
वरना आपके एप्लीकेशन क्रश हो जाएगी यह
जरूरी इंपॉर्टेंट मेथड है तो देखिए थोड़ा
सा हमने जितना पहले आता था वो तो हमने पढ़
ही लिया लेकिन थोड़े से एडवांस में ये कर
ली है की अब हमने ये भी सिख लिया
फिल्ट्रेशन कैसे करते हैं इसका इंर्पोटेंस
है क्योंकि इसीलिए मैं खुद का यहां पे
सर्वर बनाना छह रहा था देखिए कुछ ज्यादा
काम नहीं किया है बस एक मेथड ही लिखा है
तो ये बस इतना ही सर्वर था बेसिक हमारा
सर्वर बन गया है अब क्या करना है इसके बाद
कुछ नहीं सर्वर को ऑन करके छोड़ दीजिए तो
अच्छा ऑन तो हम कैसे करेंगे package.com
में जाते हैं और पहले इसको बोलते हैं की
हम एक स्टार्ट स्क्रिप्ट लिखेंगे और
स्टार्ट स्क्रिप्ट बेसिक अपना नोट के साथ
index.js को रन कर देगी ठीक है जी चला के
देखते हैं नम रन स्टार्ट
और
कुछ प्रॉब्लम हो रही है क्या इसको ओके ग
रहा है हमारा पोर्ट 3000 बीजी चल रहा है
थोड़ा सा कहानी पे और कुछ दिखाना चल रहा
है चलिए देख लेते हैं एक बार खेल करके
और हमें पता है स्लैश एपी प्रोडक्ट्स
को हम हिट कर सकते
तो हॉपफुली हमारे पास में यह साड़ी टेबल ए
गया अब मैं चाहता हूं की आप सर्च पैरामीटर
भी इस तरह से आप देना चाहे या उसे करना
चाहे तो आप एक्चुअली में कर सकते हैं
उसमें कोई बुराई नहीं है आप सीधा का सीधा
प्रोडक्ट्स के बाद जाके एक क्वेश्चन मार्क
लिख के और सर्च लिख के और अब यहां पे आप
जैसे सपोर्ट करिए मैं वुड पास करना चाहता
हूं तो इंटर करेंगे तो आपके पास सिर्फ वही
रिस्पांस ए रहा है जिसके अंदर वुडन है
एक्चुअली में और जैसे आप पी पास करते हैं
यहां पे की सर्च मेरा एक ही लेटर का पीस
तो आपके पास दो वालुज ए रही है जो
प्लास्टिक है और एक आपके पास दूसरी गाड़ी
है जो की पॉलिएस्टर है तो हमारा ये सर्च
फील्ड एटलिस्ट टेस्ट हो गया है ठीक है आप
चाहे तो पोस्टमैन से या फिर थंडर क्लाइंट
किसी और से भी टेस्ट कर लो बेसिक टेस्ट था
इसलिए मैंने यही कर दिया तो एटलिस्ट बैक
और अपना चल रहा है कोई दिक्कत वाली बात
नहीं है हमने बैक हैंड बना लिया है टाइम
से हम दाल देना की यहां तक हमारा बैक हैंड
कंप्लीट हो गया अब मैं एक बार आपको
ओवरव्यू दे देता हूं की हमारे पास एक एपी
है हो सकता है आपने कहानी से डाउनलोड
करियो या किसी और की उसे कर रहे हो वहां
पे इतना सा फंक्शन आपको दिया हुआ है की
अगर आप को हिट करोगे तो सारे प्रोडक्ट्स
मिल जाएंगे रेस्टोरेंट मिल जाएंगे डिशेज
के मिल जाएंगे लेकिन अगर आप यह वाला
यूआरएल सिंटेक्स देते हो क्वेश्चन मार्क
सर्च इक्वल्स तू जो भी कीवर्ड देते हो तो
मैं यहां पे आपको एक एरर रिटर्न करूंगा
जिसके अंदर नाम के अंदर वो प्रोडक्ट वो
कीवर्ड हो गया होगा बस इतना सा ये है अब
जिसको नहीं करना है बैक हैंड में ज्यादा
इंटरेस्ट है वैसे तो लिख लेना इतना सा
आपका ही फायदा है पर जिसको नहीं है
बिल्कुल इंटरेस्ट तो आगे आईटी इसे जो है
पूरा एन सोर्स कोड अपना देख लो ये लाइन
भाई लाइन लिखा है पॉज कर करके देख लो और
आगे आईटी इसे लिख दो ठीक है अच्छा अब चलते
हैं हमारे फ्रंट हैंड में क्योंकि
एक्चुअली काम तो वहीं से होगा तो फ्रंट और
में इसको ओपन करते हैं हमारे इंटीग्रेटर
टर्मिनल में
ठीक है जी और इसको स्टार्ट करते हैं नम
क्रिएट
लेटेस्ट और एक डॉट भी लगा देते हैं ताकि
वो अलग से फोल्डर के अंदर फोल्डर ना बनाया
बस इसलिए रिएक्ट जावास्क्रिप्ट और सीडी
सीडी तो करने की जरूर नहीं अब नम इंस्टॉल
और हम यहां पर भी एक और चीज इंस्टॉल
करेंगे
अब पता लगेगी की हां एक्सेस एक्चुअली मैं
काम की लाइब्रेरी है और कितना काम हमारा
कर देती है कितना टाइम लगाओगे भाई
कर दो फटाफट तब तक हम क्या करते हैं इसको
रिनेम कर लेते हैं कलर चेंज कर लेते हैं
बैक और हमारा
रेड में कर लेते हैं और जो फ्रंट है उसको
किस में करें ये लो मैं कर लेट है
ठीक है चल जाएगा लगता है मेरा इंटरनेट
स्लो है
ओके तो यहां पर इसको रन कर लेते हैं तो नम
रन देवली हमारा सर्वर रन हो जाएगा और यह
लीजिए रन हो रहा है सोर्स के अंदर जाते
हैं और यहां पर आते हैं
अपना काम करते हैं सबसे पहले काम क्या
होता है यह सब हटाने
चाय और
एपी इन रिएक्ट ओके ठीक है चल रहा है सर
काम बढ़िया चल रहा है अभी तक तो कोई
दिक्कत नहीं है ओके अब हमारी बात आई है की
एक्चुअली में यह सर काम करोगे कैसे सारे
प्रोडक्ट्स यहां पर लेकर कैसे आओगे
प्रोडक्ट्स देखिए लेकर आना कोई बड़ी बात
नहीं है आपको बड़ा इजी बेसिक पता है की
मैं एक बटन यहां पर लगा सकता हूं उसे बटन
के साथ में एक ऑन क्लिक हैंडलर लगा सकता
हूं वो क्लिक हैंडलर सीधा एपी का आ एक्सेस
करेगा एपी कॉल करेगा फैट से या जियो से
जिसके साथ भी आप करना चाहे उससे कर लगा और
थॉट्स आईटी हमारा काम हो जाएगा अच्छा अब
चलते हैं ये तो आपको बेसिक पता है लेकिन
सबसे पहले क्या करते हैं हम जाते हैं वीट
कॉन्फ़िग में क्योंकि आपको पता है हमारा
ये बैक और है कोर्स एरर देगा वो हमने काफी
डिस्कस कर है पिछले एक वीडियो में प्लीज
बता दीजिएगा जो लोग परेशान हो रहे हैं
उनको यहां पर आकर हमारी प्रोक्सी सेट कर
लेते हैं ताकि वो कोर्स वाले एरर्स वो सब
नहीं है तो हम क्या करते हैं एक सर्वर
लेते हैं ये लीजिए
ये हमारा सरवर हो गया ये क्लीनिंग हो गई
और इसके बाद हमें चाहिए एक प्रोक्सी
इतना सब नहीं चाहिए जितना सजेशन में ए रहा
है हम बेसिक ही लिखेंगे यहां पे प्रोक्सी
के अंदर हमें चाहिए एपी और लोकल 3000 पर
हमारा जो भी स्लैश अपोल हो रहा है वहां पे
ये एड कर दो अब हमें एक्चुअली में कोर्स
वाले एरर नहीं मिलेंगे मैंने पिछले वीडियो
में डिस्कस कर लिया था ये इतना काम तो है
अब क्या करना है अब देखिए दो-तीन तरीके
हैं आपके पास किस तरह से वालुज ले सकते हो
एक यहां पे हम h2o और ले लेते हैं और
इसमें लिख देते हैं
नंबर ऑफ
प्रोडक्ट आर और यहां पर इंजेक्टर कर देंगे
स्टोर तो रखना पड़ेगा ना ऐसे तो हवा में
तो पता लगेगा नहीं की कहां से क्या वैल्यू
है वैसे अपडेट भी नहीं होगा तो एक नया फूल
बना देते की जहां पर प्रोडक्ट्स हमारे पास
सारे के सारे रहे हैं तो ये लीजिए हमने
बना लिया एक प्रोडक्ट सजेशन दे दो
प्रोडक्ट्स
सेट प्रोडक्ट्स और हमने मत स्टेट लिए वहां
पे ठीक है इतना काम तो आपको पता है अब
क्या है आपके पास दो-तीन रास्ते हैं एक तो
बटन बना लो की बटन पर क्लिक करूंगा तो एपी
कॉल जाएगी और फिर वो वालु जाके स्टेट में
सेट हो जाएगी हमारे प्रोडक्ट्स में ये तो
आप कर ही सकते हो तो बड़ा बेसिक है बट मैं
जो चाहता हूं ना वो क्या चाहता हूं की
यहां पे जो प्रोडक्ट्स हैं जैसे मेरा ये
पेज लोड हो यहां पर
यह हमारे पास में अच्छा अभी तो मत है तो
ऐसे तो होगा नहीं नंबर ऑफ प्रोडक्ट के लिए
प्रोडक्ट लेंथ लिखना पड़ेगा तो हमारे पास
यहां पर जीरो ए रहा है मैं चाहता हूं जैसे
ये पेज लोड हो तो यहां पे वालुज अपने आप
आके सेट हो जाए अब ये काम आपको जैसे मैंने
बोला था आपने कहा अच्छा ये तो है की जैसे
कंपोनेंट माउंट हो तभी आप रिक्वेस्ट कॉल
कर लो तो ये जो माउंटिंग और माउंटिंग वाला
कैसे है ये तो हमारा हैंडल होता है कहां
पे
हां जी क्लासेस की बात नहीं कर रहा उसे हम
अभी सारे फंक्शनल कर रहे हैं तो कंपोनेंट
डिड माउंट कंपोनेंट डिड अनमाउंट अगर ये सब
दिमाग में ए रहा है तो हटा दो पता नहीं कब
पुराना रिएक्ट पढ़ रहे हो अभी हमें चाहिए
उसे इफेक्ट आप सब कुछ कॉल से होता है तो
ये हमारा बेसिक उसे इफेक्ट है ये हमारा
कॉल बैक हो गया ये हमारा डिपेंडेंसी अरे
हो गया यहां पे और डिपेंडेंसी की भी अच्छी
चीज बताएंगे आपको यहां पे अब सबसे पहले
बात तो एक्स हो गया क्या हमारे पास में
इंस्टॉल तो हम जाते हैं package.com जेसन
में एक्सकॉस है क्या नहीं एक्स उसे नहीं
है तो इंस्टॉल कर लेते हैं स्टॉप करके
इंस्टॉल एक्सकॉस
छोटे से पैकेज फाटक से इंस्टॉल हो जाएगा
काम अच्छा एक बात बताइए अगर सपोज करिए
वैसे तो आप कर सकते हो किसी करण से मैंने
आपको इंटरव्यू लेते टाइम रजिस्टर्ड कर
दिया की ये जो क्सक्स वाला काम उसे करते
हो इसमें आपको डॉट दें उसे नहीं करना है
और कई केसेस भी होते हैं ऐसे जहां पर मैं
प्रॉमिस के भरोसे नहीं बैठ सकता की
प्रॉमिस बाद में पूरा होगा तब मैं करूंगा
नहीं नहीं मुझे तो पूरे प्रोग्राम को हॉल
करना है रुक जाए पूरा प्रोग्राम और पहले
मेरा डाटा जो है वह उसकी रिक्वेस्ट है वह
प्रोडक्ट्स के अंदर सेट हो और उसके बाद
बाकी का काम हो अलग-अलग सिनेरियस हो सकते
हैं तो इस कैसे में देखिए जरूरी नहीं है
हमेशा की exos.get आपके पास आए और आप यहां
पर लोकल होस्ट जो भी आप सेंड कर रहे हो
वहां पे तो हम स्लैश एपी प्रोडक्ट हो फिर
दो दादा ये सब करें कर सकते हैं कोई
दिक्कत वाली बात नहीं है लेकिन ऐसे भी
सिनेरियस आएंगे आपके पास में जब आप ये सब
नहीं करना चाहते हो और आप यहां पर वेट
करवाना चाहते हो तो ऑब्वियस सी बात है अगर
यहां पर लिख डॉग और रिजल्ट को आप हॉल कर
लोग सपोज करिए आप इस रिजल्ट को हॉल करते
हो रिस्पांस में
है तो आप नहीं कर सकते हो
बता सकता कमेंट्स में क्योंकि आवटे तो तभी
उसे हो सकता है ना जब यहां पर असिन को तो
असिन कहां पे लगे यहां पे
यहां पर लगा दें ऐसा होता ही नहीं क्योंकि
ये तो हक है क्योंकि आपने कस्टमर बनाने
सीखें तो इस तरह से नहीं हो सकता तो ये
काफी कैसे इंटरव्यू में पूछा जाता है की
नहीं नहीं मुझे तो यहां पे आस्तीन का वेट
ही लगाना है कैसे लगा सकते हैं तो अगर
आपने जो स्कर्ट पड़ी होती तो आप कर देते
यह काम कैसे करोगे इसको करो कट ये लीजिए
और ये लीजिए क्या है ये कमेंट क्षेत्र में
बताओ फटाफट क्या है यह हां
इमीडियाटली इन्वोक्ड फंक्शंस ठीक है अब
देखिए इसी के नाम अलग-अलग है मैं तो ये
कहता हूं की वो फंक्शन जो तुरंत कॉल हो
जाए हमने बनाया हमने कॉल कर दिया तुरंत
ठीक है तो फर्स्ट पैरंट थी इसके अंदर उसकी
डेफिनेशन होती है और सेकंड पेरेंट्स कॉल
करने के लिए अब अलग-अलग डेफिनेशन अलग-अलग
नाम को इसी को क्या बोलना है कोई क्या
बोलना है बट बेसिकली इतना ही है अब इसके
अंदर फर्स्ट के अंदर अपना कॉल बैक ले लो
ये लीजिए कॉल बैक ले लिया अब ये क्योंकि
कॉल बैक है इसको मैं आस्किंग बना सकता हूं
यहां पे अपना ये कर लो वेट आप कौन रॉक रहा
है आपको कोई नहीं अब आपका काम भी हो गया
है और एक्चुअली में चीज भी अच्छे से चल
रही है ठीक है तो ये हो गया हमारा वेट यह
सर काम हो गया एक कई बार इश्यूज ए जाते
हैं हमारे तो कई बार आप कुछ कोड बेसिस में
देखोगे यहां पे एक सेमी कलम भी लगा होता
है वो इसलिए की पुराना जितना काम है वो हो
गया क्योंकि आईएफ ही इसे ना अपने आप में
बड़े ट्रिकी है उसे करने के लिए तो कई बार
क्या होता है पुराना आपका कोड और ये जो आई
एकदम से स्टार्ट हो गया इसमें आपका जो कोड
है वो डिफरेंटशिएट नहीं कर पता की पुराना
कोड कहां एड हो रहा है तो जस्ट पर सेफ्टी
परपज लोग क्या है वहां पे एक सेमी कलम लगा
देते हैं तो कई बार आप देखोगे प्रोडक्शन
कोड के अंदर और अच्छी प्रैक्टिस है लगा
देना चाहिए फी के साथ में थोड़ा एक सेफ्टी
परपज बना राहत है नहीं भी लगाओगे तो कोई
दिक्कत नहीं है जिनको समझना था वो समझ गए
ओके जी तो अब नेक्स्ट चलते हैं की आपके
पास ये रिस्पांस ए गया है ठीक है जी
रिस्पांस ए गया अभी तक कोई दिक्कत नहीं
अभी रिस्पांस को क्या करना है कौन सो लॉक
करना है तो ठीक है जी कौन सा लॉक कर लेते
हैं इतने में तो कोई दिक्कत हमारे पास है
नहीं
ओके अब क्या है तो ये कौन सा लॉक तो हमारे
पास हो गया है
ठीक है अब कौन से लॉक करते हैं पहले तो ये
कौन सा लोग हमने किया और बोला की रिस्पांस
डॉट डाटा है ये हमारे पास दे दो तो लोग
रिस्पांस डाटा
ओके ठीक है जी यह हो गया से अब जैसे हमारे
पास यह लोड होगा तो हमारे पास में ए जाना
चाहिए तो इसको हम रिफ्रेश करते हैं अच्छा
हम रिफ्रेश करेंगे तो अभी कुछ दिखेगा क्या
नहीं दिखाना तो नहीं चाहिए क्योंकि आपने
स्टेट में कुछ सेट नहीं कराया बट एक्चुअली
में कॉल होना चाहिए डाटा तो हम जाते हैं
कंसोल के अंदर और हमारे पास एरिक के अंदर
फाइव वालुज ए गए तो ठीक है डाटा कॉल हो
रहा है रिफ्रेश करते हैं तो देखा हमने ये
कुछ तीन सेकंड रुकेगा अभी आपको ग रहा है
ना 3 सेकंड काफी होते हैं हां जी तीन
सेकंड काफी होते हैं तो ऑब्वियस सी बात है
फर्स्ट टाइम कंपोनेंट डबल माउंट होता है
वो देव नहीं होता है सर प्रोडक्शन में
नहीं होता है तो हमारे पास साड़ी वालुज ए
गई है ओके जी अच्छा अब एक इंटरेस्टिंग सी
चीज देखिए यहां पे की इंटरेस्टिंग
एक्चुअली मैं काफी इंटरेस्टिंग है की मैं
क्या करता हूं यहां पे
यह लीजिए मैंने लिखा सेट प्रोडक्ट्स और
रिस्पांस डाटा मैंने यहां पर ले दिया अब
जैसे मैं इसको से करता हूं यहां पर देखते
हैं क्या होता है हमारे पास में यह हम गए
यहां पर और इसको हमने रिफ्रेश कर तो हमारे
पास में जीरो था उसके बाद ही हो गया हमारे
पास में फाइव कुछ सेकंड बात फाइव हो गया
है ठीक है ये दो बार हमारे पास कॉल हो गया
वेट करके देखते हैं कुछ और भी हो रहा है
क्या कोई और साइड इफेक्ट तो नहीं हो रहा
है नहीं कोई साइड इफेक्ट नहीं हो रहा
हमारे पास में इतना काम है ये सब तो बेसिक
कंट्रोलर्स के काम थे कोई दिक्कत वाली बात
नहीं थी अब आप कहेंगे सर काम हो गया यही
तो इंटरव्यू ने बोला था की एक डाटा फेच
करो और यहां पे ले लो आ हां जी काम हो गया
है लेकिन जो मैंने बात कारी थी की आगे
केसेस का आपने ध्यान नहीं रखा है तो आगे
केसेस किस तरह से होते हैं उसके बड़े में
देखिए अब सबसे पहले चीज तो आपने एपी ये
कॉल कर क्या गारंटी है की अप कॉल होगा और
आपको रिस्पांस मिल जाएगा अगर सपोर्ट करिए
प्रोडक्ट्स दी है अब क्या होगा इसके इसमें
ये लीजिए
यह कैसे तो आपने हैंडल नहीं कर क्योंकि अब
तो एरर्स प्रो अगर आप प्रॉमिस सब में ए
रहे हैं तो कैसे तो हैंडल करना ही पड़ेगा
अब डॉट दें डॉट कैच लगाते तो ठीक है बट
मैं तो चाहता हूं यहां से कोड आगे ही नहीं
बड़े जब तक मुझे रिस्पांस नहीं मिल रहा है
तो ये कैसे भी हैंडल करना ही पड़ेगा तो
यहां पे अच्छा एक ट्रिक बताता हूं आपको
छोटी सी वी एस कोड की आप ये क्या करिए
सबको सिलेक्ट कर लीजिए क्योंकि इसको एक
ट्री कैच में आपको आ रेप करना पड़ेगा
ट्राई कैच के अंदर तो किस तरह से इसको कर
सकते हैं देखिए बहुत ही आसन है वे एस कोड
में क्या है स्पेशली आप इसको सिलेक्ट कर
लीजिए ना कोई कट करना ना कुछ और सीधा यहां
टाइप करना स्टार्ट कर दीजिए ट्राई कैच ये
सेकंड वाला चाहिए जैसे इंटर करेंगे
ऑटोमेटेकली वो कोड आपके ट्रब्लॉक में चला
जाता है और कैच यहां पे अपने पास एड हो
गया है अब कैच के अंदर क्या करना है कैच
के अंदर क्या करना और किस तरह से देखिए
एरर्स हैंडल करने आए हैं ना तो एरर्स ना
यूजुअली स्टेट में रखें जाते हैं ये
फर्स्ट कैसे है आपका जो आपको एक्चुअली में
इंटरव्यू में रखना भी चाहिए तो ये हमारे
पास में हो गया एरर और सेट एरर इनिशियली
जो एरर है वो कुछ भी नहीं है तो आपके पास
एरर जो है वो है जल अभी हमारे पास में कोई
एरर नहीं है अगर की यहां पर एरर ए गया है
आपके पास में तो सबसे पहले क्या करो की आप
सेट एरर को यहां पे उसे करो और हम कोई एरर
मैसेज वगैरा नहीं देंगे वैसे तो देना
चाहिए था बट उसके लिए कुछ और उसे कर लेंगे
अभी तो हम यहां पे ट्रू उसे कर लेते हैं
की हां एरर आया ठीक है जी अब एरर आपके पास
आया है लेकिन ये एरर तो ट्रू हो गया कभी
आपने दोबारा से रिक्वेस्ट कॉल कारी या कुछ
भी कारी तो वापस से प्रॉब्लम हो जाएगी
क्योंकि आपने कभी इसको जल किया ही नहीं है
कोई ऐसा कोड ही नहीं है जिसको ट्रू के बाद
इसको वापस से फॉल्स कर रहा हूं तो जब भी
आप इस तरह का ट्राई कर रहे हैं की दोबारा
से कोई रिक्वेस्ट हो रही है तो हमेशा सबसे
पहले आके आप सेटर को फॉल्स कर दीजिए हो
सकता है बाय डिफॉल्ट पहले से फॉल्स हो
लेकिन हो सकता है ना ट्रू भी हो चुका हो
तो ये भी एक एचसीएस जो आपको ध्यान रखना
चाहिए अच्छा एरर तो हो गई बात लेकिन इस
एरर से फायदा क्या हो रहा है कुछ हुआ तो
है नहीं है एरर्स तो अभी भी ए रही है तो
यहां पे सब कुछ हो गया है लेकिन यूजर को
भी तो दिखाना पड़ेगा ना की हमारे पास एरर
आई है तो आपके पास ये कई केसेस में हैंडल
होता है एक सबसे इजी कैसे है की आप क्या
करो सिर्फ एक आईएफ एरर वाला कैसे हैंडल कर
लो और रिटर्न कर दो की समथिंग वेट रंग तो
हमारे पास क्या आप देखिए समथिंग वेट रंग ए
गया है हमने रिफ्रेश कर और समथिंग वेट रंग
ए गया क्योंकि ये पे नहीं हो रहा है अगर
एरर है तो ही तो ये वाला कोड ब्लॉक रन
होगा वरना तो ऑब्वियस सी बात है ये वाला
कोड ब्लॉक रन होगा तो ये भी एक तरीका है
और तरीका भी बताऊंगा आपको कैसे हैंडल करते
हैं सही से भी हैंडल कर लेते हैं एक बार
प्रोडक्ट्स हमारे प्रोडक्ट्स ए रहे हैं
क्या आ तो देखिए ये थोड़ा सा इसको रिफ्रेश
करके देखते हैं अभी हमारे पास कुछ नहीं है
और इसके बाद कुछ टाइम बाद हमारे पास ये
फाइव ए गया है ठीक है जी तो ये काम हो गया
हमारे पास में ओके ये तो वो कैसे है
एन जब हमारे पास वैल्यू है लेकिन एक कैसे
यह भी तो है की
उप्स कहां पर चला गया हां जी एक कैसे
हमारे पास ये भी तो है की जब हमारे पास
डाटा कुछ आया ही नहीं है और थोड़ी देर बाद
डाटा ए रहा है तीन सेकंड काफी लंबा है ना
जी आ तो वो लोडिंग वाला कैसे भी तो हैंडल
करना है की हमारी रिक्वेस्ट गई है थोड़ा
इंतजार करो रिक्वेस्ट आई होगी तो वो कैसे
भी एक्चुअली मैं आपको हैंडल करना होता है
तो वो भी बहुत जरूरी कैसे है जिसको बोलते
हैं हम लोडिंग वाला कैसे यहां डाटा लोड हो
रहा है तो सेट लोडिंग स्टार्टिंग में
हमारे पास क्या है देखिए अब आपके ऊपर
डिपेंड करता है की किस तरह से आप स्टार्ट
कर रहे हैं देखिए मैं सेट लोडिंग को अभी
फॉल्स ले रहा हूं उसे केसेस बेसिस पे काम
होता है तो देखिए यहां पे जैसे मैं आया
जैसे रिक्वेस्ट कारी मैंने तो मैं सबसे
पहले क्या करूंगा ये जो सेट लोडिंग है
इसको मैं ट्रू कर दूंगा की देखो लोड हो
रहा है डाटा अब डाटा लोड हो चुका है आपके
पास में तो हम क्या करते हैं डाटा जब आपका
लोड हो चुका है तो उसके बाद में आप सबसे
और में जाके जो आपका रिस्पांस रिस्पांस सब
हो गया है अब लोडिंग को आप कैंसिल कर दो
ये लोडिंग जो है जल है आप कुछ लोड नहीं हो
रहा है जो लोड होना था हो गया एरर के अंदर
भी आपके एरर ए गए हैं तो उसके बाद आपकी
लोडिंग वगैरा फॉल्ट कर दो और यह हो गया
ऐसे आप जैसे अगर प्रोमाइज के अंदर आप बहुत
साड़ी मल्टीपल रिक्वेस्ट अगर आप कर रहे हो
क्योंकि डॉट दें डॉट दें डॉट दें करके
मल्टीपल प्रॉमिस कर सकते तो प्रॉमिस का भी
एक फाइनली होता है अल्टीमेट प्रॉब्लम्स आ
वो एग्जीक्यूट होता ही होता है पहले आपके
प्रॉमिस वन है तो उसे केसेस में उसको भी
आप फॉल्स कर दीजिए तो डिपेंड करता है उसे
कैसे आप कैसे कोड हैंडल कर रहे हो सही गलत
कुछ नहीं है यहां पे तो इस कैसे में आप
क्या कर सकते हो एक और कोड ब्लॉक यहां पर
आप दाल सकते हो की हमारा लोडिंग अगर डाटा
हो रहा है देखिए एरर ए गया तो यहां हैंडल
कर लिया अगर एरर नहीं है लोडिंग आपके अंदर
कोई डाटा है वहां पे ये लोड हो रहा है
डाटा तो हम यहां पे इसको ये रिटर्न कर
देंगे अब जैसे ये फॉल्स होगा तो ऑब्वियस
सी बात है ये तो हमें पता है ना की जैसे
स्टेट के अंदर कुछ चेंज होगा पूरा
कंपोनेंट दोबारा से माउंट होता है रेंडर
होता है रेंडर मतलब ये पूरा का पूरा सोर्स
कोड दोबारा से चलेगा तो इसको से कर लेते
हैं अब देखिए हमारे पास स्टेट हैंडल हो गई
है ये हमारे पास लोडिंग हुआ देखिए कितने
आराम से लोडिंग हुआ उसके बाद आपका डाटा जो
ए रहा है आना था वो ए गया है अब आपके पास
फाइव यहां पर वैल्यू ए गई क्या डाटा ए रहा
है उसे समय फर्क नहीं पड़ता डाटा ए गया बस
बात खत्म अच्छा ये कैसे भी हैंडल कर लिए
अगर यहां पे कुछ एरर्स है तो देखिए यहां
पे हमने लोड कर एक सेकंड के लोडिंग आया
उसके बाद हमें पता है वो 44 उसने तुरंत
रिटर्न कर दिया और हमारे पास वालुज ए गई
है तो ये कुछ केसेस होते हैं हमारे पास
में अब ये जो चीज है ना एक्चुअली मैं ये
बहुत ही ज्यादा आम कैसे है ऐसा नहीं की
मैंने कुछ स्पेशल बताया जो भी कोई
प्रोडक्शन में कोड लिख रहा है कुछ इस तरह
का उसको सबको पता है की ये तो देखो करना
ही करना है
अब मैंने यहां पर इसको प्रोडक्ट लिखा है
कोई इसको डाटा लिखना है जैसे भी जेनेरिक
जैसे जिसको बनाना हो बना लेट है अच्छा ये
इतना ज्यादा आम और इतना
की एक्चुअली में कई लोग इसको ऐसे अलग से
हक बना लेते हैं हां जी बताता हूं कैसे ये
जो कोड है जहां से हमने प्रोडक्ट सेट एरर
लोडिंग ये सब कर है इसको उठाइए और जितना
ये पूरा उसे इफेक्ट वाला हक है इस पूरे को
उठा लीजिए कट कर दीजिए तो उसे इफेक्ट से
लेक जितना था वो सब हमने उठा लिया यहां से
अच्छा उठाने के बाद अब क्या करते हैं आप
एक नीचे फंक्शन बना लीजिए नीचे बना लीजिए
किसी और फाइल में बना लीजिए जहां पे बना
ये उसे स्टेट वगैरा ये सब तो लेनी पड़ेंगी
रिएक्ट के तो हम इसको बोल देते हैं कौन
इसको बोलते हैं कस्टम रिएक्ट क्वेरी
है अब कस्टम रेट क्वेरी क्या है यह एक
सिंपल फंक्शन है यह लीजिए अपना फंक्शन ए
गया यह फंक्शन एक पैरामीटर एक्सेप्ट करता
है क्यों एक्सेप्ट करता है वो भी बताता
हूं पहले इंटर करो और सर का सर कोड पेस्ट
कर दो ये तो हो गया हमारा कोड आज आईटी इस
कॉपी और पेस्ट ठीक है जी इतना काम तो हो
गया अब मैं ये क्यों का रहा हूं की
एक्चुअली में क्योंकि जेनेरिक फंक्शन
बनाना ना तो एपीआर रिक्वेस्ट सिर्फ एपी
स्लैश प्रोडक्ट पे थोड़ा ना डॉग है प्यार
रिक्वेस्ट तो किसी पे भी डॉग तो हम यहां
से हटाते हैं अपनी ये जितनी भी है इसको और
इसको बोल देते हैं हमारा यूआरएल पाठ जो भी
यूआरएल पे आपको क्वेरी करनी है गेट की आप
यहां पे दे दीजिए तो यहां पे एक्सेप्ट भी
तो करनी पड़ेगी यूआरएल पाठ को तो ये हमारा
यूआरएल पाठ एक्सेप्ट कर लिया तो वही सर
काम हो रहा है आज आईटी इस और और में क्या
करना है ये जो प्रोडक्ट्स हैं अरे हैं और
लोडिंग है इसको आप रिटर्न कर दो बस इतना
ही काम है तो ये हमने क्या कर यहां पे ए
गए जब सर काम हो चुका था और हम क्या करते
हैं रिटर्न कर देते हैं अब आपके ऊपर है
देखिए की आप उसको ऐसे ऑब्जेक्ट रिटर्न
करते हो या फिर आप ऐसे रिटर्न करते हो
आपके ऊपर है अलग-अलग उसे कैसे हैं अलग-अलग
डिजाइन में क्या अनाजम है सबके अब ये आपने
इस तरह से अगर रिटर्न कर दिया है
तो आप क्या देखोगे की यहां पर आपको ज्यादा
कुछ करना नहीं है ये जो अपना मेथड है
कस्टम रेयर रिएक्ट क्वेरी इस मेथड को कॉल
करना ये लीजिए कर दिया और इसके अंदर जो
पैरामीटर है वो हमें पास करना है स्लैश
एप्स / प्रोडक्ट
स्लैश एप्स / प्रोडक्ट्स वह बस पास कर
दीजिए तो हो गया काम अब इससे रिटर्न में
क्या मिलेगा ऑब्वियस सी बात है फंक्शन है
अरिद रिटर्न कर रहा है तो इसको बोल दीजिए
कंस क्या-क्या रिटर्न कर रहा है आपके पास
वो आप देख लीजिए अब देखिए आपके ऊपर डिपेंड
करता है और क्या क्या रिटर्न कर रहा है
किस तरह से रिटर्न कर रहा है और वो सब है
आपके ऊपर है मेरे को पता है की एक ही है
तो ये प्रोडक्ट रिटर्न करता है सेकंड
मैंने एक एरर भेजो है वहां से उसे मेथड से
और एक लोडिंग की स्टेट भेजी है और बस इतना
ही है अब इसको मेथड को हमने नीचे कॉल कर
ऊपर कॉल कराया बात तो एक ही है वही सर
लोडिंग का डाटा होगा इसको हम रिफ्रेश कर
लेते हैं और कोड तो वही काम करने वाला है
अब ये जो आपने काम किया है ना एक्चुअली
में क्या आपने सबको एक कस्टम मेथड में बना
लिया है और बड़े बेसिक है क्योंकि जेनेरिक
केसेस हैं ये तो मैंने सिर्फ आपको तीन
कैसे दिखाएं अभी और भी केसेस में आपको
दिखाऊंगा अपने चर्चा अभी थोड़ी सी करेंगे
ज्यादा नहीं बट केसेस और भी हो सकते हैं
जैसे एक कैसे मैंने आपको बताया की हो सकता
है एक इनपुट फील्ड हो हर एक लेटर टाइप
करने पर कॉल हो रही है अब हो अब इतनी ईपे
कॉल तो नहीं चाहिए वही रेस कंडीशन अच्छा
अगर आपने रेस कंडीशन वाला नहीं देखा
वीडियो अपलोड किया है उसको देखिएगा तो कई
बार क्या होता है मल्टीपल एपी कॉल चली गई
है अब मुझे तो सब का रिस्पांस चाहिए नहीं
मुझे तो सिर्फ लास्ट वाली का रिस्पांस
चाहिए बाकी सब को आप कैंसिल कर दो मुझे
उसका डाटा दो ही मत तो रेस कंडीशन हो जाति
है या फिर आप एप्स में पढ़ोगे और दे
बाउंसिंग अब देखिए देवों सिंह लोग कहते
हैं की ये तो रिएक्ट का कॉन्सेप्ट है ही
नहीं ये बेसिक एपी कॉल का कॉन्सेप्ट है
रिएक्ट में भी है यह कोर्स जावास्क्रिप्ट
में भी है हर जगह है क्योंकि मल्टीपल एक
ही चीज को जा शक्ति है मुझे मल्टीपल का
रिस्पांस नहीं चाहिए मुझे सिर्फ एक ही का
रिस्पांस चाहिए या मल्टीपल आपने पुरानी
ओल्ड क्वेरीज अलग भेज दी है उसका यूजर अब
कुछ करेगा ही नहीं जैसे सपोज करिए आप सर्च
कर रहे हैं एप्पल तो आपने फ्लिपकार्ट पे
एप्पल डाला है तो मुझे जो ए के साथ क्वेरी
गई है पी के साथ गई है पी के साथ गई है ल
के साथ ये मुझे उसका कुछ नहीं करना है वो
रिस्पांस अगर सर्वर मुझे दे भी देता है तो
मेरे को ही काम करनी है उसको गरबेज वाली
है वो मेरे लिए मेरे लिए जो फाइनली एप्पल
लिखने के बाद यूजर ने हिट कारण इंटर उसका
रिस्पांस मेरे पास आना चाहिए और यही सारे
कॉन्सेप्ट आपके रेस कंडीशन
बहुत सारे कॉन्सेप्ट्स है ये तो ये सब काम
में आते हैं तो अभी हम चलते हैं की ठीक है
इतना काम तो हमारे पास हो गया है ये तो
आपको कॉन्सेप्ट समझ में ए गया अच्छा आपको
रिएक्ट क्वेरी के भी थोड़े दर्शन कर दीजिए
है तो हम यहां पर जाते हैं रिएक्ट क्वेरी
तो आप देखेंगे रिएक्ट क्वेरी सॉलिड
क्वेरीज वेल क्वेरी
तो ये एक्चुअली मैं यही सब काम है अच्छा
यहां पे अब ऑफिशल रिएक्ट क्वेरी कोर्स भी
है चलिए अच्छी बात है एग्जांपल्स कुछ हम
देख लेते हैं इसके एन किस तरह से रिएक्ट
क्वेरी के एग्जांपल हैं तो आपको देखेंगे
हां जी और रिएक्ट क्वेरी क्लाइंट्स हैं
इनको स्किप करते हैं और इस सैंडबॉक्स को
हटाते हैं तो आप यहां पर देखेंगे ना तो
आपको इसी तरह का दिखेगा देखिए स्टेटस डाटा
एरर इस फेचिंग पैच हो गया है नहीं हो गया
है लोडिंग का स्टेट है नहीं है और इसी के
बेसिस पे देखिए सब कुछ हैंडल हो रहा है तो
कुछ ऐसी लाइब्रेरीज होती है जो ये हमने
इतनी मेहनत कारी है ना ये करनी नहीं पड़ती
है आप सिर्फ इसको इंस्टॉल कर दो क्वेरी
क्लाइंट को और उसे पोस्ट के अंदर आप इसको
पोस्ट को सीधा का सीधा उसे कर लो आपको कई
जगह दिखेंगे इस तरह के ये एग्जांपल्स जो
रिएक्ट क्वेरी रेड क्वेरी का भी बेसिकली
यही काम है अगर आप बेसिक देखोगे तो इतना
ही काम है तो क्वेरी की इस क्वेरीज पैरेलल
क्वेरीज जैसे ये हो गई हमारी पैरेलल
क्वेरीज किस तरह से है तो बेसिकली काम यही
करते हैं क्वेरी फंक्शंस
देखोगे इसमें भी मल्टीपल चीज आपको दे देते
हैं की हम मल्टीपल चीजों का टेक केयर कर
लेंगे एक साथ तो यह लाइब्रेरी में ऑब्वियस
सी बात है हमने तो बड़ा बेसिक सैलरी आई
उसे कैसे बट आपके पास कई है पैग्नेटिड
क्वेरीज हैं किस तरह की क्वेरीज होती है
हमारे पास में तो मल्टीपल क्वेरीज हैं
क्वेरीज बेसिक क्वेरीज वगैरा आप देखोगे तो
एक काफी अच्छे से हैंडल करते हैं रिएक्ट
क्वेरी के अंदर आ वही देख लीजिए से
एग्जैक्ट इस लोडिंग इस एरर डाटा एरर वो ये
साड़ी चीज ए गई हम क्या कर रहे हैं यू
स्क्वायर इसे तू डू उसके अंदर फेच तू डू
लिस्ट तो वही बेसिक है हमारा और बाद में
ये इसी तरह से हैंडल कर रहे हैं इस लोडिंग
इस ट्रू ये इस तरह से हैंडल हो रहा है तो
एक कैसे तो ये हो गया अब आपको एप्स
प्रोफेशनली हैंडल करने ए गई है अच्छा एक
कैसे तो ये हो गया
अब मैं क्या करता हूं इसको पूरे को वापस
से लेक चलते हैं आपके पास क्योंकि यहां से
तो आपको समझ में तो ए ही गया है इसको लेक
चलते हैं कट करते हैं ये फंक्शन को यही
रहने देता हूं मैं और इसको हम कर देते हैं
कमेंट क्योंकि ये चाहिए ही नहीं है अब और
यहां पर आकर वापस से कोड पेस्ट कर देते
हैं ताकि हमारा ये सर कोड रहा है क्योंकि
थोड़ी सी और मुझे चर्चा करनी है एक्चुअली
में एन वहां पे भी कुछ इंटरेस्टिंग टॉपिक
हैं उनको मैं वहां अलग फंक्शन में नहीं
यही डिस्कस करना चाहता हूं क्योंकि
एटलिस्ट बेसिक तो समझ में आया ओके आ
एक्जेक्टली से काम कर रहा है हमारा वे तप
एक रिफ्रेश करके देख लेते हैं समथिंग वेट
रंग ये भी ठीक है और समथिंग वेट रंग इसलिए
क्योंकि अब आपको पाठ चाहिए तो पाठ के लिए
आपको यहां पे यूआरएल पाठ की जगह एक पाठ
लगेगा प्रॉपर जिसका है स्लैश अपस्लैश
प्रोडक्ट्स से करते हैं लोडिंग हो रहा है
ओके जी और 5 प्रोडक्ट्स ए गया ठीक है अभी
तो हमारा कोड आगे आईटी इसे है जितना हमने
बनाया था वो तो समझ में ए गया है अच्छा कई
जगह आपको क्या मिलेगा हो सकता है आपके जो
इस कंडीशन से इस तरह से हैंडल ना की गई हो
कोई बड़ी बात नहीं है बड़ा ही बेसिक ऐसा
कॉन्सेप्ट है कई बार क्योंकि हम यहां पर
जो एक्चुअली में एडवांटेज ले रहे हैं ना
वो इस रिटर्न की शब्द का ले रहे हैं
क्योंकि हमें पता है फंक्शन में रिटर्न
लिखा ना तो मतलब सब बाहर बड़ी बेसिक
कंप्यूटर साइंस की अपना लैंग्वेज की बेसिक
है इसमें कुछ नहीं है ठीक है अब यहां पे
हमने क्या वो सारे कंडीशंस हमने हटा दिए
क्योंकि मैं आपको ये बताना चाहता हूं की
कई बार ना ऐसे केसेस होते हैं जब आप इस एक
ही रिटर्न के अंदर इन वालुज को आप हैंडल
करते हो अच्छा एक ही वैल्यू के अंदर किस
तरह से हैंडल करोगे हां हां जी वो भी कर
सकते हैं कोई इसमें बड़ी बात नहीं है हम
आते हैं यहां पे प्रोडक्ट्स के बाद तो
यहां पे आप कंडीशनल रेंडरिंग कर सकते हो
जैसे सपोज करो यहां पे आपने लोडिंग के साथ
कंडीशनर रेंडरिंग कर ली की लोडिंग है तो
h1 के अंदर आपने लोडिंग दे दिया तो अब
मैंने आपको एक सिंटेक्स बताया था ट्रू और
जल वाला तो ये अगर ट्रू होगा तो ही ये
वाला कंपोनेंट लोड होगा अगर ये तो हमारे
पास ए की वैल्यू थी अगर हमारे पास यहां पे
मल्टीपल लाइंस होती है कुछ होती है उसको
बैलेंस में रेप कर देते हैं हम इस तरह से
तो भी वही बात होती है अभी भी वही बात है
तो अगर आपके पास मल्टीपल वालुज है तो इस
तरह से दो फ्रेगमेंट भी देना वहां पर ये
जो फ्रेगमेंट है वो भी देना और अगर आपको र
रोर वाला कैसे हैंडल करना है तो वही हमारा
ये एरर वाला कैसे हैंडल कर लेते हैं
समथिंग वेट रंग तो इस तरह से भी आप दे
सकते हो तो डिपेंड करता है आप किस तरह से
एरर्स हैंडल कर रहे हो या किस तरह से क्या
वालुज हैंडल कर रहे हैं यहां पे हम क्या
करते हैं इसकी जगह हम लगाते हैं थोड़ा सा
हमारा बेसिक
यहां पर
ओके सजेशन नहीं ए रहे
ओके
तो इस तरह से हैंडल होता है अलग-अलग केसेस
हैं ऐसा कुछ नहीं है अब यहां पे हम इसको
एक बार रंग भी कर के देखते हैं हां ये कई
बार टेस्टिंग करनी पड़ती है इसका कोई इलाज
नहीं है समथिंग वेट रंग भी ए रहा है और
पुराने प्रोडक्ट की जो स्टील डाटा क्योंकि
उसको रिफ्रेश हमने कभी किया ही नहीं था
ठीक है वो भी चल जाएगा ओके चलिए इतना काम
तो हो गया अच्छा अब एक हम जरूरी काम और
करते हैं जो की बड़ा इंटरेस्टिंग काम है
हम क्या करते हैं ये सब तो हो गया एरर्स
तो हो गया सर लोडिंग स्टेट वगैरा हो गया
इसके ऊपर हम क्या करते हैं की इनपुट फाइल
लगा लेते हैं ठीक है
एक लगाते हैं हम यहां पे इनपुट फील्ड इस
तरह से नहीं
ये लीजिए हमारा इनपुट फील्ड टाइप टेक्स्ट
प्लेस होल्डर और इसके अंदर वालुज भी कुछ
एड कर देते हैं अब ओबवियस सी बात है वालुज
एड करेंगे तो एक और हमें स्टेट चाहिएगा
क्योंकि कुछ फायर वगैरा करना पड़ेगा उसे
बेसिस पे तो हम यहां पे एक सर्च नाम से रख
लेते हैं
और इनिशियल वालुज की एम्टी है ठीक है अब
यहां पर आते हैं
इसके अंदर आते हैं किसकी वैल्यू क्या
रहेगी सबसे पहले तो वैल्यू जो रहेगी सर्च
रहेगी और चेंज होने पर क्या होगा जो भी
इसके अंदर जो फूल है
उसको हम सेट सर्च को उसे करते हुए हमारी
स्टेट के अंदर एड कर रहे हैं ठीक है जी आ
तो इनपुट फील्ड आया क्या छोटा सा ही आया
बट ठीक है अब इनपुट फील्ड हो तो क्या हो
अभी तो देखिए इनपुट के अंदर आपका जो मां
करें लिखिए कोई फर्क ही नहीं है व्यू
लिखिए शब्द लिखिए क्योंकि किसी के साथ
अटैक नहीं है अटैक करने के लिए क्या कर
सकते हैं हम अटैक करने के लिए हम थोड़ा सा
हमारा जो यूआरएल है उसको चेंज कर सकते हैं
किस तरह से चेंज करेंगे प्रोडक्ट्स के बाद
आपको पता है हमें क्या करना था क्वेश्चन
मार्क लिखना था और इसको बनाना था हमें
सर्च आप के से बनाना चाहे तो वो भी कर
सकते हैं सजेशन चलिए बढ़िया सजेशन ए गया
तो हमारा यूआरएल बन गया है अभी मैं
डायरेक्टली देखूंगा तो इसमें कोई चेंज
नहीं आएगा क्योंकि अभी आप रिफ्रेश करके
देखेंगे तो क्वेरी के अंदर कुछ गया ही
नहीं है तो उसने सारे रिटर्न कर दिया अब
अगर क्वेरी के अंदर कुछ वैल्यू जाए जैसे
की सपोर्ट करिए इसके अंदर आपकी वैल्यू जाए
वह हमारा डिफॉल्ट वैल्यू है तो अब इसको
रिफ्रेश करेंगे तो आप क्वेरी के अंदर हर
बार एक वैल्यू जा रही है जो की वुड है तो
आपको एक ही अरे रिटर्न में मिल रहा है
क्योंकि वही बेसिक काम है ठीक है जी चलिए
इतना तो समझ में आया एम्टी कर देते हैं
इसको अब क्या मैं चाहता हूं की एक्चुअली
में स्टेट के अंदर ये वालुज आए तो कोई
तरीका है की ये उसे इफेक्ट कॉल हो सकता है
बार-बार जब मैं सर्च वालुज चेंज कर रहा
हूं तरीका तो हो सकता है क्या तरीका हो
सकता है की आप यहां पे एक डिपेंडेंसी के
अंदर सर्च दे दो ठीक है जी ये भी कर लेते
हैं सर्च दिया तो अब हम क्या करते हैं
सबसे पहले जाते हैं नेटवर्क अप में हां
कंसोल मैं तो काफी देर से है नेटवर्क के
अंदर हम जाते हैं और इसको क्लीन कर लेते
हैं तो अभी हमारे पास फाइव प्रोडक्ट आए अब
हम क्या करते हैं टाइप करते हैं पी ल ए और
देखिए
इसके अंदर ऑब्वियस सी बात है रेस कंडीशन
लगी हुई है और सबके साथ साथ एक वैरिफ़ाई
हो रही है सब का रिस्पांस आपको मिला है
फाइनली जो अपडेट रिस्पांस मिला है वह आपको
इसको मिला है जो की मिलन भी चाहिए था
लेकिन इनके रिस्पांस आपने किया क्या कुछ
भी नहीं किया तो यहां पे एक्चुअली मैं बात
आई है जो हमें दिखाई नहीं दे रहा लेकिन
हमारी एप्लीकेशन की परफॉर्मेंस डॉ हो रही
है उन तीन क्वेरीज को आपने हैंडल कर तीन
बार यूआई अपडेट कर है तो ये छोटी-छोटी जो
बिहाइंड डी सीन है ना ये ओवर डी टाइम बहुत
ज्यादा इंपॉर्टेंट हो जाता है अभी तो
सिर्फ पांच वालुज ए रही है इमेजिन करो जो
50 लाख वालुज आएगी तब वहां पे दिक्कत हो
जाति है 5 लाख वालुज आएगी तब वहां पे
प्रॉब्लम हो जाति है तो सॉल्यूशन कैसे
करें हां जी सॉल्यूशन तो करना पड़ेगा
क्योंकि अगर इस तरह से चलेगा तो नहीं काम
चलेगा हमारा तो एक्चुअली में उसके पास ना
बहुत सारे ऐसे टूल्स हैं अंदर डी बेल्ट
इसलिए मैं कहता हूं मुझे ज्यादा पसंद है
जो लोग फेच के दीवाने हैं ठीक है अच्छी
बात है फेच बेसिक में काम आता है
एक्सक्यूज बहुत ज्यादा पावरफुल लाइब्रेरी
है रिएक्ट क्वेरी ऑटोमेटिक के लिए काम
आपके लिए कर देती है लेकिन एक्सक्यूज के
थ्रू अगर आपको करना है तो एक्चुअली में
हमें क्या बनाना पड़ेगा यहां पे एक
सिंटेक्स होता है नया कुछ सीखे यहां पे तो
हम क्या करेंगे सबसे पहले एक बनाना पड़ता
है आपको कंट्रोलर
जिसका नाम है अवार्ड कंट्रोलर यह अवार्ड
कंट्रोलर जो है ना वो क्या करता है पुरानी
रिक्वेस्ट को अपने आप कैंसिल कर देता है
अब अपने आप तो नहीं करता है थोड़ा सा कोड
यहां पे और लगता है तो वहां पे किस तरह से
करना पड़ता है की ये जो कंट्रोलर है ना ये
साथ में भेजना पड़ता है आपको इस एक्सस डेट
जो भी रिक्वेस्ट भेज रहे हैं गेट पोस्ट
वगैरा वो किस तरह से है आप देखेंगे यहां
पे आपके पास और ऑप्शंस हैं की देखिए उसने
बोला की ठीक है प्रॉमिस वगैरा आपको देता
है यूआरएल आपको चाहिए लेकिन आप कंफीग्रेशन
भी भेज सकते हैं ये पढ़ने वाली चीज
डॉक्यूमेंटेशन में जाके एक्स सी उसके तो
यहां पे आप एक साथ में ऑब्जेक्ट भेज सकते
हैं जिसके अंदर आप और भी चीज भेज सकते हैं
जैसे पोस्ट रिक्वेस्ट भेज रहे हो तो यही
पे डाटा भी भेज सकते हो हेडर्स भी भेज
सकते हो बहुत साड़ी चीज आप भेज सकते हो
यहां से तो मैंने क्या मुझे क्या भेजना है
एक सिग्नल भेजना है यहां पे हां जिसका नाम
सिग्नल ही होता है डॉक्यूमेंटेशन में
मेंशंड है उसे सिग्नल के अंदर क्या भेजना
है आपको ये कंट्रोलर डॉट सिग्नल भेजना है
अच्छा कंट्रोलर जो है ना ये कंट्रोलर है
इसके अंदर से हमने सिग्नल भेज दिया है ओके
ठीक है अब क्या होगा जितनी भी रिक्वेस्ट
है सब आपके पास ये कंट्रोलर के अंदर पूरा
एक सर्किट बन रहा है जिसके पास सर का सर
इनफॉरमेशन है की कौन सी रिक्वेस्ट कब गई
है क्या गई है अब प्रॉब्लम क्या आई है की
इस तरह से आप कर तो लोग लेकिन एक यहां पे
अच्छा इंतजाम आपको ये करना पड़ता है की ये
जो सिग्नल है ना ये क्या करता है पुरानी
रिक्वेस्ट जितनी भी है अगर नहीं रिक्वेज
से यूआरएल पे हिट हुई है तो उसको
ऑटोमेटेकली कैंसिल कर देता है लेकिन उसको
सेंड करता है इस कैच के अंदर हां ये एक
थोड़ा सा इशू है तो यहां पे इसको
प्रॉपर्ली हैंडल अगर नहीं करोगे ना तो
इश्यूज आते हैं तो क्या करो यहां पे एक
बेसिक सेफ कैसे लो और आप क्या बोलो एक्स
सी उसकी एक प्रॉपर्ली एक रिक्वेस्ट होती
है जिसको बोलते हैं इस कैंसिल एरर हांजी
ये हैंडल करना होता है यहां पे आप इसको
कौन सा लॉक कर लो चाहे तो आपका मां करें
तो रिक्वेस्ट कैंसिल डायरेक्ट मैसेज और
यहां पे हम क्या करते हैं इसको सिंपली
रिटर्न भी कर लो चलो तो अब क्या होगा
ऑटोमेटेकली आपकी मैसेज रिक्वेस्ट वगैरा वो
सब पुरानी वाली कैंसिल हो जाएगी नई वाली
आपको मिल जाएगी और आप यहां पर रिटर्न भी
कर रहे हो की मुझे और कुछ नहीं करना है तो
इसको बस एक सेट कर दो यहां पे अच्छा यहां
पे सिर्फ इतना ही नहीं करना होता है एक और
काम करना होता है देखिए इस तरह के जब
सोलर्स वगैरा माउंट होते हैं तो अभी आपका
यह तो सेकंड स्टेप हुआ है फर्स्ट स्टेप तो
कंट्रोलर बनाना है मतलब ज्यादा इस टाइप हो
गया फर्स्ट स्टेप कंट्रोलर बनाना है सेकंड
स्टेप उसे कंट्रोलर के सिग्नल को साथ में
सेंड करना है थर्ड स्टेप आपके उसे xc² जो
कैंसिल हुई उसके एरर को हैंडल करना है
लेकिन सिर्फ इतने से काम नहीं होता है
आपको यहां पे भी आना पड़ेगा ये ये क्या
होता है आप एक हर एक यूजर फैक्ट के अंदर
एक आप रिटर्न मेथड भेज सकते हो ये क्या
होता है इसको क्लीनअप मेथड भी बोलते हैं
कई इंटरव्यूज में पूछा जाता है की हां
क्लीनअप मेथड है कौन सा है तो यहां पे एक
आप क्लीन अप मेथड एन इस तरह से दे सकते हो
अभी क्लीन अप मेथड है क्या कुछ भी नहीं जब
कंपोनेंट आपका माउंट हुआ है तो ऑब्वियस सी
बात है अनमाउंट भी होता है या फिर उसका जो
काम है वो खत्म भी हो जाता है पूरा तो इस
टाइम पे आप जो भी करवाना चाहते हो या मां
लीजिए आपने किसी ऑन क्लिक हैंडलर किसी पे
एक इवेंट लिस्ट लगा रखा है तो लगा हुआ है
थोड़ा ना छोड़ डॉग मेमोरी भी नाम की कोई
चीज है वरना क्रोम के अंदर बहुत हैवी लोड
पद जाएगा तो आपने अगर कोई इवेंट हैंडल लगा
रखा है तो इवेंट हैंडलर को अनबॉउंड भी तो
करोगे डिस्काउंट भी तो करोगे वहां से तो
वो सर काम यहां पे होता है
इसके बड़े में भी चर्चा करेंगे कभी और
फुर्सत में डिटेल में अभी तो यह मानो की
यहां सर का सर आपका लिखा जाता है क्लीन अप
का कोड अब देखिए क्लीन अप का कोड अगर आपको
याद हो तो मैंने यहां जावास्क्रिप्ट जो
हमने पड़ी थी सेट टाइम आउट वगैरा के अंदर
भी बताया था की ऐसा नहीं की सेट टाइमर लगा
के छोड़ दो उसको क्लीन भी करो बाद में याद
हो तो अगर आपको जो तो यहां आता है आपका
क्लीन अप का कोड तो यहां पे कुछ नहीं करना
है आपको ये कंट्रोलर लो और इस कंट्रोलर के
अंदर अबाउट कर दो की भाई जब हो गया है काम
वहां से ये री रन हो रहा है वापस से तो
पुराना वाला तो अनमाउंट हो गया अब ये
फ्रेश एक इंस्टेंस उसे इफेक्ट का अमाउंट
हो रहा है तो पुराने वाले में जब कुछ काम
ही नहीं है तो उसके रिक्वेस्ट वगैरा जो
एपी रिक्वेस्ट कॉल करें उसको भी अनबॉउंड
करो ना हटाओ ना उसको भी तो ये सर काम यहां
से कंट्रोलर डॉट से होता है यही है
प्रोफेशनली एपी को हैंडल करने का तरीका अब
क्या है हमारे पास में इसको रिफ्रेश करते
हैं तो हमारे पास में एक्चुअली में कुछ
एरर्स हैं देख लेते हैं एक बार ओके
एरर बाउंड्रीज कहां कहां पर एरर्स हैं
हमारे पास में
ओके इस नोट ए रिएक्ट डेवलपमेंट फंक्शन ओके
कहानी पे तो हमारे पास में इश्यूज आए हैं
ओके
देखते हैं कहां कहां पे है हमारे पास में
एरर है
ओके
आने तो नहीं चाहिए थे और भी देख लेते हैं
रिटर्न कंट्रोलर्स ठीक है एक बार इसको जरा
चेक करते हैं फटाफट कहां कहां पर ए रहा है
अरे वह एक बड़ा ही अच्छा एरर देखने को मिल
गया जिसके बड़े में हमने जस्ट अभी थोड़ी
देर पहले इस वीडियो में चर्चा कारी थी
एरर्स जब होते हैं ना इसे जी दिन डरना
छोड़ दिया ना देखिए एरर्स में टाइम लगता
है कई बार एक दिन दो दिन हफ्तार भी ग जाता
है जितना ज्यादा अच्छे से एरर्स को
समझेंगे ना की कहां मिस्टेक तो अपने आप
आपकी आई शार्प हो जाएगी अच्छा वहां पे हो
सकता है तो देखें यहां पे मैंने रीलोड कर
और देखा की ठीक है ज्यादा कुछ खास समझ में
नहीं ए रहा है इससे बट इतना समझ में ए रहा
है की लाइन नंबर 17 या 44 के आसपास हमारा
एरर हो सकता है चलिए रिजॉल्व करके देखते
हैं लाइन नंबर 17 में जैसे ही आया अब यहां
पे अगर आपने दो डिस्कशन हमारा देखा था की
हमने किस तरह से आईएफ ही बनाया था इसी में
कई बार क्या है मैं एक प्रिकॉशन रखना
पड़ता है तो आपको तुरंत ही हिट हो जाएगा
की हां ये वाला एरर था अगर आपको याद हो तो
मैंने आपको बताया था की कई बार क्या है की
आपकी जावा स्क्रिप्ट ये पता नहीं लगा पति
की कहां पे आपका आईएफ ही स्टार्ट हो रहा
है कहां पे है अगर पुराना कोड भी है तो
पहले हमारा कोई पुराना कोड नहीं था तो
आपने सोचा हां ये तो छोटी-मोटी बातें हैं
ऐसे तो हमने इग्नोर कर दी थी मोस्ट ऑफ डी
लोगों ने कर दी थी मुझे पता है लेकिन अब
देखिए यहां पे क्या है आपको एक यहां पे
सेमीकंव लगाना पड़ेगा अब हो सकता है कुछ
लोग कहेंगे नई-नई है यहां पे सेमी कलम लगा
हो तो ज्यादा बटर हो लेकिन प्रॉब्लम तो
वही है आज तक तो कभी नहीं लगाया था इन
लाइन पे हमने सेमी कोलोन इसीलिए कहते हैं
की इसी के साथ जो प्रोफेशनली लोग कोड
लिखने हैं उनका यहां पे एक सेमी कोलोन
आपको दिखे जाएगा और इसीलिए मैंने आपको
बताया था ठीक है से करिए और देखिए यहां पे
बैक जाइए एकदम हमारा सोर्स कोड चल रहा है
बढ़िया कोई दिक्कत ही नहीं है यहां पे ओके
तो यहां पर हमारे पास में वालुज ए गई है
चंद का प्रॉमिस
ले लिया क्या शायद ऑटो सजेशन में कुछ ए
गया होगा
एन लोग है क्या कहानी पर कौन सा लॉक करते
टाइम कुछ कर दिया होगा वह कोई बड़ी बात
नहीं हैता कोई इशू नहीं हो रहा है उससे
ओके तो अब यहां पर हम देखते हैं तो हमें
चाहिए वुड तो ये हमारे पास वुड हो गया है
वालुज तो अब देखिए वुड लिखने ही हमारे पास
एक रिस्पांस मिल रहा है और मेटल लिखने भी
हमारे पास एक ही रिस्पांस ए रहा है अब
देखिए जैसे मैंने मीत लिखा है हमारे पास
में देखिए क्वेरीज धाराधार फायर हो रही है
और रिस्पांस उनका हमारे पास ए रहा है इनके
बड़े में ना और चर्चा करनी हमारी बंटी है
क्योंकि ये तो मैंने आपको एक इंटेंशनली एक
उसे कैसे बताएं यहां पे एक्चुअली मैं ये
जो है ना की आपकी मल्टीपल रिक्वेस्ट जा
रही है और ये सब ये सब हमें एक्चुअली में
डिबाउंस करनी पड़ेगी तो डिबाउंस के बड़े
में एक सेपरेट वीडियो में हम चर्चा करेंगे
बट अभी जो हमने कहा है ना की हम यूआई के
अंदर उन सबको हैंडल नहीं कर रहे हैं ये
उसे चीज का सॉल्यूशन है किस तरह से
एक्सक्यूज के अंदर हम कंट्रोलर्स ले सकते
हैं एब्जॉर्ब करवा सकते हैं वैसे तो इनके
बड़े में जब हम एक प्रोजेक्ट वगैरा
बनाएंगे ना तब अभी तक है फोर्सफुल उसे
किया सिनेरियोस में आपको दे रहा हूं यहां
पे जो हो सकता है काम करें हो सकता है
नहीं करें नेटवर्क में जाकर देखिए किस तरह
से आपकी रिक्वेस्ट ए रही है यहां यहां पर
जैसे मेटल के अंदर हम जा रहे हैं तो मेटल
का एक रिक्वेस्ट भेजो तो अभी तो साड़ी
रिक्वेस्ट आपको जाति दिखेगी क्योंकि
फोर्सफुल इंप्लीमेंटेशन है इतना अच्छा
इंप्लीमेंटेशन है नहीं देखिए सबके अंदर जा
रहा है सबके अंदर रिस्पांस भी ए रहा है बट
एक्चुअली मैं आपका नेटवर्क ट्रैफिक जाम
काम होगा अगर इसको प्रॉपर्ली इंप्लीमेंट
करते हैं तो स्टेप्स तो वही है कंट्रोलर्स
लेना है इस तरह से बट एक्चुअली में इसके
ऊपर एक और वीडियो बंता है एक और चर्चा
बंटी है जहां पे हम प्रॉपर्ली कंट्रोलर
हैं और उसके लिए ना एक बड़ा प्रोजेक्ट
जरूरी है करेंगे उसके बड़े में भी करेंगे
बट अभी मेजर जो मेरा गोल था वो सिर्फ ये
था की मैं आपको मल्टीपल केसेस रेस कंडीशन
और इनके बड़े में बताऊं ये जो कोड हमने
लिखा है ना अभी ये एक्चुअली में हमने रेस
कंडीशन को अवॉइड करने के लिए लिखा है और
ये जो कंट्रोलर से पुराना क्योंकि देखिए
आपका माउंट होगा और आपके पास रिस्पांस
आएगा लेकिन क्या है रिस्पांस मुझे चाहिए
अपडेटेड वाला तो वो जो सीक्वेंस के अंदर
पूरा आया ना उसके लिए हमने ये वाला कंडीशन
लिखा है ये कंडीशन इसलिए नहीं लिखा है
इसमें कंफ्यूज मत होइएगा इसलिए नहीं लिखा
है की मेरी पुरानी कॉल कैंसिल हो जाए उसके
लिए हम डिबाउंसिंग का कॉन्सेप्ट उसे करते
हैं ये कोड हमने लिखा है ताकि हम रेस
कंडीशन अवॉइड कर सकें ताकि हमें सीक्वेंस
के अंदर ही मिले पहले जो रिस्पांस गया है
उसका डाटा पहले आए सेकंड वाले का सेकंड
में थर्ड वाले का थर्ड में है इसलिए आप
देखेंगे की यहां पे हमारे जो नेटवर्क
रिक्वेस्ट है वो प्रॉपर्ली रिलायबल हो
चुकी है यहां पे की देखिए जैसे मैं इसको
रिफ्रेश करता हूं एक बार
यह रिफ्रेश कर लेते हैं नेटवर्क रिक्वेस्ट
को क्लीन कर लेते हैं तो मुझे चाहिए वुड
का डाटा तो ब्लू ओ ओ दी तो गारंटीड देखिए
रिक्वेस्ट आपने भेज दी है और आपके पास
रिस्पांस यहां पे किसका पहले आया है किसका
बाद में इसकी कोई गारंटी नहीं ये जो
नेटवर्क टाइप है ये बता रहा है की
रिक्वेस्ट गई है आई है वो नहीं बता रहा है
आपको तो ये मत सोचिएगा कहानी पे भी की
मैंने आपको ये बताया की देखिए अब आपकी
पांच रिक्वेस्ट नहीं जाएगी अब एक ही
रिक्वेस्ट आएगी नहीं नहीं नहीं रिक्वेस्ट
तो अभी भी 5 हो जाएगी वो कैसे दे बाउंसिंग
में हैंडल होता है हम यहां पे जो हैंडल कर
रहे हैं वो कर रहे हैं रेस कंडीशन यानी की
जो रिक्वेस्ट पहले गई है उसका डाटा पहले
आए सेकंड गई है तो सेकंड आए थर्ड गई तो
थर्ड है तो लेटेस्ट जो मेरी रिक्वेस्ट गई
है उसका मेरे पास सबसे एंड में डेट आया है
ताकि मैं यूजर को अपडेट यूआई दिखा सुकून
तो ये हमने रेस कंडीशन हैंडल कारी है
क्योंकि मुझे पता है कई लोग यहां पे
कहेंगे की नहीं नहीं सर हमारे पास तो डाटा
सर आई ए रहा है वो सब नहीं नहीं वो दे
बाउंसिंग है वो कॉन्सेप्ट अलग है रेस
कंडीशन कॉन्सेप्ट अलग है तो एप्स के अंदर
आपने देखा किस तरह से प्रोफेशनली एपी
हैंडल होती है क्योंकि काम इसके अंदर ना
काफी हो सकता है तो बड़ा ही इंटरेस्टिंग
यह कॉन्सेप्ट है हमारा ये सब हम इसलिए कर
पे क्योंकि हमने इंटेंशनली हमारे अपार
रिस्पांस को थोड़ा डिले कर दिया पूरा आप
समझ का रहे हैं एरर के इस लोडिंग के फेस
रिक्वेस्ट कैसे भेजते हैं और ऑप्शन कैसे
भेज सकते हैं गेट रिक्वेस्ट हो पोस्ट
रिक्वेस्ट हो और हैंडल एक्सिस के बड़े में
और लेक्चरर्स बन सकते हैं किस तरह से आप
रिक्वेस्ट को इंटरसेप्ट भी कर सकते हो
उसमें एप्स किस भी हैंडल कर सकते हो तो
बहुत और प्रोफेशनली हैंडल्स होती है एपी
को बट ठीक है आज के लिए इतना ही करते हैं
कभी और फुर्सत में बैठेंगे चाय पे आपके
साथ चर्चा करने हैं तो डिबाउंसिंग वगैरा
ये वो जो भी और कुछ भी होता है उनको भी
हैंडल कर लेंगे बट मुझे लगता है की आज के
लिए ते करें ठीक है तो चलिए आज इतना ही
करते हैं और मिलते हैं आपसे अगले वीडियो
पे बेसिक मैंने स्टार्टिंग में कोई कमेंट
टारगेट वगैरा तो दिया नहीं था 200 का
टारगेट अभी दे देता हूं आपको प्लीज
कंप्लीट करवा दीजिएगा जो लोग यहां तक
देखें काफी वीडियो में मेहनत लगी है 200
का टारगेट तो प्लीज कंप्लीट कर दो इस
वीडियो में डिजर्व करते हैं इतना तो चलिए
मिलते हैं आपसे अगले वीडियो के अंदर
```

How to handle apis in reactjs
How to make custom hooks
tools and packages available to improve api handling like reacr query
In this lec, we will make our custom react query

edge cases must be kept in mind  while writing code

In this lec, we will write our own custom backend

explain blackbox api

mkdir frontend backend
❯ cd backend
❯ npm init -y
Wrote to /home/prabhanshtiwari/mywork/chai-aur-react/1. Lectures/34-Handle APIs like a pro in Reactjs | Custom react query | Axios | Race condition/code/backend/package.json:

{
  "name": "backend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}



❯ touch index.js

npm i express

add 
"type": "module",
in package.json


add script in package.json
"start": "node index.js"

backend/index.js
```
import express from "express";

const app = express();

app.get("/api/products", (req, res) => {
  const product = [
    {
      id: 1,
      name: "Wooden Table",
      price: 200,
      image: "https://images.pexels.com/photos/276583/pexels-photo-276583.jpeg",
    },
    {
      id: 2,
      name: "Office Chair",
      price: 150,
      image:
        "https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg",
    },
    {
      id: 3,
      name: "Laptop Stand",
      price: 40,
      image: "https://images.pexels.com/photos/374074/pexels-photo-374074.jpeg",
    },
    {
      id: 4,
      name: "Desk Lamp",
      price: 25,
      image: "https://images.pexels.com/photos/112811/pexels-photo-112811.jpeg",
    },
    {
      id: 5,
      name: "Bookshelf",
      price: 120,
      image: "https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg",
    },
    {
      id: 6,
      name: "Gaming Mouse",
      price: 35,
      image:
        "https://images.pexels.com/photos/2115257/pexels-photo-2115257.jpeg",
    },
    {
      id: 7,
      name: "Mechanical Keyboard",
      price: 80,
      image:
        "https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg",
    },
    {
      id: 8,
      name: "Monitor",
      price: 220,
      image:
        "https://images.pexels.com/photos/1714208/pexels-photo-1714208.jpeg",
    },
    {
      id: 9,
      name: "Headphones",
      price: 60,
      image:
        "https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg",
    },
    {
      id: 10,
      name: "Coffee Table",
      price: 180,
      image: "https://images.pexels.com/photos/276528/pexels-photo-276528.jpeg",
    },
  ];

  // http://localhost:3000/api/products?search=metal

    if (req.query.search) {
    const filterProducts = product.filter((product) =>
        product.name.toLowerCase().includes(req.query.search.toLowerCase()),
    );
    res.json(filterProducts);
    return;
    }


  setTimeout(() => {
    res.json(product);
  }, 3000);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

```

npm run start

Now, lets got to our frontend:

first, create a react app using vite

frontend/src/App.jsx:
```

function App() {
  
  return (
    <>
      <h1>Chai aur API in react</h1>
    </>
  )
}

export default App

```


Use proxy to avoid cors error:
vite.config.js:
```
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  plugins: [react()],
});

```

npm i axios

App.jsx:
```
import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {

  const [products, setProducts] = useState([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    ; (async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await axios.get("/api/products");
        console.log(res.data)
        setProducts(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(true);
        setLoading(false);
      } 
    })();


  }, [])

  if (error) {
    return <h1>Something went wrong</h1>
  }

  if(loading) {
    return <h1>Loading...</h1>
  }

  return (
    <>
      <h1>Chai aur API in react</h1>
      <h2>Number of products: {products.length}</h2>
      {
        products.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <img src={product.image} alt={product.name} height="200px" />
          </div>
        ))
      }
    </>
  )
}

export default App
```
this is so much common or generic that people made a hook for this. 

Updated App.jsx:
```
import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {

  const { products, error, loading } = customReactQuery('/api/products')

  if (error) {
    return <h1>Something went wrong</h1>
  }

  if (loading) {
    return <h1>Loading...</h1>
  }

  return (
    <>
      <h1>Chai aur API in react</h1>
      <h2>Number of products: {products.length}</h2>
      {
        products.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <img src={product.image} alt={product.name} height="200px" />
          </div>
        ))
      }
    </>
  )
}

export default App


const customReactQuery = (urlPath) => {
  const [products, setProducts] = useState([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {

    ; (async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await axios.get(urlPath);
        console.log(res.data)
        setProducts(res.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError(true);
        setLoading(false);
      }
    })();


  }, [])
  return { products, error, loading }
}
```

Race condition
Debouncing
dethrottling

React query

Updated App.jsx:
```
import { useState, useEffect } from 'react'
import axios from 'axios'


function App() {

  // const { products, error, loading } = customReactQuery('/api/products')

  const [products, setProducts] = useState([])
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    ; (async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await axios.get('/api/products?search=' + search, { signal: controller.signal });
        console.log(res.data)
        setProducts(res.data);
        setLoading(false);
      } catch (error) {
        if(axios.isCancel(error)) {
          console.log('Request cancelled', error.message);
          return;
        }
        console.error(error);
        setError(true);
        setLoading(false);
      }
    })();

    // cleanup 
    return () => {
      controller.abort();
    }

  }, [search])

  // if (error) {
  //   return <h1>Something went wrong</h1>
  // }

  // if (loading) {
  //   return <h1>Loading...</h1>
  // }

  return (
    <>
      <h1>Chai aur API in react</h1>
      <input
        type="text"
        placeholder='Search products'
        value={search}  
        onChange={(e) => setSearch(e.target.value)}

      />

      {loading && <h1>Loading...</h1>}
      {error && <h1>Something went wrong</h1>}

      <h2>Number of products: {products.length}</h2>
      {
        products.map((product) => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.price}</p>
            <img src={product.image} alt={product.name} height="200px" />
          </div>
        ))
      }
    </>
  )
}

export default App


// const customReactQuery = (urlPath) => {
 
//   return { products, error, loading }
// }
```


make notes in english in md format.
never miss any point
explain things easily
also use comments in code(if available)  -->