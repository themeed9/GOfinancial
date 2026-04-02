import type { InsertTransaction, Transaction } from "@shared/schema";

export interface IStorage {
  getTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  deleteTransaction(id: number): Promise<boolean>;
}

class InMemoryStorage implements IStorage {
  private transactions: Transaction[] = [];
  private nextId = 1;

  async getTransactions(): Promise<Transaction[]> {
    return [...this.transactions].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const transaction: Transaction = {
      id: this.nextId++,
      title: data.title,
      amount: String(data.amount),
      type: data.type,
      category: data.category,
      createdAt: new Date(),
    };
    this.transactions.push(transaction);
    return transaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const index = this.transactions.findIndex((t) => t.id === id);
    if (index === -1) return false;
    this.transactions.splice(index, 1);
    return true;
  }
}

export const storage: IStorage = new InMemoryStorage();
