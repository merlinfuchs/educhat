import { useChatHistoryStore } from "@/util/chatHistoryStore";
import { useHasHydrated } from "@/util/hasHydrated";
import { useUploadedFilesStore } from "@/util/uploadedFilesStore";
import { QueryRequest, QueryResponse } from "@/util/wire";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { shallow } from "zustand/shallow";

export default function Chat() {
  const hasHydrated = useHasHydrated();

  const messages = useChatHistoryStore((state) => state.messages, shallow);
  const [addMessage, clearMessages] = useChatHistoryStore(
    (state) => [state.addMessage, state.clearMessages],
    shallow
  );
  const selectedFiles = useUploadedFilesStore(
    (state) => state.files.filter((f) => f.selected).map((f) => f.hash),
    shallow
  );

  const [message, setMessage] = useState("");

  function sendMessage() {
    if (!message) {
      return;
    }

    setMessage("");
    addMessage({
      role: "user",
      message: message,
    });

    fetch("/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileHashes: selectedFiles,
        query: message,
      } as QueryRequest),
    })
      .then(async (resp) => {
        const data: QueryResponse = await resp.json();
        if (data.success) {
          addMessage({
            role: "bot",
            message: data.answer,
          });
        } else {
          alert(`Failed to query: ${data.error}`);
        }
      })
      .catch((err) => {
        alert(`Failed to query: ${err}`);
      });
  }

  return hasHydrated && selectedFiles.length > 0 ? (
    <>
      <div className="flex-auto p-5 space-y-3 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="bg-gray-200 p-3 rounded">
            {msg.message}
          </div>
        ))}
      </div>
      <div className="flex-none pb-8 px-10">
        <div className="relative">
          <textarea
            className="px-5 py-3 rounded-lg bg-gray-300 w-full text-lg focus:outline-none h-32 shadow-md"
            placeholder="Ask something ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
          />
          <button className="absolute top-2 right-2">
            <PaperAirplaneIcon
              className="w-8 h-8 text-gray-500 -rotate-45"
              onClick={sendMessage}
            />
          </button>
        </div>
      </div>
    </>
  ) : (
    <div className="flex items-center justify-center h-full text-lg">
      Upload and select at least one file in the list on the left side!
    </div>
  );
}
