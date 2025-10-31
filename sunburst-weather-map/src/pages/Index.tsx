import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { WeatherCard } from "@/components/WeatherCard";
import { useToast } from "@/hooks/use-toast";
import { Cloud, Sun } from "lucide-react";

const API_KEY = "895284fb2d2c50a520ea537456963d9c"; // OpenWeatherMap free tier API key

interface WeatherData {
  name: string;
  sys: { country: string };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: { speed: number };
  visibility: number;
}

const Index = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchWeather = async (city: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error("City not found");
      }

      const data = await response.json();
      setWeatherData(data);
      toast({
        title: "Success!",
        description: `Weather data loaded for ${data.name}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not find weather data for this location. Please try again.",
        variant: "destructive",
      });
      setWeatherData(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-primary shadow-warm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-3">
            <Sun className="w-10 h-10 text-primary-foreground" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              Global Weather Tracker
            </h1>
          </div>
          <p className="text-center text-primary-foreground/90 mt-3 text-lg">
            Get real-time weather information for any city worldwide
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center gap-8">
          <SearchBar onSearch={fetchWeather} isLoading={isLoading} />

          {isLoading && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Cloud className="w-16 h-16 text-primary animate-pulse" />
              <p className="text-muted-foreground text-lg">Loading weather data...</p>
            </div>
          )}

          {!isLoading && weatherData && <WeatherCard data={weatherData} />}

          {!isLoading && !weatherData && (
            <div className="text-center py-12">
              <Cloud className="w-20 h-20 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                Search for a city to view its weather conditions
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>Powered by OpenWeatherMap API</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
