import { useState, useEffect } from "react";
import { useAuth } from "../context/UserAuthContext";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import type { UserProfile } from "../types";

import { db } from "../firebase";

export function useUserProfile(userID?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  let fetchedID = user?.uid;
  if (userID) {
    fetchedID = userID;
  }

  useEffect(() => {
    if (!fetchedID) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    const docRef = doc(db, "users", fetchedID);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setProfile(docSnapshot.data() as UserProfile);
        } else {
          setProfile(null);
        }
        setLoadingProfile(false);
      },
      (error) => {
        console.error("Fel vid hämtning av profil:", error);
        setLoadingProfile(false);
      },
    );
    return () => unsubscribe();
  }, [user, userID]);

  const updateProfile = async (updatedFields: Partial<UserProfile>) => {
    if (!user) return;
    const uid = user?.uid;
    const userRef = doc(db, "users", uid);
    try {
      await updateDoc(userRef, updatedFields);
      setProfile((prev: any) => ({ ...prev, ...updatedFields }));
    } catch (error) {
      console.error("Kunde inte uppdatera profilen i Firestore", error);
    }
  };

  return {
    profile,
    loadingProfile,
    updateProfile,
  };
}
