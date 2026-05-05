import React, { useState, useRef, useCallback, useLayoutEffect } from "react";
import { Upload, Check } from "lucide-react";

interface ImageCropperProps {
  onCrop: (file: File) => void;
  currentAvatar?: string;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  onCrop,
  currentAvatar,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [baseScale, setBaseScale] = useState(1);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const CROP_SIZE = 200; // The diameter of the transparent disk

  // Calculates the hard boundaries to prevent empty space from showing
  const clampPosition = useCallback(
    (x: number, y: number, currentScale: number) => {
      const totalScale = baseScale * currentScale;
      const imgWidth = imageDimensions.width * totalScale;
      const imgHeight = imageDimensions.height * totalScale;

      const maxX = Math.max(0, (imgWidth - CROP_SIZE) / 2);
      const maxY = Math.max(0, (imgHeight - CROP_SIZE) / 2);

      return {
        x: Math.min(Math.max(x, -maxX), maxX),
        y: Math.min(Math.max(y, -maxY), maxY),
      };
    },
    [baseScale, imageDimensions],
  );

  // Handle Wheel Zooming
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevents page scrolling while zooming
      const scaleChange = e.deltaY * -0.002; // Zoom speed multiplier

      setScale((prevScale) => {
        const newScale = Math.min(Math.max(1, prevScale + scaleChange), 3);
        setPosition((prevPos) => clampPosition(prevPos.x, prevPos.y, newScale));
        return newScale;
      });
    };

    // Added as a non-passive listener to actively prevent default scrolling
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [clampPosition]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });

    // Calculate the exact minimum scale required to cover the hole completely
    const initialScale = Math.max(
      CROP_SIZE / naturalWidth,
      CROP_SIZE / naturalHeight,
    );
    setBaseScale(initialScale);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId); // Captures pointer so dragging works outside bounds
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    setPosition(clampPosition(newX, newY, scale));
  };

  const handlePointerUp = () => setIsDragging(false);

  const generateCrop = async () => {
    if (!imageRef.current || !canvasRef.current || !imageSrc) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = imageRef.current;
    const totalScale = baseScale * scale;

    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;

    // Perfect coordinate mapping from screen space to the natural image space
    const sx =
      imageDimensions.width / 2 -
      position.x / totalScale -
      CROP_SIZE / 2 / totalScale;
    const sy =
      imageDimensions.height / 2 -
      position.y / totalScale -
      CROP_SIZE / 2 / totalScale;
    const sWidth = CROP_SIZE / totalScale;
    const sHeight = CROP_SIZE / totalScale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, CROP_SIZE, CROP_SIZE);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "avatar.png", { type: "image/png" });
        onCrop(file);
        setImageSrc(null); // Close cropper after success
      }
    }, "image/png");
  };

  if (!imageSrc) {
    return (
      <div className="group relative flex h-32 w-32 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100">
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt="Current avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <Upload className="h-8 w-8 text-gray-400 group-hover:text-indigo-500" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-gray-800 shadow-sm">
      <div
        ref={containerRef}
        className="relative cursor-move touch-none overflow-hidden rounded-md bg-gray-700"
        style={{ width: CROP_SIZE, height: CROP_SIZE }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <img
          ref={imageRef}
          src={imageSrc}
          alt="To crop"
          draggable={false}
          onLoad={handleImageLoad}
          style={{
            position: "absolute",
            width: `${imageDimensions.width}px`,
            height: `${imageDimensions.height}px`,
            maxWidth: "none",
            maxHeight: "none",
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${baseScale * scale})`,
            transformOrigin: "center",
          }}
        />
        {/* Transparent Disk Overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
            borderRadius: "50%",
          }}
        />
      </div>

      <div className="flex w-full items-center gap-2 px-4">
        <span className="text-xs text-gray-500">-</span>
        <input
          type="range"
          min="1"
          max="3"
          step="0.01" // Increased fidelity for smoother sliding
          value={scale}
          onChange={(e) => {
            const newScale = parseFloat(e.target.value);
            setScale(newScale);
            setPosition((prev) => clampPosition(prev.x, prev.y, newScale));
          }}
          className="w-full accent-indigo-600"
        />
        <span className="text-xs text-gray-500">+</span>
      </div>

      <div className="flex w-full gap-2 p-4">
        <button
          type="button"
          onClick={() => setImageSrc(null)}
          className="flex-1 cursor-pointer rounded-md bg-gray-100 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={generateCrop}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Check size={16} /> Save
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCropper;
