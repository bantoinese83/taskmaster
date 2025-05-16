"use client"

import { SharedError } from "@/components/ui/shared-error";

export default function Error({ error }: { error: Error }) {
  return <SharedError error={error} />;
} 