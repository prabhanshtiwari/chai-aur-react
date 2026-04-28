# Lecture Notes: Real-Time Editor (RTE) & Post Form in React

---

## Table of Contents
1. [What is RTE (Real-Time Editor)?](#1-what-is-rte-real-time-editor)
2. [Setting Up TinyMCE Editor](#2-setting-up-tinymce-editor)
3. [The `Controller` from React Hook Form](#3-the-controller-from-react-hook-form)
4. [Building the RTE Component](#4-building-the-rte-component)
5. [Building the PostForm Component](#5-building-the-postform-component)
6. [useForm Hook — All Utilities Used](#6-useform-hook--all-utilities-used)
7. [The `submit` Function — Logic Explained](#7-the-submit-function--logic-explained)
8. [The `slugTransform` Function](#8-the-slugtransform-function)
9. [useEffect + watch — The Interview Concept](#9-useeffect--watch--the-interview-concept)
10. [The Form JSX Structure](#10-the-form-jsx-structure)
11. [Key Concepts Summary](#11-key-concepts-summary)

---

## 1. What is RTE (Real-Time Editor)?

A **Real-Time Editor (RTE)** is a rich-text editor that lets users format content visually (bold, italic, headings, images, etc.) — similar to Google Docs or MS Word inside a browser.

- We use the **TinyMCE** library (`@tinymce/tinymce-react`) for this.
- The problem with RTE: it is a **separate, external component** — it's not a native HTML `<input>`, so React Hook Form can't track it directly.
- **Solution:** Use React Hook Form's `Controller` wrapper to connect the external component to the form.

---

## 2. Setting Up TinyMCE Editor

If you just want a basic editor (no form integration), it's very simple:

```jsx
import { Editor } from '@tinymce/tinymce-react';

// Minimal usage — just render the editor
<Editor
  initialValue="Start typing here..."  // default content shown in editor
  init={{
    height: 500,          // height of the editor in pixels
    menubar: true,        // show the top menu bar (File, Edit, etc.)
    branding: false,      // hide the TinyMCE branding/logo
    plugins: [            // add features/plugins you want
      "lists",
      "link",
      "image",
      "wordcount",
      "anchor",
    ],
    toolbar:              // customize the toolbar buttons
      "undo redo | bold italic | alignleft aligncenter | bullist numlist",
    content_style:        // CSS applied inside the editor's body
      "body { font-family: Helvetica, Arial, sans-serif; font-size: 14px }",
  }}
/>
```

> **Note:** All available plugins, toolbar options, and settings must be read from the **TinyMCE documentation** — there are many options and you pick what you need.

---

## 3. The `Controller` from React Hook Form

### Why do we need `Controller`?

React Hook Form works great with native HTML inputs using `register`. But **external components** like TinyMCE, React Select, etc., don't expose a native `ref` — so `register` won't work.

`Controller` is the bridge that wraps these external components and connects them to React Hook Form's state management.

```jsx
import { Controller } from 'react-hook-form';

// Controller acts as a wrapper/bridge between RHF and external components
<Controller
  name="content"        // field name in the form (used by RHF to track this field)
  control={control}     // the control object from useForm() — carries form state
  render={({ field: { onChange } }) => (
    // render your external component here
    // field.onChange tells RHF when the value changes
    <SomeExternalComponent onChangeHandler={onChange} />
  )}
/>
```

**Key props of `Controller`:**
| Prop | Purpose |
|------|---------|
| `name` | The field name (must be unique in the form) |
| `control` | Passed from `useForm()`, carries all form state |
| `rules` | Validation rules (same as `register` rules) |
| `render` | Callback that receives `field` — use `field.onChange`, `field.value`, etc. |

---

## 4. Building the RTE Component

**File:** `src/components/RTE.jsx`

```jsx
import React from 'react'
import { Editor } from '@tinymce/tinymce-react';
import { Controller } from 'react-hook-form';

// Props:
//   name         - the form field name (default: "content")
//   control      - control object from useForm(), needed by Controller
//   label        - optional label text shown above the editor
//   defaultValue - initial content of the editor (default: empty string)
export default function RTE({ name, control, label, defaultValue = "" }) {
    return (
        <div className='w-full'>
            {/* Render the label only if it was provided */}
            {label && <label className='inline-block mb-1 pl-1'>{label}</label>}

            {/* Controller wraps TinyMCE so React Hook Form can track its value */}
            <Controller
                name={name || "content"}  // use given name or fallback to "content"
                control={control}          // form control from parent
                render={({ field: { onChange } }) => (
                    // Editor is TinyMCE's React component
                    <Editor
                        initialValue={defaultValue}  // pre-fill editor with existing content
                        init={{
                            initialValue: defaultValue,
                            height: 500,       // editor height
                            menubar: true,     // show menu bar

                            // List of TinyMCE plugins to enable
                            plugins: [
                                "image",          // insert images
                                "advlist",        // advanced lists
                                "autolink",       // auto-detect links
                                "lists",          // bullet/numbered lists
                                "link",           // insert links
                                "charmap",        // special characters
                                "preview",        // preview post
                                "anchor",         // anchor links
                                "searchreplace",  // find and replace
                                "visualblocks",   // show block elements
                                "code",           // view/edit HTML source
                                "fullscreen",     // fullscreen mode
                                "insertdatetime", // insert date/time
                                "media",          // embed media
                                "table",          // insert tables
                                "help",           // help button
                                "wordcount",      // word count display
                            ],

                            // Toolbar configuration — buttons shown in the toolbar
                            toolbar:
                                "undo redo | blocks | image | bold italic forecolor | " +
                                "alignleft aligncenter alignright alignjustify | " +
                                "bullist numlist outdent indent | removeformat | help",

                            // CSS applied inside the editor content area
                            content_style:
                                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        }}

                        // When editor content changes, call RHF's onChange to update form state
                        onEditorChange={onChange}
                    />
                )}
            />
        </div>
    )
}
```

**How it works:**
1. Parent component calls `<RTE control={control} name="content" label="Content :" />`
2. `Controller` registers "content" field with React Hook Form
3. Whenever the user types in TinyMCE, `onEditorChange={onChange}` fires
4. `onChange` (from `field`) updates the React Hook Form state
5. On form submit, `data.content` has the HTML string from the editor

---

## 5. Building the PostForm Component

**File:** `src/components/post-form/PostForm.jsx`

This single form is used for **both creating and editing** a post:
- If `post` prop is passed → **Edit mode** (pre-fill values, show update button)
- If no `post` prop → **Create mode** (empty form, show submit button)

```jsx
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";         // custom UI components
import appwriteService from "../../appwrite/config";      // Appwrite backend service
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// post — optional prop; if provided, we are in edit mode
export default function PostForm({ post }) {

    // Destructure everything we need from useForm
    const {
        register,      // registers native inputs (title, slug, image, status)
        handleSubmit,  // wraps our submit function, injects form data
        watch,         // watches field values in real time
        setValue,      // programmatically set a field's value
        control,       // needed for Controller (used in RTE)
        getValues,     // read current field values without re-render
    } = useForm({
        // defaultValues pre-fill the form
        // If editing (post exists): use post's data
        // If creating (no post): use empty strings / "active"
        defaultValues: {
            title:   post?.title   || "",
            slug:    post?.$id     || "",   // slug = Appwrite document ID
            content: post?.content || "",
            status:  post?.status  || "active",
        },
    });

    const navigate = useNavigate();

    // Get logged-in user data from Redux store
    const userData = useSelector((state) => state.auth.userData);
    // ...
}
```

---

## 6. useForm Hook — All Utilities Used

| Utility | What it does |
|---------|-------------|
| `register` | Connects native `<input>` to RHF — tracks value, runs validation |
| `handleSubmit` | Wraps your submit function; provides clean `data` object on submit |
| `watch` | Subscribes to field changes in real time (like an observer) |
| `setValue` | Programmatically update any field value |
| `control` | Passed to `Controller` so external components (RTE) can talk to RHF |
| `getValues` | Read current values of any/all fields on demand |

---

## 7. The `submit` Function — Logic Explained

```jsx
const submit = async (data) => {
    // CASE 1: Post already exists → UPDATE mode
    if (post) {
        // Step 1: If user selected a new image, upload it to Appwrite Storage
        // data.image is a FileList; data.image[0] is the first file
        const file = data.image[0]
            ? await appwriteService.uploadFile(data.image[0])
            : null; // No new image selected → don't upload

        // Step 2: If a new file was uploaded, delete the OLD image from storage
        // (so we don't accumulate unused files in the bucket)
        if (file) {
            appwriteService.deleteFile(post.featuredImage); // post.featuredImage = old file ID
        }

        // Step 3: Update the post document in Appwrite Database
        const dbPost = await appwriteService.updatePost(post.$id, {
            ...data,                // spread all form fields (title, slug, content, status)
            featuredImage: file     // if new file uploaded, use its ID
                ? file.$id          // new file's Appwrite ID
                : undefined,        // no new file → don't overwrite existing
        });

        // Step 4: Navigate to the updated post page
        if (dbPost) {
            navigate(`/post/${dbPost.$id}`);
        }

    // CASE 2: No post → CREATE mode
    } else {
        // Step 1: Upload the image (required for new posts)
        const file = await appwriteService.uploadFile(data.image[0]);

        if (file) {
            // Step 2: Get the uploaded file's Appwrite ID
            const fileId = file.$id;

            // Step 3: Add the file ID to the data object as featuredImage
            data.featuredImage = fileId;

            // Step 4: Create a new post document in Appwrite Database
            const dbPost = await appwriteService.createPost({
                ...data,               // spread all form fields
                userId: userData.$id,  // attach the logged-in user's ID
            });

            // Step 5: Navigate to the newly created post
            if (dbPost) {
                navigate(`/post/${dbPost.$id}`);
            }
        }
    }
};
```

**Flow Diagram:**
```
Form Submit
    │
    ├── post exists? ──YES──► Upload new image (if any)
    │                          ├── New image? → Delete old image
    │                          └── updatePost(post.$id, { ...data, featuredImage })
    │                                └── Navigate to /post/:id
    │
    └── NO (new post) ─────► Upload image
                              └── createPost({ ...data, userId })
                                    └── Navigate to /post/:id
```

---

## 8. The `slugTransform` Function

A **slug** is a URL-friendly version of a title. Example:
- Title: `"Hello World! My First Post"`
- Slug: `"hello-world-my-first-post"`

```jsx
// useCallback memoizes this function — it won't be re-created on every render
// This is important because it's used as a dependency in useEffect
const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
        return value
            .trim()           // remove leading/trailing spaces
            .toLowerCase()    // convert to lowercase: "Hello" → "hello"
            .replace(/[^a-zA-Z\d\s]+/g, "-")
            // Regex explained:
            // [^...] = match anything NOT in this set (negation)
            // a-zA-Z = letters
            // \d     = digits (0-9)
            // \s     = whitespace (space, tab)
            // +      = one or more of these characters
            // g      = global flag (replace ALL matches, not just first)
            // So: replace all special chars (!@#$%^&* etc.) with "-"
            .replace(/\s/g, "-");
            // Replace all remaining whitespace/spaces with "-"
            // "hello world" → "hello-world"

    return ""; // return empty string if value is invalid
}, []); // empty dependency array = this function never changes
```

**Step-by-step example:**
```
Input:    "  Hello World! My Post  "
.trim()   →  "Hello World! My Post"
.toLowerCase() → "hello world! my post"
.replace(/[^a-zA-Z\d\s]+/g, "-") → "hello world- my post"
.replace(/\s/g, "-") → "hello-world--my-post"
```

> **Why `useCallback`?** Because `slugTransform` is used inside `useEffect`'s dependency array. Without `useCallback`, the function would be a new reference on every render, causing the `useEffect` to run infinitely.

---

## 9. useEffect + watch — The Interview Concept

This is a **classic interview question**: *"How do you watch a form field and auto-update another field based on it?"*

```jsx
React.useEffect(() => {
    // watch() subscribes to ALL form field changes
    // It returns a subscription object (like an event listener)
    const subscription = watch((value, { name }) => {
        // value = current values of ALL form fields (object)
        // name  = the name of the field that just changed

        // We only care when the "title" field changes
        if (name === "title") {
            // Auto-generate the slug from the title
            setValue(
                "slug",                          // target field to update
                slugTransform(value.title),      // new value = transformed title
                { shouldValidate: true }         // also run validation on slug
            );
        }
    });

    // CLEANUP FUNCTION — This is the interview answer!
    // When this component unmounts OR dependencies change,
    // unsubscribe the watcher to prevent memory leaks
    return () => subscription.unsubscribe();

}, [watch, slugTransform, setValue]); // dependencies
```

**Why is this an interview question?**

The return value of `useEffect` is a **cleanup function**. When you set up subscriptions/listeners inside `useEffect`, you must clean them up to avoid memory leaks. Here's the pattern:

```
useEffect runs
    → sets up a subscription (watch listener)
    → returns cleanup function

Component unmounts / deps change
    → React calls the cleanup function
    → subscription.unsubscribe() is called
    → no more memory leak ✓
```

**What happens visually:**
- User types "My New Post" in the Title field
- `watch` detects "title" changed
- `slugTransform("My New Post")` → `"my-new-post"`
- `setValue("slug", "my-new-post")` → Slug field auto-fills
- User sees the slug update live as they type!

---

## 10. The Form JSX Structure

The form is split into two columns:

```jsx
return (
    // handleSubmit wraps our submit function and provides validated data
    <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">

        {/* ===== LEFT COLUMN (2/3 width) ===== */}
        <div className="w-2/3 px-2">

            {/* Title Input — registered with RHF, required */}
            <Input
                label="Title :"
                placeholder="Title"
                className="mb-4"
                {...register("title", { required: true })}
                // register spreads: name, ref, onChange, onBlur onto the input
            />

            {/* Slug Input — auto-filled by slugTransform, but also manually editable */}
            <Input
                label="Slug :"
                placeholder="Slug"
                className="mb-4"
                {...register("slug", { required: true })}
                onInput={(e) => {
                    // When user manually types in Slug field,
                    // also transform it to valid slug format
                    setValue(
                        "slug",
                        slugTransform(e.currentTarget.value),
                        { shouldValidate: true }
                    );
                }}
            />

            {/* RTE (TinyMCE) — uses Controller internally, needs control prop */}
            <RTE
                label="Content :"
                name="content"
                control={control}                // connect to RHF
                defaultValue={getValues("content")} // pre-fill with existing content
            />
        </div>

        {/* ===== RIGHT COLUMN (1/3 width) ===== */}
        <div className="w-1/3 px-2">

            {/* File input for featured image */}
            <Input
                label="Featured Image :"
                type="file"
                className="mb-4"
                accept="image/png, image/jpg, image/jpeg, image/gif" // allowed types
                {...register("image", { required: !post })}
                // required only when CREATING (no existing post)
                // when editing, image is optional (user may keep old image)
            />

            {/* Show current image preview when EDITING */}
            {post && (
                <div className="w-full mb-4">
                    <img
                        src={appwriteService.getFilePreview(post.featuredImage)}
                        alt={post.title}
                        className="rounded-lg"
                    />
                </div>
            )}

            {/* Status dropdown: "active" or "inactive" */}
            <Select
                options={["active", "inactive"]}
                label="Status"
                className="mb-4"
                {...register("status", { required: true })}
            />

            {/* Submit Button:
                - Edit mode  → green "Update" button
                - Create mode → default color "Submit" button */}
            <Button
                type="submit"
                bgColor={post ? "bg-green-500" : undefined}
                className="w-full"
            >
                {post ? "Update" : "Submit"}
            </Button>
        </div>
    </form>
);
```

---

## 11. Key Concepts Summary

| Concept | What it means |
|---------|--------------|
| **RTE** | Rich Text Editor — TinyMCE gives users a word-processor-like interface |
| **Controller** | RHF's wrapper for external/uncontrolled components like TinyMCE, React Select |
| **control** | Object from `useForm()` that carries form state — passed to `Controller` |
| **watch** | Subscribes to form field changes in real time |
| **setValue** | Programmatically update any field (used to auto-fill slug) |
| **getValues** | Read current field values on demand |
| **slugTransform** | Converts title string to URL-safe slug using `.trim()`, `.toLowerCase()`, regex replace |
| **useCallback** | Memoizes the `slugTransform` function so it doesn't cause infinite `useEffect` loops |
| **subscription.unsubscribe()** | Cleanup pattern in `useEffect` to prevent memory leaks from watchers |
| **Dual-mode form** | Same form component works for both Create and Edit by checking if `post` prop exists |
| **defaultValues** | Pre-fills form fields; uses `post?.field \|\| ""` pattern for optional post data |

---

## Complete Data Flow

```
User types in Title field
        ↓
watch() detects "title" changed
        ↓
slugTransform(value.title)
  → trim → lowercase → replace special chars → replace spaces
        ↓
setValue("slug", transformedValue)
        ↓
Slug field auto-updates in UI

        +

User clicks Submit
        ↓
handleSubmit(submit) runs
        ↓
    [Edit mode?]
    YES → uploadFile (if new image)
        → deleteFile (old image)
        → updatePost(id, { ...data, featuredImage })
        → navigate to /post/:id

    NO  → uploadFile (required)
        → createPost({ ...data, userId })
        → navigate to /post/:id
```

---

> **Pro Tip from the Lecture:** This is a **production-grade** application, not a toy project. You will need to watch this lecture **2-3 times** to fully absorb all the concepts. Don't just memorize the code — understand *why* each decision was made, and be able to argue for or against it. That's what separates a good developer from a tutorial follower.


<!-- Transcript:
```
हां जी कैसे हैं आप सभी स्वागत है आपका
वापस से चाहे और कोड और हमारा मेगा
प्रोजेक्ट चल रहा है इस वीडियो का टारगेट
है सबसे पहले तो सिर्फ ₹300 कमेंट्स आए इस
वीडियो के अंदर आपको थोड़ा सा आरटीई के
बड़े में बताएंगे रियल टाइम एडिटर जिसको
बोलते हैं काफी अलग-अलग तरह के आपके पास
आते हैं हमारा वाला थोड़ा सा इजी है कम
करना लेकिन एक प्रॉब्लम यहां पे भी है अब
देखिए अभी तक हम क्या कर रहे थे एक इनपुट
बॉक्स सेपरेट बना रहे थे फॉर्म जब चाहिए
था तो इनपुट बॉक्स को ले रहे थे और जो
हमारा हक है एन फॉरवर्ड वाला वो सीधा सा
कम कर रहा था मैं रेफरेंस दे रहा था
पेरेंट्स के अंदर तो कुछ करना ही नहीं पद
रहा था अपने आप सर कम हो रहा था अपने पास
सर इजीली हो रहा था लेकिन अब यहां पे भी
से प्रॉब्लम है की हमारे पास एक्चुअली में
जो रत ही वो तो एक सेपरेट कंपोनेंट बनेगा
और या तो उसको आप रेप करिए पूरा फॉरवर्ड
वाले हमारे हक के अंदर और फिर उसका एक्सेस
लीजिए लेकिन क्योंकि हमारे पास यहां पे
रिएक्ट हक फॉर्म है तो उसके अंदर भी से
टेक्निक कैसे की जाति है वो हम यहां पे
देखने वाले हैं और फॉर्म थोड़ा सा
इंटरेस्टिंग डिजाइन करेंगे क्योंकि यही से
फॉर्म आपके पास सबमिट के लिए भी कम आएगा
एडिट पे भी यही टाइम आएगा एक्जेक्टली से
कॉन्टिनेंट तो है तो एडिट करना है तो
साड़ी वालुज लोड करके उसको दे दो और अगर
नया क्रिएट करना है तो एम्टी वालुज दे दो
और थोड़ा सा स्लग वगैरा के बड़े में भी हम
देखेंगे की किस तरह से हम एक्चुअली में
थोड़ा सा उसे इफेक्ट का इंटरेस्टिंग एक
एग्जांपल लेंगे इंटरव्यूज में पूछे जाता
है वो एग्जांपल काफी आ तो वो एग्जैक्ट
एग्जांपल यहां पे भी लिया है एक उसे कैसे
हमने लिया है और हम क्या करेंगे एक इनपुट
फॉर्म को ट्रैक करेंगे और उसके बेसिस पे
एक स्लग को हम डिजाइन करेंगे कहानी पे भी
अगर वो स्पेस एड करता है तो हम उसे स्पेस
की जगह एक दास एड कर देंगे तो बड़ा ही
सिंपल है तो उसको भी हम देख लेते हैं बड़ा
ही सिंपल सा कम है इतना ज्यादा कुछ परिसर
है नहीं तो चलिए सबसे पहले हम कंपोनेंट
बनाते हैं अपने तो कंपोनेंट पर राइट क्लिक
करेंगे की न्यू फाइल बनाते हैं ये जो फाइल
है एक्चुअली में राइट क्लिक न्यू फाइल हां
जी अभी लिख रहे हैं तो ये हमारा रत है तो
आरटीई एन कैप्सूल में लिख देते हैं डॉट जी
एसएस क्योंकि एसएस तो है ही इसमें तो क्या
ये रॉक सकते हैं ठीक है अब ये जो है ना
यहां पे आईएफसी हम दे देते हैं और
एक्चुअली में डायरेक्टली एक्सपोर्ट कर
लेते हैं ताकि इजी रहे थोड़ा सा समझना में
एक्सपोर्ट डिफॉल्ट यह
तो हमारे पास ए गया है रिएक्ट ही चाहिए अब
हमें दो चीज चाहिए की एक्चुअली में पहले
तो बहुत आसन है हमें क्या है की पहले तो
चीज है एडिटर
यह एडिटर अभी एडिटर कहां से मिला है
एक्चुअली मैं आपको ये एडिटर आपको मिला है
ये जो टाइनी एमसी इंस्टॉल कर था यहां से
अब देखिए एडिटर जो है ना वो बड़ा ही बेसिक
है एक्चुअली में अगर आपको सिर्फ एडिटर ही
यहां से रिटर्न करना तो बहुत ही आसन कम है
आप चाहे तो डॉक्यूमेंटेशन भी इसका पढ़
सकते हैं अगर सपोज करिए मुझे सिर्फ एडिटर
रिटर्न करना था तो मैं इस तरह से एडिटर
रिटर्न कर सकता हूं इसको ये आप कर सकते
हैं और इसके अंदर वालुज होती है कुछ की
आपको कौन-कौन सी वैल्यू चाहिए तो एक तो
आपके पास ये इनिशियल वैल्यू वाला
कॉन्सेप्ट है की बाय डिफॉल्टर इसके अंदर
क्या है तो मैं यहां पे कुछ मैसेज भी दे
सकता हूं डिफॉल्ट वैल्यू भी अगर मेरे पास
है तो वो भी दे सकता हूं इस तरह से और एक
जो आपके पास चीज आई है वो है की आप
इनिशियलिसए होते इसके अंदर क्या-क्या
वालुज चाहते हैं वो आप इसके अंदर बता दो
तो हम क्या कर सकते हैं यहां पे जैसे
ब्रांडिंग दे सकते हैं तो ये सारे आपको
देखने पढ़ेंगे इसके ऊपर कोई ऑप्शन नहीं है
तो जैसे हमने दे दिया की ब्रांडिंग क्या
करो इसको जल कर दो यहां पे
यह लीजिए आप ब्रांडिंग की वैल्यू हमें जल
कर दिया यहां पर शायद एक और कर ली ब्रेसेज
लगेगा क्योंकि यह फर्स्ट जो वैल्यू है ये
प्रॉपर्टीज है हां जी ये फर्स्ट वाला
लगेगा ही ओके तो ये हो गया हमारे पास
वैल्यू फर्स्ट ब्रांडिंग हो गया इसी तरह
से आपको हाइट कितनी देनी है हाइट भी ऑप्शन
है ₹500 दीजिए पिक्सल्स वगैरा में काउंट
होती है सपोज करिए हम यहां पे 500 दे देते
हैं एक्सल बाय डिफॉल्टर होता है इसके अंदर
और भी और वालुज है आप इसके अंदर मेनू बार
आपको चाहिए नहीं चाहिए तो ये सारे तो हमें
पूछना ही पढ़ेंगे उससे की क्या-क्या वालुज
है इसके अंदर कैसे-कैसे डॉक्यूमेंटेशन
पढ़ना पड़ेगा बेसिक सी बात ये है अच्छा
इसके अलावा आप प्लगिंस भी इसको दे सकते
हैं ये बड़ा इंटरेस्टिंग है प्लगिंस में
क्या होता है की आपको क्या-क्या वैल्यू
चाहिए वो साड़ी दे दो जैसे सजेशन में इसने
दे दिया की आप इसके अंदर लिस्ट भी दे दो
एंकर्स भी दे दो शब्द काउंट भी यूजर को तो
जितने आपको चाहिए डॉक्यूमेंटेशन में से
देखिए और निकाल दो बस यही है अच्छा इतना
ही नहीं आपको टूलबार एक्सेस भी मिलता है
इसके अंदर ये लीजिए टूलबार और टूलबार के
भी आपको सजेशन में मिल जाएगा की क्या-क्या
टूलबार की वालुज है तो देखिए अंडू दे दो
रे तू दे दो फॉर्मेटिंग का ऑप्शन बोल्ट तो
बस ये
है तो यह तो हमने देख लिया की ठीक है
इसमें तो कोई दिक्कत नहीं है हम एडिटर तो
समझ गए की ये वाला कम तो है बड़ा आसन ठीक
है अब इसको करते हैं हम वापस से डिलीट
क्यों जी क्यों डिलीट कर रहे हैं बढ़िया
तो कम हो रहा था आ तो हां जी कम तो बढ़िया
ही हो रहा था उसमें तो कोई दोहराती नहीं
इसको एक बार टेस्ट करके हम कर लेते हैं
ताकि
प्रॉब्लम क्या है क्योंकि आपका एडिटर
सेपरेट जगह डिजाइन हो रहा है ऐसे सेपरेट
कंपोनेंट इसको कहानी ना कहानी उसे भी तो
करोगे तो कोई फॉर्म में कोई पोस्ट फॉर्म
में कहानी ना कहानी कोई उसे करेंगे तो
वहां से मेली मुद्दा यह है की हमारा
रेफरेंस कैसे इसका मिलेगा तो वो एक
एक्चुअली में इंटरेस्टिंग चीज है उसके लिए
क्या है क्योंकि हम रिएक्ट फॉर्म उसे करें
वैसे तो आप चाहें तो हमारा जो से फॉरवर्ड
हमने फॉर्म होके उसे किया था उसको उसे
करके कम चला लो बट क्योंकि इस तरह के कम
आप करोगे तो एक्चुअली में एक और हमें चीज
पढ़नी पड़ेगी वो है कंट्रोलर
अब यह कंट्रोलर क्या है रिएक्ट फॉर्म से
मिलता है ठीक है जी कंट्रोलर आपको यहां से
मिलता है तो कंट्रोलर के बड़े में भी
बताइए तो यहां पर देखिए कंट्रोल इनपुट नाम
से एक अपना पूरा क्षेत्र है यहां पे तो
यहां पे इन्होंने बोल रखा है की ये जो
कंट्रोलर है ना ये एक्जेक्टली वही से कम
है रिएक्ट फॉर्म से आता है और कंट्रोल
इनपुट क्या है तो लाइब्रेरी एंब्रेस डी
अनकंट्रोल्ड कंपोनेंट और नेटिव एचटीएमएल
इनपुट तो जो कम हम वहां पे कर रहे थे वही
से डेफिनेशन में लिखा हुआ है हॉवेवर इट्स
हार्ड तू अवॉइड वर्किंग विद एक्सटर्नल
कंट्रोल और सच इस रिएक्ट सिलेक्ट और दी ये
तो सब अलग कंट्रोलर से तो इस कम को
स्ट्रीमलाइन प्रोसेस के लिए कहते हैं की
आपको हक हक की जरूर नहीं है अगर हमें लेना
है तो ले सकते हैं बट एक्चुअली में यहां
पे अगर आप ले रहे हैं तो उसको जरूर नहीं
है आप क्या करिए कंट्रोलर के अंदर सब कुछ
यहां पे एड कर दीजिए जो भी आपका
कंट्रोलर्स है और क्या आपको रेंडर करना है
वो फूल चेक बॉक्स वाला है जो भी है वो
फील्ड आप मेरे को दे दीजिए इस तरह से और
वो ये फील्ड का आपको ये इस तरह से देना
पड़ेगा एक कॉल बैक है जिसके अंदर कर ली
ब्रेसेज के अंदर हम फील्स ले लेंगे उसके
अंदर आपको कुछ और भी लेना है तो आप ले
सकते हैं एक्चुअली मैं यहां पर की वैल्यू
पर होता है तो आपको क्या-क्या फील्ड के
ऊपर ऑन चेंज पर कोई वेट चाहिए या किस तरह
से चाहिए उसका आप कंट्रोल ले सकते हो एक
एग्जांपल आपको मैं करके दिखता हूं यहां पे
वो थोड़ा सा ज्यादा अच्छा है और समझ में
भी आता है ठीक है तो पहले बात तो ये की आप
इसके अंदर इनपुट क्या करोगे जब भी इसको
कोई कॉल करेगा एक तो मैं लूंगा नाम तो आप
मुझे नाम बताओगे इसके अंदर क्या है अब एक
और जो चीज यहां पे लेंगे वो लेंगे कंट्रोल
अच्छा ये कंट्रोल आएगा कहां से ये कंट्रोल
ही एक्चुअली में रिएक्ट हक फॉर्म से आता
है और यही कंट्रोल रिस्पांसिबल है इसकी
साड़ी स्टेट वगैरा को उसे फॉर्म में ले
जान के लिए तो अभी कंपोनेंट है तो
कंपोनेंट से फॉर्म में तो ये कंट्रोल कहां
से पास करोगे जब इस रत को हम उसे करेंगे
वहां पे ठीक है थोड़ा सा मानता हूं नहीं
इनफॉरमेशन है बट देखिए ट्यूटोरियल है
इसलिए ना की नई इनफॉरमेशन हो साड़ी पुरानी
इनफॉरमेशन देंगे तो कैसे कम चलेगा अच्छा
यहां पे क्या है एक हम डिफॉल्ट वैल्यू भी
ले लेते हैं ताकि अगर कोई और इसको उसे
करें तो इस तरह से कर लेने बाकी रेस्ट तो
हमें जरूर नहीं है बट अगर हो तो प्रॉबस ले
सकते हैं कोई इशू वाली बात नहीं है
डिफॉल्टर इनफॉरमेशन हम क्या बोलते हैं
इसको एम्टी देते हैं की ठीक और बाकी
इनफॉरमेशन तो एस्केप कर लेते हैं अच्छा यह
साड़ी इनफॉरमेशन हो गई इंपॉर्टेंट इसमें
यही है सिर्फ आपका कंट्रोल जो की एक्चुअली
में इस कॉम्पोनेंट्स से कंट्रोल पास ऑन
करेगा जो भी इसको कॉल करेगा उसके अंदर अब
इसको उसे कैसे करना है वो भी बड़ा इजी है
तो पहले एक बार यहां चलते हैं हमारे दीव
के अंदर इसको विथ दे देता है क्लास नाम
वूशफुल जैसे हम वो इनपुट्स बना रहे थे
ऑलमोस्ट से इस तरह से सबसे पहले बात आई है
लेवल की तो लेबल के अंदर क्या करना है वो
अपने जावास्क्रिप्ट इंजेक्टर करो और बोलो
लेबल अगर है तो लेबल दे दीजिए इस तरह से
तो यहां पे लेबल की हमारे पास क्लासेस ना
थोड़ी सी अलग है लेबल हमने डिजाइन किया था
तो कुछ क्लासेस अलग है तो हमने सोचा अलग
दे देते हैं इन लाइन ब्लॉक हमने लिया और
उसके बाद मार्जिन बॉटम वन और वेडिंग लेफ्ट
साइड में हमने ओनली और उसके बाद हमने लेवल
दे दिया यहां पे तो इतना कम तो ठीक है
हमें समझ में आया की लेबल दे दिया नहीं
इसमें तो कोई ज्यादा दिक्कत नहीं अब आई है
असली बात तो हमारे कंट्रोलर की कंट्रोलर
हम सेल्फ क्लोजिंग ले लेते हैं ठीक है जी
अब कंट्रोलर क्या पूरा कंट्रोल यहां से
पास करेगा कहानी और तो कंट्रोलर आपको तीन
कर चीज देता है आप देखेंगे यहां पे
कंट्रोलर पे आप नाम भी दे सकते हैं एक
कंट्रोल भी दे सकते हैं जो की पैरंट
कंपोनेंट कॉल करेगा रूल्स भी आप डिफाइन कर
सकते हैं और रेंडर एलिमेंट में डिफाइन कर
सकते हैं तो एक-एक करके तीनों चारों को हम
डिफाइन करते हैं सबसे पहले तो नाम वैल्यू
ले लेते हैं अब नाम के अंदर क्या है की हम
एक्चुअली में जो ये नाम पास हुआ था हम इसी
नाम को उसे कर लेंगे तो या तो ये नाम दे
देते हैं एक्चुअली मैं कैलिब्रेशंस में
लिखना पड़ेगा क्योंकि
वेरिएबल है नाम ले लेते हैं अगर नाम नहीं
है तो यहां पे हम क्या बोले थे उसको
कंटेंट बोल लेते हैं आपका जो मां करें
बोलिए स्ट्रिंग है और कुछ भी नहीं है ठीक
है जी इतना कम हो गया अब ये जो चीज है
कंट्रोल ये कंट्रोल देगा पैरंट एलिमेंट तो
जो भी पैरंट एलिमेंट्स को कॉल करेगा पास
कर देंगे ताकि वो पूरा कंट्रोल ले पे
जितने भी इवेंट्स हो रहे हैं इसकी स्टेट
है इसके अंदर वालुज क्या है डाटा क्या है
वो सर का सर ले पाया है अब जो सीखने लायक
यहां चीज है कैसे एलिमेंट्स रेंडर करते
हैं ये थोड़ा सा इंटरेस्टिंग है देखिए
यहां पर क्या करिए सबसे पहले तो एक कॉल
बैक दाल दीजिए ये लीजिए कॉल बैक और इस तरह
से ये कॉल बैक है हमारा अब इस कॉल बैक के
अंदर वालुज कैसे डालते हैं वो मैं आपको
बताता हूं की आपको ट्रैक क्या-क्या करना
है और कितने कितने फील्ड्स हैं आपके पास
वो सब देखिए बोलते सभी को यहां पे फील्ड
ही हैं लेकिन फूल पे अलग-अलग प्रॉपर्टीज
आपको लेते हैं जैसे ये उसे एपी बुक्स
वगैरा और भी काफी इन्होंने एग्जांपल दे
रखें हैं एक्चुअली मैंने भी यही से देखा
है ऐसी कुछ बात नहीं है अलग-अलग सर्विसेज
के थ्रू काफी स्कीम वैलिडेशन तो देखिए
सबसे इजी क्या है यहां पे हमारे पास एक
कैलिबर्स लेते हैं और एक हमारे पास फील्ड
होगा अब फील्ड के ऊपर ट्रैकिंग क्या लगानी
है वो इस तरह से लगे जाति है जो भी इवेंट
की ट्रैकिंग आपको लगानी है ऑन ब्लर ऑन
चेंज सजेशन दे रहा है तो मुझे अभी ऑन चेंज
की लगानी है की इस फील्ड के अंदर कुछ भी
चेंज अगर होता है तो मुझे इन्फॉर्म कर
देना रेंडर की साथ तो हम उसे फील्ड का ऑन
रेंडरिंग यहां पे देख रहे हैं इसी तरह से
बेसिक हो गया अब यहां पे आते हैं यहां पे
क्या करना है जो भी एलिमेंट आपको रेंडर
करवाना है रेंडर से मेरा मतलब है इनपुट
फील्ड हो तो इनपुट ले लो एडिटर हो तो
एडिटर ले लो अब एडिटर के बड़े में अभी
हमने जस्ट देखा वो का वो से एग्जांपल है
हमारा की ये हमारा एडिटर है इस तरह से
हमने वालुज ली है और ये हमने उसको सेल्फ
क्लोजिंग कर दिया है अब देखिए एडिटर की
ऑलरेडी हमने बात कर ली है की उसके अंदर ये
हमारे पास हाइट हो गई मेनू बार हो गया और
भी कुछ वालुज अगर आपको चाहिए तो जैसे
इनिशियल वालुज के अंदर क्या रखती है आपको
तो हमारे पास पता है हम डिफॉल्ट वैल्यू रख
देते हैं क्योंकि यही वैल्यू हमने ली है
तो इस को रख देते हैं अगर कुछ नहीं है तो
एम्टी कर देंगे हाइट हमने ले ली मेनू बार
मेनू बार भी दे देते हैं यूजर को क्यों
हीरो के तो ये लीजिए ट्रू दे दिया प्लगिंस
की लिस्ट आपके पास है मेरे पास एक अरे है
प्लगइन का तो मैं एक्चुअली में उसे यर को
ले आता हूं जो की हमने एक्चुअली में उसे
किया था आपका मां करें उसमें कम ज्यादा आप
कर सकते हैं कोई ऐसी दिक्कत वाली बात नहीं
है ये लीजिए पेस्ट कर दिया तो ये हमारी
प्लगिंस की साड़ी वैल्यू में इमेज भी
चाहता हूं एंकर भी चाहता हूं तो जितने भी
उसमें ऑप्शन थे हमने क्या कर सीधा का सीधा
देखा की किस तरह से इसमें डॉक्यूमेंटेशन
में लिखा है और सारे के सारे हम ले आए
उसके अंदर जो भी वैल्यू उसकी आगे आईटी इसे
तो यहां पर हम क्या करते हैं और भी टूलबार
के ऑप्शन भी यहां ले आते हैं तो टूलबार के
सारे ऑप्शन स्ट्रिंग से यह ले आते हैं तो
यह
पूरे सजेशन में भी आई थिंक से ही आए हैं
तो यह है अच्छा इसके अलावा और भी ऑप्शन है
ऐसा नहीं की तो नहीं है जैसे कंटेंट
स्टाइल भी एक है और भी है कंटेंट ब्लॉक भी
आपको सजेशन में देख लिए होंगे ब्लॉग
फॉर्मेट भी है की हेडर पैराग्राफ और कुछ
भी चाहिए तो यह तो डॉक्यूमेंटेशन पढ़ना
पड़ेगा तो हम यहां पे लेट हैं कंटेंट
स्टाइल और कंटेंट स्टाइल भी हमारे पास है
की कौन सी वालुज है तो उसको भी हम ले आते
हैं कुछ नहीं इसके अंदर बॉडी वगैरा चेंज
कारी है बस और कुछ भी नहीं कर है इतना कोई
खास कम किया नहीं उसमें यह लीजिए तो बॉडी
फोंट फोंट साइज डिफॉल्ट वालुज होती है
अच्छा अब क्या है देखिए ये ऑन एडिटर चेंज
एडिटर पर कुछ भी चेंज होता है तो यहां पर
हमने एक वैल्यू लगा राखी है वो है हमारी
कहां गई ये रही फील्ड तो फील्ड पे ऑन चेंज
इसी को हम उसे करेंगे अभी जस्ट करके
दिखाऊंगा इसी को हम उसे करेंगे तो ये
थोड़ा सा एक कॉन्सेप्ट है की एडिटर में
कुछ भी चेंज हो तो हमारे फील्ड जो है वो
गवर्नमेंट हो रहे हैं ऑन आसानी से तो जो
भी मेथड आप उसे करें आज आईटी इस उसे कर
लीजिए यहां पर मानता हूं थोड़ा सा परिसर
है बट देखिए फंक्शनैलिटी एडिशनल दाल दिए
तो थोड़ा सा डॉक्यूमेंटेशन और ये सब पढ़ना
पड़ेगा की किस तरह से वालुज आई है तो यहां
तो हो गया हमारा फर्स्ट कम की ठीक है इस
तरह से आता है अब इसको उसे कैसे करना है
जब भी आप एडिटर वगैरा उसे करेंगे तो करना
कुछ भी नहीं एडिटर इसका आरटीई का सिर्फ
क्या है लेबल हम वहां पे देंगे और कंट्रोल
हम ले लेंगे इसका ठीक है अब कंट्रोल वगैरा
कैसे लेते हैं उसका भी देखते हैं तो उसको
एक बार से करते हैं और एक हम नया पोस्ट
फॉर्म बनाते हैं कंपोनेंट के अंदर हम क्या
करेंगे फोल्डर ही बना लेते हैं क्योंकि ये
काफी जगह हमारा कम आएगा थोड़ा इंटरेस्टिंग
कॉन्सेप्ट है पोस्ट फॉर्म और इस पोस्ट
फॉर्म के अंदर हमें पोस्ट फॉर्म बनाना है
तो न्यू फाइल बना लेते हैं पोस्ट
फॉर्म डॉट जस्स ठीक है जी अब यहां से
थोड़ी कहानी आपको क्लियर होगी की एक्चुअली
में क्या क्या वालुज है ऑन चेंज क्या है
कंट्रोल क्या है वो सब यहां से आपकी थोड़ी
कहानी क्लियर होती है रिएक्ट तो लेंगे और
यहां पर एक्चुअली में उसे कॉल बैक भी
लगेगा उसको भी आगे जाके हम हैंडल करेंगे
यहां पे फंक्शनैलिटी थोड़ी सी एक्स्ट्रा
है अब देखिए एक तो आपके पास यहां पे आएगा
उसे फॉर्म
उसे फॉर्म एक्चुअली में हमारे पास आता है
रिएक्ट हक फॉर्म से एक्चुअली में अभी नहीं
है हमारे पास हां रिएक्टरेट फॉर्म से ठीक
है जी इसको भी उसे करेंगे
तो ये लीजिए बटन ए गया है हमारे पास में
बटन ए गया है इनपुट ए गए हैं इनपुट भी
चाहिए क्योंकि इस फॉर्म के अंदर काफी और
चीज भी हैं सिलेक्ट भी चाहिए फॉर्म फॉर्म
कॉम्पोनेंट्स नहीं यहां से तो नहीं आएंगे
ये सब
ओके बैक जाते हैं डॉट डॉट स्लैश और
इंडेक्स हां जी इंडेक्स से ले लेते हैं
ओके सिर्फ इतना ही नहीं एक आरटीई भी
चाहिएगा रत हमने इसके अंदर एक्सपोर्ट नहीं
कर रखा इसलिए हमें मिला नहीं है
इंपोर्ट
कर देते हैं
क्योंकि एक्चुअली में डाटा कनेक्ट करके
सेंड तो करना है तो उसकी सर्विसेज तो
लगेगी लगेगी
बाद में अभी तो चाहिए अप
राइट सर्विस
ओके अप राइट
हमने इसको सर्विस बोला था एक्चुअली
अभी के लिए तो और यह आएगी हमारे पास में
कहां से
जाना पड़ेगा
बट सर्विस भी देंगे तो भी चलेगा ओके और
क्या चाहिए नेविगेटर सिलेक्ट चाहिए ठीक है
जी
उसे नेविगेट
सिलेक्ट कहां से मिलेगा हां जी यहां से यह
वाला चाहिए ओके अब आते हैं एक-एक करके
फंक्शनैलिटी पे बात पहले जो बेसिक कम है
वह तो कर ही लेते हैं अब देखिए सबसे
इंपॉर्टेंट जो चीज है जो आपको सीखने लायक
है इस को सबसे पहले हैंडल करते हैं हमें
कुछ इनफॉरमेशन चाहिए की कहां से चाहिएगी आ
जो आपका उसे फॉर्म है यहां से की जब भी आप
फॉर्म उसे करेंगे इसी तरह से आपको
इनफॉरमेशन चाहिएगी ये लीजिए अब क्या क्या
देता है आपको उसे फॉर्म देखिए उसे फॉर्म
आपको काफी इनफॉरमेशन दे सकता है एन
डिपेंड्स आपको क्या-क्या उसे करना है अभी
तक जो हमें देखा था एक तो रजिस्टर देखा था
ठीक है जी एक हमने देखा था हैंडल्स सबमिट
ये लास्ट वीडियो में देख चुके हैं लेकिन
आपको वाचिंग कैपेबिलिटी भी देता है की
किसी फील्ड को अगर आपको कंटिन्यूसली
मॉनिटर करना है तो आपको वॉच कैपेबिलिटी भी
देता है आप किसी भी फॉर्म के साथ वॉच लगा
सकते हैं उसे कैसे करना है वो हम देखेंगे
उसके बाद आपकी सेट वैल्यू भी दे सकता है
किसी भी फॉर्म के अंदर कोई वैल्यू सेट
करनी है तो हम डायरेक्टली वैल्यू लिख के
नहीं करते हैं क्योंकि अब हम फॉर्म्स जो
है रिएक्ट के फॉर्म्स उसे कर रहे हैं
रिएक्ट हक फॉर्म तो इसी तरह से वालुज को
सेट किया जाता है
है अगर किसी फॉर्म का आपको कंट्रोल चाहिए
तो यहां पर भी आपको यह डायरेक्टली कंट्रोल
मिलता है यही कंट्रोल हम पास करेंगे आज
आईटी इस रत में तो वहां से जो भी सिंटेक्स
है जो सब है वो मुझे कंट्रोल मिल जाएगा और
एक और चीज चाहिए गेट वालुज तो जितने भी
फॉर्म की अगर आपको कोई वालुज कभी भी ग्राफ
कर दें सारे फॉर्म्स के जिसकी भी तो आप
यहां से ले सकते हैं ठीक है ये तो हो गया
हमारा यूज्ड फॉर्म अब उसे फॉर्म के अंदर
एक्चुअली मैं आप एक ऑब्जेक्ट भी पास कर
सकते हैं जिसके अंदर आप जो भी वालुज देना
चाहे वो दे सकते हैं अब देखिए मैं देता
हूं डिफॉल्टर वालुज अब डिफॉल्ट वालुज क्या
है डिफॉल्ट वालुज वो साड़ी वालुज हैं जो
एक्चुअली में हम उसे करेंगे अभी यहां पे
इसने सजेशन में कुछ भी दे दिया है उसका हम
चिंता बाद में करेंगे अभी तो हम सिर्फ एक
टाइटल रख लेते हैं ताकि हम कंफ्यूज ना हो
तो ये टाइटल हमने ले लिया और ये साड़ी
डिफॉल्टर वैल्यू से जो हम कम में लेंगे
ओके ठीक है अभी शायद ठीक है यहां पे ओके
आपको क्या-क्या इश्यूज हैं यहां पर ए गए
हैं हम ये तो उसे फॉर्म है ये उसे फॉर्म
का और हो रहा है
ओके देखते हैं आपको
ओके
देखते हैं एक बार इसको भी चेक किया जाए की
कहां पर साड़ी ओके जी छोटी
वालुज है ना इनको किस तरह से लिखा जाता है
वो भी आप देख लीजिए यहां पे देखिए डिफॉल्ट
वालुज के लिए पहले तो कुछ इनफॉरमेशन चाहिए
की हमें अब वो इनफॉरमेशन हमारे पास आएगी
कहां से है तो इनफॉरमेशन कहां से आएगी
एक्चुअली में हमें एक पोस्ट चाहिएगा और हम
देखेंगे की देखिए अगर हम पहले क्वेरी करके
देखेंगे क्योंकि हो सकता है यूजर इस फॉर्म
पे आया हो एडिट करने के लिए या फिर यूजर
आया हो एक नई वालुज को देने के लिए तो नई
वैल्यू उसको अगर लेने आए हैं तो ठीक है
एम्टी दे सकते हैं लेकिन हो सकता है वो
एडिट करने आए हो तो इनकी अगर वो एडिट करना
है तब हमें यहां पे कुछ डिफॉल्ट वालुज
देनी पड़ेगी उसको और डिफॉल्ट वैल्यू उसके
बाद जो भी डेटाबेस से आएगी अप राइट से
हमारे पास वैल्यू आएगी
अच्छा अब एक नया सवाल आता है की ठीक हम इस
फॉर्म को उसे करने वाले हैं तो यह बताइए
की यह वैल्यू जाएगी कहां से जो भी इस
फॉर्म को उसे करेगा वो पास करेगा मेरे पास
सिंपल सी बात है मेरे को कोई सपना थोड़ी
ना आएंगे की अच्छा इस फॉर्म में आया तो
अपने आप तो जो भी इस फॉर्म को उसे करेगा
अपने आप उसे पर क्लिक करके ही तो आया
होंगे एडिट बटन पर जब भी एडिट बटन पर
प्रेस करेंगे तो पोस्ट की साड़ी इनफॉरमेशन
दो हमें तो ठीक है अब यहां पे क्या करना
है ये आपके टाइटल उसे करने का बड़ा ही इजी
सा तरीका है आप क्या बोलिए की अगर पोस्ट
है ऑप्शनली तो उसका टाइटल उसे कर लीजिए और
अगर नहीं है तो एम्टी रख दीजिए क्योंकि
इनफॉरमेशन आई नहीं है तो इसी तरह से कम
मिलेंगे इसी तरह हमारे पास लॉक की वैल्यू
ए जाएगी तो पोस्ट के अंदर स्लग है तो ठीक
है नहीं है तो कोई बात नहीं कंटेंट को भी
हम यही करेंगे की हमारा जो
कंटेंट है यहां पे उसे कंटेंट की वैल्यू
भी क्या करेंगे पोस्ट के अंदर कंटेंट है
तो उसे कर लो नहीं है तो एम्टी दे दो और
उसके बाद एक स्टेटस भी है स्टेटस
स्टेटस
जो भी है वो स्टेटस ले लो अगर नहीं है तो
उसको बाय डिफॉल्ट हम एक्टिव शो कर देंगे
तो समझ में ए गई अब चलते हैं थोड़ा सा और
देखिए सबसे पहले बात तो यहां पे है तो कुछ
यूजर डाटा भी चाहिएगा थोड़ा सा नेवीगेशन
वगैरा के भी हमारा कम आएगा तो उसके बड़े
में थोड़ा डिस्कस कर लेते हैं नेविगेट तो
उसे किया है तो उसको बना ही लो इसमें तो
चिंता करने वाली बात ही नहीं है दूसरी चीज
हमें चाहिए यूजर डाटा तो हम क्या बोलते
हैं सीधा का सीधा
है की यह कांच लीजिए और यूजर डाटा मुझे दे
दो अब यूजर डाटा कहां से मिलेगा हमारे
स्टेट के अंदर रखा हुआ है वहां से ले लेते
हैं तो उसे इलेक्ट्रा से बोलते हैं की
यूजर डाटा मुझे दे दो ठीक है जी यूजर डाटा
आपको मिल चुका है यहां पे ओके यहां तक तो
ठीक बात है अब देखिए अब बात क्या है सबसे
पहले चीज तो अगर यूजर ने फॉर्म सबमिट कर
दिया है तो क्या करूं अब यूजर ने अगर
फॉर्म सबमिट कर दिया है तो उसने डाटा पास
कर होगा आपने हमने देख लिया की जो रिएक्ट
हग फॉर्म है वहां पे डाटा मिल जाता है एक
ऑब्जेक्ट जो रजिस्टर करके हम ले लेते हैं
तो वो तो हम ले लेंगे तो पहले एक सबमिट
नाम का एक फॉर्म बनाते हैं और देखते हैं
क्या-क्या चीज किस तरह से कम करेगी अब दो
केसेस हैं या तो पोस्ट की वैल्यू है
ऑलरेडी अगर है तो अपडेट करो और अगर पोस्ट
की वैल्यू नहीं है तो एक नई एंट्री क्रिएट
करो हां जी तो इस तरह से कम करना पड़ेगा
तो एक बनाते हैं हम यहां पे सबमिट
यह हो गया हमारा सबमिट और सबमिट के अंदर
सिंह के अंदर ही सर डाटा जाएगा कुछ इस तरह
से यह लीजिए सिंह का डाटा अब दो केसेस
यहां पे बनते हैं एक तो आपके पास पोस्ट है
और एक नहीं है अगर पोस्ट है आपके पास तो
क्या करने जा रहे हो अगर पोस्ट आपके पास
है अपडेट ही तो करने जा रहे हो हां जी तो
अपडेट में सबसे पहले कम क्या करेंगे सबसे
पहले फाइल को हैंडल करते हैं फाइल को
हैंडल करने के लिए हमने अपलोड फाइल ऑलरेडी
बना रखा है तो सबसे पहले क्या करो लो और
फाइल को अपलोड कर दो ठीक है जी फाइल को
अपलोड कैसे करेंगे जो डाटा है रिएक्ट हग
फॉर्म का यही सबसे बड़ा फायदा है की हम इस
टाइप के फॉर्म्स बना सकते हैं जो की डाटा
एक्सेप्ट करें अगर आप बाय डिफॉल्टर ऐसे
बनाते तो बहुत सर मेहनत लगता है उसमें
बहुत एफर्ट जाता है तो डाटा आपको
डायरेक्टली एक्सेस देता है इन इमेज का तो
जितनी भी इमेज हैं आपको इस तरह से इमेज
मिल जाति है हमें फर्स्ट इमेज चाहिए वैसे
तो अरे होता है मल्टीपल इमेज भी सपोर्ट
होती है बट हम इस तरह से लेंगे ठीक है अगर
आपके पास इमेज है तो कुछ करो और अगर नहीं
है इमेज तो कुछ करो तो क्या करना कुछ नहीं
करना जी नल करना है ठीक है अगर है इमेज तो
क्या करूं तो कुछ नहीं अप्राइट की सर्विस
उसे करो और उसको बोलो की हम उसे करेंगे
अपलोड फाइल आपकी सर्विस अब अपलोड फाइल को
क्या-क्या चाहिए डाटा चाहिए तो आज आईटी इस
डाटा दे दो उसको डाटा डॉट इमेज तो यहां पे
हम दे देंगे अपनी इमेज और इसकी फर्स्ट
प्रॉपर्टी आ फर्स्ट इमेज है अब ये सब अगर
ए गया है तो एक वेरिएबल बना लेते हैं फाइल
और उसमें स्टोर कर लेते हैं ठीक है जी
इतना कम तो हमारे पास हो गया है अब अगर
आपके पास फाइल ए चुकी है आ तो एक कम करो
इसको भी तो से करना ही है ठीक है जी और
क्योंकि पोस्ट आपके पास ऑलरेडी था पहले से
तो एक इमेज डिलीट भी तो करनी पड़ेगी चलो
आप लोड तो कर दी अच्छी बात है बट पुराने
इमेज डिलीट भी तो करो तो हां जी वह भी
करनी पड़ेगी तो हम क्या करेंगे यहां पे
फाइल
देखिए अब फाइल एक्चुअली में हमारे पास है
मतलब अपलोड हो गई है तो मैं डाटा का एक
डिलीशियस का ऑपरेशन यहां पर चलता हूं तो
अप्राइट की सर्विस उसे करेंगे और उसको
बोलेंगे की एक फाइल डिलीट कर लो यह डिलीट
फाइल इस तरह से है और क्योंकि पोस्ट का
एक्सेस मेरे पास है तो पोस्ट डॉट इमेज अब
पोस्ट डॉट इमेज के अंदर क्या स्टोर कर रहे
हैं हम सारे के सारे जो आपकी फाइल से उसका
आईडी तो स्टोर कर रहे हैं और डिलीट करने
के लिए यही तो चाहिए था तो आपकी फाइल
डिलीट हो गई है तो ये आपकी इमेज यहां पे
हो गई अच्छा इसको हम इमेज नहीं बोल रहे
हैं एक्चुअली में डेटाबेस में अगर आपको
याद हो तो हमने इसको फीचर डैमेज बोला था
तो जो भी आपने इमेज को बोला है उसे तरह से
बोल दो तो देखो अब पोस्ट है तो फाइल अपलोड
भी हो गई है और डिलीट भी हो गई है अच्छा
अब पोस्ट को अपडेट भी तो करना पड़ेगा अब
लकिली हमने उसके लिए सर्विस बना राखी है
लेकिन उसको सर डाटा तो देना ही पड़ेगा
अच्छा डाटा भी देना पड़ेगा इतना भी कम
नहीं है लेकिन डाटा भी दे देंगे चलिए अब
यहां पर कॉन्फ़िग में जाते हैं और पोस्ट
अगर अपडेट वाला क्षेत्र जो है तो आपको
ध्यान है ये स्लग भी देना पड़ेगा स्लग
क्या है एक्चुअली में पोस्ट का आईडी है इस
गूगल स्टोर कर रहे हैं सब कुछ हम और बाकी
इनफॉरमेशन भी हमें देनी पड़ेगी ठीक है जी
इतना दिक्कत वाली बात है नहीं तो क्या
करिए सबसे पहले हम बोल देते हैं इसको आ
डीबी पोस्ट जो भी आपका मां करें वेरिएबल
का नाम ही है हम इसको करते हैं आवटे और
अप्राइट के सर्विस उसे करते हैं अपडेट
पोस्ट की अब अपडेट पोस्ट में सबसे पहले
स्लग चाहिए तो स्लग कहां से मिलेगा पोस्ट
डॉट ये डॉलर आईटी ये डॉलर आईडी हमारा सर
कम कर देगा ठीक है इस तरह से वैल्यू ए गई
और इसका ये भी क्लोज हो गया अब इसके अंदर
और वालुज क्या-क्या डॉग कुछ भी नहीं करना
है सीधा स्प्रेड कर दो डाटा को क्योंकि
फील्ड इस तरह से बनाएंगे की सर कम हो
जाएगा बस एक फील्ड ओवर राइट करना पड़ेगा
आपको कौन सा फील्ड ये फीचर दे मैच वाला
क्योंकि बाकी सब तो मिल जाएगा आपको लेकिन
इमेज अपलोड करके एक डाटा ए चुका है आपके
पास तो इस फील्ड को तो ओवरराइट करना
पड़ेगा तो इस फील्ड को हम क्या बोलेंगे की
फीचर्ड इमेज को कैसे सेट कर दो की अगर
फाइल है जो की है हमारे पास यहां पे फूली
अगर फाइल है तो फाइल की आईडी यहां से दे
दो सीधा का सीधा फाइल के अंदर से जो उसका
आईडी मिलेगा वो क्या होगा यूनिक फ्रेंच
गाइड
पोस्ट डॉट फीचर्ड इमेज के अंदर आप दाल दो
अच्छा यहां से तो ये वाला पार्ट एक्चुअली
मैं गलत है ये देखिए अगर फाइल है तो उसकी
आईडी हम फीचर्ड इमेज में दाल देंगे अगर
नहीं है तो अनडिफाइंड कर देते हैं अभी के
लिए वैसे तो ये एरर के समय और अच्छे से
हैंडल करना चाहिए था बट ठीक है इतने में
भी कम हो जाएगा हमारा ठीक है जी आ आपके
पास डीबी पोस्ट ए गया है अब डीबी पोस्ट
अगर ए गया है आपके पास में और सक्सेसफुली
सब कम हो गया है तो यूजर को नेविगेट भी कर
दो ठीक है जी ये भी कर देते हैं तो यहां
पे हम बोल देते हैं डीबी पोस्ट जो भी आपने
वेरिएबल में स्टोर कर था उसको जो भी नाम
दिया था ठीक है जी अच्छा जी अब आपको क्या
प्रॉब्लम है आपको प्रॉब्लम है कोमा से
ठीक है यहां पर हम एड कर देते हैं वैसे तो
नहीं होना चाहिए था बट ठीक है कोमा अगर
आपको चाहिए तो दे देते हैं ठीक है अब क्या
करो यूजर को नेविगेट कर दो नेविगेट कहां
पे करना है उसको नेविगेट करना है जहां पर
भी वो है अभी एडिट कर रहा था तो वहां से
स्लैश पोस्ट स्लैश और बाकी तो हमारा आगे
आईटी इसे से है आपको आईडी मिल जाएगा तो
वहां पर रीड कर देंगे अच्छा जी ये सर कम
तो हो गया हमारा की ठीक है इतना तो समझ
में आया अब हमें लेकिन ये जो सर कम आप कर
रहे थे इसको भी यहां पे एक लाइन ब्रेक दे
देते हैं
ठीक है और इसको हम यहां ले ले ठीक है अब
देखिए यह जो सर कम था यह तो तब था जब
पोस्ट आईएफ था की हां भाई पोस्ट है आपके
पास में तो पोस्ट है वो तो अच्छी बात है
लेकिन अगर पोस्ट नहीं है तब क्या करेंगे
उसे सीन के अंदर हां जी वो भी देखना
पड़ेगा हमें तो अगर पोस्ट नहीं तो
एक्चुअली में कम थोड़ा सा आसन है थोड़ा सा
तो नहीं बट हां थोड़ा आसानी मां लो उसको
हेल्थ कैसे इसका हम लिखने हैं हेल्थ कैसे
अच्छा यहां पे भी प्रॉब्लम है
इसको भी चाहिए एक्चुअली में शायद हम कुछ
गलत जगह लिख रहे हैं पहले वो भी देखना
पड़ेगा
की
हम कहां पर लिख रहे हैं
एक ब्रैकेट इसका ए गया तो चलिए एक सेकंड
में देख लेट हूं कहां पर मिस्टेक हां जी
तो थोड़ा सा कर ली ब्रेसेज वगैरा का इशू
हो गया था एक्चुअली में हमने ये अपडेट
पोस्ट जो है इसको हमने क्लोज नहीं कर था
तो अपडेट पोस्ट को हमने क्लोज कर दिया
उसके बाद जब पोस्ट पोस्ट का सर कम हो गया
तो हमने यहां पे फॉल्स लगा के नेविगेट कर
दिया है कंडीशन ए ठीक है अब हम बात कर
सकते हैं हमारे एल्स क्लोज़ की तो आईएफ
हमारा यहां पे और हो रहा है और यहां पर हम
एल्स लिख सकते हैं हम ठीक है छोटा सा
कॉन्सेप्ट है बट हां ठीक है अच्छा एल्स
कैसे में क्या है हेल्थ के इसमें आपके पास
पहले चीज तो ये है की आपके पास कुछ अपडेट
करने को नहीं है मतलब एक यूजर नया फॉर्म
क्रिएट करना चाहता है तो ठीक है नया फॉर्म
क्रिएट करना चाहता है तो पहले तो फाइल
उसने दे दी होगी तो फाइल अपलोड करो पहले
कम फाइल अपलोड का क्या करूं अच्छा राहत है
तो हम क्या करते हैं फाइल अब तो हमें पता
ही है क्या करना है फाइल ये तो वेरिएबल
में स्टोर करेंगे और हमें पता है की डाटा
के अंदर इमेज हमें मिल जाएगी इस तरह से
ठीक है डाटा के अंदर इमेज मिल जाएगी लेकिन
अब आपको कुछ कंडीशन ही चेक करने की जरूर
नहीं है क्योंकि यूजर से हम सीधा का सीधा
ही फाइल अपलोड रोड यहां पर अगर है फाइल
वैसे तो अगर चेक कर लेंगे तो और अच्छी बात
है बट ठीक है आप समझ गए तो मैं डायरेक्टली
अब इसको कर देता हूं अगर आपको लगे की नहीं
अभी मुझे चेक करना है की फाइल है या नहीं
है तो उसे हिसाब से आप देख लीजिएगा मैं
डायरेक्टली लिख देता हूं यहां पे तो
अप्राइट की सर्विस उसे कर लेते हैं फाइल
अपलोड और डाटा में अच्छा यहां पे आप एक
छोटा सा ट्रू लिख सकते हो की आपको क्या
करना है इस फंक्शनैलिटी को चेक करना है तो
ये वाला ज्यादा बटर अप्रोच है की फाइल है
तो अपलोड करो तो आपको ये कॉन्सेप्ट इस अप
को इंप्रूव करना है ठीक है सोच समझ के
करेगा की होना भी चाहिए नहीं होना चाहिए
आर्गुमेंट दीजिएगा ऐसा नहीं की बस बोल
दिया तो कर दिया आर्गुमेंट दीजिए होना
चाहिए नहीं होना चाहिए अगर होना चाहिए तो
क्या फायदा होगा तो सारे अरगुमेंट्स दीजिए
आप यहां पे तभी तो एक अच्छे डेवलपर बनोगे
वरना तो फिर वही ट्यूटोरियल हाल में ए
जाओगे रता मार रहे हो मैं जो लिख रहा हूं
आज आईटी इस लिख रहे हो ऐसा मत करना सोच
समझ के तारक दो तारक अच्छी चीज है
ठीक है जी अब नेक्स्ट चलते हैं
की अपने पास फाइल अगर है तो क्या करना है
फाइल अगर नहीं है तो क्या करना है नहीं है
तो कुछ आगे बढ़ाना ही नहीं होता है वैसे
तो ठीक है तो फाइल हमारी कंपलसरी चीज है
वैसे तो सबसे पहले क्या करते हैं फाइल की
आईडी ले लेते हैं फाइल की आईडी कैसे
मिलेगी फाइल डॉट और यहां पे सब कुछ डॉलर
आईडी होता है जैसे मैंगो डीबी में कभी
देखोगे तो हर चीज अंडरस्कोर आईडी होती है
यहां पे डॉलर आई दी है इसको स्टोर कर देते
हैं
है और इसको बोलते हैं फील्ड आईडी फाइल
आईडी फील्ड
के अंदर क्या करो आपके जो डाटा है उसके
अंदर हमारे पास ये फीचर्ड इमेज है उसके
अंदर फाइल आईडी को अपडेट कर दीजिए ठीक है
जी डाटा की एक प्रॉपर्टी तो अपडेट कर दी
अब एक प्रॉपर्टी अपडेट कर दी तो बच्ची हुई
साड़ी प्रॉपर्टीज को सीधा सेंड कर दो तो
सेंड करने के लिए वही आवटे लगाना पड़ेगा
अपराइट की सर्विस उसे करनी पड़ेगी और
क्रिएट पोस्ट के अंदर सर का सर डाटा देना
पड़ेगा अब यहां पर डाटा हम जो दे रहे हैं
ना उसको डाटा को हम इस तरह से ना देखें
एक्चुअली में क्योंकि इस तरह से डाटा
देंगे तो शायद कुछ प्रॉब्लम हो जाए तो हम
क्या करते हैं सबसे पहले इसका एक ऑब्जेक्ट
बनाते हैं और इसको स्प्रेड आउट करते हैं
यह लीजिए डाटा अब यह स्प्रेड आउट इसलिए
किया है क्योंकि आपके पास एक्चुअली में जो
फॉर्म्स बनेंगे वहां पे कभी भी आपके पास
यूजर डाटा नहीं होगा तो यूजर आईडी भी तो
वहां पे एक फील्ड बना रखा है वो भी तो
देना ही पड़ेगा तो उसके अंदर क्या करते
हैं यूजर डाटा से यूजर आईडी अच्छा जी आ ये
तो ठीक है यूजर डाटा से ले ले लेकिन यूजर
डाटा है कहां पे है यूजर डाटा तो कहानी है
ही नहीं हमारे पास में भी हां अगर आपने
गौर से देखा हो तो हां हम स्टोर से ले आए
थे यूजर डाटा ठीक है तो यूजर डाटा से हमने
आईडी निकाल ली तो अपने फील्ड्स का ध्यान
रखिए की कहां पे क्या फील्स है किस तरह से
हैं अब देखिए इसको स्टोर कर लेते हैं
वेरिएबल में ठीक है जी आ तो इसको बोल देते
हैं कांस्टेंट क्या नाम दे इसको डीबी
पोस्ट ही दे देते हैं तो ये लीजिए डीबी
पोस्ट ये लीजिए अच्छा जी अगर ये सर कम हो
गया है और आपके पास डीबी पोस्ट ए गया है
तो यूजर को रीड भी कर दो ठीक है जी तो
यूजर को डीबी पोस्ट नेविगेट कर दिया पोस्ट
डीबी पोस्ट डॉट डॉलर आईडी तो ये लीजिए
यूजर हो गया है पोस्ट आपका सीधा कम
ओके थोड़ा सा यहां पे स्पेसिंग ले लेते
हैं ये लीजिए
ओके तो इतना कम हो गया हमारे पास सबमिट के
अंदर तो काफी कम किया हमने सबमिट के अंदर
बट एक्चुअली मैं परिसर नहीं था कम तो काफी
है बट परिसर नहीं था अच्छा ये कर ली
ब्रेसेज क्यों है यहां पे
ओके यहां पर विश्व है हमारे पास
कैलिब्रेशन
में ओके तो इसको हटा दें तो एक्चुअली मैं
नहीं कम होगा और यहां पर भी कुछ मिस कर
रहे हैं
कुछ ना कुछ तो
या फिर हमने रजिस्टर
यह भी सॉल्व हो गया है कुछ भी नहीं एक कर
ली ब्रेसेज यहां पे एक्स्ट्रा था उसको
हटाए कई बार ऐसा होता है की कम हो जाते
हैं कई बार ज्यादा हो जाते हैं आप समझते
हुए कई बार कोड लिखने हैं तो ऑब्वियस सी
बात है ऐसा हो जाता है इंसेक्ट प्रोडक्शन
में भी जो लोग लिखने हैं हो ही जाता है या
कोई बड़ी बात नहीं है छोटे मोटे प्रॉब्लम
से आते रहते हैं सॉल्व कर देते हैं अच्छा
अब एक इंटरेस्टिंग कॉन्सेप्ट देखते हैं यह
नया जो कॉन्सेप्ट है ना यह आपको हेल्प
करेगा चीजों को एक्चुअली में इंटरव्यू
क्लियर करने में भी ओके यह जो नेक्स्ट हम
मेथड बना रहे हैं ये है हमारा स्लग
ट्रांसफॉर्म
ट्रांसफॉर्म ठीक है अब इस स्लग
ट्रांसफॉर्म क्या करता है दो इनपुट फील्ड
हमारे पास में एक टाइटल और एक स्लग टाइटल
को वॉच करना है और स्लग के अंदर वैल्यू
जेनरेट करनी है अगर कहानी पे भी यूजर
स्पेस देता है तो स्पेस को कन्वर्ट करना
है दास में तो वो तो रिप्लेस हो जाएगा
रिजेक्शन देख लेंगे की यूजर ने कोई नंबर
दिया है डिजिटल दिया है या स्पेस दिया है
कुछ इस तरह से करके हम वहां पे कम कर
देंगे आ बड़े बेसिक है इतना ज्यादा भी
परिसर नहीं है कर सकते हैं कम हमारा और
दो-तीन तरीके से ऑप्टिमाइज भी कर सकते हो
इसको आप बट एक्चुअली में ये आपको हेल्प
करेगा ये ये सब चीज सीखने के लिए की किस
तरह से सिलेक्ट ट्रांसफॉर्म किया जा सकता
है अभी तो सिर्फ बेसिक फंक्शनैलिटी
लिखेंगे किस तरह से वॉच होता है क्या होता
है वो उसे इफेक्ट में जाएगा क्योंकि
डिपेंडेंसी है ना वहां पे चेंज हो रहा है
इस तरह से तो सबसे पहले उसे कॉल बैक ले
लेते हैं वैल्यू आपको मिल जाएगी यहां पे
तो ठीक है ये करली ब्रेसेज हो गए हमारे
पास में और यहां पे भी इसको और कर देते
हैं और पैरंटहस तो हॉपफुली अभी तक तो कोई
एरर नहीं है हमारे पास में तो ये सिलेक्ट
ट्रांसफॉर्म हो गया अब देखिए उसे कॉल बैक
के पास भी एक्चुअली में फ्रीक्वेंसी अरे
होते हैं की इस पर कुछ भी डिपेंडेंसी हो
तो कर लीजिए अभी हमें उसकी नीड नहीं है
जस्ट पर सिंटेक्स बता रहा हूं की हां होती
है ऐसी वैल्यू तो सिलेक्ट ट्रांसफॉर्म में
करना क्या है तो सिलेक्ट ट्रांसफार्मर में
करना क्या है की आपके पास जब भी इसको
सिलेक्ट ट्रांसफॉर्म को उसे करोगे तो आप
वैल्यू पास ऑन करोगे ठीक है अभी सिर्फ
इतना ही काफी है तो आईएफ कंडीशन के अंदर
बोलना हूं की अगर वैल्यू है वहां पे और
वैल्यू का टाइप भी चेक कर लेते हैं की
वैल्यू का जो है हमारे पास में टाइप ऑफ
लिख लेते हैं सीधे
ये चेक करना जरूरी है एक्चुअली में टाइप
ऑफ वैल्यू अगर स्ट्रिंग है तो क्या करो
इसने बोला की वैल्यू तू लोअर के इस
रिप्लेस स्पेस ये भी चलेगा जो सजेशन में
मैं आया है एक और मैं आपको तरीका बता देता
हूं की किस तरह से वालुज को आप उसे कर
सकते हो यहां पे आपने स्लग रिटर्न कर दिया
है मैं डायरेक्ट इस ग रिटर्न करके आपको ये
सिंटेक्स दिखा देता हूं एक बार तो ये भी
आप उसे कर सकते हैं
स्क्रीनशॉट ले लीजिएगा अगर आपको उसे करना
है तो या फिर आप ये भी कर सकते हैं की आप
क्या करो सीधे ही रिटर्न कर दो एक वैल्यू
को उसे वैल्यू को कैसे कैसे मॉडिफाई करना
है पहले तो उसको ट्रिम कर दो ठीक है जी ये
वैल्यू हो गई
उसके बाद साड़ी वैल्यू को लोअर कैसे में
कन्वर्ट कर दो तो हम इसको कर देते हैं
यह लीजिए लोअर कैसे में भी कन्वर्ट हो गई
अब क्या करना है अब यहां पर एक रजक उसे कर
सकते हो देखिए सजेशन में मिला हुआ है
रिजेक्ट वैसे तो आप चाहे तो उसको उसे कर
सकते हो मैं आपको दो रिजेक्स यहां पे
सजेस्ट करता हूं अगेन रिजेक्ट मैंने नहीं
लिखे चाहे गुप्त से लिखवाया है रिजेक्स
बहुत सालों पहले लिखने थे अब लिखने का कोई
मां नहीं है तो यहां पे हम रिप्लेस मेथड
है अभी रिप्लेस मेथड तो हमें पता है ये तो
बेसिक कर जावा स्क्रिप्ट का मेथड है यह
लीजिए आपका रिप्लेस मेथड अब रिप्लेस मेथड
के अंदर आप कोई भी पैटर्न मैच कर सकते हो
तो थोड़ा सा जो स्क्रिप्ट आपको पढ़ा देते
हैं ज्यादा तो नहीं तो ये है बेसिकली
ग्लोबल मैथ्स हम कर रहे हैं
एक स्क्वायर ब्रैकेट लेते हैं ताकि जो
पूरा पैटर्न है उसका हम आ पूरा एक
कांबिनेशन मैच कर रहे हैं और हम इसको क्या
करते हैं एक नेगेट दे देते हैं यह नाइट
साइन होता है मतलब इसको मत मैच करना है
जैसे आपका एक्सक्लेमेटरी होता है वैसे ये
रिजेक्स में ये नेगेटिव साइन होता है तो ए
तू स अपने मैच कर दिया ठीक है जी कैपिटल ए
तू कैपिटल सी मैच कर लिया दास इस मतलब
रेंज होता है यहां पे तो ठीक है जी स्लैश
दी मतलब डिजिट्स और आप स्लैश एस मतलब
इनमें से कोई वालुज अगर आई है तो उसको
छोड़कर हम सबको दास कर देंगे तो इसका मतलब
है की कोई डॉलर साइन आपने लिया कोई
एक्सक्लेमेटरी दिया तो उन सब को हम कर
देंगे लेकिन आप देखिए स्पेस भी मैच कर रहे
हैं अब यहां पे आप चाहे तो इस तरह से भी
कर सकते हैं की इनके अलावा सब कोई कर देना
तो स्पेस भी हो सकता है उसमें मैच हो जाए
तो हम क्या कर सकते हैं दो तरीके या तो इस
तरह से लिख दें या फिर आप सबको मैच कर
लीजिए स्पेस वगैरा ये ऑलमोस्ट सभी को मैच
कर दिया अच्छा इसमें क्या करो एक प्लस भी
यहां पे लगा दो इससे क्या है की और जितने
भी हैं जो सब कैरक्टर्स वगैरा हैं नाइट
वाले तो र जाएंगे बाकी सब को ये कन्वर्ट
कर देगा हां जी इसको याद नहीं किया जा
सकता मैंने भी शायद गुप्त से देखा है मुझे
भी कोई सपना नहीं आया ये मुझे भी याद नहीं
करता ठीक है ओके फुर्थर अगर आप ये उसे
करते हो तो आपको एक और रिप्लेस लगाना
पड़ेगा की जितने भी ये जो है यहां पे प्लस
लगाने की जरूर नहीं है एन आप स्पेस हैं
ग्लोबल आप सारे स्पेस को देखो और उसकी जगह
दास लगा दो तो ये भी चलेगा दो मेथड है
आपके पास या तो यहां से स्लैश हटा दो और
कम कर लो या फिर इस तरह से या पहले वाला
जो मेथड आपने स्क्रीनशॉट लिया था उसपे कम
कर लो हां जी मैथर्ड हैं काफी सारे हैं तो
वालुज ए जाति है इस तरह से अच्छा ठीक है
ये वालुज तो हमारे पास में ए गई है की ठीक
है अगर वालुज हैं हमारे पास में तो हम
रिटर्न कर सकते हैं इनफैक्ट हमें इस करली
बेसिस की भी जरूर नहीं है यहां पे इसको भी
हटा देते हैं क्योंकि सिंगल लाइन का है तो
कम है तो सीधे रिटर्न हो रही है वालुज तो
इस तरह से हम कर देते हैं अच्छा इस
सिंटेक्स को भी देखेंगे क्या-क्या आपके
इश्यूज ए गए आ करली ब्रेसेज हां जी अभी
ठीक है अच्छा ये तो हो गया हमारा एक सिंगल
लाइन का स्टेटमेंट क्योंकि रिटर्न
डायरेक्ट ही है तो इसको इस तरह से मां लो
की
ये इस तरह से दिया है हां थोड़ा सा देखने
में अच्छा लगता है तो इस तरह से मैंने लिख
दिया यहां पे अच्छा अगर ये सब नहीं है तो
क्या रिटर्न करना है तो भी एक चीज रिटर्न
कर दिए वरना प्रॉब्लम आएगी आपके पास तो
रिटर्न कर दो एम्टी स्ट्रिंग को
ओके बड़ा इंटरेस्टिंग मेथड है थोड़ा
इंटरेस्टिंग बनाया हमने लेकिन अब इस
इंटरेस्टिंग मेथड को उसे कैसे करना है वो
है इंटरव्यू क्वेश्चन ओके तो चलिए वो
बताते हैं ये एक्चुअली थोड़ा सीनरी लेवल
पर ही है इंटरव्यू क्वेश्चन बट ठीक है फिर
भी आपको बताते हैं रिएक्ट में से हम ये
उसे इफेक्ट उसे कर लेते हैं यूजर फैक्ट हम
लेकर आए थे क्या
उसे इफेक्ट तो नहीं लाया है तो ठीक है
react.iuse इफेक्ट उसे कर लेते हैं यह
लीजिए करली ब्रेसेज और ये आपका डिपेंडेंसी
है रे ये लीजिए और यहां पे आपका ये काली
प्रेस सिंटेक्स तो ठीक है ओके अब
डिपेंडेंसी अरे मैं क्या क्या है पहले तो
वो देखते हैं ठीक है डिपेंडेंसी अरे में
क्या है देखिए एक तो है आपका वॉच वॉच
जिसके साथ भी लगा है जिसके साथ अगर उसमें
कोई भी चेंज है तो उसको तो वॉच कहां लगेगा
ऑब्वियस सी बात है हम रजिस्टर वगैरा सब
लगाएंगे अभी इनपुट फॉर्म तो उसमें हमारा
जो टाइटल वैल्यू उसे पे हम वॉच लगा देंगे
कैसे लगाते हैं वो भी देख लेंगे उसके
अलावा हम स्लग ट्रांसफॉर्म भी यहां पर लिख
देते हैं की आपका जो सिलेक्ट ट्रांसफर
मेथड है इस पे भी नजर रखो
एक चीज इंटरेस्टिंग अच्छा अब क्या है किस
तरह से वालुज अच्छी जाति है और कैसे लिखी
जाति है वहां पे वो देखिए बड़ा
इंटरेस्टिंग सिंटेक्स है तो हम बनाएंगे एक
सब्सक्रिप्शन
सब्सक्रिप्शन अभी सब्सक्रिप्शन कैसे बनेगा
सब्सक्रिप्शन बंता है आपके वॉच मेथड से आ
वैसे तो और भी तरीके हैं सब्सक्रिप्शन
बनाने के लिए और उनको बाद में
अनसब्सक्राइब वगेरा करने के लिए आ
एक्चुअली में जो भी मेथड आप यहां पे रन
करते हैं उसको आप एक सब्सक्रिप्शन नाम के
वेरिएबल में हॉल कर सकते हैं अगर आपने कोई
और भी मेथड बनाया है या कॉल किया यहां पे
उसको किसी वेरिएबल में स्टोर कर लो अब
वेरिएबल में जैसे मां लीजिए ये वॉच है अभी
तो इस वॉच मेथड का कोई एंपहसिस है नहीं था
ये लोग इन भी हो सकता था तो यहां पे ए के
आप बाद में क्या करते हो एक लास्ट लाइन हम
लिखने हैं इस तरह से रिटर्न के अंदर एक
कॉल बैक आपको मिलता है रिएक्ट उसे इफेक्ट
के अंदर और हम लास्ट में एक लिखने हैं
सब्सक्रिप्शन डॉट और सब्सक्राइब ये क्या
होता है थोड़ा सा मेमोरी मैनेजमेंट होता
है थोड़ा सा ऑप्शन यहां हो जाता है ये
अक्सर इंटरव्यू में पूछा जाता है की आपने
एक यूजर फैक्ट लिया वहां पे एक मेथड कॉल
कर तो आपने उसको ऑप्टिमाइज कैसे कर सकते
हो तो वहां पे क्या करो उसको सिर्फ एक
वेरिएबल में स्टोर कर लो उसका नाम
सब्सक्रिप्शन देने की जरूर नहीं है
सुपरमैन भी दे सकते हो बट सब्सक्रिप्शन ही
देना ज्यादा अच्छा लगता है तो वहां पे आप
रिटर्न के अंदर एक कॉल बैक कर सकते हैं
उसको चैनल सब्सक्राइब कर सकते हो ताकि वह
खुद अपने आप में घूम के ना र जाए बार-बार
बार-बार कॉल होने के लिए तो इस तरह से हम
कम कर सकते हैं ठीक है जी अब ये वॉच
क्योंकि हमें रिएक्ट हक फॉर्म से मिला हुआ
है तो इसके अंदर भी एक कॉल बैक आपको मिलता
है ये लीजिए कॉल बैक काफी जगह मिलेगा कॉल
बैक तो आपको अब यहां पे क्या करते हैं
हमारे पास एक तो वैल्यू मिलेगी हमें और
वैल्यू के बाद एक और हमें यहां पे नाम भी
मिल जाएगा किस तरह से मिलेगा वो हम जब
फॉर्म बनाएंगे तब हम देखेंगे उसको थोड़ा
सा और ओके यहां पे ए गया तो अब क्या करना
है आईएफ हमारे पास जो नाम है वो टाइटल है
क्योंकि पूरा का पूरा फॉर्म ही चाहिए हमें
फॉर्म के अंदर ध्यान है डॉट डॉट रजिस्टर
लिख रहे थे तो साड़ी वालुज ही ए रहे थे तो
जहां पे टाइटल है वहां पे हम क्या करेंगे
एक सेट वैल्यू उसे करेंगे सेट वैल्यू कहां
पर सेट करनी है स्लग के अंदर इनपुट फाइल
देंगे उसका नाम से अलग रखेंगे एन वैल्यू
क्या करनी है इस वाले फील्ड के अंदर
वैल्यू आपको ये वाली फील्ड करनी है जो की
हमें स्लग ट्रांसफॉर्म हमने जो मेथड बनाया
उससे वैल्यू मिलेगी हां जी काफी कुछ है
इंटरेस्टिंग अच्छा यहां पे क्या करना है
जो वैल्यू है ना अभी तो आपको साड़ी वालुज
यहां पे मिली हुई है लेकिन वैल्यू में से
ये निकालना भी तो पड़ेगा टाइटल वाला कौन
सी वैल्यू है क्या करना है तो हां यहां से
सिर्फ फॉर्मेट तो इसलिए कहता हूं सजेशन
हमेशा ज्यादा अच्छे नहीं होते क्योंकि जो
वैल्यू है वो एक्चुअली में एक ऑब्जेक्ट है
यहां पे तो टाइटल वैल्यू आपको ले ली अच्छा
उसके अलावा यहां पे एक और ऑप्शन होता है
की वैलिड डेट उसको करना है नहीं करना तो
वहां पे भी आप वैलिडेशन लगा सकते हो थोड़ा
सा मां भी देख लेंगे एक और ऑब्जेक्ट पास
हो सकता है तो ये आपका वैलिडेट
है यह वैलिडेट
वैलिड नहीं उसका नाम आई थिंक
सोल्ड वैलिडेटर
सोल्ड
ओके
मानता हूं थोड़ा सा परिसर प्रोजेक्ट है बट
थोड़ा सा परिसर करना था तो ठीक है यह तो
हो गया हमारा बेसिक अब देखिए अब नेक्स्ट
क्या कम है हमारे पास में अभी तो 40 मिनट
हुए हैं थोड़ा सा और कर सकते हैं अब यहां
पे जो फॉर्म है ना उसे फॉर्म को मैं आपको
डायरेक्ट बता देता हूं क्योंकि फॉर्म हमने
काफी बार एक्चुअली में पढ़ लिया है तो अब
फॉर्म के ऊपर ज्यादा टाइम वेस्ट ना करते
हुए मैं आपको डायरेक्टली फॉर्म दे देता
हूं ताकि आप उसे फॉर्म को समझ भी ले और हम
वालुज के बड़े में डिस्कशन भी कर लेने एन
फॉर्म के अंदर इतना कुछ खास है नहीं फॉर्म
को देखिए दो पार्ट में डिवाइड कर गया है
लेफ्ट पार्ट राइट पार्ट लेफ्ट पार्ट हमारा
230 ले रहा है और राइट पार्ट जो है हमारा
वो बच्चा हुआ 13 ले रहा है तो एक-एक करके
डिस्कस कर लेते हैं तो लेफ्ट साइड वाले
फॉर्म में देखिए हमारे पास पहले है इनपुट
ये वो से फील्ड है एक्जेक्टली से लेबल
प्लेस होल्डर क्लास 10 एक्जेक्टली से कम
है डॉट डॉट रजिस्टर लिया और बोला टाइटल लो
रिक्वेस्ट कर दिया ठीक है इस फॉर्म का
इनपुट फील्ड का नाम आपने रजिस्टर लिख लिया
दूसरा इनपुट फील्ड जो है हमने यहां पर
लिया है इसका नाम स्लग है अब सबसे
इंटरेस्टिंग बात है देखिए सबसे पहले उसका
नाम स्लग ही देना है क्योंकि किसी के
बेसिस पे हम कम कर रहे हैं और इसके अंदर
ऑन इनपुट दिया है की इसका इनपुट कैसे आएगा
एक इवेंट कॉल करेगा इवेंट के अंदर हमने
क्या कर है एक सेट वैल्यू कॉल कर है सेट
वैल्यू क्या करेगी स्लग पे ही कॉल करेगी
तो ये लेबल हमारा स्लग है यहां पे भी नाम
हमने रजिस्टर का स्लग दे रखा है तो इसमें
हमने क्या कर है स्लग ट्रांसफॉर्म एवं डॉट
टारगेट डॉट वैल्यू और शुड वैलिड तो बस
इतना सा कम है और इसके अंदर ऑटोमेटेकली
वैल्यू फूल होती जाएगी क्यों क्योंकि आपने
यहां पे भी कम किया है सेट वालुज को कम
किया है ट्रांसफॉर्म की वालुज फूल करिए तो
जैसे वहां पे वालुज फूल होती जाएगी उसको
हम वॉच करते रहेंगे टाइटल को तो
ऑटोमेटेकली तो टाइटल को वॉच कर रहे हैं हम
और यहां पर वालुज हम यहां पे एड करें जा
रहे हैं ठीक है जी उसके बाद आपने
बनाया था हमने देखा था वो कंट्रोल कर दिया
तो वालुज हमें मिल जाएगी और उसके बाद क्या
कर है हमने यहां पे दूसरा इनपुट फील्ड है
फीचर्ड इमेज करता है तो यहां पर हमने बोल
दिया की इमेज चाहिए तो हमने इमेज नाम बोल
दिया और रिक्वायर्ड चाहिए की पोस्ट नहीं
होना चाहिए या कुछ इस तरह से पोस्ट
रिक्वायर्ड है तो पोस्ट नहीं होगा बिना इस
इमेज के एक्सेप्टेंस भी दे दी की इमेज
हमें पीएनजी जे पेग ये साड़ी इमेज चाहिए
और टाइप यहां पे हमने फाइल दिया है
ऑटोमेटेकली ये फॉर्म आपका हैंडल कर लगा और
दूसरी जो चीज सी है हमने ये पोस्ट पे
डिपेंड करते हुए हमने कुछ ऑप्शंस यहां पे
सिलेक्ट कर लिए की बाय डिफॉल्टर कौन सा
ऑप्शन देना है स्टेटस कौन सा देना है क्या
इस तरह से सिलेक्शन दे दिया और फाइनली
अपडेट बटन देना है की सबमिट बटन देना है
ये तो ये हो गया हमारा फाइनल कम की किस
तरह से पोस्ट फॉर्म बनेगा ये वीडियो काफी
बार देखने पढ़ेंगे क्योंकि आपको काफी टाइम
लगेगा इन साड़ी चीजों को समझना में लॉजिक
बहुत सर है क्योंकि एक फूल फ्लैग्स
एप्लीकेशन है कोई टॉय एप्लीकेशन नंबर नहीं
रहे हैं प्रोडक्शन ग्रेट एप्लीकेशन है फुल
प्लेजर डाटा सर हैंडल हो सकता है तो एक
बार आपको काफी इसको दोबारा से देखना
पड़ेगा काफी परिसर प्रोजेक्ट है मानता हूं
बट यही चीज है जो एक्चुअली में प्रोडक्शन
ग्रेट के अंदर आई है इंटरनेशनल ऑडियंस
वगैरा सब इसी को पढ़ने हैं दो बार तीन बार
कर बार देखते हैं और यही से एक्चुअली में
वालुज वो ड्राइव करते हैं हमारे यहां पर
हमें ये है की एक बार देखा नहीं समझ आया
ओके अब नहीं देखना दोबारा बाहर के लोग
इसको छोड़ते नहीं है हमें भी वही टेक्निक
अपना नहीं है छोड़ना नहीं है समझना है दो
बार तीन बार डिस्कार्ड पे डिस्कशन करेंगे
बट पूरा प्रोजेक्ट समझ के ही रहेंगे तो
चलिए मिलते हैं आपसे अगले वीडियो के अंदर
```

In this lecture, we will get to know about RTE(Real time editor)


create a new file:
src/components/RTE.jsx:
```
import React from 'react'
import { Editor } from '@tinymce/tinymce-react';
import { Controller } from 'react-hook-form';


export default function RTE({ name, control, label, defaultValue = "" }) {
    return (
        <div className='w-full'>
            {label && <label className='inline-block mb-1 pl-1'>{label}</label>}

            <Controller
                name={name || "content"}
                control={control}
                render={({ field: { onChange } }) => (
                    <Editor
                        initialValue={defaultValue}
                        init={{
                            initialValue: defaultValue,
                            height: 500,
                            menubar: true,
                            plugins: [
                                "image",
                                "advlist",
                                "autolink",
                                "lists",
                                "link",
                                "image",
                                "charmap",
                                "preview",
                                "anchor",
                                "searchreplace",
                                "visualblocks",
                                "code",
                                "fullscreen",
                                "insertdatetime",
                                "media",
                                "table",
                                "code",
                                "help",
                                "wordcount",
                                "anchor",
                            ],
                            toolbar:
                                "undo redo | blocks | image | bold italic forecolor | alignleft aligncenter bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent |removeformat | help",
                            content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }"
                        }}
                        onEditorChange={onChange}
                    />
                )}
            />

        </div>
    )
}

```

Create a new file:
src/components/post-form/PostForm.jsx:
```
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
    const { register, handleSubmit, watch, setValue, control, getValues } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const submit = async (data) => {
        if (post) {
            const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null;

            if (file) {
                appwriteService.deleteFile(post.featuredImage);
            }

            const dbPost = await appwriteService.updatePost(post.$id, {
                ...data,
                featuredImage: file ? file.$id : undefined,
            });

            if (dbPost) {
                navigate(`/post/${dbPost.$id}`);
            }
        } else {
            const file = await appwriteService.uploadFile(data.image[0]);

            if (file) {
                const fileId = file.$id;
                data.featuredImage = fileId;
                const dbPost = await appwriteService.createPost({ ...data, userId: userData.$id });

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`);
                }
            }
        }
    };

    const slugTransform = useCallback((value) => {
        if (value && typeof value === "string")
            return value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s]+/g, "-")
                .replace(/\s/g, "-");

        return "";
    }, []);

    React.useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "title") {
                setValue("slug", slugTransform(value.title), { shouldValidate: true });
            }
        });

        return () => subscription.unsubscribe();
    }, [watch, slugTransform, setValue]);

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: true })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: true })}
                    onInput={(e) => {
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <div className="w-1/3 px-2">
                <Input
                    label="Featured Image :"
                    type="file"
                    className="mb-4"
                    accept="image/png, image/jpg, image/jpeg, image/gif"
                    {...register("image", { required: !post })}
                />
                {post && (
                    <div className="w-full mb-4">
                        <img
                            src={appwriteService.getFilePreview(post.featuredImage)}
                            alt={post.title}
                            className="rounded-lg"
                        />
                    </div>
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />
                <Button type="submit" bgColor={post ? "bg-green-500" : undefined} className="w-full">
                    {post ? "Update" : "Submit"}
                </Button>
            </div>
        </form>
    );
}
```

make detailed notes using the transcript and my given code.
make notes in english in md format.
never miss any point
explain things easily
also use comments in code



 -->
