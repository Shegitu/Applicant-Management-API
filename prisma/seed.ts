import { PrismaClient, ApplicantStatus, InternshipTrack } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@infnova.com';
  const password = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: hashedPassword,
      fullName: 'System Administrator',
    },
  });

  console.log(`Seeded administrator: ${admin.email}`);
}

async function seedApplicants() {
  const applicants = [
    {
      fullName: 'Abel Tesfaye',
      email: 'abel.tesfaye@example.com',
      phoneNumber: '+251911223344',
      university: 'Addis Ababa University',
      graduationYear: 2026,
      internshipTrack: InternshipTrack.BACKEND_DEVELOPMENT,
      status: ApplicantStatus.Pending,
      githubUrl: 'https://github.com/abeltesfaye',
      internalNotes: 'Strong grasp of Node.js and databases.',
    },
    {
      fullName: 'Bethlehem Alemu',
      email: 'bethlehem.alemu@example.com',
      phoneNumber: '+251922334455',
      university: 'Jimma University',
      graduationYear: 2025,
      internshipTrack: InternshipTrack.FRONTEND_DEVELOPMENT,
      status: ApplicantStatus.Shortlisted,
      portfolioUrl: 'https://bethlehemalemu.dev',
      internalNotes: 'Impressive React portfolio.',
    },
    {
      fullName: 'Chala Regassa',
      email: 'chala.regassa@example.com',
      phoneNumber: '+251933445566',
      university: 'Bahir Dar University',
      graduationYear: 2026,
      internshipTrack: InternshipTrack.MOBILE_DEVELOPMENT,
      status: ApplicantStatus.Pending,
      githubUrl: 'https://github.com/chalaregassa',
    },
    {
      fullName: 'Dawit Bekele',
      email: 'dawit.bekele@example.com',
      phoneNumber: '+251944556677',
      university: 'Mekelle University',
      graduationYear: 2024,
      internshipTrack: InternshipTrack.DATA_ANALYTICS,
      status: ApplicantStatus.Accepted,
      linkedInUrl: 'https://linkedin.com/in/dawitbekele',
      internalNotes: 'Excellent SQL and Python skills. Offer extended.',
    },
    {
      fullName: 'Eden Girma',
      email: 'eden.girma@example.com',
      phoneNumber: '+251955667788',
      university: 'Hawassa University',
      graduationYear: 2025,
      internshipTrack: InternshipTrack.UI_UX_DESIGN,
      status: ApplicantStatus.Shortlisted,
      portfolioUrl: 'https://edengirma.design',
    },
    {
      fullName: 'Fikru Wolde',
      email: 'fikru.wolde@example.com',
      phoneNumber: '+251966778899',
      university: 'Adama Science and Technology University',
      graduationYear: 2026,
      internshipTrack: InternshipTrack.BACKEND_DEVELOPMENT,
      status: ApplicantStatus.Rejected,
      internalNotes: 'Did not meet minimum technical bar in interview.',
    },
    {
      fullName: 'Genet Assefa',
      email: 'genet.assefa@example.com',
      phoneNumber: '+251977889900',
      university: 'Gondar University',
      graduationYear: 2025,
      internshipTrack: InternshipTrack.FRONTEND_DEVELOPMENT,
      status: ApplicantStatus.Pending,
      githubUrl: 'https://github.com/genetassefa',
    },
    {
      fullName: 'Henok Mulugeta',
      email: 'henok.mulugeta@example.com',
      phoneNumber: '+251988990011',
      university: 'Addis Ababa Science and Technology University',
      graduationYear: 2026,
      internshipTrack: InternshipTrack.MOBILE_DEVELOPMENT,
      status: ApplicantStatus.Pending,
    },
    {
      fullName: 'Iyasu Kebede',
      email: 'iyasu.kebede@example.com',
      phoneNumber: '+251999001122',
      university: 'Wollo University',
      graduationYear: 2024,
      internshipTrack: InternshipTrack.DATA_ANALYTICS,
      status: ApplicantStatus.Accepted,
      linkedInUrl: 'https://linkedin.com/in/iyasukebede',
      internalNotes: 'Great fit for the analytics team.',
    },
    {
      fullName: 'Yordanos Haile',
      email: 'yordanos.haile@example.com',
      phoneNumber: '+251900112233',
      university: 'Debre Berhan University',
      graduationYear: 2025,
      internshipTrack: InternshipTrack.UI_UX_DESIGN,
      status: ApplicantStatus.Rejected,
      internalNotes: 'Portfolio did not match role requirements.',
    },
  ];

  for (const applicant of applicants) {
    await prisma.applicant.upsert({
      where: { email: applicant.email },
      update: {},
      create: applicant,
    });
  }

  console.log(`Seeded ${applicants.length} sample applicants`);
}

async function main() {
  await seedAdmin();
  await seedApplicants();
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
