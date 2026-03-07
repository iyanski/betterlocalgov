# 🏛️ Local Government Website Starter Kit

A modern, multilingual, and accessible website template designed specifically for local government units (LGUs) in the Philippines. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **🌐 Multilingual Support**: English, Filipino, Cebuano, and other Philippine languages
- **📱 Responsive Design**: Mobile-first approach with modern UI/UX
- **♿ Accessibility**: WCAG 2.1 compliant design
- **📝 Content Management**: YAML-based content system for easy updates
- **🎨 Customizable**: Easy theming and branding customization
- **⚡ Fast Performance**: Built with Vite for optimal loading speeds
- **🔍 SEO Optimized**: Built-in SEO best practices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Fork the repository**
   - Visit https://github.com/iyanski/betterlocalgov
   - Click the "Fork" button in the top right
   - This creates your own copy of the repository

2. **Clone your forked repository**

   ```bash
   git clone https://github.com/YOUR-USERNAME/betterlocalgov.git
   cd betterlocalgov
   ```

   Replace `YOUR-USERNAME` with your GitHub username.

3. **Add upstream remote** (to get updates from the original repo)

   ```bash
   git remote add upstream https://github.com/iyanski/betterlocalgov.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

5. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your government information:

   ```env
   VITE_GOVERNMENT_NAME="Your City/Municipality Name"
   VITE_GOVERNMENT_TYPE="City" # or "Municipality"
   VITE_REGION="Region VII"
   VITE_PROVINCE="Cebu"
   VITE_WEBSITE_URL="https://your-website.gov.ph"
   VITE_CONTACT_EMAIL="info@your-website.gov.ph"
   VITE_CONTACT_PHONE="(032) 123-4567"
   ```

6. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## 🛠️ Customization Guide

### 1. Government Branding

#### Update Colors and Theme

Edit `tailwind.config.js` to match your government's colors:

```javascript
colors: {
  primary: {
    500: '#your-primary-color',
    // ... other shades
  },
  secondary: {
    500: '#your-secondary-color',
    // ... other shades
  }
}
```

#### Update Logo and Images

- Replace `public/logo.svg` with your government logo
- Update `public/favicon.ico` with your government's favicon
- Add your government's images to `public/images/`
- Create a custom Open Graph image (`public/og-image.jpg`) for social media sharing
- Use `public/og-image-template.html` as a starting point for your OG image

### 2. Content Configuration

#### Government Information

Edit `src/data/government.yaml`:

```yaml
name: 'Your City/Municipality Name'
type: 'City' # or "Municipality"
region: 'Region VII'
province: 'Cebu'
mayor: "Your Mayor's Name"
vice_mayor: "Your Vice Mayor's Name"
established: '1950'
population: '500,000'
area: '58.10 km²'
```

#### Services Configuration

Edit `src/data/services.yaml` to customize service categories:

```yaml
categories:
  - category: 'Health Services'
    slug: 'health-services'
    description: 'Your health services description'
    icon: 'Heart'
```

### 3. Content Management

#### Adding New Services

1. Create a new folder in `content/services/`
2. Add an `index.yaml` file with service pages
3. Create markdown files for each service
4. Update `src/data/services.yaml` to include the new category

#### Content Writing Guidelines

- Use clear, simple language
- Include step-by-step instructions
- Add contact information and requirements
- Use tables for structured information
- Include relevant links and resources

## 📝 Content Writing Guide

### Service Page Structure

Each service page should follow this structure:

```markdown
# Service Title — Your City Name

Brief description of the service.

---

## 1. Service Details

| Information  | Details         |
| ------------ | --------------- |
| Where        | Location/Office |
| When         | Schedule/Hours  |
| Requirements | What to bring   |
| Cost         | Fees (if any)   |

---

## How to Apply

1. Step 1
2. Step 2
3. Step 3

---

## Contact Information

