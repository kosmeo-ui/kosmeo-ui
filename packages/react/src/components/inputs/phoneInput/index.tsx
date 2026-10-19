"use client";

import { faCaretDown, faSearch } from "@fortawesome/free-solid-svg-icons";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useOutsideClick from "../../../hooks/useOutsideClick.js";
import { PropsWithSize } from "../../types.js";
import Input from "../input/index.js";
import "./styles.css";
import {
  AsYouType,
  CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

interface PhoneInputProps extends PropsWithSize {
  /** E.164 value (e.g. `+13093704188`) or empty string. */
  value?: string;
  /** Called with the new E.164 value (or empty when cleared). */
  onChange: (value: string) => void;
  /** ISO 3166-1 alpha-2 country code used when no `value` is set. */
  defaultCountry?: CountryCode;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: ReactNode;
  helperText?: ReactNode;
  id?: string;
  autoFocus?: boolean;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
}

const FAVORITES: CountryCode[] = [
  "US",
  "CA",
  "GB",
  "MX",
  "AU",
  "DE",
  "FR",
  "JP",
];

const flagEmoji = (cc: CountryCode): string =>
  cc
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const countryName = (cc: CountryCode): string => regionNames?.of(cc) ?? cc;

const PhoneInput = (props: PhoneInputProps) => {
  const {
    value = "",
    onChange,
    defaultCountry = "US",
    disabled,
    placeholder,
    size,
    ...restProps
  } = props;

  const [country, setCountry] = useState<CountryCode>(defaultCountry);
  const [display, setDisplay] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const pickerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const lastEmittedRef = useRef<string>("");

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    if (!value) {
      setDisplay("");
      return;
    }
    const parsed = parsePhoneNumberFromString(value);
    if (parsed?.country) {
      setCountry(parsed.country);
      setDisplay(parsed.formatNational());
    } else if (parsed) {
      setDisplay(parsed.formatNational());
    } else {
      const formatter = new AsYouType(country);
      setDisplay(formatter.input(value));
    }
  }, [value, country]);

  useEffect(() => {
    if (pickerOpen) {
      searchRef.current?.focus();
    } else {
      setSearch("");
    }
  }, [pickerOpen]);

  useOutsideClick([pickerRef], () => setPickerOpen(false));

  const emit = (nationalDigits: string, nextCountry: CountryCode) => {
    if (!nationalDigits) {
      lastEmittedRef.current = "";
      onChange("");
      return;
    }
    const e164 = `+${getCountryCallingCode(nextCountry)}${nationalDigits}`;
    lastEmittedRef.current = e164;
    onChange(e164);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatter = new AsYouType(country);
    const formatted = formatter.input(raw);
    const nationalDigits = formatter.getNationalNumber();
    const nextCountry = formatter.getCountry() ?? country;
    setCountry(nextCountry);
    setDisplay(formatted);
    emit(nationalDigits, nextCountry);
  };

  const handleCountrySelect = (cc: CountryCode) => {
    setCountry(cc);
    setPickerOpen(false);
    const current = new AsYouType(country);
    current.input(display);
    const digits = current.getNationalNumber();
    if (digits) {
      const formatter = new AsYouType(cc);
      const formatted = formatter.input(digits);
      setDisplay(formatted);
      emit(formatter.getNationalNumber(), cc);
    } else {
      emit("", cc);
    }
  };

  const orderedCountries = useMemo<CountryCode[]>(() => {
    const all = getCountries();
    const favSet = new Set(FAVORITES);
    const rest = all
      .filter((c) => !favSet.has(c))
      .sort((a, b) => countryName(a).localeCompare(countryName(b)));
    return [...FAVORITES.filter((c) => all.includes(c)), ...rest];
  }, []);

  const filteredCountries = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orderedCountries;
    return orderedCountries.filter((cc) => {
      const name = countryName(cc).toLowerCase();
      const dial = getCountryCallingCode(cc);
      return (
        name.includes(q) ||
        cc.toLowerCase().includes(q) ||
        dial.includes(q.replace(/^\+/, ""))
      );
    });
  }, [orderedCountries, search]);

  const prefix = (
    <div ref={pickerRef} className="k-phone-input-picker">
      <button
        type="button"
        className="k-phone-input-picker-trigger"
        onClick={() => !disabled && setPickerOpen((o) => !o)}
        disabled={disabled}
        // Starts with the visible "+1" so voice-control users can say what
        // they see (WCAG 2.5.3); the flag is decorative next to the name.
        aria-label={`+${getCountryCallingCode(country)} ${countryName(country)}, change country`}
        aria-expanded={pickerOpen}
      >
        <span className="k-phone-input-flag" aria-hidden="true">
          {flagEmoji(country)}
        </span>
        <span className="k-phone-input-dial">
          +{getCountryCallingCode(country)}
        </span>
        <FontAwesomeIcon icon={faCaretDown} className="k-phone-input-caret" />
      </button>
      {pickerOpen && (
        <div className="k-phone-input-panel">
          <div className="k-phone-input-search">
            <FontAwesomeIcon icon={faSearch} />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country or code"
              aria-label="Search country or code"
            />
          </div>
          <ul className="k-phone-input-list" role="listbox">
            {filteredCountries.map((cc) => (
              <li key={cc}>
                <button
                  type="button"
                  className={`k-phone-input-option ${
                    cc === country ? "selected" : ""
                  }`}
                  onClick={() => handleCountrySelect(cc)}
                  role="option"
                  aria-selected={cc === country}
                >
                  <span className="k-phone-input-flag">{flagEmoji(cc)}</span>
                  <span className="k-phone-input-name">{countryName(cc)}</span>
                  <span className="k-phone-input-dial">
                    +{getCountryCallingCode(cc)}
                  </span>
                </button>
              </li>
            ))}
            {filteredCountries.length === 0 && (
              <li className="k-phone-input-empty">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Input
      {...restProps}
      size={size}
      type="tel"
      value={display}
      onChange={handleInputChange}
      disabled={disabled}
      placeholder={placeholder ?? "(555) 555-5555"}
      prefix={prefix}
      autoComplete="tel-national"
    />
  );
};

export default PhoneInput;
