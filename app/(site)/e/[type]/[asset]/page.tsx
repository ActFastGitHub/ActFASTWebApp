"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

const LS_QUEUE = "eqmove:queue";
const LS_DIR = "eqmove:direction";
const LS_PROJ = "eqmove:project";

export default function Page({
  params,
}: {
  params: { type: string; asset: string };
}) {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    try {
      const type = decodeURIComponent(params.type);
      const asset = params.asset;
      const direction = (sp.get("direction") || "OUT").toUpperCase();
      const quick = sp.get("quick") === "1";
      const project = sp.get("project") || "";

      // append to local batch
      const raw = localStorage.getItem(LS_QUEUE);
      const arr: Array<{ type: string; assetNumber: string }> = raw
        ? JSON.parse(raw)
        : [];
      const key = `${type}#${asset}`;
      if (!arr.some((r) => `${r.type}#${r.assetNumber}` === key)) {
        arr.push({ type, assetNumber: asset });
        localStorage.setItem(LS_QUEUE, JSON.stringify(arr));
      }

      // remember direction / project if present
      if (direction === "IN" || direction === "OUT") {
        localStorage.setItem(LS_DIR, direction);
      }
      if (project) {
        localStorage.setItem(LS_PROJ, project);
      }

      if (quick) {
        // This toast may or may not render before redirect on some phones — no biggie
        toast.success(`Added ${type} #${asset} to batch`);
      }
    } catch {
      /* ignore */
    }

    // Always land on the movement page; ensure quick=1
    const q = new URLSearchParams(sp.toString());
    q.set("type", decodeURIComponent(params.type));
    q.set("asset", params.asset);
    q.set("quick", "1");
    router.replace(`/equipment/move?${q.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pt-24 p-6 text-sm text-gray-600">
      Adding to batch…
    </div>
  );
}
