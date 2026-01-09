'use client';

import { Card, CardContent } from '@/components/ui/card';

export function LoadingSkeleton() {
  return (
    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 bg-muted-foreground/20 animate-pulse rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted-foreground/20 animate-pulse rounded w-full" />
          <div className="h-4 bg-muted-foreground/20 animate-pulse rounded w-4/5" />
          <div className="h-4 bg-muted-foreground/20 animate-pulse rounded w-3/4" />
        </div>
        <div className="pt-2 border-t border-muted-foreground/10">
          <div className="h-3 w-16 bg-muted-foreground/20 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}