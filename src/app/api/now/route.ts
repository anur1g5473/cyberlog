import { NextRequest, NextResponse } from 'next/server';
import { getNowData, createNowItem, updateNowSettings, deleteNowItem } from '@/lib/db/now';
import { verifyAdminSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getNowData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching /now data:', error);
    return NextResponse.json({ error: 'Failed to fetch now data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const newItem = await createNowItem(body);

    revalidatePath('/now');
    revalidatePath('/admin/now');
    revalidatePath('/admin/dashboard');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Now activity added successfully',
      data: newItem,
    });
  } catch (error) {
    console.error('Error creating now activity:', error);
    return NextResponse.json({ error: 'Failed to create now activity' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const updatedSettings = await updateNowSettings(body);

    revalidatePath('/now');
    revalidatePath('/admin/now');
    revalidatePath('/admin/dashboard');
    revalidatePath('/');

    return NextResponse.json({
      success: true,
      message: 'Now settings updated successfully',
      data: updatedSettings,
    });
  } catch (error) {
    console.error('Error updating now settings:', error);
    return NextResponse.json({ error: 'Failed to update now settings' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
    }

    await deleteNowItem(id);

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
