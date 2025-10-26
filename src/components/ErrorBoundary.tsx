'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  maxRetries?: number
  resetOnPropsChange?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  retryCount: number
  lastPropsSnapshot?: any
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
      lastPropsSnapshot: props.children,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // Reset error boundary when props change (new route, new content)
    if (props.resetOnPropsChange && props.children !== state.lastPropsSnapshot && state.hasError) {
      return {
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: 0,
        lastPropsSnapshot: props.children,
      }
    }
    return null
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Store error info in state
    this.setState({ errorInfo })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to Sentry
    if (typeof window !== 'undefined') {
      import('@sentry/nextjs').then(Sentry => {
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        })
      })
    }

    // Attempt automatic recovery for transient errors
    const maxRetries = this.props.maxRetries ?? 2
    if (this.state.retryCount < maxRetries && this.isTransientError(error)) {
      // Exponential backoff: 1s, 2s, 4s...
      const delay = Math.pow(2, this.state.retryCount) * 1000

      this.retryTimeout = setTimeout(() => {
        this.setState(state => ({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          retryCount: state.retryCount + 1,
        }))
      }, delay)
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  /**
   * Determine if an error is likely transient and worth retrying
   */
  private isTransientError(error: Error): boolean {
    const message = error.message?.toLowerCase() || ''

    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout') ||
      message.includes('loading chunk') ||
      message.includes('dynamically imported module')
    )
  }

  /**
   * Manual reset handler for user-triggered recovery
   */
  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                Něco se pokazilo
              </h2>

              <p className="text-center text-gray-600 mb-6">
                Omlouváme se, ale došlo k neočekávané chybě.
                {this.state.retryCount > 0 && (
                  <span className="block mt-2 text-sm text-gray-500">
                    Automatický pokus o obnovu: {this.state.retryCount}/{this.props.maxRetries ?? 2}
                  </span>
                )}
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 mb-2">
                    Zobrazit technické detaily
                  </summary>
                  <div className="bg-gray-100 rounded p-4 mt-2">
                    <p className="text-sm font-mono text-red-600 mb-2">
                      {this.state.error.message}
                    </p>
                    <pre className="text-xs text-gray-700 overflow-auto">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                  type="button"
                >
                  Zkusit znovu
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  type="button"
                >
                  Obnovit stránku
                </button>
                <button
                  onClick={() => (window.location.href = '/')}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  type="button"
                >
                  Zpět domů
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
