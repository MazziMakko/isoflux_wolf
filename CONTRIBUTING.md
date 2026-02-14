# Contributing to FluxForge AI

Thank you for your interest in contributing! This document provides guidelines for contributing to FluxForge AI.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards others

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. Use the bug report template
3. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Screenshots if applicable

### Suggesting Features

1. Check if the feature has been requested
2. Use the feature request template
3. Explain:
   - The problem it solves
   - Proposed solution
   - Alternative solutions considered
   - Impact on existing functionality

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**:
   - Follow the coding standards (see .cursorrules)
   - Write tests for new features
   - Update documentation
   - Ensure type safety (TypeScript strict mode)
4. **Commit**: `git commit -m "Add amazing feature"`
   - Use conventional commits (feat:, fix:, docs:, etc.)
5. **Push**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### PR Guidelines

- **Title**: Clear and descriptive
- **Description**: Explain what, why, and how
- **Tests**: Include relevant tests
- **Documentation**: Update docs if needed
- **Lint**: Ensure `npm run lint` passes
- **Build**: Ensure `npm run build` succeeds
- **Types**: Ensure `npm run type-check` passes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/fluxforge-ai.git
cd fluxforge-ai

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your local credentials

# Start development server
npm run dev
```

## Coding Standards

### TypeScript
- Use strict mode
- Avoid `any` type
- Define interfaces for all data structures
- Use proper return types

### React Components
- Functional components with hooks
- TypeScript for props
- Proper error boundaries
- Loading and error states

### API Routes
- Use `withAuth` middleware for protected routes
- Validate input with Zod
- Proper error handling
- Consistent response format

### Database
- Use DataGateway for all CRUD operations
- Always apply RLS policies
- Include userId for audit logging
- Use transactions for multi-step operations

### Security
- Never expose secrets
- Always sanitize user input
- Verify webhook signatures
- Implement rate limiting
- Use HTTPS in production

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run type checking
npm run type-check

# Run linter
npm run lint
```

### Test Coverage

- Unit tests for core logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% coverage for new code

## Documentation

- Update README.md for significant changes
- Add JSDoc comments for complex functions
- Update API.md for API changes
- Include examples in documentation

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add OAuth2 support

Implemented OAuth2 authentication flow with Google and GitHub providers.
Added necessary database migrations and UI components.

Closes #123
```

```
fix(webhooks): resolve Stripe signature verification

Fixed issue where webhook signature verification was failing due to
incorrect encoding. Now properly handling raw request bodies.

Fixes #456
```

## Review Process

1. **Automated checks** run on every PR
2. **Code review** by maintainers
3. **Testing** in staging environment
4. **Approval** required before merge
5. **Merge** using squash and merge

## Getting Help

- **Discord**: https://discord.gg/fluxforge
- **Email**: dev@fluxforge.ai
- **Discussions**: GitHub Discussions tab

## Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor Discord channel

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to FluxForge AI! 🚀
