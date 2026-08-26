import { ProjectCard } from '@/components/ui/ProjectCard';
import { getProjects } from '@/lib/db/projects';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = await getProjects();
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-mono text-terminal-green">&gt; ls -a projects/</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((p: any) => <ProjectCard key={p.id} project={p} />)}
      </div>
    </div>
  );
}
