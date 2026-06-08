# React Blog App — Pages & Routing Notes

> **Lecture Summary:** This lecture covers building all the page components for a blog app and then wiring them together using React Router DOM. The instructor emphasizes that these mega projects are the real test of your practical skills.

---

## 📁 Project Structure (Pages Folder)

All pages live inside `src/pages/`. Each page is essentially a **thin wrapper** that imports a component and renders it — keeping pages clean and simple.

```
src/
├── pages/
│   ├── Signup.jsx
│   ├── Login.jsx
│   ├── AddPost.jsx
│   ├── AllPosts.jsx
│   ├── EditPost.jsx
│   ├── Home.jsx
│   └── Post.jsx
└── main.jsx   ← routing lives here
```

---

## 📄 Page 1: Signup.jsx

The Signup page just wraps the `Signup` component from the components folder.

```jsx
import React from 'react'
// Import the Signup component - note the alias to avoid name clash
import { Signup as SignupComponent } from '../components'

function Signup() {
    return (
        // py-8 = padding top and bottom (Tailwind CSS)
        <div className='py-8'>
            <SignupComponent />
        </div>
    )
}

export default Signup
```

> **Key Point:** We rename the import to `SignupComponent` because the function itself is also called `Signup`. This avoids a naming conflict.

---

## 📄 Page 2: Login.jsx

Similarly, the Login page wraps the Login component.

```jsx
import React from 'react'
// Import Login component from components folder
import { Login as LoginComponent } from '../components'

function Login() {
  return (
    <div className='py-8'>
        <LoginComponent />
    </div>
  )
}

export default Login
```

> ⚠️ **Bug in original code:** The original transcript code used `<loginComponent />` (lowercase l), which React would NOT treat as a component — it treats lowercase tags as HTML elements. Always start component names with a **capital letter**.

---

## 📄 Page 3: AddPost.jsx

This page shows a form to create a new post. It uses a `Container` for layout and `PostForm` for the actual form.

```jsx
import React from 'react'
// Container for layout wrapper, PostForm for the actual form UI
import { Container, PostForm } from '../components'

function AddPost() {
  return (
    <div className='py-8'>
        {/* Container centers and constrains the width */}
        <Container>
            {/* PostForm has all the fields: title, content, image, etc. */}
            <PostForm />
        </Container>
    </div>
  )
}

export default AddPost
```

> **Why no props to PostForm here?** Because this is a NEW post — there's no existing data to pre-fill. The form starts empty.

---

## 📄 Page 4: AllPosts.jsx

This page fetches ALL posts from Appwrite and displays them in a grid using `PostCard`.

```jsx
import React, { useState, useEffect } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config" // Appwrite service for DB calls

function AllPosts() {
    // State to hold the list of posts (starts empty)
    const [posts, setPosts] = useState([])

    useEffect(() => {
        // Fetch all posts when component mounts
        // Passing empty array [] means "no extra query filters — give me all posts"
        appwriteService.getPosts([]).then((posts) => {
            if (posts) {
                // Appwrite returns { documents: [...] }, so we extract .documents
                setPosts(posts.documents)
            }
        })
    }, []) // Empty dependency array = run once on mount

    return (
        <div className='w-full py-8'>
            <Container>
                {/* flex flex-wrap = side-by-side cards that wrap to next line */}
                <div className='flex flex-wrap'>
                    {posts.map((post) => (
                        // key prop is required for React list rendering — use unique $id from Appwrite
                        <div key={post.$id} className='p-2 w-1/4'>
                            {/* Spread all post properties as props to PostCard */}
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default AllPosts
```

> **`{...post}` Spread Operator:** Instead of writing `title={post.title} content={post.content}` one by one, we spread all properties at once. PostCard receives all fields automatically.

> **`posts.documents`:** Appwrite's `getPosts()` returns a response object. The actual array of posts is inside the `.documents` property.

---

## 📄 Page 5: EditPost.jsx

This is more complex — it needs to:
1. Read the `slug` from the URL
2. Fetch that specific post from Appwrite
3. Pass the existing post data to `PostForm` for pre-filling

```jsx
import React, { useEffect, useState } from 'react'
import { Container, PostForm } from '../components'
import appwriteService from "../appwrite/config"
import { useNavigate, useParams } from 'react-router-dom'

function EditPost() {
    // null means "not loaded yet"
    const [post, setPosts] = useState(null)

    // useParams() reads dynamic URL segments — e.g., /edit-post/my-blog-slug
    const { slug } = useParams()

    // useNavigate() lets us redirect programmatically
    const navigate = useNavigate()

    useEffect(() => {
        if (slug) {
            // If slug exists in URL, fetch that specific post
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    setPosts(post) // Store the fetched post in state
                }
            })
        } else {
            // No slug = invalid URL, redirect home
            navigate('/')
        }
    }, [slug, navigate]) // Re-run if slug or navigate changes

    // Only render the form AFTER the post data has been fetched
    // If post is null (still loading), render nothing
    return post ? (
        <div className='py-8'>
            <Container>
                {/* Pass existing post data to pre-fill the form */}
                <PostForm post={post} />
            </Container>
        </div>
    ) : null
}

export default EditPost
```

> **Conditional Rendering `post ? (...) : null`:** We wait until the post is fetched before rendering the form. This prevents the form from flashing as empty before data arrives.

> **`useParams()`:** This hook from React Router reads the `:slug` part from the URL. If the route is `/edit-post/:slug`, and the URL is `/edit-post/my-first-post`, then `slug = "my-first-post"`.

---

## 📄 Page 6: Home.jsx

The Home page shows all posts if logged in, or a "Login to read posts" message if not.

```jsx
import React, { useEffect, useState } from 'react'
import appwriteService from "../appwrite/config"
import { Container, PostCard } from '../components'

function Home() {
    const [posts, setPosts] = useState([])

    useEffect(() => {
        // Fetch all posts when home page loads
        appwriteService.getPosts().then((posts) => {
            if (posts) {
                setPosts(posts.documents)
            }
        })
    }, []) // Runs only once on component mount

    // If no posts found (user not logged in or no posts exist)
    if (posts.length === 0) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="flex flex-wrap">
                        <div className="p-2 w-full">
                            {/* Prompt user to login */}
                            <h1 className="text-2xl font-bold hover:text-gray-500">
                                Login to read posts
                            </h1>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    // If posts exist, show them in a grid
    return (
        <div className='w-full py-8'>
            <Container>
                <div className='flex flex-wrap'>
                    {posts.map((post) => (
                        <div key={post.$id} className='p-2 w-1/4'>
                            {/* Spread all post fields as props */}
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default Home
```

