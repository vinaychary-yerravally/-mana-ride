import { API_CONFIG } from './endpoints';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  success: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...((options.headers as Record<string, string>) || {})
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      let parsed: any = null;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        try {
          parsed = await response.json();
        } catch {
          parsed = null;
        }
      } else if (response.status !== 204) {
        try {
          parsed = await response.text();
        } catch {
          parsed = null;
        }
      }

      return {
        data: parsed as T,
        status: response.status,
        success: response.ok,
        message: response.ok ? undefined : (parsed && typeof parsed === 'object' && 'error' in parsed ? String(parsed.error) : undefined)
      };
    } catch (err: any) {
      return {
        data: null as any,
        status: 500,
        message: err?.message || 'Network error',
        success: false
      };
    }
  }

  async get<T>(endpoint: string, init?: RequestInit): Promise<T> {
    const res = await this.request<T>(endpoint, { ...init, method: 'GET' });
    if (!res.success) {
      throw new Error(res.message || 'Request failed');
    }
    return res.data as T;
  }

  async post<T>(endpoint: string, body?: Record<string, any> | FormData, init?: RequestInit): Promise<T> {
    const res = await this.request<T>(endpoint, {
      ...init,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body ?? {})
    });

    if (!res.success) {
      throw new Error(res.message || 'Request failed');
    }
    return res.data as T;
  }

  async patch<T>(endpoint: string, body?: Record<string, any>, init?: RequestInit): Promise<T> {
    const res = await this.request<T>(endpoint, {
      ...init,
      method: 'PATCH',
      body: JSON.stringify(body ?? {})
    });

    if (!res.success) {
      throw new Error(res.message || 'Request failed');
    }
    return res.data as T;
  }
}

export const defaultApiClient = new ApiClient();
