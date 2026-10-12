import { CircleAlert, CircleCheck, Clock3, FileSearch } from 'lucide-react';
import {
  verificationStatusDetails,
  type VerificationStatus,
} from '../../lib/contentGovernance';

interface VerificationBadgeProps {
  status: VerificationStatus;
}

const icons = {
  awaiting_verification: Clock3,
  sourced: FileSearch,
  verified: CircleCheck,
  outdated: CircleAlert,
};

export default function VerificationBadge({ status }: VerificationBadgeProps) {
  const details = verificationStatusDetails[status];
  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${details.className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {details.label}
    </span>
  );
}
