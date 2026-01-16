'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { courseMetadata } from '@/lib/course-metadata';
import { AddOfferToProjectModal } from './AddOfferToProjectModal';
import { ToolCard } from './ToolCard';

interface Offer {
  id: string;
  title: string;
  provider: string;
  description: string;
  category: 'api' | 'hosting' | 'monitoring' | 'data' | 'tools' | 'services' | 'database' | 'vector_database' | 'ai_llm' | 'observability' | 'analytics' | 'ml_tools';
  discount_text: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_credits' | 'extended_trial' | 'tier_upgrade';
  discount_value: number | null;
  discount_code: string | null;
  external_url: string | null;
  eligibility: string | null;
  recommended_for_courses: string[] | null;
  original_price: string | null;
  discounted_price: string | null;
  features: string[] | null;
  is_recommended: boolean;
  expiration_date: string | null;
  usage_count: number;
  max_usage: number | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  github_url: string | null;
  demo_url: string | null;
}

interface OffersPageClientProps {
  offers: Offer[];
  enrolledCourseSlugs: string[];
  completedCourseSlugs?: string[];
  projects: Project[];
  savedOfferIds: string[];
  claimedOfferIds: Record<string, 'claimed' | 'not_claimed' | 'requires_verification'>;
  linkedOffers: Record<string, { projectId: string; projectTitle: string }[]>;
  studentProfileId: string;
}

type ViewFilter = 'all' | 'recommended' | 'active_discounts';
type SortOption = 'most_relevant' | 'highest_value' | 'expiring_soon';

const categoryLabels: Record<string, string> = {
  api: 'API',
  hosting: 'Deploy',
  monitoring: 'Monitoring',
  data: 'Data',
  tools: 'Tools',
  services: 'Services',
  database: 'DB & Auth',
  vector_database: 'Vector DB',
  ai_llm: 'LLM APIs',
  observability: 'Observability',
  analytics: 'Analytics',
  ml_tools: 'Experiment Tracking',
};

const categoryIcons: Record<string, string> = {
  api: '🔌',
  hosting: '☁️',
  monitoring: '📊',
  data: '💾',
  tools: '🛠️',
  services: '⚙️',
  database: '🗄️',
  vector_database: '🔍',
  ai_llm: '🤖',
  observability: '👁️',
  analytics: '📈',
  ml_tools: '🧪',
};

