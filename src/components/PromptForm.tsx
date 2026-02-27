"use client";

interface PromptFormProps {
  prompt: string;
  comment: string;
  onPromptChange: (value: string) => void;
  onCommentChange: (value: string) => void;
}

export default function PromptForm({
  prompt,
  comment,
  onPromptChange,
  onCommentChange,
}: PromptFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Describe your vision
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g. A social fitness app with weekly challenges and leaderboards..."
          rows={2}
          maxLength={500}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                     shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                     placeholder:text-gray-400 resize-none"
        />
        <p className="mt-1 text-xs text-gray-400">{prompt.length}/500</p>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Comment (included in export)
        </label>
        <input
          id="comment"
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
  );
}
