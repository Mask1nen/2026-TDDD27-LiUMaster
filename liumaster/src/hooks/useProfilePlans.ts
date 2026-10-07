import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import type { MasterPlan } from "../types";

export function useProfilePlans(userID?: string, isOwnProfile = false) {
  const [profilePlans, setProfilePlans] = useState<MasterPlan[]>([]);
  const [loadingProfilePlans, setLoadingProfilePlans] = useState<boolean>(true);

  useEffect(() => {
    if (!userID) {
      setProfilePlans([]);
      setLoadingProfilePlans(false);
      return;
    }

    setLoadingProfilePlans(true);

    const constraints = [where("authorID", "==", userID)];
    if (!isOwnProfile) {
      constraints.push(where("private", "==", false));
    }

    const unsubscribe = onSnapshot(
      query(collection(db, "plans"), ...constraints),
      (snap) => {
        setProfilePlans(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as MasterPlan[],
        );
        setLoadingProfilePlans(false);
      },
      (error) => {
        console.error("Fel vid hämtning av profilens planer:", error);
        setProfilePlans([]);
        setLoadingProfilePlans(false);
      },
    );

    return () => unsubscribe();
  }, [userID, isOwnProfile]);

  return { profilePlans, loadingProfilePlans };
}
