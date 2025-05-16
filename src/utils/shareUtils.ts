import { saveAs } from 'file-saver';
import { convertAudioFormat } from '../services/audioService';

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
}

/**
 * Share text message via WhatsApp
 */
export const shareTextViaWhatsApp = (text: string, phone?: string): void => {
  const encodedText = encodeURIComponent(text);
  let whatsappUrl = 'https://wa.me/';
  
  if (phone) {
    // Remove any non-numeric characters from phone number
    const cleanPhone = phone.replace(/\D/g, '');
    whatsappUrl += `${cleanPhone}?text=${encodedText}`;
  } else {
    whatsappUrl += `?text=${encodedText}`;
  }
  
  window.open(whatsappUrl, '_blank');
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
  // Check if conversion is needed
  const currentFormat = audioBlob.type.split('/')[1];
  
  if (currentFormat === targetFormat) {
    return audioBlob;
  }
  
  // Convert to WhatsApp compatible format
  try {
    return await convertAudioFormat(audioBlob, targetFormat);
  } catch (error) {
    console.error('Error converting audio format:', error);
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
 * First tries Web Share API, falls back to download + deeplink
 */
export const shareAudioViaWhatsApp = async (
  audioBlob: Blob,
  options: ShareOptions = {}
): Promise<boolean> => {
  try {
    // Prepare audio in WhatsApp-compatible format
    const whatsappAudio = await prepareAudioForWhatsApp(audioBlob);
    
    // Try Web Share API first if no specific recipient
    if (!options.recipientPhone) {
      const fileName = options.fileName || `talkghana-audio-${Date.now()}.ogg`;
      const webShareResult = await shareAudioViaWebShare(whatsappAudio, fileName, options.text);
      
      if (webShareResult) {
        return true;
      }
    }
    
    // Fall back to download + deeplink approach
    const fileName = options.fileName || `talkghana-audio-${Date.now()}.ogg`;
    downloadAudio(whatsappAudio, fileName.split('.')[0]);
    
    // After download, open WhatsApp with text message
    if (options.text) {
      const downloadMessage = "I've sent you an audio message from TalkGhana. Check your downloads folder.";
      const fullMessage = options.text + "\n\n" + downloadMessage;
      shareTextViaWhatsApp(fullMessage, options.recipientPhone);
    } else {
      shareTextViaWhatsApp("I've sent you an audio message from TalkGhana. Check your downloads folder.", options.recipientPhone);
    }
    
    return true;
  } catch (error) {
    console.error('Error sharing audio via WhatsApp:', error);
    return false;
  }
};
