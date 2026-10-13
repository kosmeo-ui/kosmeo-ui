"use client";

import { useState, FormEvent, ReactNode } from "react";
import { toast } from "react-toastify";
import "./styles.css";

interface FormProps {
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  id?: string;
  noValidate?: boolean;
}

const Form = (props: FormProps) => {
  const { children, onSubmit, id, noValidate = true } = props;
  const [hasValidated, setHasValidated] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    const allInputs = Array.from(
      formElement.querySelectorAll("input, textarea, select")
    );

    let isFormValid = true;

    for (const input of allInputs) {
      const inputElement = input as
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const isRequired = inputElement.hasAttribute("required");

      if (isRequired) {
        const isValid = validateInput(inputElement);
        if (!isValid) isFormValid = false;
      } else {
        inputElement.classList.add("k-input-valid");
        inputElement.classList.remove("k-input-invalid");
      }
    }

    setHasValidated(true);
    if (isFormValid) onSubmit(e);
    else toast.error("Please fill in all required fields.");
  };

  const validateInput = (input: Element) => {
    const inputElement = input as
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

    let isEmpty = false;
    if (inputElement.type === "checkbox") {
      isEmpty = !(inputElement as HTMLInputElement).checked;
    } else {
      isEmpty = !inputElement.value || inputElement.value.trim() === "";
    }

    if (isEmpty) {
      inputElement.classList.add("k-input-invalid");
      inputElement.classList.remove("k-input-valid");
      return false;
    } else {
      inputElement.classList.add("k-input-valid");
      inputElement.classList.remove("k-input-invalid");
    }
    return true;
  };

  return (
    <form
      id={id}
      className={`k-form ${hasValidated ? "k-form-validating" : ""}`}
      onSubmit={handleSubmit}
      noValidate={noValidate}
    >
      {children}
    </form>
  );
};

export default Form;
