import { FaRegFilePdf } from "react-icons/fa6";

export const FileTypeIcon = ({ fileType }: { fileType: string }) => {
  switch (fileType) {
    case "application/pdf":
      return <FaRegFilePdf size={28} />;

    default:
      return (
        <svg
          className="w-7 h-7 text-gray-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M10 3v4a1 1 0 0 1-1 1H5m14-4v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7.914a1 1 0 0 1 .293-.707l3.914-3.914A1 1 0 0 1 9.914 3H18a1 1 0 0 1 1 1Z"
          />
        </svg>
      );
  }
};
