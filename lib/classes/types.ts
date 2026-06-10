export type SchoolClassStatus = "Active" | "Inactive";

export type SchoolClass = {
  id: string;
  name: string;
  display_order: number;
  status: SchoolClassStatus;
};

export type SchoolDivision = {
  id: string;
  class_id: string;
  name: string;
  display_order: number;
  status: SchoolClassStatus;
};

