export type WalletUser = {
  userId: string;
  username: string;
  password: string;
  displayName: string;
  balance: number;
  memberId: string;
  status: "active" | "inactive";
  updatedAt: string;
};

export type TransactionType = "earn" | "redeem" | "transfer";

export type WalletTransaction = {
  txnId: string;
  fromUserId: string;
  toUserId: string;
  type: TransactionType;
  amount: number;
  note: string;
  createdAt: string;
};

export type PublicUser = Omit<WalletUser, "password">;

export type SessionPayload = {
  userId: string;
  username: string;
};
