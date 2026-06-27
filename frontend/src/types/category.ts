export interface ProduceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  commonUnits: string[];
  active: boolean;
}
