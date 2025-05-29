import { Card, CardContent } from "@/components/ui/card";

export function Quote() {
  return (
    <Card className="bg-white">
      <CardContent className="py-2 px-3">
        <p className="text-center text-gray-600 italic text-base">
          "Luck is when preparation meets opportunity"
        </p>
      </CardContent>
    </Card>
  );
} 