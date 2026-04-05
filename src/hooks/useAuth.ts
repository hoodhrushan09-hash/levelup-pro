import { useState, useEffect } from 'react';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const profileRef = doc(db, 'users', u.uid);
        const unsubProfile = onSnapshot(profileRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          } else {
            // Initialize profile
            const newProfile: UserProfile = {
              uid: u.uid,
              displayName: u.displayName || 'Hero',
              photoURL: u.photoURL || '',
              xp: 0,
              level: 1,
              stats: {
                tasksCompleted: 0,
                habitsMaintained: 0,
                totalXP: 0
              }
            };
            setDoc(profileRef, newProfile).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${u.uid}`));
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
        });
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  return { user, profile, loading };
}
