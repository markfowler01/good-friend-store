import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface StudentCardProps {
  student: {
    _id: string;
    name: string;
    grade: string;
    uniqueId: string;
    ticketBalance: number;
  };
}

export default function StudentCard({ student }: StudentCardProps) {
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/students/${student._id}`}>
      <Card hover className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-bca-teal/10 text-bca-teal flex items-center justify-center font-heading font-bold text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-bca-dark truncate">{student.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="gray">{student.grade === "K" ? "K" : `Gr ${student.grade}`}</Badge>
              <span className="text-xs text-gray-400">#{student.uniqueId}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-heading font-bold text-bca-teal">
              {student.ticketBalance}
            </div>
            <div className="text-xs text-gray-400">tickets</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
