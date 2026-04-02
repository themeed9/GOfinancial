
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import ExcelJS from "exceljs";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.transactions.list.path, async (req, res) => {
    const transactions = await storage.getTransactions();
    res.json(transactions);
  });

  app.post(api.transactions.create.path, async (req, res) => {
    try {
      const input = api.transactions.create.input.parse(req.body);
      const transaction = await storage.createTransaction(input);
      res.status(201).json(transaction);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post("/api/export-excel", async (req, res) => {
    try {
      const { profile, expenses, revenues, savings, monthlyBudget } = req.body;

      const workbook = new ExcelJS.Workbook();

      const txnSheet = workbook.addWorksheet("Transactions");
      txnSheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Type", key: "type", width: 12 },
        { header: "Description", key: "description", width: 30 },
        { header: "Amount", key: "amount", width: 15 },
      ];

      const allTransactions = [
        ...(expenses || []).map((t: any) => ({ ...t, type: "Expense" })),
        ...(revenues || []).map((t: any) => ({ ...t, type: "Income" })),
        ...(savings || []).map((t: any) => ({ ...t, type: "Savings" })),
      ];

      allTransactions.forEach((tx: any) => {
        txnSheet.addRow({
          date: tx.createdAt ? tx.createdAt.substring(0, 10) : "",
          type: tx.type,
          description: tx.description,
          amount: tx.amount,
        });
      });

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
        { header: "Remaining Balance", key: "balance", width: 20 },
      ];

      const currentYear = new Date().getFullYear();
      monthNames.forEach((month, idx) => {
        const monthExpenses = (expenses || [])
          .filter((t: any) => {
            const d = new Date(t.createdAt);
            return d.getFullYear() === currentYear && d.getMonth() === idx;
          })
          .reduce((s: number, t: any) => s + t.amount, 0);

        const monthIncome = (revenues || [])
          .filter((t: any) => {
            const d = new Date(t.createdAt);
            return d.getFullYear() === currentYear && d.getMonth() === idx;
          })
          .reduce((s: number, t: any) => s + t.amount, 0);

        const monthSavings = (savings || [])
          .filter((t: any) => {
            const d = new Date(t.createdAt);
            return d.getFullYear() === currentYear && d.getMonth() === idx;
          })
          .reduce((s: number, t: any) => s + t.amount, 0);

        monthlySheet.addRow({
          month,
          income: monthIncome,
          expenses: monthExpenses,
          savings: monthSavings,
          balance: monthIncome - monthExpenses - monthSavings,
        });
      });

      const yearlySheet = workbook.addWorksheet("Yearly Summary");
      yearlySheet.columns = [
        { header: "Year", key: "year", width: 10 },
        { header: "Total Income", key: "income", width: 20 },
        { header: "Total Expenses", key: "expenses", width: 20 },
        { header: "Total Savings", key: "savings", width: 20 },
        { header: "Net", key: "net", width: 20 },
        { header: "Monthly Budget", key: "budget", width: 20 },
      ];

      const totalIncome = (revenues || []).reduce((s: number, t: any) => s + t.amount, 0);
      const totalExpenses = (expenses || []).reduce((s: number, t: any) => s + t.amount, 0);
      const totalSavings = (savings || []).reduce((s: number, t: any) => s + t.amount, 0);

      yearlySheet.addRow({
        year: currentYear,
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalSavings,
        net: totalIncome - totalExpenses - totalSavings,
        budget: monthlyBudget || 0,
      });

      const profileSheet = workbook.addWorksheet("Profile");
      profileSheet.columns = [
        { header: "Field", key: "field", width: 20 },
        { header: "Value", key: "value", width: 40 },
      ];
      if (profile) {
        profileSheet.addRow({ field: "Name", value: profile.name || "" });
        profileSheet.addRow({ field: "Bio", value: profile.bio || "" });
        profileSheet.addRow({ field: "Currency", value: profile.currency || "" });
      }

      workbook.eachSheet((sheet) => {
        sheet.getRow(1).font = { bold: true };
      });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=gofinancial-budget-${new Date().toISOString().split("T")[0]}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export data." });
    }
  });

  return httpServer;
}

// Seed function to populate DB with the requested static data if empty
async function seedDatabase() {
  const existing = await storage.getTransactions();
  if (existing.length === 0) {
    await storage.createTransaction({
      title: "Transport to Ketu",
      amount: "1000",
      type: "expense",
      category: "transport"
    });
    await storage.createTransaction({
      title: "Transport to Obalende",
      amount: "1000",
      type: "expense",
      category: "transport"
    });
    await storage.createTransaction({
      title: "Fearless",
      amount: "500",
      type: "expense",
      category: "food"
    });
  }
}

// Run seed
seedDatabase().catch(console.error);
