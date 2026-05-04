import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './useProperties';

export interface Lead {
  id: string;
  propertyId?: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  source?: string;
  status?: string;
  createdAt: number;
  read?: boolean;
}

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result: Lead[] = [];
      snapshot.forEach(doc => {
        result.push({ id: doc.id, ...doc.data() } as Lead);
      });
      setLeads(result);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const pRef = doc(db, 'leads', id);
      await updateDoc(pRef, { ...updates, updatedAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
    }
  };
  
  const deleteLead = async (id: string) => {
      try {
          const lRef = doc(db, 'leads', id);
          await deleteDoc(lRef);
      } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
      }
  };

  return { leads, loading, updateLead, deleteLead };
}
