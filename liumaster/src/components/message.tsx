import type { Message } from "../types";
import UserAvatar from "./useravatar";

type MessageProps = {
  message: Message;
  isUser: boolean;
};

export function Message({ message, isUser = false }: MessageProps) {
  const timeStamp =
    message.sentAt.getHours() +
    ":" +
    (message.sentAt.getMinutes() < 10
      ? "0" + message.sentAt.getMinutes()
      : message.sentAt.getMinutes());
  return (
    <div className="flex flex-row items-center my-2">
      {!isUser && (
        <div className="flex flex-row items-center gap-2 min-w-50">
          <UserAvatar
            userID={message.senderID}
            pictureSize="w-10 h-10"
            showTooltip={true}
          />
          <p className="text-content">:</p>
          <h1 className="bg-blue-500 rounded-md p-2 w-fit max-w-1/2">
            {message.content}
          </h1>
          <h1 className="text-xs text-content text-baseline">{timeStamp}</h1>
        </div>
      )}
      {isUser && (
        <div className="flex justify-end w-full items-center gap-2">
          <h1 className="text-xs text-content text-baseline">{timeStamp}</h1>
          <h1 className="bg-green-500 rounded-md p-2 w-fit max-w-1/2">
            {message.content}
          </h1>
        </div>
      )}
    </div>
  );
}
