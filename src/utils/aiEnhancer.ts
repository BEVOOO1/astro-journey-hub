import { UserType } from "@/types/publication";

const AI_API_URL = "https://birefringent-cerebrational-ian.ngrok-free.dev/api/generate";

export const enhanceContentForUser = async (
  content: string,
  userType: UserType
): Promise<string> => {
  try {
    const prompts = {
      adventurer: `Rewrite this scientific content in a simple, fun, and exciting way for a young space adventurer (ages 8-14). Use simple words, short sentences, and make it engaging and inspiring. Keep it under 200 words:\n\n${content}`,
      explorer: `Rewrite this scientific content for a space explorer with intermediate knowledge. Use clear language, explain key concepts, but maintain scientific accuracy. Keep it informative and engaging, around 250 words:\n\n${content}`,
      scientist: `Enhance this scientific content for a researcher. Maintain technical accuracy, expand on key findings, and include relevant scientific details. Keep professional tone, around 300 words:\n\n${content}`,
    };

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2-vision:11b",
        prompt: prompts[userType],
        stream: false,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to enhance content: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different possible response formats from Llama API
    return data.response || data.choices?.[0]?.text || data.content || data.message || content;
  } catch (error) {
    console.error("Error enhancing content:", error);
    return content; // Return original content if AI fails
  }
};

export const generateSummary = async (
  content: string,
  userType: UserType
): Promise<string> => {
  try {
    const prompts = {
      adventurer: `Create a super short, exciting summary (2-3 sentences) of this space research for kids:\n\n${content}`,
      explorer: `Create a clear, informative summary (3-4 sentences) of this space research:\n\n${content}`,
      scientist: `Create a comprehensive summary highlighting key findings and methodology (4-5 sentences):\n\n${content}`,
    };

    const response = await fetch(AI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.2-vision:11b",
        prompt: prompts[userType],
        stream: false,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate summary: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different possible response formats from Llama API
    const summary = data.response || data.choices?.[0]?.text || data.content || data.message;
    
    if (summary) {
      return summary;
    } else {
      // Fallback to simple truncation
      return content.length > 200 ? content.substring(0, 200) + "..." : content;
    }
  } catch (error) {
    console.error("Error generating summary:", error);
    return content.length > 200 ? content.substring(0, 200) + "..." : content;
  }
};
