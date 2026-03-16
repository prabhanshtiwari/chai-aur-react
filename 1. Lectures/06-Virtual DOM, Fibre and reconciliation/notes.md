# React Internals — Interview Notes
> Topic: Virtual DOM, `createRoot()`, Reconciliation, React Fiber Architecture

---

## 1. Virtual DOM — Has the Concept Changed?

**Q: Do we still use Virtual DOM in React?**
**A: NO** — the concept has evolved significantly.

### How the Browser Works (baseline)
- Browser removes the **entire DOM** and repaints it on page reload.
- This is expensive — it's why page loads feel heavy.

### Old Virtual DOM Approach
- Entire DOM tracked as a **tree structure in memory**.
- On update: new tree generated → diffed with old tree → minimal DOM operations applied.

### Modern React: `createRoot()`
- `createRoot()` creates a React-managed DOM-like structure (not a classic virtual DOM).
- Compares its internal tree with the actual browser DOM.
- Updates **only the parts of the UI that actually changed**.
- React does **not** need to instantly update the UI — it can wait, batch, and defer updates intelligently until the final change is ready.
- A good scheduling algorithm handles when and how UI updates are applied.

> 📎 Article: [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture)

---

## 2. Reconciliation

### Definitions
| Term | Meaning |
|---|---|
| **Reconciliation** | The algorithm React uses to diff one tree with another to determine which parts need to be changed. |
| **Update** | A change in the data used to render a React app — usually the result of `setState`. Eventually results in a re-render. |

### Core Idea
- React's API makes updates *feel* like the entire app re-renders — this lets developers reason declaratively.
- Actually re-rendering the entire app on every change is too costly for real-world apps.
- React creates the **appearance** of whole-app re-rendering while maintaining great performance — this is reconciliation.

### How It Works (High Level)
1. When a React app renders, a **tree of nodes** describing the app is generated and saved in memory.
2. This tree is flushed to the rendering environment (e.g., translated to DOM operations in the browser).
3. When the app updates (via `setState`), a **new tree is generated**.
4. The new tree is **diffed** with the previous tree.
5. Only the **necessary operations** are applied to update the rendered app.

### Two Key Diffing Rules
1. **Different component types** → assumed to generate substantially different trees → React **replaces the old tree completely** rather than diffing.
2. **List diffing** uses **keys** — keys must be *stable, predictable, and unique*.

---

## 3. Scheduling — Why It Matters

### Key Insights
- In a UI, **not every update needs to be applied immediately** — doing so causes frame drops and degrades UX.
- Different update types have **different priorities**:
  - Animation update → needs to complete quickly.
  - Data store update → lower priority, can wait.

### Push vs Pull Scheduling
| Approach | Who Decides Scheduling | Description |
|---|---|---|
| **Push-based** | The developer (you) | App must decide how/when to schedule work manually. |
| **Pull-based** | The framework (React) | React is smart and makes scheduling decisions for you. |

> React uses a **pull-based** approach via Fiber.

---

## 4. React Fiber Architecture

### What Is It?
- React Fiber = a **complete ground-up reimplementation** of React's core reconciler algorithm.
- Result of **2+ years of research** by the React team.
- Although it rewrites the reconciler, the high-level reconciliation algorithm remains largely the same.

### Primary Goal
Enable React to take full advantage of **scheduling**.

### Headline Feature: Incremental Rendering
> The ability to split rendering work into **chunks** and spread it out over **multiple frames**.

This is what enables smooth animation, layout, and gestures.

### What Is a Fiber? (lowercase)
- A **fiber** = a unit of work.
- Fiber breaks rendering down into small units so it can be paused, prioritized, reused, or aborted.
- This is a very low-level abstraction — not something app developers typically interact with directly.

### 4 Core Scheduling Capabilities Fiber Enables
1. **Pause** work and come back to it later.
2. **Assign priority** to different types of work (e.g., animation > data sync).
3. **Reuse** previously completed work.
4. **Abort** work that is no longer needed.

### Other Key Features
- New **concurrency primitives** (foundation for React 18 concurrent features).
- Ability to pause, abort, or reuse work as new updates come in.

---

## 5. Prerequisites to Understand Fiber Deeply
*(From the official article — recommended reading order)*

1. **React Components, Elements, and Instances** — "Component" is an overloaded term; understand the distinction.
2. **Reconciliation** — High-level description of React's reconciliation algorithm.
3. **React Basic Theoretical Concepts** — Conceptual model of React without implementation details.
4. **React Design Principles** — Especially the section on scheduling: explains the *why* behind Fiber.

---

## 6. Quick Interview Cheat Sheet

| Question | Answer |
|---|---|
| Do we still use Virtual DOM? | No — the concept evolved. React Fiber replaced classic Virtual DOM with an incremental, fiber-based reconciler. |
| What does `createRoot()` do? | Creates React's internal DOM-like structure; compares it with the real DOM and updates only changed parts. |
| What is reconciliation? | React's diffing algorithm — compares old and new trees to compute minimal DOM updates. |
| What is a fiber? | A unit of work. Fiber breaks rendering into chunks that can be paused, prioritized, reused, or aborted. |
| What is React Fiber's headline feature? | Incremental rendering — splitting rendering into chunks spread across multiple frames. |
| Push vs pull scheduling? | React uses pull-based — the framework decides scheduling, not the developer. |
| Why not update UI instantly on every change? | Doing so drops frames and degrades UX. Batching and deferring updates is more efficient. |