export function OffersPageClient({
  offers,
  enrolledCourseSlugs,
  completedCourseSlugs = [],
  projects,
  savedOfferIds,
  claimedOfferIds,
  linkedOffers: initialLinkedOffers,
  studentProfileId,
}: OffersPageClientProps) {
  const [viewFilter, setViewFilter] = useState<ViewFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEligibility, setSelectedEligibility] = useState<string>('all');
  const [selectedCostImpact, setSelectedCostImpact] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('most_relevant');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [expandedOffers, setExpandedOffers] = useState<Set<string>>(new Set());
  const [savedOffers, setSavedOffers] = useState<Set<string>>(new Set(savedOfferIds));
  const [reminderDays, setReminderDays] = useState<Record<string, number>>({});
  const [linkedOffers, setLinkedOffers] = useState<Record<string, { projectId: string; projectTitle: string }[]>>(initialLinkedOffers);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<{ id: string; title: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get days until expiration
  const getDaysUntilExpiration = (dateString: string | null): number | null => {
    if (!dateString) return null;
    const expiration = new Date(dateString);
    const now = new Date();
    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  // Determine offer badges and properties
  const getOfferProperties = (offer: Offer) => {
    const badges: string[] = [];
    let isActiveDiscount = false;
    let isRecommended = false;
    let isLimitedTime = false;

    // Check if active discount
    const hasPercentageDiscount = offer.discount_type === 'percentage' && 
      offer.discount_value && offer.discount_value >= 10;
    const hasFixedDiscount = offer.discount_type === 'fixed_amount' && 
      offer.discount_value && offer.discount_value > 0;
    const hasDiscountCode = offer.discount_code && offer.discount_code.trim() !== '';
    const hasPriceDifference = offer.original_price && offer.discounted_price;
    
    if (hasPercentageDiscount || hasFixedDiscount || hasDiscountCode || hasPriceDifference) {
      isActiveDiscount = true;
      badges.push('Active Discount');
    }

    // Check if recommended
    const isRecommendedByCourse = offer.recommended_for_courses && 
      offer.recommended_for_courses.some(slug => enrolledCourseSlugs.includes(slug));
    if (offer.is_recommended || isRecommendedByCourse) {
      isRecommended = true;
      badges.push('⭐ Recommended');
    }

    // Check if limited time
    const daysUntilExpiration = getDaysUntilExpiration(offer.expiration_date);
    if (daysUntilExpiration !== null && daysUntilExpiration > 0 && daysUntilExpiration <= 30) {
      isLimitedTime = true;
      badges.push('🔥 Limited Time');
    }

    return { badges, isActiveDiscount, isRecommended, isLimitedTime };
  };

  // Get recommendation reason
  const getRecommendationReason = (offer: Offer, projectId?: string): string | null => {
    const reasons: string[] = [];
    
    // Course-based recommendations
    if (offer.recommended_for_courses && offer.recommended_for_courses.length > 0) {
      const matchingCourses = offer.recommended_for_courses
        .filter(slug => enrolledCourseSlugs.includes(slug))
        .map(slug => courseMetadata[slug]?.title || slug);
      
      if (matchingCourses.length > 0) {
        reasons.push(`Used in: ${matchingCourses.join(', ')}`);
      }
    }

    // Project-based recommendations
    if (projectId && projectId !== 'all') {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        // Check for demo URL needs
        if (!project.demo_url && (offer.category === 'hosting' || offer.provider.toLowerCase().includes('vercel') || offer.provider.toLowerCase().includes('railway'))) {
          reasons.push(`Add a demo URL to "${project.title}" to increase engagement`);
        }
        
        // Check for RAG/agents
        const hasRAGKeywords = project.description?.toLowerCase().includes('rag') || 
          project.description?.toLowerCase().includes('retrieval') ||
          project.description?.toLowerCase().includes('agent');
        if (hasRAGKeywords && (offer.category === 'vector_database' || offer.category === 'observability')) {
          reasons.push(`Your project "${project.title}" uses RAG/agents → vector DB + eval tooling recommended`);
        }
        
        // Check for AI projects
        const hasAIKeywords = project.description?.toLowerCase().includes('ai') || 
          project.description?.toLowerCase().includes('llm') ||
          project.description?.toLowerCase().includes('gpt');
        if (hasAIKeywords && project.demo_url && (offer.category === 'hosting')) {
          reasons.push(`You have an AI project "${project.title}" with a demo URL → deployment recommended`);
        }
      }
    } else {
      // Portfolio-wide recommendations
      const hasProjectsWithDemo = projects.some(p => p.demo_url);
      const hasProjectsWithoutDemo = projects.some(p => !p.demo_url);
      
      if (hasProjectsWithoutDemo && (offer.category === 'hosting' || offer.provider.toLowerCase().includes('vercel') || offer.provider.toLowerCase().includes('railway'))) {
        reasons.push('Add demo URLs to your projects to increase engagement');
      }
      
      const hasRAGProjects = projects.some(p => 
        p.description?.toLowerCase().includes('rag') || 
        p.description?.toLowerCase().includes('retrieval') ||
        p.description?.toLowerCase().includes('agent')
      );
      if (hasRAGProjects && (offer.category === 'vector_database' || offer.category === 'observability')) {
        reasons.push('You\'ve built RAG/agents → vector DB + eval tooling recommended');
      }
    }

    return reasons.length > 0 ? reasons.join(' • ') : null;
  };

  // Calculate offer value
  const getOfferValue = (offer: Offer): string => {
    if (offer.discount_type === 'percentage' && offer.discount_value) {
      return `${Math.round(offer.discount_value)}% off`;
    }
    if (offer.discount_type === 'free_credits' && offer.discount_value) {
      return `$${offer.discount_value} credits`;
    }
    if (offer.discount_type === 'fixed_amount' && offer.discount_value) {
      return `$${offer.discount_value} off`;
    }
    return offer.discount_text;
  };

  // Get "Best for" description
  const getBestFor = (offer: Offer): string => {
    const categoryBestFor: Record<string, string> = {
      hosting: 'hosting demos + edge functions',
      database: 'auth + data storage',
      vector_database: 'RAG retrieval at scale',
      ai_llm: 'LLM-powered features',
      observability: 'monitoring AI systems',
      analytics: 'tracking user behavior',
      ml_tools: 'experiment tracking',
      monitoring: 'application monitoring',
    };
    
    return categoryBestFor[offer.category] || 'building AI projects';
  };

  // Filter and sort offers
  const filteredAndSortedOffers = useMemo(() => {
    let filtered = [...offers];

    // Apply search filter (matches tool name, category, linked courses, description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(offer => {
        // Search in tool name (provider)
        const matchesProvider = offer.provider.toLowerCase().includes(query);
        
        // Search in title
        const matchesTitle = offer.title.toLowerCase().includes(query);
        
        // Search in category
        const matchesCategory = categoryLabels[offer.category]?.toLowerCase().includes(query) ||
                                offer.category.toLowerCase().includes(query);
        
        // Search in description
        const matchesDescription = offer.description.toLowerCase().includes(query);
        
        // Search in linked courses (recommended_for_courses)
        const matchesCourses = offer.recommended_for_courses?.some(courseSlug => 
          courseSlug.toLowerCase().includes(query) ||
          courseSlug.replace(/-/g, ' ').toLowerCase().includes(query)
        ) || false;
        
        return matchesProvider || matchesTitle || matchesCategory || matchesDescription || matchesCourses;
      });
    }

    // Apply view filter
    if (viewFilter === 'recommended') {
      filtered = filtered.filter(offer => {
        const props = getOfferProperties(offer);
        return props.isRecommended;
      });
    } else if (viewFilter === 'active_discounts') {
      filtered = filtered.filter(offer => {
        const props = getOfferProperties(offer);
        return props.isActiveDiscount;
      });
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(offer => offer.category === selectedCategory);
    }

    // Apply eligibility filter
    if (selectedEligibility !== 'all') {
      filtered = filtered.filter(offer => {
        if (selectedEligibility === 'students_only') {
          return offer.eligibility?.toLowerCase().includes('student');
        }
        if (selectedEligibility === 'new_users_only') {
          return offer.eligibility?.toLowerCase().includes('new user');
        }
        if (selectedEligibility === 'open_to_all') {
          return !offer.eligibility || (!offer.eligibility.toLowerCase().includes('student') && !offer.eligibility.toLowerCase().includes('new user'));
        }
        return true;
      });
    }

    // Apply cost impact filter
    if (selectedCostImpact !== 'all') {
      filtered = filtered.filter(offer => {
        if (selectedCostImpact === 'free_tier') {
          return offer.discount_type === 'free_credits' || offer.discount_type === 'extended_trial';
        }
        if (selectedCostImpact === 'credits') {
          return offer.discount_type === 'free_credits';
        }
        if (selectedCostImpact === 'percent_off') {
          return offer.discount_type === 'percentage';
        }
        return true;
      });
    }

    // Sort offers
    filtered.sort((a, b) => {
      if (sortBy === 'most_relevant') {
        const aProps = getOfferProperties(a);
        const bProps = getOfferProperties(b);
        
        // Prioritize recommended
        if (aProps.isRecommended && !bProps.isRecommended) return -1;
        if (!aProps.isRecommended && bProps.isRecommended) return 1;
        
        // Then limited time
        if (aProps.isLimitedTime && !bProps.isLimitedTime) return -1;
        if (!aProps.isLimitedTime && bProps.isLimitedTime) return 1;
        
        // Then active discounts
        if (aProps.isActiveDiscount && !bProps.isActiveDiscount) return -1;
        if (!aProps.isActiveDiscount && bProps.isActiveDiscount) return 1;
        
        return 0;
      } else if (sortBy === 'highest_value') {
        const aValue = a.discount_value || 0;
        const bValue = b.discount_value || 0;
        return bValue - aValue;
      } else if (sortBy === 'expiring_soon') {
        const aDays = getDaysUntilExpiration(a.expiration_date);
        const bDays = getDaysUntilExpiration(b.expiration_date);
        if (aDays === null && bDays === null) return 0;
        if (aDays === null) return 1;
        if (bDays === null) return -1;
        return aDays - bDays;
      }
      return 0;
    });

    return filtered;
  }, [offers, viewFilter, selectedCategory, selectedEligibility, selectedCostImpact, sortBy, searchQuery]);

  // Group offers by tool (provider) and aggregate data
  const toolsData = useMemo(() => {
    const toolMap = new Map<string, {
      name: string;
      description: string;
      categories: Set<string>;
      courseSlugs: Set<string>;
      offers: Offer[];
      hasGatedOffer: boolean;
      requiredCourseForOffer: string | null;
    }>();

    filteredAndSortedOffers.forEach(offer => {
      const toolName = offer.provider;
      
      if (!toolMap.has(toolName)) {
        toolMap.set(toolName, {
          name: toolName,
          description: offer.description, // Use first offer's description
          categories: new Set(),
          courseSlugs: new Set(),
          offers: [],
          hasGatedOffer: false,
          requiredCourseForOffer: null,
        });
      }

      const tool = toolMap.get(toolName)!;
      tool.categories.add(offer.category);
      tool.offers.push(offer);
      
      // Collect course slugs
      if (offer.recommended_for_courses) {
        offer.recommended_for_courses.forEach(slug => tool.courseSlugs.add(slug));
      }

      // Check for gated offers
      // For now, we consider an offer gated if it has recommended_for_courses
      // In the future, this will use tool_offers.requires_course_completion
      if (offer.recommended_for_courses && offer.recommended_for_courses.length > 0) {
        tool.hasGatedOffer = true;
        // Use the first recommended course as the required course
        if (!tool.requiredCourseForOffer) {
          tool.requiredCourseForOffer = offer.recommended_for_courses[0];
        }
      }
    });

    // Convert to array and format for ToolCard
    return Array.from(toolMap.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      categories: Array.from(tool.categories),
      courseCount: tool.courseSlugs.size,
      videoCount: 0, // Will be populated when we have tool_videos data
      offersCount: tool.offers.length,
      hasOffers: tool.offers.length > 0,
      hasGatedOffer: tool.hasGatedOffer,
      requiredCourseForOffer: tool.requiredCourseForOffer,
      offers: tool.offers,
    }));
  }, [filteredAndSortedOffers]);

  // Toggle save offer
  const handleSaveOffer = async (offerId: string) => {
    const isSaved = savedOffers.has(offerId);
    const newSavedOffers = new Set(savedOffers);
    
    if (isSaved) {
      newSavedOffers.delete(offerId);
    } else {
      newSavedOffers.add(offerId);
    }
    
    setSavedOffers(newSavedOffers);
    
    try {
      const response = await fetch(`/api/offers/${offerId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        // Revert on error
        setSavedOffers(savedOffers);
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      setSavedOffers(savedOffers);
    }
  };

  // Set reminder
  const handleSetReminder = async (offerId: string, days: number) => {
    setReminderDays({ ...reminderDays, [offerId]: days });
    
    try {
      await fetch(`/api/offers/${offerId}/reminder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      });
    } catch (error) {
      console.error('Error setting reminder:', error);
    }
  };

  // Toggle expand offer
  const toggleExpand = (offerId: string) => {
    const newExpanded = new Set(expandedOffers);
    if (newExpanded.has(offerId)) {
      newExpanded.delete(offerId);
    } else {
      newExpanded.add(offerId);
    }
    setExpandedOffers(newExpanded);
  };

  // Handle "Add to project" button click
  const handleAddToProject = (offer: Offer) => {
    setSelectedOffer({ id: offer.id, title: offer.title });
    setModalOpen(true);
  };

  // Handle offer added to project
  const handleOfferAdded = (projectId: string, projectTitle: string) => {
    if (!selectedOffer) return;

    // Update linked offers state
    const newLinkedOffers = { ...linkedOffers };
    if (!newLinkedOffers[selectedOffer.id]) {
      newLinkedOffers[selectedOffer.id] = [];
    }
    // Check if already linked to avoid duplicates
    const alreadyLinked = newLinkedOffers[selectedOffer.id].some(
      link => link.projectId === projectId
    );
    if (!alreadyLinked) {
      newLinkedOffers[selectedOffer.id].push({ projectId, projectTitle });
    }
    setLinkedOffers(newLinkedOffers);

    // Show toast
    setToast({ message: `Added to ${projectTitle}`, type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  // Show toast notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const categories = Array.from(new Set(offers.map(o => o.category)));

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Add Offer to Project Modal */}
      {selectedOffer && (
        <AddOfferToProjectModal
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (!open) {
              setSelectedOffer(null);
            }
          }}
          offer={selectedOffer}
          onAdded={handleOfferAdded}
          linkedProjectIds={linkedOffers[selectedOffer.id]?.map(link => link.projectId) || []}
        />
      )}
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tools</h1>
        <p className="text-sm text-gray-500 mt-2">
          Exclusive tools to help you build and ship faster
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools, courses, or capabilities…"
            className="w-full px-4 py-3 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewFilter === 'all'
              ? 'bg-brand-light text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Offers
        </button>
        <button
          onClick={() => setViewFilter('recommended')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewFilter === 'recommended'
              ? 'bg-brand-light text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Recommended for me
        </button>
        <button
          onClick={() => setViewFilter('active_discounts')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewFilter === 'active_discounts'
              ? 'bg-brand-light text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active discounts
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{categoryLabels[cat] || cat}</option>
              ))}
            </select>
          </div>

          {/* Eligibility Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Eligibility</label>
            <select
              value={selectedEligibility}
              onChange={(e) => setSelectedEligibility(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light"
            >
              <option value="all">All</option>
              <option value="students_only">Students only</option>
              <option value="new_users_only">New users only</option>
              <option value="open_to_all">Open to all</option>
            </select>
          </div>

          {/* Cost Impact Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cost Impact</label>
            <select
              value={selectedCostImpact}
              onChange={(e) => setSelectedCostImpact(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light"
            >
              <option value="all">All</option>
              <option value="free_tier">Free tier</option>
              <option value="credits">Credits</option>
              <option value="percent_off">% off</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light"
            >
              <option value="most_relevant">Most relevant</option>
              <option value="highest_value">Highest value</option>
              <option value="expiring_soon">Expiring soon</option>
            </select>
          </div>

          {/* Project Selector (for recommendations) */}
          {viewFilter === 'recommended' && projects.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Use project</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-light"
              >
                <option value="all">All projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.title}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      {toolsData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {toolsData.map((tool) => {
            return (
              <ToolCard
                key={tool.name}
                toolName={tool.name}
                description={tool.description}
                categories={tool.categories}
                courseCount={tool.courseCount}
                videoCount={tool.videoCount}
                hasOffers={tool.hasOffers}
                offersCount={tool.offersCount}
                toolSlug={tool.name.toLowerCase().replace(/\s+/g, '-')}
                hasGatedOffer={tool.hasGatedOffer}
                requiredCourseForOffer={tool.requiredCourseForOffer}
                enrolledCourseSlugs={completedCourseSlugs.length > 0 ? completedCourseSlugs : enrolledCourseSlugs}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No tools found matching your search criteria.</p>
        </div>
      )}

      {/* Legacy Offers Grid (hidden for now, can be shown in a separate tab later) */}
      {false && filteredAndSortedOffers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedOffers.map((offer) => {
            const props = getOfferProperties(offer);
            const daysUntilExpiration = getDaysUntilExpiration(offer.expiration_date);
            const isExpanded = expandedOffers.has(offer.id);
            const isSaved = savedOffers.has(offer.id);
            const claimStatus = claimedOfferIds[offer.id];
            const recommendationReason = getRecommendationReason(offer, selectedProjectId !== 'all' ? selectedProjectId : undefined);
            const usagePercentage = offer.max_usage 
              ? Math.round((offer.usage_count || 0) / offer.max_usage * 100)
              : 0;

            return (
              <div
                key={offer.id}
                className={`bg-white border rounded-lg p-5 hover:shadow-lg transition-all relative ${
                  props.isActiveDiscount ? 'border-2 border-red-200' : 'border-gray-200'
                }`}
              >
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {props.badges.map((badge, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        badge.includes('Limited Time')
                          ? 'bg-red-100 text-red-700'
                          : badge.includes('Recommended')
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{categoryIcons[offer.category] || '🛠️'}</span>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900">{offer.title}</h3>
                      <p className="text-xs text-gray-500">{offer.provider}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSaveOffer(offer.id)}
                    className={`p-1.5 rounded hover:bg-gray-100 transition-colors ${
                      isSaved ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                    title={isSaved ? 'Saved' : 'Save offer'}
                  >
                    <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3">{offer.description}</p>

                {/* Recommendation Reason */}
                {recommendationReason && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    <div className="font-medium mb-1">Why recommended?</div>
                    <div>{recommendationReason}</div>
                    {selectedProjectId !== 'all' && (
                      <div className="mt-1 text-blue-600">
                        Based on: {projects.find(p => p.id === selectedProjectId)?.title}
                      </div>
                    )}
                  </div>
                )}

                {/* Offer Value */}
                <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-green-800">{getOfferValue(offer)}</span>
                  </div>
                  {offer.original_price && offer.discounted_price && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 line-through">{offer.original_price}</span>
                      <span className="font-semibold text-green-700">{offer.discounted_price}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-600 mt-1">
                    Best for: {getBestFor(offer)}
                  </div>
                </div>

                {/* Eligibility with Tooltip */}
                {offer.eligibility && (
                  <div className="mb-3 relative group">
                    <p className="text-xs text-gray-600">
                      ✓ {offer.eligibility}
                      <span className="ml-1 text-gray-400 cursor-help">ℹ️</span>
                    </p>
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 w-48 z-10">
                      {offer.eligibility.includes('student') 
                        ? 'Verification may be required with a student email address.'
                        : offer.eligibility.includes('new user')
                        ? 'This offer is only available for new accounts.'
                        : 'Check the offer details for full eligibility requirements.'}
                    </div>
                  </div>
                )}

                {/* Expiration & Usage */}
                <div className="mb-3 space-y-2 text-xs">
                  {daysUntilExpiration !== null && daysUntilExpiration > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">⏰ Expires in:</span>
                      <span className={`font-medium ${
                        daysUntilExpiration <= 7 ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                  {offer.max_usage && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-medium text-gray-700">
                          {offer.max_usage - (offer.usage_count || 0)} remaining
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-brand-light h-1.5 rounded-full transition-all"
                          style={{ width: `${100 - usagePercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expandable Details */}
                <button
                  onClick={() => toggleExpand(offer.id)}
                  className="text-xs text-brand-light hover:text-brand-light/90 mb-3 flex items-center gap-1"
                >
                  {isExpanded ? 'Hide details' : 'Show details'}
                  <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200 space-y-3">
                    {/* Features */}
                    {offer.features && offer.features.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Features:</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {offer.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-green-600">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Setup Guide */}
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Setup Guide:</div>
                      <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                        <li>Click "Claim Offer" to get your discount code</li>
                        <li>Visit the provider's website</li>
                        <li>Sign up using the discount code</li>
                        <li>Verify eligibility if required</li>
                        <li>Start building!</li>
                      </ol>
                    </div>

                    {/* Reminder */}
                    {daysUntilExpiration !== null && daysUntilExpiration > 0 && (
                      <div>
                        <div className="text-xs font-medium text-gray-700 mb-1">Remind me:</div>
                        <select
                          value={reminderDays[offer.id] || ''}
                          onChange={(e) => {
                            const days = parseInt(e.target.value);
                            if (days) handleSetReminder(offer.id, days);
                          }}
                          className="text-xs px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="">Select...</option>
                          <option value="1">1 day before</option>
                          <option value="3">3 days before</option>
                          <option value="7">7 days before</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Claim Status */}
                {claimStatus && (
                  <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded text-xs">
                    <div className="flex items-center gap-2">
                      {claimStatus === 'claimed' && <span className="text-green-600">✅</span>}
                      {claimStatus === 'requires_verification' && <span className="text-yellow-600">⏳</span>}
                      <span className="font-medium text-gray-700">
                        {claimStatus === 'claimed' && 'Claimed'}
                        {claimStatus === 'requires_verification' && 'Requires verification'}
                        {claimStatus === 'not_claimed' && 'Not claimed'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Linked Projects */}
                {linkedOffers[offer.id] && linkedOffers[offer.id].length > 0 && (
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    <div className="font-medium text-blue-900 mb-1">Added to:</div>
                    <div className="space-y-1">
                      {linkedOffers[offer.id].map((link, idx) => (
                        <div key={idx} className="text-blue-800">
                          • {link.projectTitle}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <Link
                    href={`/student/tools/${offer.id}`}
                    className="block w-full text-center px-4 py-2 bg-brand-light text-white text-sm font-medium rounded-lg hover:bg-brand-light/90 transition-colors"
                  >
                    Claim Offer
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      href={`/student/tools/${offer.id}`}
                      className="flex-1 text-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors"
                    >
                      Setup Guide
                    </Link>
                    <button
                      className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => handleAddToProject(offer)}
                      disabled={linkedOffers[offer.id]?.length > 0 && projects.length === linkedOffers[offer.id].length}
                      title={
                        linkedOffers[offer.id]?.length > 0 && projects.length === linkedOffers[offer.id].length
                          ? 'Already added to all projects'
                          : 'Add to project'
                      }
                    >
                      {linkedOffers[offer.id]?.length > 0 ? 'Add to another project' : 'Add to project'}
                    </button>
                  </div>
                </div>

                {/* Partner Disclosure */}
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                  We may receive a referral benefit.
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
