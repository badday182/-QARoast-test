/**
 * Тонка обгортка над fetch. Єдине місце, де відома адреса API
 * та формат помилок NestJS.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  /** HTTP-статус; 0 — до сервера не достукались. */
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isOffline(): boolean {
    return this.status === 0;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  /** GET-запити читають свіжі дані: список змінюється після create/delete. */
  cache?: RequestCache;
  signal?: AbortSignal;
};

/**
 * Nest віддає { statusCode, error, message }, а ZodValidationPipe додає
 * errors: [{ path, message }] — без них помилка валідації згортається
 * у марне «Validation failed».
 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();

    if (body && typeof body === 'object') {
      const { message, errors } = body as {
        message?: unknown;
        errors?: unknown;
      };

      const details = Array.isArray(errors)
        ? errors
            .map((issue: unknown) =>
              issue && typeof issue === 'object' && 'message' in issue
                ? [
                    (issue as { path?: unknown }).path,
                    (issue as { message: unknown }).message,
                  ]
                    .filter(Boolean)
                    .join(': ')
                : null,
            )
            .filter(Boolean)
        : [];

      if (details.length > 0) return details.join('; ');
      if (Array.isArray(message)) return message.join(', ');
      if (typeof message === 'string') return message;
    }
  } catch {
    // тіло порожнє або не JSON — обійдемось статусом
  }

  return `${response.status} ${response.statusText}`.trim();
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, cache, signal } = options;

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      cache,
      signal,
      headers:
        body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    throw new ApiError(
      cause instanceof Error ? cause.message : 'Network request failed',
      0,
    );
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  // 204 No Content і порожнє тіло — повертати нічого
  if (
    response.status === 204 ||
    response.headers.get('content-length') === '0'
  ) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(
    path: string,
    body: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) => request<T>(path, { ...options, method: 'POST', body }),

  delete: <T = void>(
    path: string,
    options?: Omit<RequestOptions, 'method' | 'body'>,
  ) => request<T>(path, { ...options, method: 'DELETE' }),
};
