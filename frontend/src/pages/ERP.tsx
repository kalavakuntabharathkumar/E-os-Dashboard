import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store";
import { useListInventory, useCreateInventoryItem } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_OPTIONS = ["In Stock", "Low", "Out of Stock"];
const STATUS_COLORS: Record<string, string> = {
  "In Stock": "text-green-700 bg-green-50",
  "Low": "text-yellow-700 bg-yellow-50",
  "Out of Stock": "text-red-600 bg-red-50",
};

export default function ERP() {
  const qc = useQueryClient();
  const { role } = useAuthStore();
  const { data: items = [], isLoading } = useListInventory();
  const create = useCreateInventoryItem({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listInventory"] }) },
  });
  const [form, setForm] = useState({ item: "", quantity: "", status: "In Stock" });

  const handleAdd = () => {
    if (!form.item || !form.quantity) return;
    create.mutate(
      { item: form.item, quantity: parseInt(form.quantity), status: form.status },
      { onSuccess: () => setForm({ item: "", quantity: "", status: "In Stock" }) }
    );
  };

  const canWrite = role === "Admin";

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4 text-gray-800">ERP — Inventory</h1>

      {canWrite && (
        <div className="flex gap-2 mb-4">
          <Input placeholder="Item name" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} />
          <Input placeholder="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-28" />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <Button onClick={handleAdd} disabled={create.isPending}>Add</Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.item}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[item.status] ?? ""}`}>
                    {item.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-gray-400">No inventory yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
