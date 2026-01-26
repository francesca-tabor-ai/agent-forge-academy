import { NextRequest, NextResponse } from "next/server";
import { createUserSupabaseClient } from "@/lib/supabase/server";
import { storage } from "@/lib/spec-driven-development/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/tools/spec-driven-development/workflows/:id/duplicate
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const workflow = await storage.duplicateWorkflow(workflowId, studentProfile.id);
    
    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json(workflow, { status: 201 });
  } catch (error) {
    console.error("Error duplicating workflow:", error);
    return NextResponse.json({ error: "Failed to duplicate workflow" }, { status: 500 });
  }
}
