import React from "react";
import { infoBoxColor, renderFormattedText } from "../utils";

type SummaryBoxProps = {
  value: string;
  index: number;
  question: string;
};

export const SummaryBox: React.FC<SummaryBoxProps> = ({
  value,
  index,
  question,
}) => {
  return (
    <div
      className={`bg-white border ${infoBoxColor[index]} rounded-lg p-4 mb-4 shadow-sm`}
    >
      <h3 className="text-md font-semibold text-gray-800 mb-2">{question}</h3>

      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
        {renderFormattedText(value)}
      </div>
    </div>
  );
};
