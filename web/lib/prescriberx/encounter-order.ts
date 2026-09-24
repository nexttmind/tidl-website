import type { EncounterStatusData } from "./encounter-status";

export type EncounterOrderRef = {
  orderId: string;
  orderNumber?: string;
  paymentStatus?: string;
};

export function unwrapEncounterOrder(
  data: EncounterStatusData | null,
): EncounterOrderRef | null {
  if (!data || typeof data !== "object") return null;
  const order = data.order;
  if (!order || typeof order !== "object") return null;
  const row = order as Record<string, unknown>;
  const orderId = row.order_id;
  if (typeof orderId !== "string" || !orderId) return null;
  return {
    orderId,
    orderNumber:
      typeof row.order_number === "string" ? row.order_number : undefined,
    paymentStatus:
      typeof row.payment_status === "string" ? row.payment_status : undefined,
  };
}

export function isEncounterOrderPaid(paymentStatus: string | undefined): boolean {
  if (!paymentStatus) return false;
  const s = paymentStatus.toLowerCase();
  return (
    s === "captured" ||
    s === "paid" ||
    s === "complete" ||
    s === "completed" ||
    s.includes("captured")
  );
}
