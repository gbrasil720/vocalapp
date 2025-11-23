import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  AudioLines,
  BarChart3,
  CreditCard,
  History,
  Home,
  Map as MapIcon,
  MessageSquare,
  Settings
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput as CommandInputUI,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from '@/components/ui/command'
import { InputGroup, InputGroupAddon, InputGroupInput } from './ui/input-group'
import { Kbd } from './ui/kbd'

interface DashboardPage {
  id: string
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  shortcut?: string
  group: 'main' | 'content' | 'settings'
}

const dashboardPages: DashboardPage[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    shortcut: 'D',
    group: 'main'
  },
  {
    id: 'transcriptions',
    label: 'Transcriptions',
    path: '/dashboard/transcriptions',
    icon: AudioLines,
    shortcut: 'T',
    group: 'content'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/dashboard/analytics',
    icon: BarChart3,
    shortcut: 'A',
    group: 'main'
  },
  {
    id: 'billing',
    label: 'Billing & Credits',
    path: '/dashboard/billing',
    icon: CreditCard,
    shortcut: 'B',
    group: 'main'
  },
  {
    id: 'feedback',
    label: 'Feedback',
    path: '/dashboard/feedback',
    icon: MessageSquare,
    shortcut: 'F',
    group: 'settings'
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    path: '/dashboard/roadmap',
    icon: MapIcon,
    shortcut: 'R',
    group: 'content'
  },
  {
    id: 'changelog',
    label: 'Changelog',
    path: '/dashboard/changelog',
    icon: History,
    shortcut: 'C',
    group: 'content'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/dashboard/settings',
    icon: Settings,
    shortcut: 'S',
    group: 'settings'
  }
]

export function CommandInput() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleSelect = useCallback(
    (path: string) => {
      router.push(path)
      setOpen(false)
    },
    [router]
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Open command palette with Cmd/Ctrl + K
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
        return
      }

      // Quick navigation shortcuts when command palette is open
      if (open && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        const shortcutKey = e.key.toUpperCase()
        const page = dashboardPages.find((p) => p.shortcut === shortcutKey)
        if (page) {
          e.preventDefault()
          handleSelect(page.path)
        }
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open, handleSelect])

  const mainPages = dashboardPages.filter((p) => p.group === 'main')
  const contentPages = dashboardPages.filter((p) => p.group === 'content')
  const settingsPages = dashboardPages.filter((p) => p.group === 'settings')

  return (
    <>
      <div className="flex w-full max-w-xs flex-col gap-6">
        <InputGroup onClick={() => setOpen(true)}>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <HugeiconsIcon icon={Search01Icon} size={20} color="#99a1af" />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </InputGroupAddon>
        </InputGroup>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInputUI placeholder="Search pages..." />
        <CommandList>
          <CommandEmpty>No pages found.</CommandEmpty>

          <CommandGroup heading="Main">
            {mainPages.map((page) => {
              const Icon = page.icon
              const isActive = pathname === page.path
              return (
                <CommandItem
                  key={page.id}
                  value={`${page.label} ${page.path}`}
                  onSelect={() => handleSelect(page.path)}
                  className={isActive ? 'bg-accent/50' : ''}
                >
                  <Icon className="h-4 w-4" />
                  <span>{page.label}</span>
                  {page.shortcut && (
                    <CommandShortcut>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                        <span className="text-xs">{page.shortcut}</span>
                      </kbd>
                    </CommandShortcut>
                  )}
                </CommandItem>
              )
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Content">
            {contentPages.map((page) => {
              const Icon = page.icon
              const isActive = pathname === page.path
              return (
                <CommandItem
                  key={page.id}
                  value={`${page.label} ${page.path}`}
                  onSelect={() => handleSelect(page.path)}
                  className={isActive ? 'bg-accent/50' : ''}
                >
                  <Icon className="h-4 w-4" />
                  <span>{page.label}</span>
                  {page.shortcut && (
                    <CommandShortcut>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                        <span className="text-xs">{page.shortcut}</span>
                      </kbd>
                    </CommandShortcut>
                  )}
                </CommandItem>
              )
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Settings">
            {settingsPages.map((page) => {
              const Icon = page.icon
              const isActive = pathname === page.path
              return (
                <CommandItem
                  key={page.id}
                  value={`${page.label} ${page.path}`}
                  onSelect={() => handleSelect(page.path)}
                  className={isActive ? 'bg-accent/50' : ''}
                >
                  <Icon className="h-4 w-4" />
                  <span>{page.label}</span>
                  {page.shortcut && (
                    <CommandShortcut>
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                        <span className="text-xs">{page.shortcut}</span>
                      </kbd>
                    </CommandShortcut>
                  )}
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
