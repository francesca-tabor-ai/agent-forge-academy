'use client';

import { useState, useEffect } from 'react';
import { logToolRunSafe } from '@/lib/tools/logToolRun';

interface Agent {
  id: string;
  name: string;
  department: string;
  status: 'healthy' | 'warning' | 'critical' | 'compliant';
  performanceScore: number;
  ethicalComplianceScore: number;
  lastChecked: Date;
  issues: string[];
  modelType: string;
  deployment: string;
}

interface ComplianceMetric {
  category: string;
  score: number;
  threshold: number;
  status: 'pass' | 'warning' | 'fail';
  agentsAffected: number;
}

interface AutonomousGovernanceOfficeClientProps {
  toolId: string;
  studentProfileId: string;
}

// Generate demo agents
const generateDemoAgents = (count: number): Agent[] => {
  const departments = [
    'Healthcare Services', 'Financial Regulation', 'Public Safety', 
    'Education', 'Transportation', 'Social Services', 'Environmental',
    'Justice & Legal', 'Defence', 'Foreign Affairs'
  ];
  
  const modelTypes = ['GPT-4', 'Claude 3', 'Llama 3', 'Gemini Pro', 'Custom Model'];
  const deployments = ['Production', 'Staging', 'Development'];
  const statuses: Agent['status'][] = ['healthy', 'warning', 'critical', 'compliant'];
  
  const agents: Agent[] = [];
  
  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const performanceScore = status === 'healthy' || status === 'compliant' 
      ? 85 + Math.random() * 15 
      : status === 'warning' 
      ? 70 + Math.random() * 15 
      : 50 + Math.random() * 20;
    
    const ethicalScore = status === 'compliant' || status === 'healthy'
      ? 90 + Math.random() * 10
      : status === 'warning'
      ? 75 + Math.random() * 15
      : 60 + Math.random() * 20;
    
    const issues: string[] = [];
    if (status === 'warning') {
      issues.push('Performance degradation detected');
    }
    if (status === 'critical') {
      issues.push('Ethical compliance violation detected');
      issues.push('Response time exceeded threshold');
    }
    
    agents.push({
      id: `agent-${i.toString().padStart(3, '0')}`,
      name: `AI Agent ${i}`,
      department: departments[Math.floor(Math.random() * departments.length)],
      status,
      performanceScore: Math.round(performanceScore),
      ethicalComplianceScore: Math.round(ethicalScore),
      lastChecked: new Date(Date.now() - Math.random() * 3600000), // Within last hour
      issues,
      modelType: modelTypes[Math.floor(Math.random() * modelTypes.length)],
      deployment: deployments[Math.floor(Math.random() * deployments.length)],
    });
  }
  
  return agents;
};

