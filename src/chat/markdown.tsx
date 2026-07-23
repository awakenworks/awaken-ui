import DOMPurify from "dompurify";
import { Renderer, marked } from "marked";
import { useEffect, useMemo, useRef } from "react";
import { cx } from "../internal/cx.js";

const MARKDOWN_HINT = /[`*_#>|~\n]|\]\(|https?:\/\//;
const SAFE_URI = /^(?:(?:https?|mailto):|#|\/(?!\/)|[?.]|(?:\.{1,2}\/)|[A-Za-z0-9._~!$&'()*+,;=@%-]+(?:[/?#]|$))/i;
const TAGS = ["a", "b", "blockquote", "br", "code", "del", "div", "em", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "img", "input", "li", "ol", "p", "pre", "s", "span", "strong", "table", "tbody", "td", "th", "thead", "tr", "ul"];
const ATTRS = ["alt", "aria-label", "checked", "class", "colspan", "href", "rowspan", "src", "title", "type"];

export function hasMarkdown(text: string): boolean {
  return MARKDOWN_HINT.test(text);
}

function escapeAttribute(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("\"", "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function safeHref(href: string): string | null {
  const value = href.trim();
  return SAFE_URI.test(value) && !/^javascript:/i.test(value) ? value : null;
}

export function renderSafeMarkdown(markdown: string): string {
  const renderer = new Renderer();
  renderer.html = () => "";
  renderer.link = function renderLink({ href, title, tokens }) {
    const label = this.parser.parseInline(tokens);
    const safe = safeHref(href);
    if (!safe) return label;
    const titleAttr = title ? ` title="${escapeAttribute(title)}"` : "";
    return `<a href="${escapeAttribute(safe)}"${titleAttr}>${label}</a>`;
  };
  renderer.image = ({ href, title, text }) => {
    const safe = safeHref(href);
    if (!safe || /^mailto:/i.test(safe)) return "";
    const titleAttr = title ? ` title="${escapeAttribute(title)}"` : "";
    return `<img src="${escapeAttribute(safe)}" alt="${escapeAttribute(text)}"${titleAttr}>`;
  };
  const html = marked.parse(markdown, { async: false, gfm: true, renderer });
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: TAGS,
    ALLOWED_ATTR: ATTRS,
    ALLOWED_URI_REGEXP: SAFE_URI,
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ["onerror", "onload", "onclick", "style", "target"],
    FORBID_TAGS: ["button", "form", "iframe", "object", "script", "style", "svg"],
  });
}

export type ChatMarkdownProps = {
  readonly body: string;
  readonly copyCodeLabel: string;
  readonly copiedCodeLabel: string;
  readonly copyFailedLabel: string;
  readonly className?: string;
};

export function ChatMarkdown({
  body,
  copyCodeLabel,
  copiedCodeLabel,
  copyFailedLabel,
  className,
}: ChatMarkdownProps) {
  const rich = hasMarkdown(body);
  const html = useMemo(() => rich ? renderSafeMarkdown(body) : null, [body, rich]);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleanups = Array.from(root.querySelectorAll("pre")).map((pre) =>
      attachCodeCopy(pre as HTMLPreElement, { copyCodeLabel, copiedCodeLabel, copyFailedLabel }),
    );
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [copyCodeLabel, copiedCodeLabel, copyFailedLabel, html]);
  const classes = cx("ui-chat-markdown", className);
  if (!html) return <div ref={rootRef} className={classes}><p>{body}</p></div>;
  return <div ref={rootRef} className={classes} dangerouslySetInnerHTML={{ __html: html }} />;
}

function attachCodeCopy(
  pre: HTMLPreElement,
  labels: Pick<ChatMarkdownProps, "copyCodeLabel" | "copiedCodeLabel" | "copyFailedLabel">,
): () => void {
  const parent = pre.parentElement;
  if (!parent || parent.classList.contains("ui-chat-code")) return () => undefined;
  const wrapper = pre.ownerDocument.createElement("div");
  wrapper.className = "ui-chat-code";
  parent.insertBefore(wrapper, pre);
  wrapper.appendChild(pre);
  const button = pre.ownerDocument.createElement("button");
  button.type = "button";
  button.className = "ui-chat-code__copy";
  button.textContent = labels.copyCodeLabel;
  button.setAttribute("aria-label", labels.copyCodeLabel);
  wrapper.appendChild(button);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const click = () => {
    const value = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
    void globalThis.navigator?.clipboard?.writeText(value).then(
      () => { button.textContent = labels.copiedCodeLabel; },
      () => { button.textContent = labels.copyFailedLabel; },
    ).finally(() => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { button.textContent = labels.copyCodeLabel; }, 1500);
    });
  };
  button.addEventListener("click", click);
  return () => {
    if (timer) clearTimeout(timer);
    button.removeEventListener("click", click);
  };
}
