# Expense Tracker — Complete Guide

Everything you need: how to use every feature, and how to deploy it so a team shares one live link. No coding required to *use* it. Deploying takes ~10 minutes, one time.

---

# Part 1 — How to use it

Open the app (double-click `index.html`, or your hosted link). There are two tabs, top-right: **Dashboard** and **Input**.

## Logging an expense
1. Go to **Input**.
2. Leave the toggle on **Expense (out)**.
3. Fill in:
   - **What did this cost?** — the amount.
   - **What date was it?**
   - **Category** — pick one, or add a new one.
   - **Label / name** — who or what it's for (e.g. "June payroll", "Notion").
   - **Business or personal** — tag it.
   - **Why did you buy this?** — the business reason (optional, but a weak/blank reason gets flagged).
   - **Attach** — optional receipts/screenshots (drag-drop, click, or paste with Ctrl+V).
4. **Add expense.**

## Logging income
1. On **Input**, flip the top toggle to **Income (in)**.
2. Enter the amount, date, category, and a label (e.g. "Client A — July retainer").
3. **Add.** Income shows green in the log.

> You don't enter payouts on income. Payouts are calculated automatically from profit — see below.

## Team profit-share (automatic payouts)
This answers "we made money this period, who gets paid what?"

1. On **Input**, scroll to **Team profit share**.
2. Add each person and their **% of profit** (e.g. a partner on 15%). Leave it empty if you don't do profit share.
3. On the **Dashboard**, the app computes:
   - **Profit = Income − Expenses** for the selected date range.
   - Each member's payout = their % × profit.
   - **Payouts Owed** tile = everything not yet marked paid.
4. In the **Profit and team payouts** section, hit **Mark paid** next to a person once you've sent them their cut. Paid status is tracked **per period**, so marking someone paid this week doesn't carry into next week.

**Example:** $10,000 income − $4,000 expenses = **$6,000 profit**. A member on 15% is owed **$900**.

## The Dashboard
- **Tiles:** Total Spent, Income In, Profit, Payouts Owed, plus one per category (with budget usage if you set a cap).
- **Date range:** This week · This month · All time · Custom (top-right).
- **Business/Personal filter** next to it.
- **Insights:** top category, average per expense, this-month-vs-last, projected month-end.
- **Monthly trend** bar chart, **category donut**, **spend by name**.
- **Expense log:** search and sort; each row has a delete and edit button.

## Categories and budgets
- Add/remove categories under **Input → Manage categories**.
- Set a monthly **$ budget** on any category; in "This month" view the tile shows spent-of-budget and turns red when over.

## Recurring items
- Tick **Repeat monthly** when adding an expense (great for payroll, rent, subscriptions). It auto-adds each month. Manage them under **Input → Recurring**.

## Export and backup
- **PDF report** and **CSV** buttons on the Dashboard (they respect the current date range).
- **Input → Backup → Export backup (JSON)** saves everything to one file. **Restore** loads it back (replaces current data). Do this before switching devices if you're not using cloud sync.

---

# Part 2 — Deploy it (host + live sync across devices)

Local use needs nothing. To give a client a **link** that stays in sync across their whole team, do this once. It's free on Cloudflare.

You'll set up two things: a **sync backend** (Worker + KV) and the **hosted page** (Pages).

## Prerequisites
- A free **Cloudflare account** (dash.cloudflare.com).
- **Node.js** installed (nodejs.org — get the LTS build).

Install the Cloudflare CLI and log in:
```bash
npm install -g wrangler
wrangler login
```

## A) Sync backend (Worker + KV)
From inside the project folder:
```bash
# 1. Create the storage
wrangler kv namespace create HUB
#    copy the id it prints
```
Open `wrangler.toml` and paste that id in place of `PASTE_YOUR_KV_ID_HERE`.

```bash
# 2. Set a secret key (make up a long random string, keep it safe)
wrangler secret put SYNC_KEY
#    paste your key when prompted, e.g.  gi-expense-9Fq2k7Zx

# 3. Deploy
wrangler deploy
#    it prints your Worker URL, e.g. https://expense-tracker-sync.YOURNAME.workers.dev
```
> First time only, Cloudflare asks you to register a free **workers.dev subdomain**. In the dashboard: **Compute → Workers & Pages → your worker → Domains** and toggle the workers.dev URL on. Then the Worker URL is live.

Keep two things: the **Worker URL** and the **SYNC_KEY**.

## B) Host the page (Cloudflare Pages)
```bash
wrangler pages project create expense-tracker --production-branch main
wrangler pages deploy . --project-name expense-tracker --branch main --commit-dirty=true
```
It prints your site link, e.g. `https://expense-tracker.pages.dev`. That's what you share.

(Or drag the folder into a new Pages project in the dashboard, or use Vercel/Netlify — it's just static files.)

## C) Turn on sync in the app
1. Open the site link.
2. **Input tab → Cloud sync.**
3. Paste the **Worker URL** and the **SYNC_KEY**.
4. **Connect & sync.** The dot by the title turns green.
5. Do the same on any other device with the **same URL + key** — they all share one live board (updates every ~5 seconds; click the dot to force a refresh).

## D) (Optional) Make it zero-setup for the client
So the client never touches the Cloud sync fields, bake your Worker in. Open `index.html`, find near the top of the `<script>`:
```js
const BUILTIN_SYNC=null;
```
Change it to your Worker:
```js
const BUILTIN_SYNC={url:"https://expense-tracker-sync.YOURNAME.workers.dev",key:"gi-expense-9Fq2k7Zx"};
```
Re-deploy the page (step B). Now anyone who opens the link is auto-connected — no setup on their end.

> Trade-off: with a baked key, anyone who has the **link** can view/edit. That's the point for a shared team tool. Leave `BUILTIN_SYNC=null` if you'd rather each device connect manually.

---

# Making it your client's own

- **Rename it:** in `index.html` change the `<title>` and the `<h1>` brand text ("Expense Tracker"). Change the emoji in the `.logo` div.
- **Fresh data per client:** each deployment has its own Worker + KV, so clients never see each other's data. Give each client their own Worker URL + key (or their own baked build).
- **Colors:** the theme lives in the `:root { ... }` CSS variables at the top of `index.html` (`--bg`, `--red`, `--green`, etc.).

---

# Troubleshooting

- **"local only" / not syncing:** you haven't connected a Worker on that device. Input → Cloud sync → paste URL + key.
- **"sync error" / "offline":** wrong URL or key, or the Worker isn't deployed. Re-check both; the key must match `SYNC_KEY` exactly.
- **Changes don't show after redeploy:** hard-refresh the page (Ctrl+Shift+R), or open it once in a private window.
- **Data disappeared:** if not on cloud sync, data is per-browser. Use **Backup → Export** to move it, and **Restore** on the other device.
- **Worker "unauthorized" (401):** the key you entered doesn't match the `SYNC_KEY` secret. Reset it with `wrangler secret put SYNC_KEY` and reconnect.

Everything is free on Cloudflare's tier at normal team volume. No database server to run, no monthly bill.
