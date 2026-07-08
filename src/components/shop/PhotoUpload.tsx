import { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";

interface PhotoUploadProps {
  shapePreviewImage: string;
  onPhotoChange: (file: File | null) => void;
  externalPreview?: string | null;
}

export function PhotoUpload({ shapePreviewImage, onPhotoChange, externalPreview }: PhotoUploadProps) {
  const [internalPreview, setPreview] = useState<string | null>(null);
  const preview = externalPreview !== undefined ? externalPreview : internalPreview;
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      if (internalPreview && internalPreview.startsWith("blob:")) {
        URL.revokeObjectURL(internalPreview);
      }
      const url = URL.createObjectURL(file);
      setPreview(url);
      onPhotoChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cleanup only internal blob URLs
  useEffect(() => {
    return () => {
      if (internalPreview && internalPreview.startsWith("blob:")) {
        URL.revokeObjectURL(internalPreview);
      }
    };
  }, [internalPreview]);

  return (
    <div className="mt-8">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative min-h-[240px] border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center p-6 text-center ${
          isDragging ? "border-gold bg-gold/10" : "border-gray-300 hover:border-gold/50 bg-card/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {preview ? (
          <div className="relative w-full h-full min-h-[200px] flex items-center justify-center">
            <img
              src={preview}
              alt="Preview"
              className="max-h-[200px] rounded-xl shadow-luxe object-contain"
            />
          </div>
        ) : (
          <div className="relative z-10">
            <Upload className="w-12 h-12 text-gold mx-auto mb-4" />
            <h3 className="text-[12px] tracking-[0.2em] uppercase font-bold text-gold">
              Upload Your Photo
            </h3>

            {/* Shape Watermark */}
            <div className="absolute inset-0 -z-10 opacity-10 flex items-center justify-center pointer-events-none">
              <img src={shapePreviewImage} alt="" className="w-32 h-32 object-contain grayscale" />
            </div>
          </div>
        )}

        <button
          onClick={handleReset}
          className="mt-4 text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-gold underline"
        >
          {preview ? "Clear & Start Over" : "Start Over"}
        </button>
      </div>
    </div>
  );
}
