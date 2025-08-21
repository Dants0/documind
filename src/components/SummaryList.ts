import { Summary } from "../interfaces/Summary";

export interface SummaryListProps {
  summaries: Summary[];
  onDelete: (id: number) => void;
  onDownload: (summary: Summary) => void;
}