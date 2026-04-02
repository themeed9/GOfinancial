import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, type InsertTransaction } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Get all transactions
  app.get(api.transactions.list.path, async (_req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  // Create transaction
  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const transaction = await storage.createTransaction(input);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: error.errors[0].message,
          field: error.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Delete transaction
  app.delete(api.transactions.delete.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }
      const deleted = await storage.deleteTransaction(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  // Export to Excel
  app.post(api.export.excel.path, async (req, res) => {
    try {
      const { profile, expenses, revenues, savings, monthlyBudget } = req.body;
      const ExcelJS = await import("exceljs");

      const workbook = new ExcelJS.Workbook();

      // Transactions sheet
      const txnSheet = workbook.addWorksheet("Transactions");
      txnSheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Type", key: "type", width: 12 },
        { header: "Description", key: "description", width: 30 },
        { header: "Category", key: "category", width: 15 },
        { header: "Amount", key: "amount", width: 15 },
      ];

      const allTransactions = [
        ...(expenses || []).map((t: any) => ({ ...t, type: "Expense" })),
        ...(revenues || []).map((t: any) => ({ ...t, type: "Income" })),
        ...(savings || []).map((t: any) => ({ ...t, type: "Savings" })),
      ];

      allTransactions.forEach((tx: any) => {
        txnSheet.addRow({
          date: tx.createdAt?.substring(0, 10) || "",
          type: tx.type,
          description: tx.title || tx.description,
          category: tx.category,
          amount: Number(tx.amount),
        });
      });

      // Monthly Summary sheet
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];

      const monthlySheet = workbook.addWorksheet("Monthly Summary");
      monthlySheet.columns = [
        { header: "Month", key: "month", width: 15 },
        { header: "Income", key: "income", width: 15 },
        { header: "Expenses", key: "expenses", width: 15 },
        { header: "Savings", key: "savings", width: 15 },
        { header: "Balance", key: "balance", width: 20 },
      ];

      const currentYear = new Date().getFullYear();
      monthNames.forEach((month, idx) => {
        const monthExpenses = (expenses || [])
          .filter((t: any) => new Date(t.createdAt).getFullYear() === currentYear && new Date(t.createdAt).getMonth() === idx)
          .reduce((s: number, t: any) => s + Number(t.amount), 0);

        const monthIncome = (revenues || [])
          .filter((t: any) => new Date(t.createdAt).getFullYear() === currentYear && new Date(t.createdAt).getMonth() === idx)
          .reduce((s: number, t: any) => s + Number(t.amount), 0);

        const monthSavings = (savings || [])
          .filter((t: any) => new Date(t.createdAt).getFullYear() === currentYear && new Date(t.createdAt).getMonth() === idx)
          .reduce((s: number, t: any) => s + Number(t.amount), 0);

        monthlySheet.addRow({
          month,
          income: monthIncome,
          expenses: monthExpenses,
          savings: monthSavings,
          balance: monthIncome - monthExpenses - monthSavings,
        });
      });

      // Profile sheet
      if (profile) {
        const profileSheet = workbook.addWorksheet("Profile");
        profileSheet.columns = [
          { header: "Field", key: "field", width: 20 },
          { header: "Value", key: "value", width: 40 },
        ];
        profileSheet.addRow({ field: "Name", value: profile.name || "" });
        profileSheet.addRow({ field: "Bio", value: profile.bio || "" });
        profileSheet.addRow({ field: "Currency", value: profile.currency || "" });
        profileSheet.addRow({ field: "Monthly Budget", value: monthlyBudget || 0 });
      }

      // Style headers
      workbook.eachSheet((sheet) => {
        sheet.getRow(1).font = { bold: true };
      });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename=gofinancial-${new Date().toISOString().split("T")[0]}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export data" });
    }
  });

  return httpServer;
}
