import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Microscope, Compass, Stars } from "lucide-react";

type UserType = "scientist" | "explorer" | "adventurer";

const Survey = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<UserType | null>(null);

  const handleSelection = (type: UserType) => {
    setSelected(type);
  };

  const handleSubmit = () => {
    if (selected) {
      localStorage.setItem("userType", selected);
      sessionStorage.setItem("hasSeenWelcome", "true");
      navigate("/search");
    }
  };

  const userTypes = [
    {
      type: "scientist" as UserType,
      icon: Microscope,
      title: "Scientist",
      description: "I want detailed research data, methodology, and technical insights",
      color: "from-primary to-blue-500",
    },
    {
      type: "explorer" as UserType,
      icon: Compass,
      title: "Explorer",
      description: "I'm curious about space research and want to discover new findings",
      color: "from-secondary to-purple-500",
    },
    {
      type: "adventurer" as UserType,
      icon: Stars,
      title: "Young Adventurer",
      description: "I love space and want to learn amazing facts in a fun way",
      color: "from-accent to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 dynamic-background">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to NASA Research Portal
          </h1>
          <p className="text-xl text-muted-foreground">
            Help us customize your experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {userTypes.map(({ type, icon: Icon, title, description, color }) => (
            <Card
              key={type}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 gradient-card border-2 ${
                selected === type
                  ? "border-primary cosmic-glow"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => handleSelection(type)}
            >
              <div className="p-6 space-y-4 h-full flex flex-col items-center text-center">
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${color} flex items-center justify-center star-glow`}
                >
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-2xl font-bold">{title}</h3>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selected}
            className="bg-primary hover:bg-primary/90 text-primary-foreground cosmic-glow text-lg px-12 py-6"
          >
            Continue to Research
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Survey;
