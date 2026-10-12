// components/conversationlist.tsx
import { NavLink } from "react-router-dom";
import { useConversationList } from "../hooks/useConversationList";
import UserAvatar from "./useravatar";
import { useUserProfile } from "../hooks/useUserProfile";

function ConversationListItem({ otherUserID }: { otherUserID: string }) {
  const { profile, loadingProfile } = useUserProfile(otherUserID);

  if (loadingProfile) return <h1>Loading user...</h1>;
  if (!profile) return <h1>No user found with this ID.</h1>;

  return (
    <NavLink
      to={`/conversations/${otherUserID}`}
      className={({ isActive }) =>
        `flex items-center gap-3 p-3 hover:bg-cyan-500 ${
          isActive ? "bg-cyan-500" : ""
        }`
      }
    >
      <UserAvatar
        userID={otherUserID}
        showTooltip={false}
        isOwner={false}
        pictureSize="h-10 w-10"
      />
      <h1 className="text-content">{profile.displayName}</h1>
    </NavLink>
  );
}

export default function ConversationList() {
  const { conversationList, loadingConversationList } = useConversationList();

  if (loadingConversationList) return <p className="p-3">Laddar…</p>;
  if (conversationList.length === 0)
    return <p className="p-3">Inga konversationer än.</p>;

  return (
    <ul className="bg-surface-raised text-content">
      {conversationList.map((c) => (
        <li key={c.conversationID}>
          <ConversationListItem otherUserID={c.otherUserID} />
        </li>
      ))}
    </ul>
  );
}
