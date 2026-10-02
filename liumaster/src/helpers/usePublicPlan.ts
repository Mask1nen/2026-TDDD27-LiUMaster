import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import type { MasterPlan } from "../types";

export function usePublicPlan() {
  const [publicPlans, setPublicPlans] = useState<MasterPlan[]>([]);
  const [loadingPublicPlans, setLoadingPublicPlans] = useState(true);

  useEffect(() => {
    // Sortera så att de nyaste planerna visas först
    const q = query(
      collection(db, "public_plans"),
      orderBy("publishedAt", "desc"),
    );

    // onSnapshot lyssnar på förändringar i realtid
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const plans = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as MasterPlan[];

        setPublicPlans(plans);
        setLoadingPublicPlans(false); // Avbryt loading när datan är hämtad
      },
      (error) => {
        console.error("Kunde inte hämta publika planer i realtid:", error);
        setLoadingPublicPlans(false);
      },
    );

    // Städa upp lyssnaren när komponenten avmonteras
    return () => unsubscribe();
  }, []);

  return { publicPlans, loadingPublicPlans };
}
