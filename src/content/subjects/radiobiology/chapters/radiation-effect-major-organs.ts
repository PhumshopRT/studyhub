import type { Chapter } from '../../../../types/content';

export const radiationEffectMajorOrgansChapter: Chapter = {
  id: 'radiation-effect-major-organs',
  subjectId: 'radiobiology',
  title: 'ผลของรังสีต่ออวัยวะและเนื้อเยื่อ (Radiation Effect on Major Organs)',
  order: 1,
  estimatedReadingMinutes: 45,
  description:
    'ศึกษาผลกระทบของรังสีต่ออวัยวะสำคัญของร่างกาย: กลไกระดับโมเลกุล (Direct vs Indirect Action), สถาปัตยกรรมอวัยวะแบบ Serial vs Parallel, ขีดจำกัดความทนทานของเนื้อเยื่อปกติ (TD 5/5 & QUANTEC Tolerance Doses), ปฏิกิริยาเฉียบพลันและเรื้อรังรายอวัยวะ (ผิวหนัง เลนส์ตา ศีรษะและลำคอ ปอด ตับ ทางเดินอาหาร ไขสันหลัง และระบบสืบพันธุ์) พร้อมหลักการ Therapeutic Window (TCP vs NTCP) และแบบจำลองการคำนวณการแบ่งโดส (Fractionation & BED)',
  tags: [
    'Radiobiology',
    'Major Organs',
    'Tolerance Dose',
    'TD 5/5',
    'Serial vs Parallel',
    'QUANTEC',
    'TCP vs NTCP',
    'Free Radicals',
    'Cataract',
    'Pneumonitis',
  ],
  simulationIds: ['realistic-radiobiology-3d'],
  objectives: [
    'อธิบาย 4 ระดับผลกระทบของรังสีต่อร่างกาย: Physical, Cellular, Tissue Response, จนถึง Clinical Application',
    'เปรียบเทียบกลไกการแตกตัวโดยตรง (Direct Action 25–30%) กับการแตกตัวผ่านอนุมูลอิสระจากการแตกตัวของน้ำ (Indirect Action 70–75%)',
    'จำแนกความแตกต่างระหว่างผลแบบมีขีดเริ่ม (Deterministic / Tissue Reactions) และผลแบบสุ่ม (Stochastic Effects)',
    'วิเคราะห์ความแตกต่างของสถาปัตยกรรมอวัยวะแบบ Serial (เช่น ไขสันหลัง ลำไส้) และ Parallel (เช่น ปอด ตับ ไต) ต่อข้อจำกัดการวางแผนรังสีรักษา',
    'ระบุค่าขีดจำกัดความทนทานของอวัยวะวิกฤต (Organs at Risk: OARs) ตามเกณฑ์ TD 5/5 และ TD 50/5',
    'เข้าใจพยาธิสภาพระยะเฉียบพลันและระยะยาวของผิวหนัง เลนส์ตา ต่อมน้ำลาย ทางเดินอาหาร และระบบประสาท',
    'อธิบายหลักการหน้าต่างการรักษา (Therapeutic Window), อัตราส่วน alpha/beta (LQ Model) และประโยชน์ของการแบ่งโดสรังสี (Fractionation)',
  ],
  sections: [
    {
      id: 'sec-radbio-organs-qwen-app',
      heading: '1. คลังความรู้และห้องจำลองรังสีชีววิทยา (RadLibrary: Major Organs & Biological Effects Hub)',
      type: 'legacy-html',
      content: {
        modulePath: '/qwen-modules/radiobiology/radbio/index.html#c1',
        title: 'RadLibrary: ผลของรังสีต่ออวัยวะและเนื้อเยื่อ (Major Organs Hub)',
        description:
          'โมดูลเว็บแอปพลิเคชันการเรียนรู้แบบโต้ตอบ: ครอบคลุม 15 หัวข้อสรุปจากสไลด์, แผนที่ความไวต่อรังสีของอวัยวะ, เครื่องจำลองการทำลาย DNA (Direct/Indirect), ตัวคำนวณ BED และแบบทดสอบความเข้าใจ 30 ข้อ',
        initialHeight: 880,
      },
    },
    {
      id: 'sec-radbio-3d-studio',
      heading: '2. ห้องปฏิบัติการจำลอง 3 มิติ: 3D Holographic Radiobiology & ARS Studio',
      type: 'simulation',
      content: {
        simulationId: 'realistic-radiobiology-3d',
        title: 'แบบจำลอง 3 มิติ: กายวิภาครังสีชีววิทยา, กลไกสลายตัวของดีเอ็นเอ และการตอบสนองต่อปริมาณรังสี',
      },
    },
    {
      id: 'sec-radbio-scale-of-impact',
      heading: '3. ภาพรวมและ 4 ระดับผลกระทบของรังสี (Scale of Impact: MICRO → MACRO → CLINICAL)',
      type: 'paragraph',
      content:
        'รังสีชีววิทยา (Radiobiology) คือการศึกษาผลของการแผ่รังสีชนิดก่อไอออน (Ionizing Radiation) ต่อสิ่งมีชีวิต โดยสามารถจำแนกลำดับเหตุการณ์ (Radiobiological Journey) ออกเป็น 4 ระดับใหญ่:\n\n' +
        '1. **ระดับฟิสิกส์ (Physics & Units):** รังสีโฟตอน (X-ray, Gamma) หรืออนุภาค ($\alpha, \beta, \text{proton}$) ถ่ายเทพลังงานเข้าสู่สสารผ่านกระบวนการ Ionization และ Excitation วัดในหน่วย Gy หรือ Sv\n' +
        '2. **ระดับโมเลกุลและเซลล์ (Cellular Level):** พลังงานรังสีทำให้เกิดการแตกหักของสายดีเอ็นเอ (DNA Strand Breaks) ทั้ง Single Strand Break (SSB) และ Double Strand Break (DSB) รวมถึงการเกิดอนุมูลอิสระ (Free Radicals)\n' +
        '3. **ระดับเนื้อเยื่อและอวัยวะ (Tissue Response):** เซลล์ที่มีอัตราการแบ่งตัวสูงและยังไม่พัฒนาสมบูรณ์จะไวต่อรังสีสูงมาก เกิดการตายแบบ Mitotic Death หรือ Apoptosis นำไปสู่การสูญเสียเซลล์ต้นกำเนิดและเซลล์ทำหน้าที่ (Parenchymal Depletion)\n' +
        '4. **ระดับคลินิก (Clinical Application):** การประยุกต์ใช้ความแตกต่างของความไวรังสีระหว่างเซลล์มะเร็งและเนื้อเยื่อปกติ เพื่อทำลายก้อนเนื้องอกให้ได้ผลสูงสุด (Tumor Control Probability: TCP) ขณะที่จำกัดผลข้างเคียงต่ออวัยวะข้างเคียงให้อยู่ในเกณฑ์ยอมรับได้ (Normal Tissue Complication Probability: NTCP)',
    },
    {
      id: 'sec-radbio-cellular-mechanisms',
      heading: '4. กลไกการทำลายระดับเซลล์: การแตกตัวโดยตรง vs การแตกตัวผ่านอนุมูลอิสระ (Direct vs Indirect Action)',
      type: 'paragraph',
      content:
        'เมื่อรังสีผ่านเข้าไปในเซลล์ ปฏิกิริยาสามารถเกิดขึ้นได้ 2 รูปแบบหลัก:\n\n' +
        '### 1. Direct Action (การทำลายโดยตรง: 25–30%)\n' +
        '- อนุภาครังสีชนเข้ากับเป้าหมายสำคัญทางชีววิทยาโดยตรง (Critical Biological Target คือ DNA)\n' +
        '- อิเล็กตรอนถูกดึงหลุดออกจากโมเลกุลของ DNA (Sugar-Phosphate backbone หรือ Nitrogenous bases) ทำให้เกิดพันธะเคมีขาด\n' +
        '- เป็นกลไกหลักของรังสีที่มีค่า **High LET (High Linear Energy Transfer)** เช่น อนุภาคแอลฟา ($\alpha$), นิวตรอน (Neutrons), และไอออนหนัก\n\n' +
        '### 2. Indirect Action (การทำลายโดยอ้อมผ่านอนุมูลอิสระ: 70–75%)\n' +
        '- รังสีชนกับโมเลกุลของน้ำ ($H_2O$) ซึ่งเป็นองค์ประกอบหลักกว่า 70–80% ของเซลล์ เกิดกระบวนการแตกตัวของน้ำด้วยรังสี (**Radiolysis of Water**):\n' +
        '  $$\\text{H}_2\\text{O} \\xrightarrow{\\text{radiation}} \\text{H}_2\\text{O}^+ + e^- \\xrightarrow{\\text{H}_2\\text{O}} \\cdot\\text{OH} + \\text{H}_3\\text{O}^+$$\n' +
        '- ผลผลิตที่อันตรายที่สุดคือ **อนุมูลไฮดรอกซิล (Hydroxyl Radical: $\\cdot\\text{OH}$)** ซึ่งมีความว่องไวในการทำปฏิกิริยาสูงมาก สามารถแพร่กระจายในระยะสั้น (~2–4 nm) ไปขโมยอิเล็กตรอนและทำลายโครงสร้าง DNA\n' +
        '- เป็นกลไกหลักของรังสี **Low LET (X-ray และ Gamma ray)**\n' +
        '- ปฏิกิริยานี้สามารถถูกขัดขวางได้ด้วยสารต้านอนุมูลอิสระและสารป้องกันรังสี เช่น **Amifostine (WR-2721)** ซึ่งทำหน้าที่เป็น Free Radical Scavenger',
    },
    {
      id: 'sec-radbio-cellular-crossroads',
      heading: '5. ชะตากรรม 4 ทิศทางของเซลล์หลังถูกรังสี (Cellular Crossroads & The 4 R\'s)',
      type: 'paragraph',
      content:
        'หลังจาก DNA ได้รับความเสียหาย เซลล์จะมีทางแยกแห่งการตัดสินใจ (Cellular Crossroads) 4 ทาง:\n\n' +
        '- **ทางเลือก A (Error-Free Repair):** เอนไซม์ซ่อมแซม DNA ได้สมบูรณ์ เซลล์กลับมาทำงานและแบ่งตัวได้ตามปกติ\n' +
        '- **ทางเลือก B (Cell Death / Apoptosis / Mitotic Catastrophe):** ความเสียหายรุนแรงเกินซ่อมแซม โดยเฉพาะ Double Strand Breaks (DSB) ที่ซับซ้อน เซลล์ตายลงขณะพยายามแบ่งตัว (Mitotic Death) ซึ่งเป็นสาเหตุของ **Deterministic Effects (Tissue Reactions)**\n' +
        '- **ทางเลือก C (Somatic Mutation):** ซ่อมแซมผิดพลาด เซลล์รอดชีวิตแต่มีรหัสพันธุกรรมกลายพันธุ์ หากเกิดขึ้นในเซลล์ร่างกาย (Somatic Cell) อาจนำไปสู่การเกิดมะเร็งทุติยภูมิ (**Carcinogenesis / Stochastic Effect**)\n' +
        '- **ทางเลือก D (Germline Mutation):** เกิดการกลายพันธุ์ในเซลล์สืบพันธุ์ (Sperm/Ovum) ส่งต่อความผิดปกติทางพันธุกรรมไปยังรุ่นลูกหลาน (**Hereditary Effect**)\n\n' +
        '### The 4 R\'s of Radiotherapy (หลัก 4R ของรังสีรักษา):\n' +
        '1. **Repair (การซ่อมแซม):** เซลล์ปกติมักซ่อมแซมความเสียหายระดับกึ่งอันตราย (Sublethal Damage Repair: SLDR) ได้ดีกว่าเซลล์มะเร็งภายใน 4–6 ชั่วโมง\n' +
        '2. **Reassortment / Redistribution (การกระจายตัวในวัฏจักรเซลล์):** เซลล์ในระยะ $G_2/M$ จะไวต่อรังสีสูงสุด ขณะที่ระยะ Late $S$ จะทนทานที่สุด การแบ่งโดสทำให้เซลล์ที่รอดชีวิตเคลื่อนเข้าสู่ระยะที่ไวรังสี\n' +
        '3. **Repopulation (การเพิ่มจำนวนชดเชย):** สเต็มเซลล์ปกติเร่งการแบ่งตัวเพื่อชดเชยเนื้อเยื่อที่ถูกทำลาย\n' +
        '4. **Reoxygenation (การคืนออกซิเจนสู่ก้อนมะเร็ง):** ออกซิเจนช่วยตรึงความเสียหายของอนุมูลอิสระ (Oxygen Fixation Hypothesis) การแบ่งโดสทำให้ก้อนมะเร็งยุบตัว หลอดเลือดเปิดนำออกซิเจนเข้าสู่เซลล์ที่เคยขาดออกซิเจน (Hypoxic cells)',
    },
    {
      id: 'sec-radbio-deterministic-stochastic',
      heading: '6. การเปรียบเทียบผลของรังสี: Deterministic vs Stochastic Effects',
      type: 'table',
      content: {
        headers: [
          'คุณลักษณะ',
          'Deterministic Effect (Tissue Reaction)',
          'Stochastic Effect (ผลทางสถิติ/แบบสุ่ม)',
        ],
        rows: [
          [
            'ปริมาณรังสีขั้นต่ำ (Threshold Dose)',
            'มีขีดเริ่มแน่นอน (Definite Threshold) — ต่ำกว่านี้ไม่แสดงอาการ',
            'ไม่มีขีดเริ่ม (No Threshold) — สมมติฐาน LNT (Linear No-Threshold)',
          ],
          [
            'ความสัมพันธ์กับปริมาณรังสี (Dose Dependency)',
            'ความรุนแรงของอาการ (Severity) เพิ่มขึ้นตามปริมาณรังสีที่ได้รับ',
            'โอกาสการเกิด (Probability) เพิ่มขึ้นตามโดส แต่ความรุนแรงไม่ขึ้นกับโดส',
          ],
          [
            'กลไกการเกิด (Underlying Mechanism)',
            'เกิดจากการตายของเซลล์จำนวนมาก (Massive Cell Killing / Depletion)',
            'เกิดจากการกลายพันธุ์ระดับ DNA ในเซลล์ที่ยังรอดชีวิต (Viable Mutated Cell)',
          ],
          [
            'ตัวอย่างทางคลินิก',
            'ผิวหนังแดง (Erythema), ผิวลอก, ต้อกระจก (Cataract), ภาวะหมัน, ARS',
            'โรคมะเร็งเหนี่ยวนำจากรังสี (Radiation Carcinogenesis), ผลทางพันธุกรรม',
          ],
          [
            'เป้าหมายการป้องกันทางรังสี (ICRP Goal)',
            'ป้องกันไม่ให้เกิดขึ้นเลย (Prevent) โดยกำหนดขีดจำกัดให้อยู่ต่ำกว่า Threshold',
            'จำกัดความเสี่ยงให้อยู่ในระดับที่ยอมรับได้ (Limit) ตามหลัก ALARA',
          ],
        ],
      },
    },
    {
      id: 'sec-radbio-serial-parallel-architecture',
      heading: '7. สถาปัตยกรรมอวัยวะ: Serial vs Parallel Architecture (หัวใจสำคัญของการวางแผนรังสี)',
      type: 'paragraph',
      content:
        'เนื้อเยื่อและอวัยวะในร่างกายประกอบด้วยหน่วยการทำงานย่อย (**Functional Subunits: FSUs**) ซึ่งจัดเรียงตัวแตกต่างกัน ส่งผลต่อความทนทานต่อรังสีอย่างมีนัยสำคัญ:\n\n' +
        '### 1. Serial Organs (อวัยวะที่จัดเรียงแบบอนุกรม)\n' +
        '- **ลักษณะ:** FSUs เรียงตัวต่อกันเป็นสายโซ่เหมือนหลอดไฟบนสายไฟเส้นเดียว\n' +
        '- **ผลกระทบ:** หากมีจุดใดจุดหนึ่งของสายได้รับรังสีสูงเกินเกณฑ์จน FSU ถูกทำลาย การทำงานของอวัยวะทั้งหมดจะหยุดชะงักทันที (Disabling Whole Organ Function)\n' +
        '- **ตัวอย่าง:** **ไขสันหลัง (Spinal Cord)**, ลำไส้ (Bowel), ก้านสมอง (Brainstem), เส้นประสาทตา (Optic Chiasm)\n' +
        '- **เกณฑ์การคุมโดส:** ต้องจำกัด **ปริมาณรังสีสูงสุดเฉพาะจุด (Maximum Point Dose: $D_{\\max}$)** อย่างเคร่งครัด แม้จะเป็นปริมาตรเล็กเพียง $0.03\\text{ cc}$ ก็ตาม (เช่น Spinal Cord $D_{\\max} \\le 45\\text{ Gy}$)\n\n' +
        '### 2. Parallel Organs (อวัยวะที่จัดเรียงแบบขนาน)\n' +
        '- **ลักษณะ:** FSUs ทำงานเป็นอิสระต่อกัน เหมือนหลอดไฟที่ต่อวงจรขนานกัน\n' +
        '- **ผลกระทบ:** การทำลาย FSUs บางส่วนไม่ทำให้ทั้งอวัยวะล้มเหลว ตราบใดที่ยังมีปริมาตรสำรอง (Functional Reserve) เพียงพอ\n' +
        '- **ตัวอย่าง:** **ปอด (Lungs)**, **ตับ (Liver)**, **ไต (Kidneys)**, ต่อมน้ำลายพาโรติด (Parotid Gland)\n' +
        '- **เกณฑ์การคุมโดส:** มีผลกระทบแบบปริมาตร (**Volume Effect**) ชัดเจน สามารถรับรังสีสูงมากในพื้นที่เล็กๆ ได้ (เช่น SBRT ปอด 50–60 Gy) แต่ต้องควบคุม **ปริมาณรังสีเฉลี่ยทั้งอวัยวะ (Mean Organ Dose)** และจำกัดสัดส่วนปริมาตรที่ได้รับรังสี เช่น ปอด $V_{20} \\le 30\\%$ และ Mean Lung Dose $\\le 20\\text{ Gy}$',
    },
    {
      id: 'sec-radbio-tolerance-doses-table',
      heading: '8. ตารางขีดจำกัดความทนทานของอวัยวะสำคัญ (Emami / QUANTEC Tolerance Doses)',
      type: 'table',
      content: {
        headers: [
          'อวัยวะ (Critical Organ)',
          'สถาปัตยกรรม (Architecture)',
          'TD 5/5 (Whole Organ)',
          'จุดสิ้นสุดทางคลินิก (Clinical Endpoint)',
          'หมายเหตุสำคัญทางรังสีวิทยา',
        ],
        rows: [
          [
            'ไขกระดูก (Bone Marrow)',
            'Parallel / Diffuse',
            '2.5–3.0 Gy',
            'Pancytopenia, Aplastic Anemia',
            'อวัยวะที่ไวต่อรังสีสูงที่สุดในร่างกาย กำหนดขีดจำกัดใน TBI',
          ],
          [
            'รังไข่ (Ovary)',
            'Parallel / Endocrine',
            '2.5–3.0 Gy (Permanent)',
            'Sterility (ภาวะหมันถาวร), Menopause',
            'ขึ้นกับอายุ: ผู้หญิงอายุ >40 ปี โดส 2–3 Gy ทำให้หมันถาวรได้',
          ],
          [
            'อัณฑะ (Testes)',
            'Parallel / Endocrine',
            '0.15 Gy (Oligospermia), 2 Gy (Temp), 6 Gy (Perm)',
            'Aspermia, Permanent Sterility',
            'Spermatogonia ไวรังสีสูงมาก; Leydig cells ทนรังสีได้ดีกว่า',
          ],
          [
            'เลนส์ตา (Eye Lens)',
            'Serial / Avascular',
            '0.5–2.0 Gy (Single), 4–5 Gy (Fract.)',
            'Cataract (ต้อกระจกหลังเลนส์)',
            'ไม่มีการผลัดเซลล์ เซลล์ที่ตายจะสะสมกลายเป็นจุดทึบแสงใน 1–5 ปี',
          ],
          [
            'ปอด (Lungs)',
            'Parallel',
            '17.5 Gy (Whole), V20 < 30%',
            'Radiation Pneumonitis & Fibrosis',
            'จำกัด Mean Lung Dose < 20 Gy เพื่อป้องกันภาวะหายใจล้มเหลว',
          ],
          [
            'ไต (Kidneys)',
            'Parallel',
            '23 Gy (Whole Bilateral)',
            'Radiation Nephritis, Renal Failure',
            'หากฉายรังสีทั้งสองข้างพร้อมกัน เกณฑ์ต้องเข้มงวดมาก (Mean < 18 Gy)',
          ],
          [
            'ตับ (Liver)',
            'Parallel',
            '30 Gy (Whole Liver)',
            'RILD (Radiation-Induced Liver Disease)',
            'Venous Occlusive Disease ทำให้ตับโต ตัวเหลือง ท้องมาน',
          ],
          [
            'ไขสันหลัง (Spinal Cord)',
            'Serial',
            '45–50 Gy (Max Point)',
            'Radiation Myelopathy (อัมพาต)',
            'ห้ามเกิน 45–50 Gy เด็ดขาด เพราะเป็น Serial organ ซ่อมแซมไม่ได้',
          ],
          [
            'กระเพาะ/ลำไส้เล็ก (Stomach / Bowel)',
            'Serial',
            '40–45 Gy',
            'Perforation, Ulceration, Stricture',
            'ความทนทานจำกัดโดย crypt stem cell depletion',
          ],
          [
            'สมอง (Brain)',
            'Parallel / Serial mix',
            '45–50 Gy (Whole), 60 Gy (Partial)',
            'Radiation Necrosis, Edema',
            'White matter necrosis มักเกิดหลังฉายรังสี 6–24 เดือน',
          ],
        ],
      },
    },
    {
      id: 'sec-radbio-organ-pathology-detail',
      heading: '9. พยาธิสภาพรังสีรายอวัยวะ (Detailed Organ Pathology)',
      type: 'paragraph',
      content:
        'พยาธิสภาพของอวัยวะเมื่อได้รับรังสีรักษา (Radiation Pathology) แบ่งตามระบบร่างกายดังนี้:\n\n' +
        '### 1. ผิวหนัง (Skin & Cutaneous Reactions)\n' +
        '- **Erythema (ผิวแดงคล้ำ):** เกิดขึ้นที่โดส 6–10 Gy ภายใน 2–3 สัปดาห์แรก เกิดจากหลอดเลือดฝอยขยายตัวและการอักเสบ\n' +
        '- **Dry Desquamation (ผิวแห้งลอก):** โดส 10–15 Gy เซลล์ Basal cell แบ่งตัวชดเชยไม่ทัน ผิวหนังตกสะเก็ดและคัน\n' +
        '- **Moist Desquamation (ผิวลอกแฉะมีน้ำเหลืองซึม):** โดส > 15–20 Gy สเต็มเซลล์ในชั้น basal ถูกทำลายทั้งหมด ชั้นหนังแท้เปิดโล่ง เสี่ยงต่อการติดเชื้อ\n' +
        '- **Radionecrosis (เนื้อเยื่อผิวตาย):** โดสสะสม > 25–30 Gy หลอดเลือดส่วนลึกตีบตัน เกิดแผลเรื้อรังที่ไม่หาย\n\n' +
        '### 2. ศีรษะและลำคอ (Head and Neck)\n' +
        '- **Oral Mucositis (เยื่อบุช่องปากอักเสบ):** เกิดที่โดส 15–20 Gy เป็นแผลเปื่อยเจ็บปวดมาก ส่งผลต่อการรับประทานอาหาร\n' +
        '- **Xerostomia (ภาวะปากแห้งถาวร):** ต่อมน้ำลายพาโรติด (Parotid Gland) ได้รับรังสีเกิน TD 5/5 (~32 Gy) เซลล์ Serous acinar ถูกทำลาย น้ำลายข้นเหนียว ฟันผุง่าย\n' +
        '- **Dysgeusia (การรับรสผิดปกติ):** ปุ่มรับรสสูญเสียหน้าที่ชั่วคราวและค่อยๆ ฟื้นตัวใน 2–4 เดือน\n\n' +
        '### 3. ระบบหัวใจและหลอดเลือด (Cardiovascular System)\n' +
        '- **Acute Pericarditis:** เยื่อหุ้มหัวใจอักเสบเฉียบพลัน\n' +
        '- **Coronary Artery Disease:** หลอดเลือดหัวใจเสื่อมสภาพเร็ว เกิด Accelerated Atherosclerosis เพิ่มความเสี่ยงกล้ามเนื้อหัวใจขาดเลือดในผู้ป่วยมะเร็งเต้านมหรือมะเร็งต่อมน้ำเหลืองหลังฉายแสง 5–15 ปี',
    },
    {
      id: 'sec-radbio-therapeutic-window',
      heading: '10. หน้าต่างการรักษาและสมการชีววิทยาประสิทธิผล (Therapeutic Window & BED)',
      type: 'paragraph',
      content:
        'หัวใจสำคัญสูงสุดของรังสีรักษาคือการเปิด **หน้าต่างการรักษา (Therapeutic Window)**:\n\n' +
        '$$\\text{Therapeutic Window} = \\text{TCP (Tumor Control Probability)} - \\text{NTCP (Normal Tissue Complication Probability)}$$\n\n' +
        'เส้นกราฟความน่าจะเป็นของการควบคุมโรค (TCP) จะต้องอยู่ทางซ้ายของเส้นความน่าจะเป็นของการเกิดภาวะแทรกซ้อน (NTCP) เพื่อให้มีช่วงโดสรังสีที่สามารถฆ่าเซลล์มะเร็งได้สูง (TCP > 90%) ในขณะที่ภาวะแทรกซ้อนต่อเนื้อเยื่อปกติยังคงต่ำ (NTCP < 5%)\n\n' +
        '### Linear-Quadratic (LQ) Model & $\\alpha/\\beta$ Ratio:\n' +
        '- **Early-responding tissues (เช่น ก้อนมะเร็ง, เยื่อบุ, ผิวหนัง, ไขกระดูก):** มีค่า $\\alpha/\\beta \\approx 10\\text{ Gy}$ ตอบสนองต่อปริมาณรังสีรวมเป็นหลัก ไม่ค่อยขึ้นกับขนาดย่อยต่อครั้ง\n' +
        '- **Late-responding tissues (เช่น ไขสันหลัง, เนื้อปอด, หลอดเลือด, สมอง):** มีค่า $\\alpha/\\beta \\approx 2–3\\text{ Gy}$ มีความไวสูงมากต่อขนาดของรังสีในแต่ละแฟรกชัน (Fraction Size Sensitivity) การเพิ่มขนาดย่อยต่อครั้งจะเพิ่มความเสียหายรุนแรงแบบก้าวกระโดด\n\n' +
        '### Biologically Effective Dose (BED Formula):\n' +
        '$$\\text{BED} = n \\times d \\left(1 + \\frac{d}{\\alpha/\\beta}\\right)$$\n' +
        'โดยที่ $n$ คือจำนวนครั้งที่ฉาย, $d$ คือปริมาณรังสีต่อครั้ง (Gy/fraction), และ $\\alpha/\\beta$ คือคุณสมบัติของเนื้อเยื่อเป้าหมาย',
    },
    {
      id: 'sec-radbio-clinical-quiz',
      heading: '11. แบบทดสอบวัดความเข้าใจทางคลินิก (Interactive Clinical Assessment)',
      type: 'quiz',
      content: {
        questions: [
          {
            id: 'q-organs-1',
            text: 'กลไกการทำลายโมเลกุล DNA ส่วนใหญ่ (~70-75%) ของรังสี X-ray และ Gamma เกิดจากข้อใด?',
            options: [
              'การชนเข้ากับสาย DNA โดยตรงทำให้พันธะขาด',
              'ปฏิกิริยาการแตกตัวของน้ำ (Radiolysis of water) เกิดอนุมูลอิสระไฮดรอกซิล (.OH)',
              'การเพิ่มขึ้นของอุณหภูมิในไซโตพลาสซึม',
              'การทำลายโครงสร้างของเยื่อหุ้มเซลล์ชั้นนอก',
            ],
            correctOptionIndex: 1,
            explanation:
              'รังสีประเภท Low-LET (X-ray, Gamma) ทำลายดีเอ็นเอผ่าน Indirect Action ถึง 70-75% โดยผ่านอนุมูลอิสระ .OH ที่เกิดจากการแตกตัวของน้ำในเซลล์',
          },
          {
            id: 'q-organs-2',
            text: 'อวัยวะในข้อใดจัดเป็น Serial Organ ซึ่งมีความเสี่ยงสูงมากหากมีจุดใดจุดหนึ่งได้รับรังสีเกินขีดจำกัดสูงสุด (Maximum Point Dose)?',
            options: [
              'ปอด (Lungs)',
              'ตับ (Liver)',
              'ไขสันหลัง (Spinal Cord)',
              'ไต (Kidneys)',
            ],
            correctOptionIndex: 2,
            explanation:
              'ไขสันหลัง (Spinal Cord) จัดเป็น Serial Organ ชัดเจน เพราะหากจุดใดจุดหนึ่งเกิด Radiation Myelopathy การส่งกระแสประสาททั้งหมดด้านล่างจะดับลงทันที',
          },
          {
            id: 'q-organs-3',
            text: 'เกณฑ์ความทนทาน TD 5/5 ของอวัยวะ หมายถึงข้อใดถูกต้องที่สุด?',
            options: [
              'ปริมาณรังสีที่ทำให้เกิดภาวะแทรกซ้อนรุนแรง 5% ภายในระยะเวลา 5 ปี',
              'ปริมาณรังสีที่ทำให้เซลล์มะเร็งตาย 50% ภายใน 5 วัน',
              'ปริมาณรังสีที่ปลอดภัย 100% ต่อคนไข้ทุกคนเป็นเวลา 5 ปี',
              'ปริมาณรังสีที่ทำให้ประชากรเสียชีวิต 5 คนจาก 500 คน',
            ],
            correctOptionIndex: 0,
            explanation:
              'TD 5/5 (Tolerance Dose 5/5) คือปริมาณรังสีที่จะเหนี่ยวนำให้เกิดภาวะแทรกซ้อนรุนแรงในอัตราไม่เกิน 5% ของประชากรผู้รับรังสี ภายในระยะเวลาติดตามผล 5 ปี',
          },
          {
            id: 'q-organs-4',
            text: 'การแบ่งขนาดย่อยรังสี (Fractionation) อาศัยหลักการใดที่ช่วยให้เนื้อเยื่อปกติซ่อมแซมได้ดีกว่าเซลล์มะเร็ง?',
            options: [
              'Sublethal Damage Repair (SLDR) ภายใน 4-6 ชั่วโมง',
              'Oxygen depletion',
              'Accelerated cell aging',
              'Heat shock induction',
            ],
            correctOptionIndex: 0,
            explanation:
              'เซลล์ปกติมีศักยภาพในการซ่อมแซมความเสียหายระดับ Sublethal Damage (SLDR) ได้สมบูรณ์กว่าเซลล์มะเร็ง เมื่อเว้นช่วงเวลา 4-6 ชั่วโมงขึ้นไป',
          },
        ],
      },
    },
  ],
};

export default radiationEffectMajorOrgansChapter;
