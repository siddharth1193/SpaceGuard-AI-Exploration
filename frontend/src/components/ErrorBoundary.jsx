import { Component } from 'react'

/**
 * React Error Boundary — catches render errors in child components
 * and displays a fallback UI instead of a white screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-gray-200 px-6">
          <div className="text-4xl mb-4">⚠</div>
          <h1 className="text-lg font-bold text-red-400 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-400 text-center max-w-md mb-6">
            SpaceGuard AI encountered an unexpected error. This may be caused by a temporary issue.
          </p>
          <pre className="text-xs text-gray-500 bg-gray-900 rounded-lg p-4 max-w-lg overflow-auto mb-6 border border-gray-700/50">
            {this.state.error?.message || 'Unknown error'}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
              window.location.reload()
            }}
            className="btn-primary"
          >
            Reload Application
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
