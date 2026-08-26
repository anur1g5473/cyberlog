'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewPostPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    difficulty: 'Beginner',
    status: 'PUBLISHED',
    tags: 'Security, Web',
    readingTime: 5,
    content: '',
  });

  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, readingTime: Number(formData.readingTime) }),
      });
      if (res.ok) router.push('/admin/dashboard');
      else alert('Failed to create post.');
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

      <TerminalWindow pathLabel="terminal ~ /admin/posts/new">
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <h1 className="text-xl font-bold text-terminal-green">New Security Research Log</h1>

          <div>
            <label className="block text-terminal-muted mb-1">TITLE</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                const title = e.target.value;
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setFormData({ ...formData, title, slug });
              }}
              className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-terminal-muted mb-1">SLUG</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-terminal-muted mb-1">EXCERPT</label>
            <input
              type="text"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-terminal-muted mb-1">DIFFICULTY</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-terminal-muted mb-1">STATUS</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>

            <div>
              <label className="block text-terminal-muted mb-1">READING TIME (MIN)</label>
              <input
                type="number"
                value={formData.readingTime}
                onChange={(e) => setFormData({ ...formData, readingTime: Number(e.target.value) })}
                className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-terminal-muted mb-1">MARKDOWN CONTENT</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full p-3 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              required
            ></textarea>
          </div>

          <button type="submit" disabled={saving} className="px-5 py-2 rounded bg-terminal-green text-black font-bold flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Publish Log'}</span>
          </button>
        </form>
      </TerminalWindow>
    </div>
  );
}
