import React, { useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function NotificationListener() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notification = change.doc.data();
          
          toast.success(notification.message, {
            duration: 10000, // Show for 10 seconds since it's an important delivery update
            style: {
              background: '#F26C24',
              color: 'white',
              border: 'none',
              fontWeight: 700
            }
          });

          // Mark as read so we don't show it again on reload
          updateDoc(doc(db, 'notifications', change.doc.id), { read: true }).catch(console.error);
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  return null;
}
