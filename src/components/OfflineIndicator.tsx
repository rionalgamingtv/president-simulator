import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-900 shadow-sm"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden="true" />
      <span>
        Offline Mode · Local career archives remain readable; connect to advance
        new months.
      </span>
    </div>
  );
};
