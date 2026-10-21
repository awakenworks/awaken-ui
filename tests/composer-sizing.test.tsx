import { act, render, screen } from "@testing-library/react";
import { ChatComposer, resizeComposerToContent } from "../src/index.js";

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

it("retains native row sizing when there is no measurable layout", () => {
  // C1 absent element => no effect. C2 hidden/zero scrollHeight => natural
  // rows, never 0px. C3 positive content height => exact measured size.
  // These helper partitions do not rely on jsdom pretending to render CSS.
  resizeComposerToContent(null);
  const field = document.createElement("textarea");
  Object.defineProperty(field, "scrollHeight", { configurable: true, value: 0 });
  resizeComposerToContent(field); expect(field.style.height).toBe("auto");
  Object.defineProperty(field, "scrollHeight", { configurable: true, value: 84 });
  resizeComposerToContent(field); expect(field.style.height).toBe("84px");
});

it("uses the same content measurement for reveal, reflow and hidden edits, then disconnects", () => {
  // Cause/effect table: R1 width 0 => keep native rows; R2 0->positive =>
  // resize retained multiline content; R3 same width + height change => no
  // feedback loop; R4 changed width => reflow; R5 hidden edit then reveal at
  // old width => measure new content. R6 unmount => disconnect.
  // R8 width observation -> measure next animation frame, outside the observer
  // delivery phase, so resizing cannot raise an undelivered-notification loop.
  // Every rule leaves the draft and product submit callback untouched.
  vi.useFakeTimers();
  let notify!: ResizeObserverCallback;
  const observe = vi.fn(), disconnect = vi.fn();
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { notify = callback; }
    observe = observe;
    disconnect = disconnect;
  });
  const submit = vi.fn();
  const view = (value: string) => <ChatComposer value={value} onChange={() => {}} onSubmit={submit} ariaLabel="Message" placeholder="Message" sendLabel="Send" />;
  const mounted = render(view("Retained\nmultiline draft"));
  const field = screen.getByRole("textbox") as HTMLTextAreaElement;
  let height = 0;
  Object.defineProperty(field, "scrollHeight", { configurable: true, get: () => height });
  const report = (width: number) => act(() => {
    notify([{
      target: field, contentRect: new DOMRectReadOnly(0, 0, width, 0),
      borderBoxSize: [], contentBoxSize: [], devicePixelContentBoxSize: [],
    }], {} as ResizeObserver);
    vi.advanceTimersToNextFrame();
  });
  report(0); expect(field.style.height).toBe("auto");
  height = 84; report(240); expect(field.style.height).toBe("84px");
  height = 999; report(240); expect(field.style.height).toBe("84px");
  height = 126; report(160); expect(field.style.height).toBe("126px");
  height = 0; report(0); mounted.rerender(view("Retained\nupdated\ndraft"));
  expect(field.style.height).toBe("auto");
  height = 168; report(160); expect(field.style.height).toBe("168px");
  expect(field.value).toBe("Retained\nupdated\ndraft");
  expect(observe).toHaveBeenCalledExactlyOnceWith(field);
  expect(submit).not.toHaveBeenCalled();
  mounted.unmount(); expect(disconnect).toHaveBeenCalledOnce();
});

it("keeps value-driven native measurement available without ResizeObserver", () => {
  // R7 observer unavailable => the existing explicit/value resize remains;
  // no replacement visibility tracker or dependency is introduced.
  vi.stubGlobal("ResizeObserver", undefined);
  const props = { onChange: () => {}, onSubmit: vi.fn(), ariaLabel: "Message", placeholder: "Message", sendLabel: "Send" };
  const mounted = render(<ChatComposer {...props} value="" />);
  const field = screen.getByRole("textbox");
  Object.defineProperty(field, "scrollHeight", { configurable: true, value: 42 });
  mounted.rerender(<ChatComposer {...props} value="Changed" />);
  expect(field.style.height).toBe("42px");
  expect(props.onSubmit).not.toHaveBeenCalled();
});
