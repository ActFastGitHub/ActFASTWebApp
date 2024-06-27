// updateProjectStatus.js
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function updateProjectStatus() {
  try {
    // Update all projects to have the projectStatus set to "Not Started"
    const result = await prisma.project.updateMany({
      data: {
        projectStatus: 'Not Started',
      },
    });

    console.log(`Updated ${result.count} projects`);
  } catch (error) {
    console.error('Error updating project status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateProjectStatus();
