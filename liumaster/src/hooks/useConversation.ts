import { useEffect, useState, useMemo } from "react";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Conversation, Message } from "../types";
import { useAuth } from "../context/UserAuthContext";
import { useUserProfile } from "./useUserProfile";

export function getConversationID(userA: string, userB: string) {
  return [userA, userB].sort().join("_");
}

export function useConversation(receiverID: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversation, setLoadingConversation] = useState<boolean>(true);
  const { user } = useAuth();
  const { profile, loadingProfile } = useUserProfile(receiverID);

  const conversationID = useMemo(
    () =>
      user?.uid && receiverID ? getConversationID(user.uid, receiverID) : null,
    [user?.uid, receiverID],
  );

  useEffect(() => {
    if (!conversationID) {
      setMessages([]);
      setLoadingConversation(false);
      return;
    }

    setLoadingConversation(true);

    const q = query(
      collection(db, "conversations", conversationID, "messages"),
      orderBy("sentAt", "asc"),
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setMessages(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              messageID: d.id,
              senderID: data.senderID,
              receiverID: data.receiverID,
              content: data.content,
              sentAt: (data.sentAt as Timestamp | null)?.toDate() ?? new Date(),
            } satisfies Message;
          }),
        );
        setLoadingConversation(false);
      },
      (error) => {
        console.error("Fel vid hämtning av konversation:", error);
        setMessages([]);
        setLoadingConversation(false);
      },
    );

    return () => unsubscribe();
  }, [conversationID]);

  const conversation = useMemo<Conversation | null>(
    () =>
      user?.uid && receiverID && conversationID
        ? {
            conversationID,
            participants: [user?.uid, receiverID],
            messages,
            conversationName: profile?.displayName || "Okänd användare",
            isTyping: [],
          }
        : null,
    [user?.uid, receiverID, conversationID, messages],
  );

  async function sendMessage(message: string) {
    const text = message.trim();
    if (!user?.uid || !receiverID || !conversationID || text === "") return;

    const conversationRef = doc(db, "conversations", conversationID);

    await setDoc(
      conversationRef,
      {
        participants: [user.uid, receiverID].sort(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    await addDoc(collection(conversationRef, "messages"), {
      senderID: user.uid,
      receiverID,
      content: text,
      sentAt: serverTimestamp(),
    });
  }

  return { conversation, loadingConversation, sendMessage };
}
