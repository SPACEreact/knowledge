/**
 * WebLLM AI Tutor
 * Client-side LLM running entirely in the browser via WebGPU.
 * Provides context-aware explanations of cinematic concepts.
 */

import { aiStatus, aiMessages, aiModelProgress, gpuCapabilities, selectedNode } from '../state/signals.js';
import { effect } from '@preact/signals-core';

let engine = null;

const SYSTEM_PROMPT = `You are a world-class cinematic storytelling tutor. You explain visual storytelling concepts with the depth of a film school professor but the approachability of a friend. 

Rules:
- Be concise (2-3 paragraphs max)
- Use specific film examples (directors, movies, scenes)
- Connect theory to practice
- When explaining a concept, mention what breaks if it's misused
- Use analogies from everyday life
- If the user is looking at a specific concept, relate your answer to it`;

export async function initAITutor() {
    // Check WebGPU support
    if (!gpuCapabilities.value.webgpu) {
        aiStatus.value = 'unsupported';
        console.log('⚠️ WebLLM requires WebGPU');
        return;
    }

    aiStatus.value = 'loading';

    try {
        const webllm = await import('@mlc-ai/web-llm');

        engine = await webllm.CreateMLCEngine(
            'Llama-3.2-1B-Instruct-q4f16_1-MLC',
            {
                initProgressCallback: (report) => {
                    aiModelProgress.value = report.progress || 0;
                    console.log(`🧠 AI: ${report.text}`);
                }
            }
        );

        aiStatus.value = 'ready';
        console.log('🧠 WebLLM ready');

    } catch (e) {
        console.error('WebLLM init failed:', e);
        aiStatus.value = 'error';
    }
}

export async function askTutor(userMessage) {
    if (!engine || aiStatus.value !== 'ready') return;

    aiStatus.value = 'thinking';

    // Build context from selected node
    const node = selectedNode.value;
    let context = '';
    if (node) {
        context = `\n\nThe user is currently viewing: "${node.title}" — ${node.definition}`;
        if (node.example) context += ` Example: ${node.example}`;
    }

    // Add to messages
    const messages = [
        ...aiMessages.value,
        { role: 'user', content: userMessage }
    ];
    aiMessages.value = messages;

    try {
        const response = await engine.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT + context },
                ...messages.slice(-6) // Keep last 6 messages for context window
            ],
            temperature: 0.7,
            max_tokens: 512,
            stream: true
        });

        let fullResponse = '';
        for await (const chunk of response) {
            const delta = chunk.choices?.[0]?.delta?.content || '';
            fullResponse += delta;

            // Update messages with streaming response
            aiMessages.value = [
                ...messages,
                { role: 'assistant', content: fullResponse }
            ];
        }

        aiStatus.value = 'ready';

    } catch (e) {
        console.error('AI error:', e);
        aiMessages.value = [
            ...messages,
            { role: 'assistant', content: '⚠️ Sorry, I encountered an error. Try again!' }
        ];
        aiStatus.value = 'ready';
    }
}

export function clearChat() {
    aiMessages.value = [];
}

export function getAIStatus() {
    return aiStatus.value;
}
