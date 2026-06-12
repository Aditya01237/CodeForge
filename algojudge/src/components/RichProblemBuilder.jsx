import { useState } from "react";
import {
  AlignLeft,
  Code2,
  FileText,
  ImagePlus,
  MoveDown,
  MoveUp,
  Sigma,
  StickyNote,
  Trash2,
  Upload,
} from "lucide-react";
import { apiUpload, assetUrl } from "../api";

const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";

const newBlock = (type) => {
  const id = crypto.randomUUID();

  if (type === "paragraph") {
    return {
      id,
      type: "paragraph",
      text: "",
    };
  }

  if (type === "math") {
    return {
      id,
      type: "math",
      text: "",
    };
  }

  if (type === "code") {
    return {
      id,
      type: "code",
      language: "text",
      text: "",
    };
  }

  if (type === "image") {
    return {
      id,
      type: "image",
      url: "",
      caption: "",
    };
  }

  if (type === "example") {
    return {
      id,
      type: "example",
      title: "Example",
      imageUrl: "",
      imageCaption: "",
      input: "",
      output: "",
      explanation: "",
    };
  }

  return {
    id,
    type: "note",
    text: "",
  };
};

export default function RichProblemBuilder({ blocks, setBlocks, theme = "dark" }) {
  const [uploadingBlockId, setUploadingBlockId] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const isDark = theme === "dark";

  const inputClass = isDark
    ? "bg-[#070B12] border-white/10 text-white placeholder:text-slate-600 focus:border-[#58A6FF]"
    : "bg-white border-slate-200 text-slate-950 placeholder:text-slate-400 focus:border-blue-500";

  const cardClass = isDark
    ? "bg-[#0B1220] border-white/10"
    : "bg-slate-50 border-slate-200";

  const softButton = isDark
    ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100";

  const muted = isDark ? "text-slate-400" : "text-slate-600";

  const addBlock = (type) => {
    setBlocks((prev) => [...prev, newBlock(type)]);
  };

  const updateBlock = (id, patch) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...patch } : block))
    );
  };

  const removeBlock = (id) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const moveBlock = (index, direction) => {
    setBlocks((prev) => {
      const next = [...prev];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= next.length) return prev;

      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;

      return next;
    });
  };

  const handleImageUpload = async (blockId, file, targetField = "url") => {
    if (!file) return;

    setUploadError("");
    setUploadingBlockId(`${blockId}:${targetField}`);

    try {
      const result = await apiUpload("/uploads/problem-images", file);
      updateBlock(blockId, { [targetField]: result.url });
    } catch (err) {
      setUploadError(err.message || "Image upload failed");
    } finally {
      setUploadingBlockId(null);
    }
  };

  const UploadBox = ({ block, targetField = "url" }) => {
    const uploadKey = `${block.id}:${targetField}`;

    return (
      <label
        className={`min-h-32 rounded-xl border border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
          isDark
            ? "border-white/10 bg-black/20 hover:bg-white/[0.04]"
            : "border-slate-300 bg-white hover:bg-slate-50"
        }`}
      >
        <Upload size={22} className="text-[#58A6FF]" />

        <div className={`text-sm ${muted}`}>
          {uploadingBlockId === uploadKey
            ? "Uploading image..."
            : "Click to upload image from computer"}
        </div>

        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          className="hidden"
          onChange={(e) =>
            handleImageUpload(block.id, e.target.files?.[0], targetField)
          }
        />
      </label>
    );
  };

  const ImagePreview = ({ url, caption }) => {
    if (!url) return null;

    return (
      <div>
        <img
          src={assetUrl(url)}
          alt={caption || "Problem image"}
          className={`max-h-80 w-full object-contain rounded-xl border ${
            isDark ? "border-white/10" : "border-slate-200"
          }`}
        />

        <div
          className="mt-2 text-xs text-[#58A6FF] break-all"
          style={{ fontFamily: MONO }}
        >
          {url}
        </div>
      </div>
    );
  };

  const renderBlockEditor = (block, index) => {
    return (
      <div key={block.id} className={`rounded-2xl border p-4 ${cardClass}`}>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div
            className="text-xs uppercase tracking-[0.18em] text-[#58A6FF]"
            style={{ fontFamily: MONO }}
          >
            {block.type}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => moveBlock(index, -1)}
              className={`h-8 w-8 rounded-lg border flex items-center justify-center ${softButton}`}
              title="Move up"
            >
              <MoveUp size={14} />
            </button>

            <button
              type="button"
              onClick={() => moveBlock(index, 1)}
              className={`h-8 w-8 rounded-lg border flex items-center justify-center ${softButton}`}
              title="Move down"
            >
              <MoveDown size={14} />
            </button>

            <button
              type="button"
              onClick={() => removeBlock(block.id)}
              className="h-8 w-8 rounded-lg border border-rose-400/20 bg-rose-500/10 text-rose-500 flex items-center justify-center"
              title="Delete block"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {block.type === "paragraph" && (
          <textarea
            value={block.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            placeholder="Write problem explanation..."
            rows={4}
            className={`w-full rounded-xl border px-4 py-3 outline-none transition resize-y ${inputClass}`}
          />
        )}

        {block.type === "math" && (
          <textarea
            value={block.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            placeholder="Example: 1 <= n <= 10^5 or dp[i] = max(dp[i - 1], nums[i])"
            rows={3}
            className={`w-full rounded-xl border px-4 py-3 outline-none transition resize-y ${inputClass}`}
            style={{ fontFamily: MONO }}
          />
        )}

        {block.type === "code" && (
          <div className="space-y-3">
            <input
              value={block.language || ""}
              onChange={(e) =>
                updateBlock(block.id, { language: e.target.value })
              }
              placeholder="Language label, example: cpp / input / output"
              className={`w-full h-11 rounded-xl border px-4 outline-none transition ${inputClass}`}
              style={{ fontFamily: MONO }}
            />

            <textarea
              value={block.text}
              onChange={(e) => updateBlock(block.id, { text: e.target.value })}
              placeholder="Write code / input / output snippet..."
              rows={5}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition resize-y ${inputClass}`}
              style={{ fontFamily: MONO }}
            />
          </div>
        )}

        {block.type === "image" && (
          <div className="space-y-3">
            <UploadBox block={block} targetField="url" />
            <ImagePreview url={block.url} caption={block.caption} />

            <input
              value={block.caption || ""}
              onChange={(e) =>
                updateBlock(block.id, { caption: e.target.value })
              }
              placeholder="Image caption"
              className={`w-full h-11 rounded-xl border px-4 outline-none transition ${inputClass}`}
            />
          </div>
        )}

        {block.type === "example" && (
          <div className="space-y-4">
            <input
              value={block.title || ""}
              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
              placeholder="Example 1"
              className={`w-full h-11 rounded-xl border px-4 outline-none transition ${inputClass}`}
            />

            <div>
              <div
                className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2"
                style={{ fontFamily: MONO }}
              >
                Optional Example Image
              </div>

              <UploadBox block={block} targetField="imageUrl" />
              <ImagePreview url={block.imageUrl} caption={block.imageCaption} />

              {block.imageUrl && (
                <input
                  value={block.imageCaption || ""}
                  onChange={(e) =>
                    updateBlock(block.id, { imageCaption: e.target.value })
                  }
                  placeholder="Example image caption"
                  className={`w-full h-11 rounded-xl border px-4 mt-3 outline-none transition ${inputClass}`}
                />
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <label>
                <span
                  className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2 block"
                  style={{ fontFamily: MONO }}
                >
                  Input
                </span>

                <textarea
                  value={block.input || ""}
                  onChange={(e) =>
                    updateBlock(block.id, { input: e.target.value })
                  }
                  rows={5}
                  placeholder="matrix = [[1,2,3],[4,5,6],[7,8,9]]"
                  className={`w-full rounded-xl border px-4 py-3 outline-none resize-y ${inputClass}`}
                  style={{ fontFamily: MONO }}
                />
              </label>

              <label>
                <span
                  className="text-xs uppercase tracking-[0.16em] text-slate-500 mb-2 block"
                  style={{ fontFamily: MONO }}
                >
                  Output
                </span>

                <textarea
                  value={block.output || ""}
                  onChange={(e) =>
                    updateBlock(block.id, { output: e.target.value })
                  }
                  rows={5}
                  placeholder="[1,2,3,6,9,8,7,4,5]"
                  className={`w-full rounded-xl border px-4 py-3 outline-none resize-y ${inputClass}`}
                  style={{ fontFamily: MONO }}
                />
              </label>
            </div>

            <textarea
              value={block.explanation || ""}
              onChange={(e) =>
                updateBlock(block.id, { explanation: e.target.value })
              }
              rows={3}
              placeholder="Explanation for this example..."
              className={`w-full rounded-xl border px-4 py-3 outline-none resize-y ${inputClass}`}
            />
          </div>
        )}

        {block.type === "note" && (
          <textarea
            value={block.text}
            onChange={(e) => updateBlock(block.id, { text: e.target.value })}
            placeholder="Add note / hint / important information..."
            rows={3}
            className={`w-full rounded-xl border px-4 py-3 outline-none transition resize-y ${inputClass}`}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => addBlock("paragraph")}
          className={`h-10 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${softButton}`}
        >
          <AlignLeft size={15} />
          Text
        </button>

        <button
          type="button"
          onClick={() => addBlock("math")}
          className={`h-10 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${softButton}`}
        >
          <Sigma size={15} />
          Math
        </button>

        <button
          type="button"
          onClick={() => addBlock("code")}
          className={`h-10 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${softButton}`}
        >
          <Code2 size={15} />
          Code
        </button>

        <button
          type="button"
          onClick={() => addBlock("image")}
          className={`h-10 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${softButton}`}
        >
          <ImagePlus size={15} />
          Image
        </button>

        <button
          type="button"
          onClick={() => addBlock("example")}
          className={`h-10 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${softButton}`}
        >
          <FileText size={15} />
          Example
        </button>

        <button
          type="button"
          onClick={() => addBlock("note")}
          className={`h-10 px-4 rounded-xl border text-sm font-semibold flex items-center gap-2 ${softButton}`}
        >
          <StickyNote size={15} />
          Note
        </button>
      </div>

      {uploadError && (
        <div className="mb-4 rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">
          {uploadError}
        </div>
      )}

      <div className="space-y-4">
        {blocks.length === 0 ? (
          <div
            className={`rounded-2xl border border-dashed p-8 text-center ${muted} ${
              isDark ? "border-white/10" : "border-slate-300"
            }`}
          >
            Add text, math, code, image, example, or note blocks to build the
            problem statement.
          </div>
        ) : (
          blocks.map((block, index) => renderBlockEditor(block, index))
        )}
      </div>
    </div>
  );
}