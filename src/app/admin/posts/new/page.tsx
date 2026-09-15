'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { ArrowLeft, Save } from 'lucide-react';
import { TagItem, serializeBlogTags } from '@/lib/utils/tagUtils';
import { TagManager } from '@/components/admin/TagManager';
import { MarkdownToolbar } from '@/components/admin/MarkdownToolbar';

export default function NewPostPage() {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    difficulty: 'Beginner',
    status: 'PUBLISHED',
    readingTime: 5,
    content: '',
  });

  const [tags, setTags] = useState<TagItem[]>([
    { name: 'Security', color: '#00ff41' },
    { name: 'Web', color: '#00f3ff' },
  ]);

  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = (prefix: string, suffix: string = '', def: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const cur = formData.content;
    const sel = cur.substring(start, end) || def;
    const updated = cur.substring(0, start) + prefix + sel + suffix + cur.substring(end);
    setFormData((p) => ({ ...p, content: updated }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + sel.length);
    }, 50);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: serializeBlogTags(tags),
        readingTime: Number(formData.readingTime) || 5,
      };
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) router.push('/admin/dashboard');
      else alert('Failed to create post in Supabase.');
    } catch (err) {
      console.error(err);
      alert('Network error while saving post.');
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
                min="1"
                value={formData.readingTime}
                onChange={(e) => setFormData({ ...formData, readingTime: Number(e.target.value) })}
                className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              />
            </div>
          </div>

          <TagManager tags={tags} onChange={setTags} />

          <div className="space-y-1.5">
            <label className="block text-terminal-muted font-bold">MARKDOWN CONTENT</label>
            <MarkdownToolbar onInsert={handleInsert} />
            <textarea
              ref={textareaRef}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              placeholder="# Heading&#10;\ Bullet item 1&#10;\ Bullet item 2"
              className="w-full p-3 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none font-mono text-xs leading-relaxed"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded bg-terminal-green text-black font-bold flex items-center gap-2 hover:bg-terminal-green/90 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing to Supabase...' : 'Publish Research Log'}</span>
          </button>
        </form>
      </TerminalWindow>
    </div>
  );
}
