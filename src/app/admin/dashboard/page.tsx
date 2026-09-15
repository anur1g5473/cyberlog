'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { Plus, Edit, Trash2, LogOut, ShieldAlert, FolderPlus, FileText, Mail } from 'lucide-react';
import { ContactDetails } from '@/lib/db/contact';

export default function AdminDashboardPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [contact, setContact] = useState<ContactDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const [postsRes, projectsRes, contactRes] = await Promise.all([
          fetch('/api/posts?admin=true'),
          fetch('/api/projects'),
          fetch('/api/contact'),
        ]);

        if (postsRes.status === 401) {
          router.push('/admin/login');
          return;
        }

        if (postsRes.ok) setPosts(await postsRes.json());
        if (projectsRes.ok) setProjects(await projectsRes.json());
        if (contactRes.ok) setContact(await contactRes.json());
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
    <div className="space-y-6">
      <div className="flex items-center justify-between font-mono text-xs">
        <div className="flex items-center gap-2 text-terminal-green">
          <ShieldAlert className="w-4 h-4" />
          <span className="font-bold">ROOT SECURITY PORTAL</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1 rounded border border-terminal-red/30 bg-terminal-red/10 text-terminal-red hover:bg-terminal-red/20 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Session</span>
        </button>
      </div>

      {/* Contact & Identity Endpoints Card */}
      <div className="p-4 rounded-xl border border-terminal-green/30 bg-black/60 font-mono text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-terminal-green font-bold">
            <Mail className="w-4 h-4" />
            <span>Public Contact Endpoints</span>
          </div>
          <div className="text-terminal-muted text-[11px]">
            Official: <span className="text-terminal-text">{contact?.officialEmail || 'anuragsoni5473@gmail.com'}</span> | VIT: <span className="text-cyan-400">{contact?.vitEmail || 'anurag.soni2025@vitstudent.ac.in'}</span>
          </div>
        </div>
        <Link
          href="/admin/contact"
          className="px-3 py-1.5 rounded bg-terminal-green/10 border border-terminal-green/30 text-terminal-green hover:bg-terminal-green/20 transition flex items-center gap-1.5 text-[11px]"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit Contact Details</span>
        </Link>
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
        </div>
      </TerminalWindow>
    </div>
  );
}
