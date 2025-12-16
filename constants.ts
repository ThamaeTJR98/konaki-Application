
import { Listing, Agreement, Dispute, DisputeType } from "./types";

export const APP_NAME = "KONAKI AI";

export const DISTRICTS = [
  "Maseru", "Berea", "Leribe", "Butha-Buthe", "Mokhotlong", 
  "Thaba-Tseka", "Qacha's Nek", "Quthing", "Mohale's Hoek", "Mafeteng"
];

export const MOCK_LISTINGS: Listing[] = [
  // --- EXISTING DATA ---
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
  },
  {
    id: "3",
    category: 'LAND',
    district: "Mafeteng",
    area: "5 Hectares",
    type: "Lakhula (Fallow Land)",
    description: "Mobu o moholo o bataletseng, o loketse koro kapa tamati. O hloka ho hloekisoa hanyane. O na le terata.",
    holderName: "Morena Letsie",
    coordinates: { lat: -29.82, lng: 27.24 },
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Selokoe (Clay)",
    waterSource: "Letamo (Dam)",
    features: ["E teratelehile", "Letamo", "Mobu o bataletseng"],
    price: "M4,000 / Selemo",
    isVerified: true
  },
  {
    id: "4",
    category: 'LAND',
    district: "Berea",
    area: "0.5 Hectares",
    type: "Setsha (Veg Garden)",
    description: "Setsha se senyenyane haufi le Teyateyaneng. Se loketse meroho (Spinach, Cabbage). Metsi a pompong a teng.",
    holderName: "Ausi Lineo",
    coordinates: { lat: -29.15, lng: 27.75 },
    imageUrl: "https://images.unsplash.com/photo-1591288599424-c1851e35560b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Seretse (Loam)",
    waterSource: "Pompo (Tap)",
    features: ["Haufi le toropo", "Metsi a pompo", "Market Access"],
    price: "Seahlolo 60/40",
    isVerified: true
  },
  {
    id: "eq_2",
    category: 'EQUIPMENT',
    district: "Leribe",
    equipmentType: "Kotulo (Harvester)",
    type: "Combine Harvester Small",
    description: "Mochini oa ho kotula koro le linaoa. O boloka nako ebile o fokotsa tahlehelo.",
    holderName: "Agri-Coop Leribe",
    coordinates: { lat: -28.9, lng: 28.0 },
    imageUrl: "https://images.unsplash.com/photo-1530267981375-f0de93bf3e94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["Wheat Kit", "Bean Kit", "Operator Included"],
    price: "M1,200 / Hectare",
    dailyRate: "M5,000 / Letsatsi",
    isVerified: true
  },
  {
    id: "5",
    category: 'LAND',
    district: "Mokhotlong",
    area: "10 Hectares",
    type: "Makhulo (Grazing)",
    description: "Makhulo a matle lithabeng bakeng sa likhomo le linku. Joang bo bongata hlabula.",
    holderName: "Community Council",
    coordinates: { lat: -29.28, lng: 29.06 },
    imageUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Mountain Loam",
    waterSource: "Noka (Senqu)",
    features: ["Lithaba", "Joang bo bongata", "Noka"],
    price: "M50 / Hlooho",
    isVerified: true
  },
  {
    id: "eq_3",
    category: 'EQUIPMENT',
    district: "Maseru",
    equipmentType: "Lipalangoang (Transport)",
    type: "Toyota Hilux + Trailer",
    description: "Koloi ea ho isa lihlahisoa 'marakeng. E nka 1 Ton. Re ka isa Maseru Market kapa Shoprite.",
    holderName: "Bokang Transport",
    coordinates: { lat: -29.32, lng: 27.50 },
    imageUrl: "https://images.unsplash.com/photo-1605218427306-72d0a0d92257?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["4x4", "Trailer", "Driver Included"],
    price: "M10 / Km",
    dailyRate: "M1,500 / Letsatsi",
    isVerified: true
  },
  {
    id: "6",
    category: 'LAND',
    district: "Mohale's Hoek",
    area: "4 Hectares",
    type: "Masimo (Fields)",
    description: "Masimo a tšoeu, a hloka manyolo. A loketse mabele (Sorghum). A haufi le tsela e kholo.",
    holderName: "Ntate Keneuoe",
    coordinates: { lat: -30.15, lng: 27.46 },
    imageUrl: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Lehlabathe (Sandy)",
    waterSource: "Pula feela (Rainfed)",
    features: ["Haufi le tsela", "Tšimo e kholo"],
    price: "Seahlolo 50/50",
    isVerified: false
  },
  {
    id: "7",
    category: 'LAND',
    district: "Butha-Buthe",
    area: "2 Hectares",
    type: "Serapa (Orchard)",
    description: "Serapa sa li-pesh (Peaches). Lifate li 50. Re hloka motho ea ka hlokomelang le ho kotula.",
    holderName: "'Me Rethabile",
    coordinates: { lat: -28.76, lng: 28.24 },
    imageUrl: "https://images.unsplash.com/photo-1526346698789-22fd84310124?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Selokoe",
    waterSource: "Seliba",
    features: ["Lifate li teng", "Ntlo ea basebetsi"],
    price: "Karolo ea 30%",
    isVerified: true
  },
  {
    id: "eq_4",
    category: 'EQUIPMENT',
    district: "Mafeteng",
    equipmentType: "Jala (Planter)",
    type: "2-Row Planter",
    description: "Planter e huloang ke likhomo kapa terekere e nyane. E loketse masimo a manyane.",
    holderName: "Mofani Thabang",
    coordinates: { lat: -29.85, lng: 27.20 },
    imageUrl: "https://images.unsplash.com/photo-1527847263472-aa5338d178b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["Manual", "Easy maintenance"],
    price: "M200 / Hectare",
    dailyRate: "M500 / Letsatsi",
    isVerified: false
  },
  {
    id: "8",
    category: 'LAND',
    district: "Quthing",
    area: "1.2 Hectares",
    type: "Setsha (Site)",
    description: "Setsha se pel'a noka ea Tele. Se na le monyetla oa ho nosetsa. Se loketse garlic kapa onion.",
    holderName: "Ntate Pule",
    coordinates: { lat: -30.40, lng: 27.70 },
    imageUrl: "https://images.unsplash.com/photo-1599587402633-8743122c60e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Seretse (Alluvial)",
    waterSource: "Noka (River)",
    features: ["Irrigation potential", "Mobu o nonneng"],
    price: "M2,000 / Selemo",
    isVerified: true
  },
  
  // --- NEW ADDITIONS FOR DEMO ---
  {
    id: "eq_5",
    category: 'EQUIPMENT',
    district: "Thaba-Tseka",
    equipmentType: "Drone",
    type: "DJI Agras T10",
    description: "Drone ea ho fafatsa meriana (Crop Spraying). E sebetsa hantle libakeng tse thata ho fihla lithabeng. Re na le pilot.",
    holderName: "Highland Tech Co-op",
    coordinates: { lat: -29.52, lng: 28.60 },
    imageUrl: "https://images.unsplash.com/photo-1508614589041-895b8c9d7ef5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["Precision Spraying", "Pilot Included", "GPS Mapping"],
    price: "M300 / Hectare",
    dailyRate: "M3,500 / Letsatsi",
    isVerified: true
  },
  {
    id: "9",
    category: 'LAND',
    district: "Leribe",
    area: "8 Hectares",
    type: "Masimo (Commercial)",
    description: "Masimo a maholo a kopaneng Hlotse. A loketse poone ea khoebo. Motlakase o teng bakeng sa pivot irrigation.",
    holderName: "Leribe Agri-Business",
    coordinates: { lat: -28.85, lng: 28.02 },
    imageUrl: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Selokoe (Clay Loam)",
    waterSource: "Borehole & River",
    features: ["Motlakase", "Pivot Ready", "Warehouse"],
    price: "M10,000 / Selemo",
    isVerified: true
  },
  {
    id: "eq_6",
    category: 'EQUIPMENT',
    district: "Maseru",
    equipmentType: "Terekere",
    type: "John Deere 5075E",
    description: "Terekere e ncha e nang le disc harrow le planter ea 4-row. E loketse lihoai tse kholo.",
    holderName: "Molefi Equipment",
    coordinates: { lat: -29.38, lng: 27.52 },
    imageUrl: "https://images.unsplash.com/photo-1562600293-6c9066603775?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["4x4 Cab", "Disc Harrow", "4-Row Planter"],
    price: "M900 / Hectare",
    dailyRate: "M2,800 / Letsatsi",
    isVerified: true
  },
  {
    id: "10",
    category: 'LAND',
    district: "Qacha's Nek",
    area: "2 Hectares",
    type: "Serapa (Fruit)",
    description: "Serapa sa li-apole le li-chery se hlokang tlhokomelo. Se na le terata e ntle. Metsi a teng a tsoang thabeng.",
    holderName: "Ntate Sempe",
    coordinates: { lat: -30.11, lng: 28.68 },
    imageUrl: "https://images.unsplash.com/photo-1596627679624-997232230722?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Lehlabathe",
    waterSource: "Gravity fed",
    features: ["Micro-climate", "High Value Crops", "Fenced"],
    price: "Karolo ea 40%",
    isVerified: false
  },
  {
    id: "eq_7",
    category: 'EQUIPMENT',
    district: "Mohale's Hoek",
    equipmentType: "Lipalangoang",
    type: "Refrigerated Truck (3 Ton)",
    description: "Teraka e batang (Fridge) ea ho isa meroho le litholoana Gauteng kapa Maseru. E boloka boleng ba lijalo.",
    holderName: "Fresh Logistics",
    coordinates: { lat: -30.14, lng: 27.48 },
    imageUrl: "https://images.unsplash.com/photo-1586769852044-692d6e37d67e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["Refrigerated", "Cross-border Permit", "Driver"],
    price: "M15 / Km",
    dailyRate: "M2,500 / Letsatsi",
    isVerified: true
  },
  {
    id: "11",
    category: 'LAND',
    district: "Thaba-Tseka",
    area: "15 Hectares",
    type: "Makhulo (Grazing)",
    description: "Makhulo a phela hantle a nang le lesaka la linku. A loketse mohlape oa boea (Wool & Mohair).",
    holderName: "Wool Growers Assoc.",
    coordinates: { lat: -29.50, lng: 28.58 },
    imageUrl: "https://images.unsplash.com/photo-1484557985045-6f5e98487c9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Mountain",
    waterSource: "Stream",
    features: ["Lesaka (Shed)", "Dipping Tank", "Shepherd Hut"],
    price: "M20 / Nku",
    isVerified: true
  },
  {
    id: "eq_8",
    category: 'EQUIPMENT',
    district: "Berea",
    equipmentType: "Processing",
    type: "Mobile Thresher",
    description: "Mochini o phulayo koro le linaoa. Re tla masimong a hau. O sebetsa ka potlako.",
    holderName: "Teyateyaneng Services",
    coordinates: { lat: -29.13, lng: 27.78 },
    imageUrl: "https://images.unsplash.com/photo-1595246755694-82e70e3eb447?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    features: ["Diesel Engine", "Mobile", "High Capacity"],
    price: "M5 / Mokotla",
    dailyRate: "M800 / Letsatsi",
    isVerified: false
  },
  {
    id: "12",
    category: 'LAND',
    district: "Maseru",
    area: "0.2 Hectares",
    type: "Greenhouse",
    description: "Tunnel ea tamati le pepere e Ha Foso. E na le drip irrigation. E hloka feela peo le mosebetsi.",
    holderName: "Mme Retsepile",
    coordinates: { lat: -29.29, lng: 27.53 },
    imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    soilType: "Potting Mix",
    waterSource: "Tank",
    features: ["2 Tunnels", "Drip Irrigation", "Secure"],
    price: "M3,000 / Sehleng",
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
  },
  {
    id: "agr_002",
    listingId: "eq_1",
    listingCategory: 'EQUIPMENT',
    parties: {
        tenant: "Ntate Katiso",
        landholder: "Ntate Thabo (Provider)"
    },
    status: "Signed",
    dateCreated: "2024-05-20",
    title: "Tumellano ea Khiro ea Terekere",
    clauses: {
        duration: "Matsatsi a 3 (May 22 - May 24)",
        paymentTerms: "M2,500 ka letsatsi. Deposit ea M1,000.",
        fuelPolicy: "Hiriso o tlatsa tanka ha a qeta.",
        operatorIncluded: "Mokhanni o teng (Ntate John).",
        damageLiability: "Provider o jara boikarabelo ba enjene, Hiriso o jara lithaere.",
        termination: "Cancellation e hloka tsebiso ea lihora tse 24."
    },
    signatures: {
        tenant: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Signature_sample.svg", // Mock sig
        landholder: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Signature_sample.svg" // Mock sig
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
  },
  {
    id: "dsp_002",
    type: DisputeType.DAMAGE,
    title: "Likhomo li jele poone (Livestock Damage)",
    status: "Resolved",
    dateReported: "2024-02-15",
    description: "Likhomo tsa moahelani li kene tšimong e sirelelitsoeng 'me tsa senya 20% ea lijalo.",
    aiAdvice: "Ho latela Land Act 2010, mong'a liphoofolo o jara boikarabelo ba lits'enyehelo. Morena o lokela ho lekanyetsa tefo ea ts'enyehelo (assessment of damages)."
  },
  {
    id: "dsp_003",
    type: DisputeType.BOUNDARY,
    title: "Qabang ea Meeli (Boundary Dispute)",
    status: "Under Review",
    dateReported: "2024-06-01",
    description: "Moahelani o lema ho kena tšimong ea ka ka limithara tse 2. O re 'mapa oa khale o bontša joalo.",
    aiAdvice: "Litsekisano tsa meeli li rarolloa ke Komiti ea Kabo ea Mobu (Land Allocation Committee) le Morena. Kopa tlhahlobo ea meeli e molaong (re-adjudication)."
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
