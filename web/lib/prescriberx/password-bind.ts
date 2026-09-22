/**
 * Attempt first-time password bind after issue-token.
 * Never reports success unless PUT /me/password returns OK.
 */

import { PrescribeRxError } from "./client";
import { prescribeRxPatientFetch } from "./patient-client";

export type PasswordBindResult =
  | { status: "bound" }
  | { status: "failed"; reason: "rejected" | "network" | "unexpected" }
  | { status: "skipped"; reason: "no_password" };

export async function bindPatientPassword(args: {
  patientToken: string;
  password: string;
  currentPassword?: string;
}): Promise<PasswordBindResult> {
  const password = args.password;
  if (!password || password.length < 8) {
    return { status: "skipped", reason: "no_password" };
  }

  try {
    await prescribeRxPatientFetch("/me/password", {
      method: "PUT",
      token: args.patientToken,
      body: {
        current_password: args.currentPassword ?? "",
        password,
        password_confirmation: password,
      },
    });
    return { status: "bound" };
  } catch (err) {
    if (err instanceof PrescribeRxError) {
      console.error(
        `[prescriberx-auth] password bind failed status=${err.status} (details omitted)`,
      );
      if (err.status === 502) {
        return { status: "failed", reason: "network" };
      }
      return { status: "failed", reason: "rejected" };
    }
    console.error("[prescriberx-auth] password bind unexpected failure");
    return { status: "failed", reason: "unexpected" };
  }
}
