import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './useProperties';

export interface CrmLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  date: string;
  contato?: any;
  procura?: any;
  qualificacao?: any;
  gestao?: any;
  createdAt: number;
  updatedAt: number;
}

export function useCrmLeads() {
  const [crmLeads, setCrmLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'crmLeads');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const result: CrmLead[] = [];
      snapshot.forEach(doc => {
        result.push({ id: doc.id, ...doc.data() } as CrmLead);
      });
      // sort by date desc
      result.sort((a, b) => b.createdAt - a.createdAt);
      setCrmLeads(result);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'crmLeads');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addCrmLead = async (lead: Omit<CrmLead, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'crmLeads'), {
        ...lead,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'crmLeads');
      return null;
    }
  };

  const updateCrmLead = async (id: string, updates: Partial<CrmLead>) => {
    try {
      const pRef = doc(db, 'crmLeads', id);
      await updateDoc(pRef, { ...updates, updatedAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `crmLeads/${id}`);
    }
  };
  
  const deleteCrmLead = async (id: string) => {
      try {
          const lRef = doc(db, 'crmLeads', id);
          await deleteDoc(lRef);
      } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `crmLeads/${id}`);
      }
  };

  return { crmLeads, loading, addCrmLead, updateCrmLead, deleteCrmLead };
}
