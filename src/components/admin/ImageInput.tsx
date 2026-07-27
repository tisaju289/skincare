import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;

export function ImageInput({
  label,
  value,
  onChange,
  hint,
  folder = "uploads",
}: {
  label: string;
  value: string | null | undefined;
  onChange: (url: string) => void;
  hint?: string;
  folder?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = value ?? "";

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      onChange(`/api/public/media/${path}`);
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const onFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) void upload(file);
  };

  return (
    <div className="space-y-2">
      <label className="block">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <input
          value={url}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload below"
          className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[color:var(--brand-pink)]"
        />
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          onFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        className={`flex items-center gap-3 rounded-xl border border-dashed px-4 py-3 cursor-pointer transition-colors ${
          dragging ? "border-[color:var(--brand-pink)] bg-[color:var(--brand-pink)]/5" : "border-border hover:bg-muted/50"
        }`}
      >
        {url ? (
          <img src={url} alt="" loading="lazy" decoding="async" className="h-12 w-12 rounded-lg object-cover border border-border" />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-muted grid place-items-center">
            <Upload className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold">
            {busy ? "Uploading…" : "Drag & drop an image, or click to browse"}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">{hint ?? "PNG, JPG, WEBP or SVG · max 5MB"}</p>
        </div>
        {busy && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {!busy && url && (
          <button
            type="button"
            aria-label="Remove image"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="p-1 rounded-md hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