<!-- 
Important for Interview /understanding perspective:

**Virtual DOM:**
Do we still use Virtual DOM in react? NO, actually the concepts have changed.

What is createRoot() method?
- createRoot() created a DOM liek the browser have.
- it compares main dom with its dom
- then update the things that are actually updated in UI

But our browser removes the entire DOM, and then repaint it again. This is called page reload. Page loads becase entire dom is re painted again.

In virtual DOM, entire DOM is tracked in tree like structure and then updated it.

In react, we do not need to instantly update the UI.
But, wait for some seconds until the final change is done.
A good algorithm is desugned for UI updation like this.

Article Link "React fibre architecture": https://github.com/acdlite/react-fiber-architecture

article

React Fiber Architecture
Introduction
React Fiber is an ongoing reimplementation of React's core algorithm. It is the culmination of over two years of research by the React team.

The goal of React Fiber is to increase its suitability for areas like animation, layout, and gestures. Its headline feature is incremental rendering: the ability to split rendering work into chunks and spread it out over multiple frames.

Other key features include the ability to pause, abort, or reuse work as new updates come in; the ability to assign priority to different types of updates; and new concurrency primitives.

About this document
Fiber introduces several novel concepts that are difficult to grok solely by looking at code. This document began as a collection of notes I took as I followed along with Fiber's implementation in the React project. As it grew, I realized it may be a helpful resource for others, too.

I'll attempt to use the plainest language possible, and to avoid jargon by explicitly defining key terms. I'll also link heavily to external resources when possible.

Please note that I am not on the React team, and do not speak from any authority. This is not an official document. I have asked members of the React team to review it for accuracy.

This is also a work in progress. Fiber is an ongoing project that will likely undergo significant refactors before it's completed. Also ongoing are my attempts at documenting its design here. Improvements and suggestions are highly welcome.

My goal is that after reading this document, you will understand Fiber well enough to follow along as it's implemented, and eventually even be able to contribute back to React.

Prerequisites
I strongly suggest that you are familiar with the following resources before continuing:

React Components, Elements, and Instances - "Component" is often an overloaded term. A firm grasp of these terms is crucial.
Reconciliation - A high-level description of React's reconciliation algorithm.
React Basic Theoretical Concepts - A description of the conceptual model of React without implementation burden. Some of this may not make sense on first reading. That's okay, it will make more sense with time.
React Design Principles - Pay special attention to the section on scheduling. It does a great job of explaining the why of React Fiber.
Review
Please check out the prerequisites section if you haven't already.

Before we dive into the new stuff, let's review a few concepts.

What is reconciliation?
reconciliation
The algorithm React uses to diff one tree with another to determine which parts need to be changed.
update
A change in the data used to render a React app. Usually the result of `setState`. Eventually results in a re-render.
The central idea of React's API is to think of updates as if they cause the entire app to re-render. This allows the developer to reason declaratively, rather than worry about how to efficiently transition the app from any particular state to another (A to B, B to C, C to A, and so on).

Actually re-rendering the entire app on each change only works for the most trivial apps; in a real-world app, it's prohibitively costly in terms of performance. React has optimizations which create the appearance of whole app re-rendering while maintaining great performance. The bulk of these optimizations are part of a process called reconciliation.

Reconciliation is the algorithm behind what is popularly understood as the "virtual DOM." A high-level description goes something like this: when you render a React application, a tree of nodes that describes the app is generated and saved in memory. This tree is then flushed to the rendering environment — for example, in the case of a browser application, it's translated to a set of DOM operations. When the app is updated (usually via setState), a new tree is generated. The new tree is diffed with the previous tree to compute which operations are needed to update the rendered app.

Although Fiber is a ground-up rewrite of the reconciler, the high-level algorithm described in the React docs will be largely the same. The key points are:

Different component types are assumed to generate substantially different trees. React will not attempt to diff them, but rather replace the old tree completely.
Diffing of lists is performed using keys. Keys should be "stable, predictable, and unique."

The key points are:

In a UI, it's not necessary for every update to be applied immediately; in fact, doing so can be wasteful, causing frames to drop and degrading the user experience.
Different types of updates have different priorities — an animation update needs to complete more quickly than, say, an update from a data store.
A push-based approach requires the app (you, the programmer) to decide how to schedule work. A pull-based approach allows the framework (React) to be smart and make those decisions for you.

What is a fiber?
We're about to discuss the heart of React Fiber's architecture. Fibers are a much lower-level abstraction than application developers typically think about. If you find yourself frustrated in your attempts to understand it, don't feel discouraged. Keep trying and it will eventually make sense. (When you do finally get it, please suggest how to improve this section.)

Here we go!

We've established that a primary goal of Fiber is to enable React to take advantage of scheduling. Specifically, we need to be able to

pause work and come back to it later.
assign priority to different types of work.
reuse previously completed work.
abort work if it's no longer needed.
In order to do any of this, we first need a way to break work down into units. In one sense, that's what a fiber is. A fiber represents a unit of work.






 -->
