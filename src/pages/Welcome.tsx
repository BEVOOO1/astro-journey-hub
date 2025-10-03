import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Sparkles } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    
    if (userType && hasSeenWelcome === "true") {
      navigate("/search");
    }
  }, [navigate]);

  const handleGetStarted = () => {
    sessionStorage.setItem("hasSeenWelcome", "true");
    navigate("/survey");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden dynamic-background">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-foreground rounded-full animate-pulse-glow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center space-y-8 px-4 max-w-4xl mx-auto">
        <div className="animate-float">
          <Rocket className="w-24 h-24 mx-auto text-primary star-glow" />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            NASA Research Portal
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Explore groundbreaking space biology research from NASA's most ambitious missions
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-primary hover:bg-primary/90 text-primary-foreground cosmic-glow text-lg px-8 py-6 transition-all hover:scale-105"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Begin Your Journey
          </Button>
        </div>

        <div className="pt-16 text-sm text-muted-foreground">
          <p>Powered by NASA Open Science Data Repository</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-center text-xs text-muted-foreground">
        <p>© 2025 NASA Space Apps Challenge. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Welcome;
