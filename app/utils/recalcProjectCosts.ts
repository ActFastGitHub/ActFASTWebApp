// app/utils/recalcProjectCosts.ts

import prisma from "@/app/libs/prismadb";

/**
 * Recompute the project's totalMaterialCost, totalSubcontractorCost,
 * totalLaborCost, and totalProjectCost.
 * Also updates each Subcontractor's totalCost as "agreedCost + sum of its Materials"
 */
export async function recalcProjectCosts(projectCode: string) {
  // 1) Update all Materials' totalCost in DB (optional but good if you want to ensure no discrepancy)
  //    You can skip if you're already setting totalCost in your POST/PATCH for Materials.
  //    If you do want to ensure correctness from the DB side, you could do something like:
  //
  //    const allMats = await prisma.material.findMany({ where: { projectCode }});
  //    await Promise.all(
  //      allMats.map(async (m) => {
  //        const computed = (m.quantityOrdered || 0) * (m.costPerUnit || 0);
  //        if (computed !== m.totalCost) {
  //          await prisma.material.update({
  //            where: { id: m.id },
  //            data: { totalCost: computed },
  //          });
  //        }
  //      })
  //    );

  // 2) Sum up all materials
  const materials = await prisma.material.findMany({
    where: { projectCode },
  });
  const totalMaterialCost = materials.reduce(
    (acc, m) => acc + (m.totalCost || 0),
    0,
  );

  // 3) For each subcontractor, recalc their totalCost as (agreedCost + sum of assigned materials)
  const subs = await prisma.subcontractor.findMany({
    where: { projectCode },
  });
  let totalSubcontractorCost = 0;

  for (const sub of subs) {
    const subMats = await prisma.material.findMany({
      where: { subcontractorCode: sub.id },
    });
    const subMatCost = subMats.reduce((acc, m) => acc + (m.totalCost || 0), 0);
    const newSubTotal = (sub.agreedCost || 0) + subMatCost;

    totalSubcontractorCost += newSubTotal;

    // Update the subcontractor's own totalCost field
    if (newSubTotal !== sub.totalCost) {
      await prisma.subcontractor.update({
        where: { id: sub.id },
        data: { totalCost: newSubTotal },
      });
    }
  }

  // 4) Sum up all labor costs
  const labor = await prisma.laborCost.findMany({
    where: { projectCode },
  });
  const totalLaborCost = labor.reduce((acc, l) => acc + (l.totalCost || 0), 0);

  // 5) Project total = materials + subcontractors + labor
  const totalProjectCost =
    totalMaterialCost + totalSubcontractorCost + totalLaborCost;

  // 6) Update the Project with these new totals
  await prisma.project.update({
    where: { code: projectCode },
    data: {
      totalMaterialCost,
      totalSubcontractorCost,
      totalLaborCost,
      totalProjectCost,
    },
  });
}
