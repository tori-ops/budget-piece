import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding global categories...');

  // Define global categories with base weights and groups
  const globalCategories = [
    // CORE categories
    { name: 'Venue', group: 'CORE', baseWeight: 0.25 },
    { name: 'Catering', group: 'CORE', baseWeight: 0.25 },
    { name: 'Photography/Videography', group: 'CORE', baseWeight: 0.15 },
    { name: 'Music/DJ/Entertainment', group: 'CORE', baseWeight: 0.12 },
    { name: 'Florals & Decorations', group: 'CORE', baseWeight: 0.10 },
    { name: 'Invitations & Paper', group: 'CORE', baseWeight: 0.05 },

    // ADMIN categories
    { name: 'Planning & Design', group: 'ADMIN', baseWeight: 0.08 },
    { name: 'Permits & Insurance', group: 'ADMIN', baseWeight: 0.05 },
    { name: 'Transportation', group: 'ADMIN', baseWeight: 0.05 },
    { name: 'Ceremony Officiant', group: 'ADMIN', baseWeight: 0.02 },

    // ENHANCEMENTS categories
    { name: 'Hair & Makeup', group: 'ENHANCEMENTS', baseWeight: 0.08 },
    { name: 'Wedding Attire', group: 'ENHANCEMENTS', baseWeight: 0.10 },
    { name: 'Favors & Gifts', group: 'ENHANCEMENTS', baseWeight: 0.05 },
    { name: 'Guest Accommodations', group: 'ENHANCEMENTS', baseWeight: 0.10 },
    { name: 'Honeymoon', group: 'ENHANCEMENTS', baseWeight: 0.15 },

    // SAFETY_NET categories
    { name: 'Contingency (10%)', group: 'SAFETY_NET', baseWeight: 0.10 },
    { name: 'Miscellaneous', group: 'SAFETY_NET', baseWeight: 0.05 },
  ];

  for (const category of globalCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        isGlobal: true,
        eventId: null,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: category.name,
          group: category.group,
          baseWeight: category.baseWeight,
          isGlobal: true,
          eventId: null,
        },
      });
      console.log(`✓ Created category: ${category.name}`);
    } else {
      console.log(`- Category already exists: ${category.name}`);
    }
  }

  console.log('Seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
