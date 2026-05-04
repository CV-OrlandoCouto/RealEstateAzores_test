import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase'; // Adjust if firebase.ts is somewhere else.
import { Testimonial } from '../types';
import { handleFirestoreError, OperationType } from './useProperties'; // Re-use error handler

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    const fetchTestimonials = () => {
      try {
        const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const testimonialsData: Testimonial[] = [];
          snapshot.forEach((doc) => {
            testimonialsData.push({ id: doc.id, ...doc.data() } as Testimonial);
          });
          setTestimonials(testimonialsData);
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.LIST, 'testimonials');
          setLoading(false);
        });

      } catch (error) {
         handleFirestoreError(error, OperationType.LIST, 'testimonials');
         setLoading(false);
      }
    };

    fetchTestimonials();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { testimonials, loading };
}
