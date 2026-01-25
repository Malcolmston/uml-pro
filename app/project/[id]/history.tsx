import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { byPrefixAndName } from "@awesome.me/kit-ab2f5093a4/icons";

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
  onPreview: (entry: HistoryEntry) => void;
  formatLabel: (folder: string) => string;
};

export default function HistoryPopup({
  isOpen,
  entries,
  onClose,
  onSelect,
  onPreview,
  formatLabel,
}: HistoryProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur"
      onClick={onClose}
    >
      <div className="w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
        <div className="bg-white rounded-xl shadow-lg w-full border max-h-[85vh] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Version history</h2>
              <p className="text-xs text-gray-500">Auto-saved snapshots over time</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-96px)]">
            {entries.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                No saved snapshots yet.
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-4">
                  {entries.map((entry, index) => {
                    const label = formatLabel(entry.folder);
                    const isLatest = index === 0;
                    return (
                      <div
                        key={entry.folder}
                        className="relative w-full text-left pl-10 pr-4 py-3 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition"
                      >
                        <div className="absolute left-0 mt-1 h-6 w-6 rounded-full border-2 border-white bg-gray-300 shadow" />
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void onSelect(entry)}
                                className="text-sm font-semibold text-gray-800 hover:underline"
                              >
                                {label}
                              </button>
                              {isLatest && (
                                <span className="text-[10px] uppercase tracking-[0.2em] rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                  Latest
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">Click date to load snapshot</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onPreview(entry)}
                            className="h-8 w-8 rounded-full border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-800"
                            title="Preview snapshot"
                          >
                            <FontAwesomeIcon icon={byPrefixAndName.fawsb["images"]} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
