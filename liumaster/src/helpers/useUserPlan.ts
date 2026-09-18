import { useState, useEffect } from "react";
import { useAuth } from "../context/UserAuthContext";
import {
  doc,
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase";

import type { MasterPlan } from "../types";
import { useUserProfile } from "./useUserProfile";

export function useUserPlan(planID?: string) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [plans, setPlans] = useState<MasterPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MasterPlan | null>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchPlans() {
      const uid = user?.uid;
      if (!uid) {
        setLoading(false);
        return [];
      }
      const querySnapshot = await getDocs(
        collection(db, "users", uid, "plans"),
      );
      const plans: MasterPlan[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        program: profile?.program,
        ...doc.data(),
      })) as MasterPlan[];
      setPlans(plans);
      setLoading(false);
    }
    fetchPlans();
  }, [user, profile]);

  useEffect(() => {
    async function fetchSinglePlan() {
      const uid = user?.uid;
      if (!uid || !planID) {
        setSelectedPlan(null);
        setLoading(false);
        return;
      } else {
        setLoading(true);
        const docRef = doc(db, "users", uid, "plans", planID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSelectedPlan({
            id: docSnap.id,
            ...docSnap.data(),
          } as MasterPlan);
        } else {
          setSelectedPlan(null);
        }
        setLoading(false);
      }
    }
    fetchSinglePlan();
  }, [user, planID]);

  const createNewMasterPlan = async (planName: string, planSpec: string) => {
    const uid = user?.uid;
    if (!uid) return "";
    const docRef = await addDoc(collection(db, "users", uid, "plans"), {
      createdAt: new Date(),
      name: planName,
      specialization: planSpec,
      program: profile.program,
    });
    console.log("created new plan with ID: ", docRef.id);
    return docRef.id;
  };

  const deleteMasterPlan = async (planID: string) => {
    const uid = user?.uid;
    if (!uid) return;
    await deleteDoc(doc(db, "users", uid, "plans", planID));
    return;
  };

  return {
    plans,
    selectedPlan,
    loading,
    createNewMasterPlan,
    deleteMasterPlan,
  };
}
