"use client";

type Props = { goal: number };

export default function Scatter({ goal }: Props) {
  return (
    <div className="text-sm text-neutral-300 h-64 flex items-center justify-center">
      [Scatter chart untuk SDGs {goal} — sambungkan ke hasil K-Means]
    </div>
  );
}
