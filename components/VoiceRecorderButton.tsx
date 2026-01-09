'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceRecorderButtonProps {
  onAudioSubmit: (audioBlob: Blob, mimeType: string) => void;
  onRecordingStateChange: (state: 'idle' | 'recording' | 'recorded' | 'playing') => void;
  disabled?: boolean;
  language?: string;
}

export function VoiceRecorderButton({ onAudioSubmit, onRecordingStateChange, disabled, language = 'en' }: VoiceRecorderButtonProps) {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'recorded' | 'playing'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [totalRecordingTime, setTotalRecordingTime] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; mimeType: string; url: string } | null>(null);
  const [availableMicrophones, setAvailableMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>('default');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const recordingTimeRef = useRef<number>(0);

  const MAX_RECORDING_TIME = 60; // 1 minute in seconds

  useEffect(() => {
    onRecordingStateChange(recordingState);
  }, [recordingState, onRecordingStateChange]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (recordedAudio?.url) URL.revokeObjectURL(recordedAudio.url);
    };
  }, [recordedAudio]);

  const startRecording = async () => {
    try {
      console.log('Starting recording...');
      
      // List available audio devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      console.log('Available microphones:', audioInputs.map(d => ({ id: d.deviceId, label: d.label })));
      setAvailableMicrophones(audioInputs);
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true,
          sampleRate: 48000,
          // Use selected microphone
          deviceId: selectedMicId === 'default' ? undefined : { exact: selectedMicId }
        }
      });
      streamRef.current = stream;
      console.log('Got media stream:', stream);
      
      // Check audio track settings
      const audioTrack = stream.getAudioTracks()[0];
      console.log('Audio track settings:', audioTrack.getSettings());
      console.log('Audio track constraints:', audioTrack.getConstraints());
      
      // Set up audio analysis for visual feedback
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      // Add gain node to boost input if needed
      const inputGain = audioContext.createGain();
      inputGain.gain.value = 5.0; // Boost input by 5x
      
      analyser.fftSize = 256;
      microphone.connect(inputGain);
      inputGain.connect(analyser);
      
      console.log('Audio context setup complete with input gain boost');
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Try to use a supported format for OpenAI Whisper - prioritize more compatible formats
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
        console.log('Using audio/mp4');
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        options.mimeType = 'audio/ogg;codecs=opus';
        console.log('Using audio/ogg;codecs=opus');
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
        console.log('Using audio/webm;codecs=opus');
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
        console.log('Using audio/webm');
      } else {
        console.log('Using default format');
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      console.log('MediaRecorder created with options:', options);

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes', event.data.type);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('Total chunks so far:', chunksRef.current.length);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped. Total chunks:', chunksRef.current.length);
        
        // Capture the current recording time BEFORE any state changes
        const finalRecordingTime = recordingTimeRef.current;
        console.log('Final recording time captured:', finalRecordingTime);
        
        // Use the actual MIME type from the recorder
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        
        // Verify the blob has content
        console.log('Audio blob created:', { 
          size: audioBlob.size, 
          type: audioBlob.type,
          chunks: chunksRef.current.length,
          recordingTime: finalRecordingTime
        });
        
        if (audioBlob.size > 0) {
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log('Audio URL created:', audioUrl);
          setRecordedAudio({ blob: audioBlob, mimeType, url: audioUrl });
          setTotalRecordingTime(finalRecordingTime); // Use captured time
          setRecordingState('recorded');
        } else {
          console.error('Audio blob is empty');
          setRecordingState('idle');
        }
        
        cleanup();
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
      };

      mediaRecorder.onstart = () => {
        console.log('MediaRecorder started');
      };

      // Start recording with timeslice to ensure data is available
      mediaRecorder.start(1000); // Collect data every 1 second
      console.log('MediaRecorder.start() called');
      
      setRecordingState('recording');
      setRecordingTime(0);
      
      // Start timer
      console.log('Starting timer...');
      recordingTimeRef.current = 0;
      timerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
        console.log('Timer tick:', recordingTimeRef.current);
        if (recordingTimeRef.current >= MAX_RECORDING_TIME) {
          console.log('Max recording time reached, stopping...');
          stopRecording();
        }
      }, 1000);
      
      // Start visual feedback
      updateAudioLevel();
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingState('idle');
    }
  };

  const updateAudioLevel = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = average / 255; // Normalize to 0-1
    setAudioLevel(normalizedLevel);
    
    // Log audio levels periodically to debug microphone input
    if (recordingTimeRef.current % 1 === 0) { // Log every second
      const maxValue = Array.from(dataArray).reduce((max, val) => Math.max(max, val), 0);
      console.log('Audio input level:', normalizedLevel.toFixed(3), 'max:', maxValue, 'time:', recordingTimeRef.current);
      
      // Alert if no input detected
      if (recordingTimeRef.current > 2 && maxValue < 10) {
        console.warn('⚠️ Very low microphone input detected. Check microphone permissions and volume.');
      }
    }
    
    if (recordingState === 'recording') {
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...', { 
      hasRecorder: !!mediaRecorderRef.current, 
      state: recordingState,
      recorderState: mediaRecorderRef.current?.state 
    });
    
    if (mediaRecorderRef.current && recordingState === 'recording') {
      console.log('Calling mediaRecorder.stop()');
      mediaRecorderRef.current.stop();
      
      if (timerRef.current) {
        console.log('Clearing timer');
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (animationRef.current) {
        console.log('Clearing animation frame');
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  };

  const cleanup = () => {
    console.log('Cleaning up...');
    
    if (streamRef.current) {
      console.log('Stopping media tracks');
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      console.log('Closing audio context');
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setAudioLevel(0);
    // Don't reset recordingTime here - we want to preserve it for display
  };

  const playRecording = async () => {
    console.log('Play recording called:', { 
      hasAudio: !!recordedAudio, 
      state: recordingState,
      audioSize: recordedAudio?.blob.size 
    });
    
    if (recordedAudio && recordingState === 'recorded') {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      
      console.log('Creating audio element:', { 
        url: recordedAudio.url, 
        type: recordedAudio.mimeType,
        blobSize: recordedAudio.blob.size 
      });
      
      // Try Web Audio API approach
      try {
        const audioContext = new AudioContext();
        const arrayBuffer = await recordedAudio.blob.arrayBuffer();
        console.log('ArrayBuffer created:', arrayBuffer.byteLength, 'bytes');
        
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Analyze audio levels
        const channelData = audioBuffer.getChannelData(0);
        let maxLevel = 0;
        let rmsLevel = 0;
        for (let i = 0; i < channelData.length; i++) {
          const sample = Math.abs(channelData[i]);
          maxLevel = Math.max(maxLevel, sample);
          rmsLevel += sample * sample;
        }
        rmsLevel = Math.sqrt(rmsLevel / channelData.length);
        
        console.log('AudioBuffer decoded:', {
          duration: audioBuffer.duration,
          sampleRate: audioBuffer.sampleRate,
          numberOfChannels: audioBuffer.numberOfChannels,
          maxLevel: maxLevel,
          rmsLevel: rmsLevel,
          isEmpty: maxLevel < 0.001
        });
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        // Add gain node to boost volume if needed
        const gainNode = audioContext.createGain();
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Boost gain if audio is very quiet
        if (maxLevel < 0.1) {
          const boostFactor = Math.min(10, 0.5 / Math.max(maxLevel, 0.001));
          gainNode.gain.value = boostFactor;
          console.log('Boosting audio gain by factor:', boostFactor);
        } else {
          gainNode.gain.value = 1.0;
        }
        
        source.onended = () => {
          console.log('Web Audio playback ended');
          setRecordingState('recorded');
        };
        
        setRecordingState('playing');
        source.start(0);
        console.log('Web Audio playback started');
        
      } catch (webAudioError) {
        console.error('Web Audio API failed:', webAudioError);
        
        // Fallback to HTML5 Audio
        console.log('Falling back to HTML5 Audio');
        const audio = new Audio();
        audioElementRef.current = audio;
        
        // Add more detailed event handlers
        audio.onloadstart = () => console.log('Audio load started');
        audio.onloadeddata = () => console.log('Audio data loaded');
        audio.oncanplay = () => console.log('Audio can play');
        audio.oncanplaythrough = () => console.log('Audio can play through');
        audio.onplay = () => {
          console.log('Audio playing');
          setRecordingState('playing');
        };
        audio.onended = () => {
          console.log('Audio ended');
          setRecordingState('recorded');
        };
        audio.onpause = () => {
          console.log('Audio paused');
          setRecordingState('recorded');
        };
        audio.onerror = (e) => {
          console.error('Audio playback error:', e, audio.error);
          setRecordingState('recorded');
        };
        
        // Set volume to ensure it's audible
        audio.volume = 1.0;
        audio.src = recordedAudio.url;
        
        console.log('Starting HTML5 audio playback...');
        audio.play().catch((error) => {
          console.error('Failed to play HTML5 audio:', error);
          setRecordingState('recorded');
        });
      }
    } else {
      console.log('Cannot play - missing audio or wrong state');
    }
  };

  const deleteRecording = () => {
    if (recordedAudio?.url) {
      URL.revokeObjectURL(recordedAudio.url);
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setRecordedAudio(null);
    setRecordingState('idle');
    setRecordingTime(0);
    setTotalRecordingTime(0);
    recordingTimeRef.current = 0;
  };

  const submitRecording = () => {
    if (recordedAudio) {
      onAudioSubmit(recordedAudio.blob, recordedAudio.mimeType);
      deleteRecording(); // Clean up after submission
    }
  };

  const handleStartRecording = () => {
    if (recordingState === 'idle') {
      startRecording();
    }
  };

  const handleStopRecording = () => {
    if (recordingState === 'recording') {
      stopRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render different UI based on recording state
  if (recordingState === 'idle') {
    return (
      <div className="flex items-center gap-2">
        {availableMicrophones.length > 1 && (
          <select 
            value={selectedMicId} 
            onChange={(e) => setSelectedMicId(e.target.value)}
            className="text-xs border rounded px-2 py-1 max-w-24 truncate"
            title={selectedMicId === 'default' ? 'Default Microphone' : availableMicrophones.find(m => m.deviceId === selectedMicId)?.label || 'Microphone'}
          >
            <option value="default">Default</option>
            {availableMicrophones.map(mic => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label ? mic.label.slice(0, 12) + (mic.label.length > 12 ? '...' : '') : `Mic ${mic.deviceId.slice(0, 4)}`}
              </option>
            ))}
          </select>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleStartRecording}
          disabled={disabled}
          className="transition-all duration-200"
        >
          <Mic className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (recordingState === 'recording') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-red-600">
          <div className="flex items-center gap-1">
            <div 
              className="w-2 h-4 bg-red-500 rounded-sm transition-all duration-100"
              style={{ height: `${8 + audioLevel * 16}px` }}
            />
            <div 
              className="w-2 h-4 bg-red-400 rounded-sm transition-all duration-150"
              style={{ height: `${6 + audioLevel * 12}px` }}
            />
            <div 
              className="w-2 h-4 bg-red-300 rounded-sm transition-all duration-200"
              style={{ height: `${4 + audioLevel * 8}px` }}
            />
          </div>
          <span className="font-mono">{formatTime(recordingTime)}</span>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleStopRecording}
          className="bg-red-500 text-white hover:bg-red-600 border-red-500"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (recordingState === 'recorded' || recordingState === 'playing') {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          Audio recorded ({formatTime(totalRecordingTime)})
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            console.log('Play button clicked');
            playRecording();
          }}
          disabled={recordingState === 'playing'}
        >
          {recordingState === 'playing' ? 'Playing...' : 'Play'}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={async () => {
            // Test microphone input levels
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                  deviceId: selectedMicId === 'default' ? undefined : { exact: selectedMicId }
                }
              });
              const audioContext = new AudioContext();
              const analyser = audioContext.createAnalyser();
              const microphone = audioContext.createMediaStreamSource(stream);
              
              analyser.fftSize = 256;
              microphone.connect(analyser);
              
              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              
              console.log('🎤 Microphone test started - speak now...');
              let testCount = 0;
              const testInterval = setInterval(() => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
                const maxValue = Array.from(dataArray).reduce((max, val) => Math.max(max, val), 0);
                
                console.log(`Mic test ${testCount + 1}/5:`, 'avg:', (average/255).toFixed(3), 'max:', maxValue);
                
                testCount++;
                if (testCount >= 5) {
                  clearInterval(testInterval);
                  stream.getTracks().forEach(track => track.stop());
                  audioContext.close();
                  console.log('🎤 Microphone test complete');
                }
              }, 1000);
              
            } catch (error) {
              console.error('Microphone test failed:', error);
            }
          }}
        >
          Test Mic
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={deleteRecording}
        >
          Delete
        </Button>
        
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={submitRecording}
        >
          Send
        </Button>
      </div>
    );
  }

  return null;
}