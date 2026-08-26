import { NextRequest, NextResponse } from 'next/server';
import { updateProject, deleteProject } from '@/lib/db/projects';
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
    const updated = await updateProject({ id: params.id, ...body });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
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

    await deleteProject(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
