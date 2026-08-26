import { TerminalWindow } from '@/components/ui/TerminalWindow';
import { TypedCommand } from '@/components/ui/TypedCommand';
import { PostCard, PostData } from '@/components/ui/PostCard';
import { ProjectCard, ProjectData } from '@/components/ui/ProjectCard';
import { getPublishedPosts } from '@/lib/db/posts';
import { getProjects } from '@/lib/db/projects';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const posts = await getPublishedPosts();
  const allProjects = await getProjects();
  const featuredOnly = allProjects.filter(p => p.featured).slice(0, 2);

  return (
    <div className="space-y-12">
      <section className="text-center py-10 space-y-4">
        <TypedCommand command="whoami" prefix="cyberlog ~" className="justify-center text-xl" />
        <h1 className="text-4xl md:text-5xl font-bold font-mono">
          Security Research & <span className="text-terminal-green">Engineering</span>
        </h1>
        <p className="text-terminal-muted max-w-2xl mx-auto italic">
          "Deep diving into offensive vectors to engineer better defensive boundaries."
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-mono text-terminal-green">Latest Logs</h2>
          <Link href="/blog" className="text-sm font-mono text-terminal-muted hover:text-terminal-green">view all logs &gt;</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {posts.slice(0, 4).map((p: any) => <PostCard key={p.id} post={p} />)}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-mono text-terminal-green">Featured Projects</h2>
          <Link href="/projects" className="text-sm font-mono text-terminal-muted hover:text-terminal-green">view all portfolio &gt;</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {featuredOnly.map((p: any) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </section>
    </div>
  );
}
