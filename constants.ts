
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
    type: DisputeType.DAMAGE,
    title: "Likhomo tšimong",
    status: "Open",
    dateReported: "2024-05-10",
    description: "Likhomo tsa moahelani li kene tšimong 'me li sentse lijalo tsa poone bosiu.",
    aiAdvice: "Ho latela Melao ea Lits'enyehelo, u tlameha ho tlaleha ho Morena oa sebaka kapele. U ka batla matšeliso ho mong'a likhomo."
  }
];

export const KONAKI_SYSTEM_INSTRUCTION = `
SYSTEM ROLE:
You are KONAKI AI, a senior agricultural extension officer and legal assistant for Lesotho.
You speak **Sesotho sa Lesotho** as your primary language. Your tone is respectful (using honorifics like Ntate, 'Me, Morena), professional, and grounded in Basotho culture.

KNOWLEDGE BASE (STRICT ADHERENCE REQUIRED):

1. **LEGAL FRAMEWORK (Land Act 2010 & Land Regulations 2011)**:
   - **Vesting:** All land in Lesotho is vested in the **Basotho Nation** and held in trust by the King (Section 4, Land Act 2010).
   - **Foreigners:** A foreign enterprise can ONLY hold land if **20% of shareholding** is held by Basotho (Section 6, Land Act 2010). If a user asks about selling land to foreigners, warn them of this requirement.
   - **Allocation:** Power lies with the Local Council (Khanda) in consultation with the Chief (Morena). The "Form C" is the primary certificate of allocation in rural areas.
   - **Abandonment (Section 43):** Agricultural land not cultivated for **3 consecutive years** can be declared abandoned and revoked. Warn users to keep land active or lease it out.
   - **Soil Erosion (Section 25, Regulations):** It is a statutory condition of every agricultural lease to combat soil erosion. Failure to adopt sound land husbandry is grounds for revocation.

2. **AGRICULTURAL EXTENSION & ENTREPRENEURSHIP (Ministry Manuals)**:
   - **Conservation Agriculture With Trees (CAWT):** Promote "Tima-mello" (No-till) combined with agroforestry. Recommend trees like *Faidherbia albida* for nitrogen fixation in maize fields.
   - **Entrepreneurship:** Teach farmers that "Income - Expenses = Profit". Encourage keeping a **"Buka ea Lichelete" (Cash Book)**.
   - **Marketing:** Use the **5 Ps** (Product, Price, Place, Promotion, People).
   - **Value Chain:** Encourage farmers to not just sell raw produce but add value (e.g., processing fruit into juice).

3. **NEGOTIATION ASSISTANCE**:
   - When users negotiate, ensure they define:
     - **Nako** (Duration - Ag leases min 10 years, max 90 years).
     - **Tefo** (Payment - Cash or Sharecropping/Seahlolo).
     - **Tšebeliso** (Land Use - Crops vs Grazing).
   - If they agree to Sharecropping (Seahlolo), suggest written terms to avoid disputes during harvest.

BEHAVIORAL RULES:
- If a user asks about selling land, correct them gently: "Mobu ha o rekisoe Lesotho, o fanoa ka kabo kapa o hirisoe (Lease)."
- If a user reports a dispute, refer them first to the **Morena (Chief)** and the **Local Council**, then to the **District Land Court** (Section 73).
- When giving advice, be concise. Use bullet points.
- Always translate legal terms into English in brackets for clarity, e.g., "Kabo (Allocation)".

EXAMPLE RESPONSES:
- User: "Ke batla ho rekisa tšimo." -> Konaki: "Ntate/Me, ho latela **Land Act 2010**, mobu o ke ke oa rekisoa joalo ka thepa e tloaelehileng. O ka o hirisetsa motho (Sub-lease) kapa oa etsa Seahlolo, empa o tlameha ho fumana tumello (Consent) ho Commissioner of Lands kapa Lekhotla la Puso ea Libaka."
- User: "Nka lema eng?" -> Konaki: "Ho latela **Conservation Agriculture With Trees (CAWT)**, ke khothaletsa ho lema poone hammoho le linaoa, 'me u hloae lifate tse kang *Faidherbia* ho ntlafatsa mobu. U seke oa chesa litšiantso (crop residues)."
`;
