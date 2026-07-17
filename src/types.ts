export type VehicleType = "gasoline" | "diesel" | "hybrid" | "electric";

export interface DiagnosisResult {
  soundAnalysis: string;
  likelyCause: string;
  systemDetails: string;
  mechanicInstructions: string;
  ownerExplanation: string;
  severity: "Critical" | "Warning" | "Normal";
  estimatedCost: number;
  requiredParts: string[];
  estimatedTime: string;
  isSimulated?: boolean;
}

export interface CodeTranslationResult {
  code: string;
  systemDescription: string;
  mechanicGuide: string;
  ownerExplanation: string;
  severity: "Critical" | "Warning" | "Normal";
  estimatedCost: number;
  requiredParts: string[];
  isSimulated?: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  phone: string;
  date: string;
  time: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  serviceType: string;
  status: "pending" | "confirmed" | "in_progress" | "completed";
}

export interface MaintenanceHistory {
  id: string;
  date: string;
  vehicleModel: string;
  vehicleType: VehicleType;
  mileage: number;
  cost: number;
  description: string;
  partsReplaced: string[];
  reportPdfUrl?: string;
}

export interface SparePart {
  id: string;
  name: string;
  code: string;
  price: number;
  warrantyYears: number;
  category: "engine" | "electrical" | "brakes" | "filters" | "suspension";
  image: string;
  isOriginal: boolean;
  stock: number;
}

export interface WorkshopBranch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  lat: number; // For interactive visual mapping
  lng: number;
  isCertified: boolean;
  workingHours: string;
}

export interface MaintenanceContract {
  id: string;
  entityName: string;
  contractType: "silver" | "gold" | "platinum";
  startDate: string;
  durationMonths: number;
  vehicleCount: number;
  totalCost: number;
  status: "active" | "pending" | "expired";
}
