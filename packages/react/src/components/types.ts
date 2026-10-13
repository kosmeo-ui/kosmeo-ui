export type Variant =
  | "primary"
  | "secondary"
  | "light"
  | "danger"
  | "warning"
  | "success"
  | "custom"
  | "link";

export type Size = "sm" | "md" | "lg";

export type FlexAlign = "start" | "center" | "end" | "baseline" | "stretch";
export type FlexJustify = "start" | "center" | "end" | "between" | "around";

export interface PropsWithVariant {
  /**
   * **_Optional_** variant for styling the component. Accepts one of the following:
   *
   * - `primary`
   * - `secondary`
   * - `light`
   * - `warning`
   * - `danger`
   * - `success`
   * - `custom` (badge only; requires `color` prop)
   * - `link` (button only; styled as inline text link)
   *
   * Defaults to `primary`
   */

  variant?: Variant;
}

export interface PropsWithSize {
  /**
   * **_Optional_** size for the component. Accepts one of the following:
   *
   * - `sm`
   * - `md`
   * - `lg`
   *
   * Defaults to `md`
   */
  size?: Size;
}
