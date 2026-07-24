import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListTransactions, useCreateTransaction } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Finance() {
  const qc = useQueryClient();
  const { data, isLoading } = useListTransactions();
  const create = useCreateTransaction({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listTransactions"] }) },
  });
  const [form, setForm] = useState({ type: "Revenue", amount: "", date: new Date().toISOString().slice(0, 10) });

  const handleAdd = () => {
    if (!form.amount) return;
    create.mutate(
      { type: form.type, amount: parseFloat(form.amount), date: form.date },
      { onSuccess: () => setForm({ type: "Revenue", amount: "", date: new Date().toISOString().slice(0, 10) }) }
    );
  };

  const transactions = data?.transactions ?? [];
  const total = data?.total ?? 0;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4 text-gray-800">Finance — Transactions</h1>

      <div className="flex gap-2 mb-4">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          <option>Revenue</option>
          <option>Expense</option>
        </select>
        <Input
          placeholder="Amount"
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-32"
        />
        <Input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-36"
        />
        <Button onClick={handleAdd} disabled={create.isPending}>Add</Button>
      </div>

      <div className="mb-4 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg inline-flex gap-2 items-baseline">
        <span className="text-sm text-gray-500">Running total:</span>
        <span className={`text-lg font-bold ${total >= 0 ? "text-green-700" : "text-red-600"}`}>
          ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${t.type === "Revenue" ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
                    {t.type}
                  </span>
                </TableCell>
                <TableCell>${t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{t.date}</TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-gray-400">No transactions yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
