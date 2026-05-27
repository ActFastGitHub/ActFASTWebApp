// app/libs/backupRegistry.ts

import prisma from "@/app/libs/prismadb";

export const APP_BACKUP_VERSION = "2.0.0";
export const APP_SCHEMA_VERSION = "actfast-prisma-2026-05-27";

export type RestoreMode = "INSERT_MISSING" | "UPSERT" | "REPLACE_SELECTED";

export type BackupCollectionKey =
  | "users"
  | "accounts"
  | "profiles"
  | "locations"
  | "addresses"
  | "projects"
  | "boxes"
  | "items"
  | "spreadsheetEntries"
  | "materials"
  | "subcontractors"
  | "laborCosts"
  | "officeSupplies"
  | "equipment"
  | "equipmentMovements"
  | "projectUpdates"
  | "finalRepairsAgreements"
  | "finalRepairMaterialSelections"
  | "materialCatalogItems"
  | "auditLogs"
  | "backupLogs";

type BackupRegistryItem = {
  key: BackupCollectionKey;
  label: string;
  delegate: any;
  restoreOrder: number;
  defaultEnabled: boolean;
  systemCollection?: boolean;
  dateFields?: string[];
};

export const backupRegistry: BackupRegistryItem[] = [
  {
    key: "users",
    label: "Users",
    delegate: prisma.user,
    restoreOrder: 10,
    defaultEnabled: false,
    systemCollection: true,
    dateFields: [
      "emailVerified",
      "createdAt",
      "updatedAt",
      "passwordResetExpires",
    ],
  },
  {
    key: "accounts",
    label: "Auth Accounts",
    delegate: prisma.account,
    restoreOrder: 20,
    defaultEnabled: false,
    systemCollection: true,
  },
  {
    key: "profiles",
    label: "Profiles",
    delegate: prisma.profile,
    restoreOrder: 30,
    defaultEnabled: true,
  },
  {
    key: "locations",
    label: "Locations",
    delegate: prisma.location,
    restoreOrder: 40,
    defaultEnabled: true,
  },
  {
    key: "addresses",
    label: "Addresses",
    delegate: prisma.address,
    restoreOrder: 50,
    defaultEnabled: true,
  },
  {
    key: "projects",
    label: "Projects",
    delegate: prisma.project,
    restoreOrder: 100,
    defaultEnabled: true,
  },
  {
    key: "boxes",
    label: "Boxes",
    delegate: prisma.box,
    restoreOrder: 110,
    defaultEnabled: true,
    dateFields: ["createdAt", "updatedAt"],
  },
  {
    key: "items",
    label: "Items",
    delegate: prisma.item,
    restoreOrder: 120,
    defaultEnabled: true,
    dateFields: ["packedInAt", "packedOutAt", "addedAt", "lastModifiedAt"],
  },
  {
    key: "spreadsheetEntries",
    label: "Project Spreadsheets",
    delegate: prisma.spreadsheetEntry,
    restoreOrder: 130,
    defaultEnabled: true,
    dateFields: ["createdAt", "updatedAt"],
  },
  {
    key: "materials",
    label: "Materials",
    delegate: prisma.material,
    restoreOrder: 140,
    defaultEnabled: true,
    dateFields: ["createdAt", "lastModifiedAt"],
  },
  {
    key: "subcontractors",
    label: "Subcontractors",
    delegate: prisma.subcontractor,
    restoreOrder: 150,
    defaultEnabled: true,
    dateFields: ["createdAt", "lastModifiedAt"],
  },
  {
    key: "laborCosts",
    label: "Labor Costs",
    delegate: prisma.laborCost,
    restoreOrder: 160,
    defaultEnabled: true,
    dateFields: ["createdAt", "lastModifiedAt"],
  },
  {
    key: "officeSupplies",
    label: "Office Supplies",
    delegate: prisma.officeSupply,
    restoreOrder: 170,
    defaultEnabled: true,
    dateFields: ["statusUpdatedAt", "createdAt", "updatedAt"],
  },
  {
    key: "equipment",
    label: "Equipment",
    delegate: prisma.equipment,
    restoreOrder: 180,
    defaultEnabled: true,
    dateFields: ["lastMovedAt", "createdAt", "updatedAt"],
  },
  {
    key: "equipmentMovements",
    label: "Equipment Movements",
    delegate: prisma.equipmentMovement,
    restoreOrder: 190,
    defaultEnabled: true,
    dateFields: ["at"],
  },
  {
    key: "projectUpdates",
    label: "Project Updates",
    delegate: prisma.projectUpdate,
    restoreOrder: 200,
    defaultEnabled: true,
    dateFields: [
      "whatsappSharedAt",
      "dropboxSyncedAt",
      "editedAt",
      "deletedAt",
      "createdAt",
      "updatedAt",
    ],
  },
  {
    key: "finalRepairsAgreements",
    label: "Final Repairs Agreements",
    delegate: prisma.finalRepairsAgreement,
    restoreOrder: 300,
    defaultEnabled: true,
    dateFields: ["createdAt", "lastModifiedAt", "deletedAt"],
  },
  {
    key: "finalRepairMaterialSelections",
    label: "Final Repair Material Selections",
    delegate: prisma.finalRepairMaterialSelection,
    restoreOrder: 310,
    defaultEnabled: true,
    dateFields: ["createdAt", "lastModifiedAt"],
  },
  {
    key: "materialCatalogItems",
    label: "Material Catalog Items",
    delegate: prisma.materialCatalogItem,
    restoreOrder: 320,
    defaultEnabled: true,
    dateFields: ["createdAt", "lastModifiedAt", "lastUsedAt"],
  },
  {
    key: "auditLogs",
    label: "Audit Logs",
    delegate: prisma.auditLog,
    restoreOrder: 900,
    defaultEnabled: false,
    systemCollection: true,
    dateFields: ["createdAt"],
  },
  {
    key: "backupLogs",
    label: "Backup Logs",
    delegate: prisma.backupLog,
    restoreOrder: 910,
    defaultEnabled: false,
    systemCollection: true,
    dateFields: ["createdAt", "completedAt"],
  },
];

export function getBackupRegistryItem(key: string) {
  return backupRegistry.find((item) => item.key === key);
}

export function getDefaultBackupCollectionKeys() {
  return backupRegistry
    .filter((item) => item.defaultEnabled)
    .map((item) => item.key);
}

export function sanitizeBackupRecord(
  record: Record<string, any>,
  dateFields: string[] = [],
) {
  const cleaned = { ...record };

  for (const field of dateFields) {
    if (cleaned[field]) {
      cleaned[field] = new Date(cleaned[field]);
    }
  }

  return cleaned;
}

export function getRestorePlanOrder(collectionKeys: string[]) {
  return backupRegistry
    .filter((item) => collectionKeys.includes(item.key))
    .sort((a, b) => a.restoreOrder - b.restoreOrder);
}
