import { PropsWithChildren } from "react";
import "./styles.css";

const Centered = (props: PropsWithChildren) => {
  return <div className="centered">{props.children}</div>;
};

export default Centered;
