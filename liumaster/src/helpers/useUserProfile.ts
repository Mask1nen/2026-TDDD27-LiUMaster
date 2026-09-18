import { useState, useEffect } from "react";
import { useAuth } from "../context/UserAuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { db } from "../firebase";

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchProfile() {
      const uid = user?.uid;
      if (!uid) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const docRef = doc(db, "users", uid);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists()) {
        setProfile(docSnapshot.data());
      }
      setLoading(false);
    }
    fetchProfile();
  }, [user]);

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
