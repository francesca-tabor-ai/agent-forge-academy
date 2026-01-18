'use client';

import { Menu, X } from 'lucide-react';

interface HeaderProps {
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarExpanded, onToggleSidebar }: HeaderProps) {
  return (
    <header 
      className="sticky top-0 z-50 bg-white border-b flex-shrink-0" 
      style={{ 
        borderColor: 'var(--ca-neutral-300)',
        height: '48px', // Thin, professional header
      }}
      role="banner"
      aria-label="App header"
    >
      <div className="flex items-center h-full px-4">
        <button
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center p-2 rounded-md text-ca-neutral-500 hover:text-ca-text hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ca-gold focus:ring-offset-2"
          aria-label={isSidebarExpanded ? 'Collapse navigation menu' : 'Expand navigation menu'}
          aria-expanded={isSidebarExpanded}
        >
          {isSidebarExpanded ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
        <div className="ml-3 flex items-center">
          <span className="text-sm font-semibold text-ca-text">AI Growth Hub</span>
        </div>
      </div>
    </header>
  );
}
