import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AppUser, UserRole } from '@/types/user';
import { FIRESTORE_COLLECTIONS } from '@/config/constants';

export async function loginWithEmail(email: string, password: string): Promise<AppUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const appUser = await getAppUser(credential.user);
  return appUser;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function getAppUser(firebaseUser: User): Promise<AppUser> {
  // First try to get role from custom claims
  const tokenResult = await firebaseUser.getIdTokenResult();
  let role: UserRole = (tokenResult.claims.role as UserRole) || 'viewer';

  // Also check Firestore user document for role
  const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    // Firestore role takes precedence if custom claims not set
    if (!tokenResult.claims.role && userData.role) {
      role = userData.role as UserRole;
    }
  } else {
    // Create user document on first login
    await setDoc(userDocRef, {
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
      role: 'viewer',
      createdAt: serverTimestamp(),
    });
    role = 'viewer';
  }

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
    role,
    createdAt: userDoc.exists() ? userDoc.data().createdAt?.toDate?.()?.toISOString() || '' : new Date().toISOString(),
  };
}
