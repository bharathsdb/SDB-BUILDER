"use client";

import * as React from "react";
import { User, Bell, Shield, Palette, Layout, Globe, Moon, Eye, Smartphone, Mail, LogOut } from "lucide-react";
import { Button, Card, Badge, Input, Modal } from "@/components/ui";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore();
  const { addToast } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = React.useState("profile");
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [bio, setBio] = React.useState("Principal architect specializing in modern residential designs.");
  const [language, setLanguage] = React.useState("en");
  const [units, setUnits] = React.useState("imperial");
  const [notifications, setNotifications] = React.useState({ email: true, push: true, inApp: true, marketing: false });

  const tabs = [
    { id: "profile", name: "Profile", icon: User, description: "Personal information" },
    { id: "account", name: "Account", icon: Layout, description: "Account management" },
    { id: "preferences", name: "Preferences", icon: Palette, description: "Appearance & language" },
    { id: "notifications", name: "Notifications", icon: Bell, description: "Notification preferences" },
    { id: "security", name: "Security", icon: Shield, description: "Password & security" },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-slate-500">Manage your account settings and preferences.</p>
      </div>

      <div className="mt-8 flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-slate-100 dark:bg-slate-800 text-foreground"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-foreground"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-primary" : ""}`} />
              <div className="text-left">
                <p className="text-sm font-medium">{tab.name}</p>
                <p className="text-xs text-slate-400">{tab.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1 glass-card dark:glass-card-dark border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 min-h-[500px]">

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold">Profile Details</h3>
                <p className="text-sm text-slate-500 mb-6">Update your personal information and public profile.</p>
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-2xl text-slate-500">
                    {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                  </div>
                  <div className="space-x-3">
                    <Button size="sm">Upload Avatar</Button>
                    <Button size="sm" variant="secondary">Remove</Button>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium">Bio</label>
                    <textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <Button onClick={() => { updateProfile({ name }); addToast("Profile updated successfully", "success"); }}>Save Changes</Button>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold">Account Management</h3>
                <p className="text-sm text-slate-500 mb-6">Manage your account settings and data.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div>
                      <h4 className="font-semibold">Account Type</h4>
                      <p className="text-sm text-slate-500">You are on the <strong>Pro</strong> plan</p>
                    </div>
                    <Badge variant="info">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div>
                      <h4 className="font-semibold">Member Since</h4>
                      <p className="text-sm text-slate-500">{user?.createdAt || "January 2025"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div>
                      <h4 className="font-semibold text-danger">Danger Zone</h4>
                      <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>Delete Account</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold">Preferences</h3>
                <p className="text-sm text-slate-500 mb-6">Customize your experience.</p>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Moon className="w-5 h-5 text-slate-400" />
                      <div>
                        <h4 className="font-semibold">Theme</h4>
                        <p className="text-sm text-slate-500">Choose your preferred color scheme</p>
                      </div>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      <button onClick={() => setTheme("light")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${theme === "light" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>Light</button>
                      <button onClick={() => setTheme("dark")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${theme === "dark" ? "bg-slate-900 text-white shadow" : "text-slate-500"}`}>Dark</button>
                      <button onClick={() => setTheme("system")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${theme === "system" ? "bg-white dark:bg-slate-900 text-foreground shadow" : "text-slate-500"}`}>System</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-slate-400" />
                      <div>
                        <h4 className="font-semibold">Language</h4>
                        <p className="text-sm text-slate-500">Select your preferred language</p>
                      </div>
                    </div>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-sm">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Layout className="w-5 h-5 text-slate-400" />
                      <div>
                        <h4 className="font-semibold">Units</h4>
                        <p className="text-sm text-slate-500">Measurement system for projects</p>
                      </div>
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      <button onClick={() => setUnits("imperial")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${units === "imperial" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>Imperial</button>
                      <button onClick={() => setUnits("metric")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${units === "metric" ? "bg-white text-slate-900 shadow" : "text-slate-500"}`}>Metric</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold">Notification Preferences</h3>
                <p className="text-sm text-slate-500 mb-6">Control which notifications you receive.</p>
                <div className="space-y-4">
                  {[
                    { key: "email", label: "Email Notifications", desc: "Receive updates via email", icon: Smartphone },
                    { key: "push", label: "Push Notifications", desc: "Receive push notifications in browser", icon: Bell },
                    { key: "inApp", label: "In-App Notifications", desc: "Show notifications within the app", icon: Eye },
                    { key: "marketing", label: "Marketing Emails", desc: "Receive product updates and offers", icon: Mail },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-slate-400" />
                        <div>
                          <h4 className="font-semibold">{item.label}</h4>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifications[item.key as keyof typeof notifications] ? "translate-x-6" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold">Security</h3>
                <p className="text-sm text-slate-500 mb-6">Manage your password and security settings.</p>
                <div className="space-y-6">
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <h4 className="font-semibold mb-4">Change Password</h4>
                    <div className="space-y-4">
                      <Input label="Current password" type="password" placeholder="Enter current password" />
                      <Input label="New password" type="password" placeholder="Enter new password" />
                      <Input label="Confirm new password" type="password" placeholder="Confirm new password" />
                      <Button size="sm" onClick={() => addToast("Password updated successfully", "success")}>Update Password</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-400" />
                      <div>
                        <h4 className="font-semibold">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => addToast("2FA settings updated", "success")}>
                      Enable
                    </Button>
                  </div>
                  <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <h4 className="font-semibold mb-4">Active Sessions</h4>
                    <div className="space-y-3">
                      {[
                        { device: "Chrome on Windows", location: "San Francisco, US", active: true, time: "Current session" },
                        { device: "Safari on iPhone", location: "San Francisco, US", active: false, time: "Last active 2h ago" },
                        { device: "Firefox on MacOS", location: "New York, US", active: false, time: "Last active 3d ago" },
                      ].map((session, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                          <div className="flex items-center gap-3">
                            <Smartphone className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium">{session.device}</p>
                              <p className="text-xs text-slate-500">{session.location} - {session.time}</p>
                            </div>
                          </div>
                          {session.active ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => addToast("Session revoked", "info")}>Revoke</Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account" size="sm">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-danger/10 border border-danger/20 rounded-xl">
            <LogOut className="w-5 h-5 text-danger shrink-0" />
            <p className="text-sm text-danger font-medium">This action is irreversible!</p>
          </div>
          <p className="text-sm text-slate-500">Are you absolutely sure you want to delete your account? All your projects, data, and team memberships will be permanently removed.</p>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type &quot;delete&quot; to confirm</label>
            <input type="text" placeholder='Type "delete" to confirm' className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent focus:outline-none focus:ring-2 focus:ring-danger/50 text-sm" />
          </div>
          <div className="flex gap-3">
            <Button variant="danger" className="flex-1" onClick={() => { addToast("Account deletion request submitted", "info"); setShowDeleteModal(false); }}>Delete My Account</Button>
            <Button variant="secondary" className="flex-1" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
