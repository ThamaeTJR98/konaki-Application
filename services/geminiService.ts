
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { KONAKI_SYSTEM_INSTRUCTION } from "../constants";
import { ChatMessage, GeminiResponse, Agreement, Listing, FarmerProfile, MatchInsight, CashBookEntry, DiaryEntry } from "../types";

// Initialize Gemini Client Lazily to avoid top-level crashes if env vars are missing during load
let aiInstance: GoogleGenAI | null = null;

const getApiKey = (): string => {
    let key = "";
    try {
        if (typeof process !== 'undefined' && process.env?.API_KEY) {
            key = process.env.API_KEY;
        }
    } catch (e) {}

    if (!key) {
        try {
            key = (import.meta as any)?.env?.VITE_API_KEY || "";
        } catch (e) {}
    }

    if (!key) {
        console.warn("KONAKI: Missing API Key. Please set VITE_API_KEY in your environment variables.");
    }
    return key || "";
};

const getAiClient = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: getApiKey() });
  }
  return aiInstance;
};

// --- Helper: Clean JSON ---
const cleanJson = (text: string | undefined): string => {
    if (!text) return "{}";
    // Remove markdown code blocks if present (e.g. ```json ... ```)
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return cleaned;
};

// --- Main Chat / Intelligent Matching ---
export const sendMessageToGemini = async (
  history: ChatMessage[], 
  currentUserRole: string,
  counterpartyName: string,
  contextListings: Listing[] = [] // New: Pass listings for Intelligent Matching
): Promise<GeminiResponse> => {
  
  try {
    const ai = getAiClient();
    const isAdvisorMode = counterpartyName === "Konaki Advisor";

    let contextPrompt = "";
    
    if (isAdvisorMode) {
        // --- MATCHMAKING MODE ---
        // Convert listings to a minimized string format to save tokens
        const listingsContext = JSON.stringify(contextListings.map(l => ({
               id: l.id,
               type: l.type,
               loc: l.district,
               desc: l.description,
               price: l.price || l.dailyRate,
               holder: l.holderName
        })));

        contextPrompt = `
          MODE: INTELLIGENT MATCHMAKER (ADVISOR)
          Current User Role: ${currentUserRole}
          
          TASK:
          You are acting as "Konaki Advisor". Your goal is to help the user find suitable agricultural assets (Land or Equipment) from the DATABASE below.
          
          DATABASE:
          ${listingsContext}
          
          INSTRUCTIONS:
          1. If the user asks for land/equipment, search the DATABASE.
          2. If the user's request is vague (e.g., "I need land"), ASK CLARIFYING QUESTIONS first. Ask about "setereke (district)", "mofuta oa mobu (land type)", or "budget".
          3. If you find matches, recommend them clearly: "Ke fumane tse latelang..." and list the details including their location and price.
          4. If no matches, suggest alternative districts or types.
          5. If the user is just saying hello, explain your role: "Nka u thusa ho fumana mobu kapa lisebelisoa."
          6. Speak in Sesotho sa Lesotho.
        `;
    } else {
        // --- NEGOTIATION MEDIATION MODE ---
        contextPrompt = `
          MODE: NEGOTIATION MEDIATION & EXTENSION OFFICER
          Current User Role: ${currentUserRole}
          Counterparty Name: ${counterpartyName}
          
          TASK:
          1. You are roleplaying as ${counterpartyName} to negotiate with the user.
          2. SIMULTANEOUSLY, you are "Konaki" (The Extension Officer), monitoring the chat for legal compliance and completeness.
          
          MONITORING RULES (for 'konakiGuidance'):
          - Check if these terms are defined: Price/Share (Tefo), Duration (Nako), Land Use (Tšebeliso).
          - If the User is about to agree to something unfair (e.g., verbal-only lease for >3 years), intervene.
          - If essential terms are missing, prompt the user to ask about them in 'konakiGuidance'.
          - If the negotiation is proceeding well according to Land Act 2010, 'konakiGuidance' can be null or encouraging.
        `;
    }

    const fullPrompt = `
      ${contextPrompt}

      Current Conversation History:
      ${history.map(m => {
          if (m.attachment) {
              return `${m.sender.toUpperCase()}: [Image Attachment] ${m.text}`;
          }
          return `${m.sender.toUpperCase()}: ${m.text}`;
      }).join('\n')}
      
      Respond in JSON format with 3 parts:
      1. counterpartyReply: The response from ${counterpartyName} (or Konaki Advisor).
      2. konakiGuidance: The advice from the Extension Officer (only if needed/relevant).
      3. suggestedActions: 3 short, context-aware Sesotho follow-up phrases for the user.
    `;
    
    // Check if the latest message has an image attachment
    const lastMsg = history[history.length - 1];
    const parts: any[] = [{ text: fullPrompt }];
    
    if (lastMsg && lastMsg.attachment && lastMsg.sender === 'user') {
        const base64Data = lastMsg.attachment.split(',')[1];
        if (base64Data) {
            parts.unshift({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
        }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: KONAKI_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                counterpartyReply: { type: Type.STRING },
                konakiGuidance: { type: Type.STRING, nullable: true },
                suggestedActions: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "3 short suggested replies for the user"
                }
            },
            required: ["counterpartyReply", "suggestedActions"]
        }
      }
    });

    return JSON.parse(cleanJson(response.text)) as GeminiResponse;

  } catch (error) {
    console.error("Gemini Interaction Error:", error);
    return {
      counterpartyReply: "Tšoarelo, ke bile le bothata ba marang-rang. Re ka leka hape?",
      konakiGuidance: null,
      suggestedActions: ["Leka hape", "Kea utloisisa"]
    };
  }
};

