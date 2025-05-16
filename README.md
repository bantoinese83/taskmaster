# TaskMaster

![TaskMaster Logo](/public/images/taskmaster-logo.png)

TaskMaster is a powerful, feature-rich task management system built with Next.js that brings advanced Kanban functionality to teams of all sizes. With customizable workflows, comprehensive analytics, and intuitive task management, TaskMaster helps teams visualize work, optimize processes, and boost productivity.

## 🌟 Key Features

### Core Functionality
- **Task Management**: Create, edit, assign, and track tasks with rich details
- **User Authentication**: Secure login and registration with role-based permissions
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Dark/Light Mode**: Choose your preferred visual theme

### Advanced Kanban Features
- **Customizable Workflows**: Create and modify columns to match your team's process
- **Swimlanes**: Visualize tasks across workflow status and a chosen property (assignee, priority, due date)
- **Column Archiving**: Declutter your workflow while preserving historical data
- **Column-Specific Filtering**: Filter tasks within individual columns by multiple criteria
- **Column Sorting**: Sort tasks within columns by different criteria (due date, priority, title, etc.)
- **Task Aging Indicators**: Visual cues for tasks that have been in a column for too long
- **Bulk Task Movement**: Move multiple tasks between columns at once
- **WIP Limits**: Set and enforce work-in-progress limits for each column

### Analytics and Reporting
- **Comprehensive Dashboard**: Visualize task distribution, completion rates, and trends
- **Column Statistics**: View metrics like average time in column for each status
- **Swimlane Statistics**: Track performance metrics for each swimlane
- **PDF Reports**: Generate downloadable reports with detailed statistics
- **Historical Data**: Track changes and performance over time

### Workflow Optimization
- **Template Customization**: Modify workflow templates before applying them
- **Process Insights**: Identify bottlenecks and optimize your workflow
- **Notification System**: Stay informed about task updates and approaching deadlines

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd taskmaster
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   DATABASE_URL="your-database-connection-string"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📖 Usage Guide

### Task Management

#### Creating Tasks
1. Click the "New Task" button in the navigation bar
2. Fill in the task details (title, description, due date, etc.)
3. Assign the task to a team member if desired
4. Set the priority and initial status
5. Click "Create Task" to add it to your board

#### Kanban Board
1. Navigate to the Kanban view to see your tasks organized by status
2. Drag and drop tasks between columns to update their status
3. Click on a task to view its details or edit it
4. Use the column header controls to filter, sort, or configure columns

### Customizing Your Workflow

#### Workflow Templates
1. Go to Settings > Workflow
2. Choose a template that matches your process
3. Customize the template by adding, removing, or modifying columns
4. Apply the template to create your workflow

#### Column Configuration
1. Click the settings icon in any column header
2. Adjust WIP limits, aging thresholds, or other settings
3. Archive columns that are no longer needed
4. Create new columns for additional workflow stages

### Using Swimlanes
1. Go to Settings > Workflow
2. Enable swimlanes and select a property (assignee, priority, due date)
3. Return to the Kanban board to see tasks organized in swimlanes
4. Expand or collapse individual swimlanes as needed

### Generating Reports
1. Navigate to the Reports section
2. Configure your report by selecting metrics, date ranges, and format options
3. Preview the report to ensure it contains the desired information
4. Download the PDF or schedule it for regular delivery

## 🔧 Advanced Configuration

### Database Configuration
TaskMaster uses Prisma with a default SQLite database for development. For production, we recommend using PostgreSQL or MySQL. Update your `DATABASE_URL` in the `.env` file and run migrations accordingly.

### Authentication Options
By default, TaskMaster uses NextAuth.js with a credentials provider. You can add additional providers (Google, GitHub, etc.) by updating the `lib/auth.ts` file.

### Deployment
TaskMaster is optimized for deployment on Vercel. Simply connect your GitHub repository to Vercel and configure the environment variables.

## 📊 API Documentation

TaskMaster provides a comprehensive API for integrating with other tools:

### Task Endpoints
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/:id` - Get a specific task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Workflow Endpoints
- `GET /api/workflow` - Get workflow settings
- `PUT /api/workflow` - Update workflow settings
- `GET /api/workflow/status` - List all statuses
- `POST /api/workflow/status` - Create a new status
- `PUT /api/workflow/status/:id` - Update a status
- `DELETE /api/workflow/status/:id` - Delete a status

### Report Endpoints
- `POST /api/reports/generate` - Generate a custom report

## 🤝 Contributing

We welcome contributions to TaskMaster! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## 📝 License

TaskMaster is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React framework used
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [dnd-kit](https://dndkit.com/) - Drag and drop functionality
- [React-PDF](https://react-pdf.org/) - PDF generation

---

Built with ❤️ by [YOUR TEAM NAME]
