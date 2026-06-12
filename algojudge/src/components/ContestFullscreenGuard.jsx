import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../api";

export default function ContestFullscreenGuard({ testId }) {
  const navigate = useNavigate();
  const markingRef = useRef(false);

  useEffect(() => {
    if (!testId) return;

    const participantRaw = localStorage.getItem("cf_participant");
    const started = localStorage.getItem(`cf_test_started_${testId}`);

    if (!participantRaw || started !== "true") return;

    let participant = null;

    try {
      participant = JSON.parse(participantRaw);
    } catch {
      participant = null;
    }

    if (!participant?.participantId) return;

    const disqualify = async () => {
      if (markingRef.current) return;
      markingRef.current = true;

      try {
        await apiPost(
          `/tests/${testId}/participants/${participant.participantId}/disqualify`,
          {
            reason: "Participant exited fullscreen mode during contest.",
          }
        );
      } catch {
        // Even if backend fails, block locally.
      }

      localStorage.setItem(`cf_test_blocked_${testId}`, "true");
      localStorage.removeItem("cf_participant");

      alert("You exited fullscreen mode. You are now out of the contest.");

      navigate("/test-access", { replace: true });
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        disqualify();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [testId, navigate]);

  return null;
}