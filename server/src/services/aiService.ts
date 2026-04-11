import OpenAI from 'openai';
import prisma from '../config/client.js';
import redisClient from '../config/redis.js';

const nvidia = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || 'mock_key',
  baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
});

// Standard technical model for analysis
const MODEL = "meta/llama-3.3-70b-instruct";

export class AIService {
  /**
   * Performs deep analysis on API logs to find the root cause of failures.
   */
  async rootCauseAnalysis(logs: any[]) {
    // 1. Prune context (remove noise)
    const prunedLogs = logs.map(log => ({
      path: log.url,
      method: log.method,
      status: log.status,
      duration: log.duration,
      error: typeof log.response === 'string' ? log.response.substring(0, 500) : JSON.stringify(log.response).substring(0, 500)
    }));

    const prompt = `
      Analyze these API logs and identify the root cause of failures.
      Format the response as a clear, professional summary for a DevOps engineer.
      
      Logs:
      ${JSON.stringify(prunedLogs)}
      
      Return JSON: { "root_cause": "...", "severity": "...", "recommended_action": "..." }
    `;

    return this.callNvidia(prompt, true);
  }

  /**
   * Answers natural language questions about API performance.
   */
  async naturalLanguageQuery(query: string, projectId: string) {
    // Fetch some basic context first
    const stats = await prisma.requestHistory.findMany({
      where: { endpoint: { project_id: projectId } },
      take: 10,
      orderBy: { created_at: 'desc' }
    });

    const prompt = `
      The user is asking: "${query}"
      Based on these recent logs: ${JSON.stringify(stats.map(s => ({ m: s.method, u: s.url, s: s.status, d: s.duration })))}
      Provide a helpful, data-driven answer. 
      Keep it professional and concise.
    `;

    return this.callNvidia(prompt);
  }

  /**
   * Suggests a code fix or configuration change for a specific error.
   */
  async suggestFix(errorLog: any) {
    const prompt = `
      Suggest a fix for this API error:
      Path: ${errorLog.url}
      Status: ${errorLog.status}
      Response: ${JSON.stringify(errorLog.response)}
      
      Explain the fix in technical detail but keep it brief.
    `;

    return this.callNvidia(prompt);
  }

  /**
   * Original method: Explains an endpoint to developers.
   */
  async explainEndpoint(endpointId: string) {
    const endpoint = await prisma.endpoint.findUnique({
       where: { id: endpointId },
       include: { project: true }
    });

    if (!endpoint) throw new Error('Endpoint not found');

    const prompt = `
      Explain this API endpoint:
      Method: ${endpoint.method}
      Path: ${endpoint.path}
      Request: ${JSON.stringify(endpoint.request_schema)}
      Response: ${JSON.stringify(endpoint.response_schema)}
      
      Return JSON: { "purpose": "...", "request_explanation": "...", "response_explanation": "...", "use_case": "..." }
    `;

    return this.callNvidia(prompt, true);
  }

  private async callNvidia(prompt: string, isJson: boolean = false) {
    try {
      const response = await nvidia.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 1024,
        response_format: isJson ? { type: "json_object" } : undefined,
      } as any);

      const content = response.choices[0]?.message?.content || "";
      return isJson ? JSON.parse(content) : content;
    } catch (error: any) {
      console.error('NVIDIA AI Service Error:', error.message || error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }
}
