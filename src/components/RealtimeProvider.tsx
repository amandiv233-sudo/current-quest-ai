// src/components/RealtimeProvider.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeContextType {
  visitorCount: number;
}

const RealtimeContext = createContext<RealtimeContextType>({ visitorCount: 1 });

export const useRealtime = () => useContext(RealtimeContext);

interface RealtimeProviderProps {
  children: ReactNode;
}

export const RealtimeProvider = ({ children }: RealtimeProviderProps) => {
  const [visitorCount, setVisitorCount] = useState(1);
  const channelRef = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase.channel('online-users', {
      config: {
        presence: {
          key: `user-${Math.random().toString(36).substring(7)}`,
        },
      },
    });

    channel.on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState();
      const count = Object.keys(presenceState).length;
      setVisitorCount(count);
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() });
      }
    });

    channelRef[0] = channel;

    return () => {
      if (channelRef[0]) {
        supabase.removeChannel(channelRef[0]);
      }
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ visitorCount }}>
      {children}
    </RealtimeContext.Provider>
  );
};