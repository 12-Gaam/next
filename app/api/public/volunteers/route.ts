import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: UserRole.GAAM_ADMIN
      },
      include: {
        gaamsManaged: {
          include: {
            gaam: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        contacts: {
          select: {
            phone: true,
            countryCode: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    const imageMapping: Record<string, string> = {
      'Kevin': '/images/volunteers/image1.png',
      'Ulkesh': '/images/volunteers/image2.png',
      'Akshay': '/images/volunteers/image3.png',
      'Rajesh': '/images/volunteers/image4.png',
      'Prakash': '/images/volunteers/image15.png',
      'Pako': '/images/volunteers/image5.png',
      'Pratik': '/images/volunteers/image6.png',
      'Amrish': '/images/volunteers/image7.png',
      'Swetketu': '/images/volunteers/image8.png',
      'Jatin': '/images/volunteers/image9.png',
      'Chirag': '/images/volunteers/image10.png',
      'Jignesh': '/images/volunteers/image11.png',
      'Ankit': '/images/volunteers/image12.png',
      'Dipak': '/images/volunteers/image14.png',
      'Badal': '/images/volunteers/image15.png',
      'Ronak': '/images/volunteers/image16.png',
      'Mayank': '/images/volunteers/image17.png',
      'Aakash': '/images/volunteers/image19.png',
      'Jeet': '/images/volunteers/image20.png',
      'Piyush': '/images/volunteers/image22.png',
      'Chintesh': '/images/volunteers/image23.png',
    };

    const complexMapping = [
      { name: 'Chandresh', gaam: 'Puniyad', image: '/images/volunteers/image13.png' },
      { name: 'Chandresh', gaam: 'Awakhal', image: '/images/volunteers/image21.png' },
      { name: 'Kiran', gaam: 'Puniyad', image: '/images/volunteers/image18.png' },
      { name: 'Kiran', gaam: 'Pisai', image: '/images/volunteers/image24.jpeg' },
    ];

    const volunteers = admins.map(admin => {
      // Find the gaam name (assumes an admin manages at least one gaam, take the first one)
      const gaamName = admin.gaamsManaged[0]?.gaam?.name || 'Unknown Gaam'

      // Get the phone number from their contact profile (if they have one), else use placeholder
      let phone = '+91 00000 00000'
      if (admin.contacts && admin.contacts.length > 0 && admin.contacts[0].phone) {
        const contact = admin.contacts[0]
        phone = `${contact.countryCode || '+1'} ${contact.phone}`
      }

      // Map to static images if DB profilePic is empty
      let mappedImage = null;
      if (!admin.profilePic) {
        const complexMatch = complexMapping.find(c => admin.fullName.includes(c.name) && gaamName.includes(c.gaam));
        if (complexMatch) {
          mappedImage = complexMatch.image;
        } else {
          const match = Object.keys(imageMapping).find(k => admin.fullName.includes(k));
          if (match) mappedImage = imageMapping[match];
        }
      }

      const finalImage = admin.profilePic || mappedImage || '/images/default-avatar.png';

      // Restore custom positioning for specific static images
      let objPos = 'top';
      if (finalImage === '/images/volunteers/image4.png') objPos = 'center 20%';
      if (finalImage === '/images/volunteers/image6.png') objPos = 'center 45%';
      if (finalImage === '/images/volunteers/image3.png') objPos = 'center 20%';

      if (finalImage === '/images/volunteers/image7.png') objPos = 'bottom 35%';
            if (finalImage === '/images/volunteers/image8.png') objPos = 'left 35%';

      if (finalImage === '/images/volunteers/image5.png') objPos = 'bottom 45%';

      if (finalImage === '/images/volunteers/image21.png') objPos = 'bottom 55%';
      if (finalImage === '/images/volunteers/image20.png') objPos = 'bottom 35%';

      if (finalImage === '/images/volunteers/image15.png') objPos = 'center';

      return {
        id: admin.id,
        name: admin.fullName,
        email: admin.email,
        gaam: gaamName,
        image: finalImage,
        phone: phone,
        objectPosition: objPos
      }
    })

    // Sort the list: put users with no image (default avatar) or no email at the very end
    volunteers.sort((a, b) => {
      const aIsMissingData = a.image === '/images/default-avatar.png' || !a.email || a.email.trim() === '';
      const bIsMissingData = b.image === '/images/default-avatar.png' || !b.email || b.email.trim() === '';

      if (aIsMissingData && !bIsMissingData) return 1;
      if (!aIsMissingData && bIsMissingData) return -1;
      return 0;
    });

    return NextResponse.json(volunteers)
  } catch (error) {
    console.error('Error fetching volunteers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
