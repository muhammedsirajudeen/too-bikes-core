"use client";

import { ReactNode } from "react";

interface FeatureRowProps {
  icon?: ReactNode;
  label: string;
  value: string;
}

export default function FeatureRow({ icon, label, value }: FeatureRowProps) {
  return (
    <div className="flex items-center gap-3">
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {value}
        </span>
      </div>
    </div>
  );
}


