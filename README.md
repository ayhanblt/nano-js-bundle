# NanoAI Widget

A production-ready, embedded AI Assistant Widget designed to be injected directly into E-commerce Product Detail Pages (PDP). 

## 1. Project Overview
NanoAI is a lightweight, isolated React application that functions as a smart browser widget. It analyzes the host page's DOM to assist users with product-specific queries, highlighting relevant information directly on the screen. 

## 2. Challenge Scope
This project was built to satisfy a rigorous technical hiring challenge with the following strict requirements:
- **No Iframe:** The widget must live on the same page.
- **Strict CSS Isolation:** The widget must not inherit the host's CSS, nor should its CSS leak into the host (Solved via Shadow DOM).
- **Single File Injection:** Must be deliverable as a single JS snippet to be run in the browser console.
- **Non-Destructive Tools:** Must be able to read and highlight the page without mutating inline styles or breaking the original DOM structure.
- **Provider-Agnostic AI:** Must abstract the AI logic so it can easily switch between Gemini, OpenAI, or a custom backend.

## 3. Architecture
The widget relies on a layered architecture ensuring Single Responsibility Principle (SRP):
- **UI Layer (`src/components`):** React components styled with Tailwind CSS, injected safely inside a Shadow Root.
- **Tooling Layer (`src/tools`):** 
  - `DOMAnalyzer`: Reads the page, extracting `h1, h2, section, article` without mutating.
  - `DOMHighlighter`: Manages a single isolated `<style>` tag on the host to pulse elements using a unique `nano-highlight-active` class.
- **Service Layer (`src/api`):** Houses `AIService` which intercepts user messages, handles timeouts, gracefully processes AI tool calls, and returns safe UI messages.
- **Provider Layer (`src/api/GeminiProvider`):** An implementation of the `AIProvider` interface, currently stubbed out to fetch from a secure backend.

## 4. Build & Delivery
Built using Vite + React + TypeScript.
The build is configured in "Library IIFE" mode with `vite-plugin-css-injected-by-js`.
When you run `npm run build`, the entire application (including React, Tailwind, and local Fonts) is bundled into a single file: `dist/bundle.iife.js`.

### Console Snippet Usage
To test the widget on any website, simply run the build and copy the contents of `dist/bundle.iife.js` into your browser's Developer Tools Console.
- **Idempotent:** Running the script a second time will gracefully warn you and return the existing instance.
- **Cleanup:** Run `window.__NANO_AI_WIDGET__.destroy()` to completely unmount React, remove the Shadow DOM, and clean up all injected highlight classes.

## 5. Future Improvements
- **Real Backend Integration:** Move the `GeminiProvider` mock logic into an Edge Function (e.g., Firebase Functions, Cloudflare Workers) to securely hold the API keys.
- **Advanced Relevance Scoring:** Implement vector embeddings for `scoreRelevance` to find semantic matches in the DOM instead of exact keyword matches.
- **Mutation Observer:** If the host page is a SPA (Single Page Application), the widget could listen for DOM mutations to re-scan the context dynamically.
