'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { IntentBadge } from './IntentBadge';
import { SourceList } from './SourceList';
import { QuestionResponse } from '@/lib/types';

interface AnswerCardProps {
  response: QuestionResponse;
}

export function AnswerCard({ response }: AnswerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <IntentBadge intent={response.intent} />
            </div>
            
            <div className="prose prose-sm max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {response.answer}
              </p>
            </div>
            
            <div className="pt-2 border-t">
              <SourceList sources={response.sources || []} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}