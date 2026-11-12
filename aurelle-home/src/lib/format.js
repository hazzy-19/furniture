// Aurelle Home - Currency and formatting utilities

export function formatKes(n) {
  if (typeof n !== 'number') return ''
  return `KES ${new Intl.NumberFormat('en-KE').format(n)}`
}

