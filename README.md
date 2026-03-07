# 🏛️ Local Government Website Starter Kit

A modern, multilingual, and accessible website template designed specifically for local government units (LGUs) in the Philippines. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **🌐 Multilingual Support**: English, Filipino, Cebuano, and other Philippine languages
- **📱 Responsive Design**: Mobile-first approach with modern UI/UX
- **♿ Accessibility**: WCAG 2.1 compliant design
- **📝 Content Management**: YAML-based content system for easy updates
- **🎨 Customizable**: Easy theming and branding customization
- **⚡ Fast Performance**: Built with Vite for optimal loading speeds
- **🔍 SEO Optimized**: Built-in SEO with react-helmet, meta tags, and Open Graph support

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

5. **Run the setup script**

   ```bash
   npm run setup
   ```

   This will guide you through configuring your government's information.

6. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

## 📚 Documentation

- **[STARTER-KIT-README.md](STARTER-KIT-README.md)** - Complete setup and customization guide
- **[CONTENT-GUIDE.md](CONTENT-GUIDE.md)** - Content writing and contribution guidelines
- **[CONTENT-MANAGEMENT.md](CONTENT-MANAGEMENT.md)** - Guide for non-technical users to edit and manage website content
- **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - Deployment instructions for Vercel and other platforms
- **[STARTER-KIT-SUMMARY.md](STARTER-KIT-SUMMARY.md)** - Audit results and implementation summary
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes

## 🎯 Perfect For

- **Local Government Units** (Cities, Municipalities, Provinces)
- **Government IT Departments** looking for modern web solutions
- **Web Development Agencies** serving government clients
- **Civic Technology Organizations** building government tools
- **Government Officials** wanting professional online presence

## ⚡ Quick Setup (3-5 hours to live website)

