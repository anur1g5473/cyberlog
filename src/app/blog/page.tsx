import { PostCard } from '@/components/ui/PostCard';
import { getPublishedPosts } from '@/lib/db/posts';

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-mono text-terminal-green">&gt; ls -a logs/</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {posts.map((p: any) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
