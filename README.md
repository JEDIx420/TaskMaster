# TaskMaster

A modern task management application with Pomodoro timer, AI chat assistant, and n8n webhook integration. Built with Next.js 14+ and TypeScript.

## ✨ Features

- 🍅 **Enhanced Pomodoro Timer** - Focus sessions with work/break cycles, task integration, and automatic progress tracking
- 📋 **Task Management** - Multiple view modes (List, Kanban, Calendar, Stats)
- 🤖 **AI Chat Assistant** - LLM-powered assistant via n8n webhook for task questions and commands
- 📊 **Productivity Dashboard** - Comprehensive stats and insights for focus sessions and task completion
- 🔗 **Pomodoro-Task Integration** - Automatic increment of completed pomodoros when work sessions finish
- 🎯 **Task Selection** - Choose specific tasks for Pomodoro work sessions
- 🌙 **Dark/Light Mode** - Toggle between themes
- 🔗 **n8n Integration** - Webhook-based external integrations with Google Sheets
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Real-time Updates** - Instant UI feedback with toast notifications

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/your-username/TaskMaster.git
cd TaskMaster
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Optional: Pre-configure webhook URLs (can also be set via Settings UI)
N8N_WEBHOOK_LOG_SESSION=https://your-n8n-instance.com/webhook/log-session
N8N_WEBHOOK_ADD_TASK=https://your-n8n-instance.com/webhook/add-task
N8N_WEBHOOK_UPDATE_TASK=https://your-n8n-instance.com/webhook/update-task
N8N_WEBHOOK_DELETE_TASK=https://your-n8n-instance.com/webhook/delete-task
N8N_WEBHOOK_GET_TASKS=https://your-n8n-instance.com/webhook/get-tasks
N8N_WEBHOOK_CHAT=https://your-n8n-instance.com/webhook/chat
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Configure Webhooks

