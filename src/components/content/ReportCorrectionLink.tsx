import { Flag } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { contentGovernanceConfig } from '../../config/contentGovernance';

interface ReportCorrectionLinkProps {
  contentReference?: string;
}

export default function ReportCorrectionLink({
  contentReference,
}: ReportCorrectionLinkProps = {}) {
  const location = useLocation();
  if (!contentGovernanceConfig.correctionReportsEnabled) return null;

  return (
    <div className="mt-6 border-t border-gray-200 pt-5">
      <Link
        to={`/report-incorrect-information?page=${encodeURIComponent(contentReference ?? location.pathname)}`}
        className="inline-flex items-center gap-2 font-medium text-primary-700 underline underline-offset-2 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
      >
        <Flag className="h-4 w-4" aria-hidden="true" />
        Report incorrect information
      </Link>
    </div>
  );
}
