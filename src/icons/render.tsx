import { createElement, forwardRef, type SVGProps, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { iconAttributes, type IconData } from "./data.js";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children" | "dangerouslySetInnerHTML"> & {
  readonly size?: number | string;
  readonly label?: string;
};
export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

function reactAttributes(attributes: Readonly<Record<string, string | number>>) {
  return Object.fromEntries(Object.entries(attributes).map(([name, value]) => [
    name.replace(/-([a-z])/g, (_, character: string) => character.toUpperCase()), value,
  ]));
}

/** Internal adapter: static icon nodes are rendered as elements, never HTML strings. */
export function createIcon(name: string, data: IconData): IconComponent {
  const children = data[2]?.map(([tag, attributes], index) =>
    createElement(tag, { ...reactAttributes(attributes), key: index }));
  const defaults = reactAttributes(iconAttributes);
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ size = 16, label, className, ...props }, ref) {
    const accessibleName = label ?? props["aria-label"];
    const named = Boolean(accessibleName || props["aria-labelledby"]);
    return <svg {...defaults} width={size} height={size} {...props}
      ref={ref}
      className={["ui-icon", className].filter(Boolean).join(" ")}
      data-icon={name}
      role={named ? "img" : props.role}
      aria-label={accessibleName}
      aria-hidden={named ? undefined : true}
      focusable="false"
    >{children}</svg>;
  });
  Icon.displayName = name;
  return Icon;
}
