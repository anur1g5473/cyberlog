import { NextRequest, NextResponse } from 'next/server';
import { getPublishedPosts, getAllPostsForAdmin, createPost } from '@/lib/db/posts';
import { verifyAdminSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get('tag') || undefined;
    const adminMode = searchParams.get('admin') === 'true';

    if (adminMode) {
      const isAdmin = await verifyAdminSession();
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const posts = await getAllPostsForAdmin();
      return NextResponse.json(posts);
    }

    const posts = await getPublishedPosts(tag);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const newPost = await createPost(body);
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
