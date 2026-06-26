import type { LlmChatInput, LlmChatOutput, LlmModel } from "@mrb/shared-types";
import type { LlmProvider } from "../index.js";

const DEFAULT_MODEL = "gpt-4o-mini";

interface OpenAiResponse {
  choices?: Array<{ message?: { content?: string } }>;
  model?: string;
  usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  error?: { message?: string };
}

export class OpenAiProvider implements LlmProvider {
  readonly name = "openai";

  constructor(private readonly apiKey: string) {}

  async listModels(): Promise<LlmModel[]> {
    return [
      { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
      { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
    ];
  }

  async chat(input: LlmChatInput): Promise<LlmChatOutput> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model && input.model !== "mock-bible-assistant" ? input.model : DEFAULT_MODEL,
        messages: input.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: input.temperature ?? 0.3,
        max_tokens: input.maxTokens ?? 4096,
      }),
    });

    const data = (await res.json()) as OpenAiResponse;
    if (!res.ok) {
      throw new Error(data.error?.message ?? `OpenAI HTTP ${res.status}`);
    }

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("OpenAI retornou resposta vazia");

    return {
      text,
      model: data.model ?? input.model,
      usage: {
        inputTokens: data.usage?.prompt_tokens,
        outputTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
    };
  }
}

export function createOpenAiProvider(apiKey: string): OpenAiProvider {
  return new OpenAiProvider(apiKey);
}
