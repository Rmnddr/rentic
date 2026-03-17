import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  accentColor?: "primary" | "accent" | "success" | "warning";
};

const accentMap = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  accentColor = "primary",
}: MetricCardProps) {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-body-sm text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            accentMap[accentColor],
          )}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-h1 tabular-nums">{value}</p>
        {subtitle && (
          <p className="mt-1 text-caption text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="mt-2 h-3 w-32" />
      </CardContent>
    </Card>
  );
}
