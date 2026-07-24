import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListEmployees, useCreateEmployee } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const empty = { name: "", role: "", department: "" };

export default function HRMS() {
  const qc = useQueryClient();
  const { data: employees = [], isLoading } = useListEmployees();
  const create = useCreateEmployee({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listEmployees"] }) },
  });
  const [form, setForm] = useState(empty);

  const handleAdd = () => {
    if (!form.name || !form.role || !form.department) return;
    create.mutate(form, { onSuccess: () => setForm(empty) });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4 text-gray-800">HRMS — Employees</h1>

      <div className="flex gap-2 mb-4">
        <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
        <Input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        <Button onClick={handleAdd} disabled={create.isPending}>Add</Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.name}</TableCell>
                <TableCell>{e.role}</TableCell>
                <TableCell>{e.department}</TableCell>
              </TableRow>
            ))}
            {employees.length === 0 && (
              <TableRow><TableCell colSpan={3} className="text-center text-gray-400">No employees yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
