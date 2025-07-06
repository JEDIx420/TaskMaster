// FILE: lib/n8n.ts

export async function postToN8N(pathEnv: string, body: unknown) {
  const url = getWebhook(pathEnv);
  if (!url) {
    throw new Error(`Webhook URL not configured for ${pathEnv}`);
  }
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    throw new Error(`n8n request failed: ${res.status}`);
  }
  
  return res;
}

export async function safePost(pathEnv: string, body: unknown) {
  const url = getWebhook(pathEnv);
  if (!url) {
    throw new Error(`${pathEnv} not configured. Please set up webhook URLs in Settings.`);
  }
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    throw new Error(`n8n ${pathEnv} failed (${res.status}): ${res.statusText}`);
  }
  
  return res;
}

export async function validateWebhookUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok || response.status === 405; // 405 Method Not Allowed is also acceptable
  } catch (error) {
    return false;
  }
}

export function getWebhook(keyEnv: string): string | null {
  // Check localStorage first (runtime configuration)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('taskmasterWebhooks');
      if (stored) {
        const webhooks = JSON.parse(stored);
        if (webhooks[keyEnv]) {
          return webhooks[keyEnv];
        }
      }
    } catch (error) {
      console.error('Failed to read webhooks from localStorage:', error);
    }
  }
  
  // Fallback to environment variables
  return process.env[keyEnv] || null;
}

export async function logSession(data: {
  task: string;
  type: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
  timestamp: string;
  notes?: string;
}) {
  return safePost('N8N_WEBHOOK_LOG_SESSION', data);
}

export async function addTask(data: {
  title: string;
  description?: string;
  estimatedPomodoros: number;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}) {
  return safePost('N8N_WEBHOOK_ADD_TASK', data);
}

export async function updateTask(data: {
  id: string;
  title?: string;
  description?: string;
  status?: 'backlog' | 'doing' | 'done';
  estimatedPomodoros?: number;
  completedPomodoros?: number;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}) {
  return safePost('N8N_WEBHOOK_UPDATE_TASK', data);
}

export async function deleteTask(data: { id: string }) {
  return safePost('N8N_WEBHOOK_DELETE_TASK', data);
}

export async function getTasks() {
  const url = getWebhook('N8N_WEBHOOK_GET_TASKS');
  if (!url) {
    throw new Error('Get tasks webhook URL not configured. Please set up webhook URLs in Settings.');
  }
  
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks (${res.status}): ${res.statusText}`);
  }
  
  return res.json();
}

export async function chatWithAgent(userMsg: string) {
  const res = await safePost('N8N_WEBHOOK_CHAT', { message: userMsg });
  return res.json() as Promise<{ answer: string }>;
}