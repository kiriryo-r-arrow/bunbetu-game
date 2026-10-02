import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useSound from 'use-sound';

export type SoundType = 'correct' | 'incorrect' | 'wash' | 'click';

export interface SoundContextType {
  playSE: (type: SoundType) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean | ((prev: boolean) => boolean)) => void;
  volume: number;
  setVolume: (volume: number | ((prev: number) => boolean)) => void;
}

const SoundContext = createContext<SoundContextType | null>(null);

// Web Audio API によるシンセ音フォールバック（音声ファイル不整合時など用）
const playSynthesizedFallback = (type: SoundType) => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'correct') {
      // ピンポーン (C5 -> E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.25);
      gain2.gain.setValueAtTime(0.001, now);
      gain2.gain.setValueAtTime(0.35, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.7);
    } else if (type === 'incorrect') {
      // ブブー (低音ノコギリ波 × 2)
      [0, 0.25].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now + offset);
        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.linearRampToValueAtTime(0.001, now + offset + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });
    }
  } catch {
    // Web Audio 非対応環境等での安全な無視
  }
};

interface SoundProviderProps {
  children: React.ReactNode;
}

export const SoundProvider: React.FC<SoundProviderProps> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);

  // use-sound フックで正解音・不正解音を定義
  const [playCorrectHowl] = useSound('/sounds/correct.mp3', {
    volume: isMuted ? 0 : volume,
    interrupt: false,
    onloaderror: () => {
      // ロードエラー時はフォールバックに切り替えられるよう備える
    },
  });

  const [playIncorrectHowl] = useSound('/sounds/incorrect.mp3', {
    volume: isMuted ? 0 : volume,
    interrupt: false,
    onloaderror: () => {},
  });

  const playSE = useCallback(
    (type: SoundType) => {
      if (isMuted) return;

      try {
        if (type === 'correct') {
          if (playCorrectHowl) {
            playCorrectHowl();
          } else {
            playSynthesizedFallback('correct');
          }
        } else if (type === 'incorrect') {
          if (playIncorrectHowl) {
            playIncorrectHowl();
          } else {
            playSynthesizedFallback('incorrect');
          }
        } else {
          // その他の音（将来追加用）
          playSynthesizedFallback(type);
        }
      } catch {
        playSynthesizedFallback(type);
      }
    },
    [isMuted, playCorrectHowl, playIncorrectHowl]
  );

  const value = useMemo(
    () => ({
      playSE,
      isMuted,
      setIsMuted,
      volume,
      setVolume: setVolume as SoundContextType['setVolume'],
    }),
    [playSE, isMuted, volume]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
};

// 使い回し用カスタムフック
export const useGameSound = (): SoundContextType => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useGameSound must be used within a SoundProvider');
  }
  return context;
};
