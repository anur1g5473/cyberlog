'use client';

import React, { useState } from 'react';
import { NowItem, NowSettings, NowCategory } from '@/lib/db/now';
import { TagPill } from '@/components/ui/TagPill';
import { formatDate } from '@/lib/utils/dateFormatter';
import { preprocessBlogMarkdown } from '@/lib/utils/markdownUtils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Zap,
  BookOpen,
  GraduationCap,
  Briefcase,
  Layers,
  ExternalLink,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Activity,
  ArrowUpRight,
} from 'lucide-react';

interface NowClientViewProps {
  settings: NowSettings;
  items: NowItem[];
}

export function NowClientView({ settings, items }: NowClientViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<NowCategory | 'all'>('all');

  const categories: Array<{ id: NowCategory | 'all'; label: string; icon: React.ReactNode; color: string }> = [
    { id: 'all', label: 'All Activities', icon: <Layers className="w-3.5 h-3.5" />, color: '#00ff41' },
    { id: 'working_on', label: "Working On", icon: <Zap className="w-3.5 h-3.5" />, color: '#00ff41' },
    { id: 'reading', label: 'Reading', icon: <BookOpen className="w-3.5 h-3.5" />, color: '#a855f7' },
    { id: 'subject', label: 'Ongoing Subjects', icon: <GraduationCap className="w-3.5 h-3.5" />, color: '#00f0ff' },
    { id: 'internship', label: 'Internships', icon: <Briefcase className="w-3.5 h-3.5" />, color: '#ffb703' },
  ];

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter((item) => item.category === selectedCategory);

  const getCategoryMeta = (cat: NowCategory) => {
    switch (cat) {
      case 'working_on':
        return {
          label: 'Active Engineering',
          color: '#00ff41',
          icon: <Zap className="w-3.5 h-3.5" />,
          progressGradient: 'from-terminal-green to-emerald-400',
        };
      case 'reading':
        return {
          label: 'Reading & Research',
          color: '#a855f7',
          icon: <BookOpen className="w-3.5 h-3.5" />,
          progressGradient: 'from-purple-500 to-indigo-400',
        };
      case 'subject':
        return {
          label: 'Academic Subject',
          color: '#00f0ff',
          icon: <GraduationCap className="w-3.5 h-3.5" />,
          progressGradient: 'from-cyan-500 to-blue-400',
        };
      case 'internship':
        return {
          label: 'Work & Internship',
          color: '#ffb703',
          icon: <Briefcase className="w-3.5 h-3.5" />,
          progressGradient: 'from-amber-500 to-yellow-400',
        };
      default:
        return {
          label: 'Exploration',
          color: '#ff007f',
          icon: <Sparkles className="w-3.5 h-3.5" />,
          progressGradient: 'from-pink-500 to-rose-400',
        };
    }
  };

  return (
    <div className="space-y-8 font-mono text-xs">
      {/* Real-time Status Card */}
      <div className="p-5 rounded-xl border border-terminal-green/30 bg-black/70 backdrop-blur-md shadow-terminal-glow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-terminal-green/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terminal-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-terminal-green"></span>
            </span>
            <span className="text-terminal-green font-bold tracking-wider text-[11px] uppercase">
              STATUS: TELEMETRY SYNCHRONIZED
            </span>
          </div>

          <div className="flex items-center gap-4 text-terminal-muted text-[11px]">
            {settings.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{settings.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-terminal-green" />
              <span>Synced {formatDate(settings.lastUpdated)}</span>
            </span>
          </div>
        </div>

        {/* Current Focus Statement */}
        {(settings.currentFocus || settings.headline) ? (
          <div className="space-y-2">
            <div className="text-terminal-muted text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-terminal-green" />
              <span>PRIMARY DIRECTIVE &amp; FOCUS</span>
            </div>
            <p className="text-sm font-sans text-terminal-text leading-relaxed font-normal">
              {settings.currentFocus || settings.headline}
            </p>
          </div>
        ) : null}

        {settings.availability ? (
          <div className="pt-2 flex items-center gap-2 text-terminal-amber text-[11px]">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-terminal-amber"></span>
            <span>{settings.availability}</span>
          </div>
        ) : null}

        {!settings.currentFocus && !settings.headline && !settings.availability && (
          <div className="text-terminal-muted text-[11px] italic">
            &gt; No active directive statement recorded yet.
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = cat.id === 'all'
            ? items.length
            : items.filter((i) => i.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'border-terminal-green bg-terminal-green/20 text-terminal-green shadow-[0_0_12px_rgba(0,255,65,0.25)] font-bold'
                  : 'border-terminal-green/20 bg-black/40 text-terminal-muted hover:border-terminal-green/40 hover:text-terminal-text'
              }`}
            >
              <span style={{ color: isSelected ? undefined : cat.color }}>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected
                    ? 'bg-terminal-green text-black font-bold'
                    : 'bg-terminal-green/10 text-terminal-green'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredItems.length === 0 ? (
          <div className="col-span-full p-8 text-center rounded-xl border border-terminal-green/20 bg-black/40 text-terminal-muted">
            &gt; No active activities recorded under this category.
          </div>
        ) : (
          filteredItems.map((item) => {
            const meta = getCategoryMeta(item.category);
            const rawTags = Array.isArray(item.tags) ? item.tags : (item.tags ? String(item.tags).split(',') : []);
            const tags = rawTags.map((t) => t.trim()).filter(Boolean);
            const formattedDesc = preprocessBlogMarkdown(item.description || '');

            return (
              <div
                key={item.id}
                className="group relative rounded-xl border border-terminal-green/20 bg-bg-card/80 p-5 flex flex-col justify-between transition-all duration-300 hover:border-terminal-green/50 hover:bg-bg-hover/90 hover:shadow-terminal-glow"
              >
                <div className="space-y-3">
                  {/* Top Bar: Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      style={{ borderColor: `${meta.color}40`, color: meta.color, backgroundColor: `${meta.color}15` }}
                      className="px-2 py-0.5 rounded text-[11px] font-mono border flex items-center gap-1.5 font-bold"
                    >
                      {meta.icon}
                      <span>{meta.label}</span>
                    </span>

                    {item.status && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-terminal-green/30 bg-terminal-green/10 text-terminal-green flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-terminal-green"></span>
                        <span>{item.status}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold font-mono text-terminal-text group-hover:text-terminal-green transition-colors leading-snug">
                    {item.title}
                  </h3>

                  {/* Progress Bar (if available) */}
                  {typeof item.progress === 'number' && (
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px] text-terminal-muted">
                        <span>PROGRESS / COMPLETION</span>
                        <span className="font-bold text-terminal-green">{item.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-terminal-green/20">
                        <div
                          className={`h-full bg-gradient-to-r ${meta.progressGradient} transition-all duration-500`}
                          style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Description rendered with Markdown */}
                  <div className="font-sans text-xs text-terminal-text/85 leading-relaxed pt-1">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p className="mb-2 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="space-y-1 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal space-y-1 pl-4 mb-2">{children}</ol>,
                        li: ({ children }) => (
                          <li className="flex items-start gap-1.5">
                            <span className="text-terminal-green font-mono select-none">▸</span>
                            <span>{children}</span>
                          </li>
                        ),
                        strong: ({ children }) => <strong className="font-bold text-terminal-green">{children}</strong>,
                        code: ({ children }) => (
                          <code className="px-1 py-0.5 rounded bg-terminal-green/10 text-terminal-green font-mono text-[11px] border border-terminal-green/20">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {formattedDesc}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* Card Footer: Tags & External Link */}
                <div className="mt-4 pt-3 border-t border-terminal-green/10 flex flex-col gap-3">
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <TagPill key={tag} tag={tag} />
                      ))}
                    </div>
                  )}

                  {item.link && (
                    <div className="pt-1">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-terminal-green hover:underline hover:brightness-125"
                      >
                        <span>{item.linkText || 'Open Related Resource'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sivers /now page philosophy footer banner */}
      <div className="mt-12 p-4 rounded-xl border border-terminal-green/20 bg-black/40 text-[11px] text-terminal-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-terminal-green shrink-0" />
          <span>
            Inspired by Derek Sivers&apos; <strong>/now</strong> page movement. A dedicated public status log of active priorities.
          </span>
        </div>
        <a
          href="https://nownownow.com/about"
          target="_blank"
          rel="noopener noreferrer"
          className="text-terminal-green hover:underline flex items-center gap-1 whitespace-nowrap"
        >
          <span>What is a /now page?</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

