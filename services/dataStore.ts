
import { getSupabase, isOnline } from './supabaseClient';
import { Listing, Agreement, Dispute, UserRole, FarmerProfile, DiaryEntry } from '../types';

// --- KEYS ---
const KEY_LISTINGS = 'konaki_listings';
const KEY_AGREEMENTS = 'konaki_agreements';
const KEY_DISPUTES = 'konaki_disputes';
const KEY_DIARY = 'konaki_diary';
const KEY_ROLE = 'konaki_role';
const KEY_PROFILE = 'konaki_farmer_profile';

// --- HELPER: GENERIC FETCH ---
async function fetchData<T>(table: string, localKey: string, defaultData: T[]): Promise<T[]> {
    if (isOnline()) {
        try {
            const { data, error } = await getSupabase().from(table).select('content');
            if (!error && data) {
                // Map the JSON content back to objects
                const remoteData = data.map((row: any) => row.content);
                // Sync to local
                localStorage.setItem(localKey, JSON.stringify(remoteData));
                return remoteData.length > 0 ? remoteData : defaultData;
            }
        } catch (e) {
            console.warn(`Supabase fetch error for ${table}:`, e);
        }
    }
    // Fallback to local
    const local = localStorage.getItem(localKey);
    return local ? JSON.parse(local) : defaultData;
}

// --- HELPER: GENERIC SAVE ---
async function saveData<T extends { id: string }>(table: string, localKey: string, data: T[]) {
    // 1. Save Local
    localStorage.setItem(localKey, JSON.stringify(data));

    // 2. Save Remote if online
    if (isOnline()) {
        try {
            // Upsert strategy: We simply upsert the whole content as a JSON blob for this MVP
            // In a real app, you'd upsert individual rows.
            const rows = data.map(item => ({
                id: item.id,
                content: item,
                // user_id: auth.user.id // In real app, attach user ID
            }));
            
            const { error } = await getSupabase().from(table).upsert(rows);
            if (error) console.error(`Supabase save error for ${table}:`, error);
        } catch (e) {
            console.warn(`Supabase save exception for ${table}:`, e);
        }
    }
}

// --- PUBLIC API ---

export const dataStore = {
    // Role
    getRole: (): UserRole => {
        const r = localStorage.getItem(KEY_ROLE);
        return (r as UserRole) || UserRole.NONE;
    },
    setRole: (role: UserRole) => {
        localStorage.setItem(KEY_ROLE, role);
    },

    // Farmer Profile
    getFarmerProfile: (): FarmerProfile | null => {
        const p = localStorage.getItem(KEY_PROFILE);
        return p ? JSON.parse(p) : null;
    },
    setFarmerProfile: (profile: FarmerProfile) => {
        localStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
    },

    // Listings
    getListings: async (defaults: Listing[]) => fetchData('listings', KEY_LISTINGS, defaults),
    saveListings: async (items: Listing[]) => saveData('listings', KEY_LISTINGS, items),

    // Agreements
    getAgreements: async (defaults: Agreement[]) => fetchData('agreements', KEY_AGREEMENTS, defaults),
    saveAgreements: async (items: Agreement[]) => saveData('agreements', KEY_AGREEMENTS, items),

    // Disputes
    getDisputes: async (defaults: Dispute[]) => fetchData('disputes', KEY_DISPUTES, defaults),
    saveDisputes: async (items: Dispute[]) => saveData('disputes', KEY_DISPUTES, items),

    // Diary
    getDiary: async (defaults: DiaryEntry[]) => fetchData('diary', KEY_DIARY, defaults),
    saveDiary: async (items: DiaryEntry[]) => saveData('diary', KEY_DIARY, items),
};