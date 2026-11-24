import { google } from "googleapis";
import { randomUUID } from "crypto";
import { SEED_TRANSACTIONS, SEED_USERS } from "./seed-data";
import type {
  PublicUser,
  TransactionType,
  WalletTransaction,
  WalletUser,
} from "./types";

type StoreMode = "google-sheets" | "sample-data";

type WalletSnapshot = {
  users: WalletUser[];
  transactions: WalletTransaction[];
};

declare global {
  // eslint-disable-next-line no-var
  var __ewalletMemoryStore: WalletSnapshot | undefined;
}

function memoryStore(): WalletSnapshot {
  if (!globalThis.__ewalletMemoryStore) {
    globalThis.__ewalletMemoryStore = {
      users: structuredClone(SEED_USERS),
      transactions: structuredClone(SEED_TRANSACTIONS),
    };
  }
  return globalThis.__ewalletMemoryStore;
}

function sheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  );
}

export function getStoreMode(): StoreMode {
  return sheetsConfigured() ? "google-sheets" : "sample-data";
}

async function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(
    /\\n/g,
    "\n",
  );
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function spreadsheetId() {
  return process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
}

function parseUserRow(row: string[]): WalletUser | null {
  if (!row[0] || !row[1]) return null;
  return {
    userId: row[0],
    username: row[1],
    password: row[2] ?? "",
    displayName: row[3] ?? row[1],
    balance: Number(row[4] ?? 0),
    memberId: row[5] ?? "",
    status: row[6] === "inactive" ? "inactive" : "active",
    updatedAt: row[7] ?? new Date().toISOString(),
  };
}

function parseTxnRow(row: string[]): WalletTransaction | null {
  if (!row[0]) return null;
  const type = row[3] as TransactionType;
  if (!["earn", "redeem", "transfer"].includes(type)) return null;
  return {
    txnId: row[0],
    fromUserId: row[1] ?? "",
    toUserId: row[2] ?? "",
    type,
    amount: Number(row[4] ?? 0),
    note: row[5] ?? "",
    createdAt: row[6] ?? new Date().toISOString(),
  };
}

async function loadFromSheets(): Promise<WalletSnapshot> {
  const sheets = await getSheetsClient();
  const id = spreadsheetId();
  const res = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: id,
    ranges: ["Users!A2:H", "Transactions!A2:G"],
  });

  const userRows = (res.data.valueRanges?.[0]?.values ?? []) as string[][];
  const txnRows = (res.data.valueRanges?.[1]?.values ?? []) as string[][];

  return {
    users: userRows.map(parseUserRow).filter(Boolean) as WalletUser[],
    transactions: txnRows
      .map(parseTxnRow)
      .filter(Boolean) as WalletTransaction[],
  };
}

async function writeUsersToSheets(users: WalletUser[]) {
  const sheets = await getSheetsClient();
  const values = users.map((u) => [
    u.userId,
    u.username,
    u.password,
    u.displayName,
    u.balance,
    u.memberId,
    u.status,
    u.updatedAt,
  ]);
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range: "Users!A2:H",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

async function appendTxnToSheets(txn: WalletTransaction) {
  const sheets = await getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: "Transactions!A:G",
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          txn.txnId,
          txn.fromUserId,
          txn.toUserId,
          txn.type,
          txn.amount,
          txn.note,
          txn.createdAt,
        ],
      ],
    },
  });
}

async function loadSnapshot(): Promise<WalletSnapshot> {
  if (sheetsConfigured()) {
    try {
      return await loadFromSheets();
    } catch (error) {
      console.error("Google Sheets load failed, using sample data", error);
      return memoryStore();
    }
  }
  return memoryStore();
}

function toPublic(user: WalletUser): PublicUser {
  const { password: _password, ...rest } = user;
  return rest;
}

export async function findUserByUsername(username: string) {
  const { users } = await loadSnapshot();
  return (
    users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase().trim(),
    ) ?? null
  );
}

export async function getPublicUser(userId: string) {
  const { users } = await loadSnapshot();
  const user = users.find((u) => u.userId === userId);
  return user ? toPublic(user) : null;
}

