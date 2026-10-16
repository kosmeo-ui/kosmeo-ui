"use client";

import "./styles.css";

// Hidden from assistive tech, which reads "required" from the field itself.
const MandatoryAsterisk = () => (
  <span className="k-mandatory-asterisk" aria-hidden="true">
    {" "}
    *
  </span>
);

export default MandatoryAsterisk;
