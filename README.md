<img width="1894" height="869" alt="Screenshot 2025-09-07 164602" src="https://github.com/user-attachments/assets/4a4cf5fc-a694-4aa8-8c8c-db27e673d070" />
<img width="1896" height="860" alt="Screenshot 2025-09-07 164549" src="https://github.com/user-attachments/assets/b8daaaa6-1b37-4ace-a881-d8f6475b0a0c" />
<img width="1919" height="869" alt="Screenshot 2025-09-07 164408" src="https://github.com/user-attachments/assets/0cd775dc-8682-41cb-a721-7d1df90b4d79" />
# MediCare Pro 🏥

A modern, AI-powered medical management system built with Next.js 15, designed to streamline healthcare workflows and enhance patient care through intelligent digital solutions.

## � Live Application

- **Frontend**: [https://saramedico.com](https://saramedico.com)
- **Backend API**: [https://admin.saramedico.com](https://admin.saramedico.com)

## �🌟 Overview

MediCare Pro is a comprehensive digital health platform that serves as your digital health companion. The application provides healthcare professionals with powerful tools for patient management, consultation tracking, and medical record management, all wrapped in an intuitive and responsive user interface.

## ✨ Key Features

### 🔐 Authentication & Security
- Secure doctor login and registration system
- Password reset and recovery functionality
- JWT-based authentication with automatic token management
- Protected routes and role-based access control

### 📊 Dashboard & Analytics
- **Overview Dashboard**: Real-time statistics and metrics
- **Patient Analytics**: Track total visits, recent patients, and pending approvals
- **Activity Monitoring**: Comprehensive activity tracking and reporting

### 👥 Patient Management
- **Patient Registration**: Add and manage patient profiles
- **Patient Records**: Comprehensive medical history tracking
- **Visit Management**: Schedule and track patient visits
- **Dynamic Patient Views**: Individual patient detail pages with visit history

### 🎙️ Audio Processing & AI Integration
- **Voice Recording**: Built-in audio recording capabilities
- **Audio Conversion**: WebM to MP3 conversion using FFmpeg.wasm
- **AI Transcription**: OpenAI Whisper model integration for premium audio-to-text conversion
- **Medical Audio Analysis**: AI-powered analysis of medical consultations and patient interactions

### 📋 Consultation Features
- **Digital Consultations**: Manage and track patient consultations
- **Visit Recording**: Record and document patient visits
- **Medical Records**: Comprehensive record-keeping system

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first, fully responsive interface
- **Dark/Light Mode**: Theme switching capabilities
- **Component Library**: Built with Radix UI and shadcn/ui components
- **Smooth Animations**: Enhanced user experience with Tailwind CSS animations

## 🛠️ Technology Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development

### Backend & API
- **Node.js** - Server-side JavaScript runtime
- **Express.js 5** - Web application framework
- **PostgreSQL** - Relational database with Sequelize ORM
- **JWT Authentication** - Secure token-based authentication

### AI & Machine Learning
- **OpenAI Whisper** - Premium AI model for audio transcription
- **OpenAI GPT** - Advanced language model for medical analysis
- **FFmpeg** - Server-side audio/video processing

### Cloud & Storage
- **AWS S3** - File storage and management
- **Cloudinary** - Image and media optimization
- **SendGrid** - Email service integration
- **Twilio** - SMS and communication services

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful, customizable icons
- **shadcn/ui** - Pre-built component library

### Data Management
- **SWR** - Data fetching and caching
- **Axios** - HTTP client with interceptors
- **React Hook Form** - Forms with validation
- **Zod** - Schema validation

### Audio Processing
- **FFmpeg.wasm** - Client-side audio/video processing
- **Web Audio API** - Browser-based audio recording

### Development Tools
- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Nodemon** - Development server auto-restart

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm, yarn, pnpm, or bun package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ShikharPandey123/ai-medical-frontend.git
   cd ai-medical-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and configure your environment variables:
   ```env
   # Frontend Configuration
   NEXT_PUBLIC_API_BASE_URL=https://admin.saramedico.com/api/v1
   NEXT_PUBLIC_APP_ENV=production
   
   # For local development
   # NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
   # NEXT_PUBLIC_APP_ENV=development
   
   # Backend Configuration (for reference)
   # DATABASE_URL=postgresql://username:password@localhost:5432/ai_medical
   # JWT_SECRET=your_jwt_secret
   # OPENAI_API_KEY=your_premium_openai_api_key
   # AWS_ACCESS_KEY_ID=your_aws_access_key
   # AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   # SENDGRID_API_KEY=your_sendgrid_api_key
   # TWILIO_ACCOUNT_SID=your_twilio_sid
   # CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

   Or visit the live application at [https://saramedico.com](https://saramedico.com)

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code analysis

## 🌐 API Integration & Backend

The application integrates with a robust Node.js backend API featuring:

### Backend Architecture
- **Express.js 5** - Modern web application framework
- **PostgreSQL Database** - Reliable relational database with Sequelize ORM
- **RESTful API Design** - Clean and scalable API endpoints

### AI-Powered Features
- **OpenAI Whisper Integration** - Premium audio transcription service for accurate medical dictation
- **Advanced Language Processing** - AI-powered analysis of medical consultations
- **Smart Audio Processing** - Server-side FFmpeg for audio optimization

### Core API Endpoints
- **Doctor Authentication**: Registration, login, and session management
- **Patient Management**: CRUD operations for patient data
- **Medical Records**: Visit tracking and medical history
- **Audio Processing**: Upload, transcription, and analysis
- **File Management**: AWS S3 integration for secure file storage

**API Base URL**: `https://admin.saramedico.com/api/v1`

### Backend Dependencies
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with bcrypt encryption
- **File Upload**: Multer for multipart form handling
- **Cloud Services**: AWS SDK, Cloudinary for media management
- **Communication**: SendGrid for emails, Twilio for SMS
- **Validation**: Joi for request validation
- **PDF Generation**: PDFKit for medical reports

### Security & Performance
- **JWT Token Management** - Automatic token refresh and validation
- **CORS Configuration** - Cross-origin resource sharing setup
- **Data Encryption** - bcrypt for password hashing
- **File Security** - Secure S3 presigned URLs
- **Input Validation** - Comprehensive request validation with Joi

## 🎨 UI Components

Built with a comprehensive set of reusable components:

- **Forms**: Input, Label, Checkbox, Select, Textarea
- **Navigation**: Navigation Menu, Dropdown Menu, Tabs
- **Feedback**: Alert, Dialog, Toast (Sonner), Tooltip
- **Data Display**: Card, Table, Badge, Avatar, Progress
- **Layout**: Accordion, Separator, Sheet, Scroll Area

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication system
- **Premium OpenAI Integration** - Secure API key management for Whisper transcription
- **AWS S3 Security** - Encrypted file storage with presigned URLs
- **Database Encryption** - bcrypt password hashing and data protection
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Comprehensive request validation with Joi
- **Protected Routes** - Role-based access control
- **Secure File Upload** - Validated and sanitized file handling
- **Environment Security** - Secure environment variable management

## 🚀 Deployment

### Production Environment
- **Frontend**: Deployed at [https://saramedico.com](https://saramedico.com)
- **Backend API**: Deployed at [https://admin.saramedico.com](https://admin.saramedico.com)

### Vercel (Frontend Deployment)
The frontend is deployed on Vercel with automatic deployments:
1. Connected to GitHub repository for continuous deployment
2. Environment variables configured for production
3. Automatic builds on push to main branch
4. Custom domain configured (saramedico.com)

### Backend Deployment
The backend API is deployed with:
1. Production-ready Express.js server
2. PostgreSQL database configuration
3. AWS S3 integration for file storage
4. OpenAI API integration for transcription services
5. Custom domain configured (admin.saramedico.com)