export function AutonomousGovernanceOfficeClient({ 
  toolId, 
  studentProfileId 
}: AutonomousGovernanceOfficeClientProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetric[]>([]);
  const [totalAgents, setTotalAgents] = useState(250);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize with demo data
  useEffect(() => {
    const initialAgents = generateDemoAgents(totalAgents);
    setAgents(initialAgents);
    setFilteredAgents(initialAgents);
    calculateComplianceMetrics(initialAgents);
    logToolRunSafe({ toolId, studentProfileId });
  }, [toolId, studentProfileId, totalAgents]);

  // Simulate real-time monitoring updates
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setAgents(prevAgents => {
        const updated = prevAgents.map(agent => {
          // Randomly update some agents
          if (Math.random() > 0.7) {
            const newStatus: Agent['status'] = 
              Math.random() > 0.9 ? 'warning' :
              Math.random() > 0.95 ? 'critical' :
              Math.random() > 0.8 ? 'compliant' : 'healthy';
            
            const performanceScore = newStatus === 'healthy' || newStatus === 'compliant' 
              ? 85 + Math.random() * 15 
              : newStatus === 'warning' 
              ? 70 + Math.random() * 15 
              : 50 + Math.random() * 20;
            
            const ethicalScore = newStatus === 'compliant' || newStatus === 'healthy'
              ? 90 + Math.random() * 10
              : newStatus === 'warning'
              ? 75 + Math.random() * 15
              : 60 + Math.random() * 20;
            
            const issues: string[] = [];
            if (newStatus === 'warning') {
              issues.push('Performance degradation detected');
            }
            if (newStatus === 'critical') {
              issues.push('Ethical compliance violation detected');
              issues.push('Response time exceeded threshold');
            }
            
            return {
              ...agent,
              status: newStatus,
              performanceScore: Math.round(performanceScore),
              ethicalComplianceScore: Math.round(ethicalScore),
              lastChecked: new Date(),
              issues,
            };
          }
          return agent;
        });
        
        calculateComplianceMetrics(updated);
        setLastUpdate(new Date());
        return updated;
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const calculateComplianceMetrics = (agentList: Agent[]) => {
    const categories = [
      { name: 'Performance', threshold: 80 },
      { name: 'Ethical Compliance', threshold: 85 },
      { name: 'Response Time', threshold: 90 },
      { name: 'Bias Detection', threshold: 90 },
      { name: 'Privacy Compliance', threshold: 95 },
    ];

    const metrics: ComplianceMetric[] = categories.map(category => {
      let score = 0;
      let agentsAffected = 0;

      if (category.name === 'Performance') {
        const avgScore = agentList.reduce((sum, a) => sum + a.performanceScore, 0) / agentList.length;
        score = avgScore;
        agentsAffected = agentList.filter(a => a.performanceScore < category.threshold).length;
      } else if (category.name === 'Ethical Compliance') {
        const avgScore = agentList.reduce((sum, a) => sum + a.ethicalComplianceScore, 0) / agentList.length;
        score = avgScore;
        agentsAffected = agentList.filter(a => a.ethicalComplianceScore < category.threshold).length;
      } else {
        // Simulate other metrics
        score = 85 + Math.random() * 10;
        agentsAffected = Math.floor(Math.random() * agentList.length * 0.1);
      }

      const status: 'pass' | 'warning' | 'fail' = 
        score >= category.threshold ? 'pass' :
        score >= category.threshold - 10 ? 'warning' : 'fail';

      return {
        category: category.name,
        score: Math.round(score),
        threshold: category.threshold,
        status,
        agentsAffected,
      };
    });

    setComplianceMetrics(metrics);
  };

  // Filter agents
  useEffect(() => {
    let filtered = agents;

    if (searchTerm) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(agent => agent.status === statusFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(agent => agent.department === departmentFilter);
    }

    setFilteredAgents(filtered);
  }, [agents, searchTerm, statusFilter, departmentFilter]);

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'healthy':
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'healthy':
      case 'compliant':
        return '✓';
      case 'warning':
        return '⚠';
      case 'critical':
        return '✗';
      default:
        return '○';
    }
  };

  const getComplianceStatusColor = (status: ComplianceMetric['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const departments = Array.from(new Set(agents.map(a => a.department))).sort();
  const statusCounts = {
    all: agents.length,
    healthy: agents.filter(a => a.status === 'healthy').length,
    compliant: agents.filter(a => a.status === 'compliant').length,
    warning: agents.filter(a => a.status === 'warning').length,
    critical: agents.filter(a => a.status === 'critical').length,
  };

  const avgPerformance = agents.length > 0
    ? Math.round(agents.reduce((sum, a) => sum + a.performanceScore, 0) / agents.length)
    : 0;
  
  const avgEthical = agents.length > 0
    ? Math.round(agents.reduce((sum, a) => sum + a.ethicalComplianceScore, 0) / agents.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Total Agents</div>
          <div className="text-3xl font-bold text-gray-900">{totalAgents}</div>
          <div className="text-xs text-gray-500 mt-1">Active monitoring</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Avg Performance</div>
          <div className="text-3xl font-bold text-gray-900">{avgPerformance}%</div>
          <div className="text-xs text-gray-500 mt-1">Across all agents</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Ethical Compliance</div>
          <div className="text-3xl font-bold text-gray-900">{avgEthical}%</div>
          <div className="text-xs text-gray-500 mt-1">Average score</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm text-gray-600 mb-1">Status</div>
          <div className="text-3xl font-bold text-gray-900">
            {isMonitoring ? '🟢 Live' : '⚪ Paused'}
          </div>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            {isMonitoring ? 'Pause' : 'Resume'} monitoring
          </button>
        </div>
      </div>

      {/* Compliance Metrics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Compliance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {complianceMetrics.map((metric, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">{metric.category}</div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getComplianceStatusColor(metric.status)}`}>
                  {metric.status.toUpperCase()}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.score}%</div>
              <div className="text-xs text-gray-500">
                Threshold: {metric.threshold}% • {metric.agentsAffected} agents affected
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search agents..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All ({statusCounts.all})</option>
              <option value="healthy">Healthy ({statusCounts.healthy})</option>
              <option value="compliant">Compliant ({statusCounts.compliant})</option>
              <option value="warning">Warning ({statusCounts.warning})</option>
              <option value="critical">Critical ({statusCounts.critical})</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agent Count</label>
            <input
              type="number"
              min="50"
              max="1000"
              step="50"
              value={totalAgents}
              onChange={(e) => setTotalAgents(parseInt(e.target.value) || 250)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            AI Agents ({filteredAgents.length} of {agents.length})
          </h2>
          <div className="text-sm text-gray-500">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ethical Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Checked
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAgents.slice(0, 100).map((agent) => (
                <tr 
                  key={agent.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(agent.status)}`}>
                      {getStatusIcon(agent.status)} {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {agent.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {agent.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            agent.performanceScore >= 80 ? 'bg-green-500' :
                            agent.performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${agent.performanceScore}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-700">{agent.performanceScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            agent.ethicalComplianceScore >= 85 ? 'bg-green-500' :
                            agent.ethicalComplianceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${agent.ethicalComplianceScore}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-700">{agent.ethicalComplianceScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.modelType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {agent.lastChecked.toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-800">
                      View Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAgents.length > 100 && (
          <div className="px-6 py-4 border-t border-gray-200 text-center text-sm text-gray-500">
            Showing first 100 of {filteredAgents.length} agents. Use filters to narrow results.
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Agent Details</h3>
              <button
                onClick={() => setSelectedAgent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">Agent ID</div>
                <div className="font-mono text-lg">{selectedAgent.id}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Name</div>
                <div className="text-lg font-medium">{selectedAgent.name}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Department</div>
                <div className="text-lg">{selectedAgent.department}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <span className={`px-3 py-1 text-sm font-medium rounded border ${getStatusColor(selectedAgent.status)}`}>
                  {getStatusIcon(selectedAgent.status)} {selectedAgent.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Performance Score</div>
                  <div className="text-2xl font-bold">{selectedAgent.performanceScore}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Ethical Compliance</div>
                  <div className="text-2xl font-bold">{selectedAgent.ethicalComplianceScore}%</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Model Type</div>
                <div className="text-lg">{selectedAgent.modelType}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Deployment</div>
                <div className="text-lg">{selectedAgent.deployment}</div>
              </div>
              
              {selectedAgent.issues.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500 mb-2">Issues Detected</div>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedAgent.issues.map((issue, idx) => (
                      <li key={idx} className="text-red-600">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <div className="text-sm text-gray-500 mb-1">Last Checked</div>
                <div className="text-lg">{selectedAgent.lastChecked.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
