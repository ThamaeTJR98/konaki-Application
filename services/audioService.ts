// Decodes and plays raw PCM audio from Gemini API
export const playPcmAudio = async (base64Audio: string, sampleRate = 24000) => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContextClass({ sampleRate });

  // Decode Base64 to binary
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert PCM 16-bit LE to Float32
  // We use Int16Array to interpret the bytes as 16-bit signed integers
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length;
  
  // Create an AudioBuffer
  const buffer = audioContext.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Normalize to [-1.0, 1.0]
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }

  // Play the buffer
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  source.start();

  // Return a promise that resolves when audio finishes
  return new Promise<void>((resolve) => {
    source.onended = () => {
      resolve();
      audioContext.close(); // Cleanup
    };
  });
};
