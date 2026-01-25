// app/clewdo/tributes/page.jsx

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tributes",
};

function safeParseJson(maybeJson) {
  try {
    return JSON.parse(maybeJson);
  } catch {
    return null;
  }
}

export default function TributesPage({ searchParams }) {
  const dataParam = searchParams?.data;

  const tributes = (() => {
    if (!dataParam || typeof dataParam !== "string") return [];

    // In Next, searchParams values are typically decoded already.
    // But if YAG double-encodes, this still parses fine because it will be a plain JSON string by the time it hits here.
    const parsed = safeParseJson(dataParam);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((t) => ({
        n: typeof t?.n === "string" ? t.n : "Unknown",
        u: typeof t?.u === "string" ? t.u : "",
      }))
      .filter((t) => t.n && t.u);
  })();

  return (
    <>
      <style>{`
        :root{
          --bg:#0b0b0f;
          --panel:#141421;
          --panel2:#10101a;
          --text:#f2f2f6;
          --muted:#b9b9c7;
          --accent:#B57E5A;
        }
        *{box-sizing:border-box}
        body{
          margin:0;
          background: radial-gradient(1000px 600px at 50% -20%, rgba(181,126,90,.18), transparent 60%),
                      radial-gradient(900px 700px at 0% 0%, rgba(255,255,255,.06), transparent 55%),
                      var(--bg);
          color:var(--text);
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        }
        .wrap{
          max-width: 820px;
          margin: 0 auto;
          padding: 28px 16px 40px;
        }
        .header{
          display:flex;
          align-items:flex-end;
          justify-content:space-between;
          gap:12px;
          margin-bottom: 18px;
        }
        h1{
          margin:0;
          font-size: 38px;
          letter-spacing: .5px;
        }
        .count{
          color:var(--muted);
          font-size: 14px;
          padding-bottom: 6px;
        }
        .grid{
          display:grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 14px;
        }
        .card{
          background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 18px;
          padding: 18px 16px 16px;
          box-shadow: 0 12px 26px rgba(0,0,0,.35);
        }
        .avatar{
          width: 120px;
          height: 120px;
          border-radius: 999px;
          border: 2px solid rgba(181,126,90,.75);
          background: var(--panel2);
          object-fit: cover;
          display:block;
          margin: 6px auto 14px;
        }
        .name{
          text-align:center;
          font-weight: 700;
          font-size: 18px;
          line-height: 1.2;
          word-break: break-word;
        }
        .empty{
          margin-top: 18px;
          padding: 18px 16px;
          border: 1px dashed rgba(255,255,255,.14);
          border-radius: 14px;
          color: var(--muted);
          background: rgba(0,0,0,.18);
        }
        .footer{
          margin-top: 18px;
          color: rgba(185,185,199,.8);
          font-size: 12px;
          text-align:center;
        }
      `}</style>

      <div className="wrap">
        <div className="header">
          <h1>Tributes</h1>
          <div className="count">{tributes.length} volunteered</div>
        </div>

        {tributes.length === 0 ? (
          <div className="empty">
            No tributes yet — go back and press <b>Join</b>.
          </div>
        ) : (
          <div className="grid">
            {tributes.map((t, i) => (
              <div className="card" key={`${t.n}-${i}`}>
                <img className="avatar" src={t.u} alt={t.n} />
                <div className="name">{t.n}</div>
              </div>
            ))}
          </div>
        )}

        <div className="footer">WHISPER · Clewdo</div>
      </div>
    </>
  );
}
