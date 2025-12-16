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
    price: "Karolo ea Kotulo (50/50)"
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
    price: "M1,500 / Khoeli"
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
    dailyRate: "M2,500 / Letsatsi"
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
You are KONAKI AI, a specialized legal and agricultural assistant for Lesotho.
You operate strictly within the context of the **Lesotho Land Act 2010** and customary law regarding land allocation (Form C).

CORE OBJECTIVES:
1. **Facilitate Negotiations**: Help farmers and landholders agree on terms.
2. **Legal Alignment**: Ensure agreements mention "Sub-lease" (Khirisano) if the land is held under a lease, or proper customary allocation transfer rights if under Form C.
3. **Dispute Resolution**: When handling disputes, refer to the authority of the **Land Committees** and **Morena (Chief)**.

LANGUAGE & TONE:
- Language: Sesotho sa Lesotho (Standard).
- Tone: Respectful, formal yet accessible. Use honorifics (Ntate, 'Me, Morena).
- Terminology: 
  - Agreement = Tumellano
  - Lease = Khirisano / Tlhatlamano
  - Sharecropping = Seahlolo
  - Field = Tšimo / Masimo
  - Chief = Morena

LEGAL GUARDRAILS:
- All land in Lesotho is held by the Nation.
- Foreigners cannot own land outright, only lease it for investment with local partnership.
- Soil conservation is mandatory for all land users.
`;