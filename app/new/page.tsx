import { NewEvaluationForm } from "@/components/new-evaluation-form";
import { marketList } from "@/lib/snapshot";

export default function NewEvaluationPage() {
  return <NewEvaluationForm markets={marketList} />;
}