> **Two Return Statements:** React allows early returns. If `posts.length === 0`, we immediately return the "Login" message and the rest of the function never runs.

---

## 📄 Page 7: Post.jsx (Individual Post)

This page shows one full post. If you're the **author**, you also see Edit and Delete buttons.

```jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser"; // Converts HTML string to JSX
import { useSelector } from "react-redux"; // Read from Redux store

export default function Post() {
    const [post, setPost] = useState(null);
    const { slug } = useParams();       // Get post slug from URL
    const navigate = useNavigate();

    // Get logged-in user's data from Redux store
    const userData = useSelector((state) => state.auth.userData);

    // Check if current user is the author of this post
    // post.userId = who created it | userData.$id = who is logged in
    const isAuthor = post && userData ? post.userId === userData.$id : false;

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/"); // Post not found → go home
            });
        } else navigate("/"); // No slug in URL → go home
    }, [slug, navigate]);

    // Delete the post and its featured image
    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                // Also delete the image stored in Appwrite Storage
                appwriteService.deleteFile(post.featuredImage);
                navigate("/"); // Redirect home after delete
            }
        });
    };

    // Render post only after it's loaded
    return post ? (
        <div className="py-8">
            <Container>
                {/* Featured image section */}
                <div className="w-full flex justify-center mb-4 relative border rounded-xl p-2">
                    <img
                        src={appwriteService.getFilePreview(post.featuredImage)}
                        alt={post.title}
                        className="rounded-xl"
                    />

                    {/* Show Edit/Delete buttons ONLY to the author */}
                    {isAuthor && (
                        <div className="absolute right-6 top-6">
                            {/* Link to edit page with post ID in URL */}
                            <Link to={`/edit-post/${post.$id}`}>
                                <Button bgColor="bg-green-500" className="mr-3">
                                    Edit
                                </Button>
                            </Link>
                            <Button bgColor="bg-red-500" onClick={deletePost}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                {/* Post title */}
                <div className="w-full mb-6">
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                </div>

                {/* Post content — stored as HTML string, parse() converts it to JSX */}
                <div className="browser-css">
                    {parse(post.content)}
                </div>
            </Container>
        </div>
    ) : null;
}
```

> **`html-react-parser`:** Post content is saved as an HTML string (from the rich text editor). `parse()` safely converts it to React elements so it renders properly instead of showing raw HTML tags.

> **`isAuthor` Logic:**
> ```js
> const isAuthor = post && userData ? post.userId === userData.$id : false;
> ```
> - First checks that both `post` and `userData` exist (not null)
> - Then compares the post's creator ID with the logged-in user's ID
> - If they match → user is the author → show Edit/Delete buttons

---

## 🔀 Routing Setup — `main.jsx`

All routes are defined in `main.jsx`. We use `createBrowserRouter` for modern routing.

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

// Import all pages
import Home from './pages/Home.jsx'
import AddPost from "./pages/AddPost"
import Signup from './pages/Signup'
import EditPost from "./pages/EditPost"
import Post from "./pages/Post"
import AllPosts from "./pages/AllPosts"

// Import components used directly in routes
import { AuthLayout, Login } from './components/index.js'

// createBrowserRouter builds the route tree
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,       // App is the root layout (has Header, Footer, <Outlet />)
    children: [             // All nested routes render inside App's <Outlet />

      // Public route — anyone can see home page
      {
        path: "/",
        element: <Home />,
      },

      // Login page — authentication=false means:
      // "if user IS logged in, redirect them away (they don't need to login again)"
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        ),
      },

      // Signup page — same logic as login (redirect if already logged in)
      {
        path: "/signup",
        element: (
          <AuthLayout authentication={false}>
            <Signup />
          </AuthLayout>
        ),
      },

      // Protected route — authentication=true means:
      // "if user is NOT logged in, redirect to login page"
      {
        path: "/all-posts",
        element: (
          <AuthLayout authentication>   {/* same as authentication={true} */}
            <AllPosts />
          </AuthLayout>
        ),
      },

      // Protected — must be logged in to add a post
      {
        path: "/add-post",
        element: (
          <AuthLayout authentication>
            <AddPost />
          </AuthLayout>
        ),
      },

      // Protected — :slug is a dynamic parameter (e.g., /edit-post/my-blog-title)
      {
        path: "/edit-post/:slug",
        element: (
          <AuthLayout authentication>
            <EditPost />
          </AuthLayout>
        ),
      },

      // Public — anyone can read a post
      // :slug identifies which post to show
      {
        path: "/post/:slug",
        element: <Post />,
      },
    ],
  },
])

// Wrap everything in Redux Provider (for state) and RouterProvider (for routing)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>         {/* Makes Redux store available everywhere */}
      <RouterProvider router={router} />   {/* Activates the router */}
    </Provider>
  </React.StrictMode>,
)
```

---

## 🔐 AuthLayout — How Route Protection Works

`AuthLayout` is a component that checks authentication before rendering children.

| `authentication` prop | User is logged in | User is NOT logged in |
|---|---|---|
| `true` (protected route) | ✅ Show the page | ❌ Redirect to `/login` |
| `false` (guest-only route) | ❌ Redirect to `/` (home) | ✅ Show the page |

```jsx
// Example usage in routes:

// Only show if logged in:
<AuthLayout authentication={true}>
  <AddPost />
</AuthLayout>

// Only show if NOT logged in (login/signup pages):
<AuthLayout authentication={false}>
  <Login />
</AuthLayout>
```

> `<AuthLayout authentication>` is shorthand for `<AuthLayout authentication={true}>`. When you write a prop name without a value, React assumes `true`.

---

## 🗺️ Route Summary Table

| URL | Component | Protected? |
|-----|-----------|-----------|
| `/` | `Home` | No |
| `/login` | `Login` | Redirect if logged in |
| `/signup` | `Signup` | Redirect if logged in |
| `/all-posts` | `AllPosts` | Yes — must be logged in |
| `/add-post` | `AddPost` | Yes — must be logged in |
| `/edit-post/:slug` | `EditPost` | Yes — must be logged in |
| `/post/:slug` | `Post` | No |

---

## 🧠 Key Concepts to Remember

### 1. `useParams()` — Reading URL Parameters
```jsx
// Route defined as: /edit-post/:slug
// URL visited:      /edit-post/my-first-post

const { slug } = useParams()
// slug = "my-first-post"
```

### 2. `useNavigate()` — Programmatic Redirect
```jsx
const navigate = useNavigate()
navigate('/') // Go to home
navigate('/login') // Go to login
```

### 3. `useSelector()` — Read from Redux Store
```jsx
const userData = useSelector((state) => state.auth.userData)
// userData = currently logged-in user (or null if not logged in)
```

### 4. `useEffect()` — Run Code on Mount
```jsx
useEffect(() => {
  // This code runs once when the component first appears
  fetchPosts()
}, []) // Empty [] = run once only
```

### 5. Spread Operator `{...post}`
```jsx
// Instead of:
<PostCard title={post.title} content={post.content} $id={post.$id} />

