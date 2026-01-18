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
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
      // On mobile, start with sidebar closed
      if (window.innerWidth < 1024) {
        setIsSidebarExpanded(false);
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

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--ca-bg-warm)' }}>
      {/* Header */}
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />
      
      {/* Body: Sidebar + Main Content using CSS Grid for desktop */}
      <div 
        className="flex-1 overflow-hidden"
        style={{
          display: isMobile ? 'flex' : 'grid',
          gridTemplateColumns: isMobile ? undefined : `${sidebarWidth}px 1fr`,
          transition: isMobile ? undefined : 'grid-template-columns 300ms ease-in-out',
        }}
      >
        {/* Sidebar - normal flow on desktop, fixed overlay on mobile */}
        <aside
          className={`
            bg-white border-r flex flex-col transition-all duration-300 ease-in-out
            ${isMobile ? 'fixed inset-y-0 left-0 z-40' : ''}
          `}
          style={{
            // Desktop: normal flow, width controlled by grid
            // Mobile: fixed overlay with explicit width
            ...(isMobile ? {
              width: !isSidebarExpanded ? '0px' : `${sidebarWidthExpanded}px`,
              transform: !isSidebarExpanded ? 'translateX(-100%)' : 'translateX(0)',
              top: '56px', // Account for header height on mobile
              height: 'calc(100vh - 56px)',
            } : {
              // Desktop: no positioning, purely in grid flow
              width: '100%',
              height: '100%',
            }),
            borderColor: 'var(--ca-neutral-300)',
          }}
        >
          <Sidebar 
            role={role} 
            isExpanded={isSidebarExpanded}
            isMobile={isMobile}
          />
        </aside>

        {/* Main Content - never overlaps on desktop due to grid layout */}
        <main 
          className="overflow-y-auto"
          style={{
            width: isMobile ? '100%' : 'auto',
            minWidth: 0, // Prevents grid overflow
          }}
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
            style={{ top: '56px' }} // Account for header height
          />
        )}
      </div>
    </div>
  );
}
