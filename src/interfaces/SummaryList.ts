import { Summary } from "../interfaces/Summary";

export interface SummaryListProps {
  summaries: Summary[];
  onSummaryClick?: (summary: Summary) => void;
}