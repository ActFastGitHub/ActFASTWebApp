// app/types/materialsPageTypes.ts

export type Project = {
  id: string;
  code: string;
  budget?: number;
  totalMaterialCost?: number;
  totalSubcontractorCost?: number;
  totalLaborCost?: number;
  totalProjectCost?: number;
};

export type ProfileInfo = {
  firstName?: string;
  lastName?: string;
  nickname?: string;
};

export type Material = {
  id: string;
  projectCode: string;
  type: string;
  description?: string;
  unitOfMeasurement?: string;
  quantityOrdered?: number;
  costPerUnit?: number;
  totalCost?: number;
  supplierName?: string;
  supplierContact?: string;
  status?: string;
  createdAt?: string;
  lastModifiedAt?: string;
  createdBy?: ProfileInfo;
  lastModifiedBy?: ProfileInfo;
};

export type Subcontractor = {
  id: string;
  projectCode: string;
  name: string;
  expertise?: string;
  contactInfo?: string;
  agreedCost?: number;
  totalCost?: number;
  createdAt?: string;
  lastModifiedAt?: string;
  createdBy?: ProfileInfo;
  lastModifiedBy?: ProfileInfo;
};

export type LaborCost = {
  id: string;
  projectCode: string;
  employeeName: string;
  role?: string;
  hoursWorked: number;
  hourlyRate: number;
  totalCost: number;
  createdAt?: string;
  lastModifiedAt?: string;
  createdBy?: ProfileInfo;
  lastModifiedBy?: ProfileInfo;
};

export type EditMaterialData = {
  [materialId: string]: Partial<Material>;
};

export type EditSubcontractorData = {
  [subcontractorId: string]: Partial<Subcontractor>;
};

export type EditLaborCostData = {
  [laborCostId: string]: Partial<LaborCost>;
};
