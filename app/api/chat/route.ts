import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";
import { searchOrders } from "@/lib/tools/search-orders";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system:
      "You are OrderMitra, an assistant for a small Indian retail shop. " +
      "Use the searchOrders tool to answer questions about orders. " +
      "Never invent an order that the tool did not return.",
    messages,
    tools: {
      searchOrders: tool({
        description: searchOrders.description,
        parameters: z.object({
          customerName: z.string().optional(),
          status: z
            .enum(["placed", "packed", "shipped", "delivered"])
            .optional(),
        }),
        execute: async (input) => searchOrders.execute(input),
      }),
    },
  });

  return result.toDataStreamResponse();
}
