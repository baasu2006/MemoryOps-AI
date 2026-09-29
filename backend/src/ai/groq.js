import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { buildEnrichedSystemPrompt, MEMORYOPS_SYSTEM_PROMPT } from './systemPrompt.js';
dotenv.config();

let groq;
try {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
} catch (e) {
  console.warn('Groq SDK init warning:', e.message);
}

export async function chat(messages, context = {}) {
  if (!groq) {
    return {
      message: 'AI service is not configured. Please set GROQ_API_KEY in your .env file.',
      role: 'assistant'
    };
  }

  const enrichedPrompt = buildEnrichedSystemPrompt({
    employee: context.employee,
    diagnostics: context.diagnostics,
    memories: context.memories,
    resolutionStats: context.resolutionStats
  });

  const systemMessage = {
    role: 'system',
    content: enrichedPrompt
  };

  try {
    const response = await groq.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 1024
    });
    return {
      message: response.choices[0].message.content,
      role: 'assistant'
    };
  } catch (error) {
    console.error('Groq chat error:', error.message);
    // Provide a fallback response using context data
    return generateFallbackResponse(context);
  }
}

export async function analyzeIncident(incident, memories) {
  if (!groq) {
    return 'AI analysis unavailable. Please configure GROQ_API_KEY.';
  }
  
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an IT incident analyst. Analyze the incident and compare it with past memories to identify patterns and recommend actions. Be concise and data-driven.'
        },
        {
          role: 'user',
          content: `Analyze this incident:\n${JSON.stringify(incident, null, 2)}\n\nPast memories:\n${JSON.stringify(memories, null, 2)}`
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 512
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Groq analysis error:', error.message);
    return 'Analysis unavailable due to AI service error.';
  }
}

function generateFallbackResponse(context) {
  let message = '';

  if (context.employee) {
    message += `Hello ${context.employee.name}. I'm reviewing your device (${context.employee.device}).`;
  }

  if (context.diagnostics) {
    const d = context.diagnostics;
    message += `\n\nDiagnostic Results:\n- CPU Usage: ${d.cpu}%\n- RAM Usage: ${d.ram}%\n- Disk Usage: ${d.disk}%`;
    if (d.problematicProcess) {
      message += `\n- ⚠️ High-resource process detected: **${d.problematicProcess}**`;
    }
  }

  if (context.recommendation) {
    message += `\n\nBased on historical data, I recommend: **${context.recommendation.displayName || context.recommendation.action}**`;
    message += `\nReason: ${context.recommendation.reason}`;
    message += `\nConfidence: ${context.recommendation.confidence}%`;
    message += `\n\nWould you like to authorize this action?`;
  }

  if (!message) {
    message = 'I\'m here to help with your IT issue. Could you describe the problem you\'re experiencing?';
  }

  return { message, role: 'assistant' };
}
