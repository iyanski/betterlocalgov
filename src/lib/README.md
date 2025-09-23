# Typography System

This directory contains the configurable typography system for markdown content rendering.

## Features

- **Configurable Themes**: Create custom typography themes with specific styling for each markdown element
- **Theme Switching**: Live theme switching with a dropdown selector
- **Tailwind Integration**: All themes use Tailwind CSS classes for consistent styling
- **Type Safety**: Full TypeScript support with proper type definitions

## Usage

### Basic Usage

```tsx
import Document from './pages/Document';

// Use default theme
<Document />

// Use specific theme
<Document theme="government" />
```

### Available Themes

1. **Default**: Clean, modern styling with good readability
2. **Government**: Formal, structured styling suitable for official documents
3. **Minimal**: Clean, minimal styling with light typography

### Creating Custom Themes

```typescript
import { TypographyTheme } from './typographyThemes';

const customTheme: TypographyTheme = {
  name: 'custom',
  components: {
    h1: 'text-4xl font-bold text-blue-900 mb-6',
    h2: 'text-3xl font-semibold text-blue-800 mb-4',
    p: 'text-gray-700 mb-4 leading-relaxed',
    // ... other components
  },
};
```

### Theme Configuration

Each theme can customize the following elements:

- **Headings**: h1, h2, h3, h4, h5, h6
- **Text**: p, strong, em
- **Lists**: ul, ol, li
- **Code**: code, pre
- **Links**: a
- **Quotes**: blockquote
- **Tables**: table, thead, tbody, tr, th, td
- **Other**: hr

### Adding New Themes

1. Create your theme configuration in `typographyThemes.ts`
2. Add it to the `typographyThemes` object
3. The theme will automatically appear in the theme selector

## Components

- `typographyThemes.ts`: Theme definitions and utilities
- `markdownComponents.tsx`: ReactMarkdown component mapping
- `ThemeSelector.tsx`: UI component for theme switching
- `markdownLoader.ts`: Markdown content loading utilities
