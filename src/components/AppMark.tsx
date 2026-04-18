interface AppMarkProps {
  className?: string
}

export function AppMark({ className }: AppMarkProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      <rect width="64" height="64" rx="16" fill="#ffffff" />
      <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" stroke="#d9e2dc" />
      <path
        d="M32 12C25 12 17 17 17 29C17 39 24 48 32 52C40 48 47 39 47 29C47 17 39 12 32 12Z"
        fill="#17382b"
      />
      <path d="M32 18V45" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 27C28.5 24.5 25.5 23 22.5 22" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 33C35.5 30.5 38.5 29 41.5 28" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
