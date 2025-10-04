# Notionify - AI-Powered Notion Template Generator

![Notionify Logo](https://img.shields.io/badge/Notionify-AI%20Template%20Generator-blue?style=for-the-badge&logo=notion)

A powerful, free-to-use web application that generates custom Notion templates using AI. Simply describe what you need, and Notionify creates a comprehensive, ready-to-use template for your Notion workspace.

## ✨ Features

- 🤖 **AI-Powered Generation**: Uses advanced language models to create intelligent templates
- 🎯 **Custom Templates**: Generate templates for any use case - project management, personal productivity, content creation, and more
- 📋 **Structured Output**: Creates properly formatted JSON templates with sections and properties
- 🔗 **Easy Sharing**: Save templates as GitHub Gists for easy sharing
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🛡️ **Secure & Fast**: Built with Next.js 14 and Edge Runtime for optimal performance
- 🌐 **Multi-language Support**: Interface available in Korean and English
- ⚡ **Real-time Generation**: Fast template generation with progress indicators

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Hugging Face API key (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/notion-generator.git
   cd notion-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   HF_API_KEY=your_hugging_face_api_key_here
   GITHUB_TOKEN=your_github_token_here  # Optional
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 API Keys Setup

### Hugging Face API Key (Required)

1. Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
2. Create a new token with "Read" permissions
3. Copy the token and add it to your `.env.local` file

### GitHub Token (Optional)

1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Generate a new token with "gist" scope
3. Copy the token and add it to your `.env.local` file

## 📖 Usage

1. **Describe your template**: Enter a description of what you want to create (e.g., "사이드프로젝트 관리 보드")
2. **Generate**: Click the generate button or press Ctrl+Enter
3. **Review**: Check the generated template structure
4. **Copy or Share**: Copy the JSON to your clipboard or save as a GitHub Gist

### Example Prompts

- "사이드프로젝트 관리 보드"
- "독서 기록 템플릿"
- "일일 계획 템플릿"
- "학습 진도 추적"
- "비용 관리 시트"
- "운동 일지"
- "여행 계획서"
- "회의록 템플릿"

## 🏗️ Project Structure

```
notion-generator/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   │   ├── generate/      # Template generation endpoint
│   │   ├── health/        # Health check endpoint
│   │   └── save/          # Gist saving endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── lib/                   # Utility libraries
│   ├── constants.ts       # Application constants
│   ├── error-handler.tsx  # Error handling components
│   ├── monitoring.ts      # Performance monitoring
│   ├── prompt.ts          # AI prompt templates
│   └── validation.ts      # Input validation
├── scripts/               # Utility scripts
│   ├── setup.js          # Setup script
│   └── test-app.js       # Test script
├── public/               # Static assets
├── next.config.js        # Next.js configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── package.json          # Dependencies and scripts
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run application tests
- `npm run setup` - Run setup script

### Testing

Run the comprehensive test suite:

```bash
npm run test
```

This will test:
- Health endpoint functionality
- Main page accessibility
- Template generation
- Save functionality
- Rate limiting

### Code Quality

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Tailwind CSS** for styling
- **Next.js 14** with App Router
- **Edge Runtime** for optimal performance

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker

```bash
# Build the Docker image
docker build -t notionify .

# Run the container
docker run -p 3000:3000 --env-file .env.local notionify
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Sanitizes all user inputs
- **CSP Headers**: Content Security Policy for XSS protection
- **Environment Validation**: Validates required environment variables
- **Error Handling**: Comprehensive error handling and logging

## 📊 Performance

- **Edge Runtime**: Fast cold starts and global distribution
- **Image Optimization**: Automatic image optimization with Next.js
- **Bundle Analysis**: Built-in bundle analyzer for optimization
- **Monitoring**: Performance metrics and health monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for providing the AI models
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Notion](https://notion.so/) for inspiring this project

## 📞 Support

- 📧 Email: support@notionify.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/notion-generator/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-username/notion-generator/discussions)

## 🗺️ Roadmap

- [ ] Template preview with Notion-style UI
- [ ] Template marketplace
- [ ] User accounts and saved templates
- [ ] Advanced template customization
- [ ] Integration with Notion API
- [ ] Multi-language template generation
- [ ] Template import/export functionality

---

Made with ❤️ by the Notionify Team