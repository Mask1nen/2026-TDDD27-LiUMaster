import { useEffect, useState, useMemo, useRef } from "react";
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
  arrayUnion,
  arrayRemove,
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
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user } = useAuth();
  const { profile } = useUserProfile(receiverID);

  const typingTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const isTypingRef = useRef(false);

  const conversationID = useMemo(
    () =>
      user?.uid && receiverID ? getConversationID(user.uid, receiverID) : null,
    [user?.uid, receiverID],
  );

  useEffect(() => {
    if (!conversationID) {
      setTypingUsers([]);
      return;
    }
    const unsubscribe = onSnapshot(
      doc(db, "conversations", conversationID),
      (snap) => setTypingUsers(snap.data()?.isTyping ?? []),
      (error) => console.error("Fel vid hämtning av skrivstatus:", error),
    );
    return () => unsubscribe();
  }, [conversationID]);

  // Lyssna på meddelanden
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
            participants: [user.uid, receiverID],
            messages,
            conversationName: profile?.displayName || "Okänd användare",
            isTyping: typingUsers.filter((id) => id !== user.uid),
          }
        : null,
    [
      user?.uid,
      receiverID,
      conversationID,
      messages,
      typingUsers,
      profile?.displayName,
    ],
  );

  async function setTyping(isTyping: boolean) {
    if (!user?.uid || !receiverID || !conversationID) return;

    await setDoc(
      doc(db, "conversations", conversationID),
      {
        participants: [user.uid, receiverID].sort(),
        isTyping: isTyping ? arrayUnion(user.uid) : arrayRemove(user.uid),
      },
      { merge: true },
    );
  }

  // Anropas från inputens onChange. Skriver bara till databasen när status ändras.
  function handleTyping() {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      setTyping(true).catch(console.error);
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      isTypingRef.current = false;
      setTyping(false).catch(console.error);
    }, 2000);
  }

  // Ta bort skrivstatus när man lämnar konversationen eller byter konversation
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeout.current);
      if (isTypingRef.current) {
        isTypingRef.current = false;
        setTyping(false).catch(console.error);
      }
    };
  }, [conversationID]);

  async function sendMessage(message: string) {
    const text = message.trim();
    if (!user?.uid || !receiverID || !conversationID || text === "") return;

    // Sluta visa "skriver..." direkt när meddelandet skickas
    clearTimeout(typingTimeout.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      setTyping(false).catch(console.error);
    }

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

  return { conversation, loadingConversation, sendMessage, handleTyping };
}
