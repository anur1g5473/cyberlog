import { NextRequest, NextResponse } from 'next/server';
import { getContactDetails, updateContactDetails } from '@/lib/db/contact';
import { verifyAdminSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const contact = await getContactDetails();
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact details:', error);
    return NextResponse.json({ error: 'Failed to fetch contact details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const updated = await updateContactDetails(body);

    // Revalidate affected pages so updates reflect instantly across the site
    revalidatePath('/contact');
    revalidatePath('/about');
    revalidatePath('/');
    revalidatePath('/admin/contact');
    revalidatePath('/admin/dashboard');

    return NextResponse.json({
      success: true,
      message: 'Contact details updated successfully.',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating contact details:', error);
    return NextResponse.json({ error: 'Failed to update contact details' }, { status: 500 });
  }
}
