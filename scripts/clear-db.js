const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.booking.deleteMany()
    await prisma.review.deleteMany()
    await prisma.photo.deleteMany()
    await prisma.member.deleteMany()
    await prisma.instrument.deleteMany()
    await prisma.service.deleteMany()
    await prisma.band.deleteMany()
    console.log('Database cleared')
  } catch (e) {
    console.error(e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
