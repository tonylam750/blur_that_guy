import React, { useEffect, useRef, useState } from "react";
import { Upload, Download } from "lucide-react";
import { uploadVideo, detectFaces, blurFace } from "@/lib/api";
import NavBar from "@/components/navbar";

export default function FaceBlurUIPage() {
  const inputRef = useRef(null);
  const videoRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);
  const [selectedFace, setSelectedFace] = useState(null);

  const [videoId, setVideoId] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [currentFaces, setCurrentFaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".mp4")) {
      alert("Only MP4 files are supported");
      return;
    }
    try {
      setLoading(true);
      setFileName(file.name);
      setSelectedFace(null);
      setOutputUrl("");
      setAnalysis(null);
      setVideoUrl("");
     

      const uploadData = await uploadVideo(file);
      setVideoId(uploadData.video_id);
      setVideoUrl(uploadData.video_url);

      const analyzeData = await detectFaces(uploadData.video_id);
      setAnalysis(analyzeData);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !analysis) return;
    const updateFaces = () => {
      const fps = analysis.fps || 30;
      const frameIndex = Math.floor(video.currentTime * fps);
      setCurrentFaces(analysis.frames?.[String(frameIndex)] || []);
    };
    video.addEventListener("timeupdate", updateFaces);
    video.addEventListener("seeked", updateFaces);
    video.addEventListener("loadedmetadata", updateFaces);
    return () => {
      video.removeEventListener("timeupdate", updateFaces);
      video.removeEventListener("seeked", updateFaces);
      video.removeEventListener("loadedmetadata", updateFaces);
    };
  }, [analysis]);

  const handleProcess = async () => {
    if (!videoId || selectedFace == null) return;
    try {
      setProcessing(true);
      const data = await blurFace(videoId, selectedFace);
      setOutputUrl(data.output_url);
      setShowOriginal(false);
    } catch (err) {
      console.error(err);
      alert("Processing failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    const baseName = fileName.replace(/\.mp4$/i, "");
    try {
      const response = await fetch(outputUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}_blurred.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  const getScaledFaceStyle = (face) => {
    if (!analysis || !videoRef.current) return {};
    const video = videoRef.current;
    const box = video.getBoundingClientRect();
    const videoRatio = analysis.width / analysis.height;
    const elementRatio = box.width / box.height;
    let realWidth = box.width, realHeight = box.height, offsetX = 0, offsetY = 0;
    if (elementRatio > videoRatio) {
      realHeight = box.height;
      realWidth = realHeight * videoRatio;
      offsetX = (box.width - realWidth) / 2;
    } else {
      realWidth = box.width;
      realHeight = realWidth / videoRatio;
      offsetY = (box.height - realHeight) / 2;
    }
    return {
      left: `${offsetX + (face.x / analysis.width) * realWidth}px`,
      top: `${offsetY + (face.y / analysis.height) * realHeight}px`,
      width: `${(face.w / analysis.width) * realWidth}px`,
      height: `${(face.h / analysis.height) * realHeight}px`,
    };
  };

  const displayedVideo = showOriginal || !outputUrl ? videoUrl : outputUrl;

  return (
    <>
    <div className="flex flex-col h-screen overflow-hidden bg-black">
      <NavBar />
      <div className="flex flex-1 overflow-hidden min-h-0 text-gray-400">
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <div
            className={`relative flex flex-1 items-center justify-center min-h-0 bg-[#0e0e0f] ${!videoUrl ? "cursor-pointer" : ""} ${isDragging ? "outline outline-[#4f8ef7] -outline-offset-2" : ""}`}
            onClick={() => !videoUrl && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
          >
            {!videoUrl ? (
              <div className="text-center pointer-events-none">
                <div className="w-14 h-14 rounded mx-auto mb-5 border border-[#4f8ef7] bg-[#141416] flex items-center justify-center">
                  <Upload size={20} color="#4f8ef7" />
                </div>
                <p className="text-sm  m-0">
                  {loading ? "Uploading and detecting faces..." : "Drop mp4 file or click to import"}
                </p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={displayedVideo}
                  controls
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-full object-contain"
                />
                {showOriginal && analysis && (
                  <div className="absolute inset-0 pointer-events-none">
                    {currentFaces.map((face) => {
                      const s = getScaledFaceStyle(face);
                      const isSelected = selectedFace === face.track_id;
                      return (
                        <button
                          key={face.track_id}
                          onClick={(e) => { e.stopPropagation(); setSelectedFace(face.track_id); }}
                          className={`absolute pointer-events-auto cursor-pointer  ${
                            isSelected
                              ? "border-2 border-[#4f8ef7] bg-[#4f8ef7]]"
                              : "border-2 border-white  hover:border-gray-600"
                          }`}
                          style={s}
                       
                        >
                          <span className={`absolute -top-5.5 left-0 text-[9px] px-1.5 py-0.5  ${
                            isSelected ? "bg-[#4f8ef7] text-white" : "bg-[#1e1e22] text-[#888]"
                          }`}>
                            P{face.track_id.toString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

        </div>

        
        <div className="w-[350px] flex-shrink-0 flex flex-col overflow-hidden bg-[#111113] border-l border-[#25252e]">

          <div className="border-b border-[#1e1e22]">
            <div className="px-4 py-2.5 text-[13px]  border-b border-[#1a1a1e]">
              SOURCE
            </div>
            <div
              className="px-4 py-3 cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              <div className="px-3 py-2.5 bg-[#0e0e0f] border border-[#222225] text-[13px]  hover:border-[#333337] ">
                {fileName
                  ? <span className="text-[#c8c8c8]">{fileName}</span>
                  : <span>No file loaded</span>
                }
              </div>
             
            </div>
          </div>

    
          <div className="flex-1 overflow-auto border-b border-[#1e1e22]">
            <div className=" px-4 py-2.5 text-[13px] border-b border-[#1a1a1e] bg-[#111113]">
              <span>Faces</span>
            </div>

            <div className="p-2">
              {!analysis ? (
                <p className="py-4 text-[15px] text-center">
                  {loading ? "Analyzing..." : "No video loaded"}
                </p>
              ) : currentFaces.length === 0 ? (
                <p className="py-4 text-[10px]  text-center">
                  No face in current frame
                </p>
              ) : (
                currentFaces.map((face) => {
                  const isSelected = selectedFace === face.track_id;
                  return (
                    <button
                      key={face.track_id}
                      onClick={() => setSelectedFace(face.track_id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 mb-0.5 text-left font-mono cursor-pointer border ${
                        isSelected
                          ? "bg-[#1a2030] border-[#2a3a5a]"
                          : "bg-transparent border-transparent hover:bg-[#161618]"
                      }`}
                    >
                      <div className={`w-7 h-7 flex-shrink-0 flex items-center justify-center text-[9px] font-semibold ${
                        isSelected ? "bg-[#4f8ef7] text-white" : "bg-[#1e1e22] text-[#555]"
                      }`}>
                        P{face.track_id.toString()}
                      </div>
                      <div>
                        <div className={`text-[11px] ${isSelected ? "text-[#c8c8c8]" : "text-[#666]"}`}>
                          Person {face.track_id}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="p-4 flex-shrink-0">
            {!outputUrl ? (
              <>
                {selectedFace != null && (
                  <div className="mb-2.5 flex justify-between items-center px-2.5 py-1.5 bg-[#1a2030] border border-[#2a3a5a] text-[10px] text-[#4f8ef7]">
                    <span>SELECTED</span>
                    <span>person {selectedFace}</span>
                  </div>
                )}
                <button
                  onClick={handleProcess}
                  disabled={selectedFace == null || processing || !videoId}
                  className={`w-full py-3 text-[11px] tracking-widest uppercase font-semibold font-mono border ${
                    selectedFace != null && !processing && videoId
                      ? "bg-[#4f8ef7] border-[#4f8ef7] text-white cursor-pointer hover:bg-[#3a7de6]"
                      : "bg-[#161618] border-[#222225] text-[#f6f6f6] cursor-not-allowed"
                  }`}
                >
                  {processing ? "Processing..." : "Apply Blur"}
                </button>
              </>
            ) : (
              <>
                <div className="mb-2.5 flex justify-between items-center px-2.5 py-1.5 bg-[#0f1f13] border border-[#1e3a22] text-[13px] text-[#4caf6e]">
                  <span>BLURRING COMPLETED </span>
                  <span>✓</span>
                </div>
                <button
                  onClick={handleDownload}
                  className="w-full py-3 flex items-center justify-center gap-2 text-[13px] font-semibold bg-[#141416] border border-[#2a2a2e] text-[#c8c8c8] cursor-pointer hover:border-[#444] hover:text-white"
                >
                  <Download size={13} />
                  EXPORT MP4
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".mp4,video/mp4"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  </>
  );
}