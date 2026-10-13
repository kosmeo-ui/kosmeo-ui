"use client";

import { PropsWithChildren } from "react";
import "./styles.css";

const Centered = (props: PropsWithChildren) => {
  return <div className="k-centered">{props.children}</div>;
};

export default Centered;
