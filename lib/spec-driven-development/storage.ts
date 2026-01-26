import { createUserSupabaseClient } from "@/lib/supabase/server";
import type {
  Workflow,
  InsertWorkflow,
  Document,
  InsertDocument,
  DocumentVersion,
  InsertDocumentVersion,
  AgentType,
  ContextVariable
} from "./schema";

export interface IStorage {
  // Workflows
  getWorkflow(id: number, studentProfileId: string): Promise<Workflow | undefined>;
  getAllWorkflows(studentProfileId: string): Promise<Workflow[]>;
  createWorkflow(workflow: InsertWorkflow, studentProfileId: string): Promise<Workflow>;
  updateWorkflow(id: number, updates: Partial<InsertWorkflow>, studentProfileId: string): Promise<Workflow | undefined>;
  deleteWorkflow(id: number, studentProfileId: string): Promise<void>;
  duplicateWorkflow(id: number, studentProfileId: string): Promise<Workflow | undefined>;

  // Documents
  getDocument(id: number, studentProfileId: string): Promise<Document | undefined>;
  getDocumentsByWorkflow(workflowId: number, studentProfileId: string): Promise<Document[]>;
  getDocumentsByAgent(agentType: AgentType, studentProfileId: string): Promise<Document[]>;
  createDocument(doc: InsertDocument, studentProfileId: string): Promise<Document>;
  updateDocument(id: number, updates: Partial<InsertDocument>, studentProfileId: string): Promise<Document | undefined>;
  deleteDocument(id: number, studentProfileId: string): Promise<void>;

  // Document versions
  getDocumentVersions(documentId: number, studentProfileId: string): Promise<DocumentVersion[]>;
  createDocumentVersion(version: InsertDocumentVersion, studentProfileId: string): Promise<DocumentVersion>;

  // Constitution
  getConstitution(studentProfileId: string): Promise<string>;
  setConstitution(content: string, studentProfileId: string): Promise<void>;

  // Stats
  getStats(studentProfileId: string): Promise<{ totalWorkflows: number; completedWorkflows: number; documentsGenerated: number }>;
}

export class SupabaseStorage implements IStorage {
  private async getSupabase() {
    return await createUserSupabaseClient();
  }

  // Workflows
  async getWorkflow(id: number, studentProfileId: string): Promise<Workflow | undefined> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("sddd_workflows")
      .select("*")
      .eq("id", id)
      .eq("student_profile_id", studentProfileId)
      .single();

