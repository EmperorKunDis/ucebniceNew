import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Error: Email address required')
    console.log('Usage: tsx scripts/make-admin.ts your@email.com')
    process.exit(1)
  }

  try {
    // Find user by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (!existingUser) {
      console.error(`❌ Error: User with email "${email}" not found`)
      console.log('\nPlease make sure:')
      console.log('1. You have created an account on the website')
      console.log('2. The email address is correct')
      process.exit(1)
    }

    // Update user to admin
    const user = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        isAdmin: true,
      },
    })

    console.log('✅ Success! User is now an admin:')
    console.log('   Email:', user.email)
    console.log('   Name:', user.name || 'N/A')
    console.log('   Username:', user.username || 'N/A')
    console.log('   Admin Status:', user.isAdmin ? 'YES' : 'NO')
    console.log('\n🎉 You can now access the admin panel at /admin')
  } catch (error) {
    console.error('❌ Error making user admin:', error)
    process.exit(1)
  }
}

main()
  .catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
