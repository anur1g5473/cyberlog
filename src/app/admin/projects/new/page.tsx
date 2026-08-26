'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewProjectPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    techStack: 'Next.js, TypeScript, Tailwind CSS',
    githubUrl: 'https://github.com/anurag/',
    demoUrl: '',
    category: 'Web Security',
    featured: true,
  });

  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) router.push('/admin/dashboard');
      else alert('Failed to create project.');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-green hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>back to dashboard</span>
      </Link>

      <TerminalWindow pathLabel="terminal ~ /admin/projects/new">
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <h1 className="text-xl font-bold text-terminal-green">Add New Security Project</h1>

          <div>
            <label className="block text-terminal-muted mb-1">PROJECT TITLE</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-terminal-muted mb-1">DESCRIPTION</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-terminal-muted mb-1">TECH STACK (COMMA SEPARATED)</label>
              <input
                type="text"
                value={formData.techStack}
                onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-terminal-muted mb-1">CATEGORY</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-terminal-muted mb-1">GITHUB REPOSITORY URL</label>
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-terminal-muted mb-1">LIVE DEMO URL (OPTIONAL)</label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="px-5 py-2 rounded bg-terminal-green text-black font-bold flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Creating...' : 'Save Project'}</span>
          </button>
        </form>
      </TerminalWindow>
    </div>
  );
}
