"use client";
import { Header } from "./components/header";
import { FileUpload } from "./components/file-upload/file-upload";
import { useEffect, useRef, useState } from "react";
import { FileDetails } from "./components/file-details/file-details";
import { SummaryBox } from "./components/summary-box";
import { SummaryBoxSkeleton } from "./components/summary-box/summary-box";
import { SUGGESTED_QUESTIONS, SUMMARY_QUESTIONS } from "./constants/constant";
import ReactMarkdown from "react-markdown";

const emptyAnswers = (): Record<string, string> =>
  Object.fromEntries(SUMMARY_QUESTIONS.map((q) => [q, ""]));

const uploadWithProgress = (
  file: File,
  onProgress: (percent: number) => void,
): Promise<Record<string, any>> =>
  new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    //to show file upload status need to use XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      try {
        resolve(JSON.parse(xhr.responseText));
      } catch {
        reject(new Error("Invalid server response"));
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));

    xhr.send(formData);
  });

export default function Home() {
  const [showRight, setShowRight] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryAnswers, setSummaryAnswers] =
    useState<Record<string, string>>(emptyAnswers);
  const [chatLoading, setChatLoading] = useState(false);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [fileUploadedStatus, setFileUploadedStatus] = useState<Record<
    string,
    any
  > | null>(null);

  const resetView = (file: File) => {
    setSelectedFile(file);
    setFileUploadedStatus(null);
    setSummaryAnswers(emptyAnswers());
    setChatMessages([]);
    setShowRight(false);
    setUploadProgress(0);
    setFileUploadLoading(true);
  };

  const handleFileUpload = async (file: File) => {
    // Reset everything tied to the previous document
    resetView(file);
    try {
      const result = await uploadWithProgress(file, setUploadProgress);
      setFileUploadedStatus(result);
    } catch (e) {
      console.log({ e });
      setFileUploadedStatus({
        success: false,
        message: "Upload failed. Check your connection and try again.",
      });
    } finally {
      setFileUploadLoading(false);
    }
  };

  const getInitialAnswers = async (question: string, documentId: string) => {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, documentId }),
      });
      const result = await response.json();
      setSummaryAnswers((prev) => ({ ...prev, [question]: result.content }));
    } catch (e) {
      console.log(e);
    }
  };

  const sendMessage = async (override?: string) => {
    const question = (override ?? input).trim();
    if (!question || chatLoading || !fileUploadedStatus?.data?.documentId)
      return;

    setChatLoading(true);
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          documentId: fileUploadedStatus.data.documentId,
        }),
      });
      const result = await response.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: result.content },
      ]);
    } catch (e) {
      console.log(e);
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    if (fileUploadedStatus?.success && fileUploadedStatus.data?.documentId) {
      setShowRight(true);
      setSummaryLoading(true);

      Promise.all(
        SUMMARY_QUESTIONS.map((question) =>
          getInitialAnswers(question, fileUploadedStatus.data.documentId),
        ),
      ).finally(() => setSummaryLoading(false));
    }
  }, [fileUploadedStatus]);

  // Keep the latest chat message in view
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const hasSummary =
    summaryLoading || Object.values(summaryAnswers).some(Boolean);

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <Header />

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section className="min-h-0 flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-2xl space-y-6">
            <FileUpload
              handleUploadedFile={handleFileUpload}
              disabled={fileUploadLoading}
            />

            {selectedFile && (
              <FileDetails
                selectedFile={selectedFile}
                loading={fileUploadLoading}
                progress={uploadProgress}
                status={fileUploadedStatus}
              />
            )}

            {hasSummary && (
              <div className="space-y-3">
                <h2 className="text-base font-semibold text-slate-900">
                  Policy summary
                </h2>
                {Object.entries(summaryAnswers).map(([key, value], index) =>
                  value ? (
                    <SummaryBox
                      key={key}
                      question={key}
                      value={value}
                      index={index}
                    />
                  ) : summaryLoading ? (
                    <SummaryBoxSkeleton key={key} />
                  ) : null,
                )}
              </div>
            )}
          </div>
        </section>
        {showRight && (
          <aside className="flex h-[70vh] shrink-0 flex-col border-t border-slate-200 bg-white lg:h-auto lg:w-[460px] lg:border-l lg:border-t-0 xl:w-[520px]">
            <div className="border-b border-slate-200 px-5 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Policy assistant
              </h2>
              <p className="text-xs text-slate-500">
                Answers are based on your uploaded document.
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
              {chatMessages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">
                    Ask about coverage, deductibles, or exclusions. For example:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-br-sm bg-indigo-100 border-indigo-200 border text-white"
                        : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <ReactMarkdown
                      components={{
                        strong: ({ children }) => (
                          <span className="font-semibold">{children}</span>
                        ),
                        li: ({ children }) => (
                          <li className="ml-4 list-disc text-gray-700">
                            {children}
                          </li>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-800 leading-relaxed">
                            {children}
                          </p>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div
                  className="flex items-center gap-1.5 px-1 text-sm text-slate-500"
                  role="status"
                >
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                  <span className="ml-1">Thinking…</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex gap-2 border-t border-slate-200 bg-white p-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask something about your policy…"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || chatLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Send
              </button>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
