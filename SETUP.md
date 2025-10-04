# Notionify Setup Guide

This guide will help you set up and run the Notionify application locally.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js 18+**: [Download here](https://nodejs.org/)
- **npm 8+**: Comes with Node.js
- **Git**: [Download here](https://git-scm.com/)

## Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/notion-generator.git
cd notion-generator
```

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Set Up Environment Variables

### Option A: Copy the template file

```bash
cp env.template .env.local
```

Then edit `.env.local` and add your API keys.

### Option B: Create manually

Create a `.env.local` file in the root directory with the following content:

```env
# Required: Hugging Face API Key
HF_API_KEY=your_hugging_face_api_key_here

# Optional: GitHub Token for saving templates
GITHUB_TOKEN=your_github_token_here

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Get API Keys

### Hugging Face API Key (Required)

1. Go to [Hugging Face](https://huggingface.co) and create an account
2. Navigate to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Click "New token"
4. Give it a name (e.g., "Notionify")
5. Select "Read" permissions
6. Copy the token (starts with `hf_`)
7. Add it to your `.env.local` file

### GitHub Token (Optional)

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Notionify Gist")
4. Select the "gist" scope
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)
7. Add it to your `.env.local` file

## Step 5: Run the Application

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Step 6: Test the Application

1. Open your browser and go to `http://localhost:3000`
2. Enter a prompt like "사이드프로젝트 관리 보드" (Side project management board)
3. Click "템플릿 생성하기" (Generate Template)
4. Wait for the AI to generate your template
5. Copy the generated JSON or save it as a gist

## Troubleshooting

### Common Issues

**1. "Service temporarily unavailable" error**
- Make sure your `HF_API_KEY` is correct
- Check that your Hugging Face account has access to the API

**2. "Save service temporarily unavailable" error**
- This is normal if you haven't set up the `GITHUB_TOKEN`
- The save feature is optional

**3. TypeScript errors**
- Run `npm run type-check` to see detailed error messages
- Make sure all dependencies are installed with `npm install`

**4. Build errors**
- Clear the build cache: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules package-lock.json && npm install`

### Getting Help

If you encounter issues:

1. Check the [GitHub Issues](https://github.com/your-username/notion-generator/issues)
2. Make sure you're using the correct Node.js version
3. Verify your environment variables are set correctly
4. Try running `npm run lint` to check for code issues

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
npm run clean        # Clean build artifacts
```

## Next Steps

Once you have the application running locally:

1. **Customize the prompts**: Edit `lib/prompt.ts` to modify how the AI generates templates
2. **Add new features**: The codebase is well-structured for adding new functionality
3. **Deploy to production**: See the main README for deployment instructions
4. **Contribute**: Submit pull requests to improve the application

## Support

If you need help with setup or have questions:

- Create an issue on GitHub
- Check the main README for more detailed information
- Review the code comments for implementation details

Happy coding! 🚀
