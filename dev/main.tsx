import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  ChatApproval,
  ChatComposer,
  ChatMessage,
  ChatThinking,
  ConfirmProvider,
  Dialog,
  Drawer,
  IdentityCard,
  MenuPopover,
  ReasoningBlock,
  ToolCallGroup,
  ToastProvider,
  useConfirm,
  useToast,
} from "../src/index.js";
import "../src/styles.css";
import "../src/styles/themes/awaken.css";
import "../src/styles/themes/oversight.css";
import "./theme.css";

function Gallery() {
  const confirm = useConfirm();
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [theme, setTheme] = useState<"awaken" | "oversight">("awaken");

  return (
    <main className="gallery" data-ui-theme={theme} data-product-theme={theme}>
      <header>
        <p className="gallery__eyebrow">Shared behavior · product-owned tokens</p>
        <h1>@awaken/ui</h1>
        <p>
          This development surface exercises only the public package API. Change
          the variables in <code>dev/theme.css</code> to simulate a product theme.
        </p>
        <div className="gallery__row">
          <Button variant={theme === "awaken" ? "primary" : "ghost"} onClick={() => setTheme("awaken")}>
            Awaken tokens
          </Button>
          <Button variant={theme === "oversight" ? "primary" : "ghost"} onClick={() => setTheme("oversight")}>
            Oversight tokens
          </Button>
        </div>
      </header>

      <section>
        <h2>Buttons</h2>
        <div className="gallery__row">
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading loadingLabel="Saving">
            Save
          </Button>
        </div>
      </section>

      <section>
        <h2>Identity and Agent conversation</h2>
        <IdentityCard
          avatar={{ label: "Reviewer Agent" }}
          name="Reviewer Agent"
          description="Reviews changes before execution"
          status={<span className="gallery__status">Online</span>}
          badges={<span className="gallery__badge">Agent</span>}
          metadata={<span>Claude · workspace default</span>}
        />
        <div className="gallery__chat">
          <ChatMessage role="user" authorLabel="You" timestamp="2026-07-24T10:12:00">
            Please inspect the deployment and explain the failure.
          </ChatMessage>
          <ChatMessage role="assistant" authorLabel="Reviewer" timestamp="2026-07-24T10:12:08">
            <p>I inspected the deployment. The health check is timing out.</p>
            <ReasoningBlock label="Reasoning">Comparing the last healthy revision with the current one.</ReasoningBlock>
            <ToolCallGroup
              summaryLabel="2 tool calls"
              labels={{
                input: "Input",
                output: "Result",
                inputAriaLabel: "Tool input",
                outputAriaLabel: "Tool result",
              }}
              calls={[
                { id: "one", name: "read_deployment", statusLabel: "Done", tone: "done", output: "revision-42" },
                { id: "two", name: "check_health", statusLabel: "Running", tone: "running", input: "api" },
              ]}
            />
            <ChatApproval
              title="Restart deployment?"
              description="The current requests will be drained first."
              approveLabel="Allow"
              rejectLabel="Deny"
              onApprove={() => undefined}
              onReject={() => undefined}
            />
          </ChatMessage>
          <ChatThinking label="Reviewer is working" formatElapsed={(seconds) => `${seconds}s`} />
          <ChatComposer
            value={draft}
            onChange={setDraft}
            onSubmit={() => setDraft("")}
            placeholder="Message Reviewer"
            ariaLabel="Message Reviewer"
            sendLabel="Send"
            stopLabel="Stop"
            hint="Ctrl/Cmd+Enter to send"
          />
        </div>
      </section>

      <section>
        <h2>Overlays and transient feedback</h2>
        <div className="gallery__row">
          <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          <MenuPopover
            aria-label="Resource actions"
            content={
              <>
                <Button variant="ghost">Open resource</Button>
                <Button variant="ghost">Duplicate resource</Button>
              </>
            }
          >
            <Button>Open actions</Button>
          </MenuPopover>
          <Button
            onClick={() => {
              void confirm({
                cancelLabel: "Keep resource",
                confirmLabel: "Delete resource",
                danger: true,
                description: "This action cannot be undone.",
                impacts: [
                  {
                    id: "history",
                    content: "Historical references remain visible.",
                    tone: "safe",
                  },
                ],
                title: "Delete resource?",
              }).then((accepted) => {
                toast.push({
                  message: accepted ? "Deletion confirmed" : "Deletion cancelled",
                  tone: accepted ? "warning" : "info",
                });
              });
            }}
          >
            Confirm action
          </Button>
          <Button
            onClick={() =>
              toast.push({
                message: "The draft was saved.",
                tone: "success",
              })
            }
          >
            Show toast
          </Button>
        </div>
      </section>

      <Dialog
        closeLabel="Close settings"
        description="The product supplies this copy and the form."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setDialogOpen(false)}>
              Save
            </Button>
          </>
        }
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title="Edit settings"
      >
        <label className="gallery__field">
          Display name
          <input defaultValue="Example" />
        </label>
      </Dialog>

      <Drawer
        closeLabel="Close details"
        description="A modal side panel with the same focus contract."
        onOpenChange={setDrawerOpen}
        open={drawerOpen}
        title="Resource details"
      >
        Product-owned detail content.
      </Drawer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider
      dismissLabel="Dismiss notification"
      regionLabel="Notifications"
    >
      <ConfirmProvider>
        <Gallery />
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>,
);
