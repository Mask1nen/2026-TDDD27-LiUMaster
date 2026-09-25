import { useState, useEffect } from "react";
import { useAuth } from "../context/UserAuthContext";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

import { db } from "../firebase";

export function useUserProfile(userID?: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let fetchedID = user?.uid;
    if (userID) {
      fetchedID = userID;
    }
    if (!fetchedID) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, "users", fetchedID);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setProfile(docSnapshot.data());
        } else {
          setProfile(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Fel vid hämtning av profil:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user, userID]);

  const updateProfileTextField = async (key: string, data: string) => {
    if (!user) return;
    const uid = user?.uid;
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { [key]: data });
    1;
    setProfile((prev: any) => ({ ...prev, [key]: data }));
  };

  return {
    profile,
    loading,
    updateProfileTextField,
  };
}
