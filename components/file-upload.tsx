'use client'

import { Upload01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { upload } from '@vercel/blob/client'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type FileRejection, useDropzone } from 'react-dropzone'
import { toast } from 'sonner'

interface FileUploadProps {
  onUploadComplete: () => void
  isPro: boolean
}

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

const ACCEPTED_MIME_TYPES = new Set([
  'audio/mpeg', // mp3
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'video/mp4',
  'video/webm'
])

const ACCEPTED_EXTENSIONS = new Set([
  '.mp3',
  '.wav',
  '.flac',
  '.ogg',
  '.m4a',
  '.aac',
  '.mp4',
  '.webm'
])

// Mobile device detection utility
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

// iOS detection
const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
}

// Android detection
const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

export function FileUpload({ onUploadComplete, isPro }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  )
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const lastSelectedFilesRef = useRef<File[]>([])

  const getFileExtension = (fileName: string) => {
    const dotIndex = fileName.lastIndexOf('.')
    if (dotIndex === -1) return ''
    return fileName.slice(dotIndex).toLowerCase()
  }

  const isAllowedFileType = (file: File) => {
    const mime = file.type?.toLowerCase()
    const extension = file.name ? getFileExtension(file.name) : ''

    // Mobile devices (iOS and Android) often return empty or incorrect MIME types
    // Prioritize extension checking on mobile devices when MIME is empty or suspicious
    const isMobile = isMobileDevice()
    const hasEmptyOrSuspiciousMime =
      !mime || mime === 'application/octet-stream' || mime === ''

    if (isMobile && hasEmptyOrSuspiciousMime && extension) {
      if (ACCEPTED_EXTENSIONS.has(extension)) {
        const deviceType = isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Mobile'
        console.log(
          `[${deviceType}] File validated by extension (MIME empty/suspicious): ${file.name} (${extension})`
        )
        return true
      }
    }

    // Android Chrome sometimes returns generic MIME types - check extension as fallback
    if (
      isAndroid() &&
      mime &&
      (mime === 'application/octet-stream' ||
        mime === 'audio/*' ||
        mime === 'video/*')
    ) {
      if (extension && ACCEPTED_EXTENSIONS.has(extension)) {
        console.log(
          `[Android] File validated by extension (generic MIME): ${file.name} (${extension}, MIME: ${mime})`
        )
        return true
      }
    }

    // Check MIME type first if available and valid
    if (mime && ACCEPTED_MIME_TYPES.has(mime)) {
      console.log(`File validated by MIME type: ${file.name} (${mime})`)
      return true
    }

    // Fallback to extension check for all devices
    if (extension && ACCEPTED_EXTENSIONS.has(extension)) {
      console.log(`File validated by extension: ${file.name} (${extension})`)
      return true
    }

    const deviceInfo = isMobile
      ? isIOS()
        ? '[iOS]'
        : isAndroid()
          ? '[Android]'
          : '[Mobile]'
      : ''
    console.warn(
      `${deviceInfo} File rejected: ${file.name} (MIME: ${mime || 'empty'}, Extension: ${extension || 'none'})`
    )
    return false
  }

  // Mobile-specific error message formatter
  const formatMobileError = useCallback((error: string): string => {
    if (!isMobileDevice()) return error

    // Shorten common errors for mobile
    if (error.includes('network') || error.includes('connection')) {
      return 'Connection failed. Check your network.'
    }
    if (error.includes('size') || error.includes('25MB')) {
      return 'File too large. Max 25MB.'
    }
    if (error.includes('not a supported file') || error.includes('format')) {
      return 'Unsupported format. Use: MP3, WAV, M4A, FLAC, OGG, MP4, WebM'
    }
    return error.length > 60 ? error.substring(0, 57) + '...' : error
  }, [])

  const handleFiles = useCallback(
    async (files: FileList | File[], isRetry = false) => {
      if (files.length === 0) return

      // Clear any previous errors
      setError(null)

      if (!isPro && files.length > 1) {
        const errorMsg = isMobileDevice()
          ? 'Multiple files need Pro plan'
          : 'Multiple file uploads are only available for Pro users'
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      const fileArray = Array.from(files)

      // Store files for retry functionality
      if (!isRetry) {
        lastSelectedFilesRef.current = fileArray
      }

      // Log file selection for debugging (especially on mobile)
      const deviceType = isIOS()
        ? 'iOS'
        : isAndroid()
          ? 'Android'
          : isMobileDevice()
            ? 'Mobile'
            : 'Desktop'
      console.log(
        `[FileUpload] Processing ${fileArray.length} file(s) on ${deviceType}`
      )
      fileArray.forEach((file, index) => {
        console.log(`[FileUpload] File ${index + 1}:`, {
          name: file.name,
          size: file.size,
          type: file.type || 'empty',
          extension: getFileExtension(file.name),
          device: deviceType
        })
      })

      const invalidFile = fileArray.find((file) => !isAllowedFileType(file))
      if (invalidFile) {
        const errorMsg = isMobileDevice()
          ? `"${invalidFile.name}" not supported. Use: MP3, WAV, M4A, FLAC, OGG, MP4, WebM`
          : `"${invalidFile.name}" is not a supported file. Allowed: MP3, WAV, M4A, FLAC, OGG, MP4, WebM`
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      for (const file of fileArray) {
        if (file.size > MAX_FILE_SIZE) {
          const sizeMB = (file.size / 1024 / 1024).toFixed(2)
          const errorMsg = isMobileDevice()
            ? `"${file.name}" too large (${sizeMB}MB). Max 25MB.`
            : `File "${file.name}" exceeds maximum size of 25MB (${sizeMB}MB)`
          setError(errorMsg)
          toast.error(errorMsg)
          return
        }
      }

      setUploading(true)
      setUploadProgress({})
      setError(null)

      try {
        const uploadResults: Array<{
          fileUrl: string
          fileName: string
          fileSize: number
          mimeType: string
          blobPathname: string
        }> = []

        for (const file of fileArray) {
          try {
            const blob = await upload(file.name, file, {
              access: 'public',
              handleUploadUrl: '/api/transcriptions/upload-token',
              clientPayload: JSON.stringify({
                fileName: file.name,
                fileSize: file.size,
                mimeType: file.type || '' // Handle empty MIME types
              })
            })

            uploadResults.push({
              fileUrl: blob.url,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type || '',
              blobPathname: blob.pathname
            })

            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: 100
            }))
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error)
            const errorMessage =
              error instanceof Error
                ? error.message
                : `Failed to upload ${file.name}`

            // Check for network errors (common on mobile, especially Android)
            const isNetworkError =
              errorMessage.includes('network') ||
              errorMessage.includes('fetch') ||
              errorMessage.includes('Failed to fetch') ||
              errorMessage.includes('NetworkError') ||
              errorMessage.includes('timeout') ||
              errorMessage.includes('aborted') ||
              (isAndroid() && errorMessage.includes('ERR_'))

            // Android-specific error handling
            const isAndroidSpecificError =
              isAndroid() &&
              (errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
                errorMessage.includes('ERR_NETWORK_CHANGED') ||
                errorMessage.includes('ERR_CONNECTION_REFUSED'))

            const displayError = isMobileDevice()
              ? formatMobileError(errorMessage)
              : errorMessage

            setError(displayError)
            toast.error(displayError)
            setUploading(false)

            // Don't return on network errors - allow retry (especially important for Android)
            if (!isNetworkError && !isAndroidSpecificError) {
              return
            }

            // For Android network errors, log additional info
            if (isAndroidSpecificError) {
              console.warn(`[Android] Network error detected: ${errorMessage}`)
            }
          }
        }

        // Only proceed if we have upload results
        if (uploadResults.length === 0) {
          setUploading(false)
          return
        }

        const response = await fetch('/api/transcriptions/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            files: uploadResults
          })
        })

        let data: { transcriptions: unknown[]; error?: string }
        try {
          data = await response.json()
        } catch {
          const text = await response.text()
          console.error('Failed to parse response as JSON:', text)
          const errorMsg = `Server error (${response.status})`
          setError(isMobileDevice() ? formatMobileError(errorMsg) : errorMsg)
          throw new Error(
            `Server error (${response.status}): ${text.substring(0, 100)}`
          )
        }

        if (response.ok) {
          const successMsg = `${data.transcriptions.length} file(s) uploaded! Processing...`
          toast.success(successMsg)
          setError(null)
          setRetryCount(0)
          onUploadComplete()
        } else {
          const errorMessage =
            data?.error || `Upload failed with status ${response.status}`
          console.error('Upload failed:', {
            status: response.status,
            error: errorMessage,
            data
          })
          const displayError = isMobileDevice()
            ? formatMobileError(errorMessage)
            : errorMessage
          setError(displayError)
          toast.error(displayError)
        }
      } catch (error) {
        console.error('Upload error:', error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to upload files. Please check your connection and try again.'

        const displayError = isMobileDevice()
          ? formatMobileError(errorMessage)
          : errorMessage

        setError(displayError)
        toast.error(displayError)
      } finally {
        setUploading(false)
        setUploadProgress({})
      }
    },
    [isPro, onUploadComplete]
  )

  const handleRetry = () => {
    if (lastSelectedFilesRef.current.length > 0) {
      setRetryCount((prev) => prev + 1)
      handleFiles(lastSelectedFilesRef.current, true)
    }
  }

  const clearError = () => {
    setError(null)
  }

  // Handle file drop/accepted
  const onDropAccepted = useCallback(
    (acceptedFiles: File[]) => {
      const deviceType = isIOS()
        ? 'iOS'
        : isAndroid()
          ? 'Android'
          : isMobileDevice()
            ? 'Mobile'
            : 'Desktop'
      console.log(
        `[FileUpload] ${acceptedFiles.length} file(s) accepted on ${deviceType}`
      )

      if (acceptedFiles.length === 0) {
        console.warn('[FileUpload] No files in acceptedFiles array')
        return
      }

      // Log file details for debugging mobile issues
      acceptedFiles.forEach((file, index) => {
        console.log(`[FileUpload] Accepted file ${index + 1}:`, {
          name: file.name,
          size: file.size,
          type: file.type || 'empty',
          lastModified: file.lastModified
        })
      })

      // Filter by our custom validation (react-dropzone does basic validation, but we need custom logic)
      // This is especially important on mobile where MIME types can be empty or incorrect
      const validFiles = acceptedFiles.filter(isAllowedFileType)

      if (validFiles.length === 0) {
        const errorMsg = isMobileDevice()
          ? 'Unsupported format. Use: MP3, WAV, M4A, FLAC, OGG, MP4, WebM'
          : 'Allowed formats: MP3, WAV, M4A, FLAC, OGG, MP4, WebM'
        console.error(
          '[FileUpload] All files failed validation:',
          acceptedFiles
        )
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      console.log(
        `[FileUpload] ${validFiles.length} valid file(s) after filtering`
      )
      handleFiles(validFiles)
    },
    [handleFiles]
  )

  // Handle file rejection
  const onDropRejected = useCallback(
    (fileRejections: FileRejection[]) => {
      const deviceType = isIOS()
        ? 'iOS'
        : isAndroid()
          ? 'Android'
          : isMobileDevice()
            ? 'Mobile'
            : 'Desktop'
      console.log(
        `[FileUpload] ${fileRejections.length} file(s) rejected on ${deviceType}`
      )

      const firstRejection = fileRejections[0]
      if (!firstRejection) return

      const firstError = firstRejection.errors[0]
      let errorMsg = ''

      if (firstError.code === 'file-too-large') {
        errorMsg = isMobileDevice()
          ? `"${firstRejection.file.name}" too large. Max 25MB.`
          : `File "${firstRejection.file.name}" exceeds maximum size of 25MB`
      } else if (firstError.code === 'file-invalid-type') {
        errorMsg = isMobileDevice()
          ? `"${firstRejection.file.name}" not supported. Use: MP3, WAV, M4A, FLAC, OGG, MP4, WebM`
          : `"${firstRejection.file.name}" is not a supported file. Allowed: MP3, WAV, M4A, FLAC, OGG, MP4, WebM`
      } else if (firstError.code === 'too-many-files') {
        errorMsg = isMobileDevice()
          ? 'Multiple files need Pro plan'
          : 'Multiple file uploads are only available for Pro users'
      } else {
        errorMsg = isMobileDevice()
          ? formatMobileError(firstError.message)
          : firstError.message
      }

      setError(errorMsg)
      toast.error(errorMsg)
    },
    [formatMobileError]
  )

  // Configure react-dropzone with mobile-friendly settings
  // iOS and Android browsers are picky about accept attribute format
  // Use simplified wildcards for mobile, detailed types for desktop
  const acceptConfig: Record<string, string[]> = isMobileDevice()
    ? {
        // Simplified for mobile browsers - they handle wildcards better
        'audio/*': [],
        'video/*': []
      }
    : {
        // Detailed for desktop browsers
        'audio/mpeg': ['.mp3'],
        'audio/mp3': ['.mp3'],
        'audio/wav': ['.wav'],
        'audio/x-wav': ['.wav'],
        'audio/flac': ['.flac'],
        'audio/x-flac': ['.flac'],
        'audio/ogg': ['.ogg'],
        'audio/m4a': ['.m4a'],
        'audio/x-m4a': ['.m4a'],
        'audio/aac': ['.aac'],
        'video/mp4': ['.mp4'],
        'video/webm': ['.webm'],
        'audio/*': ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac'],
        'video/*': ['.mp4', '.webm']
      }

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept: acceptConfig,
    multiple: isPro,
    maxSize: MAX_FILE_SIZE,
    noClick: !isMobileDevice(), // Allow clicking anywhere on mobile, use button on desktop
    noKeyboard: true,
    // Disable preventDefault on mobile to ensure native file picker works
    preventDropOnDocument: !isMobileDevice(),
    // Custom validator for our file type logic
    validator: (file) => {
      if (!isAllowedFileType(file)) {
        return {
          code: 'file-invalid-type',
          message: `File type not supported`
        }
      }
      return null
    }
  })

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      setError(null)
    }
  }, [])

  return (
    <section
      {...getRootProps()}
      aria-label="File upload area"
      className={`cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all group w-full ${
        isDragActive
          ? 'border-[#d856bf] bg-[#d856bf]/10'
          : 'border-white/20 hover:border-[#d856bf]/50'
      } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        {...getInputProps()}
        aria-label="File upload input"
        // Ensure input is accessible on mobile browsers
        style={{ display: 'none' }}
      />

      <div className="flex flex-col items-center">
        <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#d856bf]/10 transition-all mb-4">
          <HugeiconsIcon
            icon={Upload01Icon}
            size={32}
            className={`text-gray-400 group-hover:text-[#d856bf] transition-colors ${uploading ? 'animate-pulse' : ''}`}
          />
        </div>
        <h3 className="font-['Satoshi'] text-lg font-semibold text-primary mb-2">
          {uploading
            ? 'Uploading...'
            : isDragActive
              ? 'Drop files here'
              : 'Drop your audio file here'}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          {isPro
            ? 'Supports multiple files: MP3, WAV, M4A, FLAC, OGG, MP4, WebM (max 25MB each)'
            : 'Supports MP3, WAV, M4A, FLAC, OGG, MP4, WebM (max 25MB)'}
        </p>

        {/* Error Display */}
        {error && (
          <div className="w-full max-w-md mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400 font-medium mb-2">{error}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={
                      uploading || lastSelectedFilesRef.current.length === 0
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={clearError}
                    className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={uploading}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            // On mobile, the dropzone handles clicks, so only call open() on desktop
            // This prevents double-triggering the file picker on mobile browsers
            if (!isMobileDevice()) {
              open()
            }
            // On mobile, clicking the button will trigger the dropzone's click handler
            // which is already configured to open the file picker
          }}
          className="px-6 py-3 bg-gradient-to-r from-[#d856bf] to-[#c247ac] rounded-full text-white font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          {uploading ? 'Uploading...' : 'Browse Files'}
        </button>
        {!isPro && (
          <p className="text-xs text-gray-500 mt-4">
            Upgrade to Pro to upload multiple files at once
          </p>
        )}
      </div>
    </section>
  )
}
