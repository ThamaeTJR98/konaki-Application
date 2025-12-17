
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
  attachment?: string; // Base64 image string
  attachmentType?: 'image';
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
  isVerified?: boolean; // New: Form C Verification Status

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
  listingCategory: 'LAND' | 'EQUIPMENT';
  parties: {
      tenant: string; // or Client
      landholder: string; // or Provider
  };
  status: 'Draft' | 'Active' | 'Signed' | 'Expired' | 'Retracted';
  dateCreated: string;
  title: string;
  clauses: {
      // Shared
      duration: string; // Length of lease OR Dates of rental
      paymentTerms: string; // Share split OR Daily Rate
      termination: string; // Notice period OR Return policy
      
      // Land Specific
      landUse?: string; 
      
      // Equipment Specific
      fuelPolicy?: string; // Who buys diesel?
      operatorIncluded?: string; // Is the driver included?
      damageLiability?: string; // Who pays for breakage?
  };
  // Digital Signatures
  signatures?: {
      tenant?: string; // Base64 image data
      landholder?: string; // Base64 image data
  };
}

// Updated to align with Land Act 2010 classifications
export enum DisputeType {
  BOUNDARY = "Meeli (Boundary Dispute - Sec 50)",
  DAMAGE = "Lits'enyehelo (Damage to Crops)",
  INHERITANCE = "Lifa (Inheritance - Sec 43)",
  ALLOCATION = "Kabo (Allocation/Title Dispute)",
  PAYMENT = "Tefo/Lichelete (Payment Dispute)",
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

export type DiaryEntryType = 'AGREEMENT_SIGNED' | 'PLANTING' | 'INPUT_PURCHASE' | 'HARVEST' | 'SALE' | 'OBSERVATION';

export interface DiaryEntry {
  id: string;
  date: string;
  type: DiaryEntryType;
  title: string;
  description?: string;
  relatedId?: string; // e.g., agreement.id
  icon: string; // Emoji
  photoUrl?: string; // Base64 image
}

// FIX: Add CashBookEntry interface
export interface CashBookEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
}

export interface GeminiResponse {
  counterpartyReply?: string;
  konakiGuidance?: string;
  suggestedActions?: string[]; // Dynamic smart suggestions
}

export interface FarmerProfile {
  crops: string; // e.g. "Poone, Linaoa"
  budget: string; // e.g. "M5000"
  preferredDistricts: string[];
}

export interface MatchInsight {
  listingId: string;
  score: number; // 0-100
  reason: string; // "Good soil for maize"
}

export enum ViewState {
  ONBOARDING,
  DASHBOARD,
  LISTING_DETAILS,
  CHAT,
  AGREEMENTS,
  DISPUTES,
  MESSAGES,
  DIARY
}

export type Language = 'st' | 'en';

export interface TranslationDictionary {
    [key: string]: {
        st: string;
        en: string;
    }
}
