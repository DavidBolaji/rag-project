'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SourceListProps {
  sources?: string[];
}

export function SourceList({ sources }: SourceListProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-0 h-auto">
          <span className="text-sm text-muted-foreground">
            Sources ({sources.length})
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        {sources.map((source, index) => (
          <Card key={index} className="border-l-4 border-l-primary">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-muted-foreground flex-1">
                  {source}
                </p>
                <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}