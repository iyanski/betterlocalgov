import { useEffect, useState } from 'react';
import { loadWhatsNew, type WhatsNewData } from '../lib/whatsNew';

/** Returns the build-generated "What's new" data, or null until/unless loaded. */
export function useWhatsNew(): WhatsNewData | null {
  const [data, setData] = useState<WhatsNewData | null>(null);

  useEffect(() => {
    let active = true;
    void loadWhatsNew().then(result => {
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return data;
}
