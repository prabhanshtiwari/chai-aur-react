# 🧠 Path Aliasing in React (Vite) — Personal Notes

---

# 📌 1. Problem This Solves

Default imports become messy:

```js
import Button from "../../../components/Button";
```

Alias solves this:

```js
import Button from "@/components/Button";
```

👉 Cleaner, scalable, easier refactoring.

---

# 📌 2. Core Concept

Alias = **mapping a shortcut to a real directory**

```text
@  →  /src
```

So:

```text
@/components/Button → src/components/Button
```

---

# ⚙️ 3. Vite Configuration (`resolve.alias`)

In Vite:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

---

## 🔍 What’s happening internally

```js
"@" → absolute path to src
```

`path.resolve(__dirname, "./src")` ensures:

* OS-independent path resolution
* Absolute path (required by bundler)

---

## ⚠️ Key Rule

👉 Vite alias = **runtime resolution only**

It does NOT handle:

* Autocomplete
* Editor suggestions

---

# 🧠 4. Editor Suggestions (Real Source)

Autocomplete comes from:
👉 TypeScript Language Server

NOT from Vite.

---

# ⚙️ 5. Configure IntelliSense (`jsconfig.json` / `tsconfig.json`)

### Required setup:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 🔍 Breakdown

### ✅ `baseUrl`

```json
"baseUrl": "."
```

* Root of project
* Required for path mapping to work

---

### ✅ `paths`

```json
"@/*": ["src/*"]
```

Means:

```text
@/anything → src/anything
```

---

### ❗ Common Mistakes

| Wrong                | Why               |
| -------------------- | ----------------- |
| `"@": ["src"]`       | Missing wildcard  |
| `"@/*": ["./src"]`   | Should be `src/*` |
| Missing `baseUrl`    | Alias won't work  |
| Config inside `/src` | Must be root      |

---

# 🔁 6. Why Both Configs Are Required

| Tool                 | Role                 |
| -------------------- | -------------------- |
| Vite                 | Runs your app        |
| TypeScript (VS Code) | Provides suggestions |

👉 Missing one = partial functionality

---

# 💡 7. How Suggestions Actually Work

### Trigger pattern:

```js
import Button from "@/"
```

👉 Then:

* Wait → suggestions appear
  OR
* Press:

```text
Ctrl + Space
```

---

## ❗ Important Behavior

| Input | Result               |
| ----- | -------------------- |
| `@`   | ❌ No suggestion      |
| `@/`  | ✅ Suggestions appear |

👉 Slash is mandatory.

---

# 📁 8. Folder Structure Requirement

Autocomplete is based on **real files**.

Example:

```text
src/
  components/
    Button.jsx
```

Then:

```js
@/components/  → suggests Button.jsx
```

👉 No folder = no suggestion

---

# 🔄 9. Restart Requirement

After config changes:

```text
Ctrl + Shift + P → Restart TS Server
```

Or restart VS Code.

👉 Without this, config won’t apply.

---

# 🧪 10. Debug Checklist

If suggestions NOT working:

### ✔ Check 1

* `jsconfig.json` exists in root

### ✔ Check 2

* Correct paths syntax

### ✔ Check 3

* Folder exists inside `src`

### ✔ Check 4

* Typed `@/` (not just `@`)

### ✔ Check 5

* Restarted TS server

### ✔ Check 6

* VS Code using workspace TypeScript

---

# ⚡ 11. Advanced Aliases (Recommended)

Instead of only `@`, structure like:

```json
"paths": {
  "@components/*": ["src/components/*"],
  "@hooks/*": ["src/hooks/*"],
  "@utils/*": ["src/utils/*"]
}
```

Usage:

```js
import Button from "@components/Button";
import useAuth from "@hooks/useAuth";
```

👉 Better for large-scale apps.

---

# 🧠 12. Mental Model (IMPORTANT)

Think of it like this:

```text
Vite → executes code
TypeScript → understands code
```

Alias must be defined in BOTH.

---

# 🚀 Final Summary

To get suggestions after `@`:

1. Define alias in Vite (`resolve.alias`)
2. Define paths in `jsconfig.json`
3. Use `@/` (not just `@`)
4. Ensure folder exists
5. Restart TS server

---