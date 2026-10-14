import { Outlet } from "react-router-dom";
import ConversationList from "../components/conversationlist";

export default function ConversationsLayout() {
  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex flex-col bg-surface-raised p-2 border-b-2 border-themedBorder rounded-md">
        <h1 className="text-5xl font-bold">Chattar</h1>
        <p>Dina konversationer med andra användare.</p>
      </div>
      <div className="flex flex-row size-full">
        <div className="w-72 shrink-0 border-2 border-themedBorder mx-2 p-2 bg-surface-raised">
          <ConversationList />
        </div>
        <main className="min-w-0 flex-1 border-2 border-themedBorder">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
