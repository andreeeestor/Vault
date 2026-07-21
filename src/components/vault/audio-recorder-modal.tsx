"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RefreshCw, UploadCloud } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useVaultStore } from "@/lib/vault-store";
import { mapItem } from "@/lib/mappers";

interface AudioRecorderModalProps {
  open: boolean;
  onClose: () => void;
}

export function AudioRecorderModal({ open, onClose }: AudioRecorderModalProps) {
  const currentFolderId = useVaultStore((s) => s.currentFolderId);
  const addItem = useVaultStore((s) => s.addItem);

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("Gravação de Áudio");
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Permissão de microfone negada ou indisponível.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setDuration(0);
  };

  const handleSave = async () => {
    if (!audioBlob) return;
    const fileTitle = title.trim() || "Gravação de Áudio";
    const file = new File([audioBlob], `${fileTitle}.webm`, { type: "audio/webm" });

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "AUDIO");
    if (currentFolderId && currentFolderId !== "root") {
      formData.append("folderId", currentFolderId);
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Erro no upload");

      const data = await res.json();
      const item = mapItem(data.item);
      addItem(item);

      toast.success("Áudio salvo no cofre!");
      handleClose();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar áudio no cofre.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (recording) stopRecording();
    handleReset();
    onClose();
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent showClose={false} className="max-w-md p-6 gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">Gravar Áudio</h3>
            <p className="text-xs text-[var(--foreground-subtle)] mt-0.5">
              Grave uma nota de voz ou áudio diretamente no seu cofre
            </p>
          </div>
        </div>

        {}
        <div className="flex flex-col items-center justify-center py-6 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] gap-4">
          <span className="text-3xl font-mono font-bold tracking-wider text-[var(--foreground)]">
            {formatTimer(duration)}
          </span>

          {!audioUrl ? (
            <div className="flex items-center gap-3">
              {!recording ? (
                <Button
                  onClick={startRecording}
                  className="h-14 w-14 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25 transition-transform hover:scale-105 active:scale-95"
                >
                  <Mic className="h-6 w-6" />
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="h-14 w-14 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg animate-pulse"
                >
                  <Square className="h-6 w-6" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full px-6">
              <audio src={audioUrl} controls className="w-full h-10 rounded-lg outline-none" />
              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs gap-1.5 text-[var(--foreground-muted)]">
                <RefreshCw className="h-3.5 w-3.5" /> Gravar novamente
              </Button>
            </div>
          )}
        </div>

        {audioUrl && (
          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--foreground-subtle)]">Título da gravação</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Reunião do projeto, Ideia rápida..."
                className="mt-1"
              />
            </div>
            <Button onClick={handleSave} disabled={uploading} className="w-full gap-2">
              <UploadCloud className="h-4 w-4" />
              {uploading ? "Salvando…" : "Salvar no Vault"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
