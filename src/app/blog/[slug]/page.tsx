import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getPublishedPosts } from '@/lib/db/posts';
import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { TypedCommand } from '@/components/ui/TypedCommand';
import { TagPill } from '@/components/ui/TagPill';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { formatDate } from '@/lib/utils/dateFormatter';
import { parseBlogTags } from '@/lib/utils/tagUtils';
import { preprocessBlogMarkdown } from '@/lib/utils/markdownUtils';
import { Clock, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const revalidate = 60;

interface PostPageProps {
  params: { slug: string };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const tagList = parseBlogTags(post.tags);
  const formattedContent = preprocessBlogMarkdown(post.content || '');

  return (
    <article className="space-y-8">
      <div className="flex items-center justify-between font-mono text-xs">
        <Link
          href="/blog"
          className="text-terminal-green flex items-center gap-1.5 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>cd ../logs</span>
        </Link>
        <div className="text-terminal-muted flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-terminal-green" />
          <span>{post.readingTime} min read</span>
          <span>•</span>
          <span>{formatDate(post.createdAt)}</span>
        </div>
      </div>

      <TypedCommand command={`cat ./logs/${post.slug}.md`} prefix="user@cyberlog:~$" />

      <TerminalWindow pathLabel={`terminal ~ /logs/${post.slug}`}>
        <div className="space-y-6">
          <div className="border-b border-terminal-green/20 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono border border-terminal-green/30 bg-terminal-green/10 text-terminal-green">
                {post.difficulty}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-mono text-terminal-text leading-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-sm font-sans text-terminal-muted mt-2 leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>

          <div className="prose prose-invert max-w-none font-sans text-terminal-text text-sm leading-relaxed space-y-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  return match ? (
                    <CodeBlock code={codeString} language={match[1]} />
                  ) : (
                    <code className="px-1.5 py-0.5 rounded bg-terminal-green/10 text-terminal-green font-mono text-xs border border-terminal-green/20" {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({ children }) => (
                  <h1 className="text-2xl font-bold font-mono text-terminal-green border-b border-terminal-green/30 pb-2 mt-8 mb-4 flex items-center gap-2">
                    <span className="text-terminal-green/50">#</span> {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-xl font-bold font-mono text-terminal-text mt-7 mb-3 flex items-center gap-2">
                    <span className="text-terminal-green">##</span> {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-bold font-mono text-terminal-green/90 mt-6 mb-2 flex items-center gap-2">
                    <span className="text-terminal-green/60">###</span> {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-base font-semibold font-mono text-terminal-muted mt-5 mb-2 flex items-center gap-2">
                    <span className="text-terminal-green/40">####</span> {children}
                  </h4>
                ),
                h5: ({ children }) => (
                  <h5 className="text-sm font-semibold font-mono text-terminal-muted mt-4 mb-1 flex items-center gap-2">
                    <span className="text-terminal-green/30">#####</span> {children}
                  </h5>
                ),
                h6: ({ children }) => (
                  <h6 className="text-xs font-semibold font-mono text-terminal-muted mt-3 mb-1 uppercase tracking-wider">
                    {children}
                  </h6>
                ),
                p: ({ children }) => <p className="text-terminal-text/90 leading-relaxed my-3">{children}</p>,
                ul: ({ children }) => <ul className="space-y-1.5 my-3 pl-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal space-y-1.5 my-3 pl-6 text-terminal-text/90">{children}</ol>,
                li: ({ children }) => (
                  <li className="flex items-start gap-2 text-terminal-text/90">
                    <span className="text-terminal-green select-none mt-1 font-mono text-xs">▸</span>
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-terminal-green pl-4 my-4 italic text-terminal-muted bg-terminal-green/5 py-1 rounded-r">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4 border border-terminal-green/20 rounded-lg">
                    <table className="w-full text-left font-mono text-xs border-collapse">{children}</table>
                  </div>
                ),
                th: ({ children }) => <th className="bg-terminal-green/10 p-2 border-b border-terminal-green/20 text-terminal-green">{children}</th>,
                td: ({ children }) => <td className="p-2 border-b border-terminal-green/10 text-terminal-text">{children}</td>,
              }}
            >
              {formattedContent}
            </ReactMarkdown>
          </div>

          <div className="pt-6 border-t border-terminal-green/20 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
            <div className="flex flex-wrap gap-1.5">
              {tagList.map((tag) => (
                <TagPill key={tag.name} tag={tag} />
              ))}
            </div>
            <Link
              href="/blog"
              className="text-terminal-green flex items-center gap-1 hover:underline"
            >
              <span>Back to all logs</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>
      </TerminalWindow>
    </article>
  );
}
