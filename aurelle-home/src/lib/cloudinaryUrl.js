export function cloudinaryUrl(url, width) {
  if (!url) {
    return url
  }

  if (typeof url !== 'string') {
    return url
  }

  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url
  }

  if (url.includes('/upload/f_auto')) {
    return url
  }

  const uploadIndex = url.indexOf('/upload/')
  const insertionIndex = uploadIndex + '/upload/'.length

  return (
    url.slice(0, insertionIndex) +
    `f_auto,q_auto,w_${width}/` +
    url.slice(insertionIndex)
  )
}

export default cloudinaryUrl
