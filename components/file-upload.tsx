'use client'

import { Upload01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { upload } from '@vercel/blob/client'
import { Upload, AlertCircle, RefreshCw } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
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

// Check if browser has known file input issues (iOS Safari, Android Chrome, etc.)
const hasFileInputIssues = (): boolean => {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  // iOS Safari, Android Chrome, and other mobile browsers often have file input quirks
  return /iPhone|iPad|iPod|Android/i.test(ua) || 
         (isMobileDevice() && /Chrome|Safari|Firefox/i.test(ua))
}

export function FileUpload({ onUploadComplete, isPro }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  )
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    const hasEmptyOrSuspiciousMime = !mime || mime === 'application/octet-stream' || mime === ''
    
    if (isMobile && hasEmptyOrSuspiciousMime && extension) {
      if (ACCEPTED_EXTENSIONS.has(extension)) {
        const deviceType = isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Mobile'
        console.log(`[${deviceType}] File validated by extension (MIME empty/suspicious): ${file.name} (${extension})`)
        return true
      }
    }
    
    // Android Chrome sometimes returns generic MIME types - check extension as fallback
    if (isAndroid() && mime && (mime === 'application/octet-stream' || mime === 'audio/*' || mime === 'video/*')) {
      if (extension && ACCEPTED_EXTENSIONS.has(extension)) {
        console.log(`[Android] File validated by extension (generic MIME): ${file.name} (${extension}, MIME: ${mime})`)
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
    
    const deviceInfo = isMobile ? (isIOS() ? '[iOS]' : isAndroid() ? '[Android]' : '[Mobile]') : ''
    console.warn(`${deviceInfo} File rejected: ${file.name} (MIME: ${mime || 'empty'}, Extension: ${extension || 'none'})`)
    return false
  }

  // Mobile-specific error message formatter
  const formatMobileError = (error: string): string => {
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
  }

  const handleFiles = async (files: FileList | File[], isRetry = false) => {
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
    const deviceType = isIOS() ? 'iOS' : isAndroid() ? 'Android' : isMobileDevice() ? 'Mobile' : 'Desktop'
    console.log(`[FileUpload] Processing ${fileArray.length} file(s) on ${deviceType}`)
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
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
          const isAndroidSpecificError = isAndroid() && (
            errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
            errorMessage.includes('ERR_NETWORK_CHANGED') ||
            errorMessage.includes('ERR_CONNECTION_REFUSED')
          )
          
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

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
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
      if (fileInputRef.current && !error) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRetry = () => {
    if (lastSelectedFilesRef.current.length > 0) {
      setRetryCount((prev) => prev + 1)
      handleFiles(lastSelectedFilesRef.current, true)
    }
  }

  const clearError = () => {
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const deviceType = isIOS() ? 'iOS' : isAndroid() ? 'Android' : isMobileDevice() ? 'Mobile' : 'Desktop'
    console.log(`[FileUpload] onChange event fired on ${deviceType}`)
    
    if (!e.target.files || e.target.files.length === 0) {
      console.log(`[FileUpload] No files selected on ${deviceType}`)
      // On Android, sometimes the file picker cancels silently
      // Clear any previous error state
      if (isAndroid()) {
        setError(null)
      }
      return
    }

    console.log(`[FileUpload] ${e.target.files.length} file(s) selected on ${deviceType}`)
    
    // On Android, sometimes files are selected but have issues - add extra validation
    const filesArray = Array.from(e.target.files)
    
    // Check for files with zero size (Android file picker sometimes returns these)
    const zeroSizeFiles = filesArray.filter(f => f.size === 0)
    if (zeroSizeFiles.length > 0 && isAndroid()) {
      console.warn(`[Android] Found ${zeroSizeFiles.length} file(s) with zero size`)
      // Don't reject immediately - some Android devices report size as 0 initially
    }
    
    const validFiles = filesArray.filter(isAllowedFileType)

    if (validFiles.length === 0) {
      const errorMsg = isMobileDevice()
        ? 'Unsupported format. Use: MP3, WAV, M4A, FLAC, OGG, MP4, WebM'
        : 'Allowed formats: MP3, WAV, M4A, FLAC, OGG, MP4, WebM'
      setError(errorMsg)
      toast.error(errorMsg)
      e.target.value = ''
      return
    }

    // On Android, ensure files have valid sizes before proceeding
    const invalidSizeFiles = validFiles.filter(f => f.size === 0)
    if (invalidSizeFiles.length > 0 && isAndroid()) {
      console.warn(`[Android] Some files have zero size, but proceeding anyway`)
    }

    handleFiles(validFiles)
  }

  // Mobile fallback: handle input event as well (iOS Safari, Android Chrome, etc.)
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const deviceType = isIOS() ? 'iOS' : isAndroid() ? 'Android' : 'Mobile'
    console.log(`[FileUpload] onInput event fired (${deviceType} fallback)`)
    const target = e.target as HTMLInputElement
    if (target.files && target.files.length > 0) {
      // Only process if onChange didn't already handle it
      // This is a fallback for mobile browsers that may not fire onChange reliably
      // Use a longer timeout for Android devices which may need more time
      const timeout = isAndroid() ? 200 : 100
      setTimeout(() => {
        if (target.files && target.files.length > 0) {
          console.log(`[FileUpload] Processing via onInput fallback (${deviceType})`)
          handleChange({
            target,
            currentTarget: target
          } as React.ChangeEvent<HTMLInputElement>)
        }
      }, timeout)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  // Clear error when component unmounts or when new files are selected
  useEffect(() => {
    return () => {
      setError(null)
    }
  }, [])

  return (
    <section
      aria-label="File upload area"
      className={`cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all group w-full ${
        dragActive
          ? 'border-[#d856bf] bg-[#d856bf]/10'
          : 'border-white/20 hover:border-[#d856bf]/50'
      } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={isPro}
        accept=".mp3,.wav,.flac,.ogg,.m4a,.aac,.mp4,.webm,audio/*,video/*"
        onChange={handleChange}
        onInput={handleInput}
        className="hidden"
        aria-label="File upload input"
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
            : dragActive
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
                    disabled={uploading || lastSelectedFilesRef.current.length === 0}
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
          onClick={handleClick}
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
