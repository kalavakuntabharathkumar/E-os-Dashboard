import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store";
import { useListTasks, useCreateTask } from "@/api/generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const STATUS_OPTIONS = ["To Do", "In Progress", "Done"];
const STATUS_COLORS: Record<string, string> = {
  "To Do": "text-gray-600 bg-gray-100",
  "In Progress": "text-blue-700 bg-blue-50",
  "Done": "text-green-700 bg-green-50",
};

export default function ProjectMgmt() {
  const qc = useQueryClient();
  const { role } = useAuthStore();
  const { data: tasks = [], isLoading } = useListTasks();
  const create = useCreateTask({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: ["listTasks"] }) },
  });
  const [form, setForm] = useState({ title: "", status: "To Do" });

  const canWrite = role === "Admin" || role === "PM";

  const handleAdd = () => {
    if (!form.title.trim()) return;
    create.mutate(form, { onSuccess: () => setForm({ title: "", status: "To Do" }) });
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1 text-gray-800">Project Management — Tasks</h1>
      {role === "Employee" && (
        <p className="text-xs text-gray-400 mb-4">Read-only access — you can view tasks but not create them.</p>
      )}
      {!role?.match(/Employee/) && <div className="mb-1" />}

      {canWrite && (
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Task title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
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
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.title}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[t.status] ?? ""}`}>
                    {t.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
              <TableRow><TableCell colSpan={2} className="text-center text-gray-400">No tasks yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
