import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
export function PracticeEmpty() {
  return <div className="my-6 text-center"><p className="mb-4 text-lg">אין פריטים ברמה הזו שמתאימים לבחירה.</p><Button asChild variant="outline" className="min-h-12"><Link to="/settings">הגדרות התרגול</Link></Button></div>;
}