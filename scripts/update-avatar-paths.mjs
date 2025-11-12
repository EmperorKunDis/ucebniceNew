import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Get all users with old paths
  const users = await prisma.user.findMany({
    where: {
      image: {
        startsWith: '/uploads/avatars/'
      }
    }
  })
  
  console.log(`Found ${users.length} users to update`)
  
  // Update each user individually
  for (const user of users) {
    if (user.image) {
      const newPath = user.image.replace('/uploads/avatars/', '/avatars/')
      await prisma.user.update({
        where: { id: user.id },
        data: { image: newPath }
      })
      console.log(`Updated user ${user.email}: ${user.image} -> ${newPath}`)
    }
  }
  
  console.log(`✅ Updated ${users.length} users`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
