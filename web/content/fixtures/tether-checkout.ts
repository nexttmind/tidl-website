/**
 * Demo Tether rails for protocol checkout.
 * Addresses are fixtures, not live settlement wallets.
 */

export type TetherRailId = "tron" | "ethereum";

export type TetherRail = {
  id: TetherRailId;
  label: string;
  token: string;
  address: string;
};

export const tetherCheckout = {
  methodLabel: "Tether",
  methodMeta: "USDT",
  cardLabel: "Card",
  amountNote: "One USDT equals one US dollar on this order.",
  sendNote:
    "Send only USDT on the selected network. Other tokens will not settle this order.",
  copyLabel: "Copy",
  copiedLabel: "Copied",
  rails: [
    {
      id: "tron",
      label: "Tron",
      token: "USDT TRC-20",
      address: "TQhZq1KqY8nW5mJ3xR7pL2cV9bF4dA6sE8u",
    },
    {
      id: "ethereum",
      label: "Ethereum",
      token: "USDT ERC-20",
      address: "0x7469646c00000000000000000000000000000001",
    },
  ] as const satisfies readonly TetherRail[],
};

export function usdtAmount(price: string): string {
  const n = Number(price.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return price;
  return `${n.toFixed(2)} USDT`;
}

export function resolveTetherRail(id: string): TetherRail {
  return (
    tetherCheckout.rails.find((rail) => rail.id === id) ??
    tetherCheckout.rails[0]
  );
}
