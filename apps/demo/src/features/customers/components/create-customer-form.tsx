import { PLAN_LABELS, PLAN_PRICES, TAG_OPTIONS } from "../utils/labels";
import { useCreateCustomer } from "../api/create-customer";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { currency } from "@/utils/format";
import type { Plan } from "@/types/api";
import { paths } from "@/config/paths";
import { toast } from "react-toastify";
import {
  Button,
  Card,
  CheckboxGroup,
  ColorPicker,
  DateInput,
  DetailField,
  FileUpload,
  Form,
  FormActions,
  FormError,
  FormGrid,
  ImagePreview,
  Input,
  MultiSelect,
  PhoneInput,
  RadioGroup,
  RichTextEditor,
  SearchSelect,
  Select,
  Stepper,
  Switch,
  Typeahead,
  type StepperStep,
} from "@kosmeo-ui/react";

const STEPS = [
  { key: "contact", label: "Contact" },
  { key: "company", label: "Company" },
  { key: "plan", label: "Plan" },
  { key: "review", label: "Review" },
];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "AU", name: "Australia" },
];

const INDUSTRIES = [
  { id: 1, name: "Software" },
  { id: 2, name: "Retail" },
  { id: 3, name: "Healthcare" },
  { id: 4, name: "Logistics" },
  { id: 5, name: "Manufacturing" },
  { id: 6, name: "Finance" },
  { id: 7, name: "Education" },
];

interface Draft {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: (typeof INDUSTRIES)[number] | null;
  country: (typeof COUNTRIES)[number] | null;
  city: string;
  street1: string;
  postalCode: string;
  brandColor: string;
  plan: Plan;
  seats: number;
  billing: "monthly" | "annual";
  startDate: string | null;
  tags: { name: string }[];
  channels: string[];
  sendWelcome: boolean;
  notes: string | undefined;
}

const EMPTY: Draft = {
  name: "",
  email: "",
  phone: "",
  company: "",
  industry: null,
  country: COUNTRIES[0],
  city: "",
  street1: "",
  postalCode: "",
  brandColor: "#3d52db",
  plan: "growth",
  seats: 5,
  billing: "monthly",
  startDate: new Date().toISOString().slice(0, 10),
  tags: [],
  channels: ["email"],
  sendWelcome: true,
  notes: undefined,
};

