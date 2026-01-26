import { NextRequest, NextResponse } from "next/server";
import { createUserSupabaseClient } from "@/lib/supabase/server";
import { storage } from "@/lib/spec-driven-development/storage";
import { z } from "zod";
import { agentTypes, contextVariableSchema } from "@/lib/spec-driven-development/schema";

const createWorkflowBodySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(5000).optional(),
  startingAgent: z.enum(agentTypes).optional(),
  contextVariables: z.array(contextVariableSchema).optional(),
  uploadedContent: z.string().optional()
});

// GET /api/tools/spec-driven-development/workflows
export async function GET(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student profile ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const workflows = await storage.getAllWorkflows(studentProfile.id);
    return NextResponse.json(workflows);
  } catch (error) {
    console.error("Error getting workflows:", error);
    return NextResponse.json({ error: "Failed to get workflows" }, { status: 500 });
  }
}

// POST /api/tools/spec-driven-development/workflows
export async function POST(request: NextRequest) {
  try {
    const supabase = await createUserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student profile ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const parseResult = createWorkflowBodySchema.safeParse(body);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, startingAgent, contextVariables: providedContextVars, uploadedContent } = parseResult.data;
    const agentType = startingAgent || "analyst";
    
    // Use provided context variables or defaults
    const { defaultContextVariables } = await import("@/lib/spec-driven-development/schema");
    const contextVariables = providedContextVars && providedContextVars.length > 0 
      ? providedContextVars 
      : [...(defaultContextVariables[agentType] || [])];

    // Combine description with uploaded content if present
    let fullDescription = description || "";
    if (uploadedContent) {
      fullDescription = fullDescription 
        ? `${fullDescription}\n\n--- Uploaded Content ---\n${uploadedContent}`
        : uploadedContent;
    }

    const workflow = await storage.createWorkflow({
      name,
      description: fullDescription,
      status: "draft",
      currentAgent: agentType,
      contextVariables
    }, studentProfile.id);

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error("Error creating workflow:", error);
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
  }
}
