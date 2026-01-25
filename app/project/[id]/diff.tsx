import React, { useMemo } from "react";

/**
 * Represents the differences between two sets of data.
 *
 * @typedef {Object} Diff
 * @property {string[]} added - An array of items that were added.
 * @property {string[]} removed - An array of items that were removed.
 * @property {Array<{ from: string, to: string }>} modified - An array of objects representing items that were modified,
 * where each object specifies the original value (`from`) and the new value (`to`).
 * @property {string[]} unchanged - An array of items that remained unchanged.
 */
type Diff = {
  added: string[];
  removed: string[];
  modified: Array<{ from: string; to: string }>;
  unchanged: string[];
};

/**
 * Compares the latest and previous versions of a string and produces the differences, including added, removed, modified, and unchanged lines.
 *
 * @param {string} latest - The latest version of the string to compare.
 * @param {string} previous - The previous version of the string to compare.
 * @return {Diff} An object containing the differences, categorized into added, removed, modified, and unchanged lines.
 */
export function diff(latest: string, previous: string): Diff {
  const result: Diff = { added: [], removed: [], modified: [], unchanged: [] };

  const linesLatest = latest.split("\n");
  const linesPrevious = previous.split("\n");

  const lcs: number[][] = Array.from({ length: linesPrevious.length + 1 }, () =>
    Array(linesLatest.length + 1).fill(0)
  );

  for (let i = 1; i <= linesPrevious.length; i++) {
    for (let j = 1; j <= linesLatest.length; j++) {
      if (linesPrevious[i - 1] === linesLatest[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }

  type Op = { type: "equal" | "insert" | "delete"; value: string };
  const ops: Op[] = [];

  let i = linesPrevious.length;
  let j = linesLatest.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesPrevious[i - 1] === linesLatest[j - 1]) {
      ops.unshift({ type: "equal", value: linesPrevious[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      ops.unshift({ type: "insert", value: linesLatest[j - 1] });
      j--;
    } else if (i > 0) {
      ops.unshift({ type: "delete", value: linesPrevious[i - 1] });
      i--;
    }
  }

  for (let index = 0; index < ops.length; index++) {
    const op = ops[index];
    if (op.type === "equal") {
      result.unchanged.push(op.value);
      continue;
    }

    if (op.type === "delete" && ops[index + 1]?.type === "insert") {
      result.modified.push({ from: op.value, to: ops[index + 1].value });
      index++;
      continue;
    }

    if (op.type === "delete") {
      result.removed.push(op.value);
      continue;
    }

    result.added.push(op.value);
  }

  return result;
}

/**
 * Properties for configuring and rendering a diff view component.
 *
 * @typedef {Object} DiffViewProps
 * @property {string} latest - The latest version of the content to be compared.
 * @property {string} previous - The previous version of the content to be compared.
 */
type DiffViewProps = {
  latest: string;
  previous: string;
};

/**
 * Renders the differences between two versions of data, categorized as added, removed, and modified.
 *
 * @param {Object} props - Configuration object for the component.
 * @param {Array<string>} props.latest - The latest version of the data.
 * @param {Array<string>} props.previous - The previous version of the data.
 * @return {JSX.Element} A React component that displays the differences between the latest and previous data.
 */
export default function DiffView({ latest, previous }: DiffViewProps) {
  const result = useMemo(() => diff(latest, previous), [latest, previous]);

  return (
    <div className="space-y-4 text-xs text-gray-700">
      <div>
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">Added</div>
        {result.added.length === 0 ? (
          <div className="text-gray-400">No additions</div>
        ) : (
          <div className="space-y-1">
            {result.added.map((line, index) => (
              <div key={`added-${index}`} className="rounded bg-emerald-50 px-2 py-1 text-emerald-700">
                {line || "(blank)"}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">Removed</div>
        {result.removed.length === 0 ? (
          <div className="text-gray-400">No removals</div>
        ) : (
          <div className="space-y-1">
            {result.removed.map((line, index) => (
              <div key={`removed-${index}`} className="rounded bg-red-50 px-2 py-1 text-red-700">
                {line || "(blank)"}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">Modified</div>
        {result.modified.length === 0 ? (
          <div className="text-gray-400">No modifications</div>
        ) : (
          <div className="space-y-2">
            {result.modified.map((item, index) => (
              <div key={`modified-${index}`} className="rounded border border-amber-200 bg-amber-50 px-2 py-1">
                <div className="text-amber-700">- {item.from || "(blank)"}</div>
                <div className="text-amber-700">+ {item.to || "(blank)"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
