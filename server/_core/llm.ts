// OpenAI API integration
import OpenAI from "openai";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type MessageContent = string | TextContent | ImageContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoice = "none" | "auto" | "required" | { type: "function"; function: { name: string } };

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  model?: string;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | null;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Invoke OpenAI chat completions API
 * @param params - Parameters for the API call
 * @returns The API response
 */
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const client = getOpenAIClient();

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    maxTokens,
    max_tokens,
    responseFormat,
    response_format,
    model = "gpt-4o-mini",
  } = params;

  // Convert messages to OpenAI format
  const openaiMessages = messages.map((msg) => {
    if (typeof msg.content === "string") {
      return { role: msg.role, content: msg.content };
    }
    
    const contentArray = Array.isArray(msg.content) ? msg.content : [msg.content];
    return {
      role: msg.role,
      content: contentArray.map((part) => {
        if (typeof part === "string") {
          return { type: "text" as const, text: part };
        }
        return part;
      }),
    };
  });

  const requestParams: any = {
    model,
    messages: openaiMessages,
  };

  if (tools && tools.length > 0) {
    requestParams.tools = tools;
  }

  const finalToolChoice = toolChoice || tool_choice;
  if (finalToolChoice) {
    requestParams.tool_choice = finalToolChoice;
  }

  const finalMaxTokens = maxTokens || max_tokens;
  if (finalMaxTokens) {
    requestParams.max_tokens = finalMaxTokens;
  }

  const finalResponseFormat = responseFormat || response_format;
  if (finalResponseFormat) {
    requestParams.response_format = finalResponseFormat;
  }

  const response = await client.chat.completions.create(requestParams);

  return response as unknown as InvokeResult;
}
