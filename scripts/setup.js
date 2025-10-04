#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Notionify - AI-Powered Notion Template Generator\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envTemplatePath = path.join(process.cwd(), 'env.template');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  
  if (fs.existsSync(envTemplatePath)) {
    fs.copyFileSync(envTemplatePath, envPath);
    console.log('✅ .env.local created from template');
    console.log('⚠️  Please edit .env.local and add your API keys:');
    console.log('   - HF_API_KEY: Get from https://huggingface.co/settings/tokens');
    console.log('   - GITHUB_TOKEN: Get from https://github.com/settings/tokens (optional)');
  } else {
    // Create basic .env.local
    const envContent = `# Notionify Environment Variables
# Development configuration

# Hugging Face API Key (Required for AI template generation)
# Get your API key from: https://huggingface.co/settings/tokens
HF_API_KEY=your_hugging_face_api_key_here

# GitHub Token (Optional, for saving templates as gists)
# Get your token from: https://github.com/settings/tokens
# Create a token with 'gist' scope
GITHUB_TOKEN=your_github_token_here

# Application Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local created');
  }
} else {
  console.log('✅ .env.local already exists');
}

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.log('❌ Node.js 18 or higher is required');
  console.log(`   Current version: ${nodeVersion}`);
  process.exit(1);
} else {
  console.log(`✅ Node.js version: ${nodeVersion}`);
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.log('❌ Failed to install dependencies');
  console.log('   Please run: npm install');
  process.exit(1);
}

// Run type check
console.log('\n🔍 Running type check...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ Type check passed');
} catch (error) {
  console.log('⚠️  Type check failed - please review the errors');
}

// Run linting
console.log('\n🧹 Running linter...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✅ Linting passed');
} catch (error) {
  console.log('⚠️  Linting failed - please review the warnings');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Edit .env.local and add your API keys');
console.log('2. Run: npm run dev');
console.log('3. Open: http://localhost:3000');
console.log('\n💡 Tips:');
console.log('- Get Hugging Face API key: https://huggingface.co/settings/tokens');
console.log('- Get GitHub token: https://github.com/settings/tokens (for gist saving)');
console.log('- Check the README.md for more information');