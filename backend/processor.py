import os
import subprocess
import cv2
import math

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROTOTXT_PATH = os.path.join(BASE_DIR, "deploy.prototxt")
MODEL_PATH = os.path.join(BASE_DIR, "face_model.caffemodel")

SAMPLE_EVERY = 3
MAX_DISTANCE = 200
MAX_MISSES = 30
CONFIDENCE_LIMIT = 0.5
OVERLAY_PATH = os.path.join(BASE_DIR, "andre.jpeg")


def load_model():
    return cv2.dnn.readNetFromCaffe(PROTOTXT_PATH, MODEL_PATH)


def box_center(box):
    x, y, w, h = box
    return (x + w / 2, y + h / 2)


def detect_faces(net, frame, width, height):
    blob = cv2.dnn.blobFromImage(
        cv2.resize(frame, (300, 300)),
        1.0,
        (300, 300),
        (104.0, 177.0, 123.0),
    )

    net.setInput(blob)
    detections = net.forward()

    faces = []

    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]

        if confidence < CONFIDENCE_LIMIT:
            continue

        x1 = int(detections[0, 0, i, 3] * width)
        y1 = int(detections[0, 0, i, 4] * height)
        x2 = int(detections[0, 0, i, 5] * width)
        y2 = int(detections[0, 0, i, 6] * height)

        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(width, x2)
        y2 = min(height, y2)

        w = x2 - x1
        h = y2 - y1

        if w > 0 and h > 0:
            faces.append((x1, y1, w, h))

    return faces


def detect_faces_in_video(video_path: str):
    net = load_model()
    cap = cv2.VideoCapture(video_path)

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    frames = {}
    face_tracks = {}
    next_face_id = 0
    frame_index = 0

    while True:
        ok, frame = cap.read()

        if not ok:
            break

        if frame_index % SAMPLE_EVERY == 0:
            detected_faces = detect_faces(net, frame, width, height)
            matched_face_ids = set()

            for box in detected_faces:
                center = box_center(box)

                best_face_id = None
                best_distance = MAX_DISTANCE

                for face_id, face_track in face_tracks.items():
                    if face_id in matched_face_ids:
                        continue

                    old_center = box_center(face_track["box"])

                    distance = math.hypot(
                        center[0] - old_center[0],
                        center[1] - old_center[1],
                    )

                    if distance < best_distance:
                        best_distance = distance
                        best_face_id = face_id

                if best_face_id is None:
                    best_face_id = next_face_id
                    next_face_id += 1

                face_tracks[best_face_id] = {
                    "box": box,
                    "misses": 0,
                }

                matched_face_ids.add(best_face_id)

            for face_id in list(face_tracks.keys()):
                if face_id not in matched_face_ids:
                    face_tracks[face_id]["misses"] += 1

                    if face_tracks[face_id]["misses"] > MAX_MISSES:
                        del face_tracks[face_id]

        if face_tracks:
            frames[str(frame_index)] = [
                {
                    "track_id": face_id,
                    "x": face_track["box"][0],
                    "y": face_track["box"][1],
                    "w": face_track["box"][2],
                    "h": face_track["box"][3],
                }
                for face_id, face_track in face_tracks.items()
            ]

        frame_index += 1

    cap.release()

    return {
        "fps": fps,
        "width": width,
        "height": height,
        "frames": frames,
    }


def blur_face_in_video(video_path: str, output_path: str, frames_data: dict, selected_track_id: int):
    cap = cv2.VideoCapture(video_path)

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    overlay_img = cv2.imread(OVERLAY_PATH)

    tmp_path = output_path + ".tmp.mp4"
    writer = cv2.VideoWriter(
        tmp_path,
        cv2.VideoWriter_fourcc(*"mp4v"),
        fps,
        (width, height),
    )

    frame_index = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            break

        for face in frames_data.get(str(frame_index), []):
            if face["track_id"] != selected_track_id:
                continue

            x, y, w, h = face["x"], face["y"], face["w"], face["h"]

            if w <= 0 or h <= 0:
                continue

            resized_overlay = cv2.resize(overlay_img, (w, h))
            frame[y:y+h, x:x+w] = resized_overlay

        writer.write(frame)
        frame_index += 1

    cap.release()
    writer.release()

    subprocess.run(
        ["ffmpeg", "-y", "-i", tmp_path, "-i", video_path,
         "-map", "0:v:0", "-map", "1:a?",
         "-vcodec", "libx264", "-acodec", "aac",
         "-shortest", "-preset", "fast", "-movflags", "+faststart",
         output_path],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    os.remove(tmp_path)