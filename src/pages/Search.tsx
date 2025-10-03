import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search as SearchIcon, Filter, MessageSquare, Calendar } from "lucide-react";
import { parseCSV, extractTags, extractCategories, getYearFromDate } from "@/utils/csvParser";
import { Publication, UserType } from "@/types/publication";
import AIChat from "@/components/AIChat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Search = () => {
  const navigate = useNavigate();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    const type = localStorage.getItem("userType") as UserType;
    if (!type) {
      navigate("/");
    } else {
      setUserType(type);
    }

    parseCSV().then((data) => {
      setPublications(data);
      setFilteredPublications(data);
    });
  }, [navigate]);

  useEffect(() => {
    let filtered = publications;

    if (searchQuery) {
      filtered = filtered.filter(
        (pub) =>
          pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pub.keywords.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter((pub) => getYearFromDate(pub.date) === selectedYear);
    }

    if (selectedTag !== "all") {
      filtered = filtered.filter((pub) =>
        extractTags(pub).includes(selectedTag)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((pub) =>
        extractCategories(pub).includes(selectedCategory)
      );
    }

    setFilteredPublications(filtered);
  }, [searchQuery, selectedYear, selectedTag, selectedCategory, publications]);

  const allTags = Array.from(
    new Set(publications.flatMap((pub) => extractTags(pub)))
  );
  const allCategories = Array.from(
    new Set(publications.flatMap((pub) => extractCategories(pub)))
  );
  const allYears = Array.from(
    new Set(publications.map((pub) => getYearFromDate(pub.date)).filter(Boolean))
  ).sort((a, b) => parseInt(b) - parseInt(a));

  const getGreeting = () => {
    switch (userType) {
      case "scientist":
        return "Welcome, Researcher. Explore detailed scientific publications.";
      case "explorer":
        return "Welcome, Explorer. Discover fascinating space research.";
      case "adventurer":
        return "Welcome, Space Adventurer! Let's explore the cosmos!";
      default:
        return "Welcome to NASA Space Research";
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NASA Research Database
            </h1>
          </div>
          <p className="text-muted-foreground">{getGreeting()}</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-3xl mx-auto">
          <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search publications, keywords, authors..."
            className="pl-12 h-14 text-lg gradient-card border-border cosmic-glow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filters:</span>
          </div>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] gradient-card">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {allYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-[180px] gradient-card">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px] gradient-card">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {allCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(selectedYear !== "all" || selectedTag !== "all" || selectedCategory !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedYear("all");
                setSelectedTag("all");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-center text-muted-foreground">
          Found {filteredPublications.length} publication{filteredPublications.length !== 1 ? "s" : ""}
        </div>

        {/* Publications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublications.map((pub, index) => (
            <Card
              key={index}
              className="gradient-card border-border hover:border-primary/50 transition-all cursor-pointer hover:scale-105 cosmic-glow group"
              onClick={() => navigate(`/publication/${index}`)}
            >
              <div className="p-6 space-y-4">
                <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {pub.title}
                </h3>
                
                <div className="flex flex-wrap gap-2">
                  {extractTags(pub).slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {pub.abstract}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{pub.journal}</span>
                  <span>{getYearFromDate(pub.date)}</span>
                </div>
              </div>
            </Card>
          ))}
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

export default Search;
