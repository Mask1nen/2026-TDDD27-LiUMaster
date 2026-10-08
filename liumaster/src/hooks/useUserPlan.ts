import { useState, useEffect } from "react";
import { useAuth } from "../context/UserAuthContext";
import {
  doc,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  onSnapshot,
  arrayRemove,
  arrayUnion,
  deleteField,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase";

import type { MasterPlan, Course } from "../types";

export function useUserPlan(planID?: string) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<MasterPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MasterPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<boolean>(true);
  const [creatingPlan, setCreatingPlan] = useState<boolean>(false);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setPlans([]);
      setLoadingPlan(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, "plans"), where("authorID", "==", uid)),
      (snap) => {
        setPlans(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as MasterPlan[],
        );
        setLoadingPlan(false);
      },
      (error) => {
        console.error("Fel vid hämtning av planer:", error);
        setLoadingPlan(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !planID) {
      setSelectedPlan(null);
      setLoadingPlan(false);
      return;
    }

    setLoadingPlan(true);
    const unsubscribe = onSnapshot(
      doc(db, "plans", planID),
      (snap) => {
        setSelectedPlan(
          snap.exists()
            ? ({ id: snap.id, ...snap.data() } as MasterPlan)
            : null,
        );
        setLoadingPlan(false);
      },
      (error) => {
        console.error("Fel vid realtidsuppdatering av plan:", error);
        setSelectedPlan(null);
        setLoadingPlan(false);
      },
    );

    return () => unsubscribe();
  }, [user, planID]);

  const createNewMasterPlan = async (
    name: string,
    spec: string,
    isPrivate: boolean,
    program: string,
  ) => {
    const uid = user?.uid;
    if (!uid) {
      console.error("Fel: Ingen användare (uid) hittades!");
      return "";
    }
    if (creatingPlan) {
      console.error("Plan håller redan på att skapas, vänligen vänta.");
      return "";
    }

    setCreatingPlan(true);
    try {
      const docRef = await addDoc(collection(db, "plans"), {
        createdAt: new Date(),
        name: name || "New plan",
        specialization: spec,
        program: program,
        private: isPrivate,
        isPrimary: false,
        authorID: uid,
        authorName: user.displayName,
        courses: [],
        collaborators: [],
        editors: [],
        ...(isPrivate ? {} : { publishedAt: new Date() }),
      });
      return docRef.id;
    } catch (error) {
      console.error("Kunde inte spara planen i Firebase:", error);
      return "";
    } finally {
      setCreatingPlan(false);
    }
  };

  const deleteMasterPlan = async (planID: string, isPrimary: boolean) => {
    if (!user) {
      console.error("Error: no user");
      return;
    }

    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, "plans", planID));
      if (isPrimary) {
        batch.update(doc(db, "users", user.uid), { primaryPlanID: "" });
      }
      await batch.commit();
    } catch (error) {
      console.error("Kunde inte radera planen:", error);
    }
  };

  const publishPlan = async (plan: MasterPlan) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "plans", plan.id), {
        private: false,
        publishedAt: new Date(),
      });
    } catch (error) {
      console.error("Kunde inte publicera planen:", error);
    }
  };

  const unpublishPlan = async (plan: MasterPlan) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "plans", plan.id), {
        private: true,
        isPrimary: false,
        collaborators: [],
        publishedAt: deleteField(),
      });
      if (plan.isPrimary) {
        batch.update(doc(db, "users", user.uid), { primaryPlanID: "" });
      }
      await batch.commit();
    } catch (error) {
      console.error("Kunde inte avpublicera planen:", error);
    }
  };

  const updatePlan = async (updatedFields: Partial<MasterPlan>) => {
    if (!selectedPlan || !user) return;
    try {
      await updateDoc(doc(db, "plans", selectedPlan.id), updatedFields);
    } catch (error) {
      console.error("Kunde inte uppdatera planen i Firestore", error);
    }
  };

  const removeCourse = async (course: Course) => {
    if (!user || !selectedPlan) return;
    try {
      await updateDoc(doc(db, "plans", selectedPlan.id), {
        courses: arrayRemove(course),
      });
    } catch (error) {
      console.error("Kunde inte ta bort kurs från planen", error);
    }
  };

  const addCourse = async (course: Course) => {
    if (!user || !selectedPlan) return;
    try {
      await updateDoc(doc(db, "plans", selectedPlan.id), {
        courses: arrayUnion(course),
      });
    } catch (error) {
      console.error("Kunde inte lägga till kurs till planen", error);
    }
  };

  const addCollaborator = async (userID: string, planID: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "plans", planID), {
        collaborators: arrayUnion(userID),
      });
    } catch (err) {
      console.error("Kunde inte lägga till samarbetspartner:", err);
    }
  };

  const removeCollaborator = async (userID: string, planID: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "plans", planID), {
        collaborators: arrayRemove(userID),
      });
    } catch (err) {
      console.error("Kunde inte ta bort samarbetspartner:", err);
    }
  };

  const addEditor = async (userID: string, planID: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "plans", planID), {
        editors: arrayUnion(userID),
      });
    } catch (err) {
      console.error("Kunde inte lägga till redigerare:", err);
    }
  };

  const removeEditor = async (userID: string, planID: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "plans", planID), {
        editors: arrayRemove(userID),
      });
    } catch (err) {
      console.error("Kunde inte ta bort redigerare:", err);
    }
  };

  const setPrimaryPlan = async (newPlanID: string, oldPlanID?: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "users", user.uid), { primaryPlanID: newPlanID });
      batch.update(doc(db, "plans", newPlanID), { isPrimary: true });

      if (oldPlanID && oldPlanID !== newPlanID) {
        batch.update(doc(db, "plans", oldPlanID), { isPrimary: false });
      }
      await batch.commit();
    } catch (error) {
      console.error("Kunde inte uppdatera primär plan:", error);
    }
  };

  const clearPrimaryPlan = async (planID: string) => {
    if (!user) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, "users", user.uid), { primaryPlanID: "" });
      batch.update(doc(db, "plans", planID), { isPrimary: false });
      await batch.commit();
    } catch (error) {
      console.error("Kunde inte rensa primär plan:", error);
    }
  };

  return {
    plans,
    selectedPlan,
    loadingPlan,
    createNewMasterPlan,
    deleteMasterPlan,
    publishPlan,
    unpublishPlan,
    updatePlan,
    removeCourse,
    addCourse,
    addCollaborator,
    removeCollaborator,
    addEditor,
    removeEditor,
    setPrimaryPlan,
    clearPrimaryPlan,
  };
}
