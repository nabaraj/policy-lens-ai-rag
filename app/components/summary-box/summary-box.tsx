type SummaryBoxProps = {
  question: string;
  value: string;
  index?: number; // kept so existing usage still type-checks
};

export const SummaryBox = ({ question, value }: SummaryBoxProps) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{question}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
        {value}
      </p>
    </article>
  );
};

export const SummaryBoxSkeleton = () => (
  <div
    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    aria-hidden
  >
    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
    <div className="mt-3 space-y-2">
      <div className="h-3 animate-pulse rounded bg-slate-100" />
      <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
    </div>
  </div>
);
