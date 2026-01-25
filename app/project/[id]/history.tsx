import React from "react";

type HistoryEntry = {
  folder: string;
  pagePath?: string;
  previewPath?: string;
};

type HistoryProps = {
  isOpen: boolean;
  entries: HistoryEntry[];
  onClose: () => void;
  onSelect: (entry: HistoryEntry) => Promise<void> | void;
  formatLabel: (folder: string) => string;
};

export default function HistoryPopup({
  isOpen,
  entries,
  onClose,
  onSelect,
  formatLabel,
}: HistoryProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur"
      onClick={onClose}
    >
      <div className="w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
        <div className="p-6 bg-white rounded-lg shadow-lg w-full space-y-6 overflow-y-auto max-h-[85vh] border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Project History</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {entries.length === 0 && (
              <p className="text-sm text-gray-500">No saved snapshots yet.</p>
            )}
            {entries.length > 0 && (
              <select
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
                defaultValue=""
                onChange={(event) => {
                  const folder = event.target.value;
                  const entry = entries.find((item) => item.folder === folder);
                  if (!entry) return;
                  void onSelect(entry);
                }}
              >
                <option value="" disabled>
                  Select snapshot
                </option>
                {entries.map((entry) => (
                  <option key={entry.folder} value={entry.folder}>
                    {formatLabel(entry.folder)}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
