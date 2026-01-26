'use client';

import { useState, useEffect } from 'react';
import { logToolRunSafe } from '@/lib/tools/logToolRun';
import { FileText, Code2, Building2, ClipboardList, CheckCircle2, Plus, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SpecDrivenDevelopmentClientProps {
  toolId: string;
  studentProfileId: string;
}

interface Workflow {
  id: number;
  name: string;
  description: string | null;
  status: string;
  currentAgent: string | null;
  contextVariables: Array<{ key: string; value: string; description?: string }>;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: number;
  workflowId: number | null;
  agentType: string;
  title: string;
  content: string;
  outputType: string;
  version: number;
  createdAt: string;
}

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

export function SpecDrivenDevelopmentClient({ 
  toolId, 
  studentProfileId 
}: SpecDrivenDevelopmentClientProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const queryClient = useQueryClient();

  // Log tool run on mount
  useEffect(() => {
    logToolRunSafe({
      toolId,
      studentProfileId,
    });
  }, [toolId, studentProfileId]);

  // Fetch workflows
  const { data: workflows = [], isLoading: workflowsLoading } = useQuery<Workflow[]>({
    queryKey: ['sddd-workflows'],
    queryFn: async () => {
      const res = await fetch('/api/tools/spec-driven-development/workflows');
      if (!res.ok) throw new Error('Failed to fetch workflows');
      return res.json();
    },
  });

  // Fetch documents for selected workflow
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ['sddd-documents', selectedWorkflow],
    queryFn: async () => {
      if (!selectedWorkflow) return [];
      const res = await fetch(`/api/tools/spec-driven-development/workflows/${selectedWorkflow}/documents`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      return res.json();
    },
    enabled: !!selectedWorkflow,
  });

  // Create workflow mutation
  const createWorkflowMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; startingAgent?: string }) => {
      const res = await fetch('/api/tools/spec-driven-development/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create workflow');
      return res.json();
    },
    onSuccess: (workflow) => {
      queryClient.invalidateQueries({ queryKey: ['sddd-workflows'] });
      setSelectedWorkflow(workflow.id);
    },
  });

  // Execute workflow mutation
  const executeWorkflowMutation = useMutation({
    mutationFn: async (workflowId: number) => {
      setIsExecuting(true);
      const res = await fetch(`/api/tools/spec-driven-development/workflows/${workflowId}/execute`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to execute workflow');
      
      // Handle SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No response body');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              setIsExecuting(false);
              queryClient.invalidateQueries({ queryKey: ['sddd-workflows'] });
              queryClient.invalidateQueries({ queryKey: ['sddd-documents', selectedWorkflow] });
            }
          }
        }
      }
    },
  });

  const handleCreateWorkflow = () => {
    const name = prompt('Enter workflow name:');
    if (!name) return;
    
    createWorkflowMutation.mutate({
      name,
      description: '',
      startingAgent: 'analyst',
    });
  };

  const handleExecuteWorkflow = (workflowId: number) => {
    if (isExecuting) return;
    executeWorkflowMutation.mutate(workflowId);
  };

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

      {/* Workflows Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Workflows</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage your spec-driven development workflows
            </p>
          </div>
          <Button onClick={handleCreateWorkflow} disabled={createWorkflowMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>

        {workflowsLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium mb-1">No workflows yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create your first workflow to get started with spec-driven development.
              </p>
              <Button onClick={handleCreateWorkflow}>
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </div>
          </Card>
        ) : (
          <Tabs value={selectedWorkflow?.toString() || undefined} onValueChange={(v) => setSelectedWorkflow(v ? parseInt(v) : null)}>
            <TabsList className="grid w-full grid-cols-auto mb-4">
              {workflows.map((workflow) => (
                <TabsTrigger key={workflow.id} value={workflow.id.toString()}>
                  {workflow.name}
                  <Badge variant="secondary" className="ml-2">
                    {workflow.status}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {workflows.map((workflow) => (
              <TabsContent key={workflow.id} value={workflow.id.toString()} className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{workflow.name}</CardTitle>
                        <CardDescription>{workflow.description || 'No description'}</CardDescription>
                      </div>
                      <Button
                        onClick={() => handleExecuteWorkflow(workflow.id)}
                        disabled={isExecuting || workflow.status === 'completed'}
                      >
                        {isExecuting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Execute Workflow
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {documents.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-medium">Generated Documents</h3>
                        {documents.map((doc) => (
                          <Card key={doc.id}>
                            <CardHeader>
                              <CardTitle className="text-base">{doc.title}</CardTitle>
                              <CardDescription>
                                {doc.agentType} • Version {doc.version}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="max-h-64 overflow-y-auto">
                                <pre className="text-sm whitespace-pre-wrap">{doc.content}</pre>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No documents generated yet. Execute the workflow to generate documents.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
