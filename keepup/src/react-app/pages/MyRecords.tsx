// 내 기록 — 앱이 계정에 올려 둔 백업(ZIP)을 브라우저에서 풀어 웹페이지로 보여준다.
// 서버는 ZIP을 해석하지 않으므로(개인 기록), 풀어 보는 것도 내 브라우저 안에서만 일어난다.
import { useEffect, useRef, useState } from "react";
import { unzipSync, strFromU8 } from "fflate";
import { api, loginUrl, type Me } from "../lib/api";

type SyncMeta = { exists: boolean; size: number; updatedAt: string | null };

/** 앱 백업 data.json의 루틴/인증 (필요한 필드만) */
type BRoutine = {
  id: string;
  type: "accumulate" | "result";
  title: string;
  startDate: string;
  endDate: string;
  iconPath?: string | null;
};
type BCert = {
  id: string;
  routineId: string;
  dateKey: string;
  photoPath?: string;
  memo?: string;
  timestamp: string;
};

type Loaded = {
  routines: BRoutine[];
  certs: BCert[];
  /** media/<파일명> → blob URL */
  photo: Map<string, string>;
};

const TYPE_LABEL = { accumulate: "적립형", result: "결과형" } as const;

function sizeLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 앱과 같은 규칙 — 시작 후 1주=1단계, 2주간=2단계, 3주후=3단계 */
function stampLevel(startDate: string): 1 | 2 | 3 {
  const days = Math.floor((Date.now() - new Date(startDate).getTime()) / 86400000);
  if (days >= 21) return 3;
  if (days >= 7) return 2;
  return 1;
}

const LEVEL_BADGE: Record<number, { label: string; cls: string }> = {
  1: { label: "1단계", cls: "bg-paper text-muted border border-line" },
  2: { label: "⭐ 2단계", cls: "bg-gradient-to-r from-stamp to-neon text-white" },
  3: { label: "👑 3단계", cls: "bg-gradient-to-r from-amber-400 to-orange-400 text-white" },
};

