/**
 * Robust API Client with Error Recovery
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Rate limit handling with Retry-After support
 * - Network error recovery
 * - Type-safe request/response handling
 * - Timeout management
 */

export class APIError extends Error {
  constructor(
    public status: number,
    public data: any,
    message?: string
  ) {
    super(message || `API Error: ${status}`)
    this.name = 'APIError'
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timeout') {
    super(message)
    this.name = 'TimeoutError'
  }
}

interface RequestOptions extends RequestInit {
  retry?: number
  retryDelay?: number
  timeout?: number
  onRetry?: (attempt: number, error: Error) => void
}

export class APIClient {
  private baseURL: string

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
  }

  /**
   * Main fetch method with retry logic and error recovery
   */
  async fetch<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    const { retry = 3, retryDelay = 1000, timeout = 30000, onRetry, ...fetchOptions } = options

    let lastError: Error
    const fullURL = this.baseURL + url

    for (let attempt = 0; attempt < retry; attempt++) {
      try {
        // Create abort controller for timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(fullURL, {
          ...fetchOptions,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Handle rate limiting with Retry-After header
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const waitTime = retryAfter
            ? parseInt(retryAfter) * 1000
            : retryDelay * Math.pow(2, attempt)

          if (attempt < retry - 1) {
            if (onRetry) onRetry(attempt + 1, new Error('Rate limit exceeded'))
            await this.delay(waitTime)
            continue
          }

          throw new APIError(429, await this.parseResponse(response), 'Rate limit exceeded')
        }

        // Handle server errors (5xx) with exponential backoff
        if (response.status >= 500) {
          if (attempt < retry - 1) {
            const waitTime = retryDelay * Math.pow(2, attempt)
            if (onRetry) onRetry(attempt + 1, new Error(`Server error: ${response.status}`))
            await this.delay(waitTime)
            continue
          }

          throw new APIError(response.status, await this.parseResponse(response), 'Server error')
        }

        // Handle client errors (4xx) - don't retry
        if (!response.ok) {
          throw new APIError(
            response.status,
            await this.parseResponse(response),
            response.statusText
          )
        }

        // Success - parse and return response
        return await this.parseResponse(response)
      } catch (error: any) {
        lastError = error

        // Don't retry on abort (timeout)
        if (error.name === 'AbortError') {
          throw new TimeoutError()
        }

        // Don't retry on client errors (4xx)
        if (error instanceof APIError && error.status >= 400 && error.status < 500) {
          throw error
        }

        // Network errors - retry with exponential backoff
        if (error instanceof TypeError || error.message?.includes('fetch')) {
          if (attempt < retry - 1) {
            const waitTime = retryDelay * Math.pow(2, attempt)
            if (onRetry) onRetry(attempt + 1, new NetworkError('Network request failed'))
            await this.delay(waitTime)
            continue
          }

          throw new NetworkError('Network request failed after multiple retries')
        }

        // Re-throw if it's the last attempt
        if (attempt === retry - 1) {
          throw error
        }

        // Otherwise retry with exponential backoff
        const waitTime = retryDelay * Math.pow(2, attempt)
        if (onRetry) onRetry(attempt + 1, error)
        await this.delay(waitTime)
      }
    }

    throw lastError!
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.fetch<T>(url, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
    })
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.fetch<T>(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: JSON.stringify(data),
    })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options?: RequestOptions): Promise<T> {
    return this.fetch<T>(url, { ...options, method: 'DELETE' })
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      return response.json()
    }

    if (contentType?.includes('text/')) {
      return response.text()
    }

    return response.blob()
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Default API client instance
 */
export const apiClient = new APIClient('/api')

/**
 * Hook-friendly API client with error handling
 */
export async function safeAPICall<T>(
  fn: () => Promise<T>,
  options: {
    onError?: (error: Error) => void
    fallback?: T
  } = {}
): Promise<{ data?: T; error?: Error; isError: boolean }> {
  try {
    const data = await fn()
    return { data, isError: false }
  } catch (error: any) {
    if (options.onError) {
      options.onError(error)
    }

    return {
      error,
      data: options.fallback,
      isError: true,
    }
  }
}

/**
 * Type-safe API request wrapper with automatic error handling
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestOptions
): Promise<{ data?: T; error?: APIError | Error }> {
  try {
    const data = await apiClient.fetch<T>(url, options)
    return { data }
  } catch (error: any) {
    console.error(`API request failed: ${url}`, error)
    return { error }
  }
}
