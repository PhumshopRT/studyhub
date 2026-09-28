import type { Chapter } from '../../../../types/content';

export const radiationEffectWholeBodyChapter: Chapter = {
  id: 'radiation-effect-whole-body',
  subjectId: 'radiobiology',
  title: 'ผลของรังสีต่อร่างกายส่วนรวมและกลุ่มอาการรังสีเฉียบพลัน (Radiation Effect on Whole Body, ARS & TBI)',
  order: 2,
  estimatedReadingMinutes: 50,
  description:
    'ศึกษาผลกระทบของการแผ่รังสีทั่วทั้งร่างกาย (Whole Body Irradiation): กฎของ Bergonié และ Tribondeau, การถ่ายเทพลังงานเชิงเส้น (LET) และค่าน้ำหนักรังสี (Quality Factor), การฉายรังสีทั่วร่างกายเพื่อการปลูกถ่ายไขกระดูก (Total Body Irradiation: TBI), กลุ่มอาการรังสีเฉียบพลัน 4 ระยะ (Acute Radiation Syndrome: Prodromal, Latent, Manifest, Recovery/Death), 3 กลุ่มอาการหลัก (Hematopoietic, Gastrointestinal, Cerebrovascular Syndromes), ปริมาณรังสีร้ายแรงเฉลี่ย LD50/60, และมาตรฐานการป้องกันรังสีสากล ICRP 103',
  tags: [
    'Whole Body Irradiation',
    'ARS',
    'Acute Radiation Syndrome',
    'Hematopoietic Syndrome',
    'GI Syndrome',
    'Cerebrovascular Syndrome',
    'TBI',
    'Bergonié-Tribondeau',
    'LD50/60',
    'ICRP 103',
  ],
  simulationIds: ['realistic-radiobiology-3d'],
  objectives: [
    'อธิบายกฎของ Bergonié และ Tribondeau (1906) เกี่ยวกับปัจจัยกำหนดความไวรังสีของเซลล์ 3 ประการ',
    'คำนวณและเข้าใจความสัมพันธ์ระหว่าง Linear Energy Transfer (LET), Quality Factor (QF) และหน่วยวัด Equivalent Dose (Sv)',
    'ระบุ 3 วัตถุประสงค์หลักและเทคนิคการฉายรังสีทั่วร่างกาย (Total Body Irradiation: TBI) ในการเตรียมผู้ป่วยปลูกถ่ายไขกระดูก',
    'ลำดับ 4 ขั้นตอนของกลุ่มอาการรังสีเฉียบพลัน (ARS): Prodromal, Latent, Manifest Illness, จนถึง Recovery หรือ Death',
    'เปรียบเทียบกลไก ปริมาณรังสี ระยะเวลาแสดงอาการ และสาเหตุการเสียชีวิตของ 3 กลุ่มอาการหลัก: Hematopoietic, Gastrointestinal, และ Cerebrovascular Syndrome',
    'อธิบายความหมายของค่า LD50/30 และ LD50/60 ของมนุษย์ พร้อมปัจจัยทางการแพทย์ที่ช่วยเพิ่มอัตรารอดชีวิต',
    'สรุปเกณฑ์มาตรฐานความปลอดภัยทางรังสีของคณะกรรมาธิการสากลว่าด้วยการป้องกันรังสี (ICRP 103) และหลักการ ALARA',
  ],
  sections: [
    {
      id: 'sec-radbio-wholebody-qwen-app',
      heading: '1. คลังความรู้และห้องจำลองรังสีชีววิทยา (RadLibrary: Whole Body Effects, ARS & TBI Hub)',
      type: 'legacy-html',
      content: {
        modulePath: '/qwen-modules/radiobiology/radbio/index.html#c2',
        title: 'RadLibrary: ผลของรังสีต่อร่างกายส่วนรวม (Whole Body & ARS Hub)',
        description:
          'โมดูลเว็บแอปพลิเคชันการเรียนรู้แบบโต้ตอบ: ครอบคลุม 16 หัวข้อสรุปจากสไลด์, กฎ Bergonié–Tribondeau, ระดับการรับรังสี Level 1–6, การตอบสนองของระบบโลหิต 1 Gy vs 3 Gy, เส้นโค้งอัตราการตาย LD50 และแบบทดสอบ 30 ข้อ',
        initialHeight: 880,
      },
    },
    {
      id: 'sec-radbio-wholebody-3d-sim',
      heading: '2. ห้องปฏิบัติการจำลอง 3 มิติ: ARS Whole-Body Dose & Organ Staging Simulator',
      type: 'simulation',
      content: {
        simulationId: 'realistic-radiobiology-3d',
        title: 'แบบจำลอง 3D Holographic Human Scanner: ปรับระดับโดส 0–60 Gy และวิเคราะห์กลุ่มอาการ ARS',
      },
    },
    {
      id: 'sec-radbio-clinical-spectrum',
      heading: '3. ภาพรวมและ 3 เสาหลักของผลรังสีต่อร่างกาย (The Clinical Spectrum: Cause → Effect → Control)',
      type: 'paragraph',
      content:
        'การแผ่รังสีทั่วทั้งร่างกาย (Whole Body Irradiation) ก่อให้เกิดผลกระทบที่ซับซ้อนและมีเดิมพันสูงต่อระบบสรีรวิทยา โดยสามารถแบ่งออกเป็น 3 เสาหลัก:\n\n' +
        '1. **The Cause (สาเหตุและปัจจัยทางฟิสิกส์):** การแตกตัวเป็นไอออนของโมเลกุลในเซลล์, คุณสมบัติการถ่ายเทพลังงานเชิงเส้น (LET), ค่าน้ำหนักรังสี (Quality Factor), และความไวรังสีตามกฎชีววิทยา\n' +
        '2. **The Effect (ผลทางชีววิทยาและพยาธิสภาพ):** การบาดเจ็บของเซลล์ต้นกำเนิด, กลุ่มอาการรังสีเฉียบพลัน (Acute Radiation Syndrome: ARS), การลดลงของเซลล์เม็ดเลือด (Pancytopenia), ภาวะลำไส้หลุดลอก, และภาวะสมองบวม\n' +
        '3. **The Control (การควบคุมและการประยุกต์ใช้):** การฉายรังสีทั่วร่างกายเพื่อการรักษา (Total Body Irradiation: TBI), มาตรการป้องกันตามเกณฑ์ ICRP และการจัดการเมื่อเกิดอุบัติเหตุทางรังสี',
    },
    {
      id: 'sec-radbio-bergonie-tribondeau',
      heading: '4. กฎของแบร์โกเนียและตรีบงโด (The Law of Bergonié and Tribondeau - 1906)',
      type: 'paragraph',
      content:
        'ในปี ค.ศ. 1906 สองนักวิจัยชาวฝรั่งเศส Jean Bergonié และ Louis Tribondeau ได้ค้นพบกฎพื้นฐานที่สุดของวิชารังสีชีววิทยา ซึ่งระบุว่า **ความไวต่อรังสีของเซลล์ (Radiosensitivity) แปรผันตรงกับความสามารถในการสืบพันธุ์ และแปรผกผันกับระดับการพัฒนาเฉพาะทางของเซลล์**:\n\n' +
        '### กฎ 3 ข้อของ Bergonié & Tribondeau:\n' +
        '1. **Mitotic Activity (อัตราการแบ่งเซลล์):** เซลล์ที่มีอัตราการแบ่งตัวแบบไมโทซิสสูง จะไวต่อรังสีสูงมาก (High Radiosensitivity)\n' +
        '2. **Future Divisions (จำนวนครั้งของการแบ่งตัวในอนาคต):** เซลล์ที่มีเส้นทางการแบ่งตัวต่อเนื่องอีกหลายรุ่น (เช่น สเต็มเซลล์) จะไวรังสีมากกว่าเซลล์ที่สิ้นสุดการแบ่งตัวแล้ว\n' +
        '3. **Degree of Differentiation (ระดับการพัฒนาเฉพาะทาง):** เซลล์ที่ยังไม่พัฒนาเฉพาะทาง (Undifferentiated / Primitive cells) จะไวต่อรังสีสูงที่สุด ขณะที่เซลล์ที่พัฒนาเป็นเซลล์เฉพาะทางสมบูรณ์ (Highly differentiated cells) จะทนทานต่อรังสีมากที่สุด\n\n' +
        '### ลำดับความไวต่อรังสีของเซลล์ในร่างกาย (Radiosensitivity Spectrum):\n' +
        '- **ไวรังสีสูงมาก (High):** เซลล์เม็ดเลือดขาวลิมโฟไซต์ (Lymphocytes — ข้อยกเว้นที่ไวรังสีสูงแม้ไม่แบ่งตัว), เซลล์ต้นกำเนิดเม็ดเลือด (Erythroblasts, Myeloblasts ในไขกระดูก), สเปิร์มาโทโกเนีย (Spermatogonia), เซลล์คริปต์ลำไส้ (Intestinal crypt cells)\n' +
        '- **ไวรังสีปานกลาง (Intermediate):** เซลล์บุผิวหนัง (Basal cells of skin), เซลล์บุผนังหลอดเลือด (Endothelial cells), เซลล์สร้างกระดูกและกระดูกอ่อน (Osteoblasts/Chondroblasts)\n' +
        '- **ทนทานต่อรังสีสูง (Low / Radioresistant):** เซลล์กล้ามเนื้อ (Muscle cells), เซลล์ประสาท (Neurons / Ganglion cells), เซลล์เม็ดเลือดแดงที่โตเต็มวัย (Mature Erythrocytes)',
    },
    {
      id: 'sec-radbio-let-quality-factor',
      heading: '5. พลังงานถ่ายเทเชิงเส้นและค่าน้ำหนักรังสี (LET & Quality Factor: 1 Sv = 1 Gy × QF)',
      type: 'paragraph',
      content:
        'การวัดปริมาณรังสีดูดกลืน (Absorbed Dose: Gy) เพียงอย่างเดียวไม่เพียงพอต่อการทำนายผลกระทบทางชีววิทยา จำเป็นต้องพิจารณา **Linear Energy Transfer (LET)**:\n\n' +
        '$$\\text{LET} = \\frac{dE}{dl} \\quad (\\text{หน่วย: } \\text{keV/}\\mu\\text{m})$$\n\n' +
        '- **Low-LET Radiation (LET < 10 keV/µm):** เช่น รังสีเอกซ์และแกมมา การแตกตัวเป็นไอออนกระจายตัวห่างกัน ความเสียหายต่อ DNA มักเป็น Single Strand Break (SSB) ซึ่งซ่อมแซมได้ง่าย ค่า Quality Factor (QF / $w_R$) = 1\n' +
        '- **High-LET Radiation (LET > 10–100 keV/µm):** เช่น อนุภาคแอลฟา ($\alpha$), โปรตอน, และนิวตรอน การแตกตัวเป็นไอออนหนาแน่นมากตลอดเส้นทาง เกิด Double Strand Breaks (DSB) ที่ซับซ้อน ซ่อมแซมแทบไม่ได้\n\n' +
        '$$\\text{Equivalent Dose } (H) = \\text{Absorbed Dose } (D) \\times QF \\quad (\\text{หน่วย: Sievert: Sv})$$\n\n' +
        'อนุภาคแอลฟาและนิวตรอนมีค่า $QF = 5–20$ หมายความว่าปริมาณรังสีดูดกลืน 1 Gy ของแอลฟา จะก่อให้เกิดความเสียหายทางชีวภาพเทียบเท่ากับ 20 Sv',
    },
    {
      id: 'sec-radbio-tbi-clinical-technique',
      heading: '6. การฉายรังสีทั่วร่างกายทางการแพทย์ (Total Body Irradiation: TBI)',
      type: 'paragraph',
      content:
        'การฉายรังสีทั่วทั้งร่างกาย (Total Body Irradiation: TBI) เป็นเทคนิคทางรังสีรักษาพิเศษที่ฉายรังสีครอบคลุมร่างกายตั้งแต่ศีรษะจรดปลายเท้า โดยมีข้อกำหนดทางคลินิกที่สำคัญ:\n\n' +
        '### 1. วัตถุประสงค์ 3 ข้อหลัก (Clinical Goals):\n' +
        '1. **Immunosuppression (การกดภูมิคุ้มกัน):** ทำลายระบบภูมิคุ้มกันเดิมของผู้ป่วย เพื่อป้องกันภาวะร่างกายปฏิเสธไขกระดูกใหม่ที่ได้รับบริจาค (Graft Rejection)\n' +
        '2. **Eradication of Malignant Cells (การกำจัดเซลล์มะเร็ง):** กวาดล้างเซลล์มะเร็งเม็ดเลือดขาว (Leukemia) หรือมะเร็งต่อมน้ำเหลืองที่หลบซ่อนอยู่ตามอวัยวะที่เป็นแหล่งกักเก็บ (Sanctuary sites เช่น อัณฑะ หรือระบบประสาท)\n' +
        '3. **Myeloablation (การเคลียร์พื้นที่ไขกระดูก):** ทำลายเซลล์ต้นกำเนิดเดิมในโพรงกระดูก เพื่อเปิดช่องว่างให้สเต็มเซลล์ใหม่เข้าฝังตัวและเจริญเติบโต (Marrow engraftment)\n\n' +
        '### 2. เทคนิคการฉายรังสี TBI:\n' +
        '- **Extended Source-to-Surface Distance (Extended SSD):** เลื่อนเตียงผู้ป่วยออกไปไกลจากหัวเครื่องฉายรังสีประมาณ **3–4 เมตร** เพื่อให้ลำรังสีเปิดกว้างครอบคลุมผู้ป่วยทั้งตัว\n' +
        '- **Bilateral or AP/PA Opposing Fields:** ฉายสองทิศทางตรงข้ามกันเพื่อให้การกระจายของปริมาณรังสีสม่ำเสมอทั่วทั้งตัว (ความคลาดเคลื่อน $\\pm 10\\%$)\n' +
        '- **Compensators / Bolus:** ใช้อุปกรณ์ชดเชยความหนาของร่างกาย (ศีรษะ ลำคอ แขนขา) เพื่อป้องกันการเกิดจุดร้อน (Hot spots)\n' +
        '- **Custom Lung Shielding (แผ่นกำบังปอด):** ปอดเป็นอวัยวะวิกฤตที่จัดเป็น Parallel organ ต้องจำกัดปริมาณรังสีรวมที่ปอดไม่ให้เกิน **8–10 Gy** เพื่อป้องกันการเกิด Radiation Pneumonitis ถึงแก่ชีวิต\n' +
        '- **Low Dose Rate (อัตราการปล่อยรังสีต่ำ):** ควบคุมอัตราการให้รังสีที่ **0.05–0.10 Gy/min** (หรือฉายแบบ Hyperfractionation เช่น 12 Gy แบ่ง 6 ครั้ง ครั้งละ 2 Gy วันละ 2 ครั้ง) เพื่อเปิดโอกาสให้เนื้อเยื่อปกติซ่อมแซม SLDR',
    },
    {
      id: 'sec-radbio-ars-four-stages',
      heading: '7. ลำดับ 4 ระยะของกลุ่มอาการรังสีเฉียบพลัน (Acute Radiation Syndrome: The 4 Stages)',
      type: 'table',
      content: {
        headers: [
          'ระยะของกลุ่มอาการ (Stage)',
          'กรอบเวลา (Time of Onset)',
          'อาการทางคลินิกเด่น (Key Clinical Manifestations)',
          'พยาธิสรีรวิทยา (Pathophysiology)',
        ],
        rows: [
          [
            '1. Prodromal Stage (ระยะเริ่มแรก/ระยะนำ)',
            'ภายในไม่กี่นาทีถึง 48 ชั่วโมงหลังได้รับรังสี',
            'N-V-D-F: คลื่นไส้ (Nausea), อาเจียน (Vomiting), ท้องร่วง (Diarrhea), และอ่อนเพลียรุนแรง (Fatigue)',
            'การกระตุ้น Chemoreceptor Trigger Zone (CTZ) ในสมอง และการปล่อยสารสื่ออักเสบ Cytokines อย่างฉับพลัน',
          ],
          [
            '2. Latent Stage (ระยะแฝง/สงบชั่วคราว)',
            'นานตั้งแต่ไม่กี่ชั่วโมง จนถึง 1–3 สัปดาห์',
            'ผู้ป่วยรู้สึกสบายดีขึ้น อาการทางเดินอาหารสงบลง ดูเหมือนหายเป็นปกติ',
            'เซลล์ที่โตเต็มวัยยังคงทำหน้าที่อยู่ แต่เซลล์ต้นกำเนิด (Stem cells) กำลังทยอยตายและหยุดการสร้างเซลล์ทดแทน',
          ],
          [
            '3. Manifest Illness Stage (ระยะแสดงอาการเต็มที่)',
            'สัปดาห์ที่ 2 ถึงสัปดาห์ที่ 6 (หรือเร็วขึ้นหากโดสสูงมาก)',
            'อาการรุนแรงขึ้นอยู่กับระบบอวัยวะที่ถูกทำลาย: เม็ดเลือดขาวและเกล็ดเลือดดิ่งลง, ติดเชื้อ, ตกเลือด, ท้องร่วงเป็นเลือด, ชัก',
            'เซลล์ที่โตเต็มวัยหมดอายุขัย (Depletion) โดยไม่มีเซลล์ใหม่มาทดแทน เกิดการล้มเหลวของระบบอวัยวะ',
          ],
          [
            '4. Recovery or Death (ระยะฟื้นตัวหรือเสียชีวิต)',
            'สัปดาห์ที่ 6 จนถึงหลายเดือน',
            'หากรอดพ้นช่วงวิกฤต: สเต็มเซลล์ที่เหลืออยู่เริ่มแบ่งตัวชดเชย (Repopulation); หากไม่รอด: เสียชีวิตจาก Sepsis หรือ Shock',
            'อัตราการรอดชีวิตขึ้นกับปริมาณรังสีที่ได้รับและการให้การรักษาประคับประคองขั้นสูง (ICU, G-CSF, Transfusion)',
          ],
        ],
      },
    },
    {
      id: 'sec-radbio-three-ars-syndromes',
      heading: '8. การเปรียบเทียบ 3 กลุ่มอาการหลักของ ARS (Hematopoietic vs GI vs Cerebrovascular)',
      type: 'table',
      content: {
        headers: [
          'คุณลักษณะ',
          'Hematopoietic (Bone Marrow) Syndrome',
          'Gastrointestinal (GI) Syndrome',
          'Cerebrovascular (CNS) Syndrome',
        ],
        rows: [
          [
            'ปริมาณรังสี (Dose Range)',
            '1 – 10 Gy (หรือ 1 – 10 Sv)',
            '10 – 50 Gy',
            '> 50 Gy (หรือบางตำรา > 30–50 Gy)',
          ],
          [
            'ระยะเวลา Prodromal',
            'เริ่มใน 6–12 ชั่วโมง นาน 1–2 วัน',
            'เริ่มใน 1–2 ชั่วโมง นาน 1 วัน',
            'เริ่มทันทีในไม่กี่นาทีถึงครึ่งชั่วโมง',
          ],
          [
            'ระยะเวลา Latent',
            'นาน 1 – 3 สัปดาห์',
            'นานสั้นเพียง 3 – 5 วัน',
            'สั้นมากเพียงไม่กี่ชั่วโมง หรือไม่มีเลย',
          ],
          [
            'อวัยวะเป้าหมายหลัก',
            'สเต็มเซลล์ไขกระดูก (HSCs ในโพรงกระดูก)',
            'สเต็มเซลล์คริปต์ลำไส้เล็ก (Crypts of Lieberkühn)',
            'เซลล์บุหลอดเลือดฝอยในสมอง (Blood-Brain Barrier)',
          ],
          [
            'อาการแสดงในระยะ Manifest',
            'Pancytopenia (เม็ดเลือดขาว เกล็ดเลือด แดงต่ำ), มีไข้สูง, เลือดออกง่าย (Petechiae), ติดเชื้อในกระแสเลือด',
            'Villus denudation, ถ่ายเป็นเลือด, ขาดน้ำและเกลือแร่รุนแรง, แบคทีเรียบุกรุกกระแสเลือด (Endotoxemia / Sepsis)',
            'Severe cerebral edema, ความดันในกะโหลกสูง, Ataxia, สับสน, ชักรุนแรง, โคม่า',
          ],
          [
            'กรอบเวลาการเสียชีวิต',
            'เสียชีวิตใน 30 – 60 วัน (หากไม่ได้รับเลือด/สเต็มเซลล์)',
            'เสียชีวิตใน 3 – 10 วัน',
            'เสียชีวิตใน 24 – 48 ชั่วโมง (แทบไม่เกิน 3 วัน)',
          ],
          [
            'แนวโน้มการรอดชีวิต',
            'มีโอกาสรอดสูงหากโดส < 4 Gy และให้การรักษาประคับประคอง',
            'แทบไม่มีโอกาสรอดชีวิต (อัตราตายเกือบ 100%)',
            'เสียชีวิต 100% ไม่มีทางรักษาหาย',
          ],
        ],
      },
    },
    {
      id: 'sec-radbio-ld50-comparison',
      heading: '9. ปริมาณรังสีร้ายแรงเฉลี่ย (Mean Lethal Dose: LD50/30 vs LD50/60)',
      type: 'paragraph',
      content:
        'ค่า **Lethal Dose 50 ($LD_{50}$)** คือปริมาณรังสีทั่วทั้งร่างกายที่ส่งผลให้ประชากรที่ได้รับรังสีเสียชีวิต 50% ภายในกรอบเวลาที่กำหนด:\n\n' +
        '- **$LD_{50/30}$ (ใช้ในสัตว์ทดลอง):** เสียชีวิต 50% ภายใน 30 วัน เหมาะสำหรับสัตว์เลี้ยงลูกด้วยนมขนาดเล็กที่มีวงจรชีวิตสั้น\n' +
        '- **$LD_{50/60}$ (ใช้ในมนุษย์):** ในมนุษย์ การตายจากภาวะไขกระดูกล้มเหลวอาจยืดเยื้อจนถึงสัปดาห์ที่ 6 หรือ 60 วัน จึงใช้เกณฑ์ 60 วันเป็นมาตรฐานสากล\n\n' +
        '### ค่า $LD_{50/60}$ ของมนุษย์:\n' +
        '- **หากไม่ได้รับการรักษาทางการแพทย์ (Without Medical Care):** **$LD_{50/60} \\approx 3.5 – 4.0\\text{ Gy}$** (ตายจากภาวะติดเชื้อและตกเลือด)\n' +
        '- **หากได้รับการรักษาประคับประคองขั้นสูง (With Advanced Intensive Care & G-CSF):** **$LD_{50/60} \\approx 6.0 – 7.0\\text{ Gy}$** (สามารถช่วยชีวิตผู้ป่วยที่ได้รับรังสีสูงได้ถึงเกือบเท่าตัว)\n\n' +
        '### การเปรียบเทียบความทนทานระหว่างสปีชีส์ (Species Variability):\n' +
        'มนุษย์และสัตว์เลี้ยงลูกด้วยนมขนาดใหญ่จัดเป็นสิ่งมีชีวิตที่ไวต่อรังสีมากที่สุดในโลก:\n' +
        '- **มนุษย์ / สุนัข / หมู:** $LD_{50} \\approx 3.5 – 4.0\\text{ Gy}$\n' +
        '- **หนู (Mice / Rats):** $LD_{50} \\approx 7.0 – 9.0\\text{ Gy}$\n' +
        '- **สัตว์ปีก (Birds):** $LD_{50} \\approx 8.0 – 10.0\\text{ Gy}$\n' +
        '- **แมลง (Insects เช่น แมลงสาบ):** $LD_{50} \\approx 100 – 1,000\\text{ Gy}$ (เนื่องจากเซลล์ส่วนใหญ่พัฒนาสมบูรณ์และไม่มีการแบ่งตัวบ่อย)\n' +
        '- **จุลชีพ (Bacteria เช่น Deinococcus radiodurans):** $LD_{50} > 10,000\\text{ Gy}$ (มีกลไกเอนไซม์ซ่อมแซม DNA ที่ทรงพลังอย่างยิ่งยวด)',
    },
    {
      id: 'sec-radbio-icrp-recommendations',
      heading: '10. ข้อเสนอแนะมาตรฐานสากลในการป้องกันรังสี (ICRP 103 Recommendations & ALARA)',
      type: 'paragraph',
      content:
        'คณะกรรมาธิการสากลว่าด้วยการป้องกันรังสี (International Commission on Radiological Protection: ICRP Publication 103, 2007) กำหนดระบบการป้องกันรังสีไว้บน 3 เสาหลัก:\n\n' +
        '### 1. หลักการพื้นฐาน 3 ประการ (The 3 Cardinal Principles):\n' +
        '1. **Justification (ความสมเหตุสมผล):** กิจกรรมใดๆ ที่นำรังสีมาใช้ต้องก่อให้เกิดประโยชน์สุทธิแก่ผู้รับรังสีหรือสังคม มากกว่าผลเสียที่อาจเกิดขึ้น\n' +
        '2. **Optimization of Protection (การทำให้เหมาะสมที่สุด — ALARA):** การรับรังสีทั้งหมดต้องถูกจำกัดให้ต่ำที่สุดเท่าที่จะทำได้อย่างสมเหตุสมผล โดยคำนึงถึงปัจจัยทางเศรษฐกิจและสังคม (**As Low As Reasonably Achievable: ALARA**)\n' +
        '3. **Dose Limitation (การจำกัดปริมาณรังสี):** ปริมาณรังสีที่ได้รับต้องไม่เกินค่าขีดจำกัดสูงสุดตามกฎหมาย (Dose Limits)\n\n' +
        '### 2. ขีดจำกัดปริมาณรังสีประจำปี (Dose Limits):\n' +
        '- **ผู้ปฏิบัติงานทางรังสี (Occupational Radiation Workers):**\n' +
        '  - ปริมาณรังสียังผลทั่วร่างกาย (Effective Dose): **20 mSv/ปี** (คิดเฉลี่ยในช่วง 5 ปี โดยไม่มีปีใดปีหนึ่งเกิน 50 mSv)\n' +
        '  - เลนส์ตา (Lens of the eye): **20 mSv/ปี** (ปรับลดลงจากเดิม 150 mSv ตาม ICRP 118)\n' +
        '  - ผิวหนัง มือ และเท้า (Skin, Hands, Feet): **500 mSv/ปี**\n' +
        '- **ประชาชนทั่วไป (Public):**\n' +
        '  - ปริมาณรังสียังผลทั่วร่างกาย (Effective Dose): **1 mSv/ปี** (ไม่รวมรังสีพื้นหลังธรรมชาติและรังสีเพื่อการรักษาพยาบาลตนเอง)',
    },
    {
      id: 'sec-radbio-wholebody-quiz',
      heading: '11. แบบทดสอบวัดความเข้าใจเรื่องผลรังสีต่อร่างกายส่วนรวม (Assessment Quiz)',
      type: 'quiz',
      content: {
        questions: [
          {
            id: 'q-wb-1',
            text: 'ตามกฎของ Bergonié และ Tribondeau เซลล์ในข้อใดมีความไวต่อรังสีสูงที่สุด (Most Radiosensitive)?',
            options: [
              'เซลล์ประสาทสมอง (Mature Neurons)',
              'เซลล์ต้นกำเนิดเม็ดเลือดขาวและแดงในไขกระดูก (Erythroblasts / Stem cells)',
              'เซลล์กล้ามเนื้อหัวใจ (Myocytes)',
              'เซลล์กระดูกที่พัฒนาสมบูรณ์แล้ว (Osteocytes)',
            ],
            correctOptionIndex: 1,
            explanation:
              'เซลล์ที่มีอัตราการแบ่งตัวสูงและยังไม่พัฒนาเฉพาะทาง (Undifferentiated) เช่น สเต็มเซลล์ในไขกระดูก จะมีความไวต่อรังสีสูงที่สุดตามกฎ Bergonié-Tribondeau',
          },
          {
            id: 'q-wb-2',
            text: 'ผู้ป่วยที่ได้รับรังสีทั่วร่างกายปริมาณ 30 Gy จะเกิดกลุ่มอาการใดและมีโอกาสเสียชีวิตในช่วงเวลาใด?',
            options: [
              'Hematopoietic syndrome เสียชีวิตใน 30-60 วัน',
              'Gastrointestinal (GI) syndrome เสียชีวิตใน 3-10 วัน',
              'Cerebrovascular syndrome เสียชีวิตในไม่กี่ชั่วโมง',
              'ไม่มีอาการรุนแรง สามารถรักษาหายได้ด้วยยาปฏิชีวนะ',
            ],
            correctOptionIndex: 1,
            explanation:
              'ปริมาณรังสี 10-50 Gy ก่อให้เกิด Gastrointestinal Syndrome อย่างแน่นอน โดยเซลล์คริปต์ในลำไส้เล็กจะถูกทำลายหมด เกิด villus denudation และเสียชีวิตใน 3-10 วัน',
          },
          {
            id: 'q-wb-3',
            text: 'ในการทำ Total Body Irradiation (TBI) เหตุใดจึงต้องใช้อุปกรณ์บังรังสีปอด (Custom Lung Blocks)?',
            options: [
              'เนื่องจากปอดเป็น Serial organ ที่ทนรังสีได้ไม่เกิน 5 Gy',
              'เพื่อจำกัดโดสรวมที่ปอดไม่ให้เกิน 8-10 Gy ป้องกันภาวะ Radiation Pneumonitis ถึงแก่ชีวิต',
              'เพื่อไม่ให้หัวใจได้รับคลื่นความร้อน',
              'เพื่อเพิ่มปริมาณรังสีที่กระดูกซี่โครงให้มากขึ้น',
            ],
            correctOptionIndex: 1,
            explanation:
              'ปอดมีความไวต่อรังสีสูงมาก การได้รับรังสีเกิน 8-10 Gy ใน TBI อาจนำไปสู่ภาวะปอดอักเสบจากรังสี (Radiation Pneumonitis) และพังผืดที่ทำให้หายใจล้มเหลวได้',
          },
          {
            id: 'q-wb-4',
            text: 'ค่า LD50/60 ของมนุษย์กรณีไม่ได้รับการรักษาประคับประคองทางการแพทย์มีค่าประมาณเท่าใด?',
            options: [
              '0.5 - 1.0 Gy',
              '3.5 - 4.0 Gy',
              '10 - 15 Gy',
              '50 Gy ขึ้นไป',
            ],
            correctOptionIndex: 1,
            explanation:
              'LD50/60 ของมนุษย์ตามธรรมชาติอยู่ที่ประมาณ 3.5-4.0 Gy (และสามารถเพิ่มเป็น 6-7 Gy หากได้รับการรักษาประคับประคองทางโลหิตวิทยาและให้สารกระตุ้นเม็ดเลือด)',
          },
        ],
      },
    },
  ],
};

export default radiationEffectWholeBodyChapter;
