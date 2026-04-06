# Appwrite Authentication Service — Detailed Notes
### Chai aur React — Mega Project Series

---

## Table of Contents

1. [Why Create a Service Layer?](#1-why-create-a-service-layer)
2. [What is Vendor Lock-in?](#2-what-is-vendor-lock-in)
3. [What is a Service?](#3-what-is-a-service)
4. [Project Folder Structure](#4-project-folder-structure)
5. [Understanding Appwrite Documentation](#5-understanding-appwrite-documentation)
6. [Building the Auth Service — Step by Step](#6-building-the-auth-service--step-by-step)
7. [Complete Code with Line-by-Line Explanation](#7-complete-code-with-line-by-line-explanation)
8. [Method Deep Dives](#8-method-deep-dives)
9. [Why Export an Object, Not a Class?](#9-why-export-an-object-not-a-class)
10. [Key JavaScript Concepts Used](#10-key-javascript-concepts-used)
11. [Future-Proof Code Philosophy](#11-future-proof-code-philosophy)
12. [What's Coming Next — Database Service](#12-whats-coming-next--database-service)
13. [Quick Summary Cheatsheet](#13-quick-summary-cheatsheet)

---

## 1. Why Create a Service Layer?

When building a production-grade application, you use multiple external services:

- **Database services** (Appwrite DB, Firebase Firestore, custom backend)
- **Authentication services** (Appwrite Auth, Firebase Auth, Auth0)
- **Storage services** (Appwrite Storage, AWS S3, Cloudinary)

A very common mistake beginners make is to directly write third-party SDK calls **inside their UI components**. This leads to a messy mix of:

- UI logic (what the page looks like)
- Business logic (what should happen when a button is clicked)
- Service logic (how the data gets saved or authenticated)

**The problem:** If tomorrow you need to switch from Appwrite to Firebase, you'd have to hunt down every single component in your app and change the code. This is time-consuming, error-prone, and unprofessional.

**The solution:** A **Service Layer** — a dedicated file/class whose only job is to talk to the external service. The rest of your app only talks to this service file, never directly to Appwrite.

---

## 2. What is Vendor Lock-in?

**Vendor Lock-in** means your application is so tightly coupled to one specific provider (e.g., Appwrite) that switching to another provider is extremely difficult or costly.

### Example of Vendor Lock-in (BAD approach):

Imagine you wrote `this.account.create(...)` directly inside 10 different React components. Now your client says "switch to Firebase." You now have to:

1. Open all 10 components
2. Remove Appwrite code
3. Write Firebase code
4. Test each component

This is vendor lock-in — your code is **locked** to Appwrite everywhere.

### How a Service Layer solves it:

With a service layer, your components only call something like:

```js
authService.createAccount({ email, password, name });
```

Tomorrow, if you switch to Firebase, you **only change the inside of `auth.js`**. Every single component still calls the exact same method name with the same parameters. **Zero changes needed in the rest of the app.**

---

## 3. What is a Service?

A **Service** is simply a **class** that:

1. Encapsulates all the logic for interacting with an external system
2. Exposes clean **methods** (functions) to the rest of the app
3. Hides **what is happening under the hood** from everyone else

This concept exists in every programming language:

- Java → Service classes
- Python → Service modules
- JavaScript → Service classes

The caller (your React component) only needs to know:
- **What method to call** (e.g., `login`)
- **What data to pass** (e.g., `{ email, password }`)
- **What it returns** (e.g., a user session object)

The caller does **NOT** need to know:
- Whether you're using Appwrite, Firebase, or a custom API
- How the authentication works internally
- What happens to the data inside

---

## 4. Project Folder Structure

Since all Appwrite-related code will live in one place:

```
src/
├── appwrite/
│   ├── auth.js          ← Authentication service (this lecture)
│   └── config.js        ← Database/storage service (next lecture)
├── conf/
│   └── conf.js          ← Environment variables config
└── ...
```

The folder is named `appwrite` because everything inside relates to the Appwrite backend service. Other names you might see in real projects: `services/`, `api/`, `lib/`.

---

## 5. Understanding Appwrite Documentation

Before writing any code, always consult the Appwrite documentation. Key sections relevant to authentication:

### Authentication Overview (from docs)

To use Appwrite authentication, you need:

1. **A Client** — the base Appwrite connection object. Requires:
   - `endpoint` — the URL of your Appwrite server (stored in environment variables)
   - `projectId` — your specific project's ID (stored in environment variables)

2. **An Account** — built on top of the Client. The `Account` object is where all authentication methods live:
   - `account.create()` — register a new user
   - `account.createEmailSession()` — log in with email & password
   - `account.get()` — get the currently logged-in user
   - `account.deleteSessions()` — log out (delete all sessions)

### Appwrite uses Promises

All Appwrite methods return **Promises**, which means:
- You must use `async/await` or `.then()/.catch()`
- Operations are **asynchronous** (they take time — network request to the server)
- If you don't `await` them, your code will move on before the result is ready

### Unique ID generation

Appwrite provides a built-in `ID` utility:
```js
import { ID } from "appwrite";
ID.unique(); // generates a globally unique ID string
```

This is used when creating a new user account — every user needs a unique ID.

---

## 6. Building the Auth Service — Step by Step

### Step 1: Create the file

```
src/appwrite/auth.js
```

### Step 2: Import dependencies

```js
import conf from '../conf/conf.js';
import { Client, Account, ID } from "appwrite";
```

- `conf` → your configuration object that holds environment variables (Appwrite URL, project ID)
- `Client` → Appwrite's base connection class
- `Account` → Appwrite's authentication class (built on top of Client)
- `ID` → Appwrite's utility for generating unique IDs

### Step 3: Define and export the class

```js
export class AuthService {
    // ...
}
```

The class is named `AuthService` to clearly communicate its purpose.

### Step 4: Declare class properties

```js
client = new Client();
account;
```

- `client` is initialized immediately as a new Appwrite Client instance
- `account` is declared but not assigned yet — it will be assigned in the constructor after the client is configured

### Step 5: Write the constructor

The **constructor** runs automatically when a new object is created from this class.

```js
constructor() {
    this.client
        .setEndpoint(conf.appwriteUrl)
        .setProject(conf.appwriteProjectId);
    this.account = new Account(this.client);
}
```

**Why put this in the constructor and not directly in the class body?**

If you assigned `account` directly in the class body like `account = new Account(this.client)`, JavaScript would try to create the Account object immediately when the class is defined — but `this.client` hasn't been configured yet at that point.

By using the constructor:
- The client is first fully configured (endpoint + projectId set)
- Then the Account object is created using that configured client
- This happens only when someone actually creates an instance of the class

**Method chaining:**
```js
this.client
    .setEndpoint(conf.appwriteUrl)     // sets the Appwrite server URL
    .setProject(conf.appwriteProjectId); // sets your project ID
```
These two methods return `this` (the client object), so they can be chained.

---

## 7. Complete Code with Line-by-Line Explanation

```js
import conf from '../conf/conf.js';
import { Client, Account, ID } from "appwrite";
```
> Import the config object and necessary Appwrite classes.

```js
export class AuthService {
```
> Define and export the class so it can be imported elsewhere.

```js
    client = new Client();
    account;
```
> Declare class-level properties. `client` gets a fresh Appwrite Client. `account` is just declared — will be assigned in the constructor.

```js
    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
    }
```
> When an object of this class is created, the Appwrite client is configured and the Account object is initialized.

```js
    async createAccount({email, password, name}) {
```
> An async method that accepts a **destructured object** with `email`, `password`, and `name`. The caller passes `{ email: "...", password: "...", name: "..." }`.

```js
        try {
            const userAccount = await this.account.create(ID.unique(), email, password, name);
```
> Call Appwrite's account creation method. Arguments:
> - `ID.unique()` — auto-generated unique user ID (Appwrite requires this as the first argument)
> - `email` — the user's email
> - `password` — the user's password (Appwrite handles hashing automatically)
> - `name` — the user's display name
>
> `await` pauses execution until this Promise resolves.

```js
            if (userAccount) {
                return this.login({email, password});
```
> If the account was created successfully, **immediately log the user in** by calling the `login` method. This is a design decision — instead of making the user log in manually after registration, we do it automatically for a smoother UX.

```js
            } else {
               return userAccount;
            }
```
> If `userAccount` is falsy (null/undefined), return it as-is. The calling component can handle this case.

```js
        } catch (error) {
            throw error;
        }
    }
```
> If anything goes wrong (network error, duplicate email, etc.), re-throw the error so the calling component can catch and display it to the user.

```js
    async login({email, password}) {
        try {
            return await this.account.createEmailSession(email, password);
```
> `createEmailSession` is the Appwrite method for logging in with email and password. It creates a **session** (a record that this user is logged in). The session is returned and passed back to the caller.

```js
        } catch (error) {
            throw error;
        }
    }
```
> Any login errors (wrong password, user not found) are thrown for the UI to handle.

```js
    async getCurrentUser() {
        try {
            return await this.account.get();
```
> `account.get()` checks the current session and returns the logged-in user's data. If no one is logged in, it throws an error (caught below).

```js
        } catch (error) {
            console.log("Appwrite serive :: getCurrentUser :: error", error);
        }
        return null;
    }
```
> Unlike `createAccount` and `login`, here we **do NOT throw** the error. Instead:
> - We log it to the console (for debugging purposes)
> - We return `null`
>
> **Why?** Because `getCurrentUser` is often called on page load to check if someone is logged in. If no session exists, that's not really an error — it's just the "not logged in" state. Throwing an error here would crash the app unnecessarily.
>
> The `return null` outside the try-catch is a safety net — if somehow execution reaches outside the try block without a return value, `null` is returned.

```js
    async logout() {
        try {
            await this.account.deleteSessions();
```
> `deleteSessions()` (with an 's') deletes **all active sessions** for the current user — meaning they're logged out from all browsers and devices simultaneously.
>
> Note the difference:
> - `deleteSessions()` → deletes ALL sessions (logout everywhere)
> - `deleteSession(sessionId)` → deletes one specific session

```js
        } catch (error) {
            console.log("Appwrite serive :: logout :: error", error);
        }
    }
```
> Logout errors are logged but not thrown — a failed logout attempt shouldn't crash the app. The error message format `"Appwrite serive :: logout :: error"` is a naming convention for quickly identifying where an error came from in the console.

```js
const authService = new AuthService();

export default authService
```
> A single instance of `AuthService` is created and exported as the **default export**. This is the key pattern — explained in detail below.

---

## 8. Method Deep Dives

### `createAccount` — Registration Flow

```
User fills signup form
        ↓
Component calls authService.createAccount({ email, password, name })
        ↓
auth.js internally calls: this.account.create(ID.unique(), email, password, name)
        ↓
If account created → automatically calls this.login({ email, password })
        ↓
Returns session object (user is now logged in)
        ↓
Component receives session, redirects user to dashboard
```

**Why auto-login after registration?**
Most apps want users to be immediately active after signing up. Instead of redirecting to a login page, we call `this.login()` internally. The calling component doesn't even know this happened — it just receives a session.

**Why does Appwrite need a user ID from us?**
Appwrite gives you control over user IDs. By using `ID.unique()`, you let Appwrite generate one automatically (similar to how MongoDB generates `_id` or how Appwrite's own IDs work).

---

### `login` — Sign In Flow

```
User fills login form
        ↓
Component calls authService.login({ email, password })
        ↓
auth.js calls: this.account.createEmailSession(email, password)
        ↓
Appwrite verifies credentials and creates a session
        ↓
Session object returned to component
```

**What is a session?**
Appwrite, like most backends, tracks logged-in users via **sessions** — tokens stored in cookies or local storage. When you call `createEmailSession`, Appwrite stores this session and uses it for all subsequent requests to verify the user is authenticated.

---

### `getCurrentUser` — Check Login Status

**When is this used?**
Primarily called on app load. For example, if a user was logged in yesterday and opens the app today, you want to check if their session is still valid without making them log in again.

```
App loads / component mounts
        ↓
Component calls authService.getCurrentUser()
        ↓
auth.js calls: this.account.get()
        ↓
If session exists → returns user object
If no session → error is caught, returns null
        ↓
Component checks: if user is null → show login page
                  if user exists → show dashboard
```

---

### `logout` — Sign Out Flow

```
User clicks "Logout" button
        ↓
Component calls authService.logout()
        ↓
auth.js calls: this.account.deleteSessions()
        ↓
All sessions are deleted on Appwrite's server
        ↓
Component redirects user to login page
```

**`deleteSessions()` vs `deleteSession()`**

| Method | What it does |
|--------|-------------|
| `deleteSessions()` | Logs out from ALL devices at once |
| `deleteSession(sessionId)` | Logs out from one specific session |
| `deleteSession("current")` | Logs out from the current browser only |

Using `deleteSessions()` is more secure — ensures the user is completely signed out everywhere.

---

## 9. Why Export an Object, Not a Class?

### Option A (Bad): Export the class itself

```js
export default AuthService; // export the class
```

Now every component that wants to use it must:
```js
import AuthService from './appwrite/auth.js';
const authService = new AuthService(); // must create instance manually
authService.login({ email, password });
```

**Problem:** Every file creates its own instance. This wastes memory and can cause inconsistent state.

### Option B (Good): Export a pre-made instance (used in this code)

```js
const authService = new AuthService(); // create ONE instance
export default authService; // export the instance
```

Now every component that imports it:
```js
import authService from './appwrite/auth.js';
authService.login({ email, password }); // use directly — no 'new' needed
```

**Benefits:**
- **Singleton pattern** — only one instance exists across the entire app
- **Simpler usage** — no need to call `new AuthService()` anywhere else
- **Consistent state** — if the service ever stores any state, it's shared across all uses

### Option C (Best of both worlds): Named + default export

The code does both:
```js
export class AuthService { ... }  // named export (for testing or extending)
export default authService;        // default export (for direct use)
```

This way, you can import the class if you need it (e.g., for unit testing), or import the ready-to-use instance for actual app use.

---

## 10. Key JavaScript Concepts Used

### `async/await`

All Appwrite methods return Promises. Using `async/await`:
```js
async login({ email, password }) {
    return await this.account.createEmailSession(email, password);
    // Without await, this returns a Promise object, not the actual result
}
```

### `try/catch`

Wrapping async operations in try/catch handles failures gracefully:
```js
try {
    // attempt the operation
    const result = await this.account.get();
    return result;
} catch (error) {
    // handle the failure
    console.log(error);
    return null;
}
```

### Destructuring in function parameters

Instead of:
```js
async createAccount(userData) {
    const email = userData.email;
    const password = userData.password;
    const name = userData.name;
}
```

We write:
```js
async createAccount({ email, password, name }) {
    // email, password, name are directly available
}
```

This is cleaner and more readable. The caller passes a single object:
```js
authService.createAccount({ email: "a@b.com", password: "secret", name: "Alice" });
```

### Class properties vs constructor

```js
class AuthService {
    client = new Client();   // class property — initialized when instance is created
    account;                 // declared but not assigned yet

    constructor() {
        // configure client first
        this.client.setEndpoint(...).setProject(...);
        // then create account using configured client
        this.account = new Account(this.client);
    }
}
```

**Why not assign `account` as a class property?**
```js
// This would FAIL:
account = new Account(this.client);
// Because at class property initialization time,
// this.client hasn't been configured yet!
```

The constructor ensures ordering: configure client first, then use it.

### `throw error` vs `console.log(error)`

| Situation | What to do | Why |
|-----------|-----------|-----|
| `createAccount` fails | `throw error` | The UI needs to show "Email already taken" or similar |
| `login` fails | `throw error` | The UI needs to show "Wrong password" |
| `getCurrentUser` fails | `console.log(error)` + return null | Failure just means "not logged in" — not a real error |
| `logout` fails | `console.log(error)` | Rarely critical, app should continue |

---

## 11. Future-Proof Code Philosophy

The entire purpose of building a service layer is **future-proofing**.

### Scenario: Switching from Appwrite to Firebase

**Without service layer:**
- Search entire codebase for every Appwrite call
- 20+ files to change
- High risk of missing something
- Hours of work and testing

**With service layer:**

You only change `auth.js`. The public interface (method names and parameters) stays identical:

```js
// BEFORE (Appwrite)
async login({ email, password }) {
    return await this.account.createEmailSession(email, password);
}

// AFTER (Firebase)
async login({ email, password }) {
    return await signInWithEmailAndPassword(auth, email, password);
}
```

Every single component in the app still calls:
```js
authService.login({ email, password });
```

**They don't need to change at all.**

### The contract

The service layer establishes a **contract** with the rest of the app:
- "I will always accept `{ email, password }` for login"
- "I will always return a session object or throw an error"
- "What I do internally is none of your business"

This is the same contract-based thinking used in professional software engineering.

---

## 12. What's Coming Next — Database Service

Just like authentication has a service file (`auth.js`), the database interactions also need their own service file (`config.js` or similar).

The database service will handle:
- Adding documents to a collection
- Fetching documents
- Updating documents
- Deleting documents

It will follow the exact same pattern:
- A class wrapping Appwrite's database SDK
- Methods like `createPost`, `updatePost`, `deletePost`, `getPost`, etc.
- A single exported instance

The instructor mentioned this will be **80% implemented in class, 20% left as an assignment** — so students practice writing service methods on their own.

---

## 13. Quick Summary Cheatsheet

### The File: `src/appwrite/auth.js`

| Section | What it does |
|---------|-------------|
| Imports | Pulls in `conf`, `Client`, `Account`, `ID` from Appwrite |
| Class properties | Declares `client` and `account` |
| Constructor | Configures client with URL + projectId, creates Account |
| `createAccount` | Registers user → auto-logs them in |
| `login` | Creates an email session (signs user in) |
| `getCurrentUser` | Returns logged-in user or null |
| `logout` | Deletes all sessions (signs out everywhere) |
| Bottom of file | Creates one instance, exports it as default |

### Key Design Decisions

| Decision | Reason |
|----------|--------|
| Wrap everything in a class | Keeps related functionality together |
| Use constructor for setup | Ensures client is configured before Account is created |
| Export instance, not class | Singleton — one object, used everywhere |
| `throw` in create/login | UI needs to show error messages |
| `console.log` in getCurrentUser/logout | These failures aren't critical to the user |
| Auto-login after registration | Better UX — user doesn't need to log in manually |
| Destructure parameters | Clean, readable function signatures |

### The Big Picture

```
React Component
      ↓
authService.someMethod({ data })
      ↓
auth.js (the service)
      ↓
Appwrite SDK (or Firebase, or your own API)
      ↓
Appwrite Server
```

The arrow only flows **downward**. Components never know what's below the service layer. This is clean, maintainable, professional code architecture.

---



<!-- Transcript:
```
हां जी स्वागत है आप सभी का चाय और कोड
में और स्टार्ट करते हैं हमारी एक और
वीडियो कंटिन्यूएशन में है हमारी चाय और
रिएक्ट वाली सीरीज में हम बना रहे हैं
हमारा मेगा प्रोजेक्ट तो ऑलमोस्ट सेटअप
हमने कर लिया है काफी हमने डिटेल में
चर्चा करी एनवायरमेंट वेरिएबल पे
क्या-क्या आप आगे प्रोडक्शन में
प्रॉब्लम्स फेस कर सकते हो ताकि आप एक
अच्छे प्रोग्रामर डे वन पे कंट्रीब्यूट
करने वाले प्रोग्रामर बनो अब यहां पर हम
चलेंगे हमारी नेक्स्ट जर्नी पर जो बहुत ही
इंपॉर्टेंट जर्नी और यहां पर हमें काफी
कोड लिखना पड़ेगा अब कोड लिखने का जो
प्रोसेस है वो बड़ा ही सिंपल है लेकिन किस
तरह से लिखा जाता है वो मैं आपके साथ में
शेयर करता हूं तो देखिए हम यूज कर रहे हैं
पप राइट राइट के अंदर मल्टीपल सर्विसेस
हैं डेटाबेस रिलेटेड सर्विसेस है
ऑथेंटिकेशन रिलेटेड सर्विसेस हैं चीजों को
अपलोड डाउनलोड करने के रिलेटेड सर्विसेस
है तो हम सबके बारे में डिस्कस करेंगे
लेकिन यहां पे एक कांसेप्ट आता है कई बार
हर बार नहीं आता है कई बार आता है वेंडर
लॉकइन का तो कोड कुछ इस तरह से लिखना है
कि कल को अगर आपकी ऐप का ऑथेंटिकेशन
सिस्टम आपको निकालना पड़े राइट से बाहर तो
भी आपकी एप्लीकेशन कंटीन्यूअसली चल पाए और
इतना ज्यादा पूरी एप्लीकेशन में प्रॉब्लम
ना आए तो यहां पे कांसेप्ट इंट्रोड्यूस
होता है सर्विसेस का तो सर्विस क्या है
कुछ नहीं है एक क्लास बनती है और कुछ नहीं
है अब हर लैंग्वेज में बनती है
जावास्क्रिप्ट में भी उसी तरह से बनती है
जावा में भी बनती है तो सर्विसेस बनाई
जाती है वो सर्विसेस कुछ इस तरह से बनाई
जाती है कि वहां से हम कुछ मेथड एक्सपोर्ट
करते हैं उन मेथड के अंदर क्या हो रहा है
इससे किसी को कोई मतलब नहीं होता है बस
क्या-क्या डाटा चाहिए वो मुझे बताओ मेरा
मेथड यूज़ करो
दैट्ची से बात कर रहा हूं फायरबेस से बात
कर रहा हूं मेरे कस्टम डेटाबेस से बात कर
रहा हूं आपको बाकी एप्लीकेशन को इससे मतलब
ही नहीं होता है तो इसको मैं हाफ पोर्शन
में इसको इंप्लीमेंट करके दिखाऊंगा हाफ
पोर्शन में आपको इसको फर्द अपडेट करना है
तो बड़ा इंटरेस्टिंग कांसेप्ट है बहुत मजा
आता है इसके अंदर तो चलिए सबसे पहले तो हम
बात करते हैं हमारे पप राइट के बारे में
तो ये है हमारा पप राइट का डॉक्यूमेंटेशन
अब आप डॉक्यूमेंटेशन देखेंगे तो बड़े
अच्छे ही कैटेगरी इज कर रखा है ये अब जैसे
यहां पे ऑथेंटिकेशन है स्टोरेज है डेटाबेस
है तो अलग-अलग चीजों को जिसके बारे में भी
आपको को पढ़ना है आप पढ़ सकते हैं अब जैसे
मुझे पढ़ना है ऑथेंटिकेशन कैसे करना है तो
जैसे ही मैं ऑथेंटिकेशन पे क्लिक करता हूं
ये मेरा ऑथेंटिकेशन आ जाता है अब देखिए
ऑथेंटिकेशन में यहां सबसे पहले जो दे रखा
है वो है अपना ये अ गेटिंग स्टार्टेड गाइड
और उसके बाद है अकाउंट एंड यूजर एपीआई तो
उसके बारे में भी देखेंगे बट यहां पे कुछ
एक बेसिक कोड है कि आपको यह तो चाहिए
चाहिए अब इस कोड को अगर आप गौर से देखेंगे
तो एक्चुअली में पहले एक क्लाइंट बनाना
पड़ता है जैसे ही एक क्लाइंट बन जाता है
उसके अंदर आपको चाहिए एंड पॉइंट्स और एक
प्रोजेक्ट तो एंड पॉइंट्स में लगता है
हमारा एंड पॉइंट जो हमने एनवायरनमेंट
वेरिएबल में ऑलरेडी इंजेक्ट कर रखा है
प्रोजेक्ट आईडी आपको देना पड़ता है यहां
पे वो हम एनवायरमेंट वेरिएबल से वापस से
उठा लेंगे हमने रख रखा है वहां पे उसके
बाद एक बनता है अकाउंट अच्छा अकाउंट बनेगा
कब जब आपके पास क्लाइंट होगा तो पहले
क्लाइंट चाहिए का क्लाइंट इस तरह से
मिलेगा हमें और फिर एक अकाउंट बनेगा और
फिर इस अकाउंट पे मैं क्या कर सकता हूं
मेथड कॉल कर सकता हूं कि डॉट क्रिएट तो
हमारा एक अकाउंट क्रिएट हो जाएगा जिसके
पास एक आईडी ले लेंगे तो आईडी यहां से आ
जाएगी यूनिक आईडी ले लेंगे जैसे हमने नो
आईडी ली थी एक पिछले प्रोजेक्ट में तो
देखा पुराने कांसेप्ट काम में आ रहे हैं
और यहां पे इसने स्ट्रिंग में ईमेल आईडी
और पासवर्ड दे दिया है तो स्ट्रिंग में ले
लीजिए आपको कुछ भी इंक्रिप्शन वगैरह का
ध्यान नहीं रखना है राइट अपने आप ध्यान
रखेगा यह बड़ी इंटरेस्टिंग चीज़ है यहां
पे तो इसी को यूज़ करते हुए हम एक्चुअली
में अपने कोड पे चलते हैं और कोड के अंदर
हम अपना काम करेंगे तो देखिए क्योंकि मैं
यहां पे सर्विस बनाना चाहता हूं तो वह
सर्विस क्या है पप राइट रिलेटेड है तो
सोर्स के अंदर मैं एक नया फोल्डर ही बना
देता हूं पूरा कि पप राइट रिलेटेड जो भी
काम होगा अ वह यहां पे करेंगे तो यह हो
गया हमारा पप राइट अब इस एप राइट के अंदर
पहला जो सबसे पहला फोल्डर हम बनाएंगे वो
होगा हमारा थ और a.js क्योंकि कोई जेएस एक
है नहीं प्योर प्योर सर्विस बनेगा कई लोग
इसका नाम थ अर सवि
अंदर मेरे पास वो वैल्यूज अवेलेबल है ठीक
है कन्फ मेरे पास आ गया है यहां पे अब बस
इतना सा ध्यान रखिएगा कि कन्फ के अंदर
हमने इसको कन्फ ही बोला है कॉन्फिन नहीं
बोला है तो प्लीज सजेशंस पे जाइएगा वहां
पे ध्यान रखिएगा दूसरी चीज मुझे पता है
डॉक्यूमेंटेशन से मुझे ये फर्स्ट लाइन
चाहिए तो फर्स्ट लाइन आप चाहे तो यहां से
ले सकते हैं चाहे तो खुद लिख लीजिए आपका
जैसा मन करे वैसा कीजिए तो क्लाइंट मिल
गया अकाउंट मिल गया आईडी मिल गया अब देखिए
करने को तो हम यह काम भी कर सकते हैं एज
इट इज इसको उठाइए यहां से कॉपी कीजिए और
यहां पे पेस्ट कर दीजिए आपको कोई इशू नहीं
है आपके पास सारा काम हो जाएगा लेकिन यह
काम तो आप कहीं पे भी कर सकते थे लेकिन
रीजन क्या है इसकी सर्विस बनाने का कि अगर
मैं इसको एक बार काम में ले लूंगा तो ये
अकाउंट डॉट क्रिएट यहां तो मैनुअली देना
पड़ेगा तो जो रजिस्टर मेरा जो कंपोनेंट
बनेगा वहां पे मुझे ये सब एक्सपोज करना
पड़ेगा तो थोड़ा सा इशू आ सकता है कि हर
जगह आपका यूआई भी इंजेक्ट हो रखा है आपका
बिजनेस लॉजिक भी इंजेक्ट हो रखा है तो कई
बार ये बहुत ही प्रॉब्लम कर देता है तो
इससे बेटर अप्रोच क्या है इसको इस तरह से
ना लिखें ये थोड़ा सा हमारा कोड
इंप्रूवमेंट है जो बोलते हैं ना कि सर
मुझे क्वालिटी कोड लिखना सिखाई वो इस तरह
से ही लिखा जाता है तो सबसे पहले क्या
करते हैं हम एक एक्सपोर्ट करते हैं यहां
पे क्लास और क्लास का नाम देते हैं हम ऑथ
सर्विस अब क्लास का नाम आप कुछ भी दीजिए
उससे कोई फर्क नहीं पड़ता ये बन गई हमारी
क्लास दूसरी चीज हम इस क्लास को सीधा
एक्सपोर्ट कर देते हैं तो एक्सपोर्ट अ
डिफॉल्ट और क्लास का नाम दे देते हैं तो
ऑथ सर्विस हम यहां पे दे देते हैं ठीक है
ये हमने ऑथ सर्विस अभी क्या करा सिंपली
क्लास बनाई एक्सपोर्ट कर दिया अच्छा आपने
क्लास तो बना ली और सीधे के सीधे
एक्सपोर्ट कर ली तो इस क्लास को जो भी यूज
करेगा उसको एक नया ऑब्जेक्ट बनाना पड़ेगा
इस क्लास से हां जी तभी तो सारे मेथड वो
एक्स अ यूज कर पाएगा वहां पे तो क्यों ना
मैं ऐसा करूं कि सीधा एक ऑब्जेक्ट बना के
एक्सपोर्ट कर दूं वो बेटर अप्रोच रहेगा कि
उसको कुछ करना ही नहीं है डायरेक्टली
ऑब्जेक्ट को ही इंपोर्ट कर लो और ऑब्जेक्ट
पे सारे मेथड्स लगे लगाए हैं तो वह किस
तरह से होगा तो मैं क्या करता हूं यहां पे
एक बना लेता हूं ऑथ सर्विस तो यह हमारा
लोअर केस है क्योंकि इसको मैं बनाऊंगा
न्यू यूज करके न्यू ऑथ सर्विस अब क्या
करूंगा यह जो लोअर केस वाला ये ऑब्जेक्ट
है तो इस ऑब्जेक्ट को सीधे ही मैं यहां पे
एक्सपोर्ट कर दूंगा तो जो भी इसको इंपोर्ट
करेगा उसको क्या करना है कुछ नहीं वो सीधा
ऑ सर्विस को लेगा और डॉट करके जो भी मेथड
मैं इसके अंदर बनाऊंगा उन सबका एक्सेस ले
पाएगा हां जी तो ये बड़ा ही इंटरेस्टिंग
केस हो गया यहां पे अब क्योंकि आपने न्यू
कीवर्ड यूज कर लिया है तो ओबवियस सी बात
है आप कंस्ट्रक्टर वगैरह सब कुछ कॉल कर
रहे हो सारा यूज करोगे अब जो नेक्स्ट
प्रॉब्लम है वो ये है कि देखो एक तो चाहिए
क्लाइंट और एक बनाना पड़ेगा अकाउंट
क्योंकि सारे मेथड्स जो है ना वो अकाउंट
पे ही एक्चुअली में लगते हैं जैसे डॉट
क्रिएट है लॉग आउट है और भी यहां पर
देखोगे तो काफी मेथड्स है यहां पे कि किस
तरह से आपको लॉग इन करना है मैनेज यूजर
करना है जो भी करना है सारे के सारे
मेथड्स उसी तरह से ही लगते हैं आप फंक्शंस
में भी देख सकते हैं और भी अ ईमेल एंड
पासवर्ड यहां पर देखते हैं हम क्लिक करके
तो आप देखेंगे कि किस तरह से अकाउंट बन
रहे है तो डॉट क्रिएट हो रहा है
वेरिफिकेशन के अंदर डॉट क्रिएट वेरिफिकेशन
हो रहा है तो जो भी आपको काम करना पड़ेगा
वो लगेगा इसी पे ही तो अब हम क्या करते
हैं यहां पर आते हैं और सबसे पहले क्या
करते हैं दो हम प्रॉपर्टीज बना लेते हैं
तो पहली हमारे पास है प्रॉपर्टी और पहली
प्रॉपर्टी देखिए यहां पे भी क्या से बन
रखी है तो आप देखेंगे तो क्लाइंट को न्यू
क्लाइंट करके बनाना पड़ता है और फिर आपके
डॉट सेट एंड पॉइंट और ये सब लगाने पड़ते
हैं तो अभी हम क्या करते हैं इसको सिंपली
बोल देते हैं क्योंकि हमने क्लाइंट और ये
तो टॉप में एक्सपोर्ट इंपोर्ट कर ही लिए
हैं तो हम सिंपली बनाते हैं क्लाइंट और
क्लाइंट कैसे बनेगा न्यू क्लाइंट ठीक है
क्लाइंट बन गया अब जो है दूसरा चाहिए
अकाउंट अब देखिए अकाउंट कहने को तो मैं
न्यू अकाउंट करके ये बना ही लेता लेकिन
प्रॉब्लम क्या है ये अकाउंट का मेरा
वेरिएबल है सिर्फ इसको इसी तरह से रखना
पड़ेगा क्यों क्योंकि देखिए अकाउंट जो बन
रहा है ना वो न्यू अकाउंट से तो बन रहा है
लेकिन एक लाइट के पास पहले आपको य सेट एंड
पॉइंट सेट प्रोजेक्ट ये बनाने पड़ेंगे
अच्छा यहीं पे क्यों नहीं बना देता यहां
पे एक्चुअली बना के कोई सेंस नहीं है
क्योंकि यह आप बना तो लोगे अ लेकिन व
क्लास के अंदर बाय डिफॉल्ट ही बन गया है
मैं चाहता हूं यह तो वेस्टेज ऑफ रिसोर्सेस
है एक्चुअली में जब ये ऑब्जेक्ट कोई बनाए
तब यहां पे एक्चुअली में क्लाइंट बनना
चाहिए तब आपके पास प्रॉपर्ली एक अकाउंट का
एक्सेस होना चाहिए तो ऑब्जेक्ट जब बनेगा
तब ऐसा कौन सा मेथड है जो जो अपने आप कॉल
होता है जिसके अंदर मैं फंक्शनैलिटी रख
सकूं तो वहां पे मैं एक कंस्ट्रक्टर बना
देता हूं तो ये लीजिए कंस्ट्रक्टर बन गया
अब इस कंस्ट्रक्टर के अंदर क्या करूंगा
सबसे पहले तो मैं अ क्लाइंट का रेफरेंस
दूंगा तो ओबवियस सी बात है दिस यूज़ करना
पड़ेगा तो दिस डॉ क्ट तो यह दिस ड क्लाइंट
लिया अब इसके अंदर क्या कर सकते हैं वह
सारे मेथड यूज़ कर सकते हैं डॉट सेट एंड
पॉइंट और सेट प्रोजेक्ट तो हम क्या करते
हैं यहां पे सीधा इसको बोल देते हैं
नेक्स्ट लाइन में लिख लेते हैं तो सेट एंड
पॉइंट और सेट प्रोजेक्ट हम यहां पे ले
लेते हैं यह सेट की हमारे पास नहीं है
इसको को हम हटा देते हैं यहां पे अ ठीक है
अब क्योंकि कॉन्स के अंदर मैंने अ एंड
पॉइंट और प्रोजेक्ट आईडी ये लिख रखे हैं
क्या तो पहले हमें देखना पड़ेगा कॉफ के
अंदर क्या-क्या वेरिएबल है हमारे पास में
तो कॉफ के अंदर हमारे पास में ओ एक्चुअली
मैं इसको क्लोज करते हैं सेव करते हैं और
कन्फ को भी ओपन करते हैं तो मुझे पता है
कि मुझे क्या-क्या वेरिएबल चाहिए गे पहला
तो एप राइट यूआरएल चाहिए तो कॉपी करके कॉफ
ड एरा यरल ये है मेरा एंड पॉइंट सजेशन
वहां पे गलत आए थे क्योंकि एआई सजेशन कई
बार गलत होते हैं और प्रोजेक्ट आईडी चाहिए
का तो एक्चुअली में प्रोजेक्ट आईडी का नाम
क्या है पप राइट प्रोजेक्ट आईडी तो इसको
कॉपी करते हैं और यहां से हमने यह एप राइट
प्रोजेक्ट आईडी लिया ठीक है अब हमारे पास
यह वैल्यू तो सेट हो गई है दिस ड क्ट के
अंदर ये वैल्यू आ गई है अब क्योंकि दिस
डॉट क्लांट के अंदर यह वैल्यू आ गई है
हमारे पास में तो क्या करना पड़ेगा फर्द
यहां पे लगाइए एक सेमी कॉलन और अब अकाउंट
की वैल्यू को ऐड करिए तो दिस डॉट अकाउंट
न्यू अकाउंट और उसके अंदर य क्लाइंट की
वैल्यू दे दीजिए तो अब एक्चुअली में आपके
पास प्रॉपर्ली यह काम हुआ है देखिए कोड वो
का वही है हमने लिया बस थोड़ा सा हमने
मॉडिफाई कर दिया है बेटर कोड प्रैक्टिसेस
के लिए तो देखिए वो का वो काम है क्लाइंट
लिया न्यू क्लाइंट लिया और ये सेट एंड
पॉइंट सेट प्रोजेक्ट और यहां पे भी अकाउंट
लिया न्यू अकाउंट से बनाया तो यही काम
किया है हमने एग्जैक्ट का एग्जैक्ट काम
लेकिन हमने क्या करा एक क्लास के अंदर वोह
काम कर दिया जब भी उसका एक नया ऑब्जेक्ट
बने तो बस इतना सा हमारा जावास्क्रिप्ट का
बेसिक्स काम आया बाकी हमारा डॉक्यूमेंटेशन
तो दोनों नॉलेज को हमने मिक्स कर दिया है
ठीक है अब आपको क्या करना है एक अकाउंट
बनाना है तो देखिए अकाउंट बनाने का जो
प्रोसेस है ना बड़ा ही इजी है आप जाइए
अकाउंट किस तरह से बना सकते हैं यहां पर
इसने मेथड दे रखा है कि आप क्या करो
सिंपली इसका नाम एक यह रख दो यह अकाउंट
डॉट क्रिएट के अंदर वैल्यूज पास कर दो
यूजर आईडी दे दो एक यूनिक और ईमेल दे दो
और जो भी पासवर्ड देना है वो दे दो तो मैं
सेट कर दूंगा या और भी कोई फील्ड देना है
तो वो फील्ड मुझे दे दो मैं आपका अकाउंट
बना दूंगा लेकिन हम क्या चाहते हैं हम
डिपेंडेंसी नहीं चाहते कभी हो सकता है ए
राइट को आपको चेंज करना पड़े तो हर जगह
एप्लीकेशन में जा जाके चेंज करोगे क्या
नहीं तो उसके लिए मैं क्या करता हूं यहीं
पर एक दूसरा मेथड बना देता हूं उस मेथड के
अंदर मैं क्या करूंगा
उस मेथड के अंदर सिंपली एप राइट की जितनी
सर्विसेस हैं उनको कॉल करूंगा ताकि एक
रैपर बना दिया है मैंने कि देखो आपको नहीं
पता मैं अंडर द हुड एप राइट यूज कर रहा
हूं फायर बेस यूज़ कर रहा हूं मेरा
डेटाबेस कुछ भी यूज कर सकता हूं मैं तो यह
जो बनेगा ओबवियस सी बात है अस सिंक बनेगा
अस सिंक क्यों बनेगा क्योंकि
डॉक्यूमेंटेशन में दे रखा था कि यह
प्रॉमिस है तो या तो आप प्रॉमिस यूज कर
लीजिए या से फिर असं अ वेट यूज कर लीजिए
क्योंकि असं का वेट भी एक्चुअली में
प्रॉमिस खत्म होंगे तभी मैं असं का वेट
इसलिए यूज़ कर रहा हूं क्योंकि यह जब तक
कंप्लीट नहीं होगा अकाउंट क्रिएशन में आगे
नहीं जाना चाहता तो मैं सिं का वेट यूज़
कर लेता हूं इस मेथड का नाम मैं देता हूं
क्रिएट अकाउंट अब जो भी सर्विस को यूज़
करेगा उसको नहीं पता कि इसके अंडर द हुड
क्या रहा उसको तो पता है कि एक यह सर्विस
है ऑथ सर्विस इसके अंदर एक मेथड है क्रिएट
अकाउंट उसमें वैल्यूज पास कर दो तो अकाउंट
बन जाता है बस हमें एप राइट का भी तो नहीं
पता वो अंडर द हुड क्या कर रहा है कैसे
डेटाबेस में एंट्री कर रहा है तो उसी तरह
से हम काम करेंगे यहां पे तो इसको कुछ
पैरामीटर्स चाहिए होंगे उनको हम
डिस्ट्रक्चर कर लेते हैं तो मुझे चाहिए एक
ईमेल और मुझे चाहिए एक पासवर्ड और मुझे
चाहिए ग एक नेम तो ये हमारे पास वैल्यूज आ
गई है इसको हम रिमूव करते हैं तो यह
वैल्यूज आ गई है ईमेल पासवर्ड और नेम हमने
डिस्ट्रक्चर कर लिया जो भी मेथड पास करेगा
वो एक ऑब्जेक्ट देगा मुझे जिसके अंदर ये
सारी वैल्यूज होगी इतनी इतना हमारे पास
काम है अब क्या है कि ये जो मेथड है ना ये
एक्चुअली में अकाउंट क्रिएशन वाला मेथड
फेल भी हो सकता है तो यहां पे
डॉक्यूमेंटेशन में नहीं मेंशन है बट ये
आपके फेल सेफ है क्योंकि आप पढ़ के आए हैं
जावास्क्रिप्ट तो आपके फेल सेफ तो आपको
लगाने ही पड़ेंगे तो हम क्या करते हैं
इसको सिंपली ट्राई कैच में लेते हैं तो ये
हमारा ट्राई कैच सिंटेक्स हो गया अब सबसे
पहले तो यहां पे हमारे पास एक कैच है तो
ओबवियस सी बात है आपको एरर यहां पे मिल
रही है तो एरर जो भी है उसको हम थ्रो कर
देते हैं तो थ्रो और एरर आप चाहे तो और
ग्रेसफुली हैंडल कर सकते हैं एरर को बट
यूजुअली बैक एंड के अंदर य अच्छे से हैंडल
हो जाती है तो इसलिए ज्यादा यहां पे कुछ
करने की जरूरत नहीं है बट अभी के लिए ठीक
है मान लेते हैं कि हमने ट्राई कैच में
एरर्स तो हैंडल कर ली अब क्या चीज ट्राई
करनी है देखो मुझे सबसे पहले क्या करना है
मुझे करना है अवेट किस बात का वेट करना है
कि एक अकाउंट क्रिएट करने का अकाउंट कहां
से क्रिएट होता है इससे और इसका एक्सेस
यहां पे है तो इसको एक्सेस लेने के लिए
क्या करना पड़ेगा दिस डॉट अकाउंट और उसके
बाद जो मेथड है वहां पे डॉट क्रिएट मेथड
तो ठीक है यह लीजिए
डॉट डॉट क्रिएट मेथड और क्रिएट मेथड के
अंदर जो भी वैल्यूज मेरे पास है वो
वैल्यूज में एज इट इज पास कर दूंगा लेकिन
प्रॉब्लम क्या है अगर आप डॉक्यूमेंटेशन
अच्छे से नहीं पढ़ेंगे तो आपको पता है
फर्स्ट फील्ड में यूजर आईडी देना कंपलसरी
है सजेशन तो मुझे सिर्फ मिला है ईमेल
पासवर्ड और नेम का हां वो तो ठीक है सेकंड
फील्ड आपका का ईमेल ही होना चाहिए और थर्ड
फील्ड आपका पासवर्ड ही होना चाहिए लेकिन
ये यूनिक आईडी कहां से लाए हां बहुत तरीके
हैं लेकिन हमें एप राइट के अंदर ये आईडी
मिला है और इस आईडी से एक्चुअली में यूनिक
आईडी जनरेट हो सकती है कैसे हो सकती है
बहुत इजी है आईडी को यूज करो डॉट लगाओ और
इसके अंदर यहां पे अ यूनिक आपको एक मेथड
मिल जाता है इस मेथड को कॉल कर दो यहां
कॉमा लगा दो बस
दैट्ची अब क्योंकि इसको अवेट करा रखा था
तो एक वेरिएबल में होल्ड कर लेते हैं तो
इसको बोल देते हैं यूजर
अकाउंट यह लीजिए अब यूजर अकाउंट आपको मिल
गया है तो यह मेथड जिसने भी आपसे काम में
लिया है उसके अंदर य बिहाइंड द सीन
इंटरनली हमने य मेथड काम में ले लिया बट
उसको कुछ वापस भी तो करोगे पहले चेक करना
पड़ेगा यूजर अकाउंट एक्चुअली में क्रिएट
हुआ है या नहीं हुआ तो इफ एल्स सिंटेक्स
यूज करते हैं हम बेसिक सा अपना क्लासिक एफ
एल्स और इसमें बोलते हैं कि अगर यूजर
अकाउंट एजिस्ट करता है तो यूजर अकाउंट
रिटर्न कर देंगे यूजर का ठीक है तो यूजर
अकाउंट हमने रिटर्न कर दिया यहां पे और
अगर यूजर अकाउंट एजिस्ट नहीं करता है यहां
पे तो हम क्या
करेंगे तो हम उसको एक एरर रिटर्न कर
देंगे तो यहां पे जाते हैं हम ए रिटर्न और
अ एक्चुअली में इफ यूजर अकाउंट एजिस्ट तो
हम उसको क्या करते हैं एक्चुअली में एक और
मेथड हम यहां पे करेंगे वैसे चाहे तो हम
यूजर अकाउंट भी उसको रिटर्न कर सकते हैं
जो भी मेथड आए वो हैंडल कर लेगा बट इस पे
हम आते हैं एक्चुअली में क्योंकि हमारा जो
फ्लो है ना हम क्या बनाना चाहते हैं यहां
पे कमेंट लिख देते हैं एक छोटा सा कॉल
अनदर
मेथड अनदर
मेथड एक्चुअली में हम जो फ्लो बनाना चाहते
हैं वह कैसा फ्लो है कि अगर यूजर अकाउंट
एजिस्ट करता है तो उसको लॉग इन भी करवा ही
दो ना हां आपके ऊपर डिपेंड करता है आप हो
सकता है उसको एक सक्सेस मैसेज रिटर्न करना
चाहते हैं कि हां अकाउंट
क्रिएटेडॉक्युमेंट्सफ्रैगमेंट
सक्सेसफुली अकाउंट बन गया है तो लॉगइन ही
करा देते हैं सीधे तो उसके बारे में हम
बात करेंगे ठीक है तो हम लॉग इन करा देंगे
अगर यह सब नहीं हो रहा है तो जो भी उस
यूजर अकाउंट के अंदर वैल्यू आई है तो उसके
हिसाब से हम देख लेंगे तो अभी तो हम यूजर
अकाउंट को रिटर्न कर देते हैं यहां पे तो
यूजर अकाउंट अब हो सकता है यूजर अकाउंट के
अंदर नल वैल्यू आई हो कि अकाउंट क्रिएट ही
नहीं हुआ तो उस हिसाब से हम हैंडल कर
लेंगे जो भी इस मेथड को कॉल करेगा उसको हम
डॉक्यूमेंटेशन प्रोवाइड कर देंगे ठीक है
अब सबसे इंटरेस्टिंग चीज बात आप यहां
देखिए कि यहां पे हम इसके अंदर क्या
करेंगे वो तो देख लेंगे बट सपोज करिए किसी
दिन आपका ऐसा काम आया कि जहां पे आपको यह
वाला सर्विसेस यूज ही नहीं करनी है तो कुछ
नहीं यहां पे कंस्ट्रक्टर वगैरह चेंज कर
दीजिए फायर बेस केया जिसके भी आपको लगाने
है वो लगा दीजिए और यहां पे अंडर द हुड
चेंजेज कर दीजिए लेकिन यूजर से आप वही
पैरामीटर मांग रहे हैं अब उस पैरामीटर को
आप पप राइट पे भेज रहे हैं आपके कस्टम
किसी सर्विस पे भेज रहे हैं जो बैक एंड
आपने बनाया है या फिर फायरबेस पे भेज रहे
हैं इसका कोई लेना देना नहीं है आपकी बाकी
एप्लीकेशन एज इट इज चलेगी तो ये बड़ा ही
इंटरेस्टिंग कांसेप्ट है काफी हायर लेवल
पे यूज होता है प्रोडक्शन ग्रेड ऐप में
हमने क्या करा हमने कुछ नहीं बस एक अस
सिंक क्रिएट अकाउंट मेथड बनाया इसी तरह से
अलग-अलग मेथड भी बना सकते हैं अब देखिए हम
यहां पे वापस से एक और मेथड बना देते हैं
इसका नाम रख देते हैं लॉगइन लॉग इन में
क्या चाहिए ईमेल और पासवर्ड ईमेल और
पासवर्ड सजेशन काफी अच्छे मिल रहे हैं
लेकिन फिर भी हम लिखते हैं वही अपना सेम
ट्राई कैच तो ये लीजिए ट्राई कैच एरर आया
एरर के अंदर हमने क्या करा सिंपली कर दिया
थ्रो एरर ठीक है जी ट्राई कैच में क्या
करना चाहेंगे वही सबसे पहले तो अवेट कराना
पड़ेगा और उसके बाद दिस डॉट और क्लाइंट से
नहीं अकाउंट से क्योंकि डायरेक्टली एक्सेस
कर सकते हैं सजेशन पे हमेशा मझ जाइएगा और
हमने बोला क्रिएट अ सेशन देखिए यह नहीं
यूज करना है क्योंकि आपको डॉक्यूमेंटेशन
में पढ़ना पड़ेगा कौन सा वाला मेथड आप यूज
करना चाहते हैं तो काफी आपके पास ईमेल
पासवर्ड के मेथड्स हैं तो क्रिएट तो हो
गया है लेकिन लॉगइन वाला हमें देखना
पड़ेगा तो एक्चुअली में सर्च कर लेते हैं
हम यहां
पे अ
लॉगइन यहां पर तो एक ही है तो हम जाते हैं
एक्चुअली में ऑथेंटिकेशन के अंदर ईमेल
पासवर्ड ईमेल पासवर्ड से हमें लॉग इन करना
है तो इसको क्लोज करते हैं यह रहा साइन अप
वेरिफिकेशन
लॉगइन तो लॉगिन में देखिए यहां पर इसने
बोल रखा है हमें मेथड है जो है क्रिएट
ईमेल सेशन तो सजेशन प हमेशा मत जाइएगा तो
हमें चाहिए अकाउंट डट क्रिएट ईमेल सेशन इस
ईमेल को क्या-क्या चीजें चाहिए आपका चाहिए
सिर्फ ईमेल और पासवर्ड
दैट्ची यूज करेगा इस सर्विस की वह मुझे यह
देगा अब अगर हो गया है तो इसको हम सीधा ही
रिटर्न कर देते हैं आपकी मर्जी है आप चाहे
तो पूरा रिटर्न करिए हो सकता है एक
वेरिएबल में होल्ड करके रिटर्न करिए तो
मैं यहीं पे रिटर्न लिख देता हूं क्यों ही
वेरिएबल में होल्ड करना है जो भी इसका
रिजल्ट आएगा वो डायरेक्ट ही रिटर्न कर
देते हैं और किस तरह से हैंडल करेंगे वो
हम फ्रंट एंड के अंदर अभी जो लॉगिन वगैरह
बनाएंगे पेजेस वो वहां पे हम देख लेंगे तो
अब पता है कि इस तरह से लॉगिन होता है और
ईमेल पासवर्ड ये चाहिए अब एक चीज बताइए इस
ईमेल पासवर्ड का एक्सेस तो आपके पास यहां
पे भी है तो यहां पे अगर यूजर का अकाउंट ब
बन गया है तो सीधे ही यहां पे लॉगइन कॉल
कर लो और यहां पे भी रिटर्न कर सकते हो आप
वैल्यूज को तो हम क्या करेंगे
दिस दिस डट लॉगइन और ईमेल आईडी ईमेल और
पासवर्ड आपके पास एक्सेस था तो आपने दे
दिया अब देखिए टोटली आपके ऊपर डिपेंड करता
है कि आप किस तरह से फंक्शनैलिटी डिजाइन
कर रहे हैं मैं फंक्शनैलिटी ऐसे डिजाइन कर
रहा हूं कि अगर यूजर का अकाउंट बन जाता है
तो फिर लॉगइन कॉल कर लो और सीधा लॉगिन अगर
अकाउंट बना हुआ है क्योंकि लॉगइन पेज भी
तो बनाना है तो वहां पे हम डायरेक्टली ये
लॉगइन वाला मेथड कॉल कर लेंगे और सीधा काम
हो जाएगा तो इतना कुछ डिफिकल्ट था ही नहीं
अच्छा अब एक और यहां पर मेथड बनाना पड़ेगा
ठीक है साइन अप तो हो गया यानी क्रिएट
अकाउंट और साइन इन भी हो गया लॉग इन भी हो
गया लेकिन दो फंक्शनैलिटी और रहती है एक
तो लॉग आउट मुझे पता है आपने गेस कर लिया
है कमेंट सेक्शन में बताओ अगर गेस कर लिया
था तो बट एक और है मुझे यह भी जानना चाहिए
कई बार कि कई बार जैसे होम पेज है अगर मैं
डायरेक्टली होम पे लैंड हुआ हूं तो मुझे
यह पता करना पड़ेगा कि मैं लॉग इन हूं या
नहीं हूं तो यह सब तो देखना पड़ेगा हां
कैसे उसको यूज करेंगे व अलग बात है अलग
कहानी है हमारे पास लेकिन एक्चुअली में
देखना पड़ेगा कि आप लॉग इन हो या नहीं हो
तो सबसे पहले हम उसकी सर्विस बनाते हैं एक
मेथड बनाते हैं एक्चुअली में तो हम बनाते
हैं यहां पे एक असं और उसको नाम दे देते
हैं
गेट करंट यूजर तो इससे हमें मिल जाएगा
करंट यूजर अब करंट यूजर के लिए आपको ना
कुछ भी देने की जरूरत नहीं है कोई मेथड
में कुछ आर्गुमेंट वगैरह पास करने की
जरूरत नहीं है हम सीधा का सीधा यह जो
अकाउंट हमने बनाया इससे पूछ सकते हैं हां
अकाउंट के पास इस तरह के मेथड्स हैं जैसे
पासवर्ड रिकवरी है और भी बहुत सारे
सिक्योरिटीज हैं तो और भी बहुत सारे इस
तरह के मेथड है जितना आप इस डॉक्यूमेंटेशन
को पढ़ते जाओगे उतना आपको पता लगेगा अब
यहां पे अकाउंट की सर्विसेस को आप आके देख
सकते हो तो देखिए यहां पे आपको दे रखा है
कि क्रिएट अकाउंट क्रिएट ईमेल सेशन और
इसके बाद जेडब्ल्यू t भी बना सकते हो गेट
अकाउंट भी दे रखा है कि आपको कोई अकाउंट
को गेट करना हो तो किस तरह से करें देखिए
सिंपल सा मेथड है यहां पे एक सिंपल सा
ऑप्शन है अकाउंट ड गट तो बस यह यूज करते
आपको एक प्रॉमिस मिल जाएगा और आपको वैल्यू
मिल जाएगी कि अकाउंट है या नहीं है उस
सेशन के अंदर आपके पास क्योंकि ये सेशन
बनाता है बाय डिफॉल्ट ओके तो यहां पे कैसे
कर करना है अब इसको बहुत ही आसान है इतना
कोड तो आप कर ही सकते हो ओबवियस सी बात है
ट्राई कैच में रैप करेंगे क्योंकि हो सकता
है इश्यूज आ जाए तो यहां पर हम क्या
करेंगे सिंपल सा अपना यह थ्रो एरर थ्रो
सजेशन यह लीजिए थ्रो एरर हो गया हमारे पास
में अच्छा ट्राई कैच में आपने एरर तो कर
लिया है लेकिन आप इसको अगर आपको और
कस्टमाइज करना है तो आप कस्टमाइज भी कर
सकते हैं सपोज करिए आपको थ्रो एरर नहीं
करना है तो आप सिंपल कंसोल लॉक कर दीजिए
यहां पे इन केस अगर आपको उससे प्रॉब्लम हो
रही है तो हम यहां पे कस्टम एरर दे सकते
हैं ए राइट और एरर या एप राइट सर्विस के
अंदर हमारे पास एरर है कोलन कलन इस तरह से
तो हम देख लेते हैं गेट करंट यूजर के अंदर
हमारे पास ये एरर है और एरर एज इट इज
कंसोल लॉक कर दी आपको थ्रो नहीं करना है
आपको कंसोल लॉक करना है आप उस तरह से भी
देख सकते हैं अच्छा ट्राई के अंदर क्या
करना पड़ेगा बहुत ही सिंपल है कुछ भी नहीं
सीधा का सीधा पहले तो अवेट लगाओ क्योंकि
अस सिंक मेथड है और दिस ड अकाउंट गट तो
आपको जो भी वैल्यू मिलेगी हम इसको
डायरेक्टली रिटर्न कर देते हैं क्या
वैल्यू मिलेगी उसको हम फ्रंट एंड में चेक
करेंगे उसको साथ हम देखेंगे ये तो काम हो
गया जब अपना ट्राई कैच हो रहा है अगर यहां
से कुछ वैल्यू नहीं मिली या फिर इसमें कुछ
मिला ही नहीं यह तो देखिए उस केस में कि
आप रीच आउट ही नहीं कर पाए सर्विस को
लेकिन अभी हमने वो केस हैंडल नहीं करा है
कि अकाउंट जब मिला ही नहीं तो क्योंकि
हमने तो डायरेक्ट ही रिटर्न कर दिया हां
अगर इफ एल्स यहां पे लगाता तो इजली हैंडल
कर देता कि अगर अकाउंट मिला है तो उसको
हैंडल कर दो अगर अकाउंट नहीं मिला है तो
फिर आप उसको कुछ और रिटर्न कर दो बट इजियर
तरीका क्या है इस ट्राई कैच से आइए बाहर
यहां पे आ गए हम बाहर और सिंपली क्या कर
सकते हो आप यहां पे के रिटर्न नल कर दो तो
अगर यहां पर कुछ होगा ही नहीं तो भी
रिटर्न वैसे नल ही होने वाला है बट इन केस
अगर मान लीजिए इस मेथड में किसी तरह से
कोई ट्राय कैच में प्रॉब्लम आ जाती है तब
भी आपका रिटर्न नल होगा सपोज करिए एरर आ
गया पहुंचे ही नहीं तो एरर में कोई वैल्यू
अगर उसने रिटर्न कर दी गलती से तो
प्रॉब्लम आ जाएगी तो उस केस के लिए हम
यहां पे कर रहे हैं आपको अगर फल्स से
अच्छा लगता है वो फ्लो ज्यादा बेटर लगता
है तो आप वो फ्लो कर लीजिए ये सिर्फ फ्लो
फ्लो की बात है हम किस तरह से कोड को
देखिए कोड अगर समझ में आने लग गया ना एक
बार तो उसके बाद कुछ ज्यादा है नहीं बस
डिस्क डिशन होता है इस तरह के बोर्ड पे
लिखा जाता है और आप सीधे ऐसे सर्विस बनाते
हैं अब देखिए लॉग आउट तो और भी इजी है हम
टॉप पे चलते हैं और देखिए ये हमारे पास
सारे मेथड्स हैं आपको जो भी यूज़ करना है
आप यहां पे यूज कर लीजिए किस तरह से हैं
तो देखिए यहां पे एक्चुअली में हमारे पास
जो है बाय डिफॉल्ट मैंने आपको बताया था
सेशंस है सेशंस बनाता है तो इसी तरह से
आपके पास एक डिलीट सेशन है डिलीट सेशन ही
एक्चुअली में लॉग आउट है तो आपको क्या
करना है बस अकाउंट ड डिलीट सेशन कुछ भी
नहीं चाहिए तो आपका एक करंट सेशन डिलीट कर
देता है आप इसके अंदर वैल्यू स्ट्रिंग में
करंट भी पास कर सकते हो या फिर आप लिस्ट
ऑफ सेशंस भी दे सकते हो वो हम कभी और किसी
प्रोजेक्ट में देखेंगे जब हम एक बार और
रिवीजन करेंगे कभी फ्यूचर में क्योंकि
मुझे पता है आप रिक्वेस्ट तो करोगे और आप
रिक्वेस्ट करोगे तो मैं ओबवियसली बात
बनाऊंगा तो हम यहां पे देख लेते हैं अस
सिंक अब हमें मेथड बनाना है एक सिंपल सा
लॉग आउट यह हमने बना दिया लॉग आउट ये
लीजिए मेथड अब उप्स कहां गया हमारा लॉग
आउट ये रहा तो इस लॉगआउट के अंदर क्या
करना है वही ट्राई कैस्ट तो हम करेंगे ही
करेंगे उसमें तो कोई इफ बट है ही नहीं अभी
आपको पता है कंसोल लॉग हो जाएगा यहां पे
आपको कंसोल लॉग करना है तो कंसोल लॉग करिए
एप राइट सर्विस लॉग आउट के अंदर इशू है
लॉग आउट एरर है और एरर एज इट इज कंसोल लॉग
कर लिया है लेकिन ट्राय में क्या करना
पड़ेगा ओबवियस सी बात है अवेट तो करना ही
पड़ेगा और आप क्या करिए दिस डट अकाउंट
डिलीट सेशन आप चाहे तो करंट वैल्यू पास कर
सकते हैं या फिर आप क्या कर सकते हैं
डिलीट सेशन की जगह एक और मेथड है यहां पे
गौर से देखिएगा यह है डिलीट सेशंस एक एड
में इसमें एस है अगर आपको एक ही पर्टिकुलर
सेशन डिलीट करना है तो उसके लिए भी मेथड
है तो यह सेशंस है जो हमने यूज करा है और
एक है डिलीट सेशन उसके अंदर आप वैल्यू
यहां पर दे सकते हैं सेशन आईडी या फिर
करंट भी दे सकते हैं हम एक्चुअली में
सेशंस यूज करेंगे ताकि सारे ही सेशन डिलीट
हो जाए जितने भी यूजर ने जहां-जहां से भी
जिस भी ब्राउजर से लॉग इन कर रखा है हां
ऑल भी दे सकते हो यहां पे बट अभी यहां पे
नहीं देना है क्योंकि वह सजेशन गलत है
सिर्फ सेशन ही देना यहां पे ठीक है तो यह
हमारे पास हो गया एक असं सर्विस बना दी
हमने लॉगआउट और सीधा काम हो गया अब देखिए
इंटरेस्टिंग बात यह है कि जो भी हमने यहां
पेय ऑब्जेक्ट पास करा है यह ऑब्जेक्ट के
डायरेक्ट डॉट से एक्सेस है सारी चीजें तो
डॉट लॉग आउट यूज कर सकता हूं डॉट करंट
यूजर यूज कर सकता हूं डॉट लॉगइन डॉट
क्रिएट अकाउंट और सबसे अच्छी बात यह है कि
सर्विसेस इस तरह से बनाई गई है कि अंडर द
हुड क्या हो रहा है वो सिर्फ इस फाइल को
पता है तो जो भी चेंजेज होंगे वो इसी फाइल
में होंगे कल को अगर एप्लीकेशन चेंज होती
है या कोई आपकी बैक एंड सर्विस चेंज होती
है तो अगर फ्रंट एंड में आपके पास है तो
फ्रंट एंड को कुछ नहीं पता उसको बस यही
मेथड कॉल करना है आपको सिर्फ इतना सा
ध्यान रखना है कि पैरामीटर्स हम वही लें
अब आप एप राइट यूज़ करिए फायरबेस यूज़
करिए खुद का सेशन यूज़ करिए जो आपको करना
है करिए यह हो गया हमारा एक फ्यूचर प्रूफ
कोड और हमने यहां पे सीधा लास्ट में
एक्सपोर्ट डिफॉल्ट ऑ सर्विस कर दिया तो यह
बड़ा ही इंटरेस्टिंग एक केस है किस तरह से
ऐसी सर्विसेस बनाई जाती है अब ये हमने
ऑथेंटिकेशन सर्विस बना दी अच्छा अब एक
इंटरेस्टिंग बात बताऊं जब भी फ्यूचर में
आपको कभी इस तरह का ऑथेंटिकेशन एप राइट से
करना पड़ेगा आप एज इट इज कॉपी पेस्ट कर
सकते हैं इस फाइल को क्योंकि यह सब तो
चाहिए ग ही और यह सारी हमारे पास अब सेव
है तो इस कोड स्नेप इट को कहीं सेव रख
लीजिए और जब भी यूज कर करना है एज इट इज
कॉपी पेस्ट करके यूज़ करिए कभी और मेथड भी
अगर लिखने पड़े तो इसी फाइल में लिखिए और
उस फाइल को सेव रखिए जब भी एराइड का कोई
कांट्रैक्ट आए प्रोजेक्ट आए किसी भी कंपनी
एक करना हो तो आपके पास निपट में सारा सेव
है देख लीजिए कोई डॉक्यूमेंटेशन में अपडेट
हुआ या नहीं हुआ वैसे रेयरली होता है बस
यह फ्यूचर प्रूफ कोड हो गया आपका अब जितनी
बार ये कोड लिखोगे उतनी बार काम आएगा और
जितनी बार एप्लीकेशन बनाओगे 10 बार कोड
लिखा तो वैसे ही आपको याद हो जाना है आधा
तो वैसे याद मत करिए डॉक्यूमेंटेशन से
देखिए ठीक है तो यह सर्विस हो गई हमारी एज
इट इज एप राइट की तैयार ठीक है एप राइट की
एक सर्विस तो तैयार हो गई लेकिन अभी हमारे
पास इतना ही नहीं है कि हम एक ही सर्विस
से काम में लेंगे क्योंकि देखिए डेटाबेस
की सर्विस भी तो है डेटाबेस के अंदर भी तो
चीजें हम डाल रहे हैं यहां पे कि हम ये
डेटाबेस है तो डेटाबेस के सारे कलेक्शंस
का एक्सेस दे दो एक कलेक्शन का एक्सेस दे
दो उसमें एडिट अपडेट करूंगा तो किस तरह से
करूंगा तो उसके अंदर भी हम थोड़ी सी बात
करेंगे थोड़ी सी चर्चा करेंगे उसको मैं
इतना एगजैक्टली नहीं बनाऊंगा बनाएंगे उसको
भी इसी तरह से सर्विस के बेसिस पे बनाएंगे
बट इतना एग्जैक्ट नहीं बनाऊंगा क्योंकि
मैं एक पोर्शन छोड़ना ना चाहता हूं यहां
पे ताकि आप उसको एक बेटर सर्विस बना पाए
काफी हद तक करेंगे बट फ्यूचर के लिए एक
थोड़ा असाइनमेंट छोड़ना चाहता हूं तो
इसलिए बनाएंगे 80 पर तक हम बनाएंगे 20 पर
आपके लिए छोड़ा जाएगा वहां पे ठीक है तो
उम्मीद करता हूं आपको ये वीडियो पसंद आया
होगा काफी शॉर्ट मतलब ज्यादा शॉर्ट तो
नहीं काफी ल बड़े वीडियोस हैं बट एक्चुअली
में मैं इनको सेंसिबली डिवाइड कर रहा हूं
ताकि हर बार आपको अगर फ्यूचर में भी आना
पड़े तो आप एक वीडियो देख के वहां से उतना
मटेरियल दोबारा से ग्रैप्स कर पाए क्योंकि
बड़ा प्रोजेक्ट है काफी पहली बार कर रहे
हैं तो इसलिए स्लोली धीरे चीजों को लेकर
जा रहा हूं ताकि आपको कॉन्फिडेंस आए एक-एक
लाइन पर हम डिटेल डिस्कशन कर रहे हैं तो
कमेंट का टारगेट याद रखिएगा बस 200 का ही
कमेंट दे टारगेट दे रहा हूं पहले सोचा था
ज्यादा दूंगा बट 200 क्या आप एक घंटे में
कर देते हैं तो उसमें ज्यादा मजा आता है
मुझे तो चलिए मिलते हैं आपसे अगले वीडियो
के
अंदर
```

As we want to make a service, 
so the things related to appwrite will go into the folder "appwrite"

create a file:
src/appwrite/auth.js
```
import conf from '../conf/conf.js';
import { Client, Account, ID } from "appwrite";


export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
            
    }

    async createAccount({email, password, name}) {
        try {
            const userAccount = await this.account.create(ID.unique(), email, password, name);
            if (userAccount) {
                // call another method
                return this.login({email, password});
            } else {
               return  userAccount;
            }
        } catch (error) {
            throw error;
        }
    }

    async login({email, password}) {
        try {
            return await this.account.createEmailSession(email, password);
        } catch (error) {
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (error) {
            console.log("Appwrite serive :: getCurrentUser :: error", error);
        }

        return null;
    }

    async logout() {

        try {
            await this.account.deleteSessions();
        } catch (error) {
            console.log("Appwrite serive :: logout :: error", error);
        }
    }
}

const authService = new AuthService();

export default authService


```



 -->
