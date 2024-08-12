import { GoogleGenerativeAIStream, Message, StreamingTextResponse } from 'ai';
import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const buildGoogleGenAIPrompt = (messages: Message[]) => ({
    contents: messages
      .filter(message => message.role === 'user' || message.role === 'assistant')
      .map(message => ({
        role: message.role === 'user' ? 'user' : 'model',
        parts: [{ text: message.content }],
    })),
});

export async function POST(req: Request) {
    // Extract the `prompt` from the body of the request
    // const messages = []
  
    const geminiStream = await genAI
      .getGenerativeModel({ model: 'gemini-pro' })
      .generateContentStream(buildGoogleGenAIPrompt(messages));
  
    // Convert the response into a friendly text-stream
    const stream = GoogleGenerativeAIStream(geminiStream);
  
    // Respond with the stream
    return new StreamingTextResponse(stream);
}