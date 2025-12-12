"use client";

import { useEffect, useState } from "react";
import apiFetch from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: "active" | "suspended" | "inactive";
  created_at: string;
  subscription?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<
    "all" | "explorer" | "partner" | "admin"
  >("all");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch("/api/admin/users");
        if (res?.success) setUsers(res.data || []);
        else console.error(res?.error || "Failed to load users");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleAdmin = async (id: string, isAdmin: boolean) => {
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({ is_admin: !isAdmin }),
      });
      if (res?.success)
        setUsers(users.map((u) => (u.id === id ? res.data : u)));
      else alert(res?.error || "Failed");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuspend = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";
    try {
      const res = await apiFetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res?.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, status: newStatus as any } : u
          )
        );
      } else {
        alert(res?.error || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Error updating user");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this user permanently?")) return;
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (res?.success) setUsers(users.filter((u) => u.id !== id));
      else alert(res?.error || "Failed");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const statusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      inactive: "bg-gray-100 text-gray-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-12">
        <p>Loading users...</p>
      </div>
    );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600">Manage user accounts and permissions</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Search Users
            </label>
            <Input
              type="text"
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Filter by Role
            </label>
            <select
              value={filterRole}
              onChange={(e) =>
                setFilterRole(e.target.value as typeof filterRole)
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="all">All Roles</option>
              <option value="explorer">Explorer</option>
              <option value="partner">Partner</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <Card key={u.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{u.full_name}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${statusBadge(
                        u.status
                      )}`}
                    >
                      {u.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{u.email}</p>
                  <div className="flex gap-6 text-sm text-gray-500">
                    <span>
                      📅 Joined {new Date(u.created_at).toLocaleDateString()}
                    </span>
                    {u.subscription && <span>💳 {u.subscription}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSuspend(u.id, u.status)}
                    className={`${
                      u.status === "suspended"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } text-white`}
                  >
                    {u.status === "suspended" ? "Unsuspend" : "Suspend"}
                  </Button>
                  <Button
                    onClick={() => toggleAdmin(u.id, u.role === "admin")}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    {u.role === "admin" ? "Demote" : "Promote"}
                  </Button>
                  <Button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No users found</p>
        </Card>
      )}
    </div>
  );
}
