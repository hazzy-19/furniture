import { useEffect } from 'react'

export function usePageMeta({ title, description, noindex = false }) {
  useEffect(() => {
    if (title) {
      document.title = title
    }

    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]')
      if (!metaDescription) {
        metaDescription = document.createElement('meta')
        metaDescription.setAttribute('name', 'description')
        document.head.appendChild(metaDescription)
      }
      metaDescription.setAttribute('content', description)
    }

    let metaRobots = document.querySelector('meta[name="robots"]')
    if (noindex) {
      if (!metaRobots) {
        metaRobots = document.createElement('meta')
        metaRobots.setAttribute('name', 'robots')
        document.head.appendChild(metaRobots)
      }
      metaRobots.setAttribute('content', 'noindex')
    } else if (metaRobots) {
      metaRobots.remove()
    }
  }, [title, description, noindex])
}

export default usePageMeta

