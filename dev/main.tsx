import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  ConfirmProvider,
  Dialog,
  Drawer,
  ToastProvider,
  useConfirm,
  useToast,
} from "../src/index.js";
import "../src/styles.css";
import "./theme.css";

function Gallery() {
  const confirm = useConfirm();
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <main className="gallery">
      <header>
        <p className="gallery__eyebrow">Shared behavior · product-owned tokens</p>
        <h1>@awaken/ui</h1>
        <p>
          This development surface exercises only the public package API. Change
          the variables in <code>dev/theme.css</code> to simulate a product theme.
        </p>
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
        <h2>Overlays and transient feedback</h2>
        <div className="gallery__row">
          <Button onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
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

