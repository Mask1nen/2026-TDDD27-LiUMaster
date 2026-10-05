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
  arrayRemove,
  arrayUnion,
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
      setLoadingPlan(false);
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
        setLoadingPlan(false);
      },
      (error) => {
        console.error("Fel vid hämtning av planer:", error);
        setLoadingPlan(false);
      },
    );

    // Städa upp lyssnaren när komponenten avmonteras
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !planID) {
      setSelectedPlan(null);
      setLoadingPlan(false);
      return;
    }

    let unsubscribeUser: (() => void) | undefined;

    const publicPlanRef = doc(db, "public_plans", planID);

    const unsubscribePublic = onSnapshot(
      publicPlanRef,
      (publicSnap) => {
        if (publicSnap.exists()) {
          // Finns i publika planer – avbryt eventuell lyssnare på privata planer
          if (unsubscribeUser) {
            unsubscribeUser();
            unsubscribeUser = undefined;
          }
          setSelectedPlan({
            id: publicSnap.id,
            ...publicSnap.data(),
          } as MasterPlan);
          setLoadingPlan(false);
        } else {
          // Finns inte i publika planer – lyssna på användarens privata plan i stället
          const userPlanRef = doc(db, "users", user.uid, "plans", planID);

          unsubscribeUser = onSnapshot(
            userPlanRef,
            (docSnap) => {
              if (docSnap.exists()) {
                setSelectedPlan({
                  id: docSnap.id,
                  ...docSnap.data(),
                } as MasterPlan);
              } else {
                setSelectedPlan(null);
              }
              setLoadingPlan(false);
            },
            (err) => {
              console.error(
                "Fel vid realtidsuppdatering av användarens plan:",
                err,
              );
              setSelectedPlan(null);
              setLoadingPlan(false);
            },
          );
        }
      },
      (error) => {
        console.error("Fel vid realtidsuppdatering av publik plan:", error);
        setSelectedPlan(null);
        setLoadingPlan(false);
      },
    );

    // Städa upp båda lyssnarna när komponenten unmountas eller planID/user ändras
    return () => {
      unsubscribePublic();
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, [user, planID]);

  const createNewMasterPlan = async (
    name: string,
    spec: string,
    isPrivate: boolean,
    program: string,
  ) => {
    try {
      if (creatingPlan) {
        console.error("Plan håller redan på att skapas, vänligen vänta.");
      }
      setCreatingPlan(true);
      const uid = user?.uid;

      // 1. Kontrollera om användaren faktiskt är inloggad
      if (!uid) {
        console.error("Fel: Ingen användare (uid) hittades!");
        return "";
      }

      console.log("Försöker skapa plan för användare:", uid);

      const newPlanData = {
        createdAt: new Date(),
        name: name || "New plan",
        specialization: spec,
        program: program,
        private: isPrivate,
        authorID: uid,
        authorName: user.displayName,
        courses: [],
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
      setCreatingPlan(false);
      return docRef.id;
    } catch (error) {
      console.error("Kunde inte spara planen i Firebase:", error);
      setCreatingPlan(false);
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

      const privatePlanRef = doc(db, "users", user.uid, "plans", plan.id);
      await updateDoc(privatePlanRef, {
        private: false,
      });

      const publicPlanRef = doc(db, "public_plans", plan.id);
      await setDoc(publicPlanRef, {
        ...plan,
        private: false,
        publishedAt: new Date(),
        editors: [],
        likes: 0,
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

  const updatePlan = async (updatedFields: Partial<MasterPlan>) => {
    if (!selectedPlan || !user) return;
    const planID = selectedPlan.id;
    const authorID = selectedPlan.authorID;

    try {
      const userPlanRef = doc(db, "users", authorID, "plans", planID);
      await updateDoc(userPlanRef, updatedFields);

      if (!selectedPlan.private) {
        const publicPlanRef = doc(db, "public_plans", planID);
        await updateDoc(publicPlanRef, updatedFields);
      }

      setSelectedPlan((prev) => (prev ? { ...prev, ...updatedFields } : null));
    } catch (error) {
      console.error("Kunde inte uppdatera planen i Firestore", error);
    }
  };

  const removeCourse = async (course: Course) => {
    if (!user || !selectedPlan) return;

    const authorID = selectedPlan.authorID;

    try {
      const planRef = doc(db, "users", authorID, "plans", selectedPlan.id);
      await updateDoc(planRef, {
        courses: arrayRemove(course),
      });
      if (!selectedPlan.private) {
        const publicPlanRef = doc(db, "public_plans", selectedPlan.id);
        await updateDoc(publicPlanRef, {
          courses: arrayRemove(course),
        });
      }
    } catch (error) {
      console.error("Kunde inte ta bort kurs från planen", error);
    }
  };

  const addCourse = async (course: Course) => {
    if (!user || !selectedPlan) return;

    const authorID = selectedPlan.authorID;

    try {
      const planRef = doc(db, "users", authorID, "plans", selectedPlan.id);
      await updateDoc(planRef, {
        courses: arrayUnion(course),
      });
      if (!selectedPlan.private) {
        const publicPlanRef = doc(db, "public_plans", selectedPlan.id);
        await updateDoc(publicPlanRef, {
          courses: arrayUnion(course),
        });
      }
    } catch (error) {
      console.error("Kunde inte lägga till kurs till planen", error);
    }
  };

  const addCollaborator = async (userID: string, planID: string) => {
    if (!user || !selectedPlan || selectedPlan.private) return;
    const publicPlanRef = doc(db, "public_plans", planID);
    if (publicPlanRef) {
      updateDoc(publicPlanRef, {
        collaborators: arrayUnion(userID),
      }).catch((err) =>
        console.error("Kunde inte lägga till samarbetspartner:", err),
      );
    }
  };

  const removeCollaborator = async (userID: string, planID: string) => {
    if (!user || !selectedPlan || selectedPlan.private) return;
    const publicPlanRef = doc(db, "public_plans", planID);
    if (publicPlanRef) {
      updateDoc(publicPlanRef, {
        collaborators: arrayRemove(userID),
      }).catch((err) =>
        console.error("Kunde inte ta bort samarbetspartner:", err),
      );
    }
  };

  const addEditor = async (userID: string, planID: string) => {
    if (!user || !selectedPlan) return;
    const publicPlanRef = doc(db, "public_plans", planID);
    if (publicPlanRef) {
      updateDoc(publicPlanRef, {
        editors: arrayUnion(userID),
      }).catch((err) =>
        console.error("Kunde inte lägga till redigerare:", err),
      );
    }
  };

  const removeEditor = async (userID: string, planID: string) => {
    if (!user || !selectedPlan) return;
    const publicPlanRef = doc(db, "public_plans", planID);
    if (publicPlanRef) {
      updateDoc(publicPlanRef, {
        editors: arrayRemove(userID),
      }).catch((err) =>
        console.error("Kunde inte ta bort samarbetspartner:", err),
      );
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
  };
}
