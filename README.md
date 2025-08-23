# Senior Discounts App - Backend Implementation

A secure, production-ready backend for the "Senior Discounts Near You" application built with Next.js 14, Prisma, PostgreSQL, Clerk, and more.

## 🏗️ Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Clerk (organizations + roles)
- **Email**: Nodemailer with Gmail App Password
- **Security**: reCAPTCHA v3, honeypot fields, rate limiting
- **Caching**: Next.js built-in caching with tags
- **Validation**: Zod schemas with comprehensive error handling

### Project Structure
```
app/
├── api/                    # API routes
│   ├── discounts/         # Public discount endpoints
│   └── admin/            # Admin-only endpoints
├── admin/                 # Admin dashboard
├── submit/                # Discount submission form
└── globals.css            # Global styles

lib/                       # Utility libraries
├── prisma.ts             # Database client
├── schemas.ts            # Zod validation schemas
├── normalize.ts          # Data transformation utilities
├── recaptcha.ts          # reCAPTCHA verification
├── email.ts              # Email service (Nodemailer)
├── auth.ts               # Clerk authentication helpers
├── cache.ts              # Caching utilities
└── errors.ts             # Error handling

middleware.ts              # Route protection
prisma/                    # Database schema & migrations
├── schema.prisma         # Database schema
└── migrations/           # Database migrations
```

## 🚀 Quick Start

### 1. Environment Setup
Copy the environment variables:
```bash
cp env.example .env.local
```

Fill in your actual values:
- **Database**: Neon PostgreSQL connection string
- **Clerk**: Authentication keys
- **Gmail**: App password for email notifications
- **reCAPTCHA**: v3 site and secret keys

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Database Setup
```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Or run migrations
pnpm db:migrate

# Open Prisma Studio (optional)
pnpm db:studio
```

### 4. Development
```bash
pnpm dev
```

## 🔐 Authentication & Authorization

### Clerk Integration
- **Organizations**: Support for team-based access control
- **Roles**: Admin, moderator, and member roles
- **Metadata**: Custom user attributes and permissions
- **Magic Links**: Email-based authentication for admins

### Route Protection
- **Public Routes**: Homepage, submission form, public API
- **Protected Routes**: Admin dashboard, admin API endpoints
- **Role-Based Access**: Admin-only actions require proper permissions

## 🗄️ Database Schema

### Core Models
- **SeniorDiscount**: Main discount entity with JSON payload and shadow columns
- **AdminAuditLog**: Audit trail for admin actions
- **Status Enum**: PENDING, PUBLISHED, TRASH

### Key Features
- **Duplicate Guard**: Prevents same business from submitting similar discounts on the same day
- **Shadow Columns**: Optimized fields for querying and indexing
- **JSON Payload**: Flexible storage of all discount details
- **Audit Trail**: Complete history of admin actions
- **Performance Indexes**: Optimized queries for common filters

### Duplicate Prevention System
The system uses a sophisticated duplicate guard that prevents spam:
- **businessNorm**: Normalized business name (lowercase, trimmed)
- **amountNorm**: Normalized discount amount (lowercase, trimmed)
- **createdDay**: UTC midnight of submission day
- **Unique Constraint**: `@@unique([businessNorm, zip, amountNorm, createdDay])`

This ensures that:
- Same business can't submit identical discounts on the same day
- Different businesses can submit similar discounts
- New submissions are allowed after 24 hours
- ZIP code variations allow local business chains

## 📧 Email System

### Nodemailer Configuration
- **Gmail App Password**: Secure authentication
- **HTML Templates**: Professional email notifications
- **Multiple Types**: Submission, publication, rejection notifications

### Email Templates
- New submission alerts for moderators
- Publication confirmations for business owners
- Rejection notifications with reasons
- Magic link authentication emails

## 🛡️ Security Features

### reCAPTCHA v3
- **Score-Based**: Adaptive bot detection
- **Action Tracking**: Different scores for different actions
- **Server Verification**: Secure token validation

