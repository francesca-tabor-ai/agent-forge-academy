import { NextRequest } from "next/server";
import { createUserSupabaseClient } from "@/lib/supabase/server";
import { storage } from "@/lib/spec-driven-development/storage";
import { getPromptForAgent, getOutputTypeForAgent } from "@/lib/spec-driven-development/prompts";
import OpenAI from "openai";
import type { AgentType } from "@/lib/spec-driven-development/schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// POST /api/tools/spec-driven-development/workflows/:id/execute
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const workflowId = parseInt(id, 10);
    
    if (isNaN(workflowId)) {
      return new Response(JSON.stringify({ error: "Invalid workflow ID" }), { status: 400 });
    }

    const supabase = await createUserSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Get student profile ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404 });
    }

    const { data: studentProfile } = await supabase
      .from("student_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .single();

    if (!studentProfile) {
      return new Response(JSON.stringify({ error: "Student profile not found" }), { status: 404 });
    }

    const workflow = await storage.getWorkflow(workflowId, studentProfile.id);
    if (!workflow) {
      return new Response(JSON.stringify({ error: "Workflow not found" }), { status: 404 });
    }

    // Create a ReadableStream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          const constitution = await storage.getConstitution(studentProfile.id);
          const contextVariables = workflow.contextVariables || [];

          await storage.updateWorkflow(workflowId, { status: "in_progress" }, studentProfile.id);

          const agentSequence: AgentType[] = ["decision_author", "analyst", "architect", "scrum_master", "developer"];
          const generatedDocuments: any[] = [];
          let hasError = false;

          for (let stepIndex = 0; stepIndex < agentSequence.length; stepIndex++) {
            if (hasError) break;
            
            const agentType = agentSequence[stepIndex];
            const prompt = getPromptForAgent(agentType, contextVariables, constitution, generatedDocuments);
            const outputType = getOutputTypeForAgent(agentType);

            send({ stepIndex, agentType, agentStarted: true });

            try {
              const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  { role: "system", content: prompt },
                  { role: "user", content: `Generate the ${outputType} based on the provided context and any previous agent outputs. Be thorough and professional.` }
                ],
                stream: true,
                max_tokens: 8192
              });

              let fullContent = "";

              for await (const chunk of completion) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                  fullContent += content;
                  send({ stepIndex, content });
                }
              }

              const document = await storage.createDocument({
                workflowId: workflowId,
                agentType,
                title: `${outputType} - ${new Date().toLocaleDateString()}`,
                content: fullContent,
                outputType
              }, studentProfile.id);

              generatedDocuments.push({ agentType, outputType, content: fullContent });
              
              await storage.updateWorkflow(workflowId, { currentAgent: agentType }, studentProfile.id);

              send({ stepIndex, stepComplete: true, document });
            } catch (error) {
              console.error(`OpenAI error for agent ${agentType}:`, error);
              hasError = true;
              await storage.updateWorkflow(workflowId, { status: "error" }, studentProfile.id);
              send({ stepIndex, error: `Failed to generate content for ${agentType}` });
            }
          }

          if (!hasError) {
            await storage.updateWorkflow(workflowId, { status: "completed" }, studentProfile.id);
          }

          send({ done: true, totalDocuments: generatedDocuments.length });
        } catch (error) {
          console.error("Error executing workflow:", error);
          send({ error: "Failed to execute workflow" });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error) {
    console.error("Error executing workflow:", error);
    return new Response(JSON.stringify({ error: "Failed to execute workflow" }), { status: 500 });
  }
}
