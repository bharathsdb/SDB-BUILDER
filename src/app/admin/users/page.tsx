"use client";

import * as React from "react";
import { Search, Edit3, Trash2, Ban, Check, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Input, Modal } from "@/components/ui";
import { mockUsers } from "@/lib/api/mock-db";
import type { User } from "@/lib/api/mock-db";
import { useUIStore } from "@/lib/stores/ui-store";

const roleVariants: Record<string, "info" | "success" | "default" | "warning" | "danger"> = {
  user: "default",
  admin: "danger",
  architect: "info",
  builder: "warning",
};

const planVariants: Record<string, "info" | "success" | "default"> = {
  free: "default",
  pro: "info",
  enterprise: "success",
};

const ITEMS_PER_PAGE = 8;

export default function AdminUsersPage() {
  const { addToast } = useUIStore();
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [suspendModal, setSuspendModal] = React.useState<string | null>(null);
  const [deleteModal, setDeleteModal] = React.useState<string | null>(null);
  const [users, setUsers] = React.useState(mockUsers);

  const filtered = users.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleDelete = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
    addToast("User permanently deleted", "info");
    setDeleteModal(null);
  };

  const handleSuspend = (id: string) => {
    addToast("User has been suspended", "info");
    setSuspendModal(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
        <p className="text-zinc-400">Manage all platform users, their roles, and status.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-zinc-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="architect">Architect</option>
          <option value="builder">Builder</option>
        </select>
      </div>

      {/* Users Table */}
      <Card className="overflow-hidden !bg-zinc-900 !border-zinc-800">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left p-4 font-semibold text-zinc-400">User</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Email</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Role</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Plan</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Joined</th>
                <th className="text-left p-4 font-semibold text-zinc-400">Status</th>
                <th className="text-right p-4 font-semibold text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400">{user.email}</td>
                  <td className="p-4"><Badge variant={roleVariants[user.role]}>{user.role}</Badge></td>
                  <td className="p-4"><Badge variant={planVariants[user.plan]}>{user.plan}</Badge></td>
                  <td className="p-4 text-zinc-400">{user.createdAt}</td>
                  <td className="p-4">
                    <Badge variant={user.verified ? "success" : "warning"}>{user.verified ? "Active" : "Pending"}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => addToast("Edit user modal opened", "info")}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setSuspendModal(user.id)}>
                        <Ban className="w-4 h-4 text-amber-400" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteModal(user.id)}>
                        <Trash2 className="w-4 h-4 text-danger" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
          <p className="text-sm text-zinc-500">Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-primary text-white" : "text-zinc-400 hover:bg-zinc-800"}`}
              >
                {i + 1}
              </button>
            ))}
            <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Suspend Modal */}
      <Modal isOpen={suspendModal !== null} onClose={() => setSuspendModal(null)} title="Suspend User" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Are you sure you want to suspend this user? They will lose access to their account until reinstated.</p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => suspendModal && handleSuspend(suspendModal)}>Suspend</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setSuspendModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal !== null} onClose={() => setDeleteModal(null)} title="Delete User" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Are you sure you want to permanently delete this user? This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => deleteModal && handleDelete(deleteModal)}>Delete</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
