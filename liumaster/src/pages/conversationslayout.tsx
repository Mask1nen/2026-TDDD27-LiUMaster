import { Outlet } from "react-router-dom";
import ConversationList from "../components/conversationlist";

export default function ConversationsLayout() {
  return (
    <div className="flex h-full">
      <aside className="w-72 shrink-0 overflow-y-auto border-r-2 border-neutral-700">
        <ConversationList />
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
