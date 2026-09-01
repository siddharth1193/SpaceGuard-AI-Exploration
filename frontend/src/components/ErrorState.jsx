export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="text-3xl">⚠</div>
      <div className="text-center">
        <p className="text-sm font-medium text-red-400">Connection Error</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs">{message || 'Failed to load data'}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-xs">
          Retry
        </button>
      )}
    </div>
  )
}
