import { NextRequest, NextResponse } from 'next/server';
import { updateNowItem, deleteNowItem } from '@/lib/db/now';
import { verifyAdminSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateNowItem({ ...body, id: params.id });

    revalidatePath('/now');
    revalidatePath('/admin/now');
    revalidatePath('/admin/dashboard');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Now activity updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating now item:', error);
    return NextResponse.json({ error: 'Failed to update now activity' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    await deleteNowItem(params.id);

    revalidatePath('/now');
    revalidatePath('/admin/now');
    revalidatePath('/admin/dashboard');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Now activity deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting now item:', error);
    return NextResponse.json({ error: 'Failed to delete now activity' }, { status: 500 });
  }
}
