import * as React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from '@/components/app-sidebar'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Kbd } from '@/components/ui/kbd'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

const routeLabelByPath: Record<string, string> = {
  '/': 'Discover',
  '/see-all': 'Open Source Apps we Love Right Now',
  '/library': 'Libary',
  '/activity': 'Activity',
  '/catalog': 'Catalog',
  '/installed': 'Installed',
  '/analytics': 'Analytics',
  '/upload': 'Upload',
  '/updates': 'Updates',
  '/settings': 'Settings',
}

export function AppLayout() {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isCreateMenuOpen, setIsCreateMenuOpen] = React.useState(false)
  const [isCommandOpen, setIsCommandOpen] = React.useState(false)
  const createMenuRef = React.useRef<HTMLDivElement | null>(null)
  const isDiscoverPage = location.pathname === '/'
  const isSeeAllPage = location.pathname === '/see-all'
  const isScrollRevealPage = isDiscoverPage || isSeeAllPage
  const [showScrolledTitle, setShowScrolledTitle] = React.useState(false)
  const pageLabel =
    routeLabelByPath[location.pathname] ??
    (location.pathname.startsWith('/catalog/') ? 'Plugin Detail' : 'Discover')

  React.useEffect(() => {
    const scroller = document.querySelector('.desktop-content')
    if (!scroller) return

    const onScroll = () => {
      if (!isScrollRevealPage) {
        setShowScrolledTitle(true)
        return
      }

      const heading = scroller.querySelector('.discover-heading') as HTMLElement | null
      if (!heading) {
        setShowScrolledTitle(false)
        return
      }

      const headingRect = heading.getBoundingClientRect()
      // Show the fixed title only after the in-page heading has scrolled past the top area.
      setShowScrolledTitle(headingRect.bottom <= 10)
    }

    onScroll()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [isScrollRevealPage, location.pathname])

  React.useEffect(() => {
    if (!isSidebarOpen) {
      setIsCreateMenuOpen(false)
    }
  }, [isSidebarOpen])

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!createMenuRef.current) return
      if (!createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false)
      }
    }

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCreateMenuOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setIsCommandOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <SidebarProvider
      defaultOpen={false}
      open={isSidebarOpen}
      onOpenChange={setIsSidebarOpen}
      style={
        {
          '--sidebar-width': 'calc(14rem + 10px)',
        } as React.CSSProperties
      }
      className="min-h-full app-shell-resize"
    >
      <AppSidebar />
      <SidebarInset className="bg-white app-main-inset">
        <div className={`page-topbar ${isDiscoverPage ? 'page-topbar-discover' : ''}`}>
          <div className="page-topbar-left">
            <SidebarTrigger className="titlebar-sidebar-trigger" />
            {isSidebarOpen ? (
              <div
                ref={createMenuRef}
                className="titlebar-plus-wrap"
                onMouseLeave={() => setIsCreateMenuOpen(false)}
              >
                <button
                  type="button"
                  className={`titlebar-plus-trigger ${isCreateMenuOpen ? 'is-open' : ''}`}
                  aria-label="Create"
                  aria-haspopup="menu"
                  aria-expanded={isCreateMenuOpen}
                  onClick={() => setIsCreateMenuOpen((open) => !open)}
                  onMouseEnter={() => setIsCreateMenuOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12.001 5.00003V19.002" />
                    <path d="M19.002 12.002L4.99998 12.002" />
                  </svg>
                </button>
                {isCreateMenuOpen ? (
                  <div className="titlebar-plus-dropdown" role="menu" aria-label="Create options">
                    <button type="button" role="menuitem" className="titlebar-plus-dropdown-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12.001 5.00003V19.002" />
                        <path d="M19.002 12.002L4.99998 12.002" />
                      </svg>
                      New plugin
                    </button>
                    <button type="button" role="menuitem" className="titlebar-plus-dropdown-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 30 30"
                        width="16"
                        height="16"
                        fill="#1A1A1A"
                        className="titlebar-plus-github-icon"
                        stroke="currentColor"
                        strokeWidth="0"
                        aria-hidden="true"
                      >
                        <path d="M15,3C8.373,3,3,8.373,3,15c0,5.623,3.872,10.328,9.092,11.63C12.036,26.468,12,26.28,12,26.047v-2.051 c-0.487,0-1.303,0-1.508,0c-0.821,0-1.551-0.353-1.905-1.009c-0.393-0.729-0.461-1.844-1.435-2.526 c-0.289-0.227-0.069-0.486,0.264-0.451c0.615,0.174,1.125,0.596,1.605,1.222c0.478,0.627,0.703,0.769,1.596,0.769 c0.433,0,1.081-0.025,1.691-0.121c0.328-0.833,0.895-1.6,1.588-1.962c-3.996-0.411-5.903-2.399-5.903-5.098 c0-1.162,0.495-2.286,1.336-3.233C9.053,10.647,8.706,8.73,9.435,8c1.798,0,2.885,1.166,3.146,1.481C13.477,9.174,14.461,9,15.495,9 c1.036,0,2.024,0.174,2.922,0.483C18.675,9.17,19.763,8,21.565,8c0.732,0.731,0.381,2.656,0.102,3.594 c0.836,0.945,1.328,2.066,1.328,3.226c0,2.697-1.904,4.684-5.894,5.097C18.199,20.49,19,22.1,19,23.313v2.734 c0,0.104-0.023,0.179-0.035,0.268C23.641,24.676,27,20.236,27,15C27,8.373,21.627,3,15,3z" />
                      </svg>
                      Import from Github
                    </button>
                    <button type="button" role="menuitem" className="titlebar-plus-dropdown-item">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        aria-hidden="true"
                      >
                        <path d="M9.5 14.5L14.5 9.49995" />
                        <path d="M16.8463 14.6095L19.4558 12C21.5147 9.94108 21.5147 6.60298 19.4558 4.54411C17.397 2.48524 14.0589 2.48524 12 4.54411L9.39045 7.15366M14.6095 16.8463L12 19.4558C9.94113 21.5147 6.60303 21.5147 4.54416 19.4558C2.48528 17.3969 2.48528 14.0588 4.54416 12L7.1537 9.39041" />
                      </svg>
                      Import from URL
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div
            className={`page-topbar-title ${!isScrollRevealPage || showScrolledTitle ? 'is-visible' : ''}`}
            aria-live="polite"
          >
            {pageLabel}
          </div>
          <div className="page-topbar-right">
            {isDiscoverPage || isSeeAllPage ? (
              <div className="titlebar-search-wrap">
                <input
                  className="titlebar-search"
                  type="search"
                  placeholder="Search..."
                  aria-label="Search discover"
                  readOnly
                  onFocus={(event) => {
                    event.currentTarget.blur()
                    setIsCommandOpen(true)
                  }}
                  onClick={() => setIsCommandOpen(true)}
                />
                <Kbd className="titlebar-search-kbd">⌘K</Kbd>
              </div>
            ) : null}
          </div>
        </div>
        <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Calendar</CommandItem>
                <CommandItem>Search Emoji</CommandItem>
                <CommandItem>Calculator</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
        <div className="app-page-shell flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