// You can write:
<PostCard {...post} />
// This passes ALL properties of post as individual props
```

---

## 🐛 Common Bugs to Avoid

| Bug | Problem | Fix |
|-----|---------|-----|
| `<loginComponent />` | Lowercase = treated as HTML tag, not component | `<LoginComponent />` |
| `getPosts()` outside `useEffect` | Runs on every render (infinite loop risk) | Always put API calls inside `useEffect` |
| Missing `key` prop in `.map()` | React warning, potential rendering issues | Use `key={post.$id}` |
| Not exporting component from index | Import fails silently | Add to `components/index.js` |
| Accessing `post.title` before post loads | Crashes if `post` is null | Check `post &&` before accessing |

---

## 🔄 Data Flow Summary

```
User visits /all-posts
     ↓
AuthLayout checks: is user logged in?
     ↓ Yes
AllPosts component mounts
     ↓
useEffect fires → appwriteService.getPosts()
     ↓
Appwrite returns { documents: [...] }
     ↓
setPosts(posts.documents)
     ↓
Component re-renders with posts
     ↓
posts.map() → renders one <PostCard> per post
```

---

> 💡 **Instructor's Advice:** This mega project is your life-defining moment. The ability to understand it fully AND rebuild it yourself from scratch will set you apart. The pattern repeats — once you understand it once, the rest is just repetition. Don't skip this!


<!-- Transcript:
```
हां जी तो स्वागत है आप सभी का चाय और
कोर्ट में ऑलमोस्ट सुबह हो गई आज तो
रिकॉर्ड करते हुए 5:00 बाज गई है पर यह
फाइनली फिनिश करते हैं वीडियो क्योंकि
इसके बाद हम पेज बनाएंगे इस वीडियो के
अंदर और उसके बाद तो डीबगिंग है क्योंकि
बेसिक कॉन्सेप्ट समझ में ए गए हैं बट एक
बात एक बात याद रखिएगा चीज अगर एक बार में
नहीं समझ आई तो उनको छोड़ना नहीं है
वीडियो को दोबारा देखिए और स्पेशली जो
मेगा प्रोजेक्ट है ना ये आपका लाइफ
डिफाइनेंग मोमेंट होगा की आप जब ले पाएंगे
जब लेकर कितना आप ले पाएंगे थ्राइव कर
पाएंगे और ये आपको स्टैंड अपार्ट कर देगा
लेकिन ये पूरा का पूरा प्रोजेक्ट समझ पन
दोबारा से खुद बना पन ये कुछ गिने-चुने
लोगों के बस की बात रहेगी तो यहां पे
डिफाइन होगा की आप कितने प्रैक्टिकल है और
कितनी मेहनत कर सकते हैं तो चलिए चलते हैं
हमारी स्क्रीन पे और हम बनाते हैं पेज अब
देखिए पेज बनाना है बहुत ही आसन तो पेज के
अंदर एक-एक करके सारे पेज बनाया सबसे पहले
हम बनाते हैं साइन अप
साइन अप डॉट जीएस तो इसमें कुछ है नहीं
खास साइन अप पेज के अंदर भी हमारा बेसिक
हमारा आईएफसी लिख लेते हैं पहले और इसके
अंदर कुछ नहीं करना एक इंपोर्ट कम
कंपोनेंट इंपोर्ट कराएंगे बस दत कंपोनेंट
सारे के सारे एक बार यहां पे भी लिख
लीजिएगा जितने भी index.js है इसमें साइन
अप वगैरा सब आपने फूली ले लिया हो तो यहां
पर भी इंपोर्ट कर देते हैं
साइन अप पेज से तो नहीं
हमारा जो कंपोनेंट है वह साइन अप कंप्लेंट
यह आपका हो गया
हम कॉम्पोनेंट्स से नाम यहां से साइन अप
लेंगे इस दीव के अंदर सिंपली सी एक क्लास
ने मेरे को एड करनी है जो की है वेडिंग ऑन
वही दास आईटी
और यहां पर कंपोनेंट कॉल करना है बस इतना
सही कम है तो ये हमारा बन गया पेज
इसको बोल देते हैं साइन अप एक्चुअली में
इसको थोड़ा सा इंपोर्टेंट में हम थोड़ा सा
स्टाइलिश कर देते हैं स्टाइलिश तो क्या
मतलब थोड़ा इजी कर लेते हैं पढ़ने के लिए
इसको बोलते हैं
लेकिन हम इसको क्या है
बस इतनी सी बात है इसी तरह से बाकी के बना
देते हैं लॉगिन के अंदर भी से ही कम है
रिपीटेशन है थोड़ा सा
लोग इन डॉट जेएसएससी
और लॉगिन को भी इंपोर्ट कर लेते हैं
इंपोर्ट लॉगिन फ्रॉम लॉगिन और यहां पर आकर
यह लीजिए लॉगिन ठीक है इसके अंदर भी वही
से कम करते हैं
इंपोर्ट लॉगिन फ्रॉम कंपोनेंट और इसको बोल
देते हैं लॉगिन कंपोनेंट
और यहां पर
उनको भी एड करते हैं तो पोस्ट अगर एड करना
है तो क्या-क्या चाहिए
पोस्ट और पोस्ट ए जाएगा पोस्ट से और यहां
पर एड कर लेते हैं उसको
यह लीजिए अब एड पोस्ट के अंदर इसको भी
इंपोर्ट कर देते
तो यहां पर हमें एक तो चाहिएगा
कंटेनर जो कॉम्पोनेंट्स ए जाएगा और एक और
चाहिए हमें इसको बोल देते हैं पोस्ट फॉर्म
तो अपने लिए ही नहीं है
फोल्डर के अंदर है
पोस्ट फॉर्म
फ्रॉम पोस्ट एक्चुअली में पोस्ट फॉर्म है
कहां पर यह हमारा एक्सपोर्ट नहीं कर क्या
इसको
पोस्ट किया है
इसलिए
अब ए जाना चाहिए हमारे पास में
पोस्ट फॉर्म ओके
यह लीजिए
ओके तो यहां पर हमारे पास अब देखते जाएगी
जाएगी पोस्ट फॉर्म पोस्ट फॉर्म भी ए गया
है
अब यहां पर हम कॉल कर लेते अपना कंटेनर
और कंटेनर के अंदर अपना पोस्ट फॉर्म और
कंटेनर क्लोज ठीक है जी बस हो गया और कुछ
कम ही नहीं था क्योंकि कोई डाटा इसमें पास
करना ही नहीं है अच्छा सारे पोस्ट दिखाने
होंगे तब जो पोस्ट का भी एक पेज चाहिएगा
उसको भी बना देते हैं
इसको नाम देते हैं जो
पोस्ट
यहां पर कुछ नहीं बस एक वैल्यू कॉल करनी
पड़ेगी आपको सर्विस चाहिए की यहां पे
अप्राइट की ठीक है कोई दिक्कत नहीं है वो
भी ले लेंगे
पोस्ट कर लिया
इंपोर्ट पोस्ट कार्ड
पोस्ट कार्ड होना चाहिए था यह रिपोर्ट
फ्रॉम पोस्टकार्ड और इसको मिलते
टाइम
मल्टीपल कर सकते
और कंटेनर और पोस्ट फॉर्म तो नहीं
पोस्टकार्ड चाहिए इसके अंदर
पोस्ट एक्चुअली में डायरेक्ट नहीं मिलेंगे
तो हमें उसे स्टेट भी चाहिए
ओके सबसे पहले तो एक वेरिएबल बना लेते हैं
पोस्ट इसके अंदर हम सारे के सारे पोस्ट
लेंगे एमटीआर ले लेते हैं जैसे कंपोनेंट
लोड होगा उसे इफेक्ट का उसे कर लेंगे और
सर कम हो जाएगा ये लीजिए कोई डिपेंडेंसी
अरे है नहीं और सीधा क्या बोलते हैं अप
राइट को उसे करते हैं सर्विस को और बोलते
हैं गेट पोस्ट सारे पोस्ट चाहिएंगे तो गेट
पोस्ट ऐसे उसे करेंगे तो गेट पोस्ट के
अंदर हम वैल्यू पास कर देंगे क्योंकि गेट
पोस्ट के अंदर अभी हम एम्टी पैर पास कर
देते हैं क्योंकि किसी के अंदर साड़ी
वालुज ए जाएगी अगर सक्सेसफुल हुआ है तो
डॉट दें और अगर नहीं हुआ है तो डॉट कैच तो
यह लीजिए इसके अंदर आपको कॉल बैक मिल
जाएगा कॉल बैक के अंदर आपको सारे पोस्ट्स
मिल जाएंगे ठीक है जी और यहां पर हम सारे
के सारे सेट पोस्ट ले लेंगे तो जो भी
वालुज ए रही है गेट पोस्ट की हम इस तरह से
ले लेंगे अगर थोड़ा सा मेमोरी यहां पर
थोड़ा सा और कम भी होगा मेमोरी अगर जब
करनी है वापस से तो कंफीग्य है ये और आपके
सारे के सारे यहां पे
गेट पोस्ट
तो यहां पर क्वेरी का रिजल्ट आपके पास अरे
में आता है तो यह जो रिटर्न हमने किया है
ना लिस्ट डॉक्यूमेंट यह लिस्ट ऑफ
डॉक्यूमेंट जो है ना एक इराई के अंदर आपके
पास आएगा तो हमने क्या कर गेट पोस्ट के
अंदर कुछ भी पास नहीं कर है अगर हमें कुछ
करना होता तो हम क्वेरीज पास कर देते हैं
यहां पे और भी मेरे पास अभी कोई क्वेरी
नहीं है इसलिए मत है पास किया है जो
रिजल्ट आएगा उसको हमने पोस्ट बोल दिया है
और हमने सीधा क्या कर सेट पोस्ट वैसे तो
आप चाहे तो सेट पोस्ट अगर ना करो तो हम
क्या कर सकते हैं यहां पर इसको हटाते हैं
एक मिनट के लिए पोस्ट और ये लीजिए
कैलिब्रेशन हमने लगा दिया अब यहां पे क्या
करिए की अगर पोस्ट आए हैं आपके पास ये
पोस्ट हैं आपके पास तो आप सेट पोस्ट
को उसे कर सकते हैं और पोस्ट के अंदर आपको
डॉक्यूमेंट मिल जाएंगे सारे के सारे
डॉक्यूमेंट तो सारे आपको डॉक्यूमेंट मिल
गए अब तो आपके पास पोस्ट के अंदर साड़ी
वालुज हैं तो आपको करना है और
डॉक्यूमेंट जो है वो एक्चुअली मैं यहां पर
गए हैं पोस्ट के अंदर और बस लूप लगाना अब
तो और क्या ही कम है
ओके अब यहां पर लेकर आते हैं कंटेनर को
यह लीजिए कंटेनर ए गया
कंटेनर को और कर लेते हैं पहले
स्टार्ट कर देते हैं पोस्ट है हमारे पास
में सारे और उसके ऊपर एक लूप लगा देते हैं
मैप और यह लीजिए आपके पास पोस्ट कार्ड की
वैल्यू ए गई सर का सर कम हो गया थोड़े से
यहां पे एरर्स हैं ठीक है अभी गए तो
पोस्टकार्ड के अंदर ही हमने की वैल्यू को
यहां पे दे दिया है अच्छा इसको और भी
तरीके से हम कर सकते थे एक्चुअली में
थोड़ा सा और इसको इंप्रूव कर लेते हैं
डायरेक्ट नहीं लिख के क्योंकि हमने जब
प्रोजेक्ट बनाया था तब भी इसी तरह से
इंप्रूव किया था इसको
एड कर लेते हैं ताकि सारे के सारे पोस्ट
आसानी से मिल जैन फ्लेक्स और फ्लेक्स रेप
लिंग है और कुछ भी नहीं है
हर मैं आपके अंदर आपको एक पोस्ट मिल जाएगा
सारे पोस्ट के अंदर तो ये लीजिए एक पोस्ट
मिल गया ये लीजिए आपका कॉल बैक यहां पर
फायर हो गया है रिटर्न नहीं करूंगा इसलिए
मैं पांथेस उसे कर लेट हूं यहां पर हम
क्या करते हैं एक और दीव उसे कर लेते हैं
एक और यह लीजिए
यह रिपीट होगा और इसके अंदर क्या करो इसके
अंदर आप अपना पोस्ट कार्ड को कॉल कर लो और
डाटा उसको सेंड कर दो आपको चाहिए तो यहां
पे कुछ क्लासेस भी एड कर देते हैं पेंडिंग
तो ले लेते हैं इसकी हम 2 और विथ लेते हैं
वन बाय फोर तो वन बाय पर हम डायरेक्टली
लिख सकते हैं यहां पे ओके तो देखा इतना
कुछ खास डिफिकल्ट है नहीं वही पैटर्न
रिपीट हो रहा है जो हमने एक बार सिख लिया
था की किस तरह से सर्विसेज बंटी है अब तो
बस रिपीटेशन नहीं है काफी बोरिंग हो जाता
है इसके बाद रेपुटेशन नहीं है और कुछ भी
नहीं है तो हमारे एड पोस्ट हो गया जो
पोस्ट हो गया उसके बाद एडिट पोस्ट भी
बनाना पड़ेगा एडिट पोस्ट भी एक्जेक्टली से
ही है बस उसके अंदर आपको डाटा करना है
पूरा का पूरा डाटा देना पड़ेगा वो भी दे
देते हैं
तो न्यू फाइल बना लेते हैं और इसको बोलते
हैं
और यहां पर भी आपको से वही कम करना पड़ेगा
नेविगेट वगैरा वो सब यूजर्स को लेना
पड़ेगा
यह लीजिए उसे इफेक्ट और यह लीजिए उसे
स्टेट ओके
पोस्ट फॉर्म
कॉम्पोनेंट्स
तो लगेगी
ब्राइट सर्विस
बाकी देखते हैं और क्या-क्या लगेगा
तो वही स्टेटमेंट उसे कर लेते हैं मत अरे
एक्चुअली में इनकी जरूर नहीं है आप मत
अरबी ले सकते हो नल भी ले सकते हो आपके
ऊपर जैसा लेना चाहे और इंप्रूव करना चाहे
एक आपको स्लग लगेगा तो हम क्या करेंगे
क्योंकि एडिट करने हैं तो यूजर क्लिक
करेगा और फिर उसे पेज पर जाएगा तो आपके
पास यूआरएल अवेलेबल होगा तो यूआरएल से
कैसे वैल्यू निकलेंगे यूआरएल से कुछ भी
वैल्यू निकालना के लिए अगर आपने वो लेक्चर
अच्छे से पढ़ा होगा तो आपको पता होगा
ये रिएक्ट राउटर डॉ से लेना पड़ेगा वो
हमने ले लिया है इसको जो मर्जी आप बोल
सकते हैं
ठीक है और नेविगेट भी ले लेते हैं
है और नेवी
नेविगेट नहीं करेगा सजेशन
उसे नेविगेट
हो तो लगेगा लगेगा क्योंकि साड़ी डाटा
वालुज लेकर आनी है स्लग से वैल्यू आएगी तो
स्लग में कोई भी चेंज हो तो डाटा वैल्यू
लेक आओ तो ठीक है ये करते हैं तो यह हमारा
हो गया कॉल बैक और इसके बाद एक डिपेंडेंसी
है तो यहां क्या-क्या डिपेंडेंसी है एक तो
स्लग के अंदर और कोई नेवीगेशन में भी कुछ
भी चेंज होता है नेविगेट के अंदर तो भी आप
इसको रन करिए दोबारा से यह डिपेंडेंसी अरे
हो गया अगर स्लग है तो कम करो वरना नहीं
करेंगे तो स्लग है तो उसे इफेक्ट के अंदर
एक अप राइट की सर्विस कॉल कर लेंगे गेट
पोस्ट वाली उसके अंदर आपको पता है
तो आपके पास पोस्ट ए जाएगा अगर पोस्ट ए
गया है आपके पास तो सेट पोस्ट कर दीजिए और
सेट पोस्ट हमारे पास हो गया है
ठीक है अब यहां पर क्या चाहिए
ठीक है जी हेल्थ कैसे के अंदर यूजर को
नेविगेट
कर रहे हैं आप अगर है तो क्या करना पड़ेगा
बट ठीक है चलेगा
ओके इतना कम तो हो गया हमारे पास में एड
पोस्ट जो पोस्ट एडिट पोस्ट लॉगिन भी है
और साइन अप भी है और एक्चुअली में पोस्ट
भी चाहिएगा क्योंकि हमने एडिट एडिट कर
दिया एड पोस्ट लेकिन पोस्ट
इंडिविजुअल पोस्ट कैसे दिखेगा क्योंकि
वहां पे हमें एडिट बटन डिलीट बटन वो भी
देना पड़ेगा उसका भी हम देखते हैं पहले
इजी वाला कम कर लेते हैं क्योंकि होम पेज
पे इतना कुछ है नहीं तो होम पेज का कर
लेते हैं पहले उसको भी कर लेंगे
तो ये हमारा है
होम डॉट जेएस ये लीजिए कोई अपना आईएफसी ये
लीजिए अच्छा यहां पर भी होम है क्योंकि तो
यहां पे भी पोस्ट वगैरा देखने पढ़ेंगे है
नहीं है यूजर लॉगिन है नहीं है काफी चीज
देखनी पड़ेगी होम पे भी तो पहले तो उसे
इफेक्ट ले लेते हैं
तो यहां पर लगेगा एक तो
कंटेनर और पोस्टकार्ड यह लीजिए ओके अब
क्या करना है सबसे पहले होम पेज है तो होम
पेज पर पोस्ट है या नहीं गेट पोस्ट पूछ
लेंगे उससे और फिर देखेंगे की एक्चुअली
में होम पर है ओके तो हम लेकर आते हैं
सबसे पहले
अपना पोस्ट और सेट पोस्ट ठीक
है सजेशन हमें अच्छे मिल गए यहां पे
उसे इफेक्ट के अंदर एक्चुअली मैं कुछ
ज्यादा ही अजीब से सजेशन मिले हटाते हैं
इसको आप कैसे दोबारा लिखने हैं
डिपेंडेंसी अरे डिपेंडेंसी अरे कुछ है
नहीं डायरेक्ट ही कम करना है और सीधे
बोलना है अप्राइट की सर्विस को की आप सारे
के सारे पोस्ट लेकर आई तो गेट
पोस्ट
यहां पर कोई वगैरा देनी नहीं है तो
एक्चुअली
डॉक्यूमेंट तो यहां पर सेट हो गया अब हमें
चेक करना पड़ेगा की आपके पास पोस्ट है या
नहीं है पोस्ट की लेंथ क्या है उसके बेसिस
पे हम चेक करेंगे तो एक्चुअली मैं इसको
यहां से हटाते हैं पहले रिटर्न को और चेक
करते हैं की आपके पास पोस्ट है या नहीं तो
कंडीशन हमारी है की आपके पास पोस्ट जो है
उसकी लेंथ
है अगर आपके पास
जीरो है वैसे तो हमें चेक करना चाहिए
तो हम क्या करते हैं यहां पर एक रिटर्न
करते हैं स्टेटमेंट सजेशन अगर मिल जाए तो
नहीं तो मैं डायरेक्ट
नहीं रिटर्न करना चाहूंगा मैं एक्चुअली
मैं कंटेनर रिटर्न करना चाहूंगा जिसके
अंदर लिखा हो की कोई पोस्ट फाइंड नहीं हुए
हैं तो यहां पर
ठीक है जी यह हमने पेस्ट कर दिया है सजेशन
से कुछ नहीं कंटेनर है जिसके अंदर लिखा
हुआ है लॉगिन तू रीड पोस्ट ठीक है क्योंकि
पोस्ट की कोई लेंथ ही नहीं है तो लॉगिन
करना पड़ेगा अगर नहीं है तो भी लोग इन तो
करवा ही लेते हैं वैसे मैसेज आपके डिपेंड
करता है की आप क्या मैसेज दे रहे हैं
अच्छा ठीक है यह तो हुआ जब हमारा कम की
अगर पोस्ट की लेंथ जीरो है तो अगर पोस्ट
हैं अगर लेंथ जीरो नहीं है तो नेगेटिव तो
होगी नहीं यहां पे सी बात है अगर यहां पर
ऐसा है तो सबसे पहले लेते हैं
ओके
इतना कम तो हो गया ठीक है सजेशन ए गए बहुत
अच्छी बात है
और पोस्टकार्ड हमें सीधे ही मिल गया अब
एक्चुअली में ना पोस्ट आपको इस तरह से
देना है क्योंकि प्रॉब्लम क्या होगी की
आपको पोस्ट अगर आप इस तरह से दे देंगे तो
एक ही पोस्ट जाएगा और एक ही पोस्ट में
नहीं चाहता की जाए वहां पे तो आप इसको
स्प्रेड करके भी दे सकते हैं की सारे ही
पोस्ट एक-एक करके आप दे दीजिए वहां पे
वैसे तो इस तरह से भी दे सकते हैं
अपने-अपने मेथड हैं किस तरह से देते हैं
ये भी चलेगा वैसे पर आपको अगर ये नहीं
देना है तो आप इस तरह से भी दे सकते हैं
की लीजिए मैं स्प्रेड कर देता हूं इसको और
ये पोस्ट दे देता है तो इंडिविजुअल तो हर
एक उसमें स्प्रेड करके भी आप दे सकते हैं
तो साड़ी वालुज ए जाएगी एक ही बात है
अलग-अलग तरीके हैं बस लिखने की और कुछ भी
नहीं है अच्छा अब ये क्या करते हैं हम
हमारे पास में एक पोस्ट का भी हमारे को
चाहिएगा तो एक पोस्ट का भी पेज बना देते
हैं उसमें कुछ नहीं है बस कंडीशनली
रेंडरिंग करके हमने वैल्यू सेट कारी है तो
यहां पर हम लेते हैं पोस्ट जेएस अपना
आईएफसी लेते हैं मैं एक्चुअली मैं आपको
डायरेक्ट ही ये दे देता हूं फाइल क्योंकि
ऑलमोस्ट सर हम पढ़ ही चुके हैं तो बार-बार
रिपीटेशन का कोई सेंस है नहीं तो मैं आपको
डायरेक्टली दे देता हूं एन है कुछ भी नहीं
इसके अंदर हमने पोस्ट लिया है क्योंकि एक
पोस्ट आपको एड करना है तो हमें देखना है
की हमारे पास इस ऑथर है क्या तो ऑथर कब
होगा वो हमने चेक कर लिया है की पोस्ट
होना ही चाहिए उसके अलावा यूजर डाटा जब है
तो पोस्ट का यूजर आईडी और जो यूजर डाटा से
हमने यूजर आईडी मिला है वो अगर ट्रू है तो
तो वो ऑथर है वरना वो ऑथर नहीं है बस एक
ही कॉन्सेप्ट है यहां पे सिर्फ ऑथर वाला
अब अगर ऑथर है तो हम उसको एडिटर डिलीट
वाले बटन देंगे वरना नहीं देंगे बाकी इस
फाइल को आप और चेक कर लीजिएगा कोई इशू है
तो मुझे बता दीजिएगा एक और वीडियो बना
देंगे और एड कर देंगे ठीक है तो ये हमारे
कम हो गए हैं सारे पेज बन चुके हैं अब इस
पेज बने के बाद हमें चाहिए अब रूटिंग तो
हम करेंगे सारे के सारे रूटिंग का इंतजाम
अब देखिए यहां पे जो रूटिंग है ना बड़ी
इंटरेस्टिंग है मैं आपके पास आता हूं
में डॉट जेएस के अंदर यही पर हमने
एक्चुअली में अप हमारी दे राखी है में डॉट
जेएस के अंदर तो अप देने की बजे हम यहां
पे एक राउटर प्रोवाइडर उसे करेंगे सीधा और
इस से सर दे देंगे ठीक है
है तो सबसे पहले हम यहां पर आते हैं
इंपोर्ट सारे हम ले लेंगे अभी एक साथ में
और उसके बाद सबसे पहले तो हमें चाहिए
राउटर अब राउटर का मैंने आपको काफी डिटेल
में बताया था क्रिएट
ब्राउज़र राउटर कुछ इस तरह
उसे कर लेते हैं मैंने आपको दो तरीके बताए
थे आपका जो मां करें वो एक तरीका आप उसे
कर लीजिए अब सबसे इंटरेस्टिंग बात क्या है
इस राउटर के अंदर जो सीखने लायक बात है
वैसे तो यहां पे एक्शंस वगैरा अपने आप ए
गए हैं ये नहीं चाहिए हमें आ ये लीजिए एक
ऑब्जेक्ट हमने दे दिया है अब इस ऑब्जेक्ट
के अंदर क्या है ये तो रूट होगा हमारा तो
ये लीजिए पाठ रूट हो गया है एलिमेंट कौन
सा रेंडर करना चाहते हैं अपर इंटर कर
दीजिए ठीक है और एक चिल्ड्रन ये लीजिए
चिल्ड्रन अपने आप में एक एरर है तो ये
लीजिए
यह हो गया हमारा अरे अच्छा अब इसके अंदर
वालुज की आएगी दो तरीके मैंने आपको बताया
था आपको दूसरा तरीका अच्छा लगे तो वही उसे
कर लीजिए अब यहां पर क्या है सबसे
इंटरेस्टिंग चीज क्या है ये ऑब्जेक्ट्स
आएंगे बहुत सारे एक-एक करके हमें
ऑब्जेक्ट्स पे डिस्कशन करते हैं सबसे पहले
तो है आपका पाठ तो ये होम वाला राउट हो
गया आपका यहां पे एलिमेंट कौन सा रेंडर
करोगे यहां पर इंटर हम कर लेंगे अपना होम
पेज ये लीजिए होम पेज ए गया अपना अच्छा ये
तो हो गया फर्स्ट अब इंटरेस्टिंग सी चीज
वही एक चीज समझना लायक है बाकी सब तो
रिपीटेशन उसके बाद की दूसरा जो एलिमेंट है
उसका जो पाठ है वह पाठ क्या है वह पाठ में
चाहता हूं वह स्लैश लॉगिन ठीक है जी स्लैश
लॉगिन लेकिन एलिमेंट कैसे रेंडर करेंगे वो
देखिए इंटरेस्टिंग कैसे है की आप पहले तो
यह परांठस ले लीजिए ठीक है जी अब परंतु
क्या है की एक्चुअली में रैपर है की आपको
दो तीन एलिमेंट
करना है तो आप कर सकते हैं लेकिन हम क्या
करेंगे अब हर एक एलिमेंट को हम ऑफ ले आउट
में रेप करेंगे
ओके और लेआउट लेआउट हमारे कॉम्पोनेंट्स
जिसके अंदर हमने एक्चुअली में प्रोटेक्टेड
नाम से इसको एक्सपोर्ट किया
पहले तो हमें में प्रॉब्लम इसलिए हो रही
है क्योंकि हमने इसको
हमारे इंडेक्स फाइल के अंदर एक्सपोर्ट ही
नहीं कर है हां जी तो पहले इसको लेकर आते
हैं हम इंडेक्स फाइल के अंदर
इसको भी लेकर आते हैं
आपने तो जयसमंद करें आप इसको एक्सपोर्ट कर
लीजिए ठीक है तो यह तो हो गया
जाता है एक एलिमेंट है तो अब हम ला सकते
हैं
यह लीजिए आपका लॉगिन कंपोनेंट बट यहां पर
डाटा जो पास करूंगा वो है ऑथेंटिकेशन यह
मैन्युअल डाटा है लॉगिन के लिए ऑथेंटिकेशन
चाहिए क्या लोग इन ऑथेंटिकेशन चाहिए फॉल्स
अब आप क्या करिए वापस से जाइए अपने ओथ
लेआउट के अंदर अब आपको पता है की यहां से
वैल्यू जल आई है तो आपको समझना के लिए
सबसे इजी कम क्या रहेगा की आप जाइए अपने
लॉगिन वाले कंपोनेंट के अंदर की ठीक है
वहां से डाटा फॉल्स आया है और अगर आपको
नहीं समझ में ए रहा है ये पूरा लॉजिक कहां
पे गया हमारा लॉगिन वाला लॉजिक
सॉरी ओथ लेआउट में जाइए अब यहां से देखिए
की ऑथेंटिकेशन में आपके पास आया जल तो
जहां-जहां आपको नहीं समझ में ए रहा है इस
ऑथेंटिकेशन को रिप्लेस कर दीजिए फल से फिर
आपको थोड़ा सा और क्लेरिटी समझ में आएगी
की कहां से है फिर ऑफ स्टेटस में भी जाइए
की अब आपको स्टेटस एक बार ट्रू है एक बार
फॉल्स है तो आपको थोड़ा और आइडिया मिलेगा
तो बस इतना ही में है हमारा कम की इसी तरह
से वालुज को हम पास करेंगे की लॉगिन में
ऑथेंटिकेशन चाहिए नहीं चाहिए जल चाहिए
ट्रू चाहिए तो वो साड़ी वालुज हम यहां पे
इस तरह से लेते हैं मैं एक बार आपको सारे
ही बच्चे हुए एलिमेंट्स भी यहां पे लिख के
बता देता हूं ताकि आपका कम थोड़ा सा आसन
हो जाए
तो यह लीजिए हमने साड़ी वालुज लिखी अब
देखिए सबके अंदर हम करके
इसमें चाहिए क्या नई नई चाहिए साइन अप में
चाहिए क्या ऑथेंटिकेशन नहीं चाहिए सारे
पोस्ट पढ़ने के लिए चाहिए हां ऑथेंटिकेशन
चाहिए तो यहां पे ऑथेंटिकेशन लिखो या फिर
ऑथेंटिकेशन इक्वल्स तू भेजो एक ही बात है
तो यहां पे भी एड पोस्ट में भी चाहिए हां
अभी चाहिए एडिट पोस्ट में भी चाहिए हां जी
चाहिए गौर से देखिए स्लग नाम दिया है आईडी
नाम नहीं दिया है तो ये हमारा हो गया
बेसिक अच्छा ये आपका सर बन गया है अब आपको
क्या करना है एक्चुअली में एक राउटर
प्रोवाइडर आपको चाहिएगा अप इस तरह से नहीं
लिख सकते प्रोवाइडर तो लिखेंगे ओबवियसली
लेकिन अब ये नहीं चाहिए अब आपको चाहिए
एक्चुअली में एक राउटर
प्रोवाइडर ये राउटर प्रोवाइडर ए गया है
क्लोजिंग कर लेते हैं और इसको चाहिए राउटर
और वैल्यू ए जाएगी अपने पास ये जो आउटर
ऊपर बना है ये रहा अब ओबवियस सी बात है
लेकिन अब हमारी एप्लीकेशन एक्चुअली में
काफी हद तक तैयार है
वो करेंगे
ओबवियस सी बात है जैसे देख सकते हैं आप
कौन जस फ्रॉम अप्राइट कंफीग्रेज डी फाइल
एक्जिस्ट अभी काफी जगह आपको मिलेगा अप
राइट के अंदर कनफ्लिक्ट के अंदर
फाइल का इशू है तो उसको भी चेंज कर लेते
हैं
हमारे पास फाइल
यहां पर विश्व
कौन से इस तरह
इंपोर्ट फ्रॉम कंपोनेंट इंडेक्स डी फाइल
एक्जिस्ट हाय स्कोर पोस्ट भी नहीं मिला है
index.js के अंदर तो इसी तरह की लगेगी अभी
चीज कौन सा कंपोनेंट नहीं मिला है पोस्ट
पोस्ट हमने लिया है क्या
पोस्ट
तो हमने पोस्ट तो बनाया ही नहीं
इस तरह से अगर कुछ र गया है पोस्ट या
पोस्ट कार्ड तो हमें वह भी चाहिएगा हमेशा
पोस्ट बनाया ही नहीं है एक्चुअली में
देखते हैं कौन सा वाला वालुज है
[संगीत]
ओके रिक्वेस्ट मोडल तो हमारे बटन के अंदर
प्रॉब्लम है साइन अप के अंदर ठीक है जी तो
साइन अप के अंदर चलते हैं
और साइन अप के अंदर हमारे बटन के अंदर इशू
है यह वाला जो बटन है यह कंपोनेंट शायद
हमारे पास ढंग से एक्सपोर्ट नहीं हुआ है
एक्सपोर्ट डिफॉल्ट बटन या फिर हमने कोई
दूसरा बटन इंपोर्ट ले लिया है
तो इसको कैसे एक्सपोर्ट करेंगे अब
साइन अप के अंदर
बटन एक्चुअली मैं यही वाला चाहिए
ओके
इसको इंपोर्ट बटन
ओके तो इसको भी हम फिक्स करते हैं एक बार
इसको ट्राई करते हैं तो
लाइन नंबर फाइव
करते हैं
वीडियो रिकॉर्ड करते करते तो कल देखते हैं
इसको वापस से और एक-एक करके सारे बग्स
रिजॉल्व करते हैं चलिए मिलते हैं आपसे
अगले वीडियो में
```


Now, we will build pages.

create a new file:
src/pages/Signup.jsx:
```
import React from 'react'
import { Signup as SignupComponent } from '../components'

