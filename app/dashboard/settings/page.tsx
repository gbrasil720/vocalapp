'use client'

import { FloppyDiskIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft, Bell, Shield, Trash2, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'
import SpotlightCard from '@/components/SpotlightCard'
import { authClient } from '@/lib/auth-client'

export default function SettingsPage() {
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const [originalName, setOriginalName] = useState(session?.user.name || '')
  const [originalImage, setOriginalImage] = useState(session?.user.image || '')
  const [settings, setSettings] = useState({
    name: session?.user.name || '',
    image: session?.user.image || '',
    email: session?.user.email || '',
    notifications: {
      email: true,
      transcriptionComplete: true,
      weeklyReport: false
    }
  })
  const [isSaving, setIsSaving] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (session?.user.name) {
      setOriginalName(session.user.name)
      setSettings((prev) => ({ ...prev, name: session.user.name || '' }))
    }
    if (session?.user.image) {
      setOriginalImage(session.user.image)
      setSettings((prev) => ({ ...prev, image: session.user.image || '' }))
      setImageError(false)
    }
  }, [session?.user.name, session?.user.image])

  // Reset image error when image URL changes
  const handleImageChange = (newImage: string) => {
    setImageError(false)
    setSettings({ ...settings, image: newImage })
  }

  const handleImageFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB for avatars)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_SIZE) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploadingImage(true)
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload to server
      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        handleImageChange(data.url)
        toast.success('Image uploaded successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const hasChanges =
    settings.name !== originalName || settings.image !== originalImage
  const isSaveDisabled = !hasChanges || isSaving

  const handleSave = async () => {
    if (!hasChanges || isSaving) return

    setIsSaving(true)
    try {
      const body: { name?: string; image?: string } = {}
      if (settings.name !== originalName) {
        body.name = settings.name
      }
      if (settings.image !== originalImage) {
        body.image = settings.image
      }

      const response = await fetch('/api/auth/update-user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.name) {
          setOriginalName(data.name)
        }
        if (data.image !== undefined) {
          setOriginalImage(data.image || '')
        }
        toast.success('Profile updated successfully')
        // Refresh router for server components
        router.refresh()
        // Reload after a short delay to ensure session updates everywhere
        // This ensures all components (dashboard, navbar, etc.) get the updated session
        setTimeout(() => {
          window.location.reload()
        }, 800)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="hidden md:block fixed inset-0 z-0 opacity-40">
        <MemoizedHyperspeed />
      </div>

      <div className="relative min-h-screen z-10">
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-sm text-gray-400">
                  Manage your account preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-[#03b3c3]" />
              <h2 className="text-xl font-bold text-white">Profile</h2>
            </div>
            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="avatar-input"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Avatar Image
                  </label>
                  <div className="flex items-center gap-4">
                    {settings.image && !imageError && (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0 relative bg-transparent">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            backgroundImage:
                              'linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)',
                            backgroundSize: '8px 8px',
                            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
                          }}
                        />
                        <Image
                          src={settings.image}
                          alt="Avatar"
                          width={64}
                          height={64}
                          className="rounded-full relative z-10"
                          style={{
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%'
                          }}
                          unoptimized
                          onError={() => setImageError(true)}
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        id="avatar-file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileSelect}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {isUploadingImage ? 'Uploading...' : 'Upload Image'}
                        </button>
                        <input
                          id="avatar-input"
                          type="url"
                          value={settings.image}
                          onChange={(e) => handleImageChange(e.target.value)}
                          placeholder="Or enter image URL"
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#03b3c3] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image from your device or enter an image URL
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="name-input"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    value={settings.name}
                    onChange={(e) =>
                      setSettings({ ...settings, name: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#03b3c3] transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email-input"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    value={settings.email}
                    disabled
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>
            </SpotlightCard>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-[#c247ac]" />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              <span className="px-2 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
                WIP
              </span>
            </div>
            <SpotlightCard className="bg-transparent backdrop-blur-xl relative">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl z-10 flex items-center justify-center">
                <div className="text-center">
                  <span className="px-4 py-2 text-sm font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full inline-block mb-2">
                    Work In Progress
                  </span>
                  <p className="text-xs text-gray-400 mt-2">
                    This section is coming soon
                  </p>
                </div>
              </div>
              <div className="space-y-4 opacity-30 pointer-events-none">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Email Notifications
                    </p>
                    <p className="text-xs text-gray-400">
                      Receive important updates via email
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          email: !settings.notifications.email
                        }
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.email
                        ? 'bg-[#03b3c3]'
                        : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.email
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Transcription Complete
                    </p>
                    <p className="text-xs text-gray-400">
                      Get notified when transcriptions finish
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          transcriptionComplete:
                            !settings.notifications.transcriptionComplete
                        }
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.transcriptionComplete
                        ? 'bg-[#03b3c3]'
                        : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.transcriptionComplete
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Weekly Report
                    </p>
                    <p className="text-xs text-gray-400">
                      Get a summary of your activity every week
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          weeklyReport: !settings.notifications.weeklyReport
                        }
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications.weeklyReport
                        ? 'bg-[#03b3c3]'
                        : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.weeklyReport
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </SpotlightCard>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#03b3c3]" />
              <h2 className="text-xl font-bold text-white">Security</h2>
              <span className="px-2 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full">
                WIP
              </span>
            </div>
            <SpotlightCard className="bg-transparent backdrop-blur-xl relative">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl z-10 flex items-center justify-center">
                <div className="text-center">
                  <span className="px-4 py-2 text-sm font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full inline-block mb-2">
                    Work In Progress
                  </span>
                  <p className="text-xs text-gray-400 mt-2">
                    This section is coming soon
                  </p>
                </div>
              </div>
              <div className="space-y-4 opacity-30 pointer-events-none">
                <button
                  type="button"
                  className="w-full py-3 px-4 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-all text-left"
                >
                  Change Password
                </button>
                <button
                  type="button"
                  className="w-full py-3 px-4 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-all text-left"
                >
                  Two-Factor Authentication
                </button>
                <button
                  type="button"
                  className="w-full py-3 px-4 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-all text-left"
                >
                  Active Sessions
                </button>
              </div>
            </SpotlightCard>
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
              <h2 className="text-xl font-bold text-white">Danger Zone</h2>
            </div>
            <SpotlightCard className="bg-transparent backdrop-blur-xl border-red-500/20">
              <div>
                <p className="text-sm text-gray-300 mb-4">
                  Once you delete your account, there is no going back. Please
                  be certain.
                </p>
                <button
                  type="button"
                  className="w-full py-3 px-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 hover:bg-red-500/30 transition-all"
                >
                  Delete Account
                </button>
              </div>
            </SpotlightCard>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaveDisabled}
              className={`flex items-center gap-2 px-8 py-3 rounded-full text-white font-semibold transition-all ${
                isSaveDisabled
                  ? 'bg-gray-500/50 cursor-not-allowed opacity-50'
                  : 'bg-[#d856bf] hover:scale-105 cursor-pointer'
              }`}
            >
              <HugeiconsIcon icon={FloppyDiskIcon} size={18} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