// --- Intelligent Match Ranking ---

export const calculateMatchScores = async (profile: FarmerProfile, listings: Listing[]): Promise<MatchInsight[]> => {
    try {
        const ai = getAiClient();
        
        // Prepare data for AI
        const listingsPayload = listings.map(l => ({
            id: l.id,
            desc: l.description,
            type: l.type,
            features: l.features,
            district: l.district,
            soil: l.soilType,
            water: l.waterSource
        }));

        const prompt = `
            Act as an Agricultural Matchmaker for Lesotho.
            
            Farmer Profile:
            - Wants to plant/use: ${profile.crops}
            - Budget/Capacity: ${profile.budget}
            - Preferred Districts: ${profile.preferredDistricts.join(', ')}

            Task:
            Evaluate the following listings and assign a Match Score (0-100) and a Short Reason (1 sentence in English/Sesotho mix) for each.
            High scores should match crop requirements (e.g. Maize needs Loam soil) and Location.
            
            Listings:
            ${JSON.stringify(listingsPayload)}
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            listingId: { type: Type.STRING },
                            score: { type: Type.INTEGER },
                            reason: { type: Type.STRING }
                        },
                        required: ["listingId", "score", "reason"]
                    }
                }
            }
        });

        const parsed = JSON.parse(cleanJson(response.text));
        return parsed as MatchInsight[];

    } catch (e) {
        console.error("Match Score Error", e);
        // Fallback: Return empty insights, UI should handle this gracefully (e.g. show random or default)
        return [];
    }
};

// --- Agreement Generation (Equipment & Land) ---

export const generateAgreementSummary = async (
    history: ChatMessage[], 
    counterpartyName: string, 
    listingId: string, 
    category: 'LAND' | 'EQUIPMENT'
): Promise<Agreement> => {
    try {
        const ai = getAiClient();
        
        let specificPrompt = "";
        let schemaProperties: any = {};
        let requiredFields: string[] = [];

        if (category === 'LAND') {
            specificPrompt = "Extract terms for an AGRICULTURAL LAND LEASE compliant with Land Act 2010. Terms: Duration (Min 1 year), Payment/Share (Seahlolo), Land Use, Termination Notice.";
            schemaProperties = {
                title: { type: Type.STRING, description: "Title e.g. Tumellano ea Seahlolo" },
                duration: { type: Type.STRING, description: "e.g. Lilemo tse 3" },
                paymentTerms: { type: Type.STRING, description: "e.g. 50/50 Harvest Share" },
                landUse: { type: Type.STRING, description: "e.g. Temo ea Poone" },
                termination: { type: Type.STRING, description: "e.g. Likhoeli tse 3" }
            };
            requiredFields = ["title", "duration", "paymentTerms", "landUse", "termination"];
        } else {
            specificPrompt = "Extract terms for an EQUIPMENT RENTAL. Terms: Duration/Dates, Daily Rate, Fuel Policy, Operator, Damage Liability.";
            schemaProperties = {
                title: { type: Type.STRING, description: "Title e.g. Tumellano ea Terekere" },
                duration: { type: Type.STRING, description: "e.g. Matsatsi a 2" },
                paymentTerms: { type: Type.STRING, description: "e.g. M800 ka letsatsi" },
                fuelPolicy: { type: Type.STRING, description: "e.g. Hiriso e tšela diesel" },
                operatorIncluded: { type: Type.STRING, description: "e.g. Mokhanni o teng" },
                damageLiability: { type: Type.STRING, description: "e.g. Hiriso o jara boikarabelo" },
                termination: { type: Type.STRING, description: "Return policy" }
            };
            requiredFields = ["title", "duration", "paymentTerms", "fuelPolicy", "operatorIncluded", "damageLiability", "termination"];
        }

        const prompt = `
            Analyze the negotiation history between a User and ${counterpartyName}.
            
            Task: Draft a formal agreement summary.
            Category: ${category}
            Required Terms: ${specificPrompt}
            
            Conversation:
            ${history.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}
            
            Drafting Instructions:
            - If a term was agreed, extract it.
            - If a term was discussed but vague, summarize the latest position.
            - If a term was NOT discussed, infer a reasonable standard based on Basotho custom (e.g. Termination = 3 Months Notice) OR mark as "E sa tšohloa" (To be discussed).
            - Do NOT leave fields blank.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: KONAKI_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: schemaProperties,
                    required: requiredFields
                }
            }
        });

        const parsed = JSON.parse(cleanJson(response.text));
        
        return {
            id: `agr_${Date.now()}`,
            listingId,
            listingCategory: category,
            parties: {
                tenant: "Uena",
                landholder: counterpartyName
            },
            status: "Draft",
            dateCreated: new Date().toISOString().split('T')[0],
            title: parsed.title || "Tumellano",
            clauses: {
                duration: parsed.duration || "E sa tšohloa",
                paymentTerms: parsed.paymentTerms || "E sa tšohloa",
                termination: parsed.termination || "Tsebiso ea likhoeli tse 3",
                // Land
                landUse: parsed.landUse,
                // Equipment
                fuelPolicy: parsed.fuelPolicy,
                operatorIncluded: parsed.operatorIncluded,
                damageLiability: parsed.damageLiability
            }
        };

    } catch (e) {
        console.error("Agreement Gen Error", e);
        return {
            id: `err_${Date.now()}`,
            listingId,
            listingCategory: category,
            parties: { tenant: "Uena", landholder: counterpartyName },
            status: "Draft",
            dateCreated: new Date().toISOString().split('T')[0],
            title: "Error Generating Agreement",
            clauses: {
                duration: "N/A",
                paymentTerms: "N/A",
                termination: "N/A"
            }
        };
    }
};

