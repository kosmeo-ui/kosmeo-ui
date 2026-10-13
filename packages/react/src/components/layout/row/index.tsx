import { PropsWithSize, FlexAlign, FlexJustify } from "../../types";
import "./styles.css";

export interface RowProps extends PropsWithSize {
  /** The child element(s) that will appear in the Row */
  children: React.ReactNode;
  /** Inline styles forwarded to the underlying div. */
  style?: React.CSSProperties;
  /** Cross-axis alignment (`align-items`). Defaults to `stretch`. */
  align?: FlexAlign;
  /** Main-axis alignment (`justify-content`). Defaults to `start`. */
  justify?: FlexJustify;
  /** When true, enables `flex-wrap: wrap`. */
  wrap?: boolean;
  /** When true, renders as an inline-flex cluster (auto width, always row direction). Use for badge/tag groups beside other inline content. */
  inline?: boolean;
}

const Row = (props: RowProps) => {
  const { size = "md", align, justify, wrap, inline, style } = props;
  const classes = [
    "k-row",
    `k-row-${size}`,
    inline ? "k-row-inline" : "",
    align ? `k-flex-align-${align}` : "",
    justify ? `k-flex-justify-${justify}` : "",
    wrap ? "k-flex-wrap" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} style={style}>
      {props.children}
    </div>
  );
};

export default Row;
