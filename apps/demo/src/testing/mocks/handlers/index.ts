import { customersHandlers } from "./customers";
import { statsHandlers } from "./stats";

export const handlers = [...customersHandlers, ...statsHandlers];
