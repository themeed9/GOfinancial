import { z } from "zod";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Health",
  "Salary",
  "Shopping",
  "Entertainment",
  "Education",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type TransactionType = "expense" | "revenue" | "savings";

export interface Transaction {
  id: number;
  title: string;
  amount: string;
  type: TransactionType;
  category: Category;
  createdAt: Date;
}

export const insertTransactionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.string().refine((val) => Number(val) > 0, "Amount must be positive"),
  type: z.enum(["expense", "revenue", "savings"]),
  category: z.enum(CATEGORIES),
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  transactions: {
    list: {
      method: "GET" as const,
      path: "/api/transactions",
      responses: {
        200: z.array(z.custom<Transaction>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/transactions",
      input: insertTransactionSchema,
      responses: {
        201: z.custom<Transaction>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/transactions/:id",
      responses: {
        200: z.object({ success: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },
  export: {
    excel: {
      method: "POST" as const,
      path: "/api/export/excel",
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
