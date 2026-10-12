// hooks/useConversationList.ts
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/UserAuthContext";

export type ConversationSummary = {
  conversationID: string;
  otherUserID: string;
};

export function useConversationList() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [conversationList, setConversationList] = useState<
    ConversationSummary[]
  >([]);
  const [loadingConversationList, setLoadingConversationList] =
    useState<boolean>(true);

  useEffect(() => {
    if (!uid) {
      setConversationList([]);
      setLoadingConversationList(false);
      return;
    }

    setLoadingConversationList(true);
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", uid),
      orderBy("updatedAt", "desc"),
    );

    return onSnapshot(
      q,
      (snap) => {
        const next: ConversationSummary[] = [];
        for (const d of snap.docs) {
          const participants: unknown = d.data().participants;
          if (!Array.isArray(participants)) continue;
          const other = participants.find(
            (p): p is string => typeof p === "string" && p !== uid,
          );
          if (other) next.push({ conversationID: d.id, otherUserID: other });
        }
        setConversationList(next);
        setLoadingConversationList(false);
      },
      (error: Error) => {
        console.error("Fel vid hämtning av konversationer:", error);
        setConversationList([]);
        setLoadingConversationList(false);
      },
    );
  }, [uid]);

  return { conversationList, loadingConversationList };
}
