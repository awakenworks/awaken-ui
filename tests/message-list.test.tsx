import { act, fireEvent, render, screen } from "@testing-library/react";
import { ChatMessageList } from "../src/index.js";

afterEach(() => vi.unstubAllGlobals());

it("uses one follow/read decision for content, resizing and hidden panes", () => {
  // DT-SCROLL causes: following/history, viewport visible/hidden, mutation/
  // resize, mounted/unmounted. R1 following+visible -> retain bottom on either
  // trigger; R2 history+visible -> preserve top and offer Latest; R3 hidden ->
  // preserve the decision; R4 explicit Latest -> resume; R5 unmount -> both
  // observers disconnect. No trigger focuses, submits or changes message data.
  let resize!: ResizeObserverCallback, mutate!: MutationCallback;
  const resized = vi.fn(), mutated = vi.fn();
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { resize = callback; }
    observe() {}
    disconnect = resized;
  });
  vi.stubGlobal("MutationObserver", class {
    constructor(callback: MutationCallback) { mutate = callback; }
    observe() {}
    disconnect = mutated;
  });
  const mounted = render(<ChatMessageList ariaLabel="History" jumpLabel="Latest">Original message</ChatMessageList>);
  const log = screen.getByRole("log");
  let height = 400, total = 1200;
  Object.defineProperties(log, {
    clientHeight: { get: () => height }, scrollHeight: { get: () => total },
  });
  log.scrollTo = vi.fn((options?: ScrollToOptions | number) => {
    log.scrollTop = Math.min(typeof options === "number" ? options : Number(options?.top), total - height);
  });
  const size = () => act(() => resize([], {} as ResizeObserver));
  const content = () => act(() => mutate([], {} as MutationObserver));
  size(); expect(log.scrollTop).toBe(800);
  // R7 native reflow scroll can precede the resize callback. It retains the
  // preceding follow decision, rather than silently switching to history.
  height = 268; log.scrollTop = 750; fireEvent.scroll(log);
  size(); expect(log.scrollTop).toBe(932);
  expect(screen.queryByRole("button", { name: "Latest" })).not.toBeInTheDocument();
  log.scrollTop = 300; fireEvent.scroll(log);
  height = 200; size(); total = 1600; content();
  expect(log.scrollTop).toBe(300);
  expect(screen.getByRole("button", { name: "Latest" })).toBeInTheDocument();
  height = 0; size(); fireEvent.scroll(log); height = 240; size();
  expect(log.scrollTop).toBe(300);
  fireEvent.click(screen.getByRole("button", { name: "Latest" }));
  expect(log.scrollTop).toBe(1360);
  total = 1800; content(); expect(log.scrollTop).toBe(1560);
  expect(log).toHaveAttribute("tabindex", "0");
  mounted.unmount(); expect(resized).toHaveBeenCalledOnce(); expect(mutated).toHaveBeenCalledOnce();
});

it("keeps native resizing available without a mutation observer", () => {
  // R6 unavailable MutationObserver -> ResizeObserver still owns viewport
  // changes; no alternate scroll implementation or durable state is created.
  vi.stubGlobal("MutationObserver", undefined);
  let notify!: ResizeObserverCallback;
  vi.stubGlobal("ResizeObserver", class {
    constructor(callback: ResizeObserverCallback) { notify = callback; }
    observe() {}
    disconnect() {}
  });
  render(<ChatMessageList ariaLabel="History" jumpLabel="Latest">Message</ChatMessageList>);
  const log = screen.getByRole("log");
  Object.defineProperties(log, { clientHeight: { value: 200 }, scrollHeight: { value: 800 } });
  log.scrollTo = vi.fn((options?: ScrollToOptions | number) => {
    log.scrollTop = (typeof options === "number" ? options : Number(options?.top)) - 200;
  });
  act(() => notify([], {} as ResizeObserver));
  expect(log.scrollTop).toBe(600);
});
