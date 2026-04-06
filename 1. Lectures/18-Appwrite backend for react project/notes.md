# React Project Series — Tech Breakdown Notes
> **Video Type:** Decode / Overview Video  
> **Series:** React (Part of a continuing series — previous video required for context)

---

## ⚠️ Important Learning Advice

- This is a **continuation video** — watching the previous video is **mandatory** to understand what project is being built.
- **Do NOT try to code on your own first** — you will lose confidence.
- Recommended approach:
  1. Watch the full video once, calmly, without coding.
  2. Build confidence by understanding the flow.
  3. Then code **along with the video** simultaneously.
- Do not rush — the instructor intentionally keeps videos short for focused exploration.

---

## React's Core Limitation

- React is a **frontend library only**.
- It does **NOT** handle:
  - Databases
  - Backend logic
  - Authentication
  - Authorization
- React's primary job = **API Handling**:
  - Send a request to the backend.
  - Receive data from the backend.
  - Decide how to store it — `localStorage`, cookies, etc.
- Since there is no backend series yet, **third-party BaaS (Backend as a Service)** tools are used in this project.

---

## Project Problems to Solve

From the last video, the following real issues exist that need to be addressed:

| # | Problem |
|---|---------|
| 1 | **Image Upload** — How to upload, handle, and display original images (currently only preview/thumbnail version is loading, not the original). |
| 2 | **Rich Text Editor Formatting** — Bold, italic, underline, numbered lists, bullet lists are being created but need to be properly stored and re-rendered on the frontend. |
| 3 | The frontend receives HTML tags as strings — it doesn't know how to render them directly; a parsing solution is needed. |
| 4 | **State Management** — Managing complex application-wide state. |
| 5 | **Routing** — Navigating between pages/components. |
| 6 | **Environment Variables / Secrets** — Safely storing sensitive config like DB URLs and passwords. |

---

## Technologies & Services Used

### 1. 🔷 Appwrite — Backend as a Service (BaaS)

- **What it is:** A complete, open-source Backend as a Service.
- **Similar to:** Firebase — but **open source**.
- **Why use Appwrite over Firebase?**
  - Firebase is Google-proprietary (closed source).
  - Appwrite is open source — you can **self-host** it on your own server if needed.
  - **Data portability:** Export all your data in one click if you want to migrate to your own backend.
  - No vendor lock-in.
