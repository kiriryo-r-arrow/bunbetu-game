import React, { useEffect } from 'react';
import { useGameSound, type SoundType } from '../../contexts/SoundContext';

export interface SoundEffectProps {
  type: SoundType;
  /**
   * true に変化したタイミングで効果音を再生するトリガーフラグ（省略時はマウント時に1回再生）
   */
  trigger?: boolean;
}

/**
 * 宣言的に効果音を再生するための使い回し可能なコンポーネント
 * 
 * 使用例:
 * <SoundEffect type="correct" trigger={isCorrectAnswer} />
 */
export const SoundEffect: React.FC<SoundEffectProps> = ({ type, trigger }) => {
  const { playSE } = useGameSound();

  useEffect(() => {
    if (trigger === undefined || trigger === true) {
      playSE(type);
    }
  }, [trigger, type, playSE]);

  return null;
};

export default SoundEffect;
