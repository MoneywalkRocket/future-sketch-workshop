"use client";

interface PromptPanelProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  comment: string;
  onPromptChange: (v: string) => void;
  onCommentChange: (v: string) => void;
}

export default function PromptPanel({
  isOpen,
  onClose,
  prompt,
  comment,
  onPromptChange,
  onCommentChange,
}: PromptPanelProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-xl
                    flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-semibold">Prompt & Comment</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            aria-label="Close panel"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <label htmlFor="panel-prompt" className="block text-sm font-medium text-gray-700">
              Describe your vision
            </label>
            <textarea
              id="panel-prompt"
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="e.g. A social fitness app with weekly challenges..."
              rows={4}
              maxLength={500}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                         placeholder:text-gray-400 resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">{prompt.length}/500</p>
          </div>
          <div>
            <label htmlFor="panel-comment" className="block text-sm font-medium text-gray-700">
              Comment (included in export)
            </label>
            <input
              id="panel-comment"
              type="text"
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder="e.g. Workshop team Alpha — sprint vision"
              maxLength={200}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                         shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                         placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
