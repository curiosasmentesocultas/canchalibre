export interface SportComplexData {
  id: string;
  name: string;
  description: string;
  address: string;
  neighborhood: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  sports: string[];
  hours: {
    open: string;
    close: string;
  };
  phone: string;
  whatsapp: string;
  priceRange: string;
  features: string[];
  isOpen: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const mockSportComplexes: SportComplexData[] = [
  {
    id: "1",
    name: "Club Atlético Talleres",
    description: "Complejo deportivo con canchas de fútbol 5 y 11, vestuarios modernos y estacionamiento gratuito. Ideal para torneos y entrenamientos.",
    address: "Av. Belgrano 1250",
    neighborhood: "Centro",
    rating: 4.5,
    reviewCount: 127,
    imageUrl: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d?w=600&h=400&fit=crop",
    sports: ["Fútbol 5", "Fútbol 11", "Tenis"],
    hours: {
      open: "08:00",
      close: "23:00"
    },
    phone: "+54 388 422-1234",
    whatsapp: "5493884221234",
    priceRange: "$2.500 - $4.000/h",
    features: ["Estacionamiento", "Vestuarios", "Buffet", "Iluminación LED"],
    isOpen: true,
    coordinates: { lat: -24.183, lng: -65.302 }
  },
  {
    id: "2",
    name: "Complejo Los Andes",
    description: "Modernas canchas de básquet y vóley con piso de parquet profesional. Perfecto para competencias y práctica deportiva.",
    address: "Calle Salta 856",
    neighborhood: "Alto Comedero",
    rating: 4.2,
    reviewCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1546608235-3c0c81b63c3c?w=600&h=400&fit=crop",
    sports: ["Básquet", "Vóley", "Handball"],
    hours: {
      open: "09:00",
      close: "22:00"
    },
    phone: "+54 388 423-5678",
    whatsapp: "5493884235678",
    priceRange: "$2.000 - $3.500/h",
    features: ["Piso profesional", "Aire acondicionado", "Gradas", "Audio"],
    isOpen: true,
    coordinates: { lat: -24.185, lng: -65.299 }
  },
  {
    id: "3",
    name: "Centro Deportivo Norte",
    description: "Exclusivo club de tenis con 4 canchas de polvo de ladrillo y 2 de cemento. Clases profesionales y torneos mensuales.",
    address: "Av. Córdoba 445",
    neighborhood: "Los Perales",
    rating: 4.7,
    reviewCount: 203,
    imageUrl: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=400&fit=crop",
    sports: ["Tenis", "Pádel"],
    hours: {
      open: "07:00",
      close: "21:00"
    },
    phone: "+54 388 425-9012",
    whatsapp: "5493884259012",
    priceRange: "$3.000 - $5.500/h",
    features: ["Clases profesionales", "Alquiler de raquetas", "Pro shop", "Bar"],
    isOpen: false,
    coordinates: { lat: -24.179, lng: -65.308 }
  },
  {
    id: "4",
    name: "Skate Park Municipal",
    description: "El único skate park público de la ciudad. Rampas, rails y bowls para todos los niveles. Entrada gratuita con seguridad.",
    address: "Parque San Martín s/n",
    neighborhood: "Centro",
    rating: 4.3,
    reviewCount: 156,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
    sports: ["Skate", "BMX", "Roller"],
    hours: {
      open: "08:00",
      close: "20:00"
    },
    phone: "+54 388 420-1111",
    whatsapp: "5493884201111",
    priceRange: "Gratuito",
    features: ["Entrada libre", "Seguridad", "Iluminación", "Área de descanso"],
    isOpen: true,
    coordinates: { lat: -24.188, lng: -65.295 }
  },
  {
    id: "5",
    name: "Polideportivo El Libertador",
    description: "Complejo municipal con múltiples disciplinas. Canchas cubiertas y al aire libre con excelente mantenimiento.",
    address: "Av. El Libertador 2130",
    neighborhood: "Cuyaya",
    rating: 4.1,
    reviewCount: 94,
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
    sports: ["Fútbol 5", "Básquet", "Vóley", "Handball"],
    hours: {
      open: "08:30",
      close: "22:30"
    },
    phone: "+54 388 427-3456",
    whatsapp: "5493884273456",
    priceRange: "$1.800 - $3.200/h",
    features: ["Canchas cubiertas", "Vestuarios", "Kiosco", "WiFi gratuito"],
    isOpen: true,
    coordinates: { lat: -24.191, lng: -65.301 }
  },
  {
    id: "6",
    name: "Arena Deportiva Premium",
    description: "El complejo más moderno de la ciudad. Canchas sintéticas de última generación con sistema de riego automático.",
    address: "Ruta 34 Km 8",
    neighborhood: "Palpalá",
    rating: 4.8,
    reviewCount: 78,
    imageUrl: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&h=400&fit=crop",
    sports: ["Fútbol 5", "Fútbol 7", "Fútbol 11"],
    hours: {
      open: "07:00",
      close: "24:00"
    },
    phone: "+54 388 429-7890",
    whatsapp: "5493884297890",
    priceRange: "$3.500 - $6.000/h",
    features: ["Césped sintético", "Vestuarios premium", "Buffet gourmet", "Estacionamiento VIP"],
    isOpen: true,
    coordinates: { lat: -24.176, lng: -65.314 }
  }
];

export const neighborhoods = [
  "Todos los barrios",
  "Centro", 
  "Alto Comedero", 
  "Los Perales", 
  "Cuyaya", 
  "Palpalá",
  "Villa Jardin",
  "Barrio Norte"
];

export const sportTypes = [
  { id: "todos", name: "Todos", icon: "🏆" },
  { id: "futbol", name: "Fútbol", icon: "⚽" },
  { id: "basquet", name: "Básquet", icon: "🏀" },
  { id: "tenis", name: "Tenis", icon: "🎾" },
  { id: "voley", name: "Vóley", icon: "🏐" },
  { id: "handball", name: "Handball", icon: "🤾" },
  { id: "skate", name: "Skate", icon: "🛹" },
  { id: "padel", name: "Pádel", icon: "🏓" },
];