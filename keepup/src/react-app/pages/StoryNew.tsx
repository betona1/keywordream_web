// 성과 올리기 — 글 + 사진(최대 6장) 업로드
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUrl, type Me } from "../lib/api";

const MAX_IMAGES = 6;
const MAX_IMAGE_MB = 5;

export default function StoryNew({
  me,
  loading,
  mainUrl,
}: {
  me: Me;
  loading: boolean;
  mainUrl: string;
}) {
  const navigate = useNavigate();
  const [routineType, setRoutineType] = useState<"stack" | "goal">("stack");
  const [title, setTitle] = useState("");
  const [routineName, setRoutineName] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [certCount, setCertCount] = useState("");
  const [achievedPercent, setAchievedPercent] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [agreePublish, setAgreePublish] = useState(false); // 서버 저장·공개 동의 (필수)
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !me) window.location.href = loginUrl(mainUrl);
  }, [me, loading, mainUrl]);

  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  if (loading || !me) return null;

  const pickFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= MAX_IMAGES) break;
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        setMsg("JPG / PNG / WebP 이미지만 올릴 수 있습니다.");
        continue;
      }
      if (f.size > MAX_IMAGE_MB * 1024 * 1024) {
        setMsg(`사진 한 장은 ${MAX_IMAGE_MB}MB 이하여야 합니다.`);
        continue;
      }
      next.push(f);
    }
    setFiles(next);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreePublish) {
      setMsg("게시물 저장·공개에 대한 동의가 필요합니다 (필수)");
      return;
    }
    setBusy(true);
    setMsg("");
    const fd = new FormData();
    fd.set("title", title);
    fd.set("routineType", routineType);
    fd.set("routineName", routineName);
    if (periodStart) fd.set("periodStart", periodStart);
    if (periodEnd) fd.set("periodEnd", periodEnd);
    if (certCount) fd.set("certCount", certCount);
    if (achievedPercent) fd.set("achievedPercent", achievedPercent);
    fd.set("body", body);
    files.forEach((f) => fd.append("images", f));

    try {
      const res = await fetch("/api/posts", { method: "POST", body: fd, credentials: "same-origin" });
      const json = (await res.json()) as { ok: boolean; data?: { id: number }; error?: string };
      if (json.ok && json.data) {
        navigate(`/stories/${json.data.id}`);
        return;
      }
      setMsg(`등록 실패: ${json.error ?? "unknown"}`);
    } catch {
      setMsg("네트워크 오류가 발생했습니다.");
    }
    setBusy(false);
  };

  const input =
    "w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm focus:border-brand focus:outline-none";
  const label = "mb-1.5 block text-xs font-bold text-muted";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-extrabold tracking-tight">내 성과 올리기</h1>
      <p className="mt-2 text-sm text-muted">
        완주한 시즌의 기록을 자랑해 주세요. 인증 사진(워터마크 포함)을 함께 올리면 더 좋습니다.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-3xl border border-line bg-card p-6 sm:p-8">
        <div>
          <span className={label}>루틴 유형</span>
          <div className="flex gap-2">
            {(
              [
                ["stack", "적립형 (매일 쌓기)"],
                ["goal", "결과형 (목표 달성)"],
              ] as const
            ).map(([v, t]) => (
              <button
                key={v}
                type="button"
                onClick={() => setRoutineType(v)}
                className={`flex-1 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition ${
                  routineType === v
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-line text-muted hover:border-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={label}>제목</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            required
            placeholder="예: 63일 매일 10km 걷기, 완주했습니다!"
            className={input}
          />
        </div>

        <div>
          <label className={label}>루틴 이름</label>
          <input
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            maxLength={60}
            required
            placeholder={routineType === "stack" ? "예: 매일 10km 걷기" : "예: 시즌 내 책 5권 읽기"}
            className={input}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>시작일</label>
            <input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className={input} />
          </div>
          <div>
            <label className={label}>종료일</label>
            <input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className={input} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label}>총 인증 횟수 (선택)</label>
            <input
              type="number"
              min={0}
              max={10000}
              value={certCount}
              onChange={(e) => setCertCount(e.target.value)}
              placeholder="예: 54"
              className={input}
            />
          </div>
          <div>
            <label className={label}>달성률 % (선택)</label>
            <input
              type="number"
              min={0}
              max={1000}
              value={achievedPercent}
              onChange={(e) => setAchievedPercent(e.target.value)}
              placeholder="예: 86"
              className={input}
            />
          </div>
        </div>

        <div>
          <label className={label}>이야기</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={5000}
            required
            rows={7}
            placeholder="이 루틴을 시작한 이유, 힘들었던 고비, 완주 소감을 들려주세요."
            className={`${input} resize-y`}
          />
        </div>

        <div>
          <span className={label}>
            인증 사진 ({files.length}/{MAX_IMAGES})
          </span>
          <div className="grid grid-cols-3 gap-2">
            {previews.map((u, i) => (
              <div key={u} className="relative aspect-square overflow-hidden rounded-xl border border-line">
                <img src={u} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/70 text-xs font-bold text-white"
                  aria-label="사진 제거"
                >
                  ×
                </button>
              </div>
            ))}
            {files.length < MAX_IMAGES && (
              <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line text-2xl text-muted hover:border-brand hover:text-brand">
                +
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    pickFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          <p className="mt-1.5 text-[11px] text-muted">JPG/PNG/WebP · 장당 최대 {MAX_IMAGE_MB}MB</p>
        </div>

        {/* 서버 저장·공개 동의 (필수) — 게시 시점 명시적 동의 */}
        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line bg-paper px-4 py-3">
          <input
            type="checkbox"
            checked={agreePublish}
            onChange={(e) => {
              setAgreePublish(e.target.checked);
              if (e.target.checked) setMsg("");
            }}
            className="mt-0.5 h-4 w-4 accent-brand"
          />
          <span className="text-xs leading-relaxed text-muted">
            <b className="text-ink">[필수]</b> 작성한 글·사진이 서버에 저장되어{" "}
            <b className="text-ink">누구나 볼 수 있게 공개</b>되는 것에 동의합니다. 게시물은 언제든
            직접 삭제할 수 있습니다.{" "}
            <a href="/privacy" target="_blank" className="underline hover:text-ink">
              개인정보처리방침
            </a>
          </span>
        </label>

        {msg && <p className="text-sm font-semibold text-stamp">{msg}</p>}

        <button
          disabled={busy}
          className="w-full rounded-2xl bg-brand px-4 py-3.5 text-sm font-extrabold text-white hover:bg-brand-deep disabled:opacity-50"
        >
          {busy ? "올리는 중…" : "성과 올리기"}
        </button>
      </form>
    </main>
  );
}
