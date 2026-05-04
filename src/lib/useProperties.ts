import { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Property } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  
  if (errInfo.error.includes('Missing or insufficient permissions')) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  } else if (errInfo.error.includes('client is offline')) {
    console.warn('Firestore is offline, operation may be queued or use cache.');
  } else {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    // Don't crash the app for other transient errors, or handle globally
  }
}

export function useProperties(isAdmin: boolean = false) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'properties'));
    if (!isAdmin) {
      q = query(collection(db, 'properties'), where('isPublic', '==', true));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const props: Property[] = [];
      snapshot.forEach(doc => {
        // Types in DB use number for dates, need to map to string for UI if needed,
        // but let's assume we can keep them as number in DB and convert or fix type.
        props.push({ id: doc.id, ...doc.data() } as Property);
      });
      setProperties(props);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'properties');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const pRef = doc(db, 'properties', id);
      await updateDoc(pRef, { ...updates, updatedAt: Date.now() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `properties/${id}`);
    }
  };

  return { properties, loading, updateProperty };
}
