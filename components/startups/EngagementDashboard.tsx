'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Bookmark, BookOpen, Sparkles, Loader2, Rocket, ExternalLink } from 'lucide-react';

interface EngagementDashboardProps {
  userId: string;
}

interface Bookmark {
  id: string;
  startup_id: string;
  created_at: string;
  startups: {
    id: string;
    name: string;
    tagline: string;
    logo_url?: string;
    vibe_score: number;
  };
}

interface CourseProgress {
  id: string;
  course_id: string;
  progress_percent: number;
  started_at: string;
  updated_at: string;
  startup_courses: {
    id: string;
    title: string;
    level: string;
    price: number;
    startups: {
      id: string;
      name: string;
      logo_url?: string;
    };
  };
}

interface AISession {
  id: string;
  startupId: string;
  createdAt: string;
  startup: {
    id: string;
    name: string;
    tagline: string;
    logo_url?: string;
  };
  ideaCount: number;
  latestIdea: {
    id: string;
    niche: string;
    created_at: string;
  } | null;
}

export function EngagementDashboard({ userId }: EngagementDashboardProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [aiSessions, setAiSessions] = useState<AISession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'courses' | 'sessions'>('bookmarks');

  useEffect(() => {
    loadEngagementData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(loadEngagementData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadEngagementData = async () => {
    try {
      const response = await fetch('/api/user/engagement');
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks || []);
        setCourseProgress(data.courseProgress || []);
        setAiSessions(data.aiSessions || []);
      }
    } catch (err) {
      console.error('Failed to load engagement data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading your engagement data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">My Engagement</h1>
        <p className="text-base text-gray-600">
          Track your bookmarks, course progress, and AI ideation sessions
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'bookmarks'
                ? 'border-brand-light text-brand-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Bookmarks ({bookmarks.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'courses'
                ? 'border-brand-light text-brand-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Course Progress ({courseProgress.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sessions'
                ? 'border-brand-light text-brand-light'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Sessions ({aiSessions.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'bookmarks' && (
          <div>
            {bookmarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bookmark) => (
                  <Link
                    key={bookmark.id}
                    href={`/startups/${bookmark.startup_id}`}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-light hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      {bookmark.startups.logo_url ? (
                        <Image
                          src={bookmark.startups.logo_url}
                          alt={bookmark.startups.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover flex-shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center flex-shrink-0">
                          <Rocket className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {bookmark.startups.name}
                        </h3>
                        {bookmark.startups.tagline && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {bookmark.startups.tagline}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Bookmarked {new Date(bookmark.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-xs font-medium text-gray-700">
                            Vibe: {bookmark.startups.vibe_score}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No bookmarks yet</p>
                <p className="text-gray-500 text-sm mb-4">
                  Start bookmarking startups you find inspiring!
                </p>
                <Link
                  href="/startups"
                  className="inline-block px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium"
                >
                  Browse Startups
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div>
            {courseProgress.length > 0 ? (
              <div className="space-y-4">
                {courseProgress.map((progress) => (
                  <div
                    key={progress.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-light hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {progress.startup_courses.startups.logo_url ? (
                        <Image
                          src={progress.startup_courses.startups.logo_url}
                          alt={progress.startup_courses.startups.name}
                          width={64}
                          height={64}
                          className="rounded-lg object-cover flex-shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center flex-shrink-0">
                          <Rocket className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {progress.startup_courses.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {progress.startup_courses.startups.name}
                            </p>
                          </div>
                          <Link
                            href={`/startups/${progress.startup_courses.startups.id}`}
                            className="text-sm text-brand-light hover:underline flex items-center gap-1"
                          >
                            View Startup <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Progress: {progress.progress_percent}%
                            </span>
                            <span className="text-xs text-gray-500">
                              Started {new Date(progress.started_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-brand-light h-3 rounded-full transition-all duration-300"
                              style={{ width: `${progress.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No course progress yet</p>
                <p className="text-gray-500 text-sm mb-4">
                  Enroll in courses to start tracking your progress!
                </p>
                <Link
                  href="/startups"
                  className="inline-block px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium"
                >
                  Browse Startups
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div>
            {aiSessions.length > 0 ? (
              <div className="space-y-4">
                {aiSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:border-brand-light hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {session.startup.logo_url ? (
                        <Image
                          src={session.startup.logo_url}
                          alt={session.startup.name}
                          width={64}
                          height={64}
                          className="rounded-lg object-cover flex-shrink-0"
                          unoptimized
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center flex-shrink-0">
                          <Rocket className="w-8 h-8 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {session.startup.name}
                            </h3>
                            {session.startup.tagline && (
                              <p className="text-sm text-gray-600">{session.startup.tagline}</p>
                            )}
                          </div>
                          <Link
                            href={`/startups/${session.startupId}`}
                            className="text-sm text-brand-light hover:underline flex items-center gap-1"
                          >
                            View Startup <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {session.ideaCount} idea{session.ideaCount !== 1 ? 's' : ''} generated
                            </span>
                          </div>
                          <span className="text-gray-500">
                            Started {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {session.latestIdea && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Latest Idea</p>
                            <p className="text-sm font-medium text-gray-900">
                              {session.latestIdea.niche || 'General adaptation'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(session.latestIdea.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No AI ideation sessions yet</p>
                <p className="text-gray-500 text-sm mb-4">
                  Start generating ideas by visiting a startup and using the AI ideation tool!
                </p>
                <Link
                  href="/startups"
                  className="inline-block px-4 py-2 bg-brand-light text-white rounded-lg hover:bg-brand-light/90 transition-colors text-sm font-medium"
                >
                  Browse Startups
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
