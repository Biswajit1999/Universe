export interface MemoryRecord {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  source: "explicit" | "imported";
}