1. **Fork & Clone** (5 minutes)
   - Fork the repository on GitHub (click "Fork" at https://github.com/iyanski/betterlocalgov)
   - Clone your fork:

   ```bash
   git clone https://github.com/YOUR-USERNAME/betterlocalgov.git
   cd betterlocalgov
   git remote add upstream https://github.com/iyanski/betterlocalgov.git
   npm install
   ```

   Replace `YOUR-USERNAME` with your GitHub username.

2. **Configure Your Government** (15 minutes)

   ```bash
   npm run setup
   # Interactive setup guides you through configuration
   ```

3. **Customize Content** (2-4 hours)
   - Edit service information in `content/services/`
   - Add government department info in `content/government/`
   - Update contact information and branding

4. **Deploy to Production** (15 minutes)
   - Connect to Vercel for free hosting
   - Set up custom domain (optional)
   - Your website is live!

## 🌟 What Makes This Different

### **Built for Philippine LGUs**

- **Multilingual**: English, Filipino, Cebuano, and other local languages
- **Local Context**: Designed for Philippine government structure
- **Cultural Sensitivity**: Respects local customs and practices
- **Accessibility**: WCAG 2.1 compliant for all citizens

### **Non-Technical Friendly**

- **YAML Content Management**: Easy content updates without coding
- **Visual Setup**: Interactive configuration process
- **Clear Documentation**: Step-by-step guides for everything
- **Template System**: Pre-built content templates

### **Modern & Professional**

- **Mobile-First**: Works perfectly on all devices
- **Fast Loading**: Optimized for performance
- **SEO Ready**: Built-in search engine optimization
- **Secure**: Modern security best practices

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run setup` - Run setup script for new installations
- `npm run convert-yaml` - Convert YAML to JSON
- `npm run dev:yaml` - Convert YAML and start dev server

### Project Structure

```
content/
├── government/         # Government section markdown & YAML
│   └── departments/    # Department pages (executive, legislative, etc.)
└── services/           # Services section markdown & YAML

src/
├── components/         # Reusable UI components
│   ├── home/           # Home page components
│   ├── layout/         # Layout components (Navbar, Footer)
│   └── ui/             # Basic UI components
├── data/               # YAML configuration (services.yaml, government.yaml)
├── i18n/               # Internationalization
├── lib/                # Utility functions (markdownLoader, yamlLoader)
├── pages/              # Page components (Home, Services, Government, Document)
└── types/              # TypeScript type definitions
```

## 👥 Contributors

- **[iyanski](https://github.com/iyanski)** — Project creator and maintainer
- **[Nicu Listana](https://github.com/niculistana)** — Contributor

## 🤝 Contributing

We welcome contributions from everyone! Whether you're a developer, government official, or community member, there are many ways to help improve this project.

### 🌟 For Non-Technical Contributors

**No coding experience required!** You can contribute valuable content and improvements using GitHub's web interface.

#### Quick Start for Non-Technical Users

1. **Create a GitHub account** (free at github.com)
2. **Navigate to the repository** in your web browser
3. **Use our detailed guide**: [CONTENT-MANAGEMENT.md](CONTENT-MANAGEMENT.md) - Complete step-by-step instructions for editing content without any technical knowledge

#### What You Can Contribute

- **📝 Content Updates**: Fix outdated information, add new services, improve descriptions
- **🌐 Translations**: Help translate content to Filipino, Cebuano, or other local languages
- **📋 Service Information**: Add details about government services, requirements, and processes
- **🔍 Content Review**: Check for accuracy, clarity, and completeness
- **💡 Suggestions**: Propose new features or improvements

#### How to Contribute (No Git Required)

1. **Find content to edit**:
   - Go to `content/services/` for service pages or `content/government/` for department pages
   - Choose a category (health, education, business, departments, etc.)
   - Click on any `.md` file to edit

2. **Make your changes**:
   - Click the pencil icon (✏️) to edit
   - Update the content using simple text formatting
   - Add new information, fix errors, or improve clarity

3. **Save your changes**:
   - Write a brief description of what you changed
   - Click "Commit changes"
   - Your changes will be reviewed and merged

#### Content Types You Can Edit

- **Service Descriptions**: How to apply for permits, scholarships, health services
- **Requirements**: Documents needed, eligibility criteria, deadlines
- **Contact Information**: Office locations, phone numbers, hours
- **Process Steps**: Step-by-step instructions for government services
- **Translations**: Help make content available in local languages

### 👨‍💻 For Technical Contributors

#### Content Contributors (Basic Technical)

1. **Fork the repository** on GitHub (click "Fork" at https://github.com/iyanski/betterlocalgov)
2. **Clone your fork**: `git clone https://github.com/YOUR-USERNAME/betterlocalgov.git`
3. **Add upstream remote**: `git remote add upstream https://github.com/iyanski/betterlocalgov.git`
4. **Create a content branch**: `git checkout -b content/update-health-services`
5. **Edit content files** in `content/`
6. **Test your changes**: `npm run dev`
7. **Submit a pull request** to the original repository

#### Developers

1. **Fork the repository** on GitHub (click "Fork" at https://github.com/iyanski/betterlocalgov)
2. **Clone your fork**: `git clone https://github.com/YOUR-USERNAME/betterlocalgov.git`
3. **Add upstream remote**: `git remote add upstream https://github.com/iyanski/betterlocalgov.git`
4. **Create a feature branch**: `git checkout -b feature/new-component`
5. **Make your changes**
6. **Run tests**: `npm run lint && npm run build`
7. **Submit a pull request** to the original repository

#### Keeping Your Fork Updated

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

### 📋 Contribution Guidelines

#### Content Guidelines

- **Accuracy First**: Ensure all information is current and correct
- **Clear Language**: Write for the general public, avoid jargon
- **Complete Information**: Include all necessary details (requirements, steps, contacts)
- **Local Context**: Consider the specific needs of your community
- **Accessibility**: Use clear headings, simple language, and logical structure

#### Technical Guidelines

- Follow existing code style and patterns
- Test your changes thoroughly
- Update documentation when needed
- Ensure mobile responsiveness
- Maintain accessibility standards

### 🎯 Priority Areas for Contribution

1. **Content Accuracy**: Update outdated information, fix errors
2. **Localization**: Translate content to Filipino, Cebuano, and other Philippine languages
3. **Service Coverage**: Add missing government services and programs
4. **User Experience**: Improve clarity and ease of use
5. **Accessibility**: Ensure content is accessible to all citizens

### 🆘 Need Help?

- **For Content Questions**: Check [CONTENT-MANAGEMENT.md](CONTENT-MANAGEMENT.md)
- **For Technical Issues**: Open an issue on GitHub
- **For General Questions**: Contact the project maintainers

### 🏆 Recognition

All contributors are recognized in our project documentation. Your contributions help make government services more accessible to all citizens!

## 📄 License

This project is licensed under the Creative Commons Zero (CC0) License - see the [LICENSE](LICENSE) file for details.

**CC0 License Benefits:**

- **Public Domain**: No restrictions on use, modification, or distribution
- **Government Friendly**: Perfect for public sector projects
- **Maximum Reusability**: Anyone can use, modify, and distribute freely
- **No Attribution Required**: Though attribution is appreciated

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS v4](https://tailwindcss.com/)
- UI components by [@bettergov/kapwa](https://github.com/bettergov/kapwa)
- Icons by [Lucide React](https://lucide.dev/)
- Content management with [YAML](https://yaml.org/)
- Internationalization with [i18next](https://www.i18next.com/)

---

**Made with ❤️ for Philippine Local Government Units**
