import { BrandMark } from "../src/brand/react.js";
import { brandMarkTitle, publicBrandMarks } from "../src/brand/marks.js";
import "../src/styles/brand.css";

export function BrandGallery() {
  return <section aria-label="Awaken brand family" style={{ fontFamily: "system-ui, sans-serif" }}>
    <h2>Awaken brand family</h2>
    {(["light", "dark"] as const).map((theme) => <div
      key={theme}
      data-theme={theme}
      style={{ background: theme === "light" ? "#f7f3eb" : "#17130f", color: theme === "light" ? "#17130f" : "#f7f3eb", padding: 16 }}
    >
      {publicBrandMarks.map((mark) => <div key={mark} className="gallery__row" style={{ alignItems: "center", minHeight: 64 }}>
        {[16, 24, 48].map((size) => <BrandMark key={size} mark={mark} style={{ width: size, height: size }} />)}
        <span>{brandMarkTitle(mark)}</span>
      </div>)}
    </div>)}
  </section>;
}
