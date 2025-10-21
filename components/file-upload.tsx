'use client'

import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

interface FileUploadProps {
  onUploadComplete: () => void
  isPro: boolean
}

export function FileUpload({ onUploadComplete, isPro }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return

    if (!isPro && files.length > 1) {
      toast.error('Multiple file uploads are only available for Pro users')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/transcriptions/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(
          `${data.transcriptions.length} file(s) uploaded successfully! Processing...`
        )
        onUploadComplete()
      } else {
        toast.error(data.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
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
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <section
      aria-label="File upload area"
      className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all group w-full ${
        dragActive
          ? 'border-[#d856bf] bg-[#d856bf]/10'
          : 'border-white/20 hover:border-[#d856bf]/50'
      } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={isPro}
        accept="audio/*,video/mp4,video/mpeg,video/webm"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-col items-center">
        <div className="p-4 rounded-full bg-white/5 group-hover:bg-[#d856bf]/10 transition-all mb-4">
          <Upload
            className={`w-8 h-8 text-gray-400 group-hover:text-[#d856bf] transition-colors ${uploading ? 'animate-pulse' : ''}`}
          />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
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
