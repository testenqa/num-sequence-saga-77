// Audio utility functions for game sound effects

let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const playCoinDropSound = () => {
  try {
    const ctx = getAudioContext();
    
    // Resume context if it's suspended (required by browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Create multiple coin sounds for a realistic effect
    const coinSounds = 3;
    const baseFrequency = 800;
    
    for (let i = 0; i < coinSounds; i++) {
      setTimeout(() => {
        // Create oscillator for metallic tone
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Set frequency with slight variation for each coin
        const frequency = baseFrequency + (Math.random() * 200 - 100);
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.3, ctx.currentTime + 0.3);
        
        // Set type for metallic sound
        oscillator.type = 'triangle';
        
        // Envelope for coin drop effect
        const now = ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.1 * (1 - i * 0.2), now + 0.01); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // Decay
        
        // Start and stop
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        
        // Add a subtle noise burst for the "clink" sound
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let j = 0; j < noiseData.length; j++) {
          noiseData[j] = (Math.random() * 2 - 1) * 0.05;
        }
        
        const noiseSource = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        noiseSource.buffer = noiseBuffer;
        noiseSource.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        noiseGain.gain.setValueAtTime(0.3, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        noiseSource.start(now);
        noiseSource.stop(now + 0.05);
        
      }, i * 80); // Stagger each coin sound
    }
  } catch (error) {
    // Silently fail if audio is not supported
    console.warn('Audio playback failed:', error);
  }
};