const API = "http://localhost:8000";

export async function uploadVideo(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload video failed");
  }

  return res.json();
}

export async function detectFaces(videoId) {
  const res = await fetch(`${API}/detectFaces/${videoId}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Detect faces failed");
  }

  return res.json();
}

export async function blurFace(videoId, trackId) {
  const res = await fetch(`${API}/blurFace/${videoId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      track_id: trackId,
    }),
  });

  if (!res.ok) {
    throw new Error("Blur face failed");
  }

  return res.json();
}