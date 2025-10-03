import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Calendar, Users, BookOpen, MessageSquare } from "lucide-react";
import { parseCSV, extractTags, extractCategories, getYearFromDate } from "@/utils/csvParser";
import { Publication } from "@/types/publication";
import AIChat from "@/components/AIChat";

const PublicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    parseCSV().then((data) => {
      if (id) {
        const pub = data[parseInt(id)];
        setPublication(pub);
      }
    });
  }, [id]);

  if (!publication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading publication...</p>
      </div>
    );
  }

  const tags = extractTags(publication);
  const categories = extractCategories(publication);
  const year = getYearFromDate(publication.date);

  // Extract timeline events from sections
  const timelineEvents = publication.sections
    .split(" | ")
    .filter(Boolean)
    .map((section, index) => ({
      title: section.split(":")[0] || `Section ${index + 1}`,
      description: section.split(":")[1]?.substring(0, 100) || "",
    }));

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/search")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Title Section */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">{publication.title}</h1>
            
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
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
                  View Original Publication
                </a>
              </Button>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 gradient-card">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="knowledge">Knowledge Graph</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card className="gradient-card border-border p-6">
                <h2 className="text-2xl font-bold mb-4">Abstract</h2>
                <p className="text-muted-foreground leading-relaxed">{publication.abstract}</p>
              </Card>

              <Card className="gradient-card border-border p-6">
                <h2 className="text-2xl font-bold mb-4">Authors</h2>
                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <p className="text-muted-foreground">{publication.authors}</p>
                </div>
              </Card>

              <Card className="gradient-card border-border p-6">
                <h2 className="text-2xl font-bold mb-4">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge key={category} className="bg-secondary text-secondary-foreground">
                      {category}
                    </Badge>
                  ))}
                </div>
              </Card>

              {publication.doi && (
                <Card className="gradient-card border-border p-6">
                  <h2 className="text-2xl font-bold mb-4">DOI</h2>
                  <p className="text-sm text-muted-foreground break-all">{publication.doi}</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card className="gradient-card border-border p-6">
                <h2 className="text-2xl font-bold mb-6">Research Timeline</h2>
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
                        <h3 className="font-bold mb-2">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.description}...</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-4">
              <Card className="gradient-card border-border p-6">
                <h2 className="text-2xl font-bold mb-6">Knowledge Graph</h2>
                
                <div className="space-y-6">
                  {/* Main Topic */}
                  <div className="text-center">
                    <div className="inline-block p-6 rounded-lg bg-primary/20 border-2 border-primary cosmic-glow">
                      <h3 className="font-bold text-lg">{publication.title.substring(0, 50)}...</h3>
                    </div>
                  </div>

                  {/* Connected Concepts */}
                  <div className="grid md:grid-cols-2 gap-4 mt-8">
                    <div className="p-4 rounded-lg gradient-card border border-secondary">
                      <h4 className="font-semibold text-secondary mb-2">Research Areas</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {tags.map((tag) => (
                          <li key={tag}>• {tag}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg gradient-card border border-accent">
                      <h4 className="font-semibold text-accent mb-2">Study Types</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {categories.map((category) => (
                          <li key={category}>• {category}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg gradient-card border border-primary">
                      <h4 className="font-semibold text-primary mb-2">Journal</h4>
                      <p className="text-sm text-muted-foreground">{publication.journal}</p>
                    </div>

                    <div className="p-4 rounded-lg gradient-card border border-primary">
                      <h4 className="font-semibold text-primary mb-2">Publication Year</h4>
                      <p className="text-sm text-muted-foreground">{year}</p>
                    </div>
                  </div>

                  {/* Keywords Cloud */}
                  {publication.keywords && (
                    <div className="p-4 rounded-lg gradient-card border border-border">
                      <h4 className="font-semibold mb-2">Key Concepts</h4>
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
        className="fixed bottom-8 right-8 rounded-full w-16 h-16 cosmic-glow bg-primary hover:bg-primary/90 z-50"
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
