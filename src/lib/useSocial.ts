import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './useProperties';

export interface SocialSettings {
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
}

export function useSocial() {
  const [socialSettings, setSocialSettings] = useState<SocialSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onSnapshot(doc(db, 'settings', 'social'), (docSnap) => {
      if (docSnap.exists() && isMounted) {
        setSocialSettings(docSnap.data() as SocialSettings);
      }
      if (isMounted) setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/social');
      if (isMounted) setLoading(false);
    });

    return () => { 
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { socialSettings, loading };
}
