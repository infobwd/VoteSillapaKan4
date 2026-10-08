# Sillapa 70 Historical Criteria — Candidate Voting Catalog

วันที่ 8 ต.ค. 2569 | Source: https://sillapa.net/home/sillapa70-rule/  
STATUS: **DRAFT CANDIDATES ONLY — NOT A LIVE VOTE CATALOG / NOT APPROVED RULES FOR COMPETITION 74**

## วัตถุประสงค์

ผู้ดูแลต้องการให้รายการแข่งขันในหน้าเกณฑ์ศิลปหัตถกรรมนักเรียนครั้งที่ 70 (ปีการศึกษา 2565) เป็น **แหล่งรายการเพิ่มเติมเพื่อเสนอให้โหวตว่าควรจัดการแข่งขันระดับเขตครั้งที่ 74 หรือไม่**. ต้องยังคง Design Lock Option A (YES/NO/ABSTAIN, ต่อกิจกรรม × ระดับชั้น, กลุ่มละ 1 สิทธิ์) และห้ามนำเกณฑ์ 70 ไปเป็นกติกา 74 อัตโนมัติ

## ข้อมูลที่เพิ่มจริงใน PR นี้

- `catalog/rule70/source_documents.json`: **18 แหล่ง PDF/หมวดหลัก** จากหน้าต้นทาง พร้อม URL ตรง; แยก PDF กิจกรรมท้องถิ่นอีสานเป็นข้อมูลอ้างอิง **ไม่รวมอัตโนมัติ**
- `catalog/rule70/candidate_items.json`: **126 candidate rows** (กิจกรรม × ระดับชั้น) จากตารางสรุปที่ตรวจบางหมวด รวม **13 จาก 18 หมวด** โดยแต่ละแถวมีชื่อกิจกรรม ช่วงชั้น PDF URL เลขหน้า และ stable `s70-...` candidate ID
- ทุกแถว: `review_status=PENDING_MANUAL_REVIEW`, `match_status=UNMAPPED_73_74`, `eligible_for_live_vote=false`. ไม่มีรายการใดพร้อมโหวตจริง
- `tools/validate_rule70_catalog.mjs`: offline validator แบบไม่พึ่ง dependencies พร้อม fail-closed guards
- GitHub Actions job `rule70-candidate-check.yml`: validate dataset only; ไม่ต่อ DB หรือ external URL; no automatic website deployment

**สำคัญ:** 126 rows ไม่ได้เท่ากับจำนวนรายการทั้งหมดของเกณฑ์ครั้งที่ 70. เป็น **partial extraction** สำหรับใช้ทบทวน. อีก 5 หมวดที่ยังไม่มี rows ได้แก่ นักบินน้อย สพฐ., ศิลปะ–ดนตรี, และการศึกษาพิเศษ 3 รูปแบบ. ห้ามประกาศว่าได้เพิ่มครบทุกกิจกรรมแล้ว

## สถานะทางกฎหมาย/อำนาจอนุมัติ

ข้อมูลเกณฑ์ 70 เป็นเพียงข้อมูลย้อนหลัง; เกณฑ์และกิจกรรมครั้งที่ 73/74 อาจเปลี่ยนชื่อ ช่วงชั้น หรือยกเลิก/เพิ่ม. กิจกรรมบังคับตามหลักเกณฑ์ หรือกิจกรรมที่สังกัดไม่อยู่ในอำนาจจัดของ สพป.กาญจนบุรี เขต 4 ต้องให้ผู้มีอำนาจตรวจสอบก่อน. การโหวตเป็นข้อมูลประกอบมติ มิได้เปลี่ยนหรือยกเลิกเกณฑ์ที่ใช้บังคับ

## กติกาแสดงบนเว็บเมื่อ VOTE-2/VOTE-3 พัฒนาแล้ว

1. UI แสดงตัวกรอง **แหล่งรายการ: 73 เดิม / เกณฑ์ 70 เพิ่มเติม / ทั้งหมด**, และ **หมวด / ระดับชั้น / สถานะตรวจสอบ**.
2. แสดงหนึ่ง card ต่อ **กิจกรรม × ระดับชั้น**, ระบุ “อ้างอิงเกณฑ์ครั้งที่ 70 (2565)” พร้อมปุ่มเปิด PDF ต้นทางและเลขหน้า (ไม่คัดลอกเกณฑ์ทั้งฉบับเข้าเว็บ).
3. เฉพาะ candidate ที่ผ่านการตรวจ mapping และได้รับการเลือกเข้ารอบที่ผู้ดูแลรับรองแล้ว จึงอยู่ใน `round_items`; สถานะ `PENDING_MANUAL_REVIEW` ไม่ให้ผู้ลงคะแนนโหวต
4. ถ้าตรงกับกิจกรรมใน AcademicCompetitionManager ครั้งที่ 73 ให้แมปกับ `activity_id+level_code` ของระบบหลักแบบตรวจโดยคน และ **แสดงรายการเดียว** พร้อม provenance 70+73 แทนที่จะเพิ่มบัตรลงคะแนนซ้ำ.
5. ถ้าตรวจแล้วเป็นรายการเพิ่มเติมไม่เคยมีในระบบหลัก ให้กำหนด canonical ID ใหม่สำหรับ VoteSillapaKan4 โดยไม่ยืม `activity_id` เดิม; ต้องให้ admin อนุมัติ master ใหม่ก่อน
6. ช่วงชั้น `P1-P6` กับ `P1-P3`/`P4-P6` เป็น **คนละประเภท** ห้ามแตกหรือรวมอัตโนมัติ. `M1-M3` ของ สพป. กับ สพม. ต้องตรวจตามขอบเขตโรงเรียนก่อน
7. กิจกรรมการศึกษาพิเศษต้องแยกตามช่วงอายุ/ประเภทความพิการ/สังกัดตาม PDF; schema แบบ activity+level อาจไม่เพียงพอ ให้สร้าง requirement เพิ่มก่อนคัดเข้า ballot
8. ไม่รวม “กิจกรรมท้องถิ่นภาคตะวันออกเฉียงเหนือ” ในรายการพื้นที่กาญจนบุรีโดยปริยาย; เสนอเพิ่มได้เฉพาะเมื่อมีเหตุผลและมติอนุมัติ

