'use client';

import { useState } from 'react';
import { logToolRunSafe } from '@/lib/tools/logToolRun';
import { ExternalLink, FileText, Code2, Building2, ClipboardList, CheckCircle2, PlayCircle } from 'lucide-react';

interface SpecDrivenDevelopmentClientProps {
  toolId: string;
  studentProfileId: string;
}

export function SpecDrivenDevelopmentClient({ 
  toolId, 
  studentProfileId 
}: SpecDrivenDevelopmentClientProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLaunch = async () => {
    setIsLoading(true);
    await logToolRunSafe({
      toolId,
      studentProfileId,
    });
    
    // Open the Spec-Driven Development application in a new tab
    // Configure via NEXT_PUBLIC_SDDD_APP_URL environment variable
    // Defaults to Replit deployment URL if not set
    const sdddUrl = process.env.NEXT_PUBLIC_SDDD_APP_URL || 'https://spec-driven-development.replit.app';
    window.open(sdddUrl, '_blank');
    setIsLoading(false);
  };

  const agents = [
    {
      id: 'decision_author',
      name: 'Decision Author',
      description: 'Produces formal, decision-oriented specifications for SDDD tool and methodology selection',
      icon: FileText,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: 'analyst',
      name: 'Analyst / Product Manager',
      description: 'Produces professional documentation including Project Briefs, PRDs, and Initial Specifications',
      icon: ClipboardList,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      id: 'architect',
      name: 'Architect',
      description: 'Translates requirements into coherent system architecture with constitutional compliance',
      icon: Building2,
      color: 'bg-green-50 text-green-700 border-green-200',
    },
    {
      id: 'scrum_master',
      name: 'Scrum Master',
      description: 'Decomposes plans into hyper-detailed, testable user stories and tasks',
      icon: CheckCircle2,
      color: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    {
      id: 'developer',
      name: 'Developer',
      description: 'Produces implementation code following specifications and architectural decisions',
      icon: Code2,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
        <p className="text-gray-600 mb-4">
          Spec-Driven Development (SDDD) orchestrates five specialized AI agents in a sequential workflow to produce 
          formal specifications, architecture documents, and implementation plans. This tool treats specifications as 
          the authoritative source of truth, eliminating &quot;vibe coding&quot; by establishing formal requirements before implementation.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Key Features</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Document versioning with full history</li>
              <li>• Real-time streaming of AI outputs</li>
              <li>• Context variable customization</li>
              <li>• Constitution pattern governance</li>
              <li>• File upload support (PDF/TXT)</li>
              <li>• Document validation & export</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Workflow Benefits</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Sequential, traceable agent execution</li>
              <li>• Constitutional compliance enforcement</li>
              <li>• Requirements traceability</li>
              <li>• Eliminates ambiguity before coding</li>
              <li>• Production-ready specifications</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Agents Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">The Five Specialized Agents</h2>
        <p className="text-gray-600 mb-6">
          Each agent in the workflow has a specific role and produces distinct artifacts that feed into the next stage.
        </p>
        
        <div className="space-y-4">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <div 
                key={agent.id}
                className={`border rounded-lg p-4 ${agent.color}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-white border-2 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{agent.name}</h3>
                      <span className="text-xs font-medium opacity-75">Step {index + 1}</span>
                    </div>
                    <p className="text-sm opacity-90">{agent.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Launch Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Get Started?</h2>
            <p className="text-gray-600">
              Launch the Spec-Driven Development application to begin orchestrating your AI agents and creating 
              formal specifications for your projects.
            </p>
          </div>
          <button
            onClick={handleLaunch}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlayCircle className="w-5 h-5" />
            {isLoading ? 'Launching...' : 'Launch Application'}
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Learn More</h2>
        <div className="space-y-3">
          <a
            href="/course/vibe-engineering/spec-driven-development"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Spec-Driven Development Course</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Master SDDD from foundations to enterprise implementation
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