export const CreateCustomerForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [logo, setLogo] = useState<File[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const createCustomer = useCreateCustomer({
    mutationConfig: {
      onSuccess: (customer) => {
        toast.success(`Created ${customer.name}`);
        navigate(paths.app.customer.getHref(customer.id));
      },
    },
  });

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const logoUrls = useMemo(
    () => (logo ?? []).map((f) => URL.createObjectURL(f)),
    [logo]
  );
  useEffect(() => () => logoUrls.forEach(URL.revokeObjectURL), [logoUrls]);

  const steps: StepperStep[] = STEPS.map((s, i) => ({
    ...s,
    status: i < step ? "complete" : i === step ? "active" : "pending",
    clickable: i < step,
  }));

  const monthly = PLAN_PRICES[draft.plan] * draft.seats;
  const total = draft.billing === "annual" ? monthly * 12 * 0.85 : monthly;

  const next = () => {
    setError(null);
    if (step === 1 && !draft.industry) {
      setError("Pick an industry so we can tailor onboarding.");
      return;
    }
    setStep((s) => s + 1);
  };

  const submit = () =>
    createCustomer.mutate({
      data: {
        name: draft.name,
        company: draft.company,
        email: draft.email,
        phone: draft.phone,
        plan: draft.plan,
        seats: draft.seats,
        signedUp: draft.startDate ?? new Date().toISOString().slice(0, 10),
        street1: draft.street1,
        city: draft.city,
        stateProvince: "",
        postalCode: draft.postalCode,
        countryCode: draft.country?.code ?? "US",
        tags: draft.tags.map((t) => t.name),
        notes: draft.notes,
      },
    });

  const formId = `new-customer-${STEPS[step].key}`;

  return (
    <>
      <Stepper steps={steps} onStepClick={(_, i) => setStep(i)} />

      <Card>
        {step === 0 && (
          <Form id={formId} onSubmit={next}>
            <FormGrid columns={2}>
              <Input
                label="Full name"
                required
                autoFocus
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Ada Lovelace"
              />
              <Input
                label="Email"
                type="email"
                required
                value={draft.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="ada@example.com"
                helperText="We'll send the invite here"
              />
              <PhoneInput
                label="Phone"
                value={draft.phone}
                onChange={(v) => set("phone", v)}
                defaultCountry="US"
              />
              <DateInput
                label="Start date"
                value={draft.startDate}
                onChange={(v) => set("startDate", v)}
              />
            </FormGrid>
          </Form>
        )}

        {step === 1 && (
          <Form id={formId} onSubmit={next}>
            <FormGrid columns={2}>
              <Input
                label="Company"
                required
                value={draft.company}
                onChange={(e) => set("company", e.target.value)}
              />
              <Typeahead
                label="Industry"
                required
                options={INDUSTRIES}
                labelKey="name"
                value={draft.industry}
                onSelect={(v) => set("industry", v)}
                placeholder="Start typing…"
                showAll
              />
              <Input
                label="Street"
                value={draft.street1}
                onChange={(e) => set("street1", e.target.value)}
              />
              <Input
                label="City"
                value={draft.city}
                onChange={(e) => set("city", e.target.value)}
              />
              <SearchSelect
                label="Country"
                options={COUNTRIES}
                value={draft.country}
                getOptionKey={(c) => c.code}
                getOptionLabel={(c) => c.name}
                onSelect={(c) => set("country", c)}
              />
              <Input
                label="Postal code"
                value={draft.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
              />
              <ColorPicker
                label="Brand color"
                value={draft.brandColor}
                onChange={(hex) => set("brandColor", hex)}
              />
              <FileUpload
                label="Logo"
                accept="image/*"
                onFileSelect={setLogo}
                renderFiles={({ onClear, onChange }) => (
                  <ImagePreview
                    previewUrls={logoUrls}
                    onClear={onClear}
                    onChange={onChange}
                  />
                )}
              />
            </FormGrid>
            {error && <FormError>{error}</FormError>}
          </Form>
        )}

        {step === 2 && (
          <Form id={formId} onSubmit={next}>
            <FormGrid columns={2}>
              <Select<Plan>
                label="Plan"
                required
                value={draft.plan}
                options={Object.entries(PLAN_LABELS).map(([value, label]) => ({
                  value: value as Plan,
                  label: `${label} — ${currency(PLAN_PRICES[value as Plan])}/seat`,
                }))}
                onChange={(v) => v && set("plan", v)}
              />
              <Input
                label="Seats"
                type="number"
                min={1}
                max={500}
                required
                value={draft.seats}
                onChange={(e) =>
                  set("seats", Math.max(1, Number(e.target.value)))
                }
                suffix="seats"
              />
              <RadioGroup
                label="Billing"
                name="billing"
                value={draft.billing}
                onChange={(v) => set("billing", v)}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "annual", label: "Annual (save 15%)" },
                ]}
              />
              <CheckboxGroup
                label="Contact channels"
                name="channels"
                values={draft.channels}
                onChange={(v) => set("channels", v)}
                options={[
                  { value: "email", label: "Email" },
                  { value: "sms", label: "SMS" },
                  { value: "phone", label: "Phone" },
                ]}
              />
              <MultiSelect
                label="Tags"
                options={TAG_OPTIONS.map((name) => ({ name }))}
                labelKey="name"
                value={draft.tags}
                onChange={(v) => set("tags", v)}
                placeholder="Add tags"
              />
              <Switch
                label="Send welcome email"
                checked={draft.sendWelcome}
                onChange={(e) => set("sendWelcome", e.target.checked)}
              />
            </FormGrid>
            <RichTextEditor
              label="Internal notes"
              value={draft.notes}
              onChange={(html) => set("notes", html)}
              placeholder="Anything the account team should know"
            />
          </Form>
        )}

        {step === 3 && (
          <FormGrid columns={2}>
            <DetailField label="Name" value={draft.name || "—"} />
            <DetailField label="Email" value={draft.email || "—"} />
            <DetailField label="Company" value={draft.company || "—"} />
            <DetailField label="Industry" value={draft.industry?.name ?? "—"} />
            <DetailField
              label="Plan"
              value={`${PLAN_LABELS[draft.plan]} × ${draft.seats} seats`}
            />
            <DetailField
              label={
                draft.billing === "annual" ? "Annual total" : "Monthly total"
              }
              value={currency(total)}
            />
          </FormGrid>
        )}

        <FormActions align="between">
          <Button
            variant="secondary"
            onClick={() =>
              step === 0
                ? navigate(paths.app.customers.getHref())
                : setStep(step - 1)
            }
          >
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="submit" form={formId}>
              Continue
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={submit}
              isLoading={createCustomer.isPending}
            >
              Create customer
            </Button>
          )}
        </FormActions>
      </Card>
    </>
  );
};
