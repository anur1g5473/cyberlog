'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import {
  Plus,
  Edit,
  Trash2,
  LogOut,
  ShieldAlert,
  FolderPlus,
  FileText,
  Mail,
  Activity,
  ArrowRight,
  Zap,
  BookOpen,
  GraduationCap,
  Briefcase,
  Radio,
} from 'lucide-react';
import { ContactDetails } from '@/lib/db/contact';
import { NowData } from '@/lib/db/now';
import { InactivityLockout } from '@/components/admin/InactivityLockout';
import { AuditLogViewer } from '@/components/admin/AuditLogViewer';
import { TotpSetupModal } from '@/components/admin/TotpSetupModal';


export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [contact, setContact] = useState<ContactDetails | null>(null);
  const [nowData, setNowData] = useState<NowData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [postsRes, projectsRes, contactRes, nowRes] = await Promise.all([
          fetch('/api/posts?admin=true'),
          fetch('/api/projects'),
          fetch('/api/contact'),
          fetch('/api/now'),
        ]);

        if (postsRes.status === 401) {
          router.push('/admin/login');
          return;
        }

        if (postsRes.ok) setPosts(await postsRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
        if (contactRes.ok) setContact(await contactRes.json());
        if (nowRes.ok) setNowData(await nowRes.json());
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);


  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(posts.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-terminal-muted animate-pulse">
        Authenticating Root Session...
      </div>
    );
  }

  return (
    <InactivityLockout>
      <div className="space-y-6">
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2 text-terminal-green">
            <ShieldAlert className="w-4 h-4" />
            <span className="font-bold">ROOT SECURITY PORTAL</span>
          </div>
          <div className="flex items-center gap-2">
            <TotpSetupModal />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-terminal-red/30 bg-terminal-red/10 text-terminal-red hover:bg-terminal-red/20 transition font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-terminal-red/30 bg-terminal-red/10 text-terminal-red hover:bg-terminal-red/20 transition-all font-bold"


      {/* Telemetry & Identity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* /now Telemetry Status Card */}
        <div className="p-4 rounded-xl border border-terminal-green/30 bg-black/60 font-mono text-xs flex flex-col justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-terminal-green font-bold">
                <Activity className="w-4 h-4" />
                <span>/NOW STATUS TELEMETRY</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-terminal-green/10 text-terminal-green border border-terminal-green/30">
                {nowData?.items?.length ?? 0} ACTIVE
              </span>
            </div>

            <p className="text-terminal-muted line-clamp-2">
              {nowData?.settings?.currentFocus || 'Manage ongoing projects, books, subjects, and internships.'}
            </p>

            {nowData?.items && nowData.items.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-terminal-muted">
                <span className="flex items-center gap-1 text-terminal-green">
                  <Zap className="w-3 h-3" />
                  {nowData.items.filter((i) => i.category === 'working_on').length} Working
                </span>
                <span className="flex items-center gap-1 text-purple-400">
                  <BookOpen className="w-3 h-3" />
                  {nowData.items.filter((i) => i.category === 'reading').length} Reading
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <GraduationCap className="w-3 h-3" />
                  {nowData.items.filter((i) => i.category === 'subject').length} Subjects
                </span>
                <span className="flex items-center gap-1 text-terminal-amber">
                  <Briefcase className="w-3 h-3" />
                  {nowData.items.filter((i) => i.category === 'internship').length} Internships
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-terminal-green/10 flex items-center justify-between">
            <span className="text-[10px] text-terminal-muted">
              Synced: {nowData?.settings?.lastUpdated ? new Date(nowData.settings.lastUpdated).toLocaleDateString() : 'N/A'}
            </span>
            <Link
              href="/admin/now"
              className="inline-flex items-center gap-1 text-terminal-green hover:underline font-bold"
            >
              <span>Manage /now Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Contact & Identity Endpoints Card */}
        <div className="p-4 rounded-xl border border-terminal-green/30 bg-black/60 font-mono text-xs flex flex-col justify-between gap-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-terminal-green font-bold">
                <Mail className="w-4 h-4" />
                <span>IDENTITY &amp; CONTACT MATRIX</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-terminal-green/10 text-terminal-green border border-terminal-green/30">
                {contact?.channels?.filter((c) => c.visible !== false).length ?? 0} ACTIVE
              </span>
            </div>
            <p className="text-terminal-muted line-clamp-2">
              {contact?.bio || 'Manage contact endpoints, social links, and security keys.'}
            </p>
            <div className="text-[10px] text-terminal-muted truncate">
              Inbox: {contact?.officialEmail || 'anuragsoni5473@gmail.com'}
            </div>
          </div>

          <div className="pt-2 border-t border-terminal-green/10 flex items-center justify-between">
            <span className="text-[10px] text-terminal-muted">
              Location: {contact?.location || 'Vellore'}
            </span>
            <Link
              href="/admin/contact"
              className="inline-flex items-center gap-1 text-terminal-green hover:underline font-bold"
            >
              <span>Edit Contact Info</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <TerminalWindow pathLabel="root@cyberlog:~# dashboard">
        <div className="space-y-8 font-mono text-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-terminal-green" />
                <h2 className="text-sm font-bold text-terminal-green">Security Logs ({posts.length})</h2>
              </div>
              <Link href="/admin/posts/new" className="flex items-center gap-1 px-2.5 py-1 rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green hover:bg-terminal-green/20">
                <Plus className="w-3.5 h-3.5" />
                <span>New Log</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-terminal-green/10 text-terminal-muted">
                    <th className="py-2 px-2">TITLE</th>
                    <th className="py-2 px-2">DIFFICULTY</th>
                    <th className="py-2 px-2">STATUS</th>
                    <th className="py-2 px-2 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-terminal-green/5">
                      <td className="py-2 px-2 font-bold">{post.title}</td>
                      <td className="py-2 px-2 text-terminal-muted">{post.difficulty}</td>
                      <td className="py-2 px-2 text-terminal-green">{post.status}</td>
                      <td className="py-2 px-2 text-right space-x-2">
                        <Link href={`/admin/posts/edit/${post.id}`} className="text-terminal-green hover:underline">Edit</Link>
                        <button onClick={() => handleDeletePost(post.id)} className="text-terminal-red hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Projects Section */}
          <div className="space-y-4 pt-4 border-t border-terminal-green/10">
            <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-terminal-green" />
                <h2 className="text-sm font-bold text-terminal-green">Security Projects ({projects.length})</h2>
              </div>
              <Link href="/admin/projects/new" className="flex items-center gap-1 px-2.5 py-1 rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green hover:bg-terminal-green/20">
                <Plus className="w-3.5 h-3.5" />
                <span>New Project</span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-terminal-green/10 text-terminal-muted">
                    <th className="py-2 px-2">TITLE</th>
                    <th className="py-2 px-2">CATEGORY</th>
                    <th className="py-2 px-2">FEATURED</th>
                    <th className="py-2 px-2 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-3 text-center text-terminal-muted">No projects found.</td>
                    </tr>
                  ) : (
                    projects.map((proj) => (
                      <tr key={proj.id} className="border-b border-terminal-green/5">
                        <td className="py-2 px-2 font-bold">{proj.title}</td>
                        <td className="py-2 px-2 text-terminal-muted">{proj.category}</td>
                        <td className="py-2 px-2">
                          {proj.featured ? (
                            <span className="text-terminal-amber font-bold text-[10px] px-1.5 py-0.5 rounded border border-terminal-amber/30 bg-terminal-amber/10">YES</span>
                          ) : (
                            <span className="text-terminal-muted text-[10px]">NO</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-right space-x-2">
                          <Link href={`/admin/projects/edit/${proj.id}`} className="text-terminal-green hover:underline">Edit</Link>
                          <button onClick={() => handleDeleteProject(proj.id)} className="text-terminal-red hover:underline">Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Immutable Security Audit Trail */}
          <AuditLogViewer />
        </div>
      </TerminalWindow>
    </div>
  </InactivityLockout>
  );
}
