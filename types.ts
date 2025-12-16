export enum UserRole {
  FARMER = 'SEHOAI',
  LANDHOLDER = 'MONGA_MOBU',
  PROVIDER = 'MOFANI',
  NONE = 'NONE'
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'counterparty' | 'konaki';
  text: string;
  timestamp: number;
  isIntervention?: boolean; // If true, this is Konaki stepping in
}

// Generalized to support both Land and Equipment
export interface Listing {
  id: string;
  category: 'LAND' | 'EQUIPMENT'; 
  district: string;
  description: string;
  holderName: string; // Landholder or Equipment Owner
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
  price?: string; 

  // Land Specifics
  area?: string; // "3 Hectares"
  type?: string; // "Masimo", "Serapa"
  soilType?: string;
  waterSource?: string;
  features?: string[];

  // Equipment Specifics
  equipmentType?: string; // "Tractor", "Harvester", "Plough"
  dailyRate?: string; // "M500 / letsatsi"
}

// Backward compatibility alias if needed, though we will update usages
export type LandListing = Listing; 

export interface Agreement {
  id: string;
  listingId: string;
  parties: {
      tenant: string; // or Client
      landholder: string; // or Provider
  };
  status: 'Draft' | 'Active' | 'Signed' | 'Expired';
  dateCreated: string;
  title: string;
  clauses: {
      duration: string;
      paymentTerms: string;
      landUse: string; // or UsageTerms
      termination: string;
  };
  // New: Digital Signatures
  signatures?: {
      tenant?: string; // Base64 image data
      landholder?: string; // Base64 image data
  };
}

export enum DisputeType {
  BOUNDARY = "Meeli (Boundary)",
  DAMAGE = "Lits'enyehelo (Damage by Animals)",
  INHERITANCE = "Lifa (Inheritance)",
  PAYMENT = "Tefo (Payment)",
  OTHER = "E 'ngoe (Other)"
}

export interface Dispute {
  id: string;
  type: DisputeType;
  title: string;
  status: 'Open' | 'Under Review' | 'Resolved';
  dateReported: string;
  description: string;
  aiAdvice?: string; 
}

export interface GeminiResponse {
  counterpartyReply?: string;
  konakiGuidance?: string;
}

export enum ViewState {
  ONBOARDING,
  DASHBOARD,
  LISTING_DETAILS,
  CHAT,
  AGREEMENTS,
  DISPUTES
}