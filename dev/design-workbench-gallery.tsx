import { useState } from "react";
import { Button, DesignWorkbench, TextAreaField, TextField, type DesignWorkbenchMode } from "../src/index.js";
import familyTheme from "../src/styles/family.css?raw";

export function DesignWorkbenchGallery() {
  const [mode, setMode] = useState<DesignWorkbenchMode>("design");
  const parameters = new URLSearchParams(window.location.search);
  return <main className="workbench-gallery">
    <style>{familyTheme}</style>
    <style>{`
      .workbench-gallery { height: 100dvh; display: flex; flex-direction: column; }
      .workbench-gallery > header { padding: 1rem; }
      .workbench-gallery__scroll { flex: 1; min-height: 0; overflow: auto; padding: 1rem; }
      .workbench-gallery .ui-design-workbench__pane > div { display: grid; gap: 1rem; padding: 1rem; }
    `}</style>
    <header>Long-form authoring layout <Button onClick={() => setMode("describe")}>Request assistance</Button></header>
    <div className="workbench-gallery__scroll">
      <DesignWorkbench mode={mode} onModeChange={setMode}
        defaultRailCollapsed={parameters.get("rail") === "collapsed"}
        railPosition={parameters.get("side") === "end" ? "end" : "start"}
        labels={{ mode: "Design modes", describe: "Describe", design: "Design", test: "Test", review: "Review",
          rail: "Design assistant", editor: "Structured design", testPanel: "Test workspace", reviewPanel: "Review workspace",
          showRail: "Show assistant", hideRail: "Hide assistant" }}
        rail={<div><h2>Design assistant</h2>{Array.from({ length: 20 }, (_, index) => <p key={index}>Conversation turn {index + 1}</p>)}<TextAreaField label="Assistant message" /></div>}
        editor={<div>{Array.from({ length: 30 }, (_, index) => <TextField key={index} label={`Design field ${index + 1}`} />)}</div>}
        test={<div><TextAreaField label="Test input" /></div>}
        review={<div>Review the exact candidate</div>}
      />
    </div>
  </main>;
}
