import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon?: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger";
}

const variantStyles = {
  primary: "bg-blue-50 text-blue-600 border-blue-200",
  success: "bg-green-50 text-green-600 border-green-200",
  warning: "bg-yellow-50 text-yellow-600 border-yellow-200",
  danger: "bg-red-50 text-red-600 border-red-200",
};

const iconBgStyles = {
  primary: "bg-blue-100",
  success: "bg-green-100",
  warning: "bg-yellow-100",
  danger: "bg-red-100",
};

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = "primary",
}: KPICardProps) {
  return (
    <div
      className={`p-6 rounded-xl border ${variantStyles[variant]} transition-transform hover:shadow-lg hover:scale-105`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold mb-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${iconBgStyles[variant]}`}>
            {icon}
          </div>
        )}
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-current border-opacity-10">
          {trend >= 0 ? (
            <>
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{trend}%</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">{trend}%</span>
            </>
          )}
          <span className="text-xs text-gray-500 ml-auto">vs last month</span>
        </div>
      )}
    </div>
  );
}
