import { z } from "zod";

// Agent types for the SDDD workflow
export const agentTypes = [
  "decision_author",
  "analyst",
  "architect",
  "scrum_master",
  "developer"
] as const;

export type AgentType = typeof agentTypes[number];

// Agent metadata
export interface AgentInfo {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  outputTypes: string[];
}

export const agents: AgentInfo[] = [
  {
    id: "decision_author",
    name: "Decision Specification Author",
    description: "Produces formal, decision-oriented specifications for SDDD tool and methodology selection",
    icon: "FileText",
    outputTypes: ["SDDD Decision Specification"]
  },
  {
    id: "analyst",
    name: "Analyst / Product Manager",
    description: "Produces professional documentation including Project Briefs, PRDs, and Initial Specifications",
    icon: "ClipboardList",
    outputTypes: ["Project Brief", "PRD", "Initial Specification"]
  },
  {
    id: "architect",
    name: "Architect Agent",
    description: "Translates requirements into coherent system architecture with constitutional compliance",
    icon: "Building2",
    outputTypes: ["Architecture Overview", "Component Definition", "ADRs"]
  },
  {
    id: "scrum_master",
    name: "Scrum Master Agent",
    description: "Decomposes plans into hyper-detailed, testable user stories and tasks",
    icon: "ListTodo",
    outputTypes: ["User Stories", "Task Breakdown", "Sprint Plan"]
  },
  {
    id: "developer",
    name: "Developer Agent",
    description: "Produces implementation code following specifications and architectural decisions",
    icon: "Code2",
    outputTypes: ["Implementation Code", "Tests", "Documentation"]
  }
];

// Context variable type
export interface ContextVariable {
  key: string;
  value: string;
  description?: string;
}

export const contextVariableSchema = z.object({
  key: z.string(),
  value: z.string(),
  description: z.string().optional()
});

// Workflow types
export interface Workflow {
  id: number;
  name: string;
  description: string | null;
  status: string;
  currentAgent: string | null;
  contextVariables: ContextVariable[];
  constitutionContent: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InsertWorkflow {
  name: string;
  description?: string | null;
  status?: string;
  currentAgent?: string | null;
  contextVariables?: ContextVariable[];
  constitutionContent?: string | null;
}

// Document types
export interface Document {
  id: number;
  workflowId: number | null;
  agentType: string;
  title: string;
  content: string;
  outputType: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsertDocument {
  workflowId: number | null;
  agentType: string;
  title: string;
  content: string;
  outputType: string;
  version?: number;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  version: number;
  content: string;
  createdAt: string;
}

export interface InsertDocumentVersion {
  documentId: number;
  version: number;
  content: string;
}

// Execution step schema (not persisted, runtime only)
export const executionStepSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  agentType: z.enum(agentTypes),
  status: z.enum(["pending", "running", "completed", "error"]),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  error: z.string().optional()
});

export type ExecutionStep = z.infer<typeof executionStepSchema>;

// Default context variables for each agent
export const defaultContextVariables: Record<AgentType, ContextVariable[]> = {
  decision_author: [
    { key: "target_audience", value: "", description: "Intended audience for the specification" },
    { key: "organization_type", value: "", description: "Type of organization (startup, enterprise, etc.)" },
    { key: "regulatory_level", value: "", description: "Level of regulatory sensitivity (low, medium, high)" },
    { key: "ai_maturity_level", value: "", description: "Organization's AI maturity (beginner, intermediate, advanced)" },
    { key: "tool_1", value: "AWS Kiro", description: "First tool/method to evaluate" },
    { key: "tool_2", value: "GitHub Spec Kit", description: "Second tool/method to evaluate" },
    { key: "tool_3", value: "OpenSpec", description: "Third tool/method to evaluate" },
    { key: "tool_4", value: "BMAD Method", description: "Fourth tool/method to evaluate" },
    { key: "project_type", value: "", description: "Type of project (web app, API, mobile, etc.)" },
    { key: "system_complexity", value: "", description: "Complexity level of the system" },
    { key: "governance_priority", value: "", description: "Priority level for governance" },
    { key: "existing_codebase_state", value: "", description: "State of existing codebase (greenfield, legacy, etc.)" }
  ],
  analyst: [
    { key: "input_sources", value: "", description: "Sources of requirements (stakeholders, documents, etc.)" },
    { key: "organization_type", value: "", description: "Type of organization" },
    { key: "product_domain", value: "", description: "Domain of the product" },
    { key: "target_users", value: "", description: "Target user personas" },
    { key: "regulatory_level", value: "", description: "Regulatory sensitivity level" },
    { key: "delivery_constraints", value: "", description: "Delivery timeline and constraints" }
  ],
  architect: [
    { key: "constitution_file", value: "constitution.md", description: "Path to constitution/standards file" },
    { key: "organizational_constraints", value: "", description: "Organizational constraints and policies" },
    { key: "system_type", value: "", description: "Type of system being designed" },
    { key: "deployment_environment", value: "", description: "Target deployment environment" },
    { key: "scalability_requirements", value: "", description: "Scalability expectations" },
    { key: "availability_targets", value: "", description: "Availability and uptime targets" },
    { key: "regulatory_level", value: "", description: "Regulatory sensitivity level" }
  ],
  scrum_master: [
    { key: "constitution_file", value: "constitution.md", description: "Path to constitution/standards file" },
    { key: "sprint_duration", value: "2 weeks", description: "Duration of sprints" },
    { key: "team_size", value: "", description: "Size of development team" },
    { key: "velocity_baseline", value: "", description: "Team velocity baseline" }
  ],
  developer: [
    { key: "constitution_file", value: "constitution.md", description: "Path to constitution/standards file" },
    { key: "coding_standards", value: "", description: "Coding standards to follow" },
    { key: "testing_requirements", value: "", description: "Testing requirements (TDD, coverage, etc.)" },
    { key: "tech_stack", value: "", description: "Technology stack to use" }
  ]
};
