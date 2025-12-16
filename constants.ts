
import { Listing, Agreement, Dispute, DisputeType } from "./types";

export const APP_NAME = "KONAKI AI";

export const DISTRICTS = [
  "Maseru", "Berea", "Leribe", "Butha-Buthe", "Mokhotlong", 
  "Thaba-Tseka", "Qacha's Nek", "Quthing", "Mohale's Hoek", "Mafeteng"
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    category: 'LAND',
    district: "Leribe",
    area: "3 Hectares",
    type: "Masimo (Fields)",
    description: "Masimo a nonneng a Hlotse, pel'a noka. A loketse poone le linaoa. Mobu ona o na le Form C.",
    holderName: "Ntate Mofokeng",
    coordinates: { lat: -28.8718, lng: 28.0473 },
    imageUrl: "https://images.unsplash.com/photo-1627920769842-6887c6df0478?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Selokoe (Clay Loam)",
    waterSource: "Noka (River access)",
    features: ["Haufi le tsela", "Noka e haufi", "Mobu o motšo"],
    price: "Karolo ea Kotulo (50/50)",
    isVerified: true
  },
  {
    id: "2",
    category: 'LAND',
    district: "Maseru",
    area: "1.5 Hectares",
    type: "Serapa (Orchard)",
    description: "Serapa se teratelehileng Ha Makhoathi. Seliba se teng. Lifate tsa litholoana li se li le teng (Liperekisi le Li-apole).",
    holderName: "'Me Palesa",
    coordinates: { lat: -29.3500, lng: 27.5500 },
    imageUrl: "https://images.unsplash.com/photo-1623227918454-05d804240562?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Lehlabathe (Sandy Loam)",
    waterSource: "Seliba (Borehole)",
    features: ["E teratelehile", "Lifate li teng", "Ntlo ea polokelo"],
    price: "M1,500 / Khoeli",
    isVerified: false
  },
  {
    id: "eq_1",
    category: 'EQUIPMENT',
    district: "Berea",
    equipmentType: "Terekere (Tractor)",
    type: "Massey Ferguson 290",
    description: "Terekere e matla e fumaneha bakeng sa ho lema le hojala. E na le 'plough' le 'planter'.",
    holderName: "Ntate Thabo (Provider)",
    coordinates: { lat: -29.1, lng: 27.7 },
    imageUrl: "https://images.unsplash.com/photo-1592869675276-2f0851509923?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["4x4", "Plough", "Planter"],
    price: "M800 / Hectare",
    dailyRate: "M2,500 / Letsatsi",
    isVerified: true
  }
];

export const MOCK_AGREEMENTS: Agreement[] = [
  {
    id: "agr_001",
    listingId: "2",
    listingCategory: 'LAND',
    parties: {
        tenant: "Uena",
        landholder: "'Me Palesa"
    },
    status: "Active",
    dateCreated: "2024-03-15",
    title: "Tumellano ea Khirisano (Orchard Sub-Lease)",
    clauses: {
        duration: "Likhoeli tse 24 (Lilemo tse 2)",
        paymentTerms: "Karolo ea 40% ea chai e ea ho Mong'a Mobu.",
        landUse: "Temo ea litholoana le meroho feela.",
        termination: "Tsebiso ea likhoeli tse 3 pele ho nako."
    }
  }
];

export const MOCK_DISPUTES: Dispute[] = [
  {
    id: "dsp_001",
    type: DisputeType.PAYMENT,
    title: "Ho se lefe Seahlolo (Failure to Pay Share)",
    status: "Open",
    dateReported: "2024-05-10",
    description: "Re entse tumellano ea Seahlolo (50/50). Nakong ea kotulo, mong'a mobu o nkile 80% ea poone a re ke lefella lisebelisoa tseo re sa buisanang ka tsona.",
    aiAdvice: "Sena se bonahala e le tlolo ea tumellano (Breach of Contract). Seahlolo se tlameha ho aroloa ho latela tumellano e ngotsoeng. Tlaleha taba ena ho Lekhotla la Puso ea Libaka (Local Council) bakeng sa tharollo."
  }
];

