from pathlib import Path
import uuid
import subprocess

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from processor import detect_faces_in_video, blur_face_in_video

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
OUTPUT_DIR = Path("outputs")

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

tracks_store = {}


class ProcessBody(BaseModel):
    track_id: int

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".mp4"):
        raise HTTPException(status_code=400, detail="Only mp4 files are allowed")

    video_id = str(uuid.uuid4())
    raw_path = UPLOAD_DIR / f"{video_id}_raw.mp4"
    video_path = UPLOAD_DIR / f"{video_id}.mp4"

    raw_path.write_bytes(await file.read())

    subprocess.run([
        "ffmpeg", "-y",
        "-i", str(raw_path),
        "-vf", "scale=-2:1080",
        "-vcodec", "libx264",
        "-preset", "fast",
        str(video_path),
    ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    raw_path.unlink()

    return {
        "video_id": video_id,
        "video_url": f"http://localhost:8000/uploads/{video_id}.mp4"
    }
@app.post("/detectFaces/{video_id}")
def deteck_faces(video_id: str):
    video_path = UPLOAD_DIR / f"{video_id}.mp4"

    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    result = detect_faces_in_video(str(video_path))
    tracks_store[video_id] = result["frames"]

    return result


@app.post("/blurFace/{video_id}")
def blur_face(video_id: str, body: ProcessBody):
    video_path = UPLOAD_DIR / f"{video_id}.mp4"

    if not video_path.exists():
        raise HTTPException(status_code=404, detail="Video not found")

    if video_id not in tracks_store:
        raise HTTPException(status_code=400, detail="Analyze the video first")

    output_path = OUTPUT_DIR / f"{video_id}_blurred.mp4"

    blur_face_in_video(
        video_path=str(video_path),
        output_path=str(output_path),
        frames_data=tracks_store[video_id],
        selected_track_id=body.track_id,
    )

    video_path.unlink(missing_ok=True)
    tracks_store.pop(video_id, None)

    return {
        "output_url": f"http://localhost:8000/outputs/{video_id}_blurred.mp4"
    }