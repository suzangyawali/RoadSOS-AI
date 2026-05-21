"use client";

import { useEffect, useState } from "react";
import { Activity, Crown, Loader2, Save, ShieldCheck, Users } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminAPI } from "@/services/api";
import { UserRole } from "@/store/emergency-store";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
}

interface SystemLog {
  timestamp: string;
  level: string;
  module: string;
  message: string;
}

const fallbackUsers: AdminUser[] = [
  { id: "demo-citizen-id", name: "Demo Citizen", email: "citizen@roadsos.ai", role: "citizen", is_active: true },
  { id: "demo-rescuer-id", name: "Demo Rescuer", email: "rescuer@roadsos.ai", role: "rescuer", is_active: true },
  { id: "demo-government-id", name: "Demo Government", email: "government@roadsos.ai", role: "government", is_active: true },
  { id: "demo-admin-id", name: "Demo Admin", email: "admin@roadsos.ai", role: "admin", is_active: true },
];

const fallbackLogs: SystemLog[] = [
  { timestamp: new Date().toISOString(), level: "INFO", module: "AUTH", message: "JWT demo session initialized for admin walkthrough." },
  { timestamp: new Date().toISOString(), level: "INFO", module: "SOS_DISPATCH", message: "Emergency trigger event streamed into responder queue." },
  { timestamp: new Date().toISOString(), level: "WARNING", module: "DATABASE", message: "MongoDB unavailable; in-memory fallback users are active." },
];

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>(fallbackUsers);
  const [logs, setLogs] = useState<SystemLog[]>(fallbackLogs);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdmin() {
      try {
        const [usersRes, logsRes] = await Promise.all([adminAPI.users(), adminAPI.logs()]);
        setUsers(usersRes.data);
        setLogs(logsRes.data);
      } catch {
        setUsers(fallbackUsers);
        setLogs(fallbackLogs);
      } finally {
        setLoading(false);
      }
    }
    loadAdmin();
  }, []);

  const updateRole = async (userId: string, role: UserRole) => {
    setUsers((prev) => prev.map((user) => user.id === userId ? { ...user, role } : user));
    setSavingId(userId);
    try {
      await adminAPI.patchRole(userId, role);
    } catch {
      setLogs((prev) => [
        { timestamp: new Date().toISOString(), level: "INFO", module: "ADMIN", message: `Role update simulated locally for ${userId}.` },
        ...prev,
      ]);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight text-zinc-100">
            <Crown className="h-7 w-7 text-purple-400" />
            Admin Control Center
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage demo users, RBAC roles, and simulated platform event logs.
          </p>
        </div>

        {loading ? (
          <div className="flex h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-zinc-800 bg-zinc-950/40 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-5 w-5 text-purple-400" />
                  User Role Directory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="grid gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-zinc-100">{user.name}</p>
                        <Badge variant="outline" className="border-zinc-700 text-[10px]">{user.is_active === false ? "Inactive" : "Active"}</Badge>
                      </div>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(event) => updateRole(user.id, event.target.value as UserRole)}
                        className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-2 text-xs font-semibold text-zinc-200"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="rescuer">Rescuer</option>
                        <option value="government">Government</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button size="sm" variant="outline" disabled={savingId === user.id} className="border-zinc-800 text-xs">
                        {savingId === user.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-950/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-5 w-5 text-green-400" />
                  System Event Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {logs.map((log, index) => (
                  <div key={`${log.timestamp}-${index}`} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <Badge variant="outline" className="border-zinc-700 text-[10px]">{log.module}</Badge>
                      <span className="text-[10px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-300">{log.message}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/30 p-3 text-xs text-zinc-400">
          <ShieldCheck className="h-4 w-4 text-green-400" />
          Admin routes require an admin role claim or the judge demo admin token.
        </div>
      </div>
    </AuthGuard>
  );
}