function Signup() {
    return (
        <div className='py-8'>
            <SignupComponent />
        </div>
    )
}

export default Signup

```

create a new file:
src/pages/Login.jsx:
```
import React from 'react'
import { Login as loginComponent } from '../components'
function Login() {
  return (
    <div className='py-8'>
        <loginComponent />
    </div>
  )
}

export default Login
```

create a new file:
src/pages/AddPost.jsx:
```
import React from 'react'
import { Container, PostForm } from '../components'

function AddPost() {
  return (
    <div className='py-8'>
        <Container>
            <PostForm />
        </Container>
    </div>
  )
}

export default AddPost
```



create a new file:
src/pages/AllPosts.jsx:
```
import React, { useState, useEffect } from 'react'
import { Container, PostCard } from '../components'
import appwriteService from "../appwrite/config";

function AllPosts() {
    const [posts, setPosts] = useState([])
    useEffect(() => { }, [])
    appwriteService.getPosts([]).then((posts) => {
        if (posts) {
            setPosts(posts.documents)
        }
    })
    return (
        <div className='w-full py-8'>
            <Container>
                <div className='flex flex-wrap'>
                    {posts.map((post) => (
                        <div key={post.$id} className='p-2 w-1/4'>
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default AllPosts
```


create a new file:
src/pages/EditPost.jsx:
```
import React, { useEffect, useState } from 'react'
import { Container, PostForm } from '../components'
import appwriteService from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';

function EditPost() {
    const [post, setPosts] = useState(null)
    const { slug } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) {
                    setPosts(post)
                }
            })
        } else {
            navigate('/')
        }
    }, [slug, navigate])
    return post ? (
        <div className='py-8'>
            <Container>
                <PostForm post={post} />
            </Container>
        </div>
    ) : null
}