1. Click the ⚙️ Settings icon in the navigation
2. Enter your n8n webhook URLs (see [Configuring n8n](#configuring-n8n) below)
3. URLs will be validated before saving
4. Start managing tasks and tracking pomodoros!

## 🔧 Configuring n8n

TaskMaster integrates with n8n workflows to sync data with Google Sheets. Each webhook serves a specific purpose:

### Required Webhooks

| Webhook | Method | Purpose | Required Data |
|---------|---------|---------|---------------|
| `N8N_WEBHOOK_GET_TASKS` | GET | Fetch all tasks | None |
| `N8N_WEBHOOK_ADD_TASK` | POST | Create new task | `id`, `title`, `description`, `status`, `priority`, `estimatedPomodoros`, `completedPomodoros`, `dueDate`, `createdAt` |
| `N8N_WEBHOOK_UPDATE_TASK` | POST | Update existing task | `id` + any fields to update |
| `N8N_WEBHOOK_DELETE_TASK` | POST | Delete task | `id` |
| `N8N_WEBHOOK_LOG_SESSION` | POST | Log Pomodoro session | `task`, `type`, `duration`, `timestamp`, `notes` |
| `N8N_WEBHOOK_CHAT` | POST | Chat with LLM | `message` |

### Sample n8n Workflow Setup

1. **Create Google Sheets** with columns matching the schema below
2. **Set up n8n workflows** for each webhook endpoint
3. **Connect to Google Sheets** using Google Sheets nodes
4. **Configure LLM integration** for chat functionality (optional)

### Google Sheets Schema

#### Tasks Sheet
```
| id | title | description | status | priority | estimatedPomodoros | completedPomodoros | dueDate | createdAt |
```

#### Sessions Sheet  
```
| id | task | type | duration | timestamp | notes |
```

### Example Task JSON
```json
{
  "id": "uuid-here",
  "title": "Complete project documentation",
  "description": "Write comprehensive docs for the new feature",
  "status": "doing",
  "priority": "high", 
  "estimatedPomodoros": 3,
  "completedPomodoros": 1,
  "dueDate": "2025-07-09T10:00:00.000Z",
  "createdAt": "2025-07-07T08:00:00.000Z"
}
```

### Example Session JSON
```json
{
  "task": "Complete project documentation",
  "type": "work",
  "duration": 1500,
  "timestamp": "2025-07-07T09:25:00.000Z",
  "notes": "Focused work session"
}
```

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy TaskMaster"
git push origin main
```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

3. **Set Environment Variables**
   - Add all `N8N_WEBHOOK_*` URLs in Vercel's environment variables section
   - Or configure them later via the Settings UI

### Deploy n8n Workflows

1. **n8n Cloud**: Use [n8n.cloud](https://n8n.cloud) for hosted solution
2. **Self-hosted**: Deploy n8n on your preferred platform
3. **Local Development**: Run n8n locally with `npx n8n`

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests in watch mode

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Headless UI  
- **Drag & Drop**: react-beautiful-dnd
- **Calendar**: react-big-calendar
- **Code Quality**: ESLint + Prettier + Husky
- **Testing**: Jest + React Testing Library

## 🏗 Architecture

- **Frontend**: Next.js React application
- **Integration**: n8n webhooks for external data sync
- **Storage**: Google Sheets via n8n (no database required)
- **State Management**: React hooks with local fallback data
- **Error Handling**: Toast notifications with graceful degradation

## 🔄 Error Handling

TaskMaster implements robust error handling:

- **Webhook Failures**: Shows toast notifications, continues with local data
- **Network Issues**: Graceful degradation with mock data fallback  
- **Invalid URLs**: Real-time validation in Settings modal
- **Missing Webhooks**: Clear UI guidance to configure integrations

## 📖 Usage Tips

1. **First Time Setup**: Start by configuring webhook URLs in Settings
2. **Task Management**: Use different views (List/Kanban/Calendar) based on your workflow
3. **Pomodoro Sessions**: Select a task before starting a work session for automatic tracking
4. **AI Assistant**: Ask questions about your tasks or use commands like `/list`, `/add`
5. **Productivity Insights**: Check the Stats view for productivity trends

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `/docs/PRODUCT_VISION.md` for detailed architecture
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions and ideas

---

Built with ❤️ using Next.js, TypeScript, and n8n



## Features

- 🍅 **Enhanced Pomodoro Timer** - Focus sessions with work/break cycles, task integration, and automatic progress tracking
- 📋 **Task Management** - Multiple view modes (List, Kanban, Calendar, Stats)
- � **AI Chat Assistant** - LLM-powered assistant via n8n webhook for task questions and commands
- �📊 **Productivity Dashboard** - Comprehensive stats and insights for focus sessions and task completion
- 🔗 **Pomodoro-Task Integration** - Automatic increment of completed pomodoros when work sessions finish
- 🎯 **Task Selection** - Choose specific tasks for Pomodoro work sessions
- 🌙 **Dark/Light Mode** - Toggle between themes
- 🔗 **n8n Integration** - Webhook-based external integrations
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Real-time Updates** - Instant UI feedback

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests in watch mode

## Backend Integration (n8n)

TaskMaster integrates with n8n workflows via webhooks to enable external data storage and automation. The following webhooks need to be configured in your n8n instance:

### Required n8n Webhooks

1. **Log Session Webhook** (`N8N_WEBHOOK_LOG_SESSION`)
   - **Purpose**: Called when a Pomodoro session is completed
   - **Method**: POST
   - **Payload**: 
     ```json
     {
       "task": "string",
       "type": "work|shortBreak|longBreak",
       "duration": "number (seconds)",
       "timestamp": "ISO string",
       "notes": "string (optional)"
     }
     ```
   - **Suggested n8n Flow**: Webhook → Google Sheets (log sessions)

2. **Add Task Webhook** (`N8N_WEBHOOK_ADD_TASK`)
   - **Purpose**: Called when a new task is created
   - **Method**: POST
   - **Payload**:
     ```json
     {
       "title": "string",
       "description": "string (optional)",
       "estimatedPomodoros": "number",
       "dueDate": "ISO string (optional)",
       "priority": "low|medium|high"
     }
     ```
   - **Suggested n8n Flow**: Webhook → Google Sheets (add task row)

3. **Update Task Webhook** (`N8N_WEBHOOK_UPDATE_TASK`)
   - **Purpose**: Called when a task is updated or moved (Kanban)
   - **Method**: POST
   - **Payload**:
     ```json
     {
       "id": "string",
       "title": "string (optional)",
       "description": "string (optional)",
       "status": "backlog|doing|done",
       "estimatedPomodoros": "number (optional)",
       "completedPomodoros": "number (optional)",
       "dueDate": "ISO string (optional)",
       "priority": "low|medium|high (optional)"
     }
     ```
   - **Suggested n8n Flow**: Webhook → Google Sheets (update task row)

4. **Delete Task Webhook** (`N8N_WEBHOOK_DELETE_TASK`)
   - **Purpose**: Called when a task is deleted
   - **Method**: POST
   - **Payload**:
     ```json
     {
       "id": "string"
     }
     ```
   - **Suggested n8n Flow**: Webhook → Google Sheets (delete task row)

5. **Get Tasks Webhook** (`N8N_WEBHOOK_GET_TASKS`)
   - **Purpose**: Called to fetch all tasks from external source
   - **Method**: GET
   - **Response**: Array of task objects
   - **Suggested n8n Flow**: Webhook → Google Sheets (read all tasks) → Return JSON

### Setting up n8n → Google Sheets Integration

1. **Create a Google Sheet** with columns:
   - `id`, `title`, `description`, `status`, `priority`, `estimatedPomodoros`, `completedPomodoros`, `dueDate`, `createdAt`

2. **Create n8n Workflows**:
   - **Add Task Flow**: Webhook Trigger → Google Sheets (Append)
   - **Update Task Flow**: Webhook Trigger → Google Sheets (Update)
   - **Delete Task Flow**: Webhook Trigger → Google Sheets (Delete)
   - **Get Tasks Flow**: Webhook Trigger → Google Sheets (Read) → Return Response
   - **Log Session Flow**: Webhook Trigger → Google Sheets (Append to sessions sheet)

3. **Configure Webhook URLs**:
   - Copy the webhook URLs from your n8n workflows
   - In TaskMaster, go to Settings (gear icon in navigation)
   - Paste the webhook URLs into the corresponding fields
   - Click "Save Settings"

### Environment Variables (Optional)

You can also set webhook URLs via environment variables (useful for deployment):

```env
N8N_WEBHOOK_LOG_SESSION=https://your-n8n-instance.com/webhook/log-session
N8N_WEBHOOK_ADD_TASK=https://your-n8n-instance.com/webhook/add-task
N8N_WEBHOOK_UPDATE_TASK=https://your-n8n-instance.com/webhook/update-task
N8N_WEBHOOK_DELETE_TASK=https://your-n8n-instance.com/webhook/delete-task
N8N_WEBHOOK_GET_TASKS=https://your-n8n-instance.com/webhook/get-tasks
N8N_WEBHOOK_CHAT=https://your-n8n-instance.com/webhook/chat-agent
```

**Note**: Runtime settings (via Settings modal) take precedence over environment variables.

### Chat Assistant n8n Workflow

The chat feature requires an additional n8n workflow that connects to an LLM service:

**Chat Webhook** (`N8N_WEBHOOK_CHAT`)
- **Purpose**: Process user messages through LLM agent
- **Method**: POST
- **Payload**:
  ```json
  {
    "message": "string"
  }
  ```
- **Response**:
  ```json
  {
    "answer": "string"
  }
  ```

**Suggested n8n Chat Workflow**:
1. **HTTP Webhook** (POST /chat-agent) - Receives user message
2. **LLM Node** (OpenAI/Gemini/Ollama) - Processes message with prompt:
   ```
   You are TaskMaster Assistant. Answer the user's question about their tasks 
   concisely. You will receive {{ $json.message }}. You have read-only access 
   to Google Sheets via the following Function item.
   ```
3. **(Optional) Google Sheets** - Read tasks for context
4. **Set Node** - Return JSON `{ "answer": "<LLM response>" }`
5. **Respond to Webhook** - Send response back to TaskMaster

This keeps LLM API keys secure within n8n and prevents exposure to the browser.

## Project Structure

```
taskmaster/
├── README.md
├── next.config.js
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── public/
│   └── favicon.ico
├── styles/
│   └── globals.css
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── api/
│       └── log-session/
│           └── route.ts
├── components/
│   ├── navigation.tsx
│   ├── settings-modal.tsx
│   ├── pomodoro-timer.tsx
│   ├── task-views/
│   │   ├── task-list-view.tsx
│   │   ├── task-kanban-view.tsx
│   │   └── task-calendar-view.tsx
│   ├── theme-provider.tsx
│   └── ui/
├── lib/
│   ├── utils.ts
│   └── n8n.ts
└── package.json
```

## Deployment

This app can be deployed to any platform that supports Next.js static exports:

- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

The app is configured for static export (`output: 'export'` in `next.config.js`), making it suitable for deployment without server-side requirements.