### Anti-Spam Measures
- **Honeypot Fields**: Hidden form fields to catch bots
- **Duplicate Guard**: Database-level prevention of spam submissions
- **Rate Limiting**: Request throttling per IP
- **Input Validation**: Comprehensive Zod schemas
- **IP Tracking**: Monitor submission patterns

### Data Protection
- **Input Sanitization**: Clean and normalize user input
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Prevention**: Sanitized HTML output
- **CSRF Protection**: Clerk-built security

## 📊 Caching Strategy

### Cache Levels
- **Public Discounts**: 60 seconds with stale-while-revalidate
- **Admin Data**: 30 seconds for real-time updates
- **Statistics**: 1 hour for performance data
- **Categories**: 24 hours for static data

### Cache Invalidation
- **Tag-Based**: Granular cache control
- **Automatic**: Invalidate on data changes
- **Manual**: Admin-triggered cache refresh
- **Stale Data**: Serve stale content while updating

## 🔄 API Endpoints

### Public Endpoints
```
GET  /api/discounts          # List public discounts
POST /api/discounts          # Submit new discount
```

### Admin Endpoints
```
GET    /api/admin/discounts                    # List all discounts
POST   /api/admin/discounts/[id]/publish      # Publish discount
POST   /api/admin/discounts/[id]/trash        # Move to trash
```

### Features
- **Pagination**: Configurable page sizes
- **Filtering**: ZIP, category, age, status
- **Sorting**: Sponsored first, then by date
- **Rate Limiting**: Per-endpoint throttling
- **Duplicate Detection**: Automatic spam prevention

## 🧪 Testing & Development

### Development Tools
- **Prisma Studio**: Database visualization
- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Hot Reload**: Fast development iteration

### Database Operations
```bash
# Generate types
pnpm db:generate

# Reset database
pnpm db:push --force-reset

# Seed data
pnpm db:seed

# View data
pnpm db:studio
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Environment Variables
Ensure all required environment variables are set:
- Database connection
- Clerk keys
- Email credentials
- reCAPTCHA keys
- App URLs and secrets

### Database Migration
```bash
# Production migration
pnpm db:migrate --deploy

# Generate client
pnpm db:generate
```

## 📈 Monitoring & Maintenance

### Health Checks
- Database connectivity
- Email service status
- reCAPTCHA verification
- Authentication service

### Logging
- Structured error logging
- Audit trail maintenance
- Performance metrics
- Security event tracking

### Backup Strategy
- Automated database backups
- Point-in-time recovery
- Data retention policies
- Disaster recovery procedures

## 🔧 Configuration

### Rate Limiting
- **Public API**: 100 requests per minute
- **Submission**: 10 submissions per hour per IP
- **Admin API**: 1000 requests per minute per user

### Email Limits
- **Notifications**: Unlimited for admins
- **Magic Links**: 5 per hour per email
- **Templates**: HTML with inline CSS

### Cache Settings
- **TTL**: Configurable per endpoint
- **Max Size**: Memory-based limits
- **Eviction**: LRU strategy

### Duplicate Guard Settings
- **Time Window**: 24 hours (UTC midnight to midnight)
- **Normalization**: Business name and amount are lowercased and trimmed
- **Scope**: Per ZIP code to allow local business chains
- **Flexibility**: Different amounts or business names are allowed

## 🤝 Contributing

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration
- **Prettier**: Consistent formatting
- **Conventional Commits**: Standard commit messages

### Development Workflow
1. Create feature branch
2. Implement with tests
3. Update documentation
4. Submit pull request
5. Code review process
6. Merge to main

## 📚 Additional Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Zod Documentation](https://zod.dev)
- [Nodemailer Documentation](https://nodemailer.com)

## 🆘 Support

For technical support or questions:
- Check the documentation
- Review existing issues
- Create a new issue with details
- Contact the development team

---

**Built with ❤️ for helping seniors save money**
