import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Phase-1 Chips Copilot seed...')

  // Create demo verified parent user
  const demoUser = await prisma.user.upsert({
    where: { email: 'parent@demo.chips-copilot.com' },
    update: {},
    create: {
      email: 'parent@demo.chips-copilot.com',
      name: 'Demo Parent',
      password: await hashPassword('demo123'),
      isVerified: true,
      isParentVerified: true,
      role: 'USER'
    }
  })
  
  console.log('✅ Created demo verified parent:', demoUser.email)

  // Create parent verification record for demo user
  await prisma.parentVerification.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      status: 'APPROVED',
      level: 'L2_CASE_MATCHED',
      caseNumber: '2024-JC-001234',
      docketCourt: 'Pierce County, WI',
      matchScore: 0.89
    }
  })

  console.log('✅ Created parent verification record')

  // Create subscription for demo user
  await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      plan: 'CORE',
      status: 'ACTIVE',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  })

  console.log('✅ Created active Core subscription')

  // Create sample vault files for demo
  const sampleFiles = [
    {
      name: 'Court Order 2024-08-15.pdf',
      tags: ['COURT_ORDER', 'HEARING'],
      mimeType: 'application/pdf',
      sizeBytes: 245760,
      piiRedacted: true,
      ocrText: {
        text: 'Court Order dated August 15, 2024. The Court orders that the minor child shall remain in the temporary custody of the Department of Social Services. A permanency hearing is scheduled for October 15, 2024 at 10:00 AM.',
        pages: [
          { page: 1, text: 'Court Order dated August 15, 2024...' }
        ]
      },
      redactionMap: {
        originalLength: 850,
        redactionCount: 3,
        redactionsByType: {
          'NAME': 2,
          'PHONE': 1
        }
      }
    },
    {
      name: 'Service Plan August 2024.pdf',
      tags: ['SERVICE_PLAN', 'REQUIREMENTS'],
      mimeType: 'application/pdf',
      sizeBytes: 156432,
      piiRedacted: true,
      ocrText: {
        text: 'Service Plan Requirements: 1. Complete parenting classes by September 30, 2024. 2. Attend weekly counseling sessions. 3. Submit to random drug testing. 4. Maintain stable housing and employment.',
        pages: [
          { page: 1, text: 'Service Plan Requirements...' }
        ]
      },
      redactionMap: {
        originalLength: 1200,
        redactionCount: 5,
        redactionsByType: {
          'NAME': 3,
          'ADDRESS': 2
        }
      }
    },
    {
      name: 'Hearing Notice October 2024.pdf',
      tags: ['HEARING', 'DEADLINE'],
      mimeType: 'application/pdf',
      sizeBytes: 89312,
      piiRedacted: true,
      ocrText: {
        text: 'Notice of Permanency Hearing scheduled for October 15, 2024 at 10:00 AM in Courtroom 3. All parties are required to attend. Contact your attorney if you have questions.',
        pages: [
          { page: 1, text: 'Notice of Permanency Hearing...' }
        ]
      },
      redactionMap: {
        originalLength: 650,
        redactionCount: 2,
        redactionsByType: {
          'NAME': 1,
          'PHONE': 1
        }
      }
    }
  ]

  for (const fileData of sampleFiles) {
    await prisma.vaultFile.upsert({
      where: { 
        sha256: `demo-${fileData.name.replace(/\s+/g, '-').toLowerCase()}-hash`
      },
      update: {},
      create: {
        userId: demoUser.id,
        name: fileData.name,
        path: `vault/${demoUser.id}/${fileData.name.replace(/\s+/g, '-').toLowerCase()}`,
        sizeBytes: fileData.sizeBytes,
        mimeType: fileData.mimeType,
        sha256: `demo-${fileData.name.replace(/\s+/g, '-').toLowerCase()}-hash`,
        tags: fileData.tags,
        piiRedacted: fileData.piiRedacted,
        ocrText: fileData.ocrText,
        redactionMap: fileData.redactionMap
      }
    })
  }

  console.log('✅ Created sample vault files')

  // Create campaign category tags if they don't exist
  const campaignTags = [
    { name: 'Family Law', slug: 'family-law', color: '#2563eb' },
    { name: 'Child Protection', slug: 'child-protection', color: '#dc2626' },
    { name: 'Legal Defense', slug: 'legal-defense', color: '#059669' },
    { name: 'Emergency Support', slug: 'emergency-support', color: '#ea580c' }
  ]

  for (const tag of campaignTags) {
    await prisma.campaignCategoryTag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag
    })
  }

  console.log('✅ Created campaign category tags')

  // Create a sample campaign for the demo user
  await prisma.campaign.upsert({
    where: { slug: 'help-reunite-our-family' },
    update: {},
    create: {
      title: 'Help Reunite Our Family',
      slug: 'help-reunite-our-family',
      description: 'I am working hard to complete all court-ordered services to reunify with my children. Your support helps cover the costs of required therapy, parenting classes, and legal representation.',
      shortDescription: 'Supporting a parent working toward family reunification through CPS requirements',
      goalAmount: 5000,
      currentAmount: 1250,
      currency: 'USD',
      status: 'ACTIVE',
      category: 'FAMILY_LAW',
      caseNumber: '2024-JC-001234',
      courtName: 'Pierce County Family Court',
      userId: demoUser.id,
      images: [],
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
    }
  })

  console.log('✅ Created sample campaign')

  console.log('🎉 Phase-1 Chips Copilot seed completed successfully!')
  console.log('')
  console.log('Demo login credentials:')
  console.log('Email: parent@demo.chips-copilot.com')
  console.log('Password: demo123')
  console.log('')
  console.log('The demo user has:')
  console.log('- ✅ Verified parent status')
  console.log('- ✅ Active Core subscription')
  console.log('- ✅ Sample case documents')
  console.log('- ✅ Sample fundraising campaign')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())