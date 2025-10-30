'use client'

import {
  ArrowLeft,
  Bell,
  Globe,
  Save,
  Shield,
  Trash2,
  User
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { MemoizedHyperspeed } from '@/components/memoized-hyperspeed'
import SpotlightCard from '@/components/SpotlightCard'
import { authClient } from '@/lib/auth-client'

export default function SettingsPage() {
  const { data: session } = authClient.useSession()
  const [settings, setSettings] = useState({
    name: session?.user.name || '',
    email: session?.user.email || '',
    language: 'en',
    notifications: {
      email: true,
      transcriptionComplete: true,
      weeklyReport: false
    }
  })

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', settings)
  }

  return (
    <>
      {/* Background Animation */}
      <div className="hidden md:block fixed inset-0 z-0 opacity-40">
        <MemoizedHyperspeed />
      </div>

      <div className="relative min-h-screen z-10">
        {/* Header */}
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

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
          {/* Profile Settings */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-[#03b3c3]" />
              <h2 className="text-xl font-bold text-white">Profile</h2>
            </div>
            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="space-y-4">
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

          {/* Notification Settings */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-[#c247ac]" />
              <h2 className="text-xl font-bold text-white">Notifications</h2>
            </div>
            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="space-y-4">
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

          {/* Language Settings */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-[#d856bf]" />
              <h2 className="text-xl font-bold text-white">Language</h2>
            </div>
            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div>
                <label
                  htmlFor="language-select"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Default Transcription Language
                </label>
                <select
                  id="language-select"
                  value={settings.language}
                  onChange={(e) =>
                    setSettings({ ...settings, language: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#d856bf] transition-colors"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="pt">Portuguese</option>
                  <option value="it">Italian</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </SpotlightCard>
          </div>

          {/* Security */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#03b3c3]" />
              <h2 className="text-xl font-bold text-white">Security</h2>
            </div>
            <SpotlightCard className="bg-transparent backdrop-blur-xl">
              <div className="space-y-4">
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

          {/* Danger Zone */}
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

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#d856bf] to-[#03b3c3] rounded-full text-white font-semibold hover:scale-105 transition-transform"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
