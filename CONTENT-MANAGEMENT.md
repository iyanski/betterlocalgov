# Content Management Guide for Non-Technical Users

This guide will help you edit and manage content for the Better Local Government website using GitHub's web interface, without needing to install any software or use command-line tools.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding the Content Structure](#understanding-the-content-structure)
3. [Editing Content Files](#editing-content-files)
4. [Adding New Services](#adding-new-services)
5. [Markdown Formatting Guide](#markdown-formatting-guide)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### What You Need

- A GitHub account (free)
- Access to the project repository
- Basic computer skills (typing, copy/paste, saving files)

### What You DON'T Need

- Git software
- Command line knowledge
- Programming experience
- Any special software installation

---

## Understanding the Content Structure

The website content is organized in folders by service categories. Here's how it works:

```
content/services/
├── agriculture-fisheries/
├── business/
├── disaster-preparedness/
├── education/
├── environment/
├── garbage-waste-disposal/
├── health-services/
├── housing-land-use/
├── infrastructure-public-works/
└── social-welfare/
```

### Two Types of Files

1. **Index Files** (`index.yaml`) - These list all the services in a category
2. **Content Files** (`.md` files) - These contain the actual service information

---

## Editing Content Files

### Step 1: Navigate to the File

1. Go to the GitHub repository in your web browser
2. Click on the `src` folder
3. Click on `data` folder
4. Click on `content` folder
5. Click on `services` folder
6. Choose the category folder (e.g., `education`)
7. Click on the file you want to edit (e.g., `apply-for-local-scholarships.md`)

### Step 2: Edit the File

1. Click the **pencil icon** (✏️) in the top-right corner of the file view
2. Make your changes in the text editor
3. Scroll down to the bottom of the page

### Step 3: Save Your Changes

1. In the "Commit changes" section at the bottom:
   - **Commit message**: Write a brief description of what you changed
   - Example: "Updated scholarship application requirements"
2. Click **"Commit changes"** button

### Step 4: Verify Your Changes

1. The page will refresh and show your updated content
2. You can see the changes in the file history

---

## Adding New Services

### Method 1: Adding a New Service to an Existing Category

#### Step 1: Create the Content File

1. Navigate to the category folder (e.g., `education`)
2. Click **"Add file"** → **"Create new file"**
3. Name the file using this format: `your-service-name.md`
   - Use lowercase letters and hyphens
   - Example: `apply-for-summer-job-programs.md`
4. Add your content using the markdown format (see formatting guide below)
5. Click **"Commit new file"**

#### Step 2: Update the Index File

1. Go back to the category folder
2. Click on `index.yaml`
3. Click the pencil icon to edit
4. Add your new service to the list:

```yaml
pages:
  - name: 'Your Service Name'
    slug: 'your-service-name'
    description: 'Brief description of the service.'
```

5. Save the changes

### Method 2: Creating a New Category

#### Step 1: Create the Category Folder

1. Go to `content/services/`
2. Click **"Add file"** → **"Create new file"**
3. Name it: `your-category-name/index.yaml`
4. Add the basic structure:

```yaml
# Your Category Name Pages
# This file contains all the pages/services available under the Your Category Name category

pages:
  - name: 'Your First Service'
    slug: 'your-first-service'
    description: 'Description of your first service.'
```

#### Step 2: Create Service Content Files

Follow the same process as Method 1 to add individual service files.

---

## Markdown Formatting Guide

Markdown is a simple way to format text. Here are the most common formatting options:

### Headers

```markdown
# Main Title (largest)

## Section Title

### Subsection Title

#### Smaller Title
```

### Text Formatting

```markdown
**Bold text**
_Italic text_
`Code or special terms`
```

### Lists

```markdown
- Bullet point 1
- Bullet point 2
  - Sub-bullet point

1. Numbered list item 1
2. Numbered list item 2
```

### Links

```markdown
[Link text](https://example.com)
```

### Tables

```markdown
| Column 1     | Column 2     | Column 3     |
| ------------ | ------------ | ------------ |
| Row 1, Col 1 | Row 1, Col 2 | Row 1, Col 3 |
| Row 2, Col 1 | Row 2, Col 2 | Row 2, Col 3 |
```

### Horizontal Lines

```markdown
---
```

### Blockquotes

```markdown
> This is a quote or important note
```

---

## Best Practices

### Content Writing Tips

1. **Use Clear, Simple Language**
   - Write for the general public
   - Avoid technical jargon
   - Use short sentences and paragraphs

2. **Be Specific and Helpful**
   - Include exact steps to follow
   - Mention required documents
   - Provide contact information when possible

3. **Include Practical Information**
   - Office hours
   - Required documents
   - Processing time
   - Fees (if any)
   - Contact details

### File Organization

1. **Use Descriptive File Names**
   - `apply-for-local-scholarships.md` ✅
   - `scholarship.md` ❌

2. **Keep Descriptions Short**
   - Index file descriptions should be 1-2 sentences
   - Focus on what the service does

3. **Maintain Consistency**
   - Use the same format for similar services
   - Follow the existing structure

### Content Structure Template

```markdown
# Service Name — Location

Brief introduction explaining what this service is for.

---

## What You Need to Know

Key information about the service.

## Requirements

- List of required documents
- Eligibility criteria
- Any prerequisites

## How to Apply

### Step 1: Prepare Documents

- List required documents

### Step 2: Submit Application

- Where to go
- What to bring
- Processing time

### Step 3: Follow Up

- How to check status
- What happens next

## Important Notes

- Any special considerations
- Deadlines
- Contact information

## Related Services

- Links to other relevant services
```

---

## Troubleshooting

### Common Issues and Solutions

#### "I can't find the file I want to edit"

- Make sure you're in the right folder path: `content/services/[category]/`
- Check if the file exists by looking at the folder contents

#### "My changes aren't showing up"

- Make sure you clicked "Commit changes" after editing
- Check that you're looking at the right file
- Wait a few minutes for changes to appear on the live site

#### "I made a mistake and want to undo changes"

- Go to the file you edited
- Click on "History" (clock icon)
- Find the version before your changes
- Click "Revert" to undo

#### "I can't create a new file"

- Make sure you have permission to edit the repository
- Check that you're in the right folder
- Try refreshing the page and starting over

#### "The formatting looks wrong"

- Check that you're using the correct markdown syntax
- Make sure there are no extra spaces or characters
- Compare with existing files that work correctly

### Getting Help

If you're still having trouble:

1. **Check existing files for examples**

- Look at similar files to see how they're formatted
- Copy the structure of working files

2. **Ask for help**

- Contact the project administrator
- Ask a colleague who has used GitHub before

3. **Start small**

- Make small changes first to get comfortable
- Practice with less important content before editing critical information

---

## Quick Reference

### Essential Markdown Commands

- `#` = Large header
- `##` = Medium header
- `**text**` = Bold
- `*text*` = Italic
- `- item` = Bullet point
- `[link](url)` = Link
- `---` = Horizontal line

### File Naming Rules

- Use lowercase letters
- Use hyphens instead of spaces
- Be descriptive but concise
- Match the slug in the index file

### Common File Paths

- Education services: `content/services/education/`
- Health services: `content/services/health-services/`
- Business services: `content/services/business/`

---

_This guide is designed to help non-technical users manage content effectively. If you need additional help or have suggestions for improving this guide, please contact the project administrator._
