'use client';

import { ConversationTurn } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface ConversationHistoryProps {
  conversation: ConversationTurn[];
  onClear: () => void;
}

export function ConversationHistory({ conversation, onClear }: ConversationHistoryProps) {
  if (conversation.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Conversation History</h3>
        <Button variant="outline" size="sm" onClick={onClear}>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear History
        </Button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {conversation.map((turn, index) => (
          <Card key={index} className="bg-muted/50">
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">You asked:</p>
                <p className="text-sm">{turn.question}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Assistant replied:</p>
                <p className="text-sm text-muted-foreground">{turn.answer}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}