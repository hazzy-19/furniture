// Icon wrapper enforcing brutalist outline styling across all Lucide icons

function WhatsappIcon({
  size = 22,
  className = '',
  fill = 'currentColor',
  ...props
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    >
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l5.1-1.34A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18a7.9 7.9 0 0 1-4.3-1.26l-.3-.19-3.03.8.81-2.95-.2-.3A7.93 7.93 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
      <path d="M16.6 13.9c-.25-.13-1.47-.73-1.7-.81-.23-.08-.4-.13-.56.13-.17.25-.65.81-.8.98-.14.17-.3.19-.55.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.3.37-.44.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08s.89 2.41 1.01 2.58c.13.17 1.76 2.68 4.25 3.76.6.26 1.06.41 1.43.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.11-.23-.17-.48-.3z" />
    </svg>
  )
}

export default function Icon({
  icon: Component,
  size = 22,
  className = '',
  strokeWidth = 2.5,
  strokeLinecap = 'square',
  strokeLinejoin = 'miter',
  fill,
  ...props
}) {
  if (!Component) return null

  if (Component === 'whatsapp' || Component === WhatsappIcon) {
    return (
      <WhatsappIcon
        size={size}
        className={className}
        fill={fill || 'currentColor'}
        {...props}
      />
    )
  }

  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      fill={fill || 'none'}
      aria-hidden="true"
      className={`shrink-0 ${className}`}
      {...props}
    />
  )
}
