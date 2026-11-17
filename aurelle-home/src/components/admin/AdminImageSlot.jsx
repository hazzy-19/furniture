import { useEffect, useState } from 'react'
import { cloudinaryUrl } from '../../lib/cloudinaryUrl.js'

export default function AdminImageSlot({
  id,
  label,
  imageUrl = '',
  selectedFile = null,
  onSelectFile,
  onClearFile,
  onRemoveImage,
  helpText = 'Choose an image file from your device.',
  error = '',
  previewClass = 'h-40 w-full',
}) {
  const [localPreview, setLocalPreview] = useState('')

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreview('')
      return undefined
    }

    const objectUrl = URL.createObjectURL(selectedFile)
    setLocalPreview(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const effectivePreview = localPreview || imageUrl

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      onSelectFile(file)
    }
    // Allow re-selecting the same file if user clears and re-chooses
    event.target.value = ''
  }

  return (
    <div className="rounded-lg border border-brand-200 bg-white p-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
      )}

      {effectivePreview ? (
        <div className="relative mt-2 overflow-hidden rounded-lg border border-brand-200 bg-brand-50">
          <img
            src={cloudinaryUrl(effectivePreview, 200)}
            alt={label ? `${label} preview` : 'Image preview'}
            loading="lazy"
            decoding="async"
            className={`${previewClass} object-cover`}
          />
          {selectedFile && (
            <span className="absolute bottom-2 left-2 rounded-[4px] bg-brand-900/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-xs">
              Pending upload: {selectedFile.name}
            </span>
          )}
        </div>
      ) : (
        <div
          className={`mt-2 flex ${previewClass} items-center justify-center rounded-lg border-2 border-dashed border-brand-200 bg-brand-50 text-xs text-ink/60`}
        >
          No image set
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label
          htmlFor={id}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-[4px] border-2 border-ink px-4 text-xs font-semibold text-ink transition-colors hover:bg-ink hover:text-white"
        >
          {effectivePreview ? 'Replace from device' : 'Choose from device'}
        </label>
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileChange}
          className="sr-only"
        />

        {selectedFile && onClearFile && (
          <button
            type="button"
            onClick={onClearFile}
            className="cursor-pointer text-xs font-medium text-ink/70 hover:text-ink hover:underline"
          >
            Cancel new file
          </button>
        )}

        {!selectedFile && imageUrl && onRemoveImage && (
          <button
            type="button"
            onClick={onRemoveImage}
            className="cursor-pointer text-xs font-medium text-red-700 hover:underline"
          >
            Remove image
          </button>
        )}
      </div>

      {helpText && <p className="mt-1.5 text-xs text-ink/60">{helpText}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
