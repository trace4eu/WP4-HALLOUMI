import type { CheckResult, IntentName } from "../../shared/interfaces.js";

export type CheckFunction = (
  intent: IntentName,
  data: Record<string, unknown>
) => Promise<CheckResult> | CheckResult;

export type ChecksMap = Record<IntentName, CheckFunction>;
