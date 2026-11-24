/**
 * E Wallet → Google Sheets bridge for the Android app.
 *
 * Setup:
 * 1. Open the wallet spreadsheet → Extensions → Apps Script
 * 2. Paste this file, then Project Settings → Script properties:
 *      SPREADSHEET_ID   = your spreadsheet id
 *      SESSION_SECRET   = long random string (required; no default)
 * 3. Deploy → New deployment → Web app
 *      Execute as: Me
 *      Who has access: Anyone
 * 4. Copy the Web App URL into the Android app Settings screen.
 *
 * Users! columns:
 * A user_id | B username | C password_hash | D display_name | E balance
 * F member_id | G status | H updated_at | I daily_earn_count | J daily_earn_date
 *
 * password_hash format: sha256:<hex>
 */

var USERS_SHEET = 'Users';
var TXN_SHEET = 'Transactions';
var MAX_DAILY_EARNS = 5;
var TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

var TASKS = {
  walk: { amount: 120, note: '完成健康任务：步行一万步' },
  checkup: { amount: 300, note: '完成健康任务：年度体检打卡' },
  quiz: { amount: 80, note: '完成健康知识小测验' }
};

var REWARDS = {
  coffee: { amount: 200, note: '兑换咖啡礼券' },
  voucher: { amount: 500, note: '兑换超市礼券' },
  wellness: { amount: 800, note: '兑换健康体验礼遇' }
};

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    var action = String(body.action || '');
    var result;

    switch (action) {
      case 'login':
        result = login_(body);
        break;
      case 'logout':
        result = { ok: true };
        break;
      case 'me':
        result = me_(body);
        break;
      case 'directory':
        result = directory_(body);
        break;
      case 'transactions':
        result = transactions_(body);
        break;
      case 'earn':
        result = withLock_(function () { return earn_(body); });
        break;
      case 'redeem':
        result = withLock_(function () { return redeem_(body); });
        break;
      case 'transfer':
        result = withLock_(function () { return transfer_(body); });
        break;
      default:
        result = { ok: false, error: 'Unknown action' };
    }
    return json_(result);
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'e-wallet-sheets-bridge' });
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) {
    throw new Error('Wallet busy, try again');
  }
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

function sheet_() {
  var id = props_().getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('SPREADSHEET_ID is not configured');
  return SpreadsheetApp.openById(id);
}

function props_() {
  return PropertiesService.getScriptProperties();
}

function requireSecret_() {
  var secret = props_().getProperty('SESSION_SECRET');
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET is not configured');
  }
  return secret;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sha256Hex_(text) {
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8);
  return raw.map(function (b) {
    var v = (b < 0 ? b + 256 : b).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function sanitizeNote_(note) {
  var text = String(note || '').trim().slice(0, 120);
  // Prevent formula injection into Sheets (USER_ENTERED risk).
  if (/^[=+\-@]/.test(text)) {
    text = "'" + text;
  }
  text = text.replace(/[\r\n\t]/g, ' ');
  return text;
}

function readUsers_() {
  var values = sheet_().getSheetByName(USERS_SHEET).getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (!r[0]) continue;
    rows.push({
      row: i + 1,
      userId: String(r[0]),
      username: String(r[1]),
      passwordHash: String(r[2] || ''),
      displayName: String(r[3] || r[1]),
      balance: Number(r[4] || 0),
      memberId: String(r[5] || ''),
      status: String(r[6] || 'active'),
      updatedAt: String(r[7] || ''),
      dailyEarnCount: Number(r[8] || 0),
      dailyEarnDate: String(r[9] || '')
    });
  }
  return rows;
}

function publicUser_(u) {
  return {
    userId: u.userId,
    username: u.username,
    displayName: u.displayName,
    balance: u.balance,
    memberId: u.memberId,
    status: u.status
  };
}

function writeUserBalance_(u) {
  var sh = sheet_().getSheetByName(USERS_SHEET);
  sh.getRange(u.row, 5).setValue(u.balance);
  sh.getRange(u.row, 8).setValue(u.updatedAt);
  sh.getRange(u.row, 9).setValue(u.dailyEarnCount);
  sh.getRange(u.row, 10).setValue(u.dailyEarnDate);
}

function appendTxn_(txn) {
  var sh = sheet_().getSheetByName(TXN_SHEET);
  // RAW avoids formula evaluation on attacker-controlled notes.
  sh.appendRow([
    txn.txnId,
    txn.fromUserId,
    txn.toUserId,
    txn.type,
    txn.amount,
    txn.note,
    txn.createdAt
  ]);
  var last = sh.getLastRow();
  sh.getRange(last, 1, 1, 7).setNumberFormat('@');
}

function signToken_(userId, username, exp) {
  var secret = requireSecret_();
  var payload = userId + '|' + username + '|' + exp;
  var sig = sha256Hex_(payload + '|' + secret);
  return Utilities.base64EncodeWebSafe(payload + '|' + sig);
}

function verifyToken_(token) {
  if (!token) return null;
  var decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(String(token))).getDataAsString();
  var parts = decoded.split('|');
  if (parts.length !== 4) return null;
  var userId = parts[0];
  var username = parts[1];
  var exp = Number(parts[2]);
  var sig = parts[3];
  if (!exp || Date.now() > exp) return null;
  var expected = sha256Hex_(userId + '|' + username + '|' + exp + '|' + requireSecret_());
  if (sig !== expected) return null;
  return { userId: userId, username: username };
}

