import type { WalletTransaction, WalletUser } from "./types";

/** Mirrors the Google Sheet seed so the app works without credentials. */
export const SEED_USERS: WalletUser[] = [
  {
    userId: "U001",
    username: "andi",
    password: "demo1234",
    displayName: "Andi Wong",
    balance: 12850,
    memberId: "AIA-88001",
    status: "active",
    updatedAt: "2026-11-24T07:00:00Z",
  },
  {
    userId: "U002",
    username: "mei",
    password: "demo1234",
    displayName: "Mei Chan",
    balance: 5420,
    memberId: "AIA-88002",
    status: "active",
    updatedAt: "2026-11-24T07:00:00Z",
  },
  {
    userId: "U003",
    username: "ken",
    password: "demo1234",
    displayName: "Ken Lau",
    balance: 980,
    memberId: "AIA-88003",
    status: "active",
    updatedAt: "2026-11-24T07:00:00Z",
  },
  {
    userId: "U004",
    username: "gareth",
    password: "wallet2026",
    displayName: "Gareth",
    balance: 25000,
    memberId: "AIA-88004",
    status: "active",
    updatedAt: "2026-11-24T07:00:00Z",
  },
];

export const SEED_TRANSACTIONS: WalletTransaction[] = [
  {
    txnId: "T001",
    fromUserId: "system",
    toUserId: "U001",
    type: "earn",
    amount: 500,
    note: "完成健康任务：步行一万步",
    createdAt: "2026-11-20T10:00:00Z",
  },
  {
    txnId: "T002",
    fromUserId: "U001",
    toUserId: "reward",
    type: "redeem",
    amount: 200,
    note: "兑换咖啡礼券",
    createdAt: "2026-11-21T14:30:00Z",
  },
  {
    txnId: "T003",
    fromUserId: "U001",
    toUserId: "U002",
    type: "transfer",
    amount: 100,
    note: "转赠友Point给亲友",
    createdAt: "2026-11-22T09:15:00Z",
  },
  {
    txnId: "T004",
    fromUserId: "system",
    toUserId: "U004",
    type: "earn",
    amount: 1000,
    note: "新会员欢迎积分",
    createdAt: "2026-11-23T08:00:00Z",
  },
];
