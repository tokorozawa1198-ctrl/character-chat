"use client";

export function SaveStatus({ message, loadFailed, onRetry }: { message: string; loadFailed: boolean; onRetry: () => void }) {
  return <div className={loadFailed ? "saveStatusBackdrop" : "saveStatusFloating"}>
    <style>{`
      .saveStatusBackdrop{position:fixed;inset:0;z-index:200000;background:#090c12ed;display:grid;place-items:center;padding:20px}
      .saveStatusFloating{position:fixed;bottom:max(18px,env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:200000;width:min(460px,calc(100% - 32px))}
      .saveStatus{box-sizing:border-box;width:100%;max-width:460px;background:#292029;color:#fff;border:1px solid #e0a3b7;border-radius:12px;padding:20px;box-shadow:0 8px 32px #0009}
      .saveStatus strong{display:block;font-size:18px}.saveStatus p{font-size:15px;line-height:1.6;margin:10px 0 16px;color:#f3e7ed}
      .saveStatus button{min-height:44px;padding:10px 18px;border:0;border-radius:7px;background:#f0c4d3;color:#281d26;font:inherit;font-weight:700;cursor:pointer}
    `}</style>
    <section className="saveStatus" role="alert">
      <strong>{loadFailed ? "저장 기록 확인 필요" : "아직 저장되지 않았어요"}</strong>
      <p>{message}</p>
      <button type="button" onClick={onRetry}>{loadFailed ? "다시 불러오기" : "다시 저장"}</button>
    </section>
  </div>;
}
