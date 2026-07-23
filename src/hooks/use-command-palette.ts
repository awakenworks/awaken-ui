import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEventHandler,
  type RefObject,
} from "react";

export type UseCommandPaletteOptions<Item> = {
  readonly open: boolean;
  readonly items: readonly Item[];
  readonly filterItems: (items: readonly Item[], query: string) => readonly Item[];
  readonly onOpenChange: (open: boolean) => void;
  readonly onSelect: (item: Item) => void | Promise<void>;
  readonly onEmptyEnter?: ((query: string) => void | Promise<void>) | undefined;
};

export type CommandPaletteState<Item> = {
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly query: string;
  readonly setQuery: (query: string) => void;
  readonly filteredItems: readonly Item[];
  readonly selectedIndex: number;
  readonly setSelectedIndex: (index: number) => void;
  readonly activeItem: Item | undefined;
  readonly activate: (item: Item) => void;
  readonly onInputKeyDown: KeyboardEventHandler<HTMLInputElement>;
};

export type UseCommandPaletteShortcutOptions = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Optional product event that requests opening the palette. */
  readonly openEventName?: string;
  readonly enabled?: boolean;
};

/** Owns the cross-platform Command/Ctrl+K shortcut and optional product event. */
export function useCommandPaletteShortcut({
  enabled = true,
  open,
  openEventName,
  onOpenChange,
}: UseCommandPaletteShortcutOptions): void {
  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    const onOpen = () => onOpenChange(true);
    window.addEventListener("keydown", onKeyDown);
    if (openEventName) window.addEventListener(openEventName, onOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (openEventName) window.removeEventListener(openEventName, onOpen);
    };
  }, [enabled, onOpenChange, open, openEventName]);
}

/**
 * Product-neutral command collection state. Consumers own command creation,
 * filtering vocabulary, rendering, execution, status copy, and routing.
 */
export function useCommandPalette<Item>({
  open,
  items,
  filterItems,
  onOpenChange,
  onSelect,
  onEmptyEnter,
}: UseCommandPaletteOptions<Item>): CommandPaletteState<Item> {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const filteredItems = useMemo(
    () => filterItems(items, query),
    [filterItems, items, query],
  );
  const activeItem = filteredItems[selectedIndex];

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setSelectedIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (filteredItems.length === 0) {
      setSelectedIndex(0);
    } else if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(filteredItems.length - 1);
    }
  }, [filteredItems.length, selectedIndex]);

  const onInputKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === "Escape") {
      onOpenChange(false);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelectedIndex((index) =>
        Math.min(index + 1, Math.max(0, filteredItems.length - 1)),
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeItem !== undefined) {
        void onSelect(activeItem);
      } else if (onEmptyEnter) {
        void onEmptyEnter(query);
      }
    }
  };

  return {
    inputRef,
    query,
    setQuery,
    filteredItems,
    selectedIndex,
    setSelectedIndex,
    activeItem,
    activate: (item) => void onSelect(item),
    onInputKeyDown,
  };
}
