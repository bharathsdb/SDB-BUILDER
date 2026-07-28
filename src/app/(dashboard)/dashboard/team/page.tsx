"use client";

import * as React from "react";
import {
  Users, UserPlus, Mail, Activity, Settings, Shield,
  Edit3, Eye, Circle, MoreHorizontal, Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { mockTeamMembers, mockActivityLog } from "@/lib/api/mock-db";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/lib/stores/ui-store";

const roleIcon: Record<string, typeof Shield> = {
  Owner: Shield,
  Editor: Edit3,
  Viewer: Eye,
};

export default function TeamPage() {
  const { addToast } = useUIStore();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("Editor");

  const handleInvite = () => {
    if (!inviteEmail) return;
    addToast(`Invitation sent to ${inviteEmail}`, "success");
    setInviteOpen(false);
    setInviteEmail("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Team Workspace
          </h1>
          <p className="text-slate-500 text-sm mt-1">{mockTeamMembers.length} team members</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Team Members</h2>
                <span className="text-xs text-slate-400">{mockTeamMembers.filter((m) => m.online).length} online</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {mockTeamMembers.map((member) => {
                const RoleIcon = roleIcon[member.role] || Shield;
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-sm">
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      {member.online && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-white dark:border-zinc-900" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{member.name}</p>
                        <Badge variant={member.online ? "success" : "default"}>
                          <Circle className={`w-2 h-2 ${member.online ? "fill-current" : ""}`} />
                          {member.online ? "Online" : "Offline"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <RoleIcon className="w-3.5 h-3.5" />
                        {member.role}
                      </span>
                      <button className="p-1.5 text-slate-400 hover:text-foreground rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Activity Feed
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Workspace Settings
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Workspace Name</label>
                <p className="font-medium text-sm mt-1">Personal Workspace</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</label>
                <p className="font-medium text-sm mt-1 flex items-center gap-2">
                  Pro
                  <Badge variant="info">Active</Badge>
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Member Limit</label>
                <p className="font-medium text-sm mt-1">{mockTeamMembers.length} / 10 members</p>
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4" />
                  Manage Workspace
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold">Quick Actions</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="secondary" className="w-full justify-start" onClick={() => addToast("Workspace link copied", "info")}>
                <Mail className="w-4 h-4" />
                Copy invite link
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Settings className="w-4 h-4" />
                Permissions
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Activity className="w-4 h-4" />
                Export activity log
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Team Member" size="sm">
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            >
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!inviteEmail}>
              <UserPlus className="w-4 h-4" />
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
