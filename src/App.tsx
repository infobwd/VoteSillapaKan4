import { useEffect, useMemo, useState } from 'react';
import historicalOptions from '../catalog/rule70/option_proposals_v2b.json';
import historicalSources from '../catalog/rule70/source_documents.json';

type HealthState = 'checking' | 'online' | 'unavailable';
type CatalogOption = (typeof historicalOptions.options)[number];

const categories = historicalSources.categories.filter((source) =>
  historicalOptions.options.some((option) => option.category_id === source.source_category_id)
);
const categoryName = new Map(categories.map((source) => [source.source_category_id, source.category_name]));
const levelOrder = ['PRESCHOOL', 'P1-P3', 'P4-P6', 'P1-P6', 'M1-M3'];
const levelName: Record<string, string> = {
  PRESCHOOL: 'ปฐมวัย',
  'P1-P3': 'ป.1–ป.3',
  'P4-P6': 'ป.4–ป.6',
  'P1-P6': 'ป.1–ป.6',
  'M1-M3': 'ม.1–ม.3'
};
const pageSize = 12;
const clean = (text: string) => text.normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleLowerCase('th');

export default function App() {
  const [health, setHealth] = useState<HealthState>('checking');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const abort = new AbortController();
    fetch(`${import.meta.env.BASE_URL}api/?action=health`, {
      signal: abort.signal, cache: 'no-store'
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Health endpoint unavailable');
        const data: unknown = await response.json();
        if (
          typeof data !== 'object' || data === null ||
          !('votingEnabled' in data) || data.votingEnabled !== false
        ) throw new Error('Unexpected health response');
        setHealth('online');
      })
      .catch(() => {
        if (!abort.signal.aborted) setHealth('unavailable');
      });
    return () => abort.abort();
  }, []);

  const filtered = useMemo(() => {
    const needle = clean(search);
    return historicalOptions.options.filter((option: CatalogOption) => {
      if (category && option.category_id !== category) return false;
      if (level && option.level_code !== level) return false;
      if (!needle) return true;
      return clean(`${option.label} ${categoryName.get(option.category_id) ?? ''} ${levelName[option.level_code] ?? option.level_code}`).includes(needle);
    });
  }, [category, level, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const changeSearch = (value: string) => { setSearch(value); setPage(1); };
  const changeCategory = (value: string) => { setCategory(value); setPage(1); };
  const changeLevel = (value: string) => { setLevel(value); setPage(1); };

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
          <span className="pill">ระยะ VOTE-2C1 · ตัวอย่างรายการกิจกรรม</span>
          <h1 id="hero-title">ระบบลงมติการจัดการแข่งขัน<span>ระดับเขตพื้นที่การศึกษา</span></h1>
          <p className="lead">สำหรับประธานกลุ่มเครือข่ายและผู้แทนที่ได้รับมอบหมาย เพื่อพิจารณากิจกรรมที่เห็นควรจัดแข่งขันระดับเขตพื้นที่</p>
          <div className="notice" role="status">
            <strong>ยังไม่เปิดลงคะแนน</strong>
            <p>หน้านี้แสดงตัวอย่างรายการกิจกรรมเพื่อให้ตรวจสอบข้อมูลเท่านั้น ยังไม่สามารถเข้าสู่ระบบ เลือกรายการเข้ารอบ หรือลงคะแนนได้</p>
          </div>
        </section>
        <section className="information" aria-labelledby="process-title">
          <div>
            <p className="eyebrow">รูปแบบการลงมติที่กำลังพัฒนา</p>
            <h2 id="process-title">หนึ่งกลุ่มเครือข่าย หนึ่งเสียงต่อรายการ</h2>
            <p>เมื่อเปิดระบบจริง ผู้มีสิทธิ์จะเลือกว่าเห็นควรจัด ไม่เห็นควรจัด หรืองดออกเสียง โดยมีการตรวจสอบสิทธิ์และรับรองผลแยกจากการลงคะแนน</p>
          </div>
          <div className="options" aria-label="รูปแบบคะแนนในอนาคต ยังเลือกไม่ได้">
            <span>เห็นควรจัด</span><span>ไม่เห็นควรจัด</span><span>งดออกเสียง</span>
          </div>
        </section>
        <section className="catalog-panel" aria-labelledby="catalog-title">
          <div className="catalog-heading">
            <div>
              <p className="eyebrow">แหล่งรายการเพิ่มเติม (อิสระจากครั้งที่ 73/74)</p>
              <h2 id="catalog-title">ตัวเลือกจากเกณฑ์การแข่งขันครั้งที่ 70</h2>
              <p>ข้อมูลย้อนหลังปีการศึกษา 2565 — สำหรับตรวจทานก่อนนำไปเสนอให้โหวต ไม่ใช่เกณฑ์การแข่งขันทางการของครั้งที่ 74</p>
            </div>
            <div className="catalog-count" aria-label="จำนวนรายการเบื้องต้น"><strong>{historicalOptions.options.length}</strong><span>รายการเบื้องต้น</span></div>
          </div>
          <div className="catalog-warning" role="note">
            <strong>รายการยังไม่ผ่านการรับรอง</strong>
            <p>ข้อมูลนี้ถอดจากเอกสารต้นทางเพียงบางส่วน (13 จาก 18 หมวด) ชื่อและช่วงชั้นอาจต้องแก้ไข ไม่มีรายการใดเปิดให้ลงคะแนน และไม่มีการจับคู่รหัสกิจกรรมกับครั้งที่ 73/74</p>
          </div>
          <div className="catalog-filters">
            <label>
              <span>ค้นหาชื่อกิจกรรม</span>
              <input type="search" value={search} onChange={(event) => changeSearch(event.target.value)}
                placeholder="เช่น คัดลายมือ หรือ คณิตศาสตร์" autoComplete="off" />
            </label>
            <label>
              <span>หมวดกิจกรรม</span>
              <select value={category} onChange={(event) => changeCategory(event.target.value)}>
                <option value="">ทุกหมวดที่มีตัวอย่าง</option>
                {categories.map((item) => <option key={item.source_category_id} value={item.source_category_id}>{item.category_name}</option>)}
              </select>
            </label>
            <label>
              <span>ระดับชั้น</span>
              <select value={level} onChange={(event) => changeLevel(event.target.value)}>
                <option value="">ทุกระดับชั้น</option>
                {levelOrder.map((key) => <option key={key} value={key}>{levelName[key]}</option>)}
              </select>
            </label>
          </div>
          <div className="catalog-results" role="status" aria-live="polite">
            พบ {filtered.length} รายการจาก {historicalOptions.options.length} ตัวอย่าง · หน้า {currentPage} จาก {totalPages}
          </div>
          {visible.length ? (
            <div className="catalog-grid">
              {visible.map((item: CatalogOption) => (
                <article className="candidate-card" key={item.option_id}>
                  <div className="candidate-top"><span className="candidate-category">{categoryName.get(item.category_id) ?? item.category_id}</span><span className="draft-status">รอตรวจสอบ</span></div>
                  <h3>{item.label}</h3>
                  <p className="candidate-level">ระดับ {levelName[item.level_code] ?? item.level_code}</p>
                  <p className="candidate-source">อ้างอิงเกณฑ์ครั้งที่ 70 · หน้า {item.source_pdf_page}</p>
                  <a href={item.source_pdf_url} target="_blank" rel="noopener noreferrer">ดูเอกสารเกณฑ์ต้นทาง <span aria-hidden="true">↗</span></a>
                </article>
              ))}
            </div>
          ) : (
            <p className="catalog-empty">ไม่พบรายการตามตัวกรอง ลองเลือกหมวดหรือระดับชั้นอื่น</p>
          )}
          {totalPages > 1 && (
            <nav className="catalog-pagination" aria-label="เปลี่ยนหน้ารายการกิจกรรม">
              <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>ก่อนหน้า</button>
              <span>หน้า {currentPage} / {totalPages}</span>
              <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages}>ถัดไป</button>
            </nav>
          )}
          <p className="catalog-note">ตัวเลือกที่เป็นเพียงหมวดหลักโดยยังไม่ได้แยกชนิดกิจกรรม อายุ หรือประเภทความพิการ จะยังไม่ปรากฏในหน้านี้จนกว่าจะตรวจสอบรายละเอียด</p>
        </section>
        <section className="footer-panel" aria-label="สถานะบริการ">
          <div>
            <h2>สถานะบริการพื้นฐาน</h2>
            <p className="health-status" aria-live="polite">
              {health === 'checking' ? 'กำลังตรวจสอบระบบ…' : health === 'online' ? 'ส่วนบริการพื้นฐานตอบสนองแล้ว (ยังไม่เปิดโหวต)' : 'ยังติดต่อบริการพื้นฐานไม่ได้'}
            </p>
          </div>
          <p className="note">การแสดงสถานะบริการ ไม่ได้หมายความว่าระบบลงคะแนนพร้อมเปิดใช้งาน</p>
        </section>
      </main>
      <footer className="copyright">Sillapa Kan 4 Vote · Competition 74 · Preview only · No voting enabled</footer>
    </div>
  );
}