function requireSession_(body) {
  var session = verifyToken_(body.token);
  if (!session) throw new Error('Unauthorized');
  var users = readUsers_();
  var user = users.filter(function (u) {
    return u.userId === session.userId && u.status === 'active';
  })[0];
  if (!user) throw new Error('Unauthorized');
  return user;
}

function login_(body) {
  var username = String(body.username || '').trim().toLowerCase();
  var password = String(body.password || '');
  if (!username || !password) throw new Error('Username and password required');

  var users = readUsers_();
  var user = users.filter(function (u) {
    return u.username.toLowerCase() === username && u.status === 'active';
  })[0];
  if (!user) throw new Error('Invalid username or password');

  var incoming = 'sha256:' + sha256Hex_(password);
  if (incoming !== user.passwordHash) {
    throw new Error('Invalid username or password');
  }

  var exp = Date.now() + TOKEN_TTL_MS;
  return {
    ok: true,
    token: signToken_(user.userId, user.username, exp),
    user: publicUser_(user)
  };
}

function me_(body) {
  return { ok: true, user: publicUser_(requireSession_(body)) };
}

function directory_(body) {
  var me = requireSession_(body);
  var users = readUsers_().filter(function (u) {
    return u.status === 'active' && u.userId !== me.userId;
  }).map(function (u) {
    return {
      userId: u.userId,
      username: u.username,
      displayName: u.displayName,
      memberId: u.memberId
    };
  });
  return { ok: true, users: users };
}

function transactions_(body) {
  var me = requireSession_(body);
  var values = sheet_().getSheetByName(TXN_SHEET).getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    if (!r[0]) continue;
    var fromId = String(r[1]);
    var toId = String(r[2]);
    if (fromId !== me.userId && toId !== me.userId) continue;
    rows.push({
      txnId: String(r[0]),
      fromUserId: fromId,
      toUserId: toId,
      type: String(r[3]),
      amount: Number(r[4] || 0),
      note: String(r[5] || ''),
      createdAt: String(r[6] || '')
    });
  }
  rows.sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
  return { ok: true, transactions: rows };
}

function todayKey_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function earn_(body) {
  var me = requireSession_(body);
  var task = TASKS[String(body.taskId || '')];
  if (!task) throw new Error('Unknown task');

  var today = todayKey_();
  if (me.dailyEarnDate !== today) {
    me.dailyEarnCount = 0;
    me.dailyEarnDate = today;
  }
  if (me.dailyEarnCount >= MAX_DAILY_EARNS) {
    throw new Error('Daily earn limit reached');
  }

  me.balance += task.amount;
  me.dailyEarnCount += 1;
  me.updatedAt = new Date().toISOString();
  writeUserBalance_(me);

  var txn = {
    txnId: 'T' + Utilities.getUuid().slice(0, 8).toUpperCase(),
    fromUserId: 'system',
    toUserId: me.userId,
    type: 'earn',
    amount: task.amount,
    note: task.note,
    createdAt: me.updatedAt
  };
  appendTxn_(txn);
  return { ok: true, user: publicUser_(me), transaction: txn };
}

function redeem_(body) {
  var me = requireSession_(body);
  var reward = REWARDS[String(body.rewardId || '')];
  if (!reward) throw new Error('Unknown reward');
  if (me.balance < reward.amount) throw new Error('Insufficient balance');

  me.balance -= reward.amount;
  me.updatedAt = new Date().toISOString();
  writeUserBalance_(me);

  var txn = {
    txnId: 'T' + Utilities.getUuid().slice(0, 8).toUpperCase(),
    fromUserId: me.userId,
    toUserId: 'reward',
    type: 'redeem',
    amount: reward.amount,
    note: reward.note,
    createdAt: me.updatedAt
  };
  appendTxn_(txn);
  return { ok: true, user: publicUser_(me), transaction: txn };
}

function transfer_(body) {
  var me = requireSession_(body);
  var toUsername = String(body.toUsername || '').trim().toLowerCase();
  var amount = Math.floor(Number(body.amount || 0));
  var note = sanitizeNote_(body.note || ('转赠友Point'));

  if (!toUsername) throw new Error('Recipient required');
  if (!isFinite(amount) || amount <= 0) throw new Error('Transfer amount must be a positive whole number');

  var users = readUsers_();
  var to = users.filter(function (u) {
    return u.username.toLowerCase() === toUsername && u.status === 'active';
  })[0];
  if (!to) throw new Error('Recipient not found');
  if (to.userId === me.userId) throw new Error('Cannot transfer to yourself');
  if (me.balance < amount) throw new Error('Insufficient balance');

  var now = new Date().toISOString();
  me.balance -= amount;
  to.balance += amount;
  me.updatedAt = now;
  to.updatedAt = now;
  writeUserBalance_(me);
  writeUserBalance_(to);

  var txn = {
    txnId: 'T' + Utilities.getUuid().slice(0, 8).toUpperCase(),
    fromUserId: me.userId,
    toUserId: to.userId,
    type: 'transfer',
    amount: amount,
    note: note,
    createdAt: now
  };
  appendTxn_(txn);
  return { ok: true, user: publicUser_(me), transaction: txn };
}
