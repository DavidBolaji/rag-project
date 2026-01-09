'use client';

import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, HelpCircle } from 'lucide-react';

interface IntentBadgeProps {
  intent: 'visa_eligibility' | 'document_requirements' | 'general_info';
}

const intentConfig = {
  visa_eligibility: {
    label: 'Visa Eligibility',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  document_requirements: {
    label: 'Document Requirements',
    icon: FileText,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  general_info: {
    label: 'General Information',
    icon: HelpCircle,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
};

export function IntentBadge({ intent }: IntentBadgeProps) {
  const config = intentConfig[intent];
  const Icon = config.icon;

  return (
    <Badge variant="secondary" className={`${config.className} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}