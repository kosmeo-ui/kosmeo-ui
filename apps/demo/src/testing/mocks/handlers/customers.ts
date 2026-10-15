import type { Customer, CustomerInput } from "@/types/api";
import { getPath, networkDelay } from "../utils";
import { HttpResponse, http } from "msw";
import { PLAN_PRICE, db } from "../db";
import { env } from "@/config/env";

const compare = (value: unknown, raw: string) =>
  typeof value === "number"
    ? value - Number(raw)
    : String(value).localeCompare(raw);

// Applies the `filter[key]`, `filter[key_op]`, `filter[key_gte]` and
// `filter[key_lte]` params InfiniteScroll generates.
const applyFilters = (rows: Customer[], params: URLSearchParams) => {
  let result = rows;
  for (const [param, raw] of params) {
    const match = /^filter\[(.+?)(_op|_gte|_lte)?\]$/.exec(param);
    if (!match || match[2] === "_op") continue;
    const [, key, suffix] = match;
    const op = params.get(`filter[${key}_op]`);
    result = result.filter((row) => {
      const value = getPath(row, key);
      if (suffix === "_gte") return compare(value, raw) >= 0;
      if (suffix === "_lte") return compare(value, raw) <= 0;
      if (op === "in") return raw.split(",").includes(String(value));
      if (op === "contains")
        return String(value).toLowerCase().includes(raw.toLowerCase());
      return String(value) === raw;
    });
  }
  return result;
};

const notFound = () =>
  HttpResponse.json({ message: "Customer not found" }, { status: 404 });

export const customersHandlers = [
  http.get(`${env.API_URL}/customers`, async ({ request }) => {
    await networkDelay();
    const params = new URL(request.url).searchParams;
    const limit = Number(params.get("limit") ?? 10);
    // Cursor paging (InfiniteScroll) and offset paging (Pagination) share
    // this endpoint; the mock's cursor is just an offset.
    const start = Number(params.get("cursor") ?? params.get("offset") ?? 0);
    const sort = params.get("sort");
    const dir = params.get("sortDir") === "asc" ? 1 : -1;

    const rows = applyFilters([...db.customers], params);
    if (sort) {
      rows.sort((a, b) => {
        const av = getPath(a, sort) as string | number;
        const bv = getPath(b, sort) as string | number;
        return av < bv ? -dir : av > bv ? dir : 0;
      });
    }

    const next = start + limit;
    return HttpResponse.json({
      data: rows.slice(start, next),
      total: rows.length,
      hasMore: next < rows.length,
      limit,
      nextCursor: next < rows.length ? String(next) : null,
    });
  }),

  http.get(`${env.API_URL}/customers/:customerId`, async ({ params }) => {
    await networkDelay();
    const customer = db.customers.find((c) => c.id === params.customerId);
    return customer ? HttpResponse.json(customer) : notFound();
  }),

  http.post(`${env.API_URL}/customers`, async ({ request }) => {
    await networkDelay();
    const input = (await request.json()) as CustomerInput;
    const customer: Customer = {
      ...input,
      id: `cus_${1000 + db.customers.length}`,
      status: "trial",
      mrr: PLAN_PRICE[input.plan] * input.seats,
    };
    db.customers.unshift(customer);
    return HttpResponse.json(customer, { status: 201 });
  }),

  http.delete(`${env.API_URL}/customers/:customerId`, async ({ params }) => {
    await networkDelay();
    const index = db.customers.findIndex((c) => c.id === params.customerId);
    if (index === -1) return notFound();
    db.customers.splice(index, 1);
    return new HttpResponse(null, { status: 204 });
  }),
];
