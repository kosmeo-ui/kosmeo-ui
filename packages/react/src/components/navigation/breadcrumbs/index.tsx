import { PropsWithSize } from "../../types";
import "./styles.css";

export interface Breadcrumb {
  /** The text to be displayed to the user */
  label: string;
  /** The URL path that the user will be taken to when clicked */
  path: string;
  /**
   * Optional click handler. Receives the native event so consumers can
   * `preventDefault()` to override the anchor's navigation (e.g. to keep
   * SPA state rather than doing a full page load).
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

export interface BreadcrumbsProps extends PropsWithSize {
  /** An array of Breadcrumb object that represent each part of the Breadcrumb tree */
  items: Breadcrumb[];
}

const Breadcrumbs = (props: BreadcrumbsProps) => {
  const { size = "md" } = props;
  return (
    <nav aria-label="breadcrumb">
      <ol className="k-breadcrumbs-list">
        {props.items.map((item, index) => (
          <li
            key={index}
            className={`k-breadcrumb-item k-breadcrumb-item-${size}`}
          >
            {index < props.items.length - 1 ? (
              <a href={item.path} onClick={item.onClick}>
                {item.label}
              </a>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
