import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Play,
  UploadCloud,
  User
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
 
const TopNavbar = ({
  problem,
  lang,
  onRun,
  onSubmit,
  running = false,
}) => {
  const navigate = useNavigate();

  const { id } = useParams();
  const currId = Number(id);

  const nextQuestion = () => {
    const newId = currId+1;
    if(newId <= 2)navigate(`/problem/${newId}`);
  }
  const prevQuestion = (id) => {
    const newId = currId-1;
    if(newId >= 1)navigate(`/problem/${newId}`);
  }


  return (
    <div className="h-14 relative flex items-center px-4 bg-[#000000]">

      {/* LEFT */}
      <div className="flex items-center gap-3">
        
        {/* CodeForge Logo */}
        <span className="text-lg font-semibold text-[#58A6FF] font-mono">
          CodeForge
        </span>

        <div className="w-px h-5 bg-[#2A2F3A]" />

        {/* Problem Info */}
        {problem && (
          <>
            <span className="text-sm text-[#C9D1D9] font-medium">
              {problem.title}
            </span>

            <div className="flex items-center gap-2 text-[#8B949E] ml-2">
              <ChevronLeft onClick={prevQuestion} size={18} className="cursor-pointer hover:text-white" />
              <ChevronRight onClick={nextQuestion} size={18} className="cursor-pointer hover:text-white" />
              <Shuffle size={18} className="cursor-pointer hover:text-white" />
            </div>
          </>
        )}
      </div>

      {/* CENTER */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        
        {/* RUN */}
        <button
          onClick={onRun}
          disabled={running}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md 
            bg-[#161B22] border border-[#30363D] transition
            ${
              running
                ? "opacity-50 cursor-not-allowed text-[#8B949E]"
                : "text-[#C9D1D9] hover:border-[#58A6FF] hover:text-[#58A6FF]"
            }`}
        >
          {running ? (
            <span className="w-3 h-3 border-2 border-[#30363D] border-t-[#58A6FF] rounded-full animate-spin" />
          ) : (
            <Play size={14} />
          )}
          <span className="text-sm">
            {running ? "Running" : "Run"}
          </span>
        </button>

        {/* SUBMIT */}
        <button
          onClick={onSubmit}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md 
            bg-[#161B22] text-[#3FB950] border border-[#30363D]
            hover:bg-[#1F2937] transition"
        >
          <UploadCloud size={14} />
          <span className="text-sm font-medium">Submit</span>
        </button>

      </div>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-3 text-[#8B949E]">
        {/* Avatar */}
        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-600">
          <User size={16} />
        </div>

        {/* Premium */}
        <button className="px-3 py-1.5 rounded-md 
          bg-[#2A1F0F] text-[#F59E0B] text-sm font-medium
          hover:bg-[#3A2A15] transition">
          Premium
        </button>
      </div>
    </div>
  );
};

export default TopNavbar;