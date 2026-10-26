"use client";

import { useState, FormEvent, ReactNode } from "react";
import FormError from "../formActions/formError.js";
import "./styles.css";

export interface FormProps {
  children: ReactNode;
  /** Called only once every field passes its `required`, `pattern`, `minLength`, `type` and `min`/`max` checks. */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  id?: string;
  noValidate?: boolean;
  /** A form-level error shown above the fields, such as the server's reason for rejecting the last submit. */
  error?: ReactNode;
}

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

// Set beside aria-invalid on the fields Form flags, so it clears only its own
// flags and leaves an Input's `error` alone.
const FLAG = "data-k-form-invalid";

const isField = (el: EventTarget): el is Field =>
  (el instanceof HTMLInputElement &&
    !["hidden", "submit", "button", "reset", "image"].includes(el.type)) ||
  el instanceof HTMLTextAreaElement ||
  el instanceof HTMLSelectElement;

// form.elements, not a query, so a field outside the <form> tag that names it
// with form="…" counts too.
const fieldsOf = (form: HTMLFormElement) =>
  Array.from(form.elements).filter(
    (el): el is Field => isField(el) && !el.disabled
  );

const isValid = (field: Field) => {
  if (field.required) {
    if (field instanceof HTMLInputElement && field.type === "checkbox") {
      if (!field.checked) return false;
    } else if (field.type !== "radio" && field.value.trim() === "") {
      // A read-only field (a picker built on Input) is barred from the
      // browser's own checks, so `required` is enforced here.
      return false;
    }
  }
  return field.validity.valid;
};

const flag = (field: Field) => {
  const valid = isValid(field);
  if (!valid) {
    field.setAttribute("aria-invalid", "true");
    field.setAttribute(FLAG, "");
  } else if (field.hasAttribute(FLAG)) {
    field.removeAttribute("aria-invalid");
    field.removeAttribute(FLAG);
  }
  return valid;
};

const countFlagged = (form: HTMLFormElement) =>
  fieldsOf(form).filter((f) => f.hasAttribute(FLAG)).length;

const Form = (props: FormProps) => {
  const { children, onSubmit, id, noValidate = true, error } = props;
  const [hasValidated, setHasValidated] = useState(false);
  const [invalidCount, setInvalidCount] = useState(0);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const invalid = fieldsOf(e.currentTarget).filter((f) => !flag(f));

    setHasValidated(true);
    setInvalidCount(invalid.length);
    if (invalid.length === 0) onSubmit(e);
    else invalid[0].focus();
  };

  // After the first submit, a field is checked again as it's edited, so its
  // flag and the banner clear as soon as it's fixed.
  const handleChange = (e: FormEvent<HTMLFormElement>) => {
    if (!hasValidated || !isField(e.target)) return;
    flag(e.target);
    setInvalidCount(countFlagged(e.currentTarget));
  };

  const banner =
    invalidCount > 0
      ? invalidCount === 1
        ? "Check the highlighted field."
        : `Check the ${invalidCount} highlighted fields.`
      : error;

  return (
    <form
      id={id}
      className="k-form"
      onSubmit={handleSubmit}
      onChange={handleChange}
      noValidate={noValidate}
    >
      {banner && <FormError>{banner}</FormError>}
      {children}
    </form>
  );
};

export default Form;
