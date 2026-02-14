// =====================================================
// AI API - CHAT/COMPLETION ENDPOINT
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/core/security';
import AIOrchestrator from '@/lib/core/ai-orchestrator';

const chatSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
  projectId: z.string().uuid().optional(),
  context: z.record(z.any()).optional(),
  stream: z.boolean().optional(),
});

async function handleChat(req: NextRequest, context: any) {
  try {
    const body = await req.json();
    const validated = chatSchema.parse(body);

    const orchestrator = new AIOrchestrator();

    // Handle streaming
    if (validated.stream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            const responseStream = orchestrator.streamResponse({
              prompt: validated.prompt,
              context: validated.context,
              userId: context.userId,
              organizationId: context.organizationId,
              projectId: validated.projectId,
            });

            for await (const chunk of responseStream) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
            }

            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error: any) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    const response = await orchestrator.processRequest({
      prompt: validated.prompt,
      context: validated.context,
      userId: context.userId,
      organizationId: context.organizationId,
      projectId: validated.projectId,
    });

    return NextResponse.json({
      success: true,
      response: response.content,
      usage: response.usage,
      metadata: response.metadata,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'AI processing failed' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handleChat);
