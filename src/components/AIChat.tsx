"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Bot, User } from "lucide-react";
import { parseCSV } from "@/utils/csvParser";
import { Publication, UserType } from "@/types/publication";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  onClose: () => void;
}

/** Turn an abstract into Title / Mission / Findings / Outcome */
const formatAbstract = (abstract: string): string => {
  const sentences = abstract.split(/(?<=[.!?])\s+/); // split into sentences
  const title = sentences[0]?.replace(/\*/g, "").trim() || "Untitled Study";

  let mission = "";
  let findings: string[] = [];
  let outcome = sentences[sentences.length - 1] || "";

  sentences.forEach((s) => {
    const lower = s.toLowerCase();
    if (lower.includes("day") || lower.includes("mission") || lower.includes("aboard")) {
      mission = s.trim();
    } else if (
      lower.includes("heart") ||
      lower.includes("blood") ||
      lower.includes("pressure") ||
      lower.includes("eat") ||
      lower.includes("sleep") ||
      lower.includes("train") ||
      lower.includes("food") ||
      lower.includes("measure") ||
      lower.includes("behavior")
    ) {
      findings.push(s.trim());
    }
  });

  let formatted = `Title:\n${title}\n`;
  if (mission) formatted += `\nMission:\n${mission}\n`;
  if (findings.length > 0) {
    formatted += `\nFindings:\n- ${findings.join("\n- ")}\n`;
  }
  if (outcome) formatted += `\nOutcome:\n${outcome}\n`;

  return formatted.trim();
};

/** Keep abstracts concise for RAG context */
const optimizeAbstract = (abstract: string): string => {
  return formatAbstract(abstract); // now always structured
};

/** Format response into nice paragraphs */
const formatResponse = (text: string): string[] => {
  return text
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/\*\*/g, "") // strip bold
    .replace(/#+/g, "") // strip headings
    .replace(/\n{3,}/g, "\n\n") // collapse excess newlines
    .trim()
    .split(/\n{2,}/) // split into paragraphs
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
};

const AIChat = ({ onClose }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your NASA Research assistant. I can help you explore publications, answer questions about space research, and create clear summaries. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [userType, setUserType] = useState<UserType>("explorer");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const type = localStorage.getItem("userType") as UserType;
    if (type) setUserType(type);
    parseCSV().then(setPublications);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildRAGContext = (query: string): string => {
    const queryLower = query.toLowerCase();
    const relevantPubs = publications
      .filter(
        (pub) =>
          pub.title.toLowerCase().includes(queryLower) ||
          pub.abstract.toLowerCase().includes(queryLower) ||
          pub.keywords.toLowerCase().includes(queryLower) ||
          pub.topics.toLowerCase().includes(queryLower)
      )
      .slice(0, 3);

    if (relevantPubs.length === 0) {
      return "No specific publications found in database. Use general NASA space research knowledge.";
    }

    let context = "Relevant publications from NASA database:\n\n";
    relevantPubs.forEach((pub, idx) => {
      context += `${idx + 1}. Title: ${pub.title}\n`;
      context += `   Journal: ${pub.journal}\n`;
      context += `   Year: ${pub.timeline_year}\n`;
      context += `   Abstract:\n${optimizeAbstract(pub.abstract)}\n`;
      context += `   Keywords: ${pub.keywords}\n\n`;
    });

    return context;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const ragContext = buildRAGContext(userMessage);

      const systemPrompt =
        userType === "adventurer"
          ? "You are a friendly NASA assistant for kids. Use simple words, short sentences, and add emojis."
          : userType === "explorer"
          ? "You are a NASA assistant. Explain clearly, engagingly, in smooth paragraphs."
          : "You are a NASA assistant. Provide structured, scientific paragraphs.";

      const enhancedPrompt = `${systemPrompt}

Context from NASA Research Database:
${ragContext}

User question: ${userMessage}

When summarizing publications:
- Write in clear, flowing paragraphs.
- Each abstract should be 1–2 concise paragraphs, easy to read.
- Avoid repetition, avoid markdown, avoid code blocks.`;

      const response = await fetch(
        "https://birefringent-cerebrational-ian.ngrok-free.dev/api/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3.2-vision:11b",
            prompt: enhancedPrompt,
            stream: false,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.response ||
            "I'm sorry, I couldn't process that request.",
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ I’m having trouble connecting to the AI service. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (userType) {
      case "adventurer":
        return "Ask me about cool space stuff! 🚀";
      case "explorer":
        return "Ask about space research...";
      case "scientist":
        return "Query the research database...";
      default:
        return "Ask about space research...";
    }
  };

  return (
    <Card className="fixed bottom-8 right-8 w-96 h-[600px] flex flex-col gradient-card border-primary cosmic-glow z-50 animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary animate-pulse-glow" />
          <h3 className="font-bold">
            {userType === "adventurer"
              ? "🤖 Space Helper"
              : "NASA Research Assistant"}
          </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => {
            const paragraphs =
              message.role === "assistant"
                ? formatResponse(message.content)
                : [message.content];

            return (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg p-3 max-w-[80%] whitespace-pre-wrap ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-sm mb-2 last:mb-0">
                      {p}
                    </p>
                  ))}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-secondary" />
                  </div>
                )}
              </div>
            );
          })}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg p-3 bg-muted">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={getPlaceholder()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AIChat;
