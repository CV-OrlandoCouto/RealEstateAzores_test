import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './useProperties';
import { BlogPost } from '../types';

export function useBlog(publishedOnly = false) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'blogPosts'), orderBy('createdAt', 'desc'));
    
    if (publishedOnly) {
      q = query(collection(db, 'blogPosts'), where('isPublished', '==', true), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as BlogPost);
      setPosts(p);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blogPosts');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [publishedOnly]);

  return { posts, loading };
}
