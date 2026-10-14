import { useNavigate, useParams } from "react-router-dom";
import { useConversation } from "../hooks/useConversation";
import { useState } from "react";
import UserAvatar from "./useravatar";
import { useAuth } from "../context/UserAuthContext";
import { Message } from "./message";

export function Conversation() {
  const { receiverID } = useParams<{ receiverID: string }>();
  const { conversation, loadingConversation, sendMessage } = useConversation(
    receiverID || "",
  );
  const [message, setMessage] = useState<string>("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSend = async (): Promise<void> => {
    await sendMessage(message);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  if (loadingConversation) return <p>Laddar…</p>;
  if (!conversation || !receiverID || !user)
    return <p>Ingen konversation hittades.</p>;

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-5 border-b-2 border-themedBorder p-4">
        <UserAvatar
          userID={receiverID}
          showTooltip={true}
          isOwner={false}
          pictureSize="h-14 w-14"
          onClick={() => navigate(`/profile/${receiverID}`)}
        />
        <h1 className="text-3xl">
          {conversation.conversationName ?? "Okänd användare"}
        </h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-raised p-2 font-semibold text-white">
        {conversation.messages.map((m) => (
          <Message
            key={m.messageID}
            message={m}
            isUser={m.senderID === user.uid}
          />
        ))}
      </div>

      <div className="flex shrink-0 gap-2 border-t-2 border-themedBorder bg-surface-raised p-2 text-content">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 border-2 border-themedBorder px-2 py-1"
        />
        <button
          onClick={() => void handleSend()}
          className="cursor-pointer border-2 border-themedBorder bg-surface px-2 py-1"
        >
          Skicka
        </button>
      </div>
    </div>
  );
}

export default Conversation;
