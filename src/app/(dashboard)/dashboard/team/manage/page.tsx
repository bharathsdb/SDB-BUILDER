"use client";

import * as React from "react";
import { Mail, UserMinus, Shield, UserPlus, Clock, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card, Badge, Input, Avatar, Modal } from "@/components/ui";
import { mockTeamMembers, mockActivityLog } from "@/lib/api/mock-db";
import { useUIStore } from "@/lib/stores/ui-store";

const roleColors: Record<string, "info" | "success" | "default"> = {
  Owner: "info",
  Editor: "success",
  Viewer: "default",
};

export default function TeamManagePage() {
  const { addToast } = useUIStore();
  const [members, setMembers] = React.useState(mockTeamMembers);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("Viewer");
  const [removeMember, setRemoveMember] = React.useState<string | null>(null);

  const handleInvite = () => {
    if (!inviteEmail) return;
    const newMember = {
      id: `tm${Date.now()}`,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      avatar: "",
      online: false,
    };
    setMembers([...members, newMember]);
    addToast(`Invitation sent to ${inviteEmail}`, "success");
    setInviteEmail("");
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
    addToast("Member removed from workspace", "info");
    setRemoveMember(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Team Management</h1>
        <p className="text-slate-500">Manage your team members and their roles.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Team Members */}
          <Card>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold">Team Members ({members.length})</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {members.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={member.name} online={member.online} />
                    <div>
                      <p className="font-semibold text-sm">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={roleColors[member.role] || "default"}>{member.role}</Badge>
                    {member.role !== "Owner" && (
                      <Button variant="ghost" size="sm" onClick={() => setRemoveMember(member.id)}>
                        <UserMinus className="w-4 h-4 text-slate-400" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Team Activity Log */}
          <Card>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold flex items-center gap-2">
                <Activity className="w-4 h-4" /> Team Activity
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {mockActivityLog.map((activity, i) => (
                <div key={i} className="flex gap-4">
                  <div className="relative flex-shrink-0 mt-1">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    {i !== mockActivityLog.length - 1 && (
                      <div className="absolute top-4 bottom-[-16px] left-1/2 w-px bg-slate-200 dark:bg-slate-800" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Invite Form Sidebar */}
        <div className="space-y-6">
          <Card>
            <div className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Invite Member
              </h3>
              <div className="space-y-4">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  >
                    <option value="Viewer">Viewer - Can view projects</option>
                    <option value="Editor">Editor - Can edit projects</option>
                    <option value="Owner">Owner - Full access</option>
                  </select>
                </div>
                <Button className="w-full" onClick={handleInvite}>
                  <Mail className="w-4 h-4" /> Send Invitation
                </Button>
              </div>
            </div>
          </Card>

          {/* Role Info */}
          <Card>
            <div className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Role Permissions
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Badge variant="info">Owner</Badge>
                  <p className="text-slate-500">Full access to all projects, billing, and team management.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="success">Editor</Badge>
                  <p className="text-slate-500">Can create and edit projects, generate plans, and export.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="default">Viewer</Badge>
                  <p className="text-slate-500">Read-only access to projects and exports.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <Modal isOpen={removeMember !== null} onClose={() => setRemoveMember(null)} title="Remove Member" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Are you sure you want to remove this member from your workspace? They will lose access to all shared projects.</p>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => removeMember && handleRemove(removeMember)}>Remove</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setRemoveMember(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
