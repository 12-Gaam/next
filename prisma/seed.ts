import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    }
  })
  console.log('✅ Admin user created:', adminUser.username)

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
