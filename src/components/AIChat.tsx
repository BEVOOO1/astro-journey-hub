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

const AIChat = ({ onClose }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your NASA Research assistant. I can help you find information from the publications database, answer questions about space research, and create summaries. What would you like to know?",
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

    // Load publications for RAG context
    parseCSV().then(setPublications);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildRAGContext = (query: string): string => {
    // Simple RAG: Find relevant publications based on query
    const queryLower = query.toLowerCase();
    const relevantPubs = publications
      .filter(pub => 
        pub.title.toLowerCase().includes(queryLower) ||
        pub.abstract.toLowerCase().includes(queryLower) ||
        pub.keywords.toLowerCase().includes(queryLower) ||
        pub.topics.toLowerCase().includes(queryLower)
      )
      .slice(0, 3); // Top 3 most relevant

    if (relevantPubs.length === 0) {
      return "No specific publications found in database. Use general NASA space research knowledge.";
    }

    let context = "Relevant publications from NASA database:\n\n";
    relevantPubs.forEach((pub, idx) => {
      context += `${idx + 1}. Title: ${pub.title}\n`;
      context += `   Journal: ${pub.journal}\n`;
      context += `   Year: ${pub.timeline_year}\n`;
      context += `   Abstract: ${pub.abstract.substring(0, 300)}...\n`;
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
      // Build RAG context
      const ragContext = buildRAGContext(userMessage);
      
      // Create enhanced prompt with RAG context
      const systemPrompt = userType === "adventurer" 
        ? "You are a friendly NASA space research assistant for kids. Use simple words, short sentences, and make space exciting! Add emojis. Keep answers short and fun."
        : userType === "explorer"
        ? "You are a NASA space research assistant. Explain concepts clearly and make them interesting. Balance detail with accessibility."
        : "You are a NASA space research assistant. Provide detailed, scientifically accurate information with proper context.";

      const enhancedPrompt = `${systemPrompt}\n\nContext from NASA Research Database:\n${ragContext}\n\nUser question: ${userMessage}\n\nBased on the context above, provide an accurate and helpful answer. If the question is about specific publications, reference them. If asking for summaries, create them based on the database content.`;

      const response = await fetch("https://birefringent-cerebrational-ian.ngrok-free.dev/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: enhancedPrompt,
          history: messages.slice(-6), // Last 3 exchanges for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response || "I'm sorry, I couldn't process that request." },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm having trouble connecting to the AI service. Please try again later.",
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
            {userType === "adventurer" ? "🤖 Space Helper" : "NASA Research Assistant"}
          </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-secondary" />
                </div>
              )}
            </div>
          ))}
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
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AIChat;