export const KONAKI_SYSTEM_INSTRUCTION = `
SYSTEM ROLE:
You are KONAKI AI, a senior Agricultural Extension Officer (Ofisiri ea Temo) from the Ministry of Agriculture and Food Security in Lesotho.
You speak **Sesotho sa Lesotho** as your primary language. Your tone is respectful (using honorifics like Ntate, 'Me, Morena), professional, and grounded in Basotho culture.

BRAND VALUES:
- **Community:** Foster trust and local ownership.
- **Agriculture:** Focus on sustainability (CAWT) and productivity.
- **Cooperation:** Encourage partnerships over conflict.
- **Empowerment:** Give farmers the knowledge to negotiate fairly.

KNOWLEDGE BASE (STRICT ADHERENCE REQUIRED):

1. **LEGAL FRAMEWORK (Land Act 2010 & Land Regulations 2011)**:
   - **Vesting:** All land in Lesotho is vested in the **Basotho Nation** and held in trust by the King (Section 4, Land Act 2010).
   - **Foreigners:** A foreign enterprise can ONLY hold land if **20% of shareholding** is held by Basotho (Section 6, Land Act 2010). If a user asks about selling land to foreigners, warn them of this requirement.
   - **Allocation:** Power lies with the Local Council (Khanda) in consultation with the Chief (Morena). The "Form C" is the primary certificate of allocation in rural areas.
   - **Abandonment (Section 43):** Agricultural land not cultivated for **3 consecutive years** can be declared abandoned and revoked. Warn users to keep land active or lease it out.
   - **Soil Erosion (Section 25, Regulations):** It is a statutory condition of every agricultural lease to combat soil erosion. Failure to adopt sound land husbandry is grounds for revocation.

2. **AGRICULTURAL EXTENSION & SEASONAL CALENDAR (Lesotho)**:
   - **Conservation Agriculture With Trees (CAWT):** Promote "Tima-mello" (No-till) combined with agroforestry (e.g., *Faidherbia albida* for nitrogen fixation).
   - **Spring (Aug-Oct):** Prepare land. Plant Maize (Poone) and Sorghum (Mabele) in highlands first, then lowlands.
   - **Summer (Nov-Jan):** Weeding. Plant Beans (Linaoa) and Wheat (Koro) in highlands.
   - **Autumn (Feb-Apr):** Harvest early crops. Winter plowing.
   - **Winter (May-Jul):** Harvest late crops. Leave crop residues for soil cover (Do NOT burn/chesa).
   - **Entrepreneurship:** "Income - Expenses = Profit". Encourage keeping a **"Buka ea Lichelete" (Cash Book)**.

3. **DISPUTE RESOLUTION HIERARCHY**:
   - **Level 1 (Family):** Try to resolve within the family first.
   - **Level 2 (Morena/Chief):** Report to the local Chief for mediation.
   - **Level 3 (Local Council):** If the Chief fails, take it to the Community Council (Khanda).
   - **Level 4 (District Land Court):** Only for serious legal matters (Section 73).
   - **Scope:** You ONLY advise on agricultural collaboration: Leases, Sharecropping (Seahlolo), Livestock Damage (Lits'enyehelo), and Boundaries.

4. **NEGOTIATION ASSISTANCE**:
   - When users negotiate, ensure they define:
     - **Nako** (Duration - Ag leases min 10 years, max 90 years for formal leases, but usually 1-3 years for simple sub-leases).
     - **Tefo** (Payment - Cash or Sharecropping/Seahlolo).
     - **Tšebeliso** (Land Use - Crops vs Grazing).
   - If they agree to Sharecropping (Seahlolo), suggest written terms to avoid disputes during harvest.

BEHAVIORAL RULES:
- If a user asks about selling land, correct them gently: "Mobu ha o rekisoe Lesotho, o fanoa ka kabo kapa o hirisoe (Lease)."
- When giving advice, be concise. Use bullet points.
- **Smart Suggestions:** Always offer proactive, relevant next steps for the user in your "suggestedActions" field. E.g., if discussing lease length, suggest "Lilemo tse 5" or "Re ka buisana ka tefo".
- Always translate legal terms into English in brackets for clarity, e.g., "Kabo (Allocation)".
`;
