import { saveAs } from 'file-saver';
import { convertAudioFormat, AudioFormat } from '../services/audioService';

/**
 * WhatsApp sharing utilities for TalkGhana
 */

// Supported WhatsApp file formats
export type WhatsAppAudioFormat = 'ogg' | 'mp3';

// Share options
export interface ShareOptions {
  text?: string;
  audioBlob?: Blob;
  fileName?: string;
  recipientPhone?: string;
  fallback?: boolean;
}

/**
 * Share text message via WhatsApp
 */
export const shareTextViaWhatsApp = async (text: string, phone?: string, options: { fallback?: boolean } = {}): Promise<boolean> => {
  try {
    const whatsappUrl = phone 
      ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    // Try Web Share API first if available
    if ('share' in navigator && !options.fallback) {
      try {
        await navigator.share({
          text: text,
          url: whatsappUrl
        });
        return true;
      } catch (e) {
        console.log('Web Share API failed, falling back to URL');
      }
    }

    // Fallback to opening WhatsApp URL
    window.open(whatsappUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error sharing to WhatsApp:', error);
    return false;
  }
};

/**
 * Share audio via Web Share API (if available)
 */
export const shareAudioViaWebShare = async (
  audioBlob: Blob,
  fileName: string,
  text?: string
): Promise<boolean> => {
  if (!navigator.share) {
    return false;
  }
  
  try {
    const file = new File([audioBlob], fileName, { type: audioBlob.type });
    
    await navigator.share({
      files: [file],
      title: 'TalkGhana Audio',
      text: text || 'Audio message from TalkGhana'
    });
    
    return true;
  } catch (error) {
    console.error('Error sharing via Web Share API:', error);
    return false;
  }
};

/**
 * Prepare audio for WhatsApp by ensuring it's in a compatible format
 */
export const prepareAudioForWhatsApp = async (
  audioBlob: Blob,
  targetFormat: WhatsAppAudioFormat = 'ogg'
): Promise<Blob> => {
  try {
    // Check if audio is already in a compatible format
    const audioType = audioBlob.type.toLowerCase();
    if (audioType === 'audio/ogg' || audioType === 'audio/mpeg') {
      return audioBlob;
    }

    // Convert to WhatsApp compatible format using audio service
    return await convertAudioFormat(audioBlob, targetFormat as AudioFormat);
  } catch (error) {
    console.error('Error preparing audio for WhatsApp:', error);
    throw new Error('Failed to convert audio to WhatsApp compatible format');
  }
};

/**
 * Download audio file
 */
export const downloadAudio = (
  audioBlob: Blob,
  fileName: string = `talkghana-audio-${Date.now()}`
): void => {
  const extension = audioBlob.type.split('/')[1] || 'mp3';
  saveAs(audioBlob, `${fileName}.${extension}`);
};

/**
 * Share audio via WhatsApp (combined approach)
 * 
 * First tries Web Share API, falls back to download + deep link
 */
export const shareAudioViaWhatsApp = async (
  audioBlob: Blob,
  fileName: string,
  options: {
    text?: string;
    recipientPhone?: string;
    fallback?: boolean;
  } = {}
): Promise<boolean> => {
  try {
    // Prepare audio in WhatsApp-compatible format
    const whatsappAudio = await prepareAudioForWhatsApp(audioBlob);

    // Try Web Share API first if available
    if ('share' in navigator && !options.fallback) {
      try {
        const webShareResult = await shareAudioViaWebShare(whatsappAudio, fileName, options.text);
        if (webShareResult) return true;
      } catch (e) {
        console.log('Web Share API failed, falling back to download');
      }
    }

    // Download audio file
    downloadAudio(whatsappAudio, fileName);

    // Open WhatsApp with text message
    const fullMessage = options.text || `I've sent you an audio message from TalkGhana. Check your downloads folder.`;
    await shareTextViaWhatsApp(fullMessage, options.recipientPhone, { fallback: true });

    return true;
  } catch (error) {
    console.error('Error sharing audio via WhatsApp:', error);
    return false;
  }
};