- **Pricing (Cloud version):**
  - **Free forever** tier available.
  - Includes **10 GB** storage.
  - Up to **75,000 monthly active users** on the free plan.
  - (If you hit 75K active users, you've already built a great app!)
- **How to get started:** Go to `appwrite.io` → Sign in → Create Project.

#### Appwrite Features Being Used:

**Authentication:**
- Email/password login & sign up.
- Also supports: Apple Login, Facebook Login, Microsoft Login, and more.
- User management dashboard:
  - View all registered users.
  - Update name, email, phone, password.
  - Add custom preferences.
  - Delete users.
  - View active sessions (where the user is logged in from).
  - Force logout a user.
  - Track user activity.

**Database:**
- One database will be created for the blog.
- Collection: `articles`
- Article document structure:

| Field | Description |
|-------|-------------|
| `id` | Unique article identifier (same as name/slug) |
| `title` | Title of the article |
| `content` | Full HTML content (bold, italic, lists, all formatting stored as HTML tags) |
| `featured_image` | Reference/URL to the image stored in Storage |
| `user_id` | ID of the user who created the article |
| `status` | Whether the post is active/published or inactive/draft |

- **Permissions system:** You can control who can Create, Update, Delete per collection.
  - E.g., all users can create/update/delete by default.
  - If you want to restrict delete → just uncheck "Delete" permission → done.
  - Custom roles can also be added.

**Storage:**
- Used to store images uploaded with articles.
- Appwrite Storage API methods:
  - `getFile` — get file details
  - `getFilePreview` — get a preview of the file
  - `getFileDownload` — download a file
  - `listFiles` — list all files in a bucket
  - `createFile` — upload a new file
    - Requires: `bucket_id`, `file_id`, and the actual file to upload.
- **Documentation must be read** every time — these APIs can't all be memorized.

---

### 2. 📝 TinyMCE — Rich Text Editor

- **What it is:** A React component for a full-featured WYSIWYG rich text editor.
- **Open source:** Yes.
- **Why use it:** Enables blog post writing with formatting (bold, italic, underline, lists, numbering, etc.).
- **Free version** will be used (paid cloud plan also available but not needed).
- **How to configure:** Read TinyMCE's documentation to decide which toolbar features to enable or disable.
- The editor stores output as **HTML strings** in the database.

---

### 3. 🔄 html-react-parser — HTML String to React Elements

- **Why needed:**
  - Article content is stored as raw HTML strings in the database.
  - Raw HTML **cannot be directly rendered** in React (security risk — becomes plain text / `dangerouslySetInnerHTML` concerns).
  - This library **parses** HTML strings and converts them to proper React elements.
- **Example:** A string like `<p>Hello World</p>` will be properly rendered as a paragraph, not as a raw string.

---

### 4. 📋 React Hook Form — Form Management

- **What it is:** A library for managing form state, validation, and submission in React.
- **Open source:** Yes (~36,000+ GitHub stars, growing rapidly).
- **Why use it (over manual handling):**
  - You *can* handle forms manually with `onChange`/`onSubmit` handlers — no problem.
  - But React Hook Form provides:
    - Better **error control**.
    - Easier **uncontrolled form** handling.
    - Cleaner code.
- **Key use case in this project — Auto Slug Generation:**
  - When user types an article title → slug is **auto-generated in real time**.
  - Spaces in the title are automatically replaced with hyphens (`-`) or slashes.
  - Challenge: Title state and Slug state are **two different states** — you can't use a single state for both.
  - React Hook Form's `watch` feature will be used to **monitor the title field constantly** and update the slug field in real time.
- **Other alternatives exist** (Formik, etc.) — may be discussed in future videos.

---

### 5. 🔐 Environment Variables — Secrets Management

- **Why important:**
  - Sensitive data like **database URL**, **database password**, **API keys** must never be exposed publicly.
  - Even if source code is made public (e.g., on GitHub), secrets must remain hidden.
- **Topics to be covered:**
  - What are environment variables?
  - How are they used in **Create React App (CRA)** vs **Vite**?
  - Difference between CRA env vars (`REACT_APP_`) and Vite env vars (`VITE_`).
  - How to transfer/configure secrets when deploying to production (Vercel, Netlify, etc.).
  - The process is the same across all platforms — only the UI/names differ.

---

### 6. 🗂️ Redux — State Management

- Will be used for **global state management** across the application.
- Described as the **professional/production-grade** approach.
- Details to be covered in upcoming videos.

---

### 7. 🔀 React Router — Routing

- Used for **client-side routing** / navigation between pages.
- Will be covered in the project build.

---

## Documentation Reading — Key Skill

- A **major learning goal** of this project is to get comfortable reading official documentation.
- In the real world, you cannot memorize every API — you must read docs each time.
- Libraries covered in docs reading:
  - **Appwrite** — Storage API, Auth API, Database API.
  - **TinyMCE** — Configuration and feature toggling.
  - **React Hook Form** — Form handling patterns.
- Sample docs reading exercise (Appwrite Storage):
  - Want to upload a file? → Read `createFile` → needs bucket ID, file ID, file data.
  - Want to preview? → Read `getFilePreview`.
  - Want to list files? → Read `listFiles`.

---

## Why Not Build a Custom Backend?

- Building a custom backend would make this project **significantly larger**.
- It requires backend knowledge (Node.js/Express/etc.) which is a **separate series**.
- A backend series will be started **based on community support** (500+ comments per video threshold mentioned).
- For now, Appwrite handles all backend needs.

---

## Project's Full Feature List (Summary)

- ✅ User Registration & Login
- ✅ Error handling for auth (wrong password, invalid email, etc.)
- ✅ Image Upload & Display (original, not just preview)
- ✅ Rich Text Blog Editor (TinyMCE)
- ✅ HTML Content Rendering (html-react-parser)
- ✅ Auto Slug Generation from Title (React Hook Form + watch)
- ✅ Article CRUD (Create, Read, Update, Delete) with permission control
- ✅ Post Status (Active / Inactive)
- ✅ Redux State Management
- ✅ React Router Routing
- ✅ Environment Variables for secrets
- ✅ Production-grade deployment setup

---

## Action Items / Homework Before Next Video

| Task | Status |
|------|--------|
| Create a free **Appwrite account** at `appwrite.io` | Do this now |
| Explore Appwrite dashboard (Auth, DB, Storage sections) | Optional but helpful |
| Skim **TinyMCE documentation** | Optional |
| Skim **React Hook Form documentation** | Optional |

---

## What's Coming in the Next Video

- Set up **Appwrite project** from scratch (step-by-step to avoid common config mistakes).
- Set up the **React project** with Vite.
- Configure **environment variables**.
- Link React frontend with Appwrite backend.

---

## Key Mindset Points

- All tools/resources discussed on this channel have a **free version** available.
- Everything is **cross-platform** (Mac, Linux, Windows).
- Open source is preferred whenever possible.
- Reading documentation is a **real-world skill** — get used to it now.
- To contribute to open source libraries, you must first use and understand them deeply.

---

