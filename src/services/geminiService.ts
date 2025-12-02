// src/services/geminiService.ts
// ------------------------------------------------------
// Gemini is DISABLED in this build.
// We keep this file so imports still work, but we do NOT
// call the real Google Generative AI SDK from the browser.
// ------------------------------------------------------

console.warn("[Gemini] Gemini features are currently disabled in this build.");

// 🔹 Example stub functions.
// IMPORTANT: rename these to match what the rest of your app imports
// from './services/geminiService'.

// If somewhere you have: 
//   import { getToolSuggestions } from './services/geminiService';
// …then you need a function with that exact name here.

export async function getToolSuggestions(_prompt: string): Promise<any[]> {
  // Return an empty list so the UI still works
  console.warn("[Gemini] getToolSuggestions called, but Gemini is disabled.");
  return [];
}

export async function summarizeText(_text: string): Promise<string> {
  console.warn("[Gemini] summarizeText called, but Gemini is disabled.");
  return "";
}

// Add more stubs here if your app imports more functions.
// Example:
// export async function getBorrowingAdvice(...) { return ""; }
export async function analyzeToolImage(_image: any): Promise<any> {
  console.warn("[Gemini] analyzeToolImage called, but Gemini is disabled.");
  // Return something harmless that your UI can handle
  return {
    title: "",
    description: "",
    tags: [],
  };
}
