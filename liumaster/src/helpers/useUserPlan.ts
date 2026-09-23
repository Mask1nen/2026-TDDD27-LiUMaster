import { useState, useEffect } from "react";
import { useAuth } from "../context/UserAuthContext";
import {
  doc,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";

import { db } from "../firebase";

import type { MasterPlan } from "../types";

export function useUserPlan(planID?: string) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MasterPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MasterPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setLoading(false);
      return;
    }

    // onSnapshot lyssnar på förändringar i databasen i realtid
    const unsubscribe = onSnapshot(
      collection(db, "users", uid, "plans"),
      (querySnapshot) => {
        const fetchedPlans: MasterPlan[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MasterPlan[];

        setPlans(fetchedPlans);
        setLoading(false);
      },
      (error) => {
        console.error("Fel vid hämtning av planer:", error);
        setLoading(false);
      },
    );

    // Städa upp lyssnaren när komponenten avmonteras
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid || !planID) {
      setSelectedPlan(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, "users", uid, "plans", planID);

    // onSnapshot för det enskilda dokumentet
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setSelectedPlan({
            id: docSnap.id,
            ...docSnap.data(),
          } as MasterPlan);
        } else {
          setSelectedPlan(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Fel vid realtidsuppdatering av plan:", error);
        setSelectedPlan(null);
        setLoading(false);
      },
    );

    // Städa upp lyssnaren när planID ändras eller komponenten avmonteras
    return () => unsubscribe();
  }, [user, planID]);

  const createNewMasterPlan = async (
    name: string,
    spec: string,
    isPrivate: boolean,
    program: string,
  ) => {
    try {
      const uid = user?.uid;

      // 1. Kontrollera om användaren faktiskt är inloggad
      if (!uid) {
        console.error("Fel: Ingen användare (uid) hittades!");
        return "";
      }

      console.log("Försöker skapa plan för användare:", uid);

      const newPlanData = {
        createdAt: new Date(),
        name: name,
        specialization: spec,
        program: program,
        private: isPrivate,
      };

      // 2. Försök att skriva till Firestore
      const docRef = await addDoc(
        collection(db, "users", uid, "plans"),
        newPlanData,
      );

      console.log("Skapade plan med ID:", docRef.id);

      const createdPlan: MasterPlan = {
        id: docRef.id,
        ...newPlanData,
      } as MasterPlan;

      setPlans((prevPlans) => [...prevPlans, createdPlan]);
      if (!newPlanData.private) {
        publishPlan(createdPlan);
      }
      return docRef.id;
    } catch (error) {
      console.error("Kunde inte spara planen i Firebase:", error);
      return "";
    }
  };

  const deleteMasterPlan = async (planID: string) => {
    const uid = user?.uid;
    if (!uid) return;
    const planRef = doc(db, "users", uid, "plans", planID);
    const publicPlanRef = doc(db, "public_plans", planID);
    await deleteDoc(planRef);
    await deleteDoc(publicPlanRef);
    return;
  };

  const publishPlan = async (plan: MasterPlan) => {
    try {
      if (!user?.uid) {
        console.error("Användare inte inloggad");
        return;
      }

      // 1. Skapa en kopia i root-collection "public_plans"
      const publicPlanRef = doc(db, "public_plans", plan.id);

      await setDoc(publicPlanRef, {
        ...plan,
        authorId: user.uid,
        authorName: user?.displayName || "Anonym student",
        publishedAt: new Date(),
        likes: 0,
      });

      // 2. Markera den ursprungliga planen som publik i användarens egen subcollection
      const privatePlanRef = doc(db, "users", user.uid, "plans", plan.id);
      await updateDoc(privatePlanRef, {
        private: false,
      });

      console.log("Planen är nu publik!");
    } catch (error) {
      console.error("Kunde inte publicera planen:", error);
    }
  };

  // Bonus: Funktion för att ångra publicering
  const unpublishPlan = async (plan: MasterPlan) => {
    try {
      if (!user?.uid) return;

      const publicPlanRef = doc(db, "public_plans", plan.id);
      await deleteDoc(publicPlanRef);

      const privatePlanRef = doc(db, "users", user.uid, "plans", plan.id);
      await updateDoc(privatePlanRef, {
        private: true,
      });
    } catch (error) {
      console.error("Kunde inte avpublicera planen:", error);
    }
  };

  return {
    plans,
    selectedPlan,
    loading,
    createNewMasterPlan,
    deleteMasterPlan,
  };
}
