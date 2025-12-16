import { GoogleGenAI, Type, Modality } from "@google/genai";
import { KONAKI_SYSTEM_INSTRUCTION } from "../constants";
import { ChatMessage, GeminiResponse, Agreement } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const sendMessageToGemini = async (
  history: ChatMessage[], 
  currentUserRole: string,
  counterpartyName: string
): Promise<GeminiResponse> => {
  
  try {
    const contextPrompt = `
      User Role: ${currentUserRole}
      Counterparty Name: ${counterpartyName}
      
      Current Conversation History:
      ${history.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}
      
      Respond in JSON format.
      If the user is proposing terms that violate the Land Act 2010 (e.g., selling land outright), intervene in 'konakiGuidance'.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contextPrompt,
      config: {
        systemInstruction: KONAKI_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                counterpartyReply: { type: Type.STRING },
                konakiGuidance: { type: Type.STRING, nullable: true }
            },
            required: ["counterpartyReply"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response");
    return JSON.parse(jsonText) as GeminiResponse;

  } catch (error) {
    console.error("Gemini Interaction Error:", error);
    return {
      counterpartyReply: "Tšoarelo, ke bile le bothata ba marang-rang. Re ka leka hape?",
      konakiGuidance: null
    };
  }
};

// --- Agreement Generation ---

export const generateAgreementSummary = async (history: ChatMessage[], counterpartyName: string, listingId: string): Promise<Agreement> => {
    try {
        const prompt = `
            Analyze the negotiation history between a User (Tenant) and ${counterpartyName} (Landholder).
            Extract specific legal terms for a Lesotho agricultural lease/sub-lease.
            
            Conversation:
            ${history.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

            Output strict JSON matching the schema. 
            If a term was not discussed, use "Ha ea buelloa" (Not discussed).
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Title e.g. Tumellano ea Seahlolo" },
                        duration: { type: Type.STRING, description: "Length of lease e.g. Lilemo tse 3" },
                        paymentTerms: { type: Type.STRING, description: "Rent or Share split e.g. 50/50 Harvest Share" },
                        landUse: { type: Type.STRING, description: "Crops or purpose e.g. Temo ea Poone" },
                        termination: { type: Type.STRING, description: "Notice period e.g. Likhoeli tse 3" }
                    },
                    required: ["title", "duration", "paymentTerms", "landUse", "termination"]
                }
            }
        });

        const parsed = JSON.parse(response.text || "{}");
        
        return {
            id: `agr_${Date.now()}`,
            listingId,
            parties: {
                tenant: "Uena",
                landholder: counterpartyName
            },
            status: "Draft",
            dateCreated: new Date().toISOString().split('T')[0],
            title: parsed.title || "Tumellano ea Khirisano",
            clauses: {
                duration: parsed.duration || "Ha ea buelloa",
                paymentTerms: parsed.paymentTerms || "Ha ea buelloa",
                landUse: parsed.landUse || "Temo",
                termination: parsed.termination || "Ho latela molao"
            }
        };

    } catch (e) {
        console.error("Agreement Gen Error", e);
        return {
            id: `err_${Date.now()}`,
            listingId,
            parties: { tenant: "Uena", landholder: counterpartyName },
            status: "Draft",
            dateCreated: new Date().toISOString().split('T')[0],
            title: "Error Generating Agreement",
            clauses: {
                duration: "N/A",
                paymentTerms: "N/A",
                landUse: "N/A",
                termination: "N/A"
            }
        };
    }
};

// --- Dispute Advice Generation ---

export const generateDisputeAdvice = async (type: string, description: string): Promise<string> => {
    try {
        const prompt = `
            Provide brief, preliminary legal advice (in Sesotho) for a land dispute in Lesotho.
            Dispute Type: ${type}
            Description: ${description}
            
            Reference the Land Act 2010 or role of the Chief (Morena) where applicable.
            Keep it under 50 words.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text || "Ikopanye le Morena oa sebaka.";
    } catch (e) {
        return "Tšoarelo, re sitiloe ho fumana likeletso hajoale.";
    }
}


// --- Voice Features ---

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  try {
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
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text }] },
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