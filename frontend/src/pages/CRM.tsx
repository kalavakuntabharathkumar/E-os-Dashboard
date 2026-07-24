import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListLeads, useCreateLead } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_OPTIONS = ["New", "Contacted", "Closed"];
const STATUS_COLORS: Record<string, string> = {
  New: "text-blue-600 bg-blue-50",
  Contacted: "text-yellow-700 bg-yellow-50",
  Closed: "text-green-700 bg-green-50",
};

export default function CRM() {
  const qc = useQueryClient();
  const { data: leads = [], isLoading } = useListLeads();
  const create = useCreateLead({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listLeads"] }) },
  });
  const [name, setName] = useState("");
  const [status, setStatus] = useState("New");

  const handleAdd = () => {
    if (!name.trim()) return;
    create.mutate({ name, status }, { onSuccess: () => { setName(""); setStatus("New"); } });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1 text-gray-800">CRM — Leads</h1>
      <p className="text-xs text-gray-400 mb-4">Note: creating a lead with status "Closed" auto-triggers a Finance transaction.</p>

      <div className="flex gap-2 mb-4">
        <Input placeholder="Lead name / company" value={name} onChange={(e) => setName(e.target.value)} />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <Button onClick={handleAdd} disabled={create.isPending}>Add</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.name}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[l.status] ?? ""}`}>
                    {l.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {leads.length === 0 && (
              <TableRow><TableCell colSpan={2} className="text-center text-gray-400">No leads yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
