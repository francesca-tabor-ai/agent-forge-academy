'use client';

import { useState } from 'react';

interface OfferDetailClientProps {
  discountCode: string;
}

export function OfferDetailClient({ discountCode }: OfferDetailClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">Discount Code</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md font-mono text-sm text-gray-900">
          {discountCode}
        </div>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
