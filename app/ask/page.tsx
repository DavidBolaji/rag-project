'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatInput } from '@/components/ChatInput';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { IntentBadge } from '@/components/IntentBadge';
import { SourceList } from '@/components/SourceList';
import { QuestionResponse, Language, ConversationTurn } from '@/lib/types';

export default function AskPage() {
  const [response, setResponse] = useState<QuestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);

  const handleSubmit = async (question: string, language: Language) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    // Add user question to conversation immediately
    const newTurn = { question, answer: '' };
    setConversation(prev => [...prev, newTurn]);

    try {
      const res = await fetch(`/api/question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          language: language.code,
          conversation: conversation.length > 0 ? conversation : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const data: QuestionResponse = await res.json();
      
      // Update the last conversation turn with the answer
      setConversation(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { question, answer: data.answer };
        return updated;
      });
      
      // Store response data for intent badge
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      // Remove the incomplete conversation turn on error
      setConversation(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSubmit = (answer: string) => {
    // Voice responses come back as complete answers
    const voiceResponse = {
      answer,
      intent: 'general_info' as const,
      sources: []
    };
    
    // Add to conversation history
    setConversation(prev => [...prev, { question: 'Voice question', answer }]);
    setResponse(voiceResponse);
  };

  const handleClearConversation = () => {
    setConversation([]);
    setResponse(null);
    setError(null);
  };

  const handleRetry = () => {
    setError(null);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="mx-auto px-4 md:px-48 py-6 container">
        <nav className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="flex justify-center items-center bg-primary rounded-lg w-8 h-8">
              <span className="font-bold text-primary-foreground text-sm">TL</span>
            </div>
            <span className="font-semibold text-xl">Train LLM</span>
          </div>
        </nav>
      </header>

      {/* Main Content - Chat Layout */}
      <main className="flex flex-col h-[calc(100vh-80px)]">
        <div className="flex flex-col mx-auto px-4 max-w-4xl h-full container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="py-6 border-b"
          >
            <div className="space-y-2 text-center">
              <h1 className="font-bold text-2xl md:text-3xl">
                Immigration Assistant
              </h1>
              <p className="text-muted-foreground">
                Ask your questions and get personalized guidance
              </p>
            </div>
          </motion.div>

          {/* Chat Area - Scrollable */}
          <div className="flex-1 space-y-6 py-6 overflow-y-auto scrollbar-hide">
            {/* Welcome Message */}
            {conversation.length === 0 && !response && !isLoading && !error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="space-y-6 text-center"
              >
                <div className="bg-muted/50 p-8 rounded-2xl">
                  <h3 className="mb-4 font-semibold text-lg">Welcome! How can I help you today?</h3>
                  <div className="gap-4 grid md:grid-cols-2 text-muted-foreground text-sm">
                    <div className="space-y-2">
                      <p>• &apos;Am I eligible for a UK work visa?&apos;</p>
                      <p>• &apos;What documents do I need for Canadian PR?&apos;</p>
                    </div>
                    <div className="space-y-2">
                      <p>• &apos;How long does US visa processing take?&apos;</p>
                      <p>• &apos;Can I bring my family on a student visa?&apos;</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Conversation */}
            {conversation.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Conversation</h3>
                  <Button variant="outline" size="sm" onClick={handleClearConversation}>
                    <Trash2 className="mr-2 w-4 h-4" />
                    Clear
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {conversation.map((turn, index) => (
                    <div key={index} className="space-y-3">
                      {/* User Question */}
                      <div className="flex justify-end">
                        <div className="bg-primary px-4 py-3 rounded-2xl rounded-br-md max-w-[80%] text-primary-foreground">
                          <p className="text-sm">{turn.question}</p>
                        </div>
                      </div>
                      
                      {/* Assistant Answer */}
                      {turn.answer ? (
                        <div className="flex justify-start">
                          <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md max-w-[80%]">
                            <div className="space-y-3">
                              {/* Show intent badge for the latest response */}
                              {index === conversation.length - 1 && response && (
                                <div className="flex items-center gap-2">
                                  <IntentBadge intent={response.intent} />
                                </div>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{turn.answer}</p>
                              {/* Show sources for the latest response */}
                              {index === conversation.length - 1 && response && response.sources && response.sources.length > 0 && (
                                <div className="pt-2 border-t">
                                  <SourceList sources={response.sources} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Loading state for current question */
                        isLoading && index === conversation.length - 1 && (
                          <div className="flex justify-start">
                            <div className="max-w-[80%]">
                              <LoadingSkeleton />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <ErrorState 
                message={error} 
                onRetry={handleRetry}
              />
            )}
          </div>

          {/* Input Area - Fixed at Bottom */}
          <div className="py-4 border-t">
            <ChatInput 
              onSubmit={handleSubmit} 
              onVoiceSubmit={handleVoiceSubmit}
              disabled={isLoading} 
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}