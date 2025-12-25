export interface Member {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // Member ID
  involvedMembers: string[]; // Member IDs (対象メンバー)
  timestamp: number;
}

export interface Group {
  id: string;
  name: string;
  currency: string;
  members: Member[];
  expenses: Expense[];
  createdAt: number;
  updatedAt: number;
  isCompleted: boolean;
}

export interface Debt {
  from: string; // Member ID
  to: string;   // Member ID
  amount: number;
}
