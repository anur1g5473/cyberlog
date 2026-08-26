'use client';

import React from 'react';
import Link from 'next/link';
import { TagPill } from './TagPill';
import { formatDate } from '@/lib/utils/dateFormatter';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';

export interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  tags: string;
  difficulty: string;
  readingTime: number;
  createdAt: Date | string;
}

interface PostCardProps {
  post: PostData;
}

export function PostCard({ post }: PostCardProps) {
  const tagList = post.tags ? post.tags.split(',').map((t) => t.trim()) : [];

  const getDifficultyBadge = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'beginner':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'intermediate':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'advanced':
        return 'bg-terminal-red/10 text-terminal-red border-terminal-red/30';
      default:
        return 'bg-terminal-green/10 text-terminal-green border-terminal-green/30';
    }
  };

  return (
    <article className="group relative rounded-xl border border-terminal-green/20 bg-bg-card/70 p-6 transition-all duration-300 hover:border-terminal-green/50 hover:bg-bg-hover/80 hover:shadow-terminal-glow">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${getDifficultyBadge(
              post.difficulty
            )}`}
          >
            {post.difficulty}
          </span>
          <span className="text-terminal-muted flex items-center gap-1">
            <Clock className="w-3 h-3 text-terminal-green/70" />
            {post.readingTime} min read
          </span>
        </div>
        <span className="text-terminal-muted">{formatDate(post.createdAt)}</span>
      </div>

      <Link href={`/blog/${post.slug}`} className="block group-hover:text-terminal-green transition">
        <h3 className="text-lg font-bold font-mono text-terminal-text group-hover:text-terminal-green transition-colors flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-terminal-green opacity-0 group-hover:opacity-100 transition-opacity" />
          {post.title}
        </h3>
      </Link>

      <p className="text-sm text-terminal-muted font-sans mt-2 line-clamp-2 leading-relaxed">
        {post.excerpt}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-terminal-green/10">
        <div className="flex flex-wrap gap-1.5">
          {tagList.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="font-mono text-xs text-terminal-green flex items-center gap-1 group-hover:translate-x-1 transition-transform"
        >
          <span>read log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}
