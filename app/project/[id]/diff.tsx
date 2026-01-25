import React, { useMemo } from "react";

/**
 * Represents the differences between two sets of data.
 */
type Diff = {
  added: string[];
  removed: string[];
  modified: Array<{ from: string; to: string }>;
  unchanged: string[];
};

type Op = { type: "equal" | "insert" | "delete"; value: string };

const computeOps = (latest: string, previous: string): Op[] => {
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

  return ops;
};

/**
 * Compares the latest and previous versions of a string and produces the differences.
 */
export function diff(latest: string, previous: string): Diff {
  const result: Diff = { added: [], removed: [], modified: [], unchanged: [] };
  const ops = computeOps(latest, previous);

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

type DiffViewProps = {
  latest: string;
  previous: string;
};

export default function DiffView({ latest, previous }: DiffViewProps) {
  const rows = useMemo(() => {
    type Row = {
      left: string;
      right: string;
      kind: "added" | "removed" | "modified" | "unchanged";
    };
    const ops = computeOps(latest, previous);
    const resultRows: Row[] = [];

    for (let index = 0; index < ops.length; index++) {
      const op = ops[index];
      if (op.type === "equal") {
        resultRows.push({ left: op.value, right: op.value, kind: "unchanged" });
        continue;
      }

      if (op.type === "delete" && ops[index + 1]?.type === "insert") {
        resultRows.push({
          left: ops[index + 1].value,
          right: op.value,
          kind: "modified",
        });
        index++;
        continue;
      }

      if (op.type === "delete") {
        resultRows.push({ left: "", right: op.value, kind: "removed" });
        continue;
      }

      resultRows.push({ left: op.value, right: "", kind: "added" });
    }

    return resultRows;
  }, [latest, previous]);

  const getLineClasses = (kind: string, side: "left" | "right") => {
    if (kind === "added" && side === "left") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (kind === "removed" && side === "right") {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (kind === "modified") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  return (
    <div className="text-xs text-gray-700">
      <div className="grid grid-cols-2 gap-4 mb-3 text-[10px] uppercase tracking-[0.2em] text-gray-500">
        <div>Current</div>
        <div>Selected</div>
      </div>
      <div className="space-y-2">
        {rows.length === 0 && <div className="text-gray-400">No differences.</div>}
        {rows.map((row, index) => (
          <div key={`row-${index}`} className="grid grid-cols-2 gap-4">
            <div className={`rounded border px-2 py-1 ${getLineClasses(row.kind, "left")}`}>
              {row.left || "\u00A0"}
            </div>
            <div className={`rounded border px-2 py-1 ${getLineClasses(row.kind, "right")}`}>
              {row.right || "\u00A0"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
