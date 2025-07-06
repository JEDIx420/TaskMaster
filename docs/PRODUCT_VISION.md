# Personal Productivity Suite - Product Vision

## Section 1 - Vision

Build a modular, zero-cost **Personal Productivity Suite** consisting of interconnected modules:

1. **TaskMaster** – Task CRUD, Pomodoro logging, dashboard (List / Kanban / Calendar)
2. **FlowTracker** – Daily mood / energy journaling  
3. **VoiceBoard** – Voice-to-task capture (Whisper)
4. **AmbientWorkspace** – Focus page with ambient sound + Pomodoro timer

**Shared principles:**
- White / sky-blue light theme with dark-mode support
- Mobile-first responsive design
- n8n + Google Sheets only (no database)
- Component reuse across modules
- Clean, intuitive UX

## Section 2 - Module Roles

### TaskMaster (Current)
**Role:** Data hub for tasks across the entire suite
- Owns full task lifecycle webhooks in n8n
- Provides React hooks (`useTasks`, `usePomodoro`) for sibling modules
- Four dashboard views: List, Kanban, Calendar, Stats
- Ties Pomodoro sessions to tasks
- Manages task CRUD operations and session logging
- **Chat Assistant:** AI-powered task assistant via n8n LLM webhook
- **Stats Dashboard:** Productivity insights with focus session analytics

### FlowTracker (Planned)
**Role:** Personal wellness and productivity insights
- Daily mood and energy level tracking
- Integration with TaskMaster for productivity correlation
- Simple journaling interface
- Trend visualization

### VoiceBoard (Planned)
**Role:** Voice-first task capture
- Whisper API integration for voice-to-text
- Quick task creation via voice commands
- Integration with TaskMaster's task system

### AmbientWorkspace (Planned)
**Role:** Focused work environment
- Ambient sound selection (rain, cafe, white noise)
- Integrated Pomodoro timer (using TaskMaster's timer logic)
- Minimal, distraction-free interface
- Session logging to TaskMaster

## Section 3 - Active n8n Webhooks & Google Sheet Schemas

### Current TaskMaster Webhooks
- `N8N_WEBHOOK_LOG_SESSION` - POST - Logs completed Pomodoro sessions
- `N8N_WEBHOOK_ADD_TASK` - POST - Creates new tasks
- `N8N_WEBHOOK_UPDATE_TASK` - POST - Updates existing tasks
- `N8N_WEBHOOK_DELETE_TASK` - POST - Deletes tasks
- `N8N_WEBHOOK_GET_TASKS` - GET - Retrieves all tasks
- `N8N_WEBHOOK_CHAT` - POST - Chat with LLM assistant agent

### Google Sheets Schema

#### Tasks Sheet
| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique task identifier |
| title | string | Task title |
| description | string | Optional task description |
| status | enum | backlog, doing, done |
| priority | enum | low, medium, high |
| estimatedPomodoros | number | Estimated work sessions |
| completedPomodoros | number | Completed work sessions |
| dueDate | ISO string | Optional due date |
| createdAt | ISO string | Creation timestamp |

#### Sessions Sheet
| Column | Type | Description |
|--------|------|-------------|
| id | string | Unique session identifier |
| task | string | Associated task title |
| type | enum | work, shortBreak, longBreak |
| duration | number | Session duration in seconds |
| timestamp | ISO string | Session completion time |
| notes | string | Optional session notes |

## Section 4 - Changelog

*Newest entries first*

- 2025-07-07 – Hardened webhook error handling; finished Chat UI; docs finalised. (by Copilot)
- 2025-07-07 – Chat UI polish: messenger-style bubbles & responsive layout (by Copilot)
- 2025-07-07 – Added Chat Assistant via n8n LLM webhook (by Copilot)
- 2025-07-07 – Fixed Pomodoro timer display overflow: reduced font sizes, improved responsive scaling, added proper centering and padding to keep timer numbers within the circular progress ring (by Copilot)
- 2025-07-06 – Enhanced TaskMaster with comprehensive Pomodoro-task integration: usePomodoro hook with session tracking, automatic task pomodoro increment, task selection in timer, and stats dashboard with productivity insights (by Copilot)
- 2025-07-06 – Created PRODUCT_VISION.md with system architecture and documentation standards (by Copilot)

## Section 5 - Environment Variables

TaskMaster supports configuration via environment variables and runtime settings.

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `N8N_WEBHOOK_LOG_SESSION` | Optional | Logs completed Pomodoro sessions | `https://n8n.example.com/webhook/sessions` |
| `N8N_WEBHOOK_ADD_TASK` | Optional | Creates new tasks | `https://n8n.example.com/webhook/add-task` |
| `N8N_WEBHOOK_UPDATE_TASK` | Optional | Updates existing tasks | `https://n8n.example.com/webhook/update-task` |
| `N8N_WEBHOOK_DELETE_TASK` | Optional | Deletes tasks | `https://n8n.example.com/webhook/delete-task` |
| `N8N_WEBHOOK_GET_TASKS` | Optional | Fetches all tasks | `https://n8n.example.com/webhook/get-tasks` |
| `N8N_WEBHOOK_CHAT` | Optional | LLM chat assistant | `https://n8n.example.com/webhook/chat` |

**Note**: Runtime settings (configured via Settings modal) take precedence over environment variables.
