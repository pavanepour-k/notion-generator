# Contributing to Notionify

Thank you for your interest in contributing to Notionify! This document provides guidelines and information for contributors.

## 🎯 How to Contribute

### Reporting Bugs

1. **Check existing issues** - Make sure the bug hasn't already been reported
2. **Use the bug report template** - Provide detailed information about the issue
3. **Include reproduction steps** - Help us understand how to reproduce the bug
4. **Add environment details** - Include OS, browser, Node.js version, etc.

### Suggesting Features

1. **Check existing feature requests** - Avoid duplicates
2. **Use the feature request template** - Provide clear use cases and benefits
3. **Consider implementation complexity** - Help us prioritize features
4. **Provide mockups or examples** - Visual aids help communicate ideas

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch** - Use descriptive branch names
3. **Make your changes** - Follow our coding standards
4. **Add tests** - Ensure your changes are tested
5. **Submit a pull request** - Use our PR template

## 🛠️ Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git

### Setup Steps

1. **Fork and clone the repository**
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
   # Edit .env.local with your API keys
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm run test
   ```

## 📋 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type - use specific types
- Use strict type checking

### React

- Use functional components with hooks
- Follow React best practices
- Use proper prop types and interfaces
- Implement proper error boundaries

### Code Style

- Use Prettier for code formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### File Organization

- Use kebab-case for file names
- Group related files in directories
- Keep components in separate files
- Use index files for clean imports

## 🧪 Testing

### Test Types

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and data flow
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test application performance

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write tests for new features
- Test edge cases and error conditions
- Use descriptive test names
- Keep tests simple and focused
- Mock external dependencies

## 📝 Commit Guidelines

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(api): add rate limiting to generate endpoint

fix(ui): resolve template preview rendering issue

docs(readme): update installation instructions
```

## 🔄 Pull Request Process

### Before Submitting

1. **Run tests** - Ensure all tests pass
2. **Check linting** - Fix any linting errors
3. **Update documentation** - Update relevant docs
4. **Test manually** - Test your changes thoroughly

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass
- [ ] Manual testing completed
- [ ] Edge cases considered

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. **Automated checks** - CI/CD pipeline runs tests
2. **Code review** - Maintainers review the code
3. **Testing** - Changes are tested in staging
4. **Approval** - PR is approved and merged

## 🏗️ Architecture Guidelines

### API Design

- Use RESTful principles
- Implement proper error handling
- Add rate limiting where appropriate
- Use proper HTTP status codes
- Validate all inputs

### Frontend Architecture

- Use React best practices
- Implement proper state management
- Use TypeScript for type safety
- Follow accessibility guidelines
- Optimize for performance

### Security

- Validate all inputs
- Sanitize user data
- Use proper authentication
- Implement rate limiting
- Follow security best practices

## 🐛 Bug Fix Guidelines

### Before Fixing

1. **Reproduce the bug** - Understand the issue
2. **Identify root cause** - Find the source of the problem
3. **Check for similar issues** - Look for related bugs
4. **Plan the fix** - Consider the best approach

### Fixing Process

1. **Write a test** - Create a test that reproduces the bug
2. **Implement the fix** - Make minimal necessary changes
3. **Verify the fix** - Ensure the test passes
4. **Test edge cases** - Check for related issues
5. **Update documentation** - Update relevant docs

## 🚀 Feature Development

### Planning

1. **Define requirements** - Clear feature specification
2. **Design architecture** - Plan the implementation
3. **Consider edge cases** - Think about error scenarios
4. **Plan testing** - Design test strategy

### Implementation

1. **Start with tests** - Write tests first (TDD)
2. **Implement incrementally** - Small, focused changes
3. **Follow patterns** - Use existing code patterns
4. **Document changes** - Update relevant documentation

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document complex algorithms
- Explain business logic
- Update README for new features

### API Documentation

- Document all endpoints
- Include request/response examples
- Document error codes
- Update OpenAPI specs

## 🎨 UI/UX Guidelines

### Design Principles

- Keep it simple and intuitive
- Follow accessibility guidelines
- Use consistent styling
- Optimize for mobile devices

### Component Guidelines

- Create reusable components
- Use proper prop types
- Implement error boundaries
- Follow naming conventions

## 🔧 Tools and Setup

### Recommended Tools

- **VS Code** - Code editor
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **TypeScript** - Type checking
- **Jest** - Testing framework

### VS Code Extensions

- ES7+ React/Redux/React-Native snippets
- TypeScript Importer
- Prettier - Code formatter
- ESLint
- Auto Rename Tag
- Bracket Pair Colorizer

## 📞 Getting Help

### Resources

- **GitHub Issues** - For bug reports and feature requests
- **GitHub Discussions** - For questions and discussions
- **Documentation** - Check existing docs first
- **Code Examples** - Look at existing code

### Community Guidelines

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow the code of conduct

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page
- Project documentation

Thank you for contributing to Notionify! 🎉