"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GradeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function GradeSelector({ value, onValueChange }: GradeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Grade:</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Grade" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((grade) => (
            <SelectItem key={grade} value={grade.toString()}>
              {grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
