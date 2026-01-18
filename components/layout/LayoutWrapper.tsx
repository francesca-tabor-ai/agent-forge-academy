'use client';

import { useState, useEffect } from 'react';
import { Header } from './Header';
import Sidebar from './Sidebar';
import type { UserRole } from '@/lib/types/roles';

interface LayoutWrapperProps {
  children: React.ReactNode;
  role: UserRole | null;
}

export function LayoutWrapper({ children, role }: LayoutWrapperProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileView = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(isMobileView);
      // On mobile: hidden by default (collapsed)
      // On desktop: expanded by default (icons + labels)
      if (isMobileView) {
        setIsSidebarExpanded(false);
      } else {
        // Desktop: always expanded by default
        setIsSidebarExpanded(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  // Sidebar widths
  const sidebarWidthExpanded = 280; // ~280px
  const sidebarWidthCollapsed = 72; // ~72px (icon-only)
  const sidebarWidth = isSidebarExpanded ? sidebarWidthExpanded : sidebarWidthCollapsed;
  const headerHeight = 64; // Match header height (~64px)

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
      {/* Top App Header - Global, thin, clearly separated */}
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} role={role} />
      
      {/* Body: Sidebar + Main Content */}
      {/* Desktop: CSS Grid pushes content (sidebar never overlays) */}
      {/* Mobile: Sidebar overlays when revealed via burger */}
      <div 
        className="flex-1 overflow-hidden"
        style={{
          display: isMobile ? 'flex' : 'grid',
          // Desktop: Grid layout ensures sidebar pushes content, never overlays
          gridTemplateColumns: isMobile ? undefined : `${sidebarWidth}px 1fr`,
          transition: isMobile ? undefined : 'grid-template-columns 300ms ease-in-out',
        }}
      >
        {/* Left Sidebar - Single source of navigation */}
        {/* Desktop: Expanded by default (icons + labels), collapsible to icons-only */}
        {/* Mobile: Hidden by default, revealed via burger icon */}
        <aside
          className={`
            bg-white border-r flex flex-col transition-all duration-300 ease-in-out
            ${isMobile ? 'fixed inset-y-0 left-0 z-40' : ''}
          `}
          style={{
            // Desktop: Normal flow in grid, width controlled by grid columns
            // Sidebar pushes content - never overlays on desktop
            // Mobile: Fixed overlay when revealed
            ...(isMobile ? {
              width: !isSidebarExpanded ? '0px' : `${sidebarWidthExpanded}px`,
              transform: !isSidebarExpanded ? 'translateX(-100%)' : 'translateX(0)',
              top: `${headerHeight}px`, // Account for header height on mobile
              height: `calc(100vh - ${headerHeight}px)`,
            } : {
              // Desktop: No positioning, purely in grid flow - pushes content
              width: '100%',
              height: '100%',
            }),
            borderColor: 'var(--ca-neutral-300)',
          }}
          aria-label="Primary navigation sidebar"
        >
          <Sidebar 
            role={role} 
            isExpanded={isSidebarExpanded}
            isMobile={isMobile}
          />
        </aside>

        {/* Main Content Area - Course + lessons, clearly separated */}
        <main 
          className="overflow-y-auto"
          style={{
            width: isMobile ? '100%' : 'auto',
            minWidth: 0, // Prevents grid overflow
            backgroundColor: 'var(--ca-bg-warm)',
          }}
          role="main"
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>

        {/* Mobile overlay when sidebar is open */}
        {isMobile && isSidebarExpanded && (
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={toggleSidebar}
            aria-hidden="true"
            style={{ top: `${headerHeight}px` }} // Account for header height
          />
        )}
      </div>
    </div>
  );
}
