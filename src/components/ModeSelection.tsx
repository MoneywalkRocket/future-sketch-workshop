"use client";

import Link from "next/link";
import { Mode, MODE_CONFIGS } from "@/types";

const modes: Mode[] = ["1y", "3y", "5y"];

const modeIcons: Record<Mode, string> = {
  "1y": "🔧",
  "3y": "🚀",
  "5y": "✨",
};

export default function ModeSelection() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Future Sketch Workshop</h1>
        <p className="mt-3 text-gray-600">
          Draw your app idea, then let AI refine it into a polished UI vision.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {modes.map((mode) => {
          const config = MODE_CONFIGS[mode];
          return (
            <Link
              key={mode}
              href={`/draw/${mode}`}
              className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm
                         transition-all hover:border-blue-300 hover:shadow-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="text-3xl">{modeIcons[mode]}</div>
              <h2 className="mt-3 text-xl font-semibold group-hover:text-blue-600">
                {config.label}
              </h2>
              <p className="mt-2 text-sm text-gray-500">{config.description}</p>
              <div
                className="mt-4 inline-block rounded-full bg-blue-50 px-4 py-1.5
                              text-sm font-medium text-blue-600 group-hover:bg-blue-100"
              >
                Start
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