// --- Listing Assistant (Vision) ---

export const generateListingFromImage = async (base64Image: string, category: 'LAND' | 'EQUIPMENT'): Promise<{description: string, type: string, features: string[]}> => {
    try {
        const ai = getAiClient();
        const prompt = category === 'LAND' 
            ? "Analyze this agricultural land in Lesotho. Identify soil type (e.g. Selokoe, Lehlabathe), terrain (flat/sloped), and potential crops. Write a persuasive description in Sesotho sa Lesotho for a listing."
            : "Analyze this agricultural equipment. Identify the type (Tractor, Plough, etc), make/model if visible, and condition. Write a persuasive description in Sesotho sa Lesotho for a listing.";
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    { inlineData: { mimeType: "image/jpeg", data: base64Image } },
                    { text: prompt }
                ]
            },
            config: {
                systemInstruction: KONAKI_SYSTEM_INSTRUCTION,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        suggestedType: { type: Type.STRING, description: "Short type e.g. Masimo or Terekere" },
                        features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 tags e.g. 'Mobu o motso', 'Haufi le tsela'" }
                    },
                    required: ["description", "suggestedType", "features"]
                }
            }
        });
        
        const parsed = JSON.parse(cleanJson(response.text));
        return {
            description: parsed.description || "",
            type: parsed.suggestedType || (category === 'LAND' ? "Masimo" : "Thepa"),
            features: parsed.features || []
        };

    } catch (e) {
        console.error("Vision Error", e);
        return { description: "", type: "", features: [] };
    }
}

