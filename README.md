# NanoFront - Integrated Management System

NanoFront is a comprehensive management system built with Next.js that handles multiple aspects of business operations including corrective actions, store management, employee tracking, and data reporting.

## Developer

**Marcelo Evangelista de Oliveira** - Full Stack Developer

## Features

### Corrective Actions Management
- Track and manage corrective actions with status tracking
- Assign actions to employees
- Upload and view images related to corrective actions
- Filter and search through corrective actions
- Mark actions as completed with completion dates

### Store Management
- Comprehensive store information management
- Track actuators and sensors for each store
- Identify defective components
- Detailed store equipment listings

### Employee Management
- Employee database with role assignments
- Track employee involvement in corrective actions

### Data Import/Export
- Import data from external sources
- Export data in various formats
- Sync with Cloudinary for image management

### PDF Reporting
- Generate PDF reports for:
  - Store information
  - SDAI/SPDA systems
  - Defective components
  - CVF reports
- Customizable reporting periods

### Dashboard System
- Multiple specialized dashboards:
  - CMS Dashboard
  - Stores Dashboard
  - Corrective Actions Dashboard
  - SDAI Dashboard
  - SCP Dashboard
  - CVF Dashboard
  - Smart32 Gestures Dashboard
- Real-time statistics and metrics
- Visual data representation

### API Status Monitoring
- Monitor the health of backend services
- Real-time API status dashboard

### Smart32 Gesture Recognition
- Integration with Smart32 program for gesture data collection
- Real-time monitoring of gesture interactions
- Detailed analytics and reporting
- Dedicated dashboard for gesture data visualization

## Technologies Used

- **Next.js 15**: React framework with App Router
- **React 19**: Latest version of the React library
- **TypeScript**: Strongly typed programming language
- **React Bootstrap**: UI component library
- **Tailwind CSS**: Utility-first CSS framework
- **Prisma**: Modern database toolkit
- **JSPDF**: Client-side PDF generation
- **Cloudinary**: Image management and storage
- **Zod**: TypeScript-first schema validation
- **React Toastify**: Notification system

## Prerequisites

Make sure you have the following tools installed:

- Node.js (version 18 or higher recommended)
- npm (Node.js package manager) or Yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <URL_DO_SEU_REPOSITORIO>
   cd nanofront
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your configuration:
   ```env
   DATABASE_URL="your_database_connection_string"
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

## Running the Development Server

To start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be accessible at `http://localhost:3000` (or another available port).

## Project Structure

```
app/                    # Next.js App Router structure
├── components/         # Reusable UI components
├── dashboard/          # Dashboard pages
├── pages/              # Application pages
│   ├── api-status/     # API status monitoring
│   ├── cms/            # CMS management
│   ├── colaboradores/  # Employee management
│   ├── corretivas/     # Corrective actions
│   ├── cvf/            # CVF reports
│   ├── data-export/    # Data export functionality
│   ├── data-import/    # Data import functionality
│   ├── lojas/          # Store management
│   ├── smart32/        # Smart32 gesture data
│   └── sync-cloudinary/ # Cloudinary sync
├── PDFs/              # PDF generation components
└── navigation/        # Navigation components

lib/                    # Utility functions and configurations
pages/api/             # API routes
types/                 # TypeScript type definitions
```

## API Routes

The application includes comprehensive API routes for all modules:
- CMS API (Central de Monitoramento)
- Stores API (Lojas)
- Corrective Actions API (Corretivas)
- Employees API (Colaboradores)
- CVF API
- Data Import/Export API
- Smart32 API (Gesture Recognition)

## Contributing

Contributions are welcome! If you have suggestions for improvements or find bugs, please feel free to open an issue or submit a pull request.

## License

MIT License