import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPendingApprovalsNotification } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Basic security check for CRON (optional, can be an API key in headers)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // Commented out for now to allow easy testing, but recommended for production
    }

    // 1. Get all Gaam Admins
    const gaamAdmins = await prisma.user.findMany({
      where: {
        role: 'GAAM_ADMIN',
        status: 'APPROVED',
      },
      include: {
        gaam: true,
      },
    });

    if (gaamAdmins.length === 0) {
      return NextResponse.json({ message: 'No Gaam admins found' });
    }

    const results = [];

    // 2. For each Gaam Admin, check pending registrations for their Gaam
    for (const admin of gaamAdmins) {
      const gaamName = admin.gaam?.name;
      if (!gaamName) continue;

      const pendingCount = await prisma.user.count({
        where: {
          gaamId: admin.gaamId,
          status: 'PENDING',
          role: 'MEMBER',
        },
      });

      if (pendingCount > 0) {
        // 3. Send email notification
        try {
          await sendPendingApprovalsNotification({
            to: admin.email,
            name: admin.fullName,
            gaam: gaamName,
            count: pendingCount,
          });
          results.push({ email: admin.email, gaam: gaamName, count: pendingCount, status: 'sent' });
        } catch (mailError) {
          console.error(`Failed to send email to ${admin.email}:`, mailError);
          results.push({ email: admin.email, gaam: gaamName, count: pendingCount, status: 'failed', error: String(mailError) });
        }
      } else {
        results.push({ email: admin.email, gaam: gaamName, count: 0, status: 'skipped' });
      }
    }

    return NextResponse.json({
      message: 'Weekly pending approvals notification process completed',
      results,
    });
  } catch (error) {
    console.error('Error in monday-summary cron:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
