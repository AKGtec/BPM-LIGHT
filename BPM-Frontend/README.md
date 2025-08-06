# BPM Light - Business Process Management Frontend

A modern, intelligent business process management platform built with Angular 19, designed to digitize and automate internal business processes.

## 🚀 Features

### Core Functionality
- **Multi-Role Dashboard**: Role-based dashboards for Employees, Managers, HR, and Administrators
- **Dynamic Workflow Management**: Create and manage custom workflows with drag-and-drop interface
- **Request Management**: Submit, track, and manage various types of requests (Leave, Expense, Training, IT Support, Profile Updates)
- **Real-time Notifications**: SignalR integration for instant notifications and updates
- **Comprehensive Reporting**: Analytics and insights with export capabilities

### User Roles & Permissions
- **Employee**: Submit requests, view personal dashboard, track request status
- **Manager**: Approve/reject team requests, manage team workflows
- **HR**: Process approved requests, archive completed requests, generate reports
- **Admin**: Full system access, user management, workflow configuration

### Technical Features
- **Modern UI**: Material Design with Angular Material components
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Real-time Updates**: SignalR for live notifications and status updates
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Progressive Web App**: PWA capabilities for mobile experience

## 🛠️ Technology Stack

### Frontend
- **Angular 19**: Latest Angular framework with standalone components
- **Angular Material**: Material Design components
- **PrimeNG**: Additional UI components and charts
- **TypeScript**: Type-safe development
- **SCSS**: Advanced styling with variables and mixins
- **SignalR**: Real-time communication
- **Chart.js**: Data visualization

### Backend Integration
- **.NET 8 API**: RESTful API integration
- **JWT Authentication**: Secure token-based authentication
- **SignalR Hub**: Real-time notifications

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI

### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd BPM-Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   - Update `src/environments/environment.ts` with your API URL
   - Configure SignalR hub URL

4. Start development server:
   ```bash
   ng serve
   ```

5. Open browser and navigate to `http://localhost:4200`

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                 # Core services, guards, models
│   │   ├── guards/          # Authentication and role guards
│   │   ├── models/          # TypeScript interfaces and models
│   │   ├── services/        # Business logic services
│   │   └── interceptors/    # HTTP interceptors
│   ├── features/            # Feature modules
│   │   ├── auth/           # Authentication module
│   │   ├── dashboard/      # Dashboard components
│   │   ├── requests/       # Request management
│   │   ├── workflows/      # Workflow management
│   │   └── admin/          # Administration features
│   ├── shared/             # Shared components and utilities
│   │   ├── components/     # Reusable components
│   │   └── layout/         # Layout components
│   └── environments/       # Environment configurations
```

## 🎯 Key Components

### Authentication System
- Login/Register with form validation
- JWT token management
- Role-based route protection
- Automatic token refresh

### Dashboard System
- **Main Dashboard**: Overview with quick actions
- **Employee Dashboard**: Personal request tracking
- **Manager Dashboard**: Team request approvals
- **HR Dashboard**: Request processing and archiving
- **Reporting Dashboard**: Analytics and insights

### Request Management
- Dynamic form generation based on request type
- Multi-step approval workflow
- Status tracking and history
- File attachments support

### Workflow Designer
- Visual workflow builder
- Drag-and-drop interface
- Role assignment for each step
- Conditional logic support

## 🔧 Configuration

### Environment Variables
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:63668',
  appName: 'BPM Light',
  version: '1.0.0',
  enableLogging: true,
  tokenExpirationTime: 3600000,
  signalRUrl: 'https://localhost:63668/notificationHub'
};
```

### Supported Request Types
- **Leave Requests**: Vacation, sick leave, personal time
- **Expense Reports**: Business expenses with receipt uploads
- **Training Requests**: Professional development courses
- **IT Support**: Technical assistance requests
- **Profile Updates**: Personal information changes

## 🚀 Deployment

### Development Build
```bash
ng build
```

### Production Build
```bash
ng build --configuration production
```

### Docker Deployment
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/bpm-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 📱 Progressive Web App

The application includes PWA capabilities:
- Offline functionality
- Push notifications
- App-like experience on mobile devices
- Automatic updates

## 🔒 Security Features

- JWT token-based authentication
- Role-based access control (RBAC)
- Route guards for protected pages
- HTTP interceptors for automatic token attachment
- XSS protection
- CSRF protection

## 📊 Performance Optimizations

- Lazy loading of feature modules
- OnPush change detection strategy
- Tree shaking for smaller bundle sizes
- Service worker for caching
- Image optimization
- Code splitting

## 🧪 Testing

### Unit Tests
```bash
ng test
```

### End-to-End Tests
```bash
ng e2e
```

### Test Coverage
```bash
ng test --code-coverage
```

## 📈 Monitoring & Analytics

- Application performance monitoring
- User interaction tracking
- Error logging and reporting
- Usage analytics
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🗺️ Roadmap

### Version 1.1
- [ ] Mobile app (React Native)
- [ ] Advanced reporting features
- [ ] Integration with external systems
- [ ] Workflow templates library

### Version 1.2
- [ ] AI-powered workflow optimization
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API rate limiting

### Version 2.0
- [ ] Microservices architecture
- [ ] Advanced workflow designer
- [ ] Integration marketplace
- [ ] Enterprise features

---

**BPM Light** - Streamlining business processes with intelligent automation.