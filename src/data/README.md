# Services Data Management

This directory contains the services data for the government portal. The data is now managed in YAML format for easier editing by non-technical users.

## Files

- `services.yaml` - The main data file in YAML format (human-readable, easy to edit)
- `servicesLoader.ts` - Loads and parses the YAML file for the application
- `services.json` - Auto-generated JSON file (backup/fallback)
- `README.md` - This documentation file

## How to Edit Services Data

### For Non-Technical Users

1. **Edit the YAML file**: Open `services.yaml` in any text editor
2. **Follow the structure**: The file has a clear hierarchy:
   - `categories` - List of service categories
   - Each category has:
     - `category` - The display name
     - `slug` - URL-friendly identifier (lowercase, hyphens)
     - `subcategories` - List of services within the category
3. **Add new services**: Simply add new entries under the appropriate category
4. **Remove services**: Delete the entire entry (including the `-` at the beginning)
5. **Modify services**: Change the `name` or `slug` fields

### YAML Formatting Tips

- **Indentation matters**: Use 2 spaces for each level
- **Lists start with `-`**: Each category and subcategory starts with a dash
- **No commas needed**: Unlike JSON, YAML doesn't require commas
- **Comments allowed**: Lines starting with `#` are comments and will be ignored
- **Quotes optional**: For simple text, quotes are not required

### Example: Adding a New Service

```yaml
- category: 'New Category'
  slug: 'new-category'
  subcategories:
    - name: 'New Service'
      slug: 'new-service'
    - name: 'Another Service'
      slug: 'another-service'
```

## Development Workflow

1. Edit `services.yaml` with your changes
2. The application automatically loads the YAML file directly - no conversion needed!
3. Changes are reflected immediately in development mode

## File Structure

```yaml
categories:
  - category: 'Category Name' # Display name
    slug: 'category-slug' # URL identifier
    subcategories:
      - name: 'Service Name' # Display name
        slug: 'service-slug' # URL identifier
```

## Benefits of YAML Format

- ✅ **Human-readable**: Easy to understand the structure
- ✅ **No syntax errors**: More forgiving than JSON
- ✅ **Comments supported**: Can add explanatory notes
- ✅ **Better hierarchy**: Clear visual structure with indentation
- ✅ **Easy editing**: No need to worry about commas, brackets, or quotes
