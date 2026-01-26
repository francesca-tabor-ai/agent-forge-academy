import { NextRequest, NextResponse } from "next/server";
import { createUserSupabaseClient } from "@/lib/supabase/server";
import { storage } from "@/lib/spec-driven-development/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tools/spec-driven-development/workflows/:id/documents
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

    const documents = await storage.getDocumentsByWorkflow(workflowId, studentProfile.id);
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error getting documents:", error);
    return NextResponse.json({ error: "Failed to get documents" }, { status: 500 });
  }
}
