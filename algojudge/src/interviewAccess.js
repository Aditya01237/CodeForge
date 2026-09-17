const accessKey = (roomCode) =>
  `cf_interview_access_${String(roomCode || "").trim().toUpperCase()}`;

export function storeInterviewAccess(roomCode, accessToken) {
  if (!roomCode || !accessToken) return;
  sessionStorage.setItem(accessKey(roomCode), accessToken);
}

export function readInterviewAccess(roomCode) {
  if (!roomCode) return "";
  return sessionStorage.getItem(accessKey(roomCode)) || "";
}

export function clearInterviewAccess(roomCode) {
  if (!roomCode) return;
  sessionStorage.removeItem(accessKey(roomCode));
}
