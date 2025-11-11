# Contributing to MISHTEH

Thank you for considering contributing to MISHTEH! This document provides guidelines for contributing to the project.

## Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - why is this enhancement needed?
- **Proposed solution**
- **Alternative solutions** (if any)
- **Mockups or examples** (if applicable)

### Pull Requests

1. **Fork the repository**
2. **Create a branch** from `main`
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test your changes thoroughly**
5. **Commit with clear messages**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## Development Setup

1. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/mishteh.git
   cd mishteh
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types/interfaces
- Avoid `any` types when possible
- Use meaningful variable names

```typescript
// Good
interface DonationFormProps {
  requestId: string;
  onSuccess: (donation: Donation) => void;
}

// Avoid
interface Props {
  id: string;
  callback: any;
}
```

### React Components

- Use functional components with hooks
- Keep components focused and small
- Use proper prop typing
- Follow naming conventions

```typescript
// Component naming: PascalCase
export default function RequestCard({ request }: RequestCardProps) {
  // Hooks at the top
  const [isLoading, setIsLoading] = useState(false);
  
  // Event handlers: handle* prefix
  const handleClick = () => {
    // ...
  };
  
  return (
    // JSX
  );
}
```

### API Routes

- Use RESTful conventions
- Implement proper error handling
- Validate inputs with Zod
- Return consistent response formats

```typescript
// Good
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validation = schema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }
    
    // Process request
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Database

- Use Prisma for all database operations
- Use transactions for related operations
- Implement proper error handling
- Use indexes for frequently queried fields

```typescript
// Good - with transaction
const result = await prisma.$transaction(async (tx) => {
  const donation = await tx.donation.create({ data });
  await tx.request.update({
    where: { id: requestId },
    data: { currentAmount: { increment: amount } }
  });
  return donation;
});
```

### Styling

- Use Tailwind CSS classes
- Follow mobile-first approach
- Use consistent spacing
- Maintain color scheme

```tsx
// Good
<button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
  Submit
</button>
```

### File Structure

```
src/
├── app/
│   ├── api/          # API routes
│   ├── (pages)/      # Page components
│   └── layout.tsx    # Layout
├── components/       # Reusable components
├── lib/             # Utilities and configs
└── types/           # Type definitions
```

## Git Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Formatting changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

```bash
# Good examples
feat: add donation filtering by category
fix: resolve authentication redirect loop
docs: update API documentation
refactor: simplify request card component
```

## Testing

### Before Submitting PR

- [ ] Code compiles without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All existing features work
- [ ] New feature works as expected
- [ ] Responsive design tested
- [ ] Cross-browser testing done (if UI changes)

### Manual Testing Checklist

- [ ] User registration
- [ ] User login
- [ ] Create request
- [ ] Make donation
- [ ] Upload document
- [ ] Admin functions (if applicable)

## Documentation

Update documentation when you:
- Add new features
- Change existing functionality
- Add new API endpoints
- Change environment variables
- Update dependencies

## Review Process

1. **Self-review** your changes
2. **Request review** from maintainers
3. **Address feedback** promptly
4. **Ensure CI passes** (when implemented)
5. Wait for **approval and merge**

## Questions?

- Check existing documentation
- Search existing issues
- Open a new issue for questions
- Join community discussions

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in the application

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make MISHTEH better! 🙏
