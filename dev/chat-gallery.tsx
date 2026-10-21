import { useState } from "react";
import { Button, ChatComposer, ChatMessage, ChatMessageList } from "../src/index.js";

/** Geometry fixture for the public components, without a product transport. */
export function ChatGallery() {
  const [draft, setDraft] = useState("");
  const [count, setCount] = useState(24);
  return <main className="gallery" style={{ maxWidth: 800 }}>
    <h1>Conversation layout</h1>
    <Button onClick={() => setCount(count + 1)}>Append message</Button>
    <section aria-label="Conversation workbench" style={{ display: "flex", flexDirection: "column", height: "70dvh", minHeight: 300, gap: 8 }}>
      <ChatMessageList ariaLabel="Conversation history" jumpLabel="Latest" className="gallery-chat-list">
        {Array.from({ length: count }, (_, i) => <ChatMessage key={i} role="assistant" authorLabel="Reviewer">
          Message {i + 1}: inspect the evidence before deciding the next action.
        </ChatMessage>)}
      </ChatMessageList>
      <ChatComposer value={draft} onChange={setDraft} onSubmit={() => setDraft("")}
        ariaLabel="Message" placeholder="Describe the task" sendLabel="Send" sendMode="enter"
        hint="Enter to send · Shift+Enter for a new line" />
    </section>
    <style>{`.gallery-chat-list{flex:1;min-height:0}`}</style>
  </main>;
}
