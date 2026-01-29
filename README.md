<div align="center">
  <img src="https://raw.githubusercontent.com/veih/nanoautomation/main/public/logo.png" alt="NanoAutomation Logo" width="120" />
  
  # NanoAutomation
  
  **Integrated Business Management System**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue?style=flat&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/license-MIT-green?style=flat)](LICENSE)
  
  A comprehensive enterprise management solution for tracking corrective actions, store operations, employee management, and real-time analytics.
  
  🚀 **Production Ready** • 📊 **Real-time Analytics** • 📱 **Responsive Design** • 🔐 **Secure Authentication**
</div>

---

## 🎯 Overview

NanoAutomation is a robust, full-stack management platform designed to streamline business operations across multiple domains. Built with modern web technologies, it provides intuitive interfaces for managing stores, tracking corrective actions, monitoring employee performance, and generating comprehensive reports.

### ✨ Key Highlights

- **Multi-module Architecture**: Handles CMS, stores, corrective actions, and employee management
- **Real-time Dashboards**: Interactive visualizations with live data updates
- **Advanced Reporting**: Automated PDF generation with customizable templates
- **Smart Integration**: Gesture recognition and IoT device connectivity
- **Enterprise Ready**: Scalable architecture with proper error handling and logging

---

## 🚀 Features

### 🏪 Store Management
- Comprehensive store information tracking
- Equipment inventory management (actuators, sensors, fire detection)
- Defect identification and tracking
- Image documentation and Cloudinary integration
- Location-based analytics

### 🛠️ Corrective Actions
- End-to-end action tracking with status management
- Employee assignment and workload distribution
- Photo documentation with automatic upload
- Priority-based filtering and search
- Completion verification with timestamps

### 👥 Employee Management
- Centralized employee database
- Role-based access control
- Performance tracking and analytics
- Involvement in corrective actions
- Contact information management

### 📊 Advanced Analytics
- Real-time dashboards for all modules
- Statistical analysis and trend visualization
- Performance metrics and KPIs
- Comparative reporting across time periods
- Export capabilities (PDF, CSV, Excel)

### 📋 Automated Reporting
- Dynamic PDF report generation
- Customizable reporting periods
- Module-specific templates:
  - Store condition reports
  - Defective component summaries
  - CVF compliance documents
  - SDAI/SPDA system audits

### 🔧 Smart Integrations
- **Smart32 Gesture Recognition**: Real-time gesture data collection
- **IoT Connectivity**: BACnet protocol support for building automation
- **Cloud Storage**: Seamless Cloudinary integration
- **API Monitoring**: Health checks and performance metrics

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - Component-based UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[React Bootstrap](https://react-bootstrap.github.io/)** - UI component library
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### Backend & Data
- **[Prisma](https://www.prisma.io/)** - Database ORM and toolkit
- **[MySQL](https://www.mysql.com/)** - Primary database
- **[Zod](https://zod.dev/)** - Schema validation
- **[JSPDF](https://github.com/parallax/jsPDF)** - Client-side PDF generation

### Infrastructure
- **[Cloudinary](https://cloudinary.com/)** - Image management and CDN
- **[Axios](https://axios-http.com/)** - HTTP client
- **[React Toastify](https://fkhadra.github.io/react-toastify/)** - Notification system
- **[Recharts](https://recharts.org/)** - Data visualization

---

## 📦 Getting Started

### Prerequisites
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0 or Yarn ≥ 1.22.0
- MySQL database
- Cloudinary account (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/veih/nanoautomation.git
cd nanoautomation
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/nanoautomation"

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Set up the database**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

---

## 🏗️ Project Architecture

```
nanoautomation/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (server-side)
│   ├── components/        # Shared UI components
│   ├── dashboard/         # Dashboard pages
│   ├── pages/             # Main application pages
│   └── lib/               # App-specific utilities
├── pages/                 # Legacy Pages Router (API routes)
│   ├── api/               # Legacy API endpoints
│   └── ...                # Legacy pages
├── src/                   # Source code
│   ├── api/               # API services and repositories
│   ├── components/        # Business components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # Business logic services
│   ├── types/             # TypeScript interfaces
│   └── utils/             # Utility functions
├── lib/                   # Shared utilities
├── prisma/                # Database schema and migrations
├── public/                # Static assets
└── types/                 # Global type definitions
```

---

## 📖 Documentation

### API Endpoints

All API routes are organized by module:

- `/api/cms/*` - Central Monitoring System
- `/api/lojas/*` - Store management
- `/api/corretivas/*` - Corrective actions
- `/api/colaboradores/*` - Employee management
- `/api/cvf/*` - CVF compliance
- `/api/smart32/*` - Gesture recognition

### Module Structure

Each module typically includes:
- RESTful API endpoints
- Service layer for business logic
- Repository pattern for data access
- Type definitions
- UI components

---

## 👨‍💻 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run dev-ngrok    # Start dev server with ngrok tunnel
```

### Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent code formatting
- Write comprehensive tests
- Document complex logic

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- TypeScript with strict mode enabled
- ESLint for code quality
- Prettier for formatting
- Conventional commits

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Marcelo Evangelista de Oliveira**  
Full Stack Developer & Software Engineer

📧 Email: [marcelo@example.com](mailto:marcelo@example.com)  
💼 LinkedIn: [linkedin.com/in/marceloeoliveira](https://linkedin.com/in/marceloeoliveira)  
🌐 Portfolio: [marcelo.dev](https://marcelo.dev)

---

## 🙏 Acknowledgments

- Next.js team for the excellent framework
- Prisma team for the outstanding ORM
- All open-source contributors who made this project possible

---

<div align="center">
  
  Made with ❤️ by [Marcelo Evangelista](https://github.com/veih)
  
  ⭐ Star this repository if you find it helpful!
  
</div>