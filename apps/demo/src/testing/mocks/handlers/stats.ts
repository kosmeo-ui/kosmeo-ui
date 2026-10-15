import { HttpResponse, http } from "msw";
import type { Stats } from "@/types/api";
import { networkDelay } from "../utils";
import { env } from "@/config/env";
import { db } from "../db";

export const statsHandlers = [
  http.get(`${env.API_URL}/stats`, async () => {
    await networkDelay();
    const active = db.customers.filter((c) => c.status === "active");
    return HttpResponse.json<Stats>({
      total: db.customers.length,
      active: active.length,
      trial: db.customers.filter((c) => c.status === "trial").length,
      churned: db.customers.filter((c) => c.status === "churned").length,
      mrr: active.reduce((sum, c) => sum + c.mrr, 0),
      seats: active.reduce((sum, c) => sum + c.seats, 0),
    });
  }),
];
