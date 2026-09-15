'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { ArrowLeft, Save, Trash2, Eye } from 'lucide-react';
import { TagItem, parseBlogTags, serializeBlogTags } from '@/lib/utils/tagUtils';
import { TagManager } from '@/components/admin/TagManager';
import { MarkdownToolbar } from '@/components/admin/MarkdownToolbar';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    difficulty: 'Beginner',
    status: 'PUBLISHED',
    readingTime: 5,
    content: '',
  });

  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch('/api/posts?admin=true');
        const posts = await res.json();
        const post = posts.find((p: any) => p.id === params.id);
        if (post) {
          setFormData({
            title: post.title || '',
            slug: post.slug || '',
            excerpt: post.excerpt || '',
            difficulty: post.difficulty || 'Beginner',
            status: post.status || 'PUBLISHED',
            readingTime: post.readingTime || 5,
            content: post.content || '',
          });
          setTags(parseBlogTags(post.tags));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [params.id]);

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

      const res = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) router.push('/admin/dashboard');
      else alert('Failed to update post in Supabase.');
    } catch (err) {
      console.error(err);
      alert('Network error while saving post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this security post?')) return;
    try {
      const res = await fetch(`/api/posts/${params.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/admin/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="font-mono text-xs text-terminal-muted p-12 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/dashboard" className="inline-flex items-center gap-1.5 font-mono text-xs text-terminal-green hover:underline">
        <ArrowLeft className="w-4 h-4" />
        <span>back to dashboard</span>
      </Link>

      <TerminalWindow pathLabel={`terminal ~ /admin/posts/edit/${params.id}`}>
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-terminal-green/20 pb-2">
            <h1 className="text-xl font-bold text-terminal-green">Edit Security Research Log</h1>
            <div className="flex items-center gap-2">
              <Link href={`/blog/${formData.slug}`} target="_blank" className="px-3 py-1.5 rounded border border-terminal-green/30 bg-terminal-green/10 text-terminal-green flex items-center gap-1 hover:bg-terminal-green/20">
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </Link>
              <button type="button" onClick={handleDelete} className="px-3 py-1.5 rounded border border-terminal-red/40 bg-terminal-red/10 text-terminal-red flex items-center gap-1 hover:bg-terminal-red/20">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-terminal-muted mb-1 font-bold">TITLE</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          <div>
            <label className="block text-terminal-muted mb-1">EXCERPT</label>
            <input
              type="text"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            <span>{saving ? 'Updating in Supabase...' : 'Save & Update Post'}</span>
          </button>
        </form>
      </TerminalWindow>
    </div>
  );
}
