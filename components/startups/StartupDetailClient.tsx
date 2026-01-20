'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Rocket, 
  ExternalLink, 
  Twitter, 
  Youtube, 
  Globe, 
  DollarSign, 
  Clock, 
  Wrench, 
  BookOpen,
  Sparkles,
  TrendingUp,
  Code,
  Bug,
  Lightbulb,
  CheckCircle2,
  Calendar,
  DollarSign as DollarIcon,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { BookmarkButton } from './BookmarkButton';

interface Founder {
  id: string;
  name: string;
  bio?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  website?: string;
}

interface BusinessModel {
  revenueStreams: any;
  pricingDetails: any;
  distributionChannels: any;
  keyMetrics: any;
  growthNotes?: string;
}

interface BuildEstimate {
  technicalDifficulty: string;
  estimatedBuildTimeDays?: number;
  estimatedBuildCostUsd?: number;
  maintenanceCostUsdMonthly?: number;
  soloFriendly: boolean;
}

interface RevenuePotential {
  conservativeMrr?: number;
  realisticMrr?: number;
  breakoutMrr?: number;
  assumptions?: string;
}

interface Tool {
  id: string;
  name: string;
  category: string;
  costModel: string;
  description?: string;
  websiteUrl?: string;
  usageNotes?: string;
}

interface Prompt {
  id: string;
  promptType: string;
  promptText: string;
  difficulty: string;
}

interface CourseModule {
  id: string;
  title: string;
  orderIndex: number;
  content: string;
}

interface UserProgress {
  progressPercent: number;
  startedAt: string;
  updatedAt: string;
}

interface Course {
  id: string;
  title: string;
  level: string;
  price: number;
  accessTier: string;
  description?: string;
  modules: CourseModule[];
  userProgress: UserProgress | null;
}

interface Startup {
  id: string;
  name: string;
  tagline: string;
  description: string;
  founder: Founder | null;
  vibeScore: number;
  revenueRange: string;
  status: string;
  logoUrl?: string;
  websiteUrl?: string;
  launchYear?: number;
  pricingModel?: string;
  targetCustomer?: string;
  businessModel?: BusinessModel | null;
  buildEstimate?: BuildEstimate | null;
  revenuePotential?: RevenuePotential | null;
  tools: Tool[];
  prompts: Prompt[];
  courses: Course[];
}

interface StartupDetailClientProps {
  startup: Startup;
}

const getVibeScoreColor = (score: number) => {
  if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
  if (score >= 80) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (score >= 70) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'acquired':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'shut down':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-700 border-green-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getPromptTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ideation':
      return Lightbulb;
    case 'frontend':
      return Code;
    case 'backend':
      return Code;
    case 'debugging':
      return Bug;
    default:
      return Sparkles;
  }
};

const getPromptTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ideation':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'frontend':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'backend':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'debugging':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export function StartupDetailClient({ startup }: StartupDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'founder' | 'business' | 'build' | 'tools' | 'prompts' | 'courses'>('overview');
  const vibeScoreColor = getVibeScoreColor(startup.vibeScore);
  const statusColor = getStatusColor(startup.status);

  // Group prompts by type
  const promptsByType = startup.prompts.reduce((acc, prompt) => {
    const type = prompt.promptType.toLowerCase();
    if (!acc[type]) acc[type] = [];
    acc[type].push(prompt);
    return acc;
  }, {} as Record<string, Prompt[]>);

  const handleEnrollCourse = async (courseId: string) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = `/api/courses/enroll?course_id=${courseId}`;
    document.body.appendChild(form);
    form.submit();
  };

  const handleStartAIIdeation = () => {
    router.push(`/student/ai-advisor?startup_id=${startup.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Back Button */}
      <Link
        href="/startups"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Startups
      </Link>

      {/* Hero Section */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-brand-light/10 to-brand-dark/10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden border-2 border-gray-200">
                {startup.logoUrl ? (
                  <Image
                    src={startup.logoUrl}
                    alt={startup.name}
                    width={128}
                    height={128}
                    className="object-contain p-4"
                    unoptimized
                  />
                ) : (
                  <Rocket className="w-12 h-12 md:w-16 md:h-16 text-gray-400" />
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">{startup.name}</h1>
                  {startup.tagline && (
                    <p className="text-lg md:text-xl text-gray-600 italic mb-3">{startup.tagline}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <BookmarkButton startupId={startup.id} size="md" />
                  <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${statusColor}`}>
                    {startup.status}
                  </span>
                  <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${vibeScoreColor}`}>
                    Vibe: {startup.vibeScore}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed text-base md:text-lg">{startup.description}</p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mb-4">
                {startup.revenueRange && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Revenue:</span>
                    <span className="text-sm font-semibold text-gray-900">{startup.revenueRange}</span>
                  </div>
                )}
                {startup.launchYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Launched:</span>
                    <span className="text-sm font-semibold text-gray-900">{startup.launchYear}</span>
                  </div>
                )}
                {startup.pricingModel && (
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Model:</span>
                    <span className="text-sm font-semibold text-gray-900 capitalize">{startup.pricingModel.replace('_', ' ')}</span>
                  </div>
                )}
              </div>

              {/* External Link */}
              {startup.websiteUrl && (
                <a
                  href={startup.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors font-medium text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTAs Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {startup.courses.length > 0 && (
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Learn to Build This</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enroll in our course to learn how to build a clone or adaptation of {startup.name}
              </p>
              {startup.courses.map((course) => (
                <form key={course.id} action={`/api/courses/enroll?course_id=${course.id}`} method="POST" className="mb-2">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Enroll in Course: {course.title}
                  </button>
                </form>
              ))}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ideate Your Version</h3>
            <p className="text-sm text-gray-600 mb-4">
              Use AI to generate ideas for adapting this startup to a different niche, ICP, or geography
            </p>
            <button
              onClick={handleStartAIIdeation}
              className="w-full md:w-auto px-6 py-3 bg-white border-2 border-brand-light text-brand-light font-semibold rounded-lg hover:bg-brand-light/10 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start AI Ideation
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Rocket },
              { id: 'founder', label: 'Founder', icon: Users },
              { id: 'business', label: 'Business Model', icon: DollarSign },
              { id: 'build', label: 'Build Estimates', icon: Clock },
              { id: 'tools', label: 'Tech Stack', icon: Wrench },
              { id: 'prompts', label: 'Vibe Prompts', icon: Sparkles },
              { id: 'courses', label: 'Courses', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 md:px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-brand-light text-brand-light'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {startup.targetCustomer && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-light" />
                    Target Customer
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{startup.targetCustomer}</p>
                </div>
              )}
              {startup.pricingModel && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarIcon className="w-5 h-5 text-brand-light" />
                    Pricing Model
                  </h3>
                  <p className="text-gray-700 capitalize">{startup.pricingModel.replace('_', ' ')}</p>
                </div>
              )}
              {startup.buildEstimate && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Build Info</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Difficulty</p>
                      <span className={`inline-block px-3 py-1.5 text-sm font-semibold rounded-full border ${getDifficultyColor(startup.buildEstimate.technicalDifficulty)}`}>
                        {startup.buildEstimate.technicalDifficulty}
                      </span>
                    </div>
                    {startup.buildEstimate.estimatedBuildTimeDays && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Build Time</p>
                        <p className="text-lg font-semibold text-gray-900">{startup.buildEstimate.estimatedBuildTimeDays} days</p>
                      </div>
                    )}
                    {startup.buildEstimate.estimatedBuildCostUsd && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Build Cost</p>
                        <p className="text-lg font-semibold text-gray-900">${startup.buildEstimate.estimatedBuildCostUsd.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Founder Tab */}
          {activeTab === 'founder' && startup.founder && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 md:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-light to-brand-dark rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">{startup.founder.name}</h3>
                    <p className="text-sm text-gray-600">Founder of {startup.name}</p>
                  </div>
                </div>
                {startup.founder.bio && (
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">{startup.founder.bio}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  {startup.founder.twitterUrl && (
                    <a
                      href={startup.founder.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-brand-light hover:bg-brand-light/5 transition-colors text-sm font-medium"
                    >
                      <Twitter className="w-4 h-4 text-gray-600" />
                      Twitter
                    </a>
                  )}
                  {startup.founder.youtubeUrl && (
                    <a
                      href={startup.founder.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-brand-light hover:bg-brand-light/5 transition-colors text-sm font-medium"
                    >
                      <Youtube className="w-4 h-4 text-red-600" />
                      YouTube Interview
                    </a>
                  )}
                  {startup.founder.website && (
                    <a
                      href={startup.founder.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-brand-light hover:bg-brand-light/5 transition-colors text-sm font-medium"
                    >
                      <Globe className="w-4 h-4 text-gray-600" />
                      Personal Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Business Model Tab */}
          {activeTab === 'business' && startup.businessModel && (
            <div className="space-y-6">
              {startup.businessModel.revenueStreams && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-light" />
                    Revenue Streams
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    {Array.isArray(startup.businessModel.revenueStreams) ? (
                      <ul className="space-y-2">
                        {startup.businessModel.revenueStreams.map((stream: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            {stream}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border">
                        {JSON.stringify(startup.businessModel.revenueStreams, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {startup.businessModel.pricingDetails && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-brand-light" />
                    Pricing Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    {typeof startup.businessModel.pricingDetails === 'object' ? (
                      <div className="space-y-3">
                        {Object.entries(startup.businessModel.pricingDetails).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                            <span className="font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                            <span className="text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border">
                        {JSON.stringify(startup.businessModel.pricingDetails, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {startup.businessModel.distributionChannels && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-brand-light" />
                    Distribution Channels
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    {Array.isArray(startup.businessModel.distributionChannels) ? (
                      <ul className="space-y-2">
                        {startup.businessModel.distributionChannels.map((channel: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            {channel}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border">
                        {JSON.stringify(startup.businessModel.distributionChannels, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {startup.businessModel.keyMetrics && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-brand-light" />
                    Key Metrics
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    {typeof startup.businessModel.keyMetrics === 'object' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(startup.businessModel.keyMetrics).map(([key, value]: [string, any]) => (
                          <div key={key} className="bg-white p-4 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                            <p className="text-lg font-semibold text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border">
                        {JSON.stringify(startup.businessModel.keyMetrics, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {startup.businessModel.growthNotes && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-brand-light" />
                    Growth Notes
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{startup.businessModel.growthNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Build Estimates Tab */}
          {activeTab === 'build' && startup.buildEstimate && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 md:p-8 border border-blue-200">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-brand-light" />
                  Build Estimates
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Technical Difficulty</p>
                    <span className={`inline-block px-4 py-2 text-base font-semibold rounded-full border ${getDifficultyColor(startup.buildEstimate.technicalDifficulty)}`}>
                      {startup.buildEstimate.technicalDifficulty}
                    </span>
                  </div>
                  {startup.buildEstimate.estimatedBuildTimeDays && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-2">Estimated Build Time</p>
                      <p className="text-2xl font-bold text-gray-900">{startup.buildEstimate.estimatedBuildTimeDays} days</p>
                      <p className="text-xs text-gray-500 mt-1">Solo founder estimate</p>
                    </div>
                  )}
                  {startup.buildEstimate.estimatedBuildCostUsd && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-2">Estimated Build Cost</p>
                      <p className="text-2xl font-bold text-gray-900">${startup.buildEstimate.estimatedBuildCostUsd.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Tools + infrastructure</p>
                    </div>
                  )}
                  {startup.buildEstimate.maintenanceCostUsdMonthly && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-2">Monthly Maintenance</p>
                      <p className="text-2xl font-bold text-gray-900">${startup.buildEstimate.maintenanceCostUsdMonthly.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">Ongoing costs</p>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-medium text-gray-500 mb-2">Solo Friendly</p>
                    <div className="flex items-center gap-2">
                      {startup.buildEstimate.soloFriendly ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-base font-semibold text-green-700">Yes</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base font-semibold text-gray-700">Requires team</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Revenue Potential */}
              {startup.revenuePotential && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 md:p-8 border border-green-200">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                    Revenue Potential
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {startup.revenuePotential.conservativeMrr && (
                      <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                        <p className="text-sm font-medium text-gray-500 mb-2">Conservative MRR</p>
                        <p className="text-3xl font-bold text-gray-900">${startup.revenuePotential.conservativeMrr.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">Monthly recurring revenue</p>
                      </div>
                    )}
                    {startup.revenuePotential.realisticMrr && (
                      <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                        <p className="text-sm font-medium text-gray-500 mb-2">Realistic MRR</p>
                        <p className="text-3xl font-bold text-brand-light">${startup.revenuePotential.realisticMrr.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">Monthly recurring revenue</p>
                      </div>
                    )}
                    {startup.revenuePotential.breakoutMrr && (
                      <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                        <p className="text-sm font-medium text-gray-500 mb-2">Breakout MRR</p>
                        <p className="text-3xl font-bold text-green-600">${startup.revenuePotential.breakoutMrr.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-2">Monthly recurring revenue</p>
                      </div>
                    )}
                  </div>
                  {startup.revenuePotential.assumptions && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Assumptions</p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{startup.revenuePotential.assumptions}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tech Stack Tab */}
          {activeTab === 'tools' && (
            <div>
              {startup.tools.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Tech Stack & Tools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {startup.tools.map((tool) => (
                      <div key={tool.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:border-brand-light hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 text-lg">{tool.name}</h4>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded capitalize">
                            {tool.category}
                          </span>
                        </div>
                        {tool.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tool.description}</p>
                        )}
                        {tool.usageNotes && (
                          <div className="mb-3">
                            <p className="text-xs font-medium text-gray-500 mb-1">Usage:</p>
                            <p className="text-sm text-gray-700 italic">{tool.usageNotes}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <span className="text-xs font-medium text-gray-600 capitalize">{tool.costModel}</span>
                          {tool.websiteUrl && (
                            <a
                              href={tool.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-brand-light hover:underline font-medium flex items-center gap-1"
                            >
                              Visit <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No tools listed for this startup.</p>
                </div>
              )}
            </div>
          )}

          {/* Vibe Prompts Tab */}
          {activeTab === 'prompts' && (
            <div>
              {startup.prompts.length > 0 ? (
                <div className="space-y-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Vibe Coding Prompts</h3>
                  {Object.entries(promptsByType).map(([type, prompts]) => {
                    const Icon = getPromptTypeIcon(type);
                    const colorClass = getPromptTypeColor(type);
                    return (
                      <div key={type} className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border flex items-center gap-2 ${colorClass}`}>
                            <Icon className="w-4 h-4" />
                            {type.charAt(0).toUpperCase() + type.slice(1)} Prompts
                          </span>
                          <span className="text-sm text-gray-500">({prompts.length})</span>
                        </div>
                        <div className="space-y-4">
                          {prompts.map((prompt) => (
                            <div key={prompt.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                              <div className="flex items-center justify-between mb-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded border ${colorClass}`}>
                                  {prompt.difficulty.charAt(0).toUpperCase() + prompt.difficulty.slice(1)}
                                </span>
                              </div>
                              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-4 rounded border border-gray-200 font-mono">
                                {prompt.promptText}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No prompts available for this startup.</p>
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              {startup.courses.length > 0 ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Learn to Build This Startup</h3>
                  <div className="space-y-8">
                    {startup.courses.map((course) => {
                      const isEnrolled = course.userProgress !== null;
                      const progressPercent = course.userProgress?.progressPercent || 0;
                      
                      return (
                        <div key={course.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-brand-light hover:shadow-md transition-all">
                          {/* Course Header */}
                          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-900 text-xl flex-1">{course.title}</h4>
                                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full capitalize flex-shrink-0">
                                    {course.level}
                                  </span>
                                </div>
                                {course.description && (
                                  <p className="text-sm text-gray-600 mb-3">{course.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-gray-500" />
                                    <span className="font-semibold text-gray-900">${course.price}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Access:</span>
                                    <span className="font-medium text-gray-700 capitalize">{course.accessTier} tier</span>
                                  </div>
                                  {course.modules.length > 0 && (
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="w-4 h-4 text-gray-500" />
                                      <span className="text-gray-600">{course.modules.length} module{course.modules.length !== 1 ? 's' : ''}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar (if enrolled) */}
                            {isEnrolled && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-700">
                                    Your Progress: {progressPercent}%
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Started {new Date(course.userProgress!.startedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className="bg-brand-light h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-1"
                                    style={{ width: `${progressPercent}%` }}
                                  >
                                    {progressPercent > 10 && (
                                      <span className="text-xs font-medium text-white">{progressPercent}%</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Enrollment CTA */}
                            <div className="flex items-center gap-3">
                              {isEnrolled ? (
                                <div className="flex-1">
                                  <button
                                    onClick={() => {
                                      // Navigate to course content or first module
                                      // For now, we'll just show a message
                                      alert('Course content will be available soon!');
                                    }}
                                    className="px-6 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm"
                                  >
                                    Continue Learning
                                  </button>
                                </div>
                              ) : (
                                <form action={`/api/startup-courses/enroll?course_id=${course.id}`} method="POST" className="flex-1">
                                  <button
                                    type="submit"
                                    className="w-full md:w-auto px-6 py-2.5 bg-brand-light text-white font-semibold rounded-lg hover:bg-brand-light/90 transition-colors text-sm"
                                  >
                                    Enroll in Course
                                  </button>
                                </form>
                              )}
                            </div>
                          </div>

                          {/* Course Modules */}
                          {course.modules.length > 0 && (
                            <div className="p-6 bg-gray-50">
                              <h5 className="text-lg font-semibold text-gray-900 mb-4">Course Modules</h5>
                              <div className="space-y-3">
                                {course.modules.map((module, index) => {
                                  // Check if content is video (YouTube URL) or text
                                  const isVideo = module.content?.includes('youtube.com') || module.content?.includes('youtu.be');
                                  const isText = !isVideo && module.content;
                                  
                                  return (
                                    <div
                                      key={module.id}
                                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-light transition-colors"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 bg-brand-light/10 rounded-full flex items-center justify-center">
                                          <span className="text-sm font-semibold text-brand-light">{module.orderIndex}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h6 className="font-semibold text-gray-900 mb-2">{module.title}</h6>
                                          {isVideo && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                              <Youtube className="w-4 h-4 text-red-600" />
                                              <span>Video Content</span>
                                            </div>
                                          )}
                                          {isText && (
                                            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200 max-h-32 overflow-y-auto">
                                              {module.content}
                                            </div>
                                          )}
                                          {!isVideo && !isText && (
                                            <p className="text-sm text-gray-500 italic">Content coming soon</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No courses available for this startup.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
