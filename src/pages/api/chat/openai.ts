import { NextRequest, NextResponse } from "next/server";
import { requestOpenai } from "../common";

import type {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
} from "openai";

export type ChatRequest = CreateChatCompletionRequest;
export type ChatReponse = CreateChatCompletionResponse;


async function makeRequest(req: NextRequest) {
  try {
    const api = await requestOpenai(req);
    const res = new NextResponse(api.body);
    res.headers.set("Content-Type", "application/json");
    res.headers.set("Cache-Control", "no-cache");
    return res;
  } catch (e) {
    console.error("[OpenAI] ", req.body, e);
    return NextResponse.json(
      {
        error: true,
        msg: JSON.stringify(e),
      },
      {
        status: 500,
      },
    );
  }
}

export default async function handler(req: NextRequest) {
  return makeRequest(req)
}

export const config = {
  runtime: 'edge',
}