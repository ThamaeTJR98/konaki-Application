
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { KONAKI_SYSTEM_INSTRUCTION } from "../constants";

export class LiveClient {
  private ai: GoogleGenAI;
  private session: any = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime: number = 0;
  private isConnected: boolean = false;
  
  public onVolumeUpdate: ((vol: number) => void) | null = null;

  constructor() {
    // Support both process.env (Sandbox) and import.meta.env (Vite/Vercel)
    const apiKey = process.env.API_KEY || (import.meta as any).env?.VITE_API_KEY || "";
    if (!apiKey) {
      console.warn("KONAKI Live: Missing API Key");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect(onClose: () => void) {
    if (this.isConnected) return;

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    // Reset output cursor
    this.nextStartTime = this.outputAudioContext.currentTime;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    this.session = await this.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        systemInstruction: KONAKI_SYSTEM_INSTRUCTION + "\n\nIMPORTANT: You are in VOICE mode. Keep responses extremely short (1-2 sentences). Speak naturally in Sesotho. You have access to Google Search to answer questions about Weather (Boemo ba leholimo) and Market Prices.",
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        tools: [{ googleSearch: {} }] // Enable Grounding
      },
      callbacks: {
        onopen: () => {
          console.log("Konaki Live Connected");
          this.isConnected = true;
          this.startInputStream(stream);
        },
        onmessage: (msg: LiveServerMessage) => {
          this.handleMessage(msg);
        },
        onclose: () => {
          console.log("Konaki Live Closed");
          this.isConnected = false;
          onClose();
        },
        onerror: (err) => {
          console.error("Konaki Live Error", err);
          this.disconnect();
        }
      }
    });
  }

  private startInputStream(stream: MediaStream) {
    if (!this.inputAudioContext) return;
    
    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for UI
      if (this.onVolumeUpdate) {
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
        this.onVolumeUpdate(Math.sqrt(sum / inputData.length));
      }

      // PCM 16-bit conversion
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcm16[i] = inputData[i] * 0x7fff;
      }
      
      // Base64 Encode
      const base64Data = this.arrayBufferToBase64(pcm16.buffer);

      if (this.session) {
        this.session.sendRealtimeInput({
          media: {
            mimeType: "audio/pcm;rate=16000",
            data: base64Data
          }
        });
      }
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (audioData) {
      await this.playAudioChunk(audioData);
    }
    
    if (message.serverContent?.interrupted) {
      this.interrupt();
    }
  }

  private async playAudioChunk(base64Audio: string) {
    if (!this.outputAudioContext) return;

    // Decode custom base64 to array buffer
    const audioBytes = this.base64ToArrayBuffer(base64Audio);
    
    // Create Audio Buffer manually for PCM 24000Hz 1ch
    const float32Data = new Float32Array(audioBytes.byteLength / 2);
    const dataView = new DataView(audioBytes);
    
    for (let i = 0; i < float32Data.length; i++) {
      float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
    }

    const audioBuffer = this.outputAudioContext.createBuffer(1, float32Data.length, 24000);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = this.outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioContext.destination);

    // Schedule playback
    if (this.nextStartTime < this.outputAudioContext.currentTime) {
      this.nextStartTime = this.outputAudioContext.currentTime;
    }
    
    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
  }

  private interrupt() {
    // In a full implementation, we would track and stop active source nodes.
    // For now, we reset the time cursor.
    if(this.outputAudioContext) {
        this.nextStartTime = this.outputAudioContext.currentTime;
    }
  }

  disconnect() {
    this.isConnected = false;
    
    if (this.session) {
       // this.session.close(); 
       this.session = null;
    }

    this.inputSource?.disconnect();
    this.processor?.disconnect();
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    
    this.inputSource = null;
    this.processor = null;
    this.inputAudioContext = null;
    this.outputAudioContext = null;
  }

  // --- Helpers ---

  private arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
