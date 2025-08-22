import { Suspense } from "react";
import MoveClient from "./MoveClient";

export const dynamic = "force-dynamic"; // optional but helps avoid static export trips

export default function Page() {
  return (
    <Suspense fallback={<div className="pt-24 p-6">Loading…</div>}>
      <MoveClient />
    </Suspense>
  );
}
