import { NextRequest, NextResponse } from "next/server";
import { createUserSupabaseClient } from "@/lib/supabase/server";
import { storage } from "@/lib/spec-driven-development/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tools/spec-driven-development/workflows/:id
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const workflowId = parseInt(id, 10);
    
    if (isNaN(workflowId)) {
      return NextResponse.json({ error: "Invalid workflow ID" }, { status: 400 });
    }

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

    const workflow = await storage.getWorkflow(workflowId, studentProfile.id);
    
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Error getting workflow:", error);
    return NextResponse.json({ error: "Failed to get workflow" }, { status: 500 });
  }
}

// PATCH /api/tools/spec-driven-development/workflows/:id
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const workflowId = parseInt(id, 10);
    
    if (isNaN(workflowId)) {
      return NextResponse.json({ error: "Invalid workflow ID" }, { status: 400 });
    }

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
    const workflow = await storage.updateWorkflow(workflowId, body, studentProfile.id);
    
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(workflow);
  } catch (error) {
    console.error("Error updating workflow:", error);
    return NextResponse.json({ error: "Failed to update workflow" }, { status: 500 });
  }
}

// DELETE /api/tools/spec-driven-development/workflows/:id
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const workflowId = parseInt(id, 10);
    
    if (isNaN(workflowId)) {
      return NextResponse.json({ error: "Invalid workflow ID" }, { status: 400 });
    }

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

    await storage.deleteWorkflow(workflowId, studentProfile.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting workflow:", error);
    return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 });
  }
}
