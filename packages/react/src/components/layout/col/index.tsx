"use client";

import { PropsWithSize, FlexAlign, FlexJustify } from "../../types.js";
import "./styles.css";

export interface ColProps extends PropsWithSize {
  /** The child element(s) that will appear in the Col */
  children: React.ReactNode;
  /** Inline styles forwarded to the underlying div. */
  style?: React.CSSProperties;
  /** Cross-axis alignment (`align-items`). Defaults to `stretch`. */
  align?: FlexAlign;
  /** Main-axis alignment (`justify-content`). Defaults to `start`. */
  justify?: FlexJustify;
  /** When true, enables `flex-wrap: wrap`. */
  wrap?: boolean;
  /** When `"full"`, spans every column of the parent grid (e.g. inside `FormGrid`). */
  span?: "full";
  /** Adds a top border + matching top margin/padding above the Col. */
  divider?: "solid-top";
}

const Col = (props: ColProps) => {
  const { size = "md", align, justify, wrap, span, divider, style } = props;
  const classes = [
    "k-col",
    `k-col-${size}`,
    align ? `k-flex-align-${align}` : "",
    justify ? `k-flex-justify-${justify}` : "",
    wrap ? "k-flex-wrap" : "",
    span ? `k-col-span-${span}` : "",
    divider ? `k-col-divider-${divider}` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} style={style}>
      {props.children}
    </div>
  );
};

export default Col;
