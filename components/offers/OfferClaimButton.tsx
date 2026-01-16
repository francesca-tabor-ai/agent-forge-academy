'use client';

import { trackOfferClaim } from '@/lib/utils/tool-analytics';

interface OfferClaimButtonProps {
  offerId: string;
  toolId?: string;
  toolName: string;
  externalUrl: string;
  className?: string;
}

export function OfferClaimButton({ 
  offerId, 
  toolId, 
  toolName, 
  externalUrl,
  className = '' 
}: OfferClaimButtonProps) {
  const handleClaim = async () => {
    // Track offer claim
    await trackOfferClaim(offerId, toolId || '', {
      tool_name: toolName,
      offer_url: externalUrl,
      timestamp: new Date().toISOString(),
    });

    // Open external URL
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <a
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClaim}
      className={className}
    >
      Claim Offer →
    </a>
  );
}
