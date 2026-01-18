'use client';

import { Menu, X } from 'lucide-react';

interface HeaderProps {
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarExpanded, onToggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--ca-neutral-300)' }}>
      <div className="flex items-center h-14 px-4">
        <button
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center p-2 rounded-md text-ca-neutral-500 hover:text-ca-text hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ca-gold focus:ring-offset-2"
          aria-label="Toggle menu"
          aria-expanded={isSidebarExpanded}
        >
          {isSidebarExpanded ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>
    </header>
  );
}