    if (error || !data) return undefined;
    return this.mapWorkflowFromDb(data);
  }

  async getAllWorkflows(studentProfileId: string): Promise<Workflow[]> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("sddd_workflows")
      .select("*")
      .eq("student_profile_id", studentProfileId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(this.mapWorkflowFromDb);
  }

  async createWorkflow(data: InsertWorkflow, studentProfileId: string): Promise<Workflow> {
    const supabase = await this.getSupabase();
    const { data: workflow, error } = await supabase
      .from("sddd_workflows")
      .insert({
        student_profile_id: studentProfileId,
        name: data.name,
        description: data.description,
        status: data.status || "draft",
        current_agent: data.currentAgent,
        context_variables: data.contextVariables || [],
        constitution_content: data.constitutionContent
      })
      .select()
      .single();

    if (error || !workflow) throw new Error("Failed to create workflow");
    return this.mapWorkflowFromDb(workflow);
  }

  async updateWorkflow(id: number, updates: Partial<InsertWorkflow>, studentProfileId: string): Promise<Workflow | undefined> {
    const supabase = await this.getSupabase();
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.currentAgent !== undefined) updateData.current_agent = updates.currentAgent;
    if (updates.contextVariables !== undefined) updateData.context_variables = updates.contextVariables;
    if (updates.constitutionContent !== undefined) updateData.constitution_content = updates.constitutionContent;

    const { data, error } = await supabase
      .from("sddd_workflows")
      .update(updateData)
      .eq("id", id)
      .eq("student_profile_id", studentProfileId)
      .select()
      .single();

    if (error || !data) return undefined;
    return this.mapWorkflowFromDb(data);
  }

  async deleteWorkflow(id: number, studentProfileId: string): Promise<void> {
    const supabase = await this.getSupabase();
    await supabase
      .from("sddd_workflows")
      .delete()
      .eq("id", id)
      .eq("student_profile_id", studentProfileId);
  }

  async duplicateWorkflow(id: number, studentProfileId: string): Promise<Workflow | undefined> {
    const original = await this.getWorkflow(id, studentProfileId);
    if (!original) return undefined;

    return this.createWorkflow({
      name: `${original.name} (Copy)`,
      description: original.description,
      status: "draft",
      currentAgent: original.currentAgent,
      contextVariables: [...(original.contextVariables || [])],
      constitutionContent: original.constitutionContent
    }, studentProfileId);
  }

  // Documents
  async getDocument(id: number, studentProfileId: string): Promise<Document | undefined> {
    const supabase = await this.getSupabase();
    
    // First get the document
    const { data: doc, error: docError } = await supabase
      .from("sddd_documents")
      .select("*")
      .eq("id", id)
      .single();

    if (docError || !doc) return undefined;

    // If document has a workflow, verify ownership
    if (doc.workflow_id) {
      const { data: workflow } = await supabase
        .from("sddd_workflows")
        .select("student_profile_id")
        .eq("id", doc.workflow_id)
        .eq("student_profile_id", studentProfileId)
        .single();

      if (!workflow) return undefined;
    }

    return this.mapDocumentFromDb(doc);
  }

  async getDocumentsByWorkflow(workflowId: number, studentProfileId: string): Promise<Document[]> {
    const supabase = await this.getSupabase();
    
    // Verify workflow ownership first
    const { data: workflow } = await supabase
      .from("sddd_workflows")
      .select("id")
      .eq("id", workflowId)
      .eq("student_profile_id", studentProfileId)
      .single();

    if (!workflow) return [];

    const { data, error } = await supabase
      .from("sddd_documents")
      .select("*")
      .eq("workflow_id", workflowId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(this.mapDocumentFromDb);
  }

  async getDocumentsByAgent(agentType: AgentType, studentProfileId: string): Promise<Document[]> {
    const supabase = await this.getSupabase();
    
    // Get workflow IDs owned by this student
    const { data: workflows } = await supabase
      .from("sddd_workflows")
      .select("id")
      .eq("student_profile_id", studentProfileId);

    const workflowIds = workflows?.map(w => w.id) || [];

    const { data, error } = await supabase
      .from("sddd_documents")
      .select("*")
      .eq("agent_type", agentType)
      .in("workflow_id", workflowIds.length > 0 ? workflowIds : [-1]) // Use -1 to return empty if no workflows
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(this.mapDocumentFromDb);
  }

  async createDocument(data: InsertDocument, studentProfileId: string): Promise<Document> {
    const supabase = await this.getSupabase();
    
    // Verify workflow ownership if workflowId is provided
    if (data.workflowId) {
      const workflow = await this.getWorkflow(data.workflowId, studentProfileId);
      if (!workflow) throw new Error("Workflow not found");
    }

    const { data: document, error } = await supabase
      .from("sddd_documents")
      .insert({
        workflow_id: data.workflowId,
        agent_type: data.agentType,
        title: data.title,
        content: data.content,
        output_type: data.outputType,
        version: data.version || 1
      })
      .select()
      .single();

    if (error || !document) throw new Error("Failed to create document");
    return this.mapDocumentFromDb(document);
  }

  async updateDocument(id: number, updates: Partial<InsertDocument>, studentProfileId: string): Promise<Document | undefined> {
    // Get current document for versioning
    const current = await this.getDocument(id, studentProfileId);
    if (!current) return undefined;

    // Save previous version
    await this.createDocumentVersion({
      documentId: id,
      version: current.version || 1,
      content: current.content
    }, studentProfileId);

    const supabase = await this.getSupabase();
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.outputType !== undefined) updateData.output_type = updates.outputType;
    updateData.version = (current.version || 1) + 1;

    const { data, error } = await supabase
      .from("sddd_documents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return undefined;
    return this.mapDocumentFromDb(data);
  }

  async deleteDocument(id: number, studentProfileId: string): Promise<void> {
    const supabase = await this.getSupabase();
    await supabase
      .from("sddd_documents")
      .delete()
      .eq("id", id);
  }

  // Document versions
  async getDocumentVersions(documentId: number, studentProfileId: string): Promise<DocumentVersion[]> {
    const supabase = await this.getSupabase();
    
    // Verify document ownership first
    const doc = await this.getDocument(documentId, studentProfileId);
    if (!doc) return [];

    const { data, error } = await supabase
      .from("sddd_document_versions")
      .select("*")
      .eq("document_id", documentId)
      .order("version", { ascending: false });

    if (error || !data) return [];
    return data.map((v: any) => ({
      id: v.id,
      documentId: v.document_id,
      version: v.version,
      content: v.content,
      createdAt: v.created_at
    }));
  }

  async createDocumentVersion(data: InsertDocumentVersion, studentProfileId: string): Promise<DocumentVersion> {
    const supabase = await this.getSupabase();
    const { data: version, error } = await supabase
      .from("sddd_document_versions")
      .insert({
        document_id: data.documentId,
        version: data.version,
        content: data.content
      })
      .select()
      .single();

    if (error || !version) throw new Error("Failed to create document version");
    return {
      id: version.id,
      documentId: version.document_id,
      version: version.version,
      content: version.content,
      createdAt: version.created_at
    };
  }

  // Constitution
  async getConstitution(studentProfileId: string): Promise<string> {
    const supabase = await this.getSupabase();
    const { data, error } = await supabase
      .from("sddd_settings")
      .select("value")
      .eq("student_profile_id", studentProfileId)
      .eq("key", "constitution")
      .single();

    if (error || !data) return "";
    return data.value || "";
  }

  async setConstitution(content: string, studentProfileId: string): Promise<void> {
    const supabase = await this.getSupabase();
    await supabase
      .from("sddd_settings")
      .upsert({
        student_profile_id: studentProfileId,
        key: "constitution",
        value: content
      });
  }

  // Stats
  async getStats(studentProfileId: string): Promise<{ totalWorkflows: number; completedWorkflows: number; documentsGenerated: number }> {
    const supabase = await this.getSupabase();
    
    const { data: workflows } = await supabase
      .from("sddd_workflows")
      .select("id, status")
      .eq("student_profile_id", studentProfileId);

    const workflowIds = workflows?.map(w => w.id) || [];

    const { data: documents } = await supabase
      .from("sddd_documents")
      .select("id")
      .in("workflow_id", workflowIds.length > 0 ? workflowIds : [-1]);

    return {
      totalWorkflows: workflows?.length || 0,
      completedWorkflows: workflows?.filter((w: any) => w.status === "completed").length || 0,
      documentsGenerated: documents?.length || 0
    };
  }

  // Helper methods to map database rows to types
  private mapWorkflowFromDb(row: any): Workflow {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      currentAgent: row.current_agent,
      contextVariables: row.context_variables || [],
      constitutionContent: row.constitution_content,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapDocumentFromDb(row: any): Document {
    return {
      id: row.id,
      workflowId: row.workflow_id,
      agentType: row.agent_type,
      title: row.title,
      content: row.content,
      outputType: row.output_type,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

export const storage = new SupabaseStorage();
