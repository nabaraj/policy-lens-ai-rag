import { ChangeEvent, DragEvent, useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";

type FileUploadProps = {
  handleUploadedFile: (file: File) => void;
  disabled?: boolean;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  handleUploadedFile,
  disabled = false,
}) => {
  const [error, setError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File | undefined) => {
    setError("");
    if (!file) return;
    const isPdfMime = file.type === "application/pdf";
    const isPdfExt = file.name.toLowerCase().endsWith(".pdf");

    if (!isPdfMime && !isPdfExt) {
      setError(
        "Only PDF files are supported. Choose a .pdf file and try again.",
      );
      return;
    }

    handleUploadedFile(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    processFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    processFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const borderClass = error
    ? "border-red-300 bg-red-50/40"
    : isDragging
      ? "border-indigo-500 bg-indigo-50/60"
      : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50";

  return (
    <div className="w-full">
      <label
        htmlFor="dropzone-file"
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center transition-colors focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:ring-offset-2 ${borderClass} ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <IoCloudUploadOutline size={24} />
        </div>

        <p className="text-sm font-medium text-slate-900">
          Drag and drop your policy document here
        </p>
        <p className="mt-1 text-sm text-slate-500">PDF files only</p>

        <span className="mt-4 inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
          Browse files
        </span>

        <input
          id="dropzone-file"
          onChange={handleFileChange}
          type="file"
          accept=".pdf,application/pdf"
          disabled={disabled}
          className="sr-only"
        />
      </label>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};
