import { useState } from "react";
import {
  DateInput,
  DateTimeInput,
  FormGrid,
  PhoneInput,
  TimeInput,
} from "@kosmeo-ui/react";

// The date inputs take and return ISO strings; PhoneInput returns E.164.
export const DateAndPhoneInputs = () => {
  const [date, setDate] = useState<string | null>("2026-10-14");
  const [dateTime, setDateTime] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>("09:30");
  const [phone, setPhone] = useState("");

  return (
    <FormGrid columns={2}>
      <DateInput
        label="DateInput"
        value={date}
        onChange={setDate}
        min="2026-01-01"
        helperText={`Value: ${date ?? "none"}`}
      />
      <DateTimeInput
        label="DateTimeInput"
        value={dateTime}
        onChange={setDateTime}
        helperText={`Value: ${dateTime ?? "none"}`}
      />
      <TimeInput
        label="TimeInput"
        value={time}
        onChange={setTime}
        helperText={`Value: ${time ?? "none"}`}
      />
      <PhoneInput
        label="PhoneInput"
        value={phone}
        onChange={setPhone}
        defaultCountry="US"
        helperText={`Value: ${phone || "none"}`}
      />
    </FormGrid>
  );
};
