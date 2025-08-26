/* ================================
 *  Shared Equipment Types (TS-safe)
 * ================================ */

export const STATUSES = ["WAREHOUSE", "DEPLOYED", "MAINTENANCE", "LOST"] as const;
export type EquipmentStatus = (typeof STATUSES)[number];

export type MovementDirection = "IN" | "OUT";

export interface EquipmentDTO {
  id: string;
  assetNumber: number;
  type: string; // UI-visible name (maps to DB equipment.type)
  model?: string | null;
  serial?: string | null;
  status: EquipmentStatus;
  archived: boolean;

  currentProjectCode?: string | null;

  lastMovedAt?: string | Date | null;

  /** NEW: who last moved it, as a human-friendly label (first/last or nickname) */
  lastMovedBy?: string | null;

  /** NEW: last movement direction, if known */
  lastMovementDirection?: MovementDirection | null;

  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/* ---- Movement payload ---- */
export interface EquipmentMoveItem {
  type: string;
  assetNumber: number;
}

export interface MoveRequest {
  direction: MovementDirection;
  projectCode?: string;   // required for OUT on server-side
  when?: string;          // ISO timestamp; undefined = now
  note?: string;
  rawMessage?: string;
  items: EquipmentMoveItem[];
}

/* ================================
 *  Discriminated unions (HTTP)
 * ================================ */
export type OkStatus = 200;
export type ErrorStatus = 400 | 401 | 403 | 409 | 500;

/* ---- Move responses ---- */
export interface MoveResponseOK {
  status: OkStatus;     // discriminator
  moved: number;        // how many items were recorded
}
export interface MoveResponseError {
  status: ErrorStatus;  // discriminator (non-200)
  error: string;
  /** optional: which assets were missing (e.g., "Dehumidifier #3") */
  missing?: string[];
}
export type MoveResponse = MoveResponseOK | MoveResponseError;

export const isMoveOK = (r: MoveResponse): r is MoveResponseOK => r.status === 200;
export const isMoveError = (r: MoveResponse): r is MoveResponseError => r.status !== 200;

/* ---- Delete responses (for movement delete) ---- */
export interface DeleteResponseOK {
  status: OkStatus;     // 200
}
export interface DeleteResponseError {
  status: ErrorStatus;  // non-200
  error: string;
}
export type DeleteResponse = DeleteResponseOK | DeleteResponseError;

export const isDeleteOK = (r: DeleteResponse): r is DeleteResponseOK => r.status === 200;
export const isDeleteError = (r: DeleteResponse): r is DeleteResponseError => r.status !== 200;

/* ---- Equipment update payload ---- */
export interface UpdateEquipmentPayload {
  model?: string | null;
  serial?: string | null;
  status?: EquipmentStatus;
  archived?: boolean;
  type?: string;                 // UI field
  assetNumber?: number;
  currentProjectCode?: string | null;

  /** optionally allow updating lastMovedAt from the management page */
  lastMovedAt?: string | Date | null;
}
