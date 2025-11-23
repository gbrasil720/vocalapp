'use client'

import { Upload01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { upload } from '@vercel/blob/client'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
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
  'video/mp4',
  'video/webm'
])

const ACCEPTED_EXTENSIONS = new Set([
  '.mp3',
  '.wav',
  '.flac',
  '.ogg',
  '.mp4',
  '.webm'
])

export function FileUpload({ onUploadComplete, isPro }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  )
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileExtension = (fileName: string) => {
    const dotIndex = fileName.lastIndexOf('.')
    if (dotIndex === -1) return ''
    return fileName.slice(dotIndex).toLowerCase()
  }

  const isAllowedFileType = (file: File) => {
    const mime = file.type?.toLowerCase()
    if (mime && ACCEPTED_MIME_TYPES.has(mime)) {
      return true
    }

    const extension = file.name ? getFileExtension(file.name) : ''
    return extension ? ACCEPTED_EXTENSIONS.has(extension) : false
  }

  const handleFiles = async (files: FileList | File[]) => {
    if (files.length === 0) return

    if (!isPro && files.length > 1) {
      toast.error('Multiple file uploads are only available for Pro users')
      return
    }

    const fileArray = Array.from(files)

    const invalidFile = fileArray.find((file) => !isAllowedFileType(file))
    if (invalidFile) {
      toast.error(
        `"${invalidFile.name}" is not a supported file. Allowed: MP3, WAV, FLAC, OGG, MP4, WebM`
      )
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      return
    }

    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `File "${file.name}" exceeds maximum size of 25MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`
        )
        return
      }
    }

    setUploading(true)
    setUploadProgress({})

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
              mimeType: file.type
            })
          })

          uploadResults.push({
            fileUrl: blob.url,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
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
          toast.error(errorMessage)
          setUploading(false)
          return
        }
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
        throw new Error(
          `Server error (${response.status}): ${text.substring(0, 100)}`
        )
      }

      if (response.ok) {
        toast.success(
          `${data.transcriptions.length} file(s) uploaded successfully! Processing...`
        )
        onUploadComplete()
      } else {
        const errorMessage =
          data?.error || `Upload failed with status ${response.status}`
        console.error('Upload failed:', {
          status: response.status,
          error: errorMessage,
          data
        })
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to upload files. Please check your connection and try again.'
      toast.error(errorMessage)
    } finally {
      setUploading(false)
      setUploadProgress({})
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
    if (!e.target.files || e.target.files.length === 0) return

    const validFiles = Array.from(e.target.files).filter(isAllowedFileType)

    if (validFiles.length === 0) {
      toast.error('Allowed formats: MP3, WAV, FLAC, OGG, MP4, WebM')
      e.target.value = ''
      return
    }

    handleFiles(validFiles)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

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
        accept=".mp3,.wav,.flac,.ogg,.mp4,.webm"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center">
        <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#d856bf]/10 transition-all mb-4">
          {/* <Upload
            className={`w-8 h-8 text-gray-400 group-hover:text-[#d856bf] transition-colors ${uploading ? 'animate-pulse' : ''}`}
          /> */}

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
