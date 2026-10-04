import React from "react";
import { FileTypeIcon } from "../file-type-icon/file-type-icon";

type FileDetailsProps = {
  selectedFile: File;
  loading: boolean;
  progress: number; // 0-100
  status: Record<string, any> | null;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileDetails: React.FC<FileDetailsProps> = ({
  selectedFile,
  status,
  loading,
  progress,
}) => {
  const isError = !!status && !status.success;
  const isProcessing = loading && progress >= 100;

  const badgeClassName = isError
    ? "bg-red-50 text-red-700 ring-red-600/20"
    : "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
        <FileTypeIcon fileType={selectedFile.type} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className="truncate text-sm font-medium text-slate-900"
            title={selectedFile.name}
          >
            {selectedFile.name}
          </p>
          <span className="shrink-0 text-xs text-slate-500">
            {formatSize(selectedFile.size)}
          </span>
        </div>

        {loading && (
          <div className="mt-2">
            <div
              role="progressbar"
              aria-label="Upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={isProcessing ? undefined : progress}
              className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
            >
              <div
                className={`h-full rounded-full bg-indigo-600 transition-[width] duration-200 ease-out ${
                  isProcessing ? "animate-pulse" : ""
                }`}
                style={{ width: `${isProcessing ? 100 : progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {isProcessing
                ? "Processing document…"
                : `Uploading… ${progress}%`}
            </p>
          </div>
        )}

        {status && !loading && (
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${badgeClassName}`}
          >
            <svg
              className="h-3.5 w-3.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
            >
              {isError ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              )}
            </svg>
            {status.message}
          </span>
        )}
      </div>
    </div>
  );
};
