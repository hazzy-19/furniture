// Icon wrapper enforcing brutalist outline styling across all Lucide icons
export default function Icon({
  icon: Component,
  size = 22,
  className = '',
  strokeWidth = 2.5,
  strokeLinecap = 'square',
  strokeLinejoin = 'miter',
  ...props
}) {
  if (!Component) return null

  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    />
  )
}