// --- Dispute Advice Generation (Enhanced) ---

export const generateDisputeAdvice = async (
    type: string, 
    description: string, 
    context?: { agreement?: Agreement, history?: DiaryEntry[] }
): Promise<string> => {
    try {
        const ai = getAiClient();
        
        let contextData = "";
        if (context?.agreement) {
            contextData += `
            CONTEXT - EXISTING AGREEMENT:
            Title: ${context.agreement.title}
            Status: ${context.agreement.status}
            Terms: ${JSON.stringify(context.agreement.clauses)}
            `;
        }
        
        if (context?.history && context.history.length > 0) {
            contextData += `
            CONTEXT - PARTNERSHIP WORKSPACE HISTORY (DIARY EVIDENCE):
            ${context.history.map(e => `- ${e.date} [${e.type}]: ${e.title} (${e.description})`).join('\n')}
            `;
        } else {
             contextData += `
            CONTEXT - PARTNERSHIP HISTORY: No diary records linked.
            `;
        }

        const prompt = `
            Act as a Legal Mediator and Agricultural Extension Officer for Lesotho.
            Provide detailed, objective advice for the following dispute.
            
            DISPUTE DETAILS:
            Type: ${type}
            Complaint: ${description}
            
            ${contextData}
            
            INSTRUCTIONS:
            1. Analyze the complaint against the Agreement Terms (if provided) and the Diary History (evidence).
            2. If the Diary supports one side (e.g., payments were made), mention it clearly.
            3. If the Agreement is silent on the issue, reference the Land Act 2010.
            4. Provide a step-by-step resolution path.
            5. Keep response in Sesotho sa Lesotho, but you can include English legal terms in brackets.
            6. Max 120 words.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: KONAKI_SYSTEM_INSTRUCTION
            }
        });
        
        return response.text || "Ikopanye le Morena oa sebaka.";
    } catch (e) {
        return "Tšoarelo, re sitiloe ho fumana likeletso hajoale.";
    }
}

// --- Voice & Translation Features ---

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: audioBase64 } },
          { text: "Transcribe the audio strictly into text. The language is likely Sesotho sa Lesotho. Output only the transcription text." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "";
  }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' }
                }
            }
        }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const translateText = async (text: string, targetLanguage: 'st' | 'en'): Promise<string> => {
  if (!text) return "";
  try {
    const ai = getAiClient();
    const languageName = targetLanguage === 'st' ? 'Sesotho sa Lesotho' : 'English';
    const prompt = `Translate the following text to ${languageName}. Output ONLY the translated text, with no extra formatting or explanation.\n\nText: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a highly accurate translation engine between English and Sesotho sa Lesotho. Preserve agricultural terminology.",
        temperature: 0.1
      }
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
};

// --- Cash Book Analysis ---
export const analyzeCashBook = async (entries: CashBookEntry[]): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = `
            Act as a farm financial advisor in Lesotho. Analyze the following cash book entries.
            - Total Income: M${entries.filter(e => e.type === 'INCOME').reduce((s, e) => s + e.amount, 0)}
            - Total Expenses: M${entries.filter(e => e.type === 'EXPENSE').reduce((s, e) => s + e.amount, 0)}
            
            Entries: ${JSON.stringify(entries.slice(0, 20))}
            
            Task: Provide one short, actionable piece of advice in Sesotho. Focus on the biggest expense, the main source of income, or profitability. Keep it under 40 words.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: KONAKI_SYSTEM_INSTRUCTION
            }
        });
        
        return response.text || "Tlhahlobo ha e ea fumaneha hajoale. Lekola lipalo tsa hau.";
    } catch (e) {
        console.error("Cash Book analysis error", e);
        return "Tšoarelo, re sitiloe ho etsa tlhahlobo hajoale.";
    }
};
