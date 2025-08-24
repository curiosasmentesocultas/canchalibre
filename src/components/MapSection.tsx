import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Search,
  Maximize2,
  Minimize2
} from "lucide-react";

interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sport: string;
  rating: number;
  isOpen: boolean;
}

const mockLocations: MapLocation[] = [
  { id: "1", name: "Club Atlético Talleres", lat: -24.183, lng: -65.302, sport: "fútbol", rating: 4.5, isOpen: true },
  { id: "2", name: "Complejo Los Andes", lat: -24.185, lng: -65.299, sport: "básquet", rating: 4.2, isOpen: true },
  { id: "3", name: "Centro Deportivo Norte", lat: -24.179, lng: -65.308, sport: "tenis", rating: 4.7, isOpen: false },
  { id: "4", name: "Skate Park Municipal", lat: -24.188, lng: -65.295, sport: "skate", rating: 4.3, isOpen: true },
];

interface MapSectionProps {
  selectedSport: string;
  onLocationSelect: (location: MapLocation) => void;
}

const MapSection = ({ selectedSport, onLocationSelect }: MapSectionProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');

  const filteredLocations = selectedSport === 'todos' 
    ? mockLocations 
    : mockLocations.filter(location => location.sport === selectedSport);

  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      'fútbol': '⚽',
      'básquet': '🏀',
      'tenis': '🎾',
      'vóley': '🏐',
      'handball': '🤾',
      'skate': '🛹',
    };
    return icons[sport] || '🏆';
  };

  const handleLocationClick = (location: MapLocation) => {
    setSelectedLocation(location);
    onLocationSelect(location);
  };

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-[400px] lg:h-[500px]'} transition-all duration-300`}>
      {/* Map Container */}
      <div className="relative w-full h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg overflow-hidden border border-border shadow-card-custom">
        {/* Map Placeholder with Interactive Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 to-blue-100/50">
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          
          {/* Location Markers */}
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{
                left: `${50 + (location.lng + 65.3) * 2000}%`,
                top: `${50 + (location.lat + 24.18) * 2000}%`,
              }}
              onClick={() => handleLocationClick(location)}
            >
              {/* Marker */}
              <div className={`relative transition-all duration-300 hover:scale-110 ${
                selectedLocation?.id === location.id ? 'scale-125' : ''
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
                  location.isOpen 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  <span className="text-sm">{getSportIcon(location.sport)}</span>
                </div>
                
                {/* Pulse Animation for open locations */}
                {location.isOpen && (
                  <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25"></div>
                )}
              </div>

              {/* Location Info Card */}
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                <Card className="w-48 shadow-lg border-0 shadow-card-hover">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">{location.name}</h4>
                      <div className="flex items-center justify-between">
                        <Badge variant={location.isOpen ? "default" : "secondary"} className="text-xs">
                          {location.isOpen ? "Abierto" : "Cerrado"}
                        </Badge>
                        <div className="flex items-center text-xs">
                          ⭐ {location.rating}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}

          {/* Central Jujuy Label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-border">
              <h3 className="font-semibold text-primary">San Salvador de Jujuy</h3>
              <p className="text-xs text-muted-foreground">
                {filteredLocations.length} canchas encontradas
              </p>
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
            onClick={() => setMapStyle(mapStyle === 'streets' ? 'satellite' : 'streets')}
          >
            <Layers className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Search Overlay for Mobile */}
        <div className="absolute top-4 left-4 md:hidden">
          <Button
            size="sm"
            variant="outline"
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar en mapa
          </Button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-border max-w-xs">
          <h4 className="text-sm font-medium mb-2">Leyenda</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs">🏆</span>
              </div>
              <span>Abierto</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-muted rounded-full flex items-center justify-center">
                <span className="text-muted-foreground text-xs">🏆</span>
              </div>
              <span>Cerrado</span>
            </div>
          </div>
        </div>

        {/* Location Counter */}
        <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-lg px-3 py-2 shadow-sm">
          <span className="text-sm font-medium">
            {filteredLocations.length} ubicaciones
          </span>
        </div>
      </div>

      {/* Fullscreen Overlay Controls */}
      {isFullscreen && (
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="outline"
            onClick={() => setIsFullscreen(false)}
            className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
          >
            <Minimize2 className="w-4 h-4 mr-2" />
            Salir de pantalla completa
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapSection;