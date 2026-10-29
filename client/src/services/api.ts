import type {
  Conversation,
  AppSettings,
  ModelProvider,
  FileNode,
  ProjectInspection,
  FileDiff,
  CommandResult,
  AuthUser,
} from '../types';

const authenticatedHeaders = (): HeadersInit => {
  const token = localStorage.getItem('neutron_token') || sessionStorage.getItem('neutron_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const DEFAULT_BACKEND_URL = 'https://neutron-g9b0.onrender.com';

const apiUrl = (path: string): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const baseUrl =
    envUrl && typeof envUrl === 'string' && envUrl.trim() !== '' && envUrl.trim() !== '/'
      ? envUrl.trim()
      : DEFAULT_BACKEND_URL;
  return `${baseUrl.replace(/\/+$/, '')}${path}`;
};

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err: any) {
    if (err instanceof TypeError) {
      throw new Error(
        `Cannot connect to backend (${DEFAULT_BACKEND_URL}). If Render is waking up from sleep, please wait 30 seconds and try again.`
      );
    }
    throw err;
  }
}

async function handleResponse<T = any>(res: Response, defaultMessage: string): Promise<T> {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON response (e.g. HTML 502/503 from reverse proxy or Cloudflare)
  }

  if (!res.ok) {
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        'Backend server is waking up (Render free tier spin-up). Please wait 20-30 seconds and try again.'
      );
    }
    throw new Error(data?.error || data?.message || `${defaultMessage} (${res.status})`);
  }

  return data as T;
}

export const api = {
  getAuthToken(): string | null {
    return localStorage.getItem('neutron_token') || sessionStorage.getItem('neutron_token');
  },

  async login(payload: { email: string; password: string }): Promise<{ user: AuthUser; token: string }> {
    const res = await safeFetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res, 'Failed to sign in');
  },

  async register(payload: { name: string; email: string; password: string; role?: string }): Promise<{ user: AuthUser; token: string }> {
    const res = await safeFetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res, 'Failed to register account');
  },

  async fetchCurrentUser(): Promise<AuthUser> {
    const token = this.getAuthToken();
    if (!token) throw new Error('No active session');
    const res = await safeFetch(apiUrl('/api/auth/me'), { headers: { Authorization: `Bearer ${token}` } });
    const data = await handleResponse<{ user: AuthUser }>(res, 'Session is invalid');
    return data.user;
  },

  async fetchConversations(): Promise<Conversation[]> {
    const res = await safeFetch(apiUrl('/api/conversations'), { headers: authenticatedHeaders() });
    const data = await handleResponse<{ conversations: Conversation[] }>(res, 'Failed to fetch conversations');
    return data.conversations || [];
  },

  async fetchConversation(id: string): Promise<Conversation> {
    const res = await safeFetch(apiUrl(`/api/conversations/${id}`), { headers: authenticatedHeaders() });
    const data = await handleResponse<{ conversation: Conversation }>(res, 'Failed to fetch conversation');
    return data.conversation;
  },

  async saveConversation(conv: Conversation): Promise<void> {
    const res = await safeFetch(apiUrl('/api/conversations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authenticatedHeaders() },
      body: JSON.stringify(conv),
    });
    await handleResponse(res, 'Failed to save conversation');
  },

  async deleteConversation(id: string): Promise<void> {
    const res = await safeFetch(apiUrl(`/api/conversations/${id}`), {
      method: 'DELETE',
      headers: authenticatedHeaders(),
    });
    await handleResponse(res, 'Failed to delete conversation');
  },

  async fetchWorkspaceTree(): Promise<{
    workspaceDir: string;
    tree: FileNode[];
    inspection: ProjectInspection;
  }> {
    const res = await safeFetch(apiUrl('/api/workspace/tree'), { headers: authenticatedHeaders() });
    return handleResponse(res, 'Failed to fetch workspace tree');
  },

  async fetchFileContent(filePath: string): Promise<string> {
    const res = await safeFetch(apiUrl(`/api/workspace/file?path=${encodeURIComponent(filePath)}`), { headers: authenticatedHeaders() });
    const data = await handleResponse<{ content: string }>(res, 'Failed to fetch file');
    return data.content;
  },

  async saveFileContent(filePath: string, content: string): Promise<FileDiff> {
    const res = await safeFetch(apiUrl('/api/workspace/file'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authenticatedHeaders() },
      body: JSON.stringify({ path: filePath, content }),
    });
    const data = await handleResponse<{ diff: FileDiff }>(res, 'Failed to save file');
    return data.diff;
  },

  async searchFiles(query: string, isRegex = false) {
    const res = await safeFetch(apiUrl('/api/workspace/search'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authenticatedHeaders() },
      body: JSON.stringify({ query, isRegex }),
    });
    return handleResponse(res, 'Failed to search');
  },

  async runCommand(command: string, cwd?: string): Promise<CommandResult> {
    const res = await safeFetch(apiUrl('/api/execute/run'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authenticatedHeaders() },
      body: JSON.stringify({ command, cwd }),
    });
    const data = await handleResponse<{ result: CommandResult }>(res, 'Command failed');
    return data.result;
  },

  async fetchSettings(): Promise<AppSettings> {
    const res = await safeFetch(apiUrl('/api/settings'), { headers: authenticatedHeaders() });
    return handleResponse(res, 'Failed to fetch settings');
  },

  async updateSettings(payload: any): Promise<AppSettings> {
    const res = await safeFetch(apiUrl('/api/settings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authenticatedHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await handleResponse<{ settings: AppSettings }>(res, 'Failed to update settings');
    return data.settings;
  },

  async fetchModels(): Promise<ModelProvider[]> {
    const res = await safeFetch(apiUrl('/api/models'), { headers: authenticatedHeaders() });
    const data = await handleResponse<{ providers: ModelProvider[] }>(res, 'Failed to fetch models');
    return data.providers || [];
  },

  /**
   * Streams agent execution events via SSE
   */
  streamAgentRequest(
    payload: {
      prompt: string;
      mode: 'agent' | 'chat';
      conversationId: string;
      provider?: string;
      model?: string;
    },
    onEvent: (event: any) => void,
    onDone: () => void,
    onError: (err: any) => void,
    signal?: AbortSignal
  ): () => void {
    const controller = new AbortController();
    const activeSignal = signal || controller.signal;

    (async () => {
      try {
        const response = await safeFetch(apiUrl('/api/agent/stream'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...authenticatedHeaders(),
          },
          body: JSON.stringify(payload),
          signal: activeSignal,
        });

        if (!response.ok) {
          let errorDetail = '';
          try {
            const errJson = await response.json();
            errorDetail = errJson.error || errJson.message || '';
          } catch {
            errorDetail = await response.text().catch(() => '');
          }
          if (response.status === 502 || response.status === 503 || response.status === 504) {
            throw new Error(
              errorDetail || 'Render backend is waking up (free tier spin-up). Please retry in 20-30 seconds.'
            );
          }
          throw new Error(errorDetail || `Server returned status ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No readable stream returned by server');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              onDone();
              return;
            }
            try {
              const event = JSON.parse(dataStr);
              onEvent(event);
            } catch {
              // ignore partial json
            }
          }
        }

        onDone();
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('[NEUTRON] Generation aborted by user.');
          onDone();
        } else {
          onError(err);
        }
      }
    })();

    return () => controller.abort();
  },
};
