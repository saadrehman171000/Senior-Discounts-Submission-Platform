# Senior Discounts App

A Next.js application for managing and discovering senior discounts in local communities.

## Features

- **Business Submission**: Business owners can submit senior discount offers
- **Admin Moderation**: Admin dashboard for reviewing and approving submissions
- **Public Discovery**: Seniors can browse and search for available discounts
- **Automatic Expiration Cleanup**: Expired discounts are automatically moved to TRASH status
- **Automatic Approval System**: Pending discounts are automatically approved after 24 hours
- **Individual Discount Pages**: Dedicated pages for each discount with unique URLs
- **"See Other Deals" Navigation**: Easy navigation back to main discount board filtered by location

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Custom token-based admin authentication
- **Data Fetching**: SWR for client-side data management
- **Form Handling**: React Hook Form with Zod validation
- **Email**: Nodemailer for notifications
- **Security**: reCAPTCHA v3 (currently disabled), input sanitization

## Project Structure

```
senior-discounts-app/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── login/             # Admin login
│   ├── submit/            # Discount submission form
│   ├── terms/             # Terms of Service
│   ├── privacy/           # Privacy Policy
│   └── contact/           # Contact page
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── prisma/                # Database schema and migrations
└── public/                # Static assets
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd senior-discounts-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env.local
   # Fill in your environment variables
   ```

4. **Database setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `ADMIN_USERNAME`: Admin login username
- `ADMIN_PASSWORD`: Admin login password
- `SMTP_HOST`: SMTP server for email notifications
- `SMTP_USER`: SMTP username
- `SMTP_PASS`: SMTP password
- `RECAPTCHA_SECRET_KEY`: Google reCAPTCHA secret key

## Database Schema

### SeniorDiscount
- Core discount information with JSON payload for flexibility
- Status management (PENDING → PUBLISHED → TRASH)
- Duplicate prevention with business normalization
- Automatic expiration tracking

### AdminAuditLog
- Audit trail for all admin actions
- Tracks approvals, denials, and deletions

## Key Features

### Automatic Expiration Cleanup
The system automatically maintains a clean discount list:
- **Real-time Cleanup**: Expired discounts are automatically moved to TRASH status
- **API Integration**: Cleanup happens on every public and admin API call
- **Status Management**: Expired discounts never appear in public search results
- **Admin Monitoring**: Dashboard shows cleanup status and expiring soon warnings
- **Manual Override**: Admins can trigger manual cleanup if needed

### Automatic Approval System
Business submissions are automatically approved after 24 hours:
- **Time-based Approval**: Pending discounts become PUBLISHED after 24 hours
- **Real-time Processing**: Auto-approval runs on every public and admin API call
- **Admin Control**: Admins can manually trigger auto-approval for ready discounts
- **Transparency**: Dashboard shows auto-approval status and history
- **No Manual Review Required**: Businesses can expect automatic approval within 24 hours

### Individual Discount Pages
Each discount now has its own dedicated page with a unique URL:
- **Dynamic Routing**: `/discount/[id]` URLs for each discount
- **Full Details**: Complete business and discount information display
- **Professional Layout**: Clean, organized presentation of all discount data
- **SEO Ready**: Individual pages for better search engine optimization
- **User Experience**: Seniors can view complete details before making decisions

### "See Other Deals" Navigation
Seamless navigation between individual discounts and the main board:
- **Prominent CTA**: Clear "See Other Deals in [ZIP]" buttons
- **Location Filtering**: Automatically filters results by ZIP code
- **Multiple Entry Points**: Buttons in header, content area, and bottom CTA
- **Contextual Links**: Users stay within their local area when browsing
- **Improved Discovery**: Encourages exploration of multiple discounts

### Business Submission Process
1. Business owner fills out discount form
2. Submission is stored with PENDING status
3. Admin receives email notification
4. After 24 hours, discount is automatically approved
5. Discount becomes visible to seniors searching the platform

### Admin Dashboard Features
- View pending, published, and trashed discounts
- Manual approval/denial of specific discounts
- Bulk operations for multiple discounts
- Manual trigger for auto-approval system
- Manual cleanup of expired discounts
- Real-time status monitoring

## API Endpoints

### Public
- `GET /api/discounts` - List published discounts
- `POST /api/discounts` - Submit new discount
- `GET /api/discounts/[id]` - Get individual discount details

### Admin
- `GET /api/admin/discounts` - List all discounts (with auto-approval)
- `POST /api/admin/discounts/[id]/approve` - Approve specific discount
- `POST /api/admin/discounts/[id]/deny` - Deny specific discount
- `POST /api/admin/auto-approve` - Manually trigger auto-approval
- `POST /api/admin/cleanup-expired` - Manually trigger cleanup

## Business Rules

- **Duplicate Prevention**: One discount per business per day
- **Automatic Approval**: 24-hour waiting period for all submissions
- **Expiration Management**: Automatic cleanup of expired offers
- **ZIP Code Variations**: Allow local business chains
- **Content Validation**: Input sanitization and validation

## Development

### Prisma Commands
```bash
npx prisma generate    # Generate Prisma client
npx prisma db push     # Push schema changes to database
npx prisma studio      # Open database browser
```

### Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for styling

## Deployment

The app is configured for Vercel deployment with:
- Automatic database migrations
- Environment variable management
- Edge function optimization
- Static asset optimization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software. All rights reserved.
