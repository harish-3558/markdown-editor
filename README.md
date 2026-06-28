# 📝 Markdown Editor
 
A lightweight, real-time Markdown editor with live preview built with TypeScript and Vite. Write Markdown on the left side and instantly see the rendered HTML preview on the right.
 
---
 
## Features
 
✨ **Real-time Preview** - See your Markdown rendered instantly as you type
 
📊 **Markdown Support** - Full support for common Markdown syntax:
- Headings (H1-H6)
- Bold, italic, and strikethrough text
- Code blocks with syntax highlighting
- Inline code
- Blockquotes
- Unordered and ordered lists
- Tables
- Horizontal rules
- Links and images
📈 **Live Statistics** - Word count and character count displayed in the footer
 
🎯 **Clean UI** - Split-pane interface with a distraction-free writing experience
 
⚡ **Fast & Responsive** - Built with TypeScript and Vite for optimal performance
 
---
 
## Getting Started
 
### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
### Installation
 
1. Clone or download this repository
2. Navigate to the project directory:
````bash
   cd MarkDown
````
3. Install dependencies:
````bash
   npm install
````
 
### Running Locally
 
Start the development server:
````bash
npm run dev
````
 
The editor will be available at `http://localhost:5173` (or the port Vite assigns)
 
---
 
## Building for Production
 
Create an optimized production build:
````bash
npm run build
````
 
The output will be generated in the `dist/` directory.
 
### Preview Production Build
 
To preview the production build locally:
````bash
npm run preview
````
 
---
 
## Project Structure
 
````
├── index.html       # Main HTML template
├── main.ts          # TypeScript source code (Markdown parser & editor logic)
├── main.js          # Plain JavaScript version (works with Go Live)
├── style.css        # Stylesheet
├── package.json     # Project dependencies and scripts
├── tsconfig.json    # TypeScript configuration
└── README.md        # This file
````
 
---
 
## How It Works
 
1. **Editor** - Type Markdown in the left textarea
2. **Parser** - The `parseMarkdown()` function converts Markdown text to HTML
3. **Preview** - Rendered HTML appears in the right panel
4. **Stats** - Word and character counts update in real-time
---
 
## Markdown Syntax Examples
 
### Headings
````markdown
# H1 Heading
## H2 Heading
### H3 Heading
````
 
### Text Formatting
````markdown
**Bold text**
*Italic text*
~~Strikethrough~~
````
 
### Code
````markdown
`Inline code`
 
```javascript
console.log("Hello World");
```
````
 
### Lists
````markdown
- Item 1
- Item 2
 
1. First
2. Second
````
 
### Blockquotes
````markdown
> This is a quote
````
 
### Tables
````markdown
| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
````
 
---
 
## Technologies Used
 
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation build tool
- **HTML5 & CSS3** - Modern web standards
- **DOM API** - For real-time updates