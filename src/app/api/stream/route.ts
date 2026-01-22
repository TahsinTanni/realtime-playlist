import { sseManager } from "@/lib/sse-manager";

export const dynamic = 'force-dynamic';

export async function GET() {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const stream = new ReadableStream({
    start(controller) {
      // Add client to SSE manager
      sseManager.addClient(clientId, controller);

      // Send initial connection message
      const initMessage = `data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`;
      controller.enqueue(new TextEncoder().encode(initMessage));
    },
    cancel() {
      // Remove client when connection closes
      sseManager.removeClient(clientId);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
