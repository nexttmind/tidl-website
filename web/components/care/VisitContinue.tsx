"use client";

import { VisitBooking } from "@/components/care/VisitBooking";

type Props = {
  entrySlug: string;
  encounterId?: string;
  demo?: boolean;
};

export function VisitContinue(props: Props) {
  return <VisitBooking {...props} />;
}
