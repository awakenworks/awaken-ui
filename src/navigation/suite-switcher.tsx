import { ArrowRight } from "../icons/index.js";
import type { ReactElement, ReactNode } from "react";
import { MenuPopover, type PopoverPlacement } from "../overlays/popover.js";

export interface SuiteSwitcherProduct {
  readonly id: string;
  readonly label: ReactNode;
  readonly description?: ReactNode;
  readonly href?: string;
  readonly icon?: ReactNode;
  readonly isCurrent?: boolean;
}

export interface SuiteSwitcherDestination {
  readonly id: string;
  readonly label: ReactNode;
  readonly description?: ReactNode;
  readonly href: string;
  readonly icon?: ReactNode;
}

export interface SuiteSwitcherProps {
  readonly "aria-label": string;
  readonly trigger: ReactElement;
  readonly currentLabel: ReactNode;
  readonly products: readonly SuiteSwitcherProduct[];
  readonly destinations?: readonly SuiteSwitcherDestination[];
  readonly placement?: PopoverPlacement;
}

/**
 * Product-neutral suite navigation presentation.
 *
 * Consumers own every label, icon, URL and authorization decision. The shared
 * component owns the accessible menu, current-item treatment, focus/keyboard
 * behavior and the one consistent product/destination layout.
 */
export function SuiteSwitcher({
  "aria-label": ariaLabel,
  currentLabel,
  destinations = [],
  placement = "bottom-start",
  products,
  trigger,
}: SuiteSwitcherProps) {
  return (
    <MenuPopover
      aria-label={ariaLabel}
      closeOnContentClick
      content={(
        <div className="ui-suite-switcher">
          <div className="ui-suite-switcher__current-label">{currentLabel}</div>
          <div className="ui-suite-switcher__products">
            {products.map((product) => product.isCurrent || !product.href
              ? <div aria-current={product.isCurrent ? "page" : undefined} aria-disabled="true" className="ui-suite-switcher__item" data-current={product.isCurrent || undefined} key={product.id} role="menuitem">
                  <SuiteItemContent icon={product.icon} label={product.label} description={product.description} />
                </div>
              : <a className="ui-suite-switcher__item" href={product.href} key={product.id} role="menuitem">
                  <SuiteItemContent icon={product.icon} label={product.label} description={product.description} />
                  <ArrowRight className="ui-suite-switcher__arrow" />
                </a>)}
          </div>
          {destinations.length > 0 ? <div className="ui-suite-switcher__destinations">
            {destinations.map((destination) => <a className="ui-suite-switcher__item" href={destination.href} key={destination.id} role="menuitem">
              <SuiteItemContent icon={destination.icon} label={destination.label} description={destination.description} />
              <ArrowRight className="ui-suite-switcher__arrow" />
            </a>)}
          </div> : null}
        </div>
      )}
      placement={placement}
    >
      {trigger}
    </MenuPopover>
  );
}

function SuiteItemContent({
  description,
  icon,
  label,
}: Pick<SuiteSwitcherProduct, "description" | "icon" | "label">) {
  return <>
    {icon ? <span aria-hidden="true" className="ui-suite-switcher__icon">{icon}</span> : null}
    <span className="ui-suite-switcher__copy"><strong>{label}</strong>{description ? <small>{description}</small> : null}</span>
  </>;
}