export async function listDirectory(excludeUserId?: string) {
  const { users } = await loadSnapshot();
  return users
    .filter((u) => u.status === "active" && u.userId !== excludeUserId)
    .map((u) => ({
      userId: u.userId,
      username: u.username,
      displayName: u.displayName,
      memberId: u.memberId,
    }));
}

export async function listTransactionsForUser(userId: string) {
  const { transactions } = await loadSnapshot();
  return transactions
    .filter((t) => t.fromUserId === userId || t.toUserId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function persistUsersAndTxn(
  users: WalletUser[],
  txn: WalletTransaction,
  memory: WalletSnapshot,
) {
  memory.users = users;
  memory.transactions = [txn, ...memory.transactions];

  if (!sheetsConfigured()) return;

  try {
    await writeUsersToSheets(users);
    await appendTxnToSheets(txn);
  } catch (error) {
    console.error("Google Sheets write failed", error);
    throw new Error("Unable to sync wallet data to Google Sheets");
  }
}

export async function transferPoints(input: {
  fromUserId: string;
  toUsername: string;
  amount: number;
  note?: string;
}) {
  const amount = Math.floor(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Transfer amount must be a positive whole number");
  }

  const snapshot = await loadSnapshot();
  const users = structuredClone(snapshot.users);
  const from = users.find((u) => u.userId === input.fromUserId);
  const to = users.find(
    (u) => u.username.toLowerCase() === input.toUsername.toLowerCase().trim(),
  );

  if (!from || from.status !== "active") throw new Error("Sender not found");
  if (!to || to.status !== "active") throw new Error("Recipient not found");
  if (from.userId === to.userId) throw new Error("Cannot transfer to yourself");
  if (from.balance < amount) throw new Error("Insufficient balance");

  const now = new Date().toISOString();
  from.balance -= amount;
  to.balance += amount;
  from.updatedAt = now;
  to.updatedAt = now;

  const txn: WalletTransaction = {
    txnId: `T${randomUUID().slice(0, 8).toUpperCase()}`,
    fromUserId: from.userId,
    toUserId: to.userId,
    type: "transfer",
    amount,
    note: input.note?.trim() || `转赠友Point给 ${to.displayName}`,
    createdAt: now,
  };

  const memory = memoryStore();
  await persistUsersAndTxn(users, txn, memory);
  memory.users = users;

  return { from: toPublic(from), to: toPublic(to), transaction: txn };
}

export async function earnPoints(input: {
  userId: string;
  amount: number;
  note: string;
}) {
  const amount = Math.floor(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Earn amount must be a positive whole number");
  }

  const snapshot = await loadSnapshot();
  const users = structuredClone(snapshot.users);
  const user = users.find((u) => u.userId === input.userId);
  if (!user || user.status !== "active") throw new Error("User not found");

  const now = new Date().toISOString();
  user.balance += amount;
  user.updatedAt = now;

  const txn: WalletTransaction = {
    txnId: `T${randomUUID().slice(0, 8).toUpperCase()}`,
    fromUserId: "system",
    toUserId: user.userId,
    type: "earn",
    amount,
    note: input.note,
    createdAt: now,
  };

  const memory = memoryStore();
  await persistUsersAndTxn(users, txn, memory);
  memory.users = users;

  return { user: toPublic(user), transaction: txn };
}

export async function redeemPoints(input: {
  userId: string;
  amount: number;
  note: string;
}) {
  const amount = Math.floor(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Redeem amount must be a positive whole number");
  }

  const snapshot = await loadSnapshot();
  const users = structuredClone(snapshot.users);
  const user = users.find((u) => u.userId === input.userId);
  if (!user || user.status !== "active") throw new Error("User not found");
  if (user.balance < amount) throw new Error("Insufficient balance");

  const now = new Date().toISOString();
  user.balance -= amount;
  user.updatedAt = now;

  const txn: WalletTransaction = {
    txnId: `T${randomUUID().slice(0, 8).toUpperCase()}`,
    fromUserId: user.userId,
    toUserId: "reward",
    type: "redeem",
    amount,
    note: input.note,
    createdAt: now,
  };

  const memory = memoryStore();
  await persistUsersAndTxn(users, txn, memory);
  memory.users = users;

  return { user: toPublic(user), transaction: txn };
}
