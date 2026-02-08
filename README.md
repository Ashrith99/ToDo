# Todo App - Full Stack

A production-ready personal task management application with date-based tasks and nested subtasks.

## Features

- **Date-based Task Instances**: Each day gets its own completion status for date-based tasks
- **Independent Daily Progress**: Completing a task today doesn't affect other days
- **Two Task Types**:
  - **Static Tasks**: No dates, can be completed anytime (Tasks tab)
  - **Date-based Tasks**: Appear daily within date ranges (Calendar tab)
- **Nested Subtasks**: Tasks can have optional subtasks with individual completion tracking
- **Daily View**: Calendar shows tasks scheduled for specific dates with day-specific progress
- **Task Management**: Create, update, delete tasks with comprehensive validation
- **User Authentication**: Secure JWT-based authentication system
- **Clean UI**: Modern, responsive design with smooth animations
- **Search & Filter**: Advanced task filtering and sorting capabilities
- **Progress Tracking**: Visual progress bars and completion states per day

## Tech Stack

### Frontend
- React 18 with Hooks
- React Router v6
- Tailwind CSS
- Axios for API calls
- React DatePicker

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- CORS enabled

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string to remote instance)
- npm or yarn

### Installation

1. **Clone and setup** (automated):
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   Or manually:
   ```bash
   npm run install-all
   ```

2. **Configure environment**:
   - Server environment is pre-configured in `server/.env`
   - For production, update `JWT_SECRET` and `MONGODB_URI` in `server/.env`

3. **Start the application**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Demo Account
For testing, you can register a new account or use these demo credentials:
- Email: demo@example.com  
- Password: demo123

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── utils/         # Utility functions
├── server/                # Express backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── controllers/      # Route controllers
│   └── utils/            # Server utilities
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tasks
- `GET /api/tasks` - Get all user tasks
- `GET /api/tasks/today` - Get today's tasks
- `GET /api/tasks/date/:date` - Get tasks for specific date
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Subtasks
- `POST /api/tasks/:taskId/subtasks` - Create subtask
- `PUT /api/subtasks/:id` - Update subtask
- `DELETE /api/subtasks/:id` - Delete subtask

## Data Models

### User
- email, password, name, createdAt

### Task
- title, startDate, endDate, userId, subtasks, createdAt, updatedAt

### Subtask
- title, completed, notes, taskId, createdAt, updatedAt

## Example API Responses

### Create Task
```json
POST /api/tasks
{
  "title": "Gym Workout",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z"
}

Response:
{
  "message": "Task created successfully",
  "task": {
    "_id": "65a1b2c3d4e5f6789012345",
    "title": "Gym Workout",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "userId": "65a1b2c3d4e5f6789012340",
    "subtasks": [],
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T10:00:00.000Z"
  }
}
```

### Get Today's Tasks
```json
GET /api/tasks/today

Response:
{
  "tasks": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "title": "Gym Workout",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z",
      "subtasks": [
        {
          "_id": "65a1b2c3d4e5f6789012346",
          "title": "Cardio - 30 minutes",
          "completed": false,
          "notes": "Treadmill or bike",
          "taskId": "65a1b2c3d4e5f6789012345"
        }
      ]
    }
  ],
  "date": "2024-01-15"
}
```

### Create Subtask
```json
POST /api/tasks/65a1b2c3d4e5f6789012345/subtasks
{
  "title": "Strength Training",
  "notes": "Focus on upper body"
}

Response:
{
  "message": "Subtask created successfully",
  "subtask": {
    "_id": "65a1b2c3d4e5f6789012347",
    "title": "Strength Training",
    "completed": false,
    "notes": "Focus on upper body",
    "taskId": "65a1b2c3d4e5f6789012345",
    "createdAt": "2024-01-01T10:30:00.000Z",
    "updatedAt": "2024-01-01T10:30:00.000Z"
  }
}
```

## Development Notes

### Key Features Implemented
- ✅ **Daily Task Instances** - Each day gets independent completion status
- ✅ **Auto-completion Logic**:
  - **Task → Subtasks**: Marking task complete auto-completes all subtasks
  - **Subtasks → Task**: Completing all subtasks auto-completes the main task
  - **Smart Unchecking**: Unchecking task or any subtask intelligently updates related items
- ✅ **Visual Feedback**: Toast notifications show when auto-completion occurs
- ✅ **Two Task Types**: Static tasks (Tasks tab) and date-based tasks (Calendar tab)
- ✅ **Independent Daily Progress**: Each day tracks completion separately
- ✅ **Nested Subtasks**: Optional subtasks with individual completion tracking
- ✅ **Real-time Sync**: UI updates immediately reflect completion changes

### Edge Cases Handled
- Date range validation (end date must be >= start date)
- Task deletion cascades to remove all subtasks
- User authentication with automatic token refresh
- Empty states for all views
- Form validation with user-friendly error messages
- Responsive design for mobile and desktop
- Loading states and error handling throughout the app

### Production Considerations
- Environment variables for sensitive configuration
- Password hashing with bcrypt (12 rounds)
- JWT tokens with 7-day expiration
- MongoDB indexes for efficient queries
- Input validation and sanitization
- CORS configuration for cross-origin requests
- Error logging and monitoring hooks
- Graceful error handling with user feedback

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.