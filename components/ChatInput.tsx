'use client';

import { useState, KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceRecorderButton } from './VoiceRecorderButton';
import { LanguageSelector } from './LanguageSelector';
import { Language, SUPPORTED_LANGUAGES } from '@/lib/types';

interface ChatInputProps {
  onSubmit: (question: string, language: Language) => void;
  onVoiceSubmit: (answer: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({ onSubmit, onVoiceSubmit, disabled, isLoading }: ChatInputProps) {
  const [question, setQuestion] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [audioState, setAudioState] = useState<'idle' | 'recording' | 'recorded' | 'playing'>('idle');
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  const handleSubmit = () => {
    if (question.trim() && !disabled && !isLoading && audioState === 'idle') {
      onSubmit(question.trim(), selectedLanguage);
      setQuestion('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAudioSubmit = async (audioBlob: Blob, mimeType: string) => {
    setIsProcessingAudio(true);
    
    try {
      const formData = new FormData();
      
      // Determine file extension based on MIME type
      let filename = 'recording.mp4'; // Default to mp4 for better compatibility
      if (mimeType.includes('mp4')) {
        filename = 'recording.mp4';
      } else if (mimeType.includes('ogg')) {
        filename = 'recording.ogg';
      } else if (mimeType.includes('webm')) {
        filename = 'recording.webm';
      } else if (mimeType.includes('wav')) {
        filename = 'recording.wav';
      }
      
      console.log('Submitting audio:', { 
        size: audioBlob.size, 
        type: audioBlob.type, 
        mimeType, 
        filename 
      });
      
      formData.append('audio', audioBlob, filename);
      formData.append('language', selectedLanguage.code);

      const response = await fetch(`/api/audio`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onVoiceSubmit(data.answer);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Speech-to-text failed:', errorData);
        onVoiceSubmit('Sorry, I could not process your audio. Please try typing your question instead.');
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
      onVoiceSubmit('Sorry, there was an error processing your audio. Please try again or type your question.');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const handleRecordingStateChange = (state: 'idle' | 'recording' | 'recorded' | 'playing') => {
    setAudioState(state);
  };

  const canSubmitText = question.trim() && !disabled && !isLoading && audioState === 'idle' && !isProcessingAudio;
  const canUseAudio = !disabled && !isLoading && !question.trim() && !isProcessingAudio;

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-center">
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
        
        {audioState !== 'idle' && (
          <div className="text-muted-foreground text-sm">
            {audioState === 'recording' && "Recording... Speak clearly and press stop when finished."}
            {audioState === 'recorded' && "Audio recorded. Play to review, then send or delete."}
            {audioState === 'playing' && "Playing audio..."}
          </div>
        )}
      </div>
      
      <div className="relative">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            audioState !== 'idle' 
              ? "Clear audio recording to type a question..." 
              : "Type your immigration question..."
          }
          disabled={disabled || isLoading || audioState !== 'idle' || isProcessingAudio}
          className="bg-background disabled:opacity-50 p-4 pr-32 border border-input rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-full min-h-[80px] text-foreground placeholder:text-muted-foreground resize-none"
        />
        
        <div className="right-4 bottom-4 absolute flex items-center gap-2">
          <VoiceRecorderButton
            onAudioSubmit={handleAudioSubmit}
            onRecordingStateChange={handleRecordingStateChange}
            disabled={!canUseAudio}
            language={selectedLanguage.code}
          />
          <Button
            onClick={handleSubmit}
            disabled={!canSubmitText}
            size="icon"
          >
            {isLoading || isProcessingAudio ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      {isProcessingAudio && (
        <div className="text-muted-foreground text-sm text-center">
          Processing your audio...
        </div>
      )}
    </div>
  );
}