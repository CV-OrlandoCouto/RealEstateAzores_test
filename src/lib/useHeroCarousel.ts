import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './useProperties';
import { PropertyImage } from '../types';

export function useHeroCarousel() {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = onSnapshot(doc(db, 'settings', 'hero_carousel'), (docSnap) => {
      if (docSnap.exists() && isMounted) {
        setImages(docSnap.data().images || []);
      } else if (isMounted) {
        setImages([]);
      }
      if (isMounted) setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/hero_carousel');
      if (isMounted) setLoading(false);
    });

    return () => { 
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const saveImages = async (newImages: PropertyImage[]) => {
    try {
      setImages(newImages); // Optimistic UI update
      const docRef = doc(db, 'settings', 'hero_carousel');
      await setDoc(docRef, { images: newImages }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/hero_carousel');
      throw error;
    }
  };

  return { images, loading, saveImages };
}
