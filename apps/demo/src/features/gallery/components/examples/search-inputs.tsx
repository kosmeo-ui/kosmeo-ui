import { FormGrid, SearchList, Typeahead } from "@kosmeo-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface City {
  id: number;
  name: string;
  country: string;
}

const CITIES: City[] = [
  { id: 1, name: "Amsterdam", country: "NL" },
  { id: 2, name: "Berlin", country: "DE" },
  { id: 3, name: "Chicago", country: "US" },
  { id: 4, name: "Denver", country: "US" },
  { id: 5, name: "Lisbon", country: "PT" },
  { id: 6, name: "Toronto", country: "CA" },
  { id: 7, name: "Tokyo", country: "JP" },
];

// SearchList calls `queryFn` as a hook on every render, so it can be any
// React Query hook. This one filters locally after a fake network delay.
const useCitySearch = (input: string, _searchKey: string, max: number) =>
  useQuery({
    queryKey: ["gallery-cities", input, max],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));
      return CITIES.filter((c) =>
        c.name.toLowerCase().includes(input.toLowerCase())
      ).slice(0, max);
    },
  });

export const SearchInputs = () => {
  const [typeaheadCity, setTypeaheadCity] = useState<City | null>(null);
  const [searchCity, setSearchCity] = useState<City | null>(null);

  return (
    <FormGrid columns={2}>
      <Typeahead
        label="Typeahead (local options)"
        options={CITIES}
        labelKey="name"
        value={typeaheadCity}
        onSelect={setTypeaheadCity}
        placeholder="Start typing a city"
        showAll
      />
      <SearchList<City>
        label="SearchList (queried)"
        value={searchCity}
        onSelect={setSearchCity}
        queryFn={useCitySearch}
        labelKey="name"
        searchKey="name"
        max={5}
        placeholder="Search cities"
        renderOption={(c) => ({
          label: c.name,
          node: (
            <span>
              {c.name} <small className="demo-muted">{c.country}</small>
            </span>
          ),
        })}
      />
    </FormGrid>
  );
};
