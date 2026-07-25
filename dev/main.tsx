import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  BreadcrumbItem,
  Breadcrumbs,
  ChatApproval,
  ChatComposer,
  ChatMessage,
  ChatThinking,
  ConfirmProvider,
  Dialog,
  DataGrid,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  Drawer,
  EditorForm,
  EventItem,
  EventList,
  EventTime,
  IdentityCard,
  InlineNotice,
  JsonInspector,
  MenuPopover,
  ReasoningBlock,
  SchemaForm,
  SecretField,
  SelectField,
  StatCard,
  StatGrid,
  Tab,
  TabList,
  TabNav,
  TabNavItem,
  TabPanel,
  Tabs,
  Switch,
  TextAreaField,
  TextField,
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
  const [schemaValue, setSchemaValue] = useState<unknown>({
    name: "Reviewer",
    enabled: true,
    instructions: "Review every proposed change.",
  });
  const [gridQuery, setGridQuery] = useState("");
  const [gridSort, setGridSort] = useState("name");
  const [switchEnabled, setSwitchEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
          <Switch
            checked={switchEnabled}
            label="Enable agent"
            onCheckedChange={setSwitchEnabled}
          />
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

      <section>
        <h2>Metric cards</h2>
        <StatGrid>
          <StatCard label="Active agents" tone="agent" value={12} />
          <StatCard label="Healthy runs" tone="success" value={38} />
          <StatCard label="Needs attention" tone="warning" value={3} />
        </StatGrid>
      </section>

      <section>
        <h2>Navigation and structured information</h2>
        <Breadcrumbs label="Location">
          <BreadcrumbItem href="#organization">Awaken</BreadcrumbItem>
          <BreadcrumbItem href="#workspace">Platform</BreadcrumbItem>
          <BreadcrumbItem current>Reviewer</BreadcrumbItem>
        </Breadcrumbs>
        <TabNav label="Resource pages">
          <TabNavItem href="#activity" current>Activity</TabNavItem>
          <TabNavItem href="#settings">Settings</TabNavItem>
        </TabNav>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabList aria-label="Agent editor sections">
            <Tab value="overview">Overview</Tab>
            <Tab value="tools">Tools</Tab>
          </TabList>
          <TabPanel value="overview">
            <InlineNotice tone="warning" title="Repository access required" actions={<Button size="sm">Configure</Button>}>
              Connect a repository before starting a run.
            </InlineNotice>
            <DescriptionList columns={2}>
              <DescriptionItem><DescriptionTerm>Type</DescriptionTerm><DescriptionDetails>Reviewer agent</DescriptionDetails></DescriptionItem>
              <DescriptionItem><DescriptionTerm>Revision</DescriptionTerm><DescriptionDetails>7c3b18a</DescriptionDetails></DescriptionItem>
            </DescriptionList>
            <EventList aria-label="Recent events">
              <EventItem title="Configuration updated" timestamp={<EventTime dateTime="2026-07-25T08:00:00Z">08:00</EventTime>}>Tools and instructions changed.</EventItem>
              <EventItem title="Readiness checked" timestamp={<EventTime dateTime="2026-07-25T08:02:00Z">08:02</EventTime>}>Repository access is still required.</EventItem>
            </EventList>
          </TabPanel>
          <TabPanel value="tools">Product-owned tool configuration.</TabPanel>
        </Tabs>
      </section>

      <section>
        <h2>Editor form</h2>
        <EditorForm
          assistant={<aside className="gallery__assistant">Agent drafting rail</aside>}
          cancelLabel="Cancel"
          onCancel={() => undefined}
          onSubmit={(event) => event.preventDefault()}
          pending={false}
          submitLabel="Save changes"
        >
          <label className="gallery__field">
            Name
            <input defaultValue="Release review" />
          </label>
        </EditorForm>
      </section>

      <section>
        <h2>Form fields</h2>
        <div className="gallery__fields">
          <TextField
            defaultValue="Reviewer Agent"
            help="Shown to workspace members"
            label="Display name"
          />
          <TextField
            action={<Button variant="ghost">Generate</Button>}
            defaultValue="reviewer-agent"
            label="Slug"
          />
          <SelectField defaultValue="review" label="Default role">
            <option value="review">Reviewer</option>
            <option value="execute">Executor</option>
          </SelectField>
          <TextAreaField
            defaultValue="Review every proposed change before execution."
            error="Instructions must be more specific."
            label="Instructions"
          />
        </div>
      </section>

      <section>
        <h2>Schema form</h2>
        <SchemaForm
          labels={{
            addItem: "Add item",
            invalidJson: "Invalid JSON",
            removeItem: "Remove item",
          }}
          onChange={setSchemaValue}
          schema={{
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string", title: "Agent name" },
              enabled: { type: "boolean", title: "Enabled", description: "Available for assignment" },
              instructions: { type: "string", title: "Instructions", format: "textarea" },
            },
          }}
          value={schemaValue}
        />
      </section>

      <section>
        <h2>Secret field</h2>
        <SecretField
          hasStored
          label="API token"
          labels={{
            clear: "Clear",
            cleared: "Stored secret will be removed.",
            keep: "Keep",
            kept: "Stored secret unchanged.",
            placeholder: "Enter a new token",
            replace: "Replace",
          }}
          onChange={() => undefined}
        />
      </section>

      <section>
        <h2>Data grid</h2>
        <DataGrid
          columns={[
            { key: "name", header: "Agent", cell: (row) => row.name, sortValue: (row) => row.name },
            { key: "status", header: "Status", cell: (row) => row.status },
          ]}
          filter={(row, query) => row.name.toLowerCase().includes(query.toLowerCase())}
          labels={{
            formatRange: ({ from, to, total }) => `${from}–${to} of ${total}`,
            next: "Next →",
            previous: "← Previous",
            searchPlaceholder: "Filter agents",
          }}
          renderEmpty={() => <span>No agents</span>}
          renderLoading={() => <tbody />}
          rowKey={(row) => row.name}
          rows={[
            { name: "Reviewer", status: "Online" },
            { name: "Planner", status: "Idle" },
          ]}
          state={{
            dir: "asc",
            page: 1,
            q: gridQuery,
            setPage: () => undefined,
            setQ: setGridQuery,
            setSort: setGridSort,
            sort: gridSort,
          }}
        />
      </section>

      <section>
        <h2>JSON inspector</h2>
        <JsonInspector
          value={{
            agent: "Reviewer",
            status: "ready",
            capabilities: ["review", "approve"],
          }}
        />
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