export default EditPost
```


create a new file:
src/pages/EditPost.jsx:
```

```

create a new file:
src/pages/Home.jsx:
```
import React, { useEffect, useState } from 'react'
import appwriteService from "../appwrite/config";
import { Container, PostCard } from '../components'

function Home() {
    const [posts, setPosts] = useState([])

    useEffect(() => {
        appwriteService.getPosts().then((posts) => {
            if (posts) {
                setPosts(posts.documents)
            }
        })
    }, [])

    if (posts.length === 0) {
        return (
            <div className="w-full py-8 mt-4 text-center">
                <Container>
                    <div className="flex flex-wrap">
                        <div className="p-2 w-full">
                            <h1 className="text-2xl font-bold hover:text-gray-500">
                                Login to read posts
                            </h1>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }
    return (
        <div className='w-full py-8'>
            <Container>
                <div className='flex flex-wrap'>
                    {posts.map((post) => (
                        <div key={post.$id} className='p-2 w-1/4'>
                            <PostCard {...post} />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    )
}

export default Home
```


create a new file:
src/pages/Post.jsx:
```
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";

export default function Post() {
    const [post, setPost] = useState(null);
    const { slug } = useParams();
    const navigate = useNavigate();

    const userData = useSelector((state) => state.auth.userData);

    const isAuthor = post && userData ? post.userId === userData.$id : false;

    useEffect(() => {
        if (slug) {
            appwriteService.getPost(slug).then((post) => {
                if (post) setPost(post);
                else navigate("/");
            });
        } else navigate("/");
    }, [slug, navigate]);

    const deletePost = () => {
        appwriteService.deletePost(post.$id).then((status) => {
            if (status) {
                appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        });
    };

    return post ? (
        <div className="py-8">
            <Container>
                <div className="w-full flex justify-center mb-4 relative border rounded-xl p-2">
                    <img
                        src={appwriteService.getFilePreview(post.featuredImage)}
                        alt={post.title}
                        className="rounded-xl"
                    />

                    {isAuthor && (
                        <div className="absolute right-6 top-6">
                            <Link to={`/edit-post/${post.$id}`}>
                                <Button bgColor="bg-green-500" className="mr-3">
                                    Edit
                                </Button>
                            </Link>
                            <Button bgColor="bg-red-500" onClick={deletePost}>
                                Delete
                            </Button>
                        </div>
                    )}
                </div>
                <div className="w-full mb-6">
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                </div>
                <div className="browser-css">
                    {parse(post.content)}
                </div>
            </Container>
        </div>
    ) : null;
}
```

Now, all pages are build.

Now, we will do routing.
Updated main.jsx:
```
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import Home from './pages/Home.jsx'
import { AuthLayout, Login } from './components/index.js'


import AddPost from "./pages/AddPost";
import Signup from './pages/Signup'
import EditPost from "./pages/EditPost";

import Post from "./pages/Post";

import AllPosts from "./pages/AllPosts";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: (
          <AuthLayout authentication={false}>
            <Login />
          </AuthLayout>
        ),
      },
      {
        path: "/signup",
        element: (
          <AuthLayout authentication={false}>
            <Signup />
          </AuthLayout>
        ),
      },
      {
        path: "/all-posts",
        element: (
          <AuthLayout authentication>
            {" "}
            <AllPosts />
          </AuthLayout>
        ),
      },
      {
        path: "/add-post",
        element: (
          <AuthLayout authentication>
            {" "}
            <AddPost />
          </AuthLayout>
        ),
      },
      {
        path: "/edit-post/:slug",
        element: (
          <AuthLayout authentication>
            {" "}
            <EditPost />
          </AuthLayout>
        ),
      },
      {
        path: "/post/:slug",
        element: <Post />,
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)
```

make detailed notes using the transcript and my given code.
make notes in english in md format.
never miss any point
explain things easily
also use comments in code













 -->
