'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ArrowLeft, Save, Trash2, FolderGit2, Eye } from 'lucide-react';

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: 'Next.js, TypeScript, Tailwind CSS',
    githubUrl: 'https://github.com/anurag/',
    demoUrl: '',
    category: 'Web Security',
    featured: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (res.ok) {
          const proj = await res.json();
          setFormData({
            title: proj.title || '',
            description: proj.description || '',
            techStack: proj.techStack || '',
            githubUrl: proj.githubUrl || '',
            demoUrl: proj.demoUrl || '',
            category: proj.category || 'Web Security',
            featured: Boolean(proj.featured),
          });
        } else {
          const allRes = await fetch('/api/projects');
          if (allRes.ok) {
            const list = await allRes.json();
            const proj = list.find((p: any) => p.id === params.id);
            if (proj) {
              setFormData({
                title: proj.title || '',
                description: proj.description || '',
                techStack: proj.techStack || '',
                githubUrl: proj.githubUrl || '',
                demoUrl: proj.demoUrl || '',
                category: proj.category || 'Web Security',
                featured: Boolean(proj.featured),
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load project', err);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        alert('Failed to update project.');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating project.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this security project?')) return;
    try {
      const res = await fetch(`/api/projects/${params.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        alert('Failed to delete project.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-xs text-terminal-muted animate-pulse">
        Fetching Project Metadata [{params.id}]...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-green hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>back to dashboard</span>
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          className="px-3 py-1 rounded border border-terminal-red/40 bg-terminal-red/10 text-terminal-red font-mono text-xs hover:bg-terminal-red/20 transition flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <TerminalWindow pathLabel={`terminal ~ /admin/projects/edit/${params.id.slice(0, 8)}...`}>
            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 border-b border-terminal-green/20 pb-3">
                <FolderGit2 className="w-4 h-4 text-terminal-green" />
                <h1 className="text-base font-bold text-terminal-green">Edit Security Project</h1>
              </div>

              <div>
                <label className="block text-terminal-muted mb-1 font-bold">PROJECT TITLE</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. ThreatScope: Scanner"
                  className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-terminal-muted mb-1 font-bold">CATEGORY</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-terminal-muted mb-1 font-bold">TECH STACK</label>
                  <input
                    type="text"
                    value={formData.techStack}
                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                    className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-terminal-muted mb-1 font-bold">DESCRIPTION</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-terminal-muted mb-1 font-bold">GITHUB REPO URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-terminal-muted mb-1 font-bold">LIVE DEMO URL (OPTIONAL)</label>
                  <input
                    type="url"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                    className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none focus:border-terminal-green"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg border border-terminal-green/20 bg-terminal-green/5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-terminal-green block">Feature on Showcase</span>
                  <span className="text-terminal-muted text-[11px]">Pin this project on the homepage & projects highlight</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-black rounded-full peer border border-terminal-green/40 peer-checked:after:translate-x-full peer-checked:after:border-black after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-terminal-muted peer-checked:after:bg-black after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-terminal-green"></div>
                </label>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded bg-terminal-green text-black font-bold flex items-center gap-2 hover:bg-terminal-green/90 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Updating Project...' : 'Save Changes'}</span>
                </button>
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2.5 rounded border border-terminal-green/30 text-terminal-muted hover:text-terminal-text hover:bg-terminal-green/5 transition"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </TerminalWindow>
        </div>

        <div className="lg:col-span-5 space-y-3 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-terminal-muted">
            <Eye className="w-3.5 h-3.5 text-terminal-green" />
            <span>LIVE CARD PREVIEW</span>
          </div>
          <ProjectCard
            project={{
              id: params.id,
              title: formData.title || 'Untitled Security Project',
              description: formData.description || 'Project description will appear here as you type...',
              techStack: formData.techStack || 'Security, Tooling',
              githubUrl: formData.githubUrl,
              demoUrl: formData.demoUrl || null,
              category: formData.category || 'Security Tool',
              featured: formData.featured,
            }}
          />
        </div>
      </div>
    </div>
  );
}
