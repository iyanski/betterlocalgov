import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default organization without user references initially
  const defaultOrg = await prisma.organization.create({
    data: {
      name: 'Default Organization',
      slug: 'default',
      description: 'Default organization for the CMS',
      domain: null,
    },
  });

  console.log('✅ Default organization created:', defaultOrg.name);

  // Create admin user (OWNER)
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.OWNER,
      organizationId: defaultOrg.id,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Update the organization to have the admin as creator/updater
  await prisma.organization.update({
    where: { id: defaultOrg.id },
    data: {
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  // Create sample content types
  const blogPostType = await prisma.contentType.create({
    data: {
      name: 'Blog Post',
      slug: 'blog-post',
      description:
        'A blog post content type with title, content, and featured image',
      organizationId: defaultOrg.id,
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          placeholder: 'Enter the post title',
        },
        {
          name: 'content',
          label: 'Content',
          type: 'textarea',
          required: true,
          placeholder: 'Write your blog post content here...',
        },
        {
          name: 'excerpt',
          label: 'Excerpt',
          type: 'textarea',
          required: false,
          placeholder: 'A brief summary of the post',
        },
        {
          name: 'featuredImage',
          label: 'Featured Image',
          type: 'media',
          required: false,
        },
        {
          name: 'tags',
          label: 'Tags',
          type: 'text',
          required: false,
          placeholder: 'Enter tags separated by commas',
        },
      ],
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  console.log('✅ Blog Post content type created');

  const pageType = await prisma.contentType.create({
    data: {
      name: 'Page',
      slug: 'page',
      description: 'A static page content type',
      organizationId: defaultOrg.id,
      fields: [
        {
          name: 'title',
          label: 'Title',
          type: 'text',
          required: true,
          placeholder: 'Enter the page title',
        },
        {
          name: 'content',
          label: 'Content',
          type: 'textarea',
          required: true,
          placeholder: 'Write your page content here...',
        },
        {
          name: 'metaDescription',
          label: 'Meta Description',
          type: 'textarea',
          required: false,
          placeholder: 'SEO meta description',
        },
      ],
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  console.log('✅ Page content type created');

  // Create sample categories
  const technologyCategory = await prisma.category.create({
    data: {
      name: 'Technology',
      slug: 'technology',
      description: 'Technology related content',
      color: '#3B82F6',
      organizationId: defaultOrg.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const businessCategory = await prisma.category.create({
    data: {
      name: 'Business',
      slug: 'business',
      description: 'Business and entrepreneurship content',
      color: '#10B981',
      organizationId: defaultOrg.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  await prisma.category.create({
    data: {
      name: 'Lifestyle',
      slug: 'lifestyle',
      description: 'Lifestyle and personal development content',
      color: '#F59E0B',
      organizationId: defaultOrg.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  console.log('✅ Categories created');

  // Create sample tags
  const javascriptTag = await prisma.tag.create({
    data: {
      name: 'JavaScript',
      slug: 'javascript',
      description: 'JavaScript related content',
      color: '#F7DF1E',
      organizationId: defaultOrg.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  await prisma.tag.create({
    data: {
      name: 'React',
      slug: 'react',
      description: 'React framework content',
      color: '#61DAFB',
      organizationId: defaultOrg.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  await prisma.tag.create({
    data: {
      name: 'Node.js',
      slug: 'nodejs',
      description: 'Node.js related content',
      color: '#339933',
      organizationId: defaultOrg.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const cmsTag = await prisma.tag.create({
    data: {
      name: 'CMS',
      slug: 'cms',
      description: 'Content Management System content',
      color: '#8B5CF6',
      organizationId: defaultOrg.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  console.log('✅ Tags created');

  // Create sample content with categories and tags
  await prisma.content.create({
    data: {
      title: 'Welcome to Our Headless CMS',
      slug: 'welcome-to-our-cms',
      content: {
        title: 'Welcome to Our Headless CMS',
        content:
          'This is your first blog post created with our headless CMS. You can now create, edit, and manage your content through the API.',
        excerpt: 'A warm welcome to our new headless CMS platform.',
        tags: 'cms, headless, api',
      },
      status: 'PUBLISHED',
      publishedAt: new Date(),
      contentTypeId: blogPostType.id,
      organizationId: defaultOrg.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      categories: {
        create: [{ categoryId: technologyCategory.id }],
      },
      tags: {
        create: [{ tagId: cmsTag.id }, { tagId: javascriptTag.id }],
      },
    },
  });

  console.log('✅ Sample blog post created with categories and tags');

  await prisma.content.create({
    data: {
      title: 'About Us',
      slug: 'about',
      content: {
        title: 'About Us',
        content:
          'This is a sample about page. You can customize this content to match your needs.',
        metaDescription: 'Learn more about our company and mission.',
      },
      status: 'PUBLISHED',
      publishedAt: new Date(),
      contentTypeId: pageType.id,
      organizationId: defaultOrg.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
      categories: {
        create: [{ categoryId: businessCategory.id }],
      },
    },
  });

  console.log('✅ Sample page created with categories');

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Login Credentials:');
  console.log('   Email: admin@example.com');
  console.log('   Password: admin123');
  console.log('   Role: OWNER');
  console.log('   Organization: Default Organization');
  console.log('');
  console.log('🔗 API Documentation: http://localhost:3000/api/docs');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
