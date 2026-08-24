// Sound & Voice Alert Engine using Web Audio API and SpeechSynthesis

window.ApdaSoundEngine = {
  audioCtx: null,
  sirenOscillator: null,
  sirenGain: null,
  isSirenPlaying: false,
  soundMuted: false,

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  },

  // Play Disaster Warning Siren
  // [volunteer done] Persistent option supports a scramble alert without replacing the shared Web Audio siren.
  startEmergencySiren(options = {}) {
    if (this.soundMuted) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return false;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {
          // [volunteer done] Browsers may reject autoplay; the visual scramble remains actionable.
          this.stopEmergencySiren();
          window.dispatchEvent(new CustomEvent('apdasetu_siren_state', { detail: { isPlaying: false, needsGesture: true } }));
        });
      }

      if (this.isSirenPlaying) {
        return true;
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, this.audioCtx.currentTime);
      
      // Siren frequency modulation (wailing curve)
      const now = this.audioCtx.currentTime;
      for (let i = 0; i < 20; i++) {
        osc.frequency.linearRampToValueAtTime(850, now + i * 1.5 + 0.75);
        osc.frequency.linearRampToValueAtTime(450, now + i * 1.5 + 1.5);
      }

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      this.sirenOscillator = osc;
      this.sirenGain = gain;
      this.isSirenPlaying = true;

      window.dispatchEvent(new CustomEvent('apdasetu_siren_state', { detail: { isPlaying: true } }));

      // [volunteer done] Scramble sirens pulse continuously until a volunteer acts, mutes, or the request expires.
      if (!options.persistent) {
        setTimeout(() => {
          if (this.isSirenPlaying) this.stopEmergencySiren();
        }, 12000);
      }
      return true;
    } catch (e) {
      console.warn('Audio context init warning:', e);
      return false;
    }
  },

  // [volunteer done] Reuse the existing oscillator for the volunteer scramble rather than loading an audio library.
  startVolunteerScrambleSiren() {
    return this.startEmergencySiren({ persistent: true });
  },

  // [volunteer done] A user gesture can unlock sound if browser autoplay policy blocked the initial alert.
  enableEmergencyAudio() {
    this.initAudio();
    if (!this.audioCtx) return Promise.resolve(false);
    return this.audioCtx.resume().then(() => this.startVolunteerScrambleSiren()).catch(() => false);
  },

  stopEmergencySiren() {
    try {
      if (this.sirenOscillator) {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
        this.sirenOscillator = null;
      }
      this.isSirenPlaying = false;
      window.dispatchEvent(new CustomEvent('apdasetu_siren_state', { detail: { isPlaying: false } }));
    } catch (e) {
      this.isSirenPlaying = false;
    }
  },

  // Play a quick pleasant or warning chime
  playChime(type = 'alert') {
    if (this.soundMuted) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const freq = type === 'sos' ? 880 : type === 'success' ? 587.33 : 659.25;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      if (type === 'success') {
        osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.3);
      }

      gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn('Chime warning:', e);
    }
  },

  // Text-to-Speech (Speaks alert in target language)
  speakText(text, lang = 'hi-IN') {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      const langCodeMap = {
        'en': 'en-IN',
        'hi': 'hi-IN',
        'bn': 'bn-IN',
        'mr': 'mr-IN',
        'or': 'hi-IN', // fallback for Odia TTS if native not present
        'as': 'bn-IN'  // fallback for Assamese if native not present
      };

      utterance.lang = langCodeMap[lang] || 'en-IN';
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }
};