export default function MyRecords({ me, loading, mainUrl }: { me: Me; loading: boolean; mainUrl: string }) {
  const [meta, setMeta] = useState<SyncMeta | null>(null);
  const [phase, setPhase] = useState<"meta" | "downloading" | "ready" | "empty" | "error">("meta");
  const [data, setData] = useState<Loaded | null>(null);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (loading || !me) return;
    let cancelled = false;

    (async () => {
      const m = await api<SyncMeta>("/api/sync/meta");
      if (cancelled) return;
      if (!m.ok) return setPhase("error");
      setMeta(m.data);
      if (!m.data.exists) return setPhase("empty");

      setPhase("downloading");
      try {
        const res = await fetch("/api/sync", { credentials: "same-origin" });
        if (!res.ok) throw new Error(`${res.status}`);
        const buf = new Uint8Array(await res.arrayBuffer());
        if (cancelled) return;

        const files = unzipSync(buf);
        const json = JSON.parse(strFromU8(files["data.json"])) as {
          routines: BRoutine[];
          certs: BCert[];
        };
        const photo = new Map<string, string>();
        for (const [name, bytes] of Object.entries(files)) {
          if (!name.startsWith("media/")) continue;
          const file = name.slice(6);
          const mime = file.endsWith(".png") ? "image/png" : "image/jpeg";
          if (!/\.(jpg|jpeg|png|webp)$/i.test(file)) continue; // 사진만 (녹음·영상 제외)
          const url = URL.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: mime }));
          photo.set(file, url);
          urlsRef.current.push(url);
        }
        setData({ routines: json.routines ?? [], certs: json.certs ?? [], photo });
        setPhase("ready");
      } catch {
        if (!cancelled) setPhase("error");
      }
    })();

    return () => {
      cancelled = true;
      for (const u of urlsRef.current) URL.revokeObjectURL(u);
      urlsRef.current = [];
    };
  }, [me, loading]);

  if (loading) return null;

  // 로그인 안내
  if (!me) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">내 기록</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          앱에서 올려 둔 습관 기록을 웹에서 보려면 로그인이 필요해요.
          <br />
          기록은 본인 계정에서만 볼 수 있습니다.
        </p>
        <a
          href={loginUrl(mainUrl)}
          className="mt-8 inline-block rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-deep"
        >
          로그인하고 내 기록 보기
        </a>
      </main>
    );
  }

  const totalStamps = data ? new Set(data.certs.map((c) => `${c.routineId}|${c.dateKey}`)).size : 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">내 기록</h1>
          <p className="mt-2 text-sm text-muted">
            {me.name}님이 앱에서 올린 습관 기록
            {meta?.updatedAt && (
              <>
                {" "}
                · 마지막 올리기 <b className="text-ink">{fmtDateTime(meta.updatedAt)}</b> (
                {sizeLabel(meta.size)})
              </>
            )}
          </p>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          최신으로 바꾸려면: 폰 앱 → 오른쪽 위 ⋮ → 클라우드 백업 → <b>지금 기록 올리기</b>
        </p>
      </div>

      {phase === "meta" || phase === "downloading" ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-brand" />
          <p className="text-sm font-semibold text-muted">
            {phase === "downloading" && meta
              ? `기록 불러오는 중… (${sizeLabel(meta.size)})`
              : "확인 중…"}
          </p>
        </div>
      ) : phase === "empty" ? (
        <div className="mt-12 rounded-3xl border border-line bg-card p-10 text-center">
          <p className="text-lg font-extrabold">아직 올려 둔 기록이 없어요</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            폰 앱에서 <b className="text-ink">오른쪽 위 ⋮ → 클라우드 백업 → 지금 기록 올리기</b>를
            누르면, 루틴·도장·인증 사진이 이 페이지에 그대로 나타납니다.
          </p>
        </div>
      ) : phase === "error" || !data ? (
        <div className="mt-12 rounded-3xl border border-line bg-card p-10 text-center">
          <p className="font-extrabold text-stamp">기록을 불러오지 못했어요</p>
          <p className="mt-2 text-sm text-muted">잠시 후 새로고침해 주세요.</p>
        </div>
      ) : (
        <>
          {/* 요약 */}
          <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
            {[
              ["루틴", data.routines.length],
              ["도장", totalStamps],
              ["사진", data.photo.size],
            ].map(([label, n]) => (
              <div key={label} className="rounded-2xl border border-line bg-card px-4 py-3 text-center">
                <p className="text-xl font-extrabold text-brand">{n}</p>
                <p className="mt-0.5 text-xs font-semibold text-muted">{label}</p>
              </div>
            ))}
          </div>

          {/* 루틴별 카드 */}
          <div className="mt-8 space-y-8">
            {data.routines.map((r) => {
              const certs = data.certs
                .filter((c) => c.routineId === r.id)
                .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
              const stamps = new Set(certs.map((c) => c.dateKey)).size;
              const lv = stampLevel(r.startDate);
              const icon = r.iconPath ? data.photo.get(r.iconPath) : null;
              const photos = certs.filter((c) => c.photoPath && data.photo.has(c.photoPath));

              return (
                <section key={r.id} className="rounded-3xl border border-line bg-card p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {icon ? (
                      <img src={icon} alt="" className="h-12 w-12 rounded-2xl object-cover" />
                    ) : (
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/10 text-xl">
                        {r.type === "accumulate" ? "📆" : "🎯"}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="flex flex-wrap items-center gap-2 text-lg font-extrabold tracking-tight">
                        <span className="truncate">{r.title}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${LEVEL_BADGE[lv].cls}`}
                        >
                          {LEVEL_BADGE[lv].label}
                        </span>
                      </h2>
                      <p className="mt-0.5 text-xs text-muted">
                        {TYPE_LABEL[r.type] ?? r.type} ·{" "}
                        {r.startDate?.slice(0, 10).replaceAll("-", ".")} ~{" "}
                        {r.endDate?.slice(0, 10).replaceAll("-", ".")}
                      </p>
                    </div>
                    <p className="text-sm font-extrabold text-stamp">도장 {stamps}개</p>
                  </div>

                  {photos.length > 0 && (
                    <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                      {photos.map((c) => (
                        <figure key={c.id} className="group relative overflow-hidden rounded-xl">
                          <img
                            src={data.photo.get(c.photoPath!)}
                            alt={c.memo || c.dateKey}
                            loading="lazy"
                            className="aspect-square w-full object-cover transition group-hover:scale-105"
                          />
                          <figcaption className="absolute bottom-1 left-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-white">
                            {c.dateKey.slice(5).replace("-", ".")}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          <p className="mt-10 text-center text-xs text-muted">
            이 페이지는 내 계정에서만 보입니다. 자랑하고 싶은 기록은{" "}
            <a href="/stories" className="font-bold text-brand hover:underline">
              성과 게시판
            </a>
            에 올려 보세요.
          </p>
        </>
      )}
    </main>
  );
}
