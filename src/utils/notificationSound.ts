import { Vibration } from 'react-native';
import { NotificationSound } from '../store/notifications';

type Tone = [frequency: number, delay: number, duration: number, type: OscillatorType];

const PATTERNS: Record<Exclude<NotificationSound, 'silent'>, Tone[]> = {
  'tea-bell': [
    [880, 0, 0.8, 'sine'],
    [1320, 0.95, 0.85, 'sine'],
    [988, 2.15, 0.75, 'sine'],
    [1320, 3.05, 0.9, 'sine'],
    [1760, 4.35, 1.05, 'sine'],
  ],
  'kitchen-tap': [
    [190, 0, 0.55, 'triangle'],
    [260, 0.7, 0.42, 'square'],
    [220, 1.4, 0.55, 'triangle'],
    [310, 2.35, 0.5, 'square'],
    [240, 3.35, 0.7, 'triangle'],
    [180, 4.6, 0.85, 'triangle'],
  ],
  'soft-chime': [
    [523, 0, 1.4, 'sine'],
    [659, 1.05, 1.5, 'sine'],
    [784, 2.25, 1.7, 'sine'],
    [659, 3.75, 1.8, 'sine'],
    [523, 5.15, 1.6, 'sine'],
  ],
};

export function playNotificationSound(sound: NotificationSound) {
  if (sound === 'silent') return;

  const browserAudio = globalThis as typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextClass = browserAudio.AudioContext || browserAudio.webkitAudioContext;

  if (!AudioContextClass) {
    Vibration.vibrate(180);
    return;
  }

  const audioContext = new AudioContextClass();

  PATTERNS[sound].forEach(([frequency, delay, duration, type]) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const start = audioContext.currentTime + delay;
    const end = start + duration;

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  });
}
