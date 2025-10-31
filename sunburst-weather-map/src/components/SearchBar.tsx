import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      onSearch(city.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="Enter city name or country..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-14 text-lg bg-card border-border shadow-sm focus:shadow-warm transition-shadow"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-warm hover:shadow-glow transition-all"
        >
          <Search className="w-5 h-5 mr-2" />
          Search
        </Button>
      </div>
    </form>
  );
};
