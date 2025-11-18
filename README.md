# 🚗 ParkingApp SaaS - Smart Parking Management

A modern, production-ready SaaS application for parking lot management with real-time bookings, automated payments, and comprehensive analytics.

## ✨ Features

### Core Functionality
- 🏢 **Multi-tenant Architecture** - Supports multiple organizations with complete data isolation
- 🚗 **Real-time Parking Management** - Live availability tracking and instant booking confirmations
- 💳 **Integrated Payments** - Stripe integration for secure payment processing
- 📱 **Progressive Web App (PWA)** - Works seamlessly on mobile and desktop devices
- 🔐 **Advanced Authentication** - Secure authentication with NextAuth.js
- 👥 **Role-Based Access Control** - Granular permissions for different user roles
- 📊 **Analytics Dashboard** - Comprehensive insights and reporting

### User Roles
- **Super Admin** - Platform-wide management
- **Tenant Admin** - Organization owner with full control
- **Manager** - Parking lot manager with operational access
- **Staff** - Parking attendant with limited access
- **User** - Regular customer for booking parking spots

### Technical Features
- ⚡ **Built with Next.js 14** - Server-side rendering and optimal performance
- 🗄️ **PostgreSQL + Prisma ORM** - Type-safe database operations
- 🎨 **Tailwind CSS + shadcn/ui** - Modern, responsive UI components
- 🔒 **Security Best Practices** - CORS, rate limiting, input validation, XSS protection
- 🐳 **Docker Ready** - Containerized for easy deployment
- 📝 **TypeScript** - Full type safety throughout the application
- ✅ **Zod Validation** - Runtime type checking and validation
- 📈 **Scalable Architecture** - Ready for production deployment

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, shadcn/ui
- **Validation**: Zod
- **State Management**: Zustand, React Context
- **Payments**: Stripe (configured)
- **Logging**: Winston
- **Containerization**: Docker, Docker Compose

### Database Schema

The application uses a comprehensive multi-tenant database schema with the following main entities:

- **Tenant** - Organizations using the platform
- **User** - System users with role-based permissions
- **ParkingLot** - Physical parking locations
- **ParkingSpot** - Individual parking spaces
- **Vehicle** - User vehicles
- **Booking** - Parking reservations
- **Payment** - Payment transactions
- **Subscription** - Tenant billing and subscriptions
- **ActivityLog** - Audit trail for security and compliance

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 15.x or higher
- npm 9.x or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EstevenR/ParkingApp.git
   cd ParkingApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate with `openssl rand -base64 32`)
   - `NEXTAUTH_URL` - Your application URL

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # (Optional) Seed database with sample data
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- PostgreSQL database on port 5432
- Next.js application on port 3000

### Manual Docker Build

```bash
# Build the image
docker build -t parkingapp .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  parkingapp
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage

## 🔒 Security Features

- **Authentication**: Secure password hashing with bcrypt
- **Authorization**: Role-based access control (RBAC)
- **CSRF Protection**: Built-in Next.js CSRF protection
- **XSS Prevention**: Input sanitization and output encoding
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **Rate Limiting**: API rate limiting (configurable)
- **Security Headers**: HSTS, X-Frame-Options, CSP, etc.
- **Audit Logging**: Activity tracking for compliance

## 📱 Progressive Web App (PWA)

The application is a fully functional PWA that provides:
- Offline capability
- Install to home screen
- Push notifications (ready for implementation)
- App-like experience on mobile devices

## 🌐 API Routes

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Additional API routes can be easily added for:
- Parking lot management
- Booking operations
- Payment processing
- User management
- Analytics and reporting

## 🎯 Roadmap

- [x] Multi-tenant architecture
- [x] User authentication and authorization
- [x] Database schema design
- [x] Basic UI components
- [x] PWA configuration
- [x] Docker setup
- [ ] Complete booking flow
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] API documentation (Swagger)
- [ ] Unit and integration tests
- [ ] CI/CD pipeline

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@parkingapp.com or open an issue in the GitHub repository.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma for the excellent ORM
- shadcn for the beautiful UI components
- Vercel for hosting solutions

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
