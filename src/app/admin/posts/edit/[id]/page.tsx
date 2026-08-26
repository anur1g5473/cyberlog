'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    difficulty: 'Beginner',
    status: 'PUBLISHED',
    tags: 'Web, Security',
    readingTime: 5,
    content: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

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
            tags: post.tags || '',
            readingTime: post.readingTime || 5,
            content: post.content || '',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/posts/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, readingTime: Number(formData.readingTime) }),
      });

      if (res.ok) router.push('/admin/dashboard');
      else alert('Failed to update post.');
    } catch (err) {
      console.error(err);
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
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-terminal-green">Edit Security Research Log</h1>
            <button type="button" onClick={handleDelete} className="px-3 py-1.5 rounded border border-terminal-red/40 bg-terminal-red/10 text-terminal-red flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div>
            <label className="block text-terminal-muted mb-1">TITLE</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-terminal-muted mb-1">MARKDOWN CONTENT</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full p-3 rounded border border-terminal-green/30 bg-black text-terminal-text focus:outline-none"
              required
            ></textarea>
          </div>

          <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-terminal-green text-black font-bold">
            {saving ? 'Updating...' : 'Update Log'}
          </button>
        </form>
      </TerminalWindow>
    </div>
  );
}
