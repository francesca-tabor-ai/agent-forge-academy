import { NextRequest, NextResponse } from "next/server";
import { createUserSupabaseClient } from "@/lib/supabase/server";
import { storage } from "@/lib/spec-driven-development/storage";

// GET /api/tools/spec-driven-development/constitution
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

    const content = await storage.getConstitution(studentProfile.id);
    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error getting constitution:", error);
    return NextResponse.json({ error: "Failed to get constitution" }, { status: 500 });
  }
}

// PUT /api/tools/spec-driven-development/constitution
export async function PUT(request: NextRequest) {
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
    const { content } = body;
    
    await storage.setConstitution(content || "", studentProfile.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating constitution:", error);
    return NextResponse.json({ error: "Failed to update constitution" }, { status: 500 });
  }
}
