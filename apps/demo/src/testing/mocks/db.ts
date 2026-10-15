import type { Customer, CustomerStatus, Plan } from "@/types/api";

const TAGS = [
  "Beta program",
  "Champion",
  "Needs onboarding",
  "Renewal due",
  "Upsell",
  "Partner",
  "At risk",
];

const FIRST = [
  "Ada",
  "Grace",
  "Alan",
  "Linus",
  "Margaret",
  "Ken",
  "Barbara",
  "Dennis",
  "Frances",
  "Edsger",
  "Radia",
  "Tim",
  "Hedy",
  "Donald",
  "Katherine",
  "Guido",
  "Sophie",
  "Bjarne",
  "Anita",
  "John",
];
const LAST = [
  "Lovelace",
  "Hopper",
  "Turing",
  "Torvalds",
  "Hamilton",
  "Thompson",
  "Liskov",
  "Ritchie",
  "Allen",
  "Dijkstra",
  "Perlman",
  "Berners-Lee",
  "Lamarr",
  "Knuth",
  "Johnson",
  "van Rossum",
  "Wilson",
  "Stroustrup",
  "Borg",
  "McCarthy",
];
const COMPANIES = [
  "Northwind",
  "Contoso",
  "Initech",
  "Globex",
  "Umbrella",
  "Hooli",
  "Stark",
  "Wayne",
  "Acme",
  "Soylent",
  "Tyrell",
  "Cyberdyne",
  "Wonka",
  "Aperture",
  "Vandelay",
  "Pied Piper",
  "Massive Dynamic",
  "Gringotts",
];
const SUFFIXES = ["Labs", "Systems", "Industries", "Co.", "Group", "Logistics"];
const CITIES: [string, string, string, string][] = [
  ["Portland", "OR", "97205", "US"],
  ["Austin", "TX", "78701", "US"],
  ["Toronto", "ON", "M5H 2N2", "CA"],
  ["Denver", "CO", "80202", "US"],
  ["London", "", "EC1A 1BB", "GB"],
  ["Berlin", "", "10115", "DE"],
  ["Chicago", "IL", "60601", "US"],
  ["Sydney", "NSW", "2000", "AU"],
];
const STREETS = ["Main St", "Market St", "Oak Ave", "King St", "Harbor Rd"];

// Seeded so the same customers appear on every load.
const random = (() => {
  let seed = 20261013;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
})();
const pick = <T>(list: T[]) => list[Math.floor(random() * list.length)];

export const PLAN_PRICE: Record<Plan, number> = {
  starter: 29,
  growth: 99,
  enterprise: 499,
};

const createCustomers = (count: number): Customer[] =>
  Array.from({ length: count }, (_, i) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const company = `${pick(COMPANIES)} ${pick(SUFFIXES)}`;
    const plan = pick<Plan>([
      "starter",
      "starter",
      "growth",
      "growth",
      "enterprise",
    ]);
    const status = pick<CustomerStatus>([
      "active",
      "active",
      "active",
      "trial",
      "churned",
    ]);
    const seats = 1 + Math.floor(random() * (plan === "enterprise" ? 200 : 25));
    const [city, stateProvince, postalCode, countryCode] = pick(CITIES);
    const signedUp = new Date(
      Date.UTC(2024, 0, 1) + Math.floor(random() * 650) * 86_400_000
    );
    return {
      id: `cus_${String(1000 + i)}`,
      name: `${first} ${last}`,
      company,
      email:
        `${first}.${last}`.toLowerCase().replace(/[^a-z.]/g, "") +
        `@${company.split(" ")[0].toLowerCase()}.example`,
      phone: `+1503555${String(1000 + Math.floor(random() * 8999))}`,
      plan,
      status,
      mrr: status === "churned" ? 0 : PLAN_PRICE[plan] * seats,
      seats,
      signedUp: signedUp.toISOString().slice(0, 10),
      street1: `${100 + Math.floor(random() * 900)} ${pick(STREETS)}`,
      city,
      stateProvince,
      postalCode,
      countryCode,
      tags: TAGS.filter(() => random() < 0.2),
    };
  });

// An in-memory table standing in for a database. It resets on page load.
export const db = { customers: createCustomers(240) };
