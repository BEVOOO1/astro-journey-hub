import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search as SearchIcon, Filter, MessageSquare, Calendar, X } from "lucide-react";
import { parseCSV, extractTags, extractCategories } from "@/utils/csvParser";
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
  const [selectedJournal, setSelectedJournal] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [userType, setUserType] = useState<UserType | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const type = localStorage.getItem("userType") as UserType;
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    
    if (!type || !hasSeenWelcome) {
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

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (pub) =>
          pub.title.toLowerCase().includes(query) ||
          pub.abstract.toLowerCase().includes(query) ||
          pub.keywords.toLowerCase().includes(query) ||
          pub.topics.toLowerCase().includes(query) ||
          pub.authors.toLowerCase().includes(query)
      );
    }

    // Year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter((pub) => pub.timeline_year === selectedYear);
    }

    // Tag filter
    if (selectedTag !== "all") {
      filtered = filtered.filter((pub) =>
        extractTags(pub).includes(selectedTag)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((pub) =>
        extractCategories(pub).includes(selectedCategory)
      );
    }

    // Journal filter
    if (selectedJournal !== "all") {
      filtered = filtered.filter((pub) => pub.journal === selectedJournal);
    }

    // Author filter
    if (selectedAuthor !== "all") {
      filtered = filtered.filter((pub) => 
        pub.authors.toLowerCase().includes(selectedAuthor.toLowerCase())
      );
    }

    setFilteredPublications(filtered);
  }, [searchQuery, selectedYear, selectedTag, selectedCategory, selectedJournal, selectedAuthor, publications]);

  // Extract unique values for filters
  const allTags = Array.from(
    new Set(publications.flatMap((pub) => extractTags(pub)))
  ).sort();
  
  const allCategories = Array.from(
    new Set(publications.flatMap((pub) => extractCategories(pub)))
  ).sort();
  
  const allYears = Array.from(
    new Set(publications.map((pub) => pub.timeline_year).filter(Boolean))
  ).sort((a, b) => parseInt(b) - parseInt(a));
  
  const allJournals = Array.from(
    new Set(publications.map((pub) => pub.journal).filter(Boolean))
  ).sort();
  
  // Extract first author from author list for filtering
  const allAuthors = Array.from(
    new Set(
      publications
        .map((pub) => {
          const firstAuthor = pub.authors.split(';')[0]?.split(',')[0]?.trim();
          return firstAuthor;
        })
        .filter(Boolean)
    )
  ).sort();

  const clearAllFilters = () => {
    setSelectedYear("all");
    setSelectedTag("all");
    setSelectedCategory("all");
    setSelectedJournal("all");
    setSelectedAuthor("all");
    setSearchQuery("");
  };

  const hasActiveFilters = 
    selectedYear !== "all" || 
    selectedTag !== "all" || 
    selectedCategory !== "all" ||
    selectedJournal !== "all" ||
    selectedAuthor !== "all" ||
    searchQuery !== "";

  const getGreeting = () => {
    switch (userType) {
      case "scientist":
        return "Welcome, Researcher. Explore detailed scientific publications.";
      case "explorer":
        return "Welcome, Explorer. Discover fascinating space research.";
      case "adventurer":
        return "Hey Space Adventurer! Let's explore cool space discoveries! 🚀";
      default:
        return "Welcome to NASA Research Portal";
    }
  };

  const getResultsText = () => {
    const count = filteredPublications.length;
    switch (userType) {
      case "adventurer":
        return `Found ${count} amazing space ${count === 1 ? "discovery" : "discoveries"}! 🌟`;
      case "explorer":
        return `Found ${count} research ${count === 1 ? "publication" : "publications"}`;
      case "scientist":
        return `${count} research ${count === 1 ? "publication" : "publications"} found`;
      default:
        return `Found ${count} ${count === 1 ? "publication" : "publications"}`;
    }
  };

  return (
    <div className="min-h-screen pb-20 dynamic-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              NASA Research Portal
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
            placeholder={
              userType === "adventurer"
                ? "Search for cool space stuff..."
                : "Search publications, keywords, authors..."
            }
            className="pl-12 h-14 text-lg gradient-card border-border animate-search-glow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Toggle Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gradient-card"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? "Hide Filters" : "Show Filters"}
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[selectedYear, selectedTag, selectedCategory, selectedJournal, selectedAuthor].filter(f => f !== "all").length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="max-w-5xl mx-auto">
            <Card className="gradient-card border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">Filter Options</span>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Publication Year</label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="gradient-card">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Years" />
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
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Research Tag</label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="gradient-card">
                      <SelectValue placeholder="All Tags" />
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
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="gradient-card">
                      <SelectValue placeholder="All Categories" />
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
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Journal</label>
                  <Select value={selectedJournal} onValueChange={setSelectedJournal}>
                    <SelectTrigger className="gradient-card">
                      <SelectValue placeholder="All Journals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Journals</SelectItem>
                      {allJournals.map((journal) => (
                        <SelectItem key={journal} value={journal}>
                          {journal.length > 40 ? journal.substring(0, 40) + "..." : journal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-muted-foreground mb-2 block">Author</label>
                  <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                    <SelectTrigger className="gradient-card">
                      <SelectValue placeholder="All Authors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      {allAuthors.map((author) => (
                        <SelectItem key={author} value={author}>
                          {author}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Results Count */}
        <div className="text-center">
          <p className={`${userType === "adventurer" ? "text-lg font-semibold" : "text-muted-foreground"}`}>
            {getResultsText()}
          </p>
        </div>

        {/* Publications Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPublications.map((pub, index) => {
            const tags = extractTags(pub);
            return (
              <Card
                key={index}
                className="gradient-card border-border hover:border-primary/50 transition-all cursor-pointer hover:scale-105 cosmic-glow group animate-fade-in"
                onClick={() => navigate(`/publication/${publications.indexOf(pub)}`)}
              >
                <div className="p-6 space-y-4">
                  <h3 className={`font-bold line-clamp-2 group-hover:text-primary transition-colors ${
                    userType === "adventurer" ? "text-lg" : "text-lg"
                  }`}>
                    {pub.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, userType === "scientist" ? 4 : 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <p className={`text-sm text-muted-foreground line-clamp-3 ${
                    userType === "adventurer" ? "text-base" : ""
                  }`}>
                    {pub.abstract}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate mr-2">{pub.journal.substring(0, 30)}{pub.journal.length > 30 ? "..." : ""}</span>
                    <span className="flex-shrink-0">{pub.timeline_year}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredPublications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {userType === "adventurer" 
                ? "Oops! No space discoveries found. Try different search words! 🔍" 
                : "No publications found matching your criteria. Try adjusting your filters."}
            </p>
          </div>
        )}
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

export default Search;
