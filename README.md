# E Wallet

Android-friendly electronic wallet inspired by [AIA友Point](https://www.aia.com.hk/zh-cn/help-and-support/aia-plus/aiapoints). Members can earn points from health tasks, redeem rewards, and transfer points to other members.

Wallet records (username, password, member ID, balance, transactions) live in a **Google Sheet**.

## Google Sheet

Spreadsheet: [E Wallet - AIA Points Style](https://docs.google.com/spreadsheets/d/1DByfS54qlUWmPX_f2ruzGCB22j6zzmr4dWotp-AGtpo/edit)

| Tab | Columns |
| --- | --- |
| `Users` | `user_id`, `username`, `password`, `display_name`, `balance`, `member_id`, `status`, `updated_at` |
| `Transactions` | `txn_id`, `from_user_id`, `to_user_id`, `type`, `amount`, `note`, `created_at` |

Without Google credentials the app runs on matching **sample data**.

## Demo accounts

| Username | Password | Member ID |
| --- | --- | --- |
| `andi` | `demo1234` | AIA-88001 |
| `mei` | `demo1234` | AIA-88002 |
| `ken` | `demo1234` | AIA-88003 |
| `gareth` | `wallet2026` | AIA-88004 |

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (default port `3847`).

## Connect Google Sheets (live sync)

1. Create a Google Cloud service account with Sheets API enabled.
2. Share the spreadsheet with that service account email (Editor).
3. Set secrets / env vars:
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
   - `SESSION_SECRET`
4. Restart the app. The home screen will show **已连接 Google Sheet**.

## Android use

This is a mobile-first Progressive Web App (PWA):

1. Open the site in **Chrome on Android**.
2. Menu → **Add to Home screen** / **Install app**.
3. Launch **E Wallet** like a native app (standalone, portrait, branded theme).

For a Play Store APK later, wrap the same URL with Capacitor / Trusted Web Activity.

## Features

- Login against sheet / sample users
- Balance card with member ID
- Earn points (tasks)
- Redeem rewards
- Transfer points to another member
- Transaction history
