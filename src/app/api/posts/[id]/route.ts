import { NextRequest, NextResponse } from 'next/server';
import { updatePost, deletePost } from '@/lib/db/posts';
import { verifyAdminSession } from '@/lib/auth/session';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updatePost({ id: params.id, ...body });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deletePost(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