- **Office**: [Office Name]
- **Address**: [Full Address]
- **Phone**: [Phone Number]
- **Email**: [Email Address]
- **Hours**: [Operating Hours]
```

### Content Best Practices

1. **Use Local Language**: Write in the language your constituents understand
2. **Be Specific**: Include exact locations, phone numbers, and requirements
3. **Keep Updated**: Regularly review and update information
4. **Use Visuals**: Add images, maps, and diagrams when helpful
5. **Test User Journey**: Walk through the process as a citizen would

## 🌐 Multilingual Support

### Adding New Languages

1. **Add language to configuration**
   Edit `src/i18n/languages.ts`:

   ```typescript
   export const LANGUAGES: Record<LanguageType, LanguageInfo> = {
     en: { code: 'en', name: 'English', nativeName: 'English' },
     your_lang: {
       code: 'your_lang',
       name: 'Your Language',
       nativeName: 'Native Name',
     },
   };
   ```

2. **Create translation files**
   - Copy `src/i18n/locales/en.json` to `src/i18n/locales/your_lang.json`
   - Translate all text content

3. **Update content files**
   - Create translated versions of your content files
   - Use the same folder structure with language prefixes

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to Vercel**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Set environment variables in Vercel dashboard

2. **Environment Variables**
   Set these in your Vercel project settings:

   ```
   VITE_GOVERNMENT_NAME=Your City Name
   VITE_GOVERNMENT_TYPE=City
   VITE_REGION=Your Region
   VITE_PROVINCE=Your Province
   VITE_WEBSITE_URL=https://your-domain.vercel.app
   VITE_CONTACT_EMAIL=info@your-city.gov.ph
   VITE_CONTACT_PHONE=(032) 123-4567
   ```

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch
   - Custom domain can be configured in Vercel dashboard

### Deploy to Other Platforms

#### Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

#### GitHub Pages

```bash
npm run build
# Push dist/ folder to gh-pages branch
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run convert-yaml` - Convert YAML to JSON

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── home/           # Home page components
│   ├── layout/         # Layout components (Navbar, Footer)
│   ├── sections/       # Page sections
│   └── ui/             # Basic UI components
├── data/               # Content and configuration
│   ├── content/        # Markdown content files
│   └── *.yaml          # Configuration files
├── hooks/              # Custom React hooks
├── i18n/               # Internationalization
├── lib/                # Utility functions
├── pages/              # Page components
└── types/              # TypeScript type definitions
```

## 🤝 Contributing

### For Content Contributors

1. **Fork the repository** on GitHub (click "Fork" at https://github.com/iyanski/betterlocalgov)
2. **Clone your fork**: `git clone https://github.com/YOUR-USERNAME/betterlocalgov.git`
3. **Add upstream remote**: `git remote add upstream https://github.com/iyanski/betterlocalgov.git`
4. **Create a content branch**: `git checkout -b content/update-health-services`
5. **Edit content files** in `content/`
6. **Test your changes**: `npm run dev`
7. **Submit a pull request**

### For Developers

1. **Fork the repository** on GitHub (click "Fork" at https://github.com/iyanski/betterlocalgov)
2. **Clone your fork**: `git clone https://github.com/YOUR-USERNAME/betterlocalgov.git`
3. **Add upstream remote**: `git remote add upstream https://github.com/iyanski/betterlocalgov.git`
4. **Create a feature branch**: `git checkout -b feature/new-component`
5. **Make your changes**
6. **Run tests**: `npm run lint && npm run build`
7. **Submit a pull request**

### Keeping Your Fork Updated

To get the latest changes from the original repository:

```bash
# Fetch the latest changes from upstream
git fetch upstream

# Switch to your main branch
git checkout main

# Merge upstream changes into your main branch
git merge upstream/main

# Push updates to your fork on GitHub
git push origin main
```

**Best Practice**: Always sync your fork before creating a new branch for contributions.

## 📋 Content Checklist

Before publishing content, ensure:

- [ ] All contact information is current
- [ ] Requirements and procedures are accurate
- [ ] Links are working
- [ ] Content is in appropriate languages
- [ ] Images have alt text
- [ ] Tables are properly formatted
- [ ] Contact information is consistent

## 🆘 Support

### Getting Help

- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

### Common Issues

**Build Errors**

- Ensure all environment variables are set
- Check that all YAML files are valid
- Verify all required files exist

**Content Not Loading**

- Check file paths in YAML configuration
- Ensure markdown files are properly formatted
- Verify content file permissions

**Styling Issues**

- Check Tailwind CSS classes
- Verify custom CSS is properly imported
- Ensure responsive design is working

## 📄 License

This project is licensed under the Creative Commons Zero (CC0) License - see the [LICENSE](LICENSE) file for details.

**CC0 License Benefits:**

- **Public Domain**: No restrictions on use, modification, or distribution
- **Government Friendly**: Perfect for public sector projects
- **Maximum Reusability**: Anyone can use, modify, and distribute freely
- **No Attribution Required**: Though attribution is appreciated

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide React](https://lucide.dev/)
- Content management with [YAML](https://yaml.org/)
- Internationalization with [i18next](https://www.i18next.com/)

---

**Made with ❤️ for Philippine Local Government Units**
