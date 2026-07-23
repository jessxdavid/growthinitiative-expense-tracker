# Contributing

Thanks for helping improve the Expense Tracker.

## Ground rules
- The app is a single `index.html` (HTML + CSS + JS, no build step). Keep it dependency-free — no npm packages in the runtime, no external `<script src>`.
- `worker.js` is the sync backend (Cloudflare Worker). Keep it small and stateless.
- Match the existing style: vanilla JS, small functions, no framework.

## Dev loop
1. Fork and clone.
2. Open `index.html` in a browser (or run `python -m http.server`).
3. Make your change, test locally (add expenses/income, check the dashboard).
4. Open a PR with a clear description and before/after notes.

## Reporting bugs / ideas
Use the issue templates. Include steps to reproduce for bugs, and the use case for features.
