import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Calendar, Users, BookOpen, MessageSquare } from "lucide-react";
import { parseCSV, extractTags, extractCategories } from "@/utils/csvParser";
import { Publication, UserType } from "@/types/publication";
import AIChat from "@/components/AIChat";
import { enhanceContentForUser } from "@/utils/aiEnhancer";

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [enhancedAbstract, setEnhancedAbstract] = useState<string>("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [userType, setUserType] = useState<UserType>("explorer");

  useEffect(() => {
    const type = localStorage.getItem("userType") as UserType;
    if (type) setUserType(type);

    parseCSV().then((data) => {
      if (id) {
        const pub = data[parseInt(id)];
        setPublication(pub);
      }
    });
  }, [id]);

  useEffect(() => {
    if (publication && !enhancedAbstract) {
      setIsEnhancing(true);
      enhanceContentForUser(publication.abstract, userType)
        .then(setEnhancedAbstract)
        .finally(() => setIsEnhancing(false));
    }
  }, [publication, userType]);

  if (!publication) {
    return (
      <div className="min-h-screen flex items-center justify-center dynamic-background">
        <p className="text-muted-foreground">Loading publication...</p>
      </div>
    );
  }

  const tags = extractTags(publication);
  const categories = extractCategories(publication);

  // Parse timeline from timeline_components
  const parseTimeline = () => {
    try {
      if (publication.timeline_components) {
        const timeline = JSON.parse(publication.timeline_components);
        return [
          { title: "Publication Date", description: `Published ${timeline.month}/${timeline.day}/${timeline.year}`, year: timeline.year },
          { title: "Study Period", description: `Research conducted in ${timeline.year}`, year: timeline.year },
          { title: "Data Collection", description: publication.abstract.substring(0, 100) + "...", year: timeline.year },
        ];
      }
    } catch (e) {
      console.error("Error parsing timeline:", e);
    }
    return [
      { title: "Publication", description: `Published on ${publication.date}`, year: publication.timeline_year },
      { title: "Research Phase", description: publication.abstract.substring(0, 100) + "...", year: publication.timeline_year },
    ];
  };

  const timelineEvents = parseTimeline();

  // Parse entities for knowledge graph
  const parseEntities = () => {
    if (publication.entities) {
      return publication.entities.split(';').map(e => e.trim()).filter(Boolean).slice(0, 5);
    }
    return [];
  };

  const entities = parseEntities();

  // Tailor interface based on user type
  const getUserTailoredTitle = () => {
    switch (userType) {
      case "adventurer":
        return "🚀 Cool Space Discovery!";
      case "explorer":
        return "Research Discovery";
      case "scientist":
        return "Scientific Publication";
      default:
        return "Publication Details";
    }
  };

  return (
    <div className="min-h-screen pb-20 dynamic-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/search")} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
          <p className="text-sm text-muted-foreground">{getUserTailoredTitle()}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Title Section */}
          <div className="space-y-4 animate-fade-in">
            <h1 className={`font-bold leading-tight ${userType === "adventurer" ? "text-3xl" : userType === "explorer" ? "text-3xl md:text-4xl" : "text-4xl"}`}>
              {publication.title}
            </h1>
            
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cosmic-glow">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{publication.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>{publication.journal}</span>
              </div>
            </div>

            {publication.url && (
              <Button asChild variant="outline" className="cosmic-glow">
                <a href={publication.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {userType === "adventurer" ? "🔗 Check Out the Full Story!" : "View Original Publication"}
                </a>
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 gradient-card">
              <TabsTrigger value="details">
                {userType === "adventurer" ? "📖 Story" : "Details"}
              </TabsTrigger>
              <TabsTrigger value="timeline">
                {userType === "adventurer" ? "📅 Journey" : "Timeline"}
              </TabsTrigger>
              <TabsTrigger value="knowledge">
                {userType === "adventurer" ? "🌟 Facts" : "Knowledge Graph"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card className="gradient-card border-border p-6 cosmic-glow">
                <h2 className="text-2xl font-bold mb-4">
                  {userType === "adventurer" ? "What's This About?" : userType === "explorer" ? "Overview" : "Abstract"}
                </h2>
                {isEnhancing ? (
                  <div className="text-muted-foreground">Tailoring content for you...</div>
                ) : (
                  <p className={`text-muted-foreground leading-relaxed ${userType === "adventurer" ? "text-lg" : ""}`}>
                    {enhancedAbstract || publication.abstract}
                  </p>
                )}
              </Card>

              {userType !== "adventurer" && (
                <Card className="gradient-card border-border p-6">
                  <h2 className="text-2xl font-bold mb-4">Authors</h2>
                  <div className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <p className="text-muted-foreground text-sm">{publication.authors}</p>
                  </div>
                </Card>
              )}

              <Card className="gradient-card border-border p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {userType === "adventurer" ? "🏷️ Topics" : "Categories"}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge key={category} className="bg-secondary text-secondary-foreground">
                      {category}
                    </Badge>
                  ))}
                </div>
              </Card>

              {publication.topics && (
                <Card className="gradient-card border-border p-6">
                  <h2 className="text-2xl font-bold mb-4">
                    {userType === "adventurer" ? "🔬 Research Topics" : "Research Areas"}
                  </h2>
                  <p className="text-muted-foreground">{publication.topics}</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card className="gradient-card border-border p-6 cosmic-glow">
                <h2 className="text-2xl font-bold mb-6">
                  {userType === "adventurer" ? "📅 The Research Journey" : "Research Timeline"}
                </h2>
                <div className="space-y-6">
                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full bg-primary cosmic-glow" />
                        {index < timelineEvents.length - 1 && (
                          <div className="w-0.5 h-full bg-border my-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold">{event.title}</h3>
                          <Badge variant="outline" className="text-xs">{event.year}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
              <Card className="gradient-card border-border p-6 cosmic-glow">
                <h2 className="text-2xl font-bold mb-6">
                  {userType === "adventurer" ? "🌟 Key Facts & Connections" : "Knowledge Graph"}
                </h2>
                
                <div className="space-y-6">
                  {/* Main Topic */}
                  <div className="text-center">
                    <div className="inline-block p-6 rounded-lg bg-primary/20 border-2 border-primary cosmic-glow">
                      <h3 className="font-bold text-lg">{publication.title.substring(0, 60)}...</h3>
                    </div>
                  </div>

                  {/* Connected Concepts */}
                  <div className="grid md:grid-cols-2 gap-4 mt-8">
                    <div className="p-4 rounded-lg gradient-card border border-secondary">
                      <h4 className="font-semibold text-secondary mb-2">
                        {userType === "adventurer" ? "🔬 What They Studied" : "Research Areas"}
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {tags.map((tag) => (
                          <li key={tag}>• {tag}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg gradient-card border border-accent">
                      <h4 className="font-semibold text-accent mb-2">
                        {userType === "adventurer" ? "🧪 Type of Study" : "Study Types"}
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {categories.map((category) => (
                          <li key={category}>• {category}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg gradient-card border border-primary">
                      <h4 className="font-semibold text-primary mb-2">
                        {userType === "adventurer" ? "📚 Where Published" : "Journal"}
                      </h4>
                      <p className="text-sm text-muted-foreground">{publication.journal}</p>
                    </div>

                    <div className="p-4 rounded-lg gradient-card border border-primary">
                      <h4 className="font-semibold text-primary mb-2">
                        {userType === "adventurer" ? "📅 When" : "Publication Year"}
                      </h4>
                      <p className="text-sm text-muted-foreground">{publication.timeline_year}</p>
                    </div>
                  </div>

                  {/* Entities */}
                  {entities.length > 0 && (
                    <div className="p-4 rounded-lg gradient-card border border-border">
                      <h4 className="font-semibold mb-2">
                        {userType === "adventurer" ? "🎯 Important Things" : "Key Entities"}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {entities.map((entity, idx) => (
                          <Badge key={idx} variant="outline">{entity}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Keywords */}
                  {publication.keywords && (
                    <div className="p-4 rounded-lg gradient-card border border-border">
                      <h4 className="font-semibold mb-2">
                        {userType === "adventurer" ? "🔑 Magic Words" : "Key Concepts"}
                      </h4>
                      <p className="text-sm text-muted-foreground italic">{publication.keywords}</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Floating AI Chat Button */}
      <Button
        size="lg"
        className="fixed bottom-8 right-8 rounded-full w-16 h-16 cosmic-glow bg-primary hover:bg-primary/90 z-50 animate-pulse-glow"
        onClick={() => setShowAIChat(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>

      {/* AI Chat Modal */}
      {showAIChat && <AIChat onClose={() => setShowAIChat(false)} />}

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© 2025 NASA Space Apps Challenge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicationDetail;
