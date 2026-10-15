import { useState } from "react";
import {
  FormGrid,
  LanguageSelect,
  MultiSelect,
  SearchSelect,
  Select,
} from "@kosmeo-ui/react";

type Priority = "low" | "medium" | "high";

const FRUITS = [
  { name: "Apple" },
  { name: "Banana" },
  { name: "Cherry" },
  { name: "Mango" },
  { name: "Peach" },
];

const TIMEZONES = [
  { id: "America/Los_Angeles", label: "Pacific Time", offset: "UTC−8" },
  { id: "America/New_York", label: "Eastern Time", offset: "UTC−5" },
  { id: "Europe/London", label: "London", offset: "UTC+0" },
  { id: "Europe/Berlin", label: "Berlin", offset: "UTC+1" },
  { id: "Asia/Tokyo", label: "Tokyo", offset: "UTC+9" },
];

export const Selects = () => {
  const [priority, setPriority] = useState<Priority | undefined>("medium");
  const [fruits, setFruits] = useState([FRUITS[1]]);
  const [timezone, setTimezone] = useState<(typeof TIMEZONES)[number] | null>(
    null
  );
  const [language, setLanguage] = useState<string | null>("en");

  return (
    <FormGrid columns={2}>
      <Select<Priority>
        label="Select"
        placeholder="Pick a priority"
        value={priority}
        onChange={setPriority}
        options={[
          { value: "low", label: "Low" },
          { value: "medium", label: "Medium" },
          { value: "high", label: "High" },
        ]}
      />
      <MultiSelect
        label="MultiSelect"
        options={FRUITS}
        labelKey="name"
        value={fruits}
        onChange={setFruits}
        placeholder="Pick fruit"
      />
      <SearchSelect
        label="SearchSelect"
        placeholder="Type to filter"
        options={TIMEZONES}
        value={timezone}
        getOptionKey={(tz) => tz.id}
        getOptionLabel={(tz) => tz.label}
        renderOption={(tz) => (
          <span>
            {tz.label} <small className="demo-muted">{tz.offset}</small>
          </span>
        )}
        onSelect={setTimezone}
      />
      <LanguageSelect
        label="LanguageSelect"
        value={language}
        onChange={setLanguage}
        includeNone
      />
    </FormGrid>
  );
};
