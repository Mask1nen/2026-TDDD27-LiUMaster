import { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import type { MasterPlan } from "../types";

type Options = {
  program?: string;
  excludeAuthorID?: string;
};

export function usePublicPlan({ program, excludeAuthorID }: Options = {}) {
  const [allPlans, setAllPlans] = useState<MasterPlan[]>([]);
  const [loadingPublicPlans, setLoadingPublicPlans] = useState(true);

  useEffect(() => {
    setLoadingPublicPlans(true);

    const q = query(
      collection(db, "plans"),
      where("private", "==", false),
      ...(program ? [where("program", "==", program)] : []),
      orderBy("publishedAt", "desc"),
      limit(100),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const plans = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MasterPlan[];

        setAllPlans(plans);
        setLoadingPublicPlans(false);
      },
      (error) => {
        console.error("Kunde inte hämta publika planer i realtid:", error);
        setLoadingPublicPlans(false);
      },
    );

    return () => unsubscribe();
  }, [program]);

  const publicPlans = useMemo(
    () =>
      excludeAuthorID
        ? allPlans.filter((p) => p.authorID != excludeAuthorID)
        : allPlans,
    [allPlans, loadingPublicPlans],
  );

  return { publicPlans, loadingPublicPlans };
}
