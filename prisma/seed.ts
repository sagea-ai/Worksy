import { PrismaClient, UserType, ExperienceLevel } from '@prisma/client';

const prisma = new PrismaClient();

// Nepali names and data
const nepaliStudents = [
  {
    firstName: 'Raj',
    lastName: 'Shrestha',
    email: 'raj.shrestha@example.com',
    skills: ['JavaScript', 'React', 'Node.js', 'Web Development', 'HTML', 'CSS'],
    experienceLevel: ExperienceLevel.INTERMEDIATE,
    hourlyRateMin: 15,
    hourlyRateMax: 35,
    availability: 'full-time',
    bio: 'Experienced full-stack developer specializing in React and Node.js. Passionate about building modern web applications.',
    location: 'Kathmandu, Nepal',
    preferredPlatforms: ['upwork', 'freelancer'],
  },
  {
    firstName: 'Priya',
    lastName: 'Karki',
    email: 'priya.karki@example.com',
    skills: ['Python', 'Data Science', 'Machine Learning', 'Data Analysis', 'SQL'],
    experienceLevel: ExperienceLevel.ADVANCED,
    hourlyRateMin: 25,
    hourlyRateMax: 50,
    availability: 'part-time',
    bio: 'Data scientist with expertise in Python and machine learning. Strong background in data analysis and predictive modeling.',
    location: 'Pokhara, Nepal',
    preferredPlatforms: ['upwork', 'fiverr'],
  },
  {
    firstName: 'Aman',
    lastName: 'Bhattarai',
    email: 'aman.bhattarai@example.com',
    skills: ['PHP', 'WordPress', 'Web Development', 'SEO', 'HTML', 'CSS'],
    experienceLevel: ExperienceLevel.INTERMEDIATE,
    hourlyRateMin: 12,
    hourlyRateMax: 30,
    availability: 'project-based',
    bio: 'WordPress developer with 3+ years of experience. Expert in custom themes and plugins development.',
    location: 'Kathmandu, Nepal',
    preferredPlatforms: ['freelancer', 'upwork'],
  },
  {
    firstName: 'Sita',
    lastName: 'Thapa',
    email: 'sita.thapa@example.com',
    skills: ['Graphic Design', 'Logo Design', 'Photoshop', 'UI/UX Design', 'Adobe Illustrator'],
    experienceLevel: ExperienceLevel.ADVANCED,
    hourlyRateMin: 20,
    hourlyRateMax: 45,
    availability: 'full-time',
    bio: 'Creative graphic designer specializing in branding and UI/UX design. Award-winning portfolio with 100+ completed projects.',
    location: 'Lalitpur, Nepal',
    preferredPlatforms: ['fiverr', 'upwork'],
  },
  {
    firstName: 'Bikash',
    lastName: 'Tamang',
    email: 'bikash.tamang@example.com',
    skills: ['Content Writing', 'Blog Writing', 'Copywriting', 'SEO Writing', 'Technical Writing'],
    experienceLevel: ExperienceLevel.INTERMEDIATE,
    hourlyRateMin: 10,
    hourlyRateMax: 25,
    availability: 'full-time',
    bio: 'Professional content writer with expertise in SEO and technical documentation. Native English speaker.',
    location: 'Kathmandu, Nepal',
    preferredPlatforms: ['upwork', 'freelancer'],
  },
  {
    firstName: 'Saraswati',
    lastName: 'Pandey',
    email: 'saraswati.pandey@example.com',
    skills: ['React', 'JavaScript', 'TypeScript', 'Next.js', 'Web Development', 'Node.js'],
    experienceLevel: ExperienceLevel.EXPERT,
    hourlyRateMin: 30,
    hourlyRateMax: 60,
    availability: 'full-time',
    bio: 'Senior frontend developer with 5+ years of experience in React ecosystem. Building scalable and performant web applications.',
    location: 'Kathmandu, Nepal',
    preferredPlatforms: ['upwork', 'toptal'],
  },
  {
    firstName: 'Deepak',
    lastName: 'Lama',
    email: 'deepak.lama@example.com',
    skills: ['Python', 'Django', 'Web Development', 'REST API', 'PostgreSQL', 'JavaScript'],
    experienceLevel: ExperienceLevel.ADVANCED,
    hourlyRateMin: 22,
    hourlyRateMax: 45,
    availability: 'part-time',
    bio: 'Full-stack Python developer specializing in Django and REST APIs. Strong background in database design and optimization.',
    location: 'Bhaktapur, Nepal',
    preferredPlatforms: ['upwork', 'freelancer'],
  },
  {
    firstName: 'Anjali',
    lastName: 'Maharjan',
    email: 'anjali.maharjan@example.com',
    skills: ['Mobile App Development', 'Flutter', 'iOS Development', 'Android Development', 'Dart'],
    experienceLevel: ExperienceLevel.INTERMEDIATE,
    hourlyRateMin: 18,
    hourlyRateMax: 40,
    availability: 'full-time',
    bio: 'Mobile app developer with expertise in Flutter. Building cross-platform mobile applications for iOS and Android.',
    location: 'Kathmandu, Nepal',
    preferredPlatforms: ['upwork', 'fiverr'],
  },
  {
    firstName: 'Niraj',
    lastName: 'Gurung',
    email: 'niraj.gurung@example.com',
    skills: ['Digital Marketing', 'Social Media Marketing', 'Facebook Ads', 'Google Ads', 'SEO', 'Content Marketing'],
    experienceLevel: ExperienceLevel.ADVANCED,
    hourlyRateMin: 15,
    hourlyRateMax: 35,
    availability: 'part-time',
    bio: 'Digital marketing specialist with proven track record in social media advertising and SEO. Helped 50+ businesses grow online.',
    location: 'Kathmandu, Nepal',
    preferredPlatforms: ['upwork', 'freelancer'],
  },
  {
    firstName: 'Pooja',
    lastName: 'Shakya',
    email: 'pooja.shakya@example.com',
    skills: ['Data Entry', 'Excel', 'Virtual Assistant', 'Administrative Support', 'Data Analysis'],
    experienceLevel: ExperienceLevel.BEGINNER,
    hourlyRateMin: 8,
    hourlyRateMax: 20,
    availability: 'full-time',
    bio: 'Reliable virtual assistant with strong organizational skills. Proficient in Excel, data entry, and administrative tasks.',
    location: 'Kathmandu, Nepal',
    preferredPlatforms: ['upwork', 'fiverr'],
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Delete existing seed users (optional - comment out if you want to keep them)
  // await prisma.user.deleteMany({
  //   where: {
  //     email: {
  //       contains: '@example.com',
  //     },
  //   },
  // });

  console.log('👥 Creating 10 Nepali student users...');

  for (const studentData of nepaliStudents) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: studentData.email },
      });

      if (existingUser) {
        console.log(`⏭️  User ${studentData.email} already exists, skipping...`);
        continue;
      }

      // Create user with a unique clerkId (using email as base for uniqueness)
      const clerkId = `seed_${studentData.email.replace('@', '_').replace('.', '_')}_${Date.now()}`;

      const user = await prisma.user.create({
        data: {
          clerkId: clerkId,
          email: studentData.email,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          userType: UserType.STUDENT,
          onboardingCompleted: true,
          profile: {
            create: {
              selectedSkills: studentData.skills,
              experienceLevel: studentData.experienceLevel,
              preferredPlatforms: studentData.preferredPlatforms,
              hourlyRateMin: studentData.hourlyRateMin,
              hourlyRateMax: studentData.hourlyRateMax,
              availability: studentData.availability,
              bio: studentData.bio,
              location: studentData.location,
            },
          },
        },
      });

      console.log(`✅ Created user: ${studentData.firstName} ${studentData.lastName} (${studentData.email})`);
    } catch (error) {
      console.error(`❌ Error creating user ${studentData.email}:`, error);
    }
  }

  console.log('✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

