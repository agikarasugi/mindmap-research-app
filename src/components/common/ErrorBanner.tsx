interface Props {
  message: string | null
  onDismiss?: () => void
}

export function ErrorBanner({ message, onDismiss }: Props) {
  if (!message) return null

  return (
    <div className="flex items-start gap-2 bg-red-900/50 px-3 py-2 text-sm text-red-200">
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-red-400 hover:text-red-200">
          ✕
        </button>
      )}
    </div>
  )
}
