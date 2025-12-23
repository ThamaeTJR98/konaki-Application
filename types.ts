
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
  isIntervention?: boolean;
  attachment?: string;
  attachmentType?: 'image';
}

export interface Listing {
  id: string;
  category: 'LAND' | 'EQUIPMENT'; 
  district: string;
  description: string;
  holderName: string;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
  price?: string; 
  isVerified?: boolean;
  area?: string;
  type?: string;
  soilType?: string;
  waterSource?: string;
  features?: string[];
  equipmentType?: string;
  dailyRate?: string;
}

export type LandListing = Listing; 

export interface Agreement {
  id: string;
  listingId: string;
  listingCategory: 'LAND' | 'EQUIPMENT';
  parties: {
      tenant: string;
      landholder: string;
  };
  status: 'Draft' | 'Active' | 'Signed' | 'Expired' | 'Retracted';
  dateCreated: string;
  title: string;
  clauses: {
      duration: string;
      paymentTerms: string;
      termination: string;
      landUse?: string; 
      fuelPolicy?: string;
      operatorIncluded?: string;
      damageLiability?: string;
  };
  signatures?: {
      tenant?: string;
      landholder?: string;
  };
}

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
  relatedId?: string;
  icon: string;
  photoUrl?: string;
}

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
  suggestedActions?: string[];
}

export interface FarmerProfile {
  crops: string;
  budget: string;
  preferredDistricts: string[];
}

export interface MatchInsight {
  listingId: string;
  score: number;
  reason: string;
}

export enum ViewState {
  ONBOARDING,
  DASHBOARD,
  LISTING_DETAILS,
  CHAT,
  AGREEMENTS,
  DISPUTES,
  MESSAGES,
  DIARY,
  CASHBOOK
}

export type Language = 'st' | 'en';

export interface TranslationDictionary {
    [key: string]: {
        st: string;
        en: string;
    }
}
