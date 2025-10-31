import { Card } from "@/components/ui/card";
import { Cloud, Droplets, Wind, Eye, Gauge } from "lucide-react";

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

interface WeatherCardProps {
  data: WeatherData;
}

export const WeatherCard = ({ data }: WeatherCardProps) => {
  const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

  return (
    <Card className="w-full max-w-2xl bg-gradient-card border-border shadow-warm p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-6">
        {/* Location */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-foreground">
            {data.name}, {data.sys.country}
          </h2>
          <p className="text-muted-foreground capitalize mt-2 text-lg">
            {data.weather[0].description}
          </p>
        </div>

        {/* Main Temperature */}
        <div className="flex items-center justify-center gap-6">
          <img 
            src={weatherIcon} 
            alt={data.weather[0].main}
            className="w-32 h-32 drop-shadow-lg"
          />
          <div>
            <div className="text-7xl font-bold text-foreground">
              {Math.round(data.main.temp)}°C
            </div>
            <p className="text-muted-foreground text-lg mt-2">
              Feels like {Math.round(data.main.feels_like)}°C
            </p>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-lg">
            <Droplets className="w-6 h-6 text-primary" />
            <span className="text-sm text-muted-foreground">Humidity</span>
            <span className="text-xl font-semibold text-foreground">
              {data.main.humidity}%
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-lg">
            <Wind className="w-6 h-6 text-primary" />
            <span className="text-sm text-muted-foreground">Wind Speed</span>
            <span className="text-xl font-semibold text-foreground">
              {Math.round(data.wind.speed * 3.6)} km/h
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-lg">
            <Gauge className="w-6 h-6 text-primary" />
            <span className="text-sm text-muted-foreground">Pressure</span>
            <span className="text-xl font-semibold text-foreground">
              {data.main.pressure} hPa
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 p-4 bg-secondary/50 rounded-lg">
            <Eye className="w-6 h-6 text-primary" />
            <span className="text-sm text-muted-foreground">Visibility</span>
            <span className="text-xl font-semibold text-foreground">
              {(data.visibility / 1000).toFixed(1)} km
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
