# E Wallet (Android)

Native Android e-wallet inspired by [AIA友Point](https://www.aia.com.hk/zh-cn/help-and-support/aia-plus/aiapoints).

Members can earn points, redeem rewards, and transfer points.  
**Username, password hash, member ID, balance, and transactions live in Google Sheets.**

## Architecture

```
Android app (Kotlin + Jetpack Compose)
        │  HTTPS JSON
        ▼
Google Apps Script Web App  (google-apps-script/Code.gs)
        │
        ▼
Google Sheet  (Users + Transactions tabs)
```

Passwords are stored only as `sha256:` hashes in the Sheet.  
Session signing uses `SESSION_SECRET` in Apps Script properties (required; no fallback).  
The Android APK never embeds Sheet credentials or member passwords.

## Google Sheet

Spreadsheet: [E Wallet - AIA Points Style](https://docs.google.com/spreadsheets/d/1DByfS54qlUWmPX_f2ruzGCB22j6zzmr4dWotp-AGtpo/edit)

### Users columns

`user_id`, `username`, `password_hash`, `display_name`, `balance`, `member_id`, `status`, `updated_at`, `daily_earn_count`, `daily_earn_date`

### Transactions columns

`txn_id`, `from_user_id`, `to_user_id`, `type`, `amount`, `note`, `created_at`

## 1. Deploy the Sheets bridge

1. Open the spreadsheet → **Extensions → Apps Script**.
2. Paste `google-apps-script/Code.gs`.
3. **Project Settings → Script properties**
   - `SPREADSHEET_ID` = spreadsheet id from the URL  
   - `SESSION_SECRET` = a long random string (16+ chars)
4. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL (`https://script.google.com/macros/s/…/exec`).

### Set member password hashes

In Apps Script, run once in the editor (adjust usernames/passwords yourself):

```javascript
function setPasswordHash() {
  var username = 'andi'; // change
  var password = 'choose-a-strong-password'; // change; do not commit real passwords
  var hash = 'sha256:' + sha256Hex_(password);
  var sh = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID'))
    .getSheetByName('Users');
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).toLowerCase() === username.toLowerCase()) {
      sh.getRange(i + 1, 3).setValue(hash);
      return;
    }
  }
  throw new Error('user not found');
}
```

## 2. Open / run the Android app

Requirements: Android Studio Hedgehog+ (or newer), JDK 17, device/emulator API 26+.

```bash
# Open this folder in Android Studio, then Run ▸ app
# or:
./gradlew :app:assembleDebug
```

On first launch:

1. Open **设置**
2. Paste the Apps Script Web App URL
3. Save, then log in with a Sheet username + password you hashed

Optional build-time URL (local only):

```properties
# in local.properties (gitignored)
SHEETS_API_BASE_URL=https://script.google.com/macros/s/XXXX/exec
```

## Features

- Login against Google Sheet password hashes
- Balance card with member ID
- Earn points (daily limit enforced server-side)
- Redeem rewards
- Transfer points (notes sanitized; Sheet writes are non-formula)
- Transaction history
- Encrypted local session storage on device

## Security notes

- Do not put plaintext passwords or service-account keys in the Android project.
- Rotate any passwords that were previously committed in the old web demo.
- Keep `SESSION_SECRET` only in Apps Script properties.
