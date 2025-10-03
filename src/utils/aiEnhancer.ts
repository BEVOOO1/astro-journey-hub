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
        prompt: prompts[userType],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to enhance content");
    }

    const data = await response.json();
    return data.response || content;
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
        prompt: prompts[userType],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate summary");
    }

    const data = await response.json();
    return data.response || content.substring(0, 200) + "...";
  } catch (error) {
    console.error("Error generating summary:", error);
    return content.substring(0, 200) + "...";
  }
};
