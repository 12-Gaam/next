import { PrismaClient, RegistrationStatus, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

async function main() {
  console.log('🌱 Starting database seeding...')

  const hashedPassword = await bcrypt.hash('Admin@123', 12)
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@12gaam.com' },
    update: {},
    create: {
      fullName: 'Super Admin',
      email: 'superadmin@12gaam.com',
      username: 'superadmin',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      status: RegistrationStatus.APPROVED
    }
  })
  console.log('✅ Super admin created:', superAdmin.username)

  const gaamAdmin = await prisma.user.upsert({
    where: { email: 'limbasi.admin@12gaam.com' },
    update: {},
    create: {
      fullName: 'Limbasi Admin',
      email: 'limbasi.admin@12gaam.com',
      username: 'limbasiadmin',
      password: hashedPassword,
      role: UserRole.GAAM_ADMIN,
      status: RegistrationStatus.APPROVED
    }
  })
  console.log('✅ Gaam admin created:', gaamAdmin.username)

  // Create countries
  const countries = [
    { name: 'India' },
    { name: 'United States' },
    { name: 'United Kingdom' },
    { name: 'Canada' },
    { name: 'Australia' }
  ]

  for (const country of countries) {
    await prisma.countryMaster.upsert({
      where: { name: country.name },
      update: {},
      create: country
    })
  }
  console.log('✅ Countries created')

  // Create states for India
  const india = await prisma.countryMaster.findUnique({ where: { name: 'India' } })
  if (india) {
    const indianStates = [
      'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat',
      'Uttar Pradesh', 'West Bengal', 'Telangana', 'Andhra Pradesh', 'Kerala'
    ]

    for (const stateName of indianStates) {
      // Check if state already exists
      const existingState = await prisma.stateMaster.findFirst({
        where: { 
          name: stateName,
          countryId: india.id
        }
      })
      
      if (!existingState) {
        await prisma.stateMaster.create({
          data: {
            name: stateName,
            countryId: india.id
          }
        })
      }
    }
    console.log('✅ Indian states created')
  }

  // Create education levels
  const educations = [
    'High School',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Diploma',
    'Certificate Course',
    'Other'
  ]

  for (const education of educations) {
    await prisma.educationMaster.upsert({
      where: { name: education },
      update: {},
      create: { name: education }
    })
  }
  console.log('✅ Education levels created')

  // Create professions
  const professions = [
    'Software Engineer',
    'Doctor',
    'Teacher',
    'Business Owner',
    'Manager',
    'Student',
    'Other'
  ]

  for (const profession of professions) {
    await prisma.professionMaster.upsert({
      where: { name: profession },
      update: {},
      create: { name: profession }
    })
  }
  console.log('✅ Professions created')

  const gaamNames = [
    'Limbasi',
    'Mobha',
    'Ras',
    'Vasad',
    'Vemali',
    'Dodka',
    'Wadadla',
    'Pipaliya',
    'Vejalpur',
    'Bhanapura',
    'Bharoda',
    'Kanera'
  ]

  for (const name of gaamNames) {
    await prisma.gaam.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug: slugify(name)
      }
    })
  }
  console.log('✅ Gaams created')

  // Assign admin to Limbasi gaam using the new many-to-many relationship
  const limbasiGaam = await prisma.gaam.findUnique({ where: { name: 'Limbasi' } })
  if (limbasiGaam) {
    await prisma.gaamAdmin.upsert({
      where: {
        gaamId_adminId: {
          gaamId: limbasiGaam.id,
          adminId: gaamAdmin.id
        }
      },
      update: {},
      create: {
        gaamId: limbasiGaam.id,
        adminId: gaamAdmin.id
      }
    })
    console.log('✅ Admin assigned to Limbasi gaam')
  }

  const limbasiGaam = await prisma.gaam.findUnique({ where: { name: 'Limbasi' } })
  if (limbasiGaam) {
    await prisma.user.update({
      where: { id: gaamAdmin.id },
      data: { gaamId: limbasiGaam.id }
    })
  }

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })