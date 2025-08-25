import { PrismaClient } from '@prisma/client'
import csc from 'countries-states-cities'

const prisma = new PrismaClient()

async function main() {
  console.log('🌍 Starting location data seeding...')

  try {
    // Clear existing data
    console.log('🗑️ Clearing existing location data...')
    await prisma.contact.deleteMany()
    await prisma.cityMaster.deleteMany()
    await prisma.stateMaster.deleteMany()
    await prisma.countryMaster.deleteMany()

    // Get all countries from the package
    const countries = csc.getAllCountries()
    console.log(`📊 Found ${countries.length} countries`)

    for (const country of countries) {
      console.log(`🏳️ Processing country: ${country.name}`)
      
      // Create country
      const createdCountry = await prisma.countryMaster.create({
        data: {
          name: country.name,
        }
      })

      // Get states for this country
      const states = csc.getStatesOfCountry(country.id)
      console.log(`  📍 Found ${states.length} states for ${country.name}`)

      for (const state of states) {
        console.log(`    🏛️ Processing state: ${state.name}`)
        
        // Create state with unique name per country
        const createdState = await prisma.stateMaster.create({
          data: {
            name: `${state.name} (${country.name})`,
            countryId: createdCountry.id,
          }
        })

        // Get cities for this state
        const cities = csc.getCitiesOfState(state.id)
        console.log(`      🏙️ Found ${cities.length} cities for ${state.name}`)

        // Create cities in batches to avoid memory issues
        const cityBatches = []
        for (let i = 0; i < cities.length; i += 100) {
          cityBatches.push(cities.slice(i, i + 100))
        }

        for (const cityBatch of cityBatches) {
          await prisma.cityMaster.createMany({
            data: cityBatch.map(city => ({
              name: city.name,
              stateId: createdState.id,
            }))
          })
        }
      }
    }

    console.log('✅ Location data seeding completed successfully!')
    
    // Print summary
    const totalCountries = await prisma.countryMaster.count()
    const totalStates = await prisma.stateMaster.count()
    const totalCities = await prisma.cityMaster.count()
    
    console.log('\n📊 Seeding Summary:')
    console.log(`   Countries: ${totalCountries}`)
    console.log(`   States: ${totalStates}`)
    console.log(`   Cities: ${totalCities}`)

  } catch (error) {
    console.error('❌ Error seeding location data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
