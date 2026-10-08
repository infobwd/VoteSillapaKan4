import { useEffect, useState } from 'react';

type HealthState = 'checking' | 'online' | 'unavailable';

export default function App() {
  const [health, setHealth] = useState<HealthState>('checking');

  useEffect(() => {
    const abort = new AbortController();
    fetch(`${import.meta.env.BASE_URL}api/?action=health`, {
      signal: abort.signal,
      cache: 'no-store'
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Health endpoint unavailable');
        const data: unknown = await response.json();
        if (
          typeof data !== 'object' ||
          data === null ||
          !('votingEnabled' in data) ||
          data.votingEnabled !== false
        ) throw new Error('Unexpected health response');
        setHealth('online');
      })
      .catch(() => {
        if (!abort.signal.aborted) setHealth('unavailable');
      });
    return () => abort.abort();
  }, []);

  return (
    <div className="page">
      <header className="site-header">
        <div className="brand-symbol" aria-hidden="true">74</div>
        <div>
          <p className="eyebrow">SILLAPA KAN 4 VOTE</p>
          <p className="brand-subtitle">งานศิลปหัตถกรรมนักเรียน ครั้งที่ 74</p>
        </div>
      </header>
      <main id="main-content">
        <section className="hero" aria-labelledby="hero-title">
          <span className="pill">ระยะ VOTE-1 · เตรียมความพร้อม</span>
          <h1 id="hero-title">ระบบลงมติการจัดการแข่งขัน<br /><span>ระดับเขตพื้นที่การศึกษา</span></h1>
          <p className="lead">สำหรับประธานกลุ่มเครือข่ายและผู้แทนที่ได้รับมอบหมาย เพื่อพิจารณากิจกรรมที่เห็นควรจัดแข่งขันระดับเขตพื้นที่</p>
          <div className="notice" role="status">
            <strong>ยังไม่เปิดลงคะแนน</strong>
            <p>ขณะนี้อยู่ระหว่างพัฒนาระบบและตรวจสอบกติกา ยังไม่สามารถเข้าสู่ระบบหรือส่งคะแนนได้</p>
          </div>
        </section>
        <section className="information" aria-labelledby="process-title">
          <div>
            <p className="eyebrow">แนวทางที่ได้รับเลือก</p>
            <h2 id="process-title">รูปแบบการลงมติ A</h2>
            <p>แต่ละกลุ่มเครือข่ายมีหนึ่งสิทธิ์ต่อกิจกรรมและระดับชั้น พร้อมหลักฐานการส่งคะแนนและการรับรองผลโดยที่ประชุมในขั้นถัดไป</p>
          </div>
          <div className="options" aria-label="ตัวเลือกการลงมติในอนาคต">
            <span>เห็นควรจัด</span><span>ไม่เห็นควรจัด</span><span>งดออกเสียง</span>
          </div>
        </section>
        <section className="footer-panel" aria-label="สถานะระบบ">
          <div>
            <h2>สถานะบริการ</h2>
            <p className="health-status" aria-live="polite">
              {health === 'checking' ? 'กำลังตรวจสอบระบบ…' : health === 'online' ? 'ส่วนบริการพื้นฐานตอบสนองแล้ว (ยังไม่เปิดโหวต)' : 'ยังติดต่อบริการพื้นฐานไม่ได้'}
            </p>
          </div>
          <p className="note">การแสดงสถานะพร้อมใช้งานของบริการพื้นฐาน ไม่ได้หมายความว่าระบบลงคะแนนพร้อมเปิดใช้งาน</p>
        </section>
      </main>
      <footer className="copyright">Sillapa Kan 4 Vote · Competition 74 · Design-gated scaffold</footer>
    </div>
  );
}
