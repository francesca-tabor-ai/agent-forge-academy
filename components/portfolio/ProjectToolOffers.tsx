'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { ToolLogo } from '../offers/ToolLogo';

interface Tool {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
}

interface Offer {
  id: string;
  title: string;
  description: string;
  provider: string;
  discount_type: string;
  value_display?: string | null;
  external_url?: string | null;
}

interface ProjectToolOffersProps {
  projectId: string;
}

export function ProjectToolOffers({ projectId }: ProjectToolOffersProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchToolOffers();
  }, [projectId]);

  const fetchToolOffers = async () => {
    try {
      const supabase = createClient();

      // Get tools for this project
      const { data: projectTools } = await supabase
        .from('project_tools')
        .select(`
          tool_id,
          tools:tool_id (
            id,
            name,
            slug,
            logo_url
          )
        `)
        .eq('project_id', projectId);

      if (!projectTools || projectTools.length === 0) {
        setLoading(false);
        return;
      }

      const toolsList = projectTools
        .map((pt: any) => pt.tools)
        .filter(Boolean) as Tool[];

      setTools(toolsList);

      // Get offers for these tools
      const toolNames = toolsList.map(t => t.name);
      const { data: toolOffers } = await supabase
        .from('offers')
        .select('id, title, description, provider, discount_type, value_display, external_url')
        .in('provider', toolNames)
        .eq('is_active', true)
        .limit(10);

      setOffers((toolOffers || []) as Offer[]);
    } catch (error) {
      console.error('Error fetching tool offers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  if (tools.length === 0) {
    return null;
  }

  if (offers.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Relevant Offers</h3>
        <p className="text-sm text-blue-700 mb-3">
          You're using {tools.length} tool{tools.length > 1 ? 's' : ''} in this project. 
          Add tools to your project to see relevant offers!
        </p>
        <Link
          href={`/student/tools`}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Browse tools →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-blue-900 mb-3">
        Relevant Offers for Your Tool Stack
      </h3>
      <div className="space-y-3">
        {offers.map((offer) => (
          <Link
            key={offer.id}
            href={`/student/tools/${offer.provider.toLowerCase().replace(/\s+/g, '-')}`}
            className="block p-3 bg-white border border-blue-200 rounded-md hover:border-blue-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-3">
              <ToolLogo
                toolName={offer.provider}
                logoUrl={null}
                size={32}
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">{offer.title}</h4>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">{offer.description}</p>
                {offer.value_display && (
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {offer.value_display}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <Link
        href={`/student/tools`}
        className="mt-3 inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        View all tools →
      </Link>
    </div>
  );
}