## ขั้นตอนนำเข้าและตรวจสอบ (หลัง VOTE-1 CI ผ่าน)

```text
PDF ประกาศครั้งที่ 70 -> Source register -> Candidate extraction (partial)
 -> ตรวจชื่อ/เลขหน้า/ช่วงชั้นกับ PDF -> เทียบ AcademicCompetitionManager 73/74
 -> match/merge/NEW/EXCLUDE/special-scope -> เจ้าหน้าที่ตรวจรับรอง
 -> สร้าง master snapshot ใหม่ใน VoteSillapaKan4 -> เลือกเข้ารอบโหวต
 -> READY เมื่อ policy/eligible roster/items ได้รับการอนุมัติ -> OPEN เมื่อรับอนุญาต
```

ข้อมูล 70 ไม่ใช่ `activity_id` ของครั้งที่ 73: `candidate_id` เป็นรหัสชั่วคราวสำหรับ provenance เท่านั้น. ห้ามใช้ชื่อไทยเทียบแล้ว merge อัตโนมัติ

## รูปแบบ Field ในไฟล์ Candidate

| Field | Meaning |
| --- | --- |
| candidate_id | stable namespace `s70-...`, ไม่ใช่ AMC activity_id |
| category_id | FK ไป source_documents.json |
| name | ชื่อกิจกรรมที่ถอดจากตารางสรุป (ต้องตรวจทานก่อนใช้) |
| level_code | ช่วงชั้นจากตาราง: P1-P3 / P4-P6 / M1-M3 / P1-P6 / PRESCHOOL |
| source_pdf_page | หน้า PDF แบบเริ่มจาก 1 |
| source_document_url | direct exact PDF URL |
| canonical_activity_id, canonical_level_code | null จนกว่า match ได้รับการยืนยัน |
| match_status | UNMAPPED_73_74 -> MATCHED / NEW_APPROVED / EXCLUDED ผ่าน workflow |
| review_status | PENDING_MANUAL_REVIEW -> REVIEWED แล้ว APPROVED โดยผู้มีสิทธิ์ |
| eligible_for_live_vote | false ปลอดภัยไว้ก่อน |

## Quality / follow-up

- QA ให้เจ้าหน้าที่เทียบทุกกิจกรรมกับ PDF หน้า summary+ข้อเกณฑ์ละเอียด; ค้นข้อผิดพลาด OCR/เครื่องหมายถูก ช่วงชั้น และ duplicate; อย่าสรุปว่า sample นี้ครบ
- เพิ่ม candidate rows สำหรับ 5 หมวดที่ยังไม่ครอบคลุมหลังแยก scopes และทำรายการครบทุก PDF; ยืนยันตัวเลขทั้งหมดโดยคำนวณรายการย่อย ไม่ใช้ count “กิจกรรมหลัก” เป็น “จำนวนบัตรโหวต”
- วาง crosswalk กับ activity IDs ครั้งที่ 73/74 โดยใช้ official exported master จาก branch ปัจจุบัน ไม่เข้าถึง production DB
- เริ่ม implement `source manifests`, `candidate imports`, reviewer UI, duplicate detection และ preview ใน VOTE-2; พัฒนา live ballot ใน VOTE-3 หลัง auth+policy gate
- กลุ่มเสียง/เอกสารอ้างอิงจากครั้ง 70 จะอยู่คู่กับป้าย “ข้อมูลย้อนหลัง” ทุกหน้าตลอดขั้น review

## Data policy

**ไม่ดาวน์โหลด/commit PDF ฉบับเต็ม**, ไม่ใส่เอกสาร/รายชื่อเด็ก ครู กรรมการ, ไม่เก็บรหัสผ่าน หรือผลโหวตจริง; ลิงก์อ้างถึงไฟล์สาธารณะตามต้นทาง. Repository นี้ไม่ได้แก้ AcademicCompetitionManager, Production 73/74 หรือฐานของ VoteSillapaKan4.

## Manual acceptance checklist

- [ ] ผู้รับผิดชอบตรวจครบ **ทุก PDF 18 หมวด** (ไม่ใช่แค่ 13 หมวดที่มี candidate แล้ว)
- [ ] ตรวจ scope ของ สพป. และกิจกรรมการศึกษาพิเศษ/ระดับชั้น
- [ ] สร้าง crosswalk 73/74 และอนุมัติการจับคู่หรือรายการใหม่
- [ ] ตรวจไม่มีรายการซ้ำใน (round, activity, level, scope)
- [ ] รับรองรายการที่รวมเข้ารอบโดยผู้ดูแล
- [ ] อนุมัติ policy และสิทธิ์ก่อน READY/OPEN

**ข้อสรุป:** ไฟล์ใน PR นี้เพิ่มชุดเกณฑ์ 70 เป็น **draft catalog ของรายการที่จะให้พิจารณาโหวต** เท่านั้น. ไม่ถือว่าเปิดโหวตแล้วหรือว่ากิจกรรมได้รับอนุมัติจัด
