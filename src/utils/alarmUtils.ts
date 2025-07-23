
// Create audio context and oscillator for alarm sound
export class AlarmSound {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Audio context not supported:', error);
    }
  }

  start() {
    if (!this.audioContext || this.isPlaying) return;

    this.isPlaying = true;
    this.playBeepSequence();
  }

  private playBeepSequence() {
    if (!this.isPlaying || !this.audioContext) return;

    try {
      // Create new oscillator for each beep
      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      // Create urgent alarm sound - alternating high and low frequencies
      this.oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      this.oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
      this.oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.4);
      
      // Higher volume for more attention
      this.gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.6);

      this.oscillator.type = 'square'; // More harsh sound for urgency
      this.oscillator.start();
      
      // Stop after 600ms
      this.oscillator.stop(this.audioContext.currentTime + 0.6);

      // Schedule next beep sequence
      this.intervalId = window.setTimeout(() => {
        if (this.isPlaying) {
          this.playBeepSequence();
        }
      }, 1000); // Repeat every second

    } catch (error) {
      console.error('Error playing alarm:', error);
    }
  }

  stop() {
    this.isPlaying = false;
    
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }

    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (error) {
        // Oscillator might already be stopped
      }
      this.oscillator = null;
    }
    
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  isCurrentlyPlaying() {
    return this.isPlaying;
  }
}

export const alarmSound = new AlarmSound();
