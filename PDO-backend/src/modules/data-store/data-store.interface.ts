import type { IntentName } from "../../shared/interfaces.js";

export type IntentEvent =
  | {
      success: true;
      timestamp: number;
      intent: IntentName;
    }
  | {
      success: false;
      errors: string[];
      timestamp: number;
      intent: IntentName;
    };

export interface VCWithLinkedAttr {
  vc: string;
  attributeId: string;
}
