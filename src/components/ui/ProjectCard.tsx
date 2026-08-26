'use client';

import React from 'react';
import { TagPill } from './TagPill';
import { Github, ExternalLink, ShieldCheck, FolderGit2 } from 'lucide-react';

export interface ProjectData {
  id: string;
  title: string;
  description: string;
  techStack: string;
  githubUrl: string;
  demoUrl?: string | null;
  category: string;
  featured?: boolean;
}

interface ProjectCardProps {
  project: ProjectData;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const tags = project.techStack ? project.techStack.split(',').map((t) => t.trim()) : [];

  return (
    <div className="group rounded-xl border border-terminal-green/20 bg-bg-card/70 p-6 flex flex-col justify-between transition-all duration-300 hover:border-terminal-green/60 hover:bg-bg-hover/80 hover:shadow-terminal-glow">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-terminal-green/30 bg-terminal-green/10 text-terminal-green flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {project.category}
          </span>
          {project.featured && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/30 font-bold">
              ★ FEATURED
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold font-mono text-terminal-text group-hover:text-terminal-green transition-colors flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 text-terminal-green" />
          {project.title}
        </h3>

        <p className="text-sm font-sans text-terminal-muted mt-2 leading-relaxed">
          {project.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-terminal-green/10 flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <TagPill key={tag} tag={tag} />
          ))}
        </div>

        <div className="flex items-center gap-3 font-mono text-xs pt-1">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-terminal-green/30 bg-terminal-green/5 text-terminal-green hover:bg-terminal-green/20 transition"
            >
              <Github className="w-4 h-4" />
              <span>Source Code</span>
            </a>
          )}

          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-terminal-amber/30 bg-terminal-amber/5 text-terminal-amber hover:bg-terminal-amber/20 transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Live Demo</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
