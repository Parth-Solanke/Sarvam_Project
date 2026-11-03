import React from "react";
import clsx from "clsx";

interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            "animate-pulse rounded bg-workbench-panelAlt/80 dark:bg-workbench-panel/60",
            className
          )}
        />
      ))}
    </>
  );
};

