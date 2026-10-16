function parseInlineStyles(str) {
  if (!str) return "";
  const tokens = [];
  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g;
  let match;
  let lastIdx = 0;
  let keyIndex = 0;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIdx) {
      tokens.push(str.substring(lastIdx, match.index));
    }
    const raw = match[0];
    if (raw.startsWith("**") && raw.endsWith("**")) {
      tokens.push(
        <strong key={keyIndex++} className="font-semibold text-[#203E2D] bg-[#203E2D]/10 px-1 py-0.5 rounded-sm">
          {raw.slice(2, -2)}
        </strong>
      );
    } else if (raw.startsWith("`") && raw.endsWith("`")) {
      tokens.push(
        <code key={keyIndex++} className="bg-[#FAF7F2] border border-[#E6E1D6] px-1.5 py-0.5 rounded text-xs font-mono text-[#A45E45]">
          {raw.slice(1, -1)}
        </code>
      );
    } else if (raw.startsWith("*") && raw.endsWith("*")) {
      tokens.push(
        <em key={keyIndex++} className="italic text-[#57534E]">
          {raw.slice(1, -1)}
        </em>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < str.length) {
    tokens.push(str.substring(lastIdx));
  }

  return tokens.length > 0 ? tokens : str;
}

export default function MarkdownRenderer({ text, content, className = "" }) {
  const rawText = text || content || "";
  if (!rawText) return null;

  return (
    <div className={className}>
      {rawText.split("\n").map((line, idx) => {
        if (line.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-base font-bold text-[#1E3A2B] mt-4 mb-1.5">
              {parseInlineStyles(line.replace("### ", ""))}
            </h4>
          );
        }
        if (line.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-lg font-extrabold text-[#DC143C] mt-5 mb-2.5 pb-0.5 border-b border-[#EAE5D9]">
              {parseInlineStyles(line.replace("## ", ""))}
            </h3>
          );
        }
        if (line.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-xl font-black text-[#1C1917] mt-1 mb-3">
              {parseInlineStyles(line.replace("# ", ""))}
            </h2>
          );
        }

        const numMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex gap-2 items-start my-1.5 text-sm font-medium text-[#1C1917]">
              <span className="badge bg-[#1E3A2B] text-white text-xs font-bold shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <div className="flex-1">{parseInlineStyles(numMatch[2])}</div>
            </div>
          );
        }

        if (line.startsWith("- ") || line.startsWith("* ")) {
          const itemText = line.substring(2);
          return (
            <li key={idx} className="list-disc list-inside ml-2 text-[#2A3B30] text-sm leading-relaxed my-1 font-medium">
              {parseInlineStyles(itemText)}
            </li>
          );
        }

        if (line.trim() === "") return <div key={idx} className="h-2" />;

        return (
          <p key={idx} className="text-sm text-[#1C1917] leading-relaxed mb-2.5">
            {parseInlineStyles(line)}
          </p>
        );
      })}
    </div>
  );
}
