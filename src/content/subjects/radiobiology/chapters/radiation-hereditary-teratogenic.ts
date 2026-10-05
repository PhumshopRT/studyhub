import type { Chapter } from '../../../../types/content';

export const radiationHereditaryTeratogenicChapter: Chapter = {
  id: 'radiation-hereditary-teratogenic',
  subjectId: 'radiobiology',
  title: 'ผลทางพันธุกรรมและความพิการของทารกในครรภ์จากรังสี (Hereditary & Teratogenic Effects of Radiation)',
  order: 3,
  estimatedReadingMinutes: 40,
  description:
    'ศึกษาผลกระทบทางพันธุกรรม (Hereditary / Genetic Effects) และความผิดปกติแต่กำเนิดของทารกในครรภ์ (Teratogenic / Fetal Effects): การเปรียบเทียบ Stochastic vs Deterministic, กฎ 10 วัน (10-Day Rule), ความไวต่อรังสีของอวัยวะสืบพันธุ์เพศชายและเพศหญิง, การกลายพันธุ์และค่าโดสเพิ่มเท่าตัว (Doubling Dose ~1 Sv), ปริมาณรังสีที่มีนัยสำคัญทางพันธุกรรม (GSD), ผลของรังสีต่อทารกในแต่ละอายุครรภ์ (Pre-implantation, Organogenesis, Fetal Period: ภาวะปัญญาอ่อนและศีรษะเล็ก Microcephaly), เกณฑ์ความปลอดภัย NCRP และข้อบ่งชี้การยุติการตั้งครรภ์ (Cutoff 100 mSv) ตลอดจนกลไกการเกิดต้อกระจกจากรังสี (Radiation-Induced Cataractogenesis)',
  tags: [
    'Radiobiology',
    'Hereditary Effects',
    'Teratogenic Effects',
    'Stochastic vs Deterministic',
    'Doubling Dose',
    'GSD',
    '10-Day Rule',
    'Microcephaly',
    'Mental Retardation',
    'Organogenesis',
    'Cataractogenesis',
    'NCRP 184',
  ],
  simulationIds: ['realistic-radiobiology-3d'],
  objectives: [
    'จำแนกลักษณะความแตกต่างระหว่างผลทางพันธุกรรม (Hereditary Effect - Stochastic) และความพิการของทารก (Teratogenic Effect - Deterministic & Secondary Cancer)',
    'เข้าใจกฎ 10 วัน (10-Day Rule) และเกณฑ์การตรวจทางรังสีวิทยาในสตรีวัยเจริญพันธุ์',
    'ระบุขีดเริ่มความเป็นหมัน (Sterility Thresholds) ชั่วคราวและถาวรในอัณฑะและรังไข่ พร้อมอธิบายสาเหตุที่เพศชายไวต่อรังสีมากกว่าเพศหญิง',
    'อธิบายหลักการกลายพันธุ์จากรังสี: รังสีไม่สร้างยีนกลายพันธุ์ชนิดใหม่ แต่เพิ่มอัตรา Spontaneous Mutation และส่วนใหญ่เป็นยีนด้อย (Recessive)',
    'คำนวณและเข้าใจความหมายของ Doubling Dose (~1 Sv หรือ ~156 rem) และ Genetically Significant Dose (GSD)',
    'วิเคราะห์ผลกระทบของรังสีต่อตัวอ่อนและทารกใน 4 ระยะอายุครรภ์: Pre-implantation (All or None), Implantation, Organogenesis (ความพิการเชิงโครงสร้าง), และ Fetal Stage (Microcephaly และ Mental Retardation)',
    'ระบุช่วงอายุครรภ์ที่ไวที่สุดและเซลล์เป้าหมายของภาวะปัญญาอ่อน (8–15 สัปดาห์: Neurons) และภาวะศีรษะเล็ก (<8 สัปดาห์: Glial cells)',
    'จดจำเกณฑ์รังสี NCRP สำหรับสตรีมีครรภ์ (รวมตลอดครรภ์ ≤ 500 mRem และรายเดือน ≤ 50 mRem) และเกณฑ์พิจารณายุติการตั้งครรภ์ (100 mSv / 0.1 Gy)',
    'อธิบายพยาธิสรีรวิทยาของการเกิดต้อกระจกจากรังสี (Equatorial Lens Epithelial Damage → Posterior Subcapsular Cataract: PSC) และเปรียบเทียบกับต้อกระจกตามวัย',
  ],
  sections: [
    {
      id: 'sec-radbio-hereditary-qwen-app',
      heading: '1. คลังความรู้และห้องจำลองพันธุกรรมและทารกในครรภ์ (RadBio Study Hub: Hereditary & Teratogenic Interactive Suite)',
      type: 'legacy-html',
      content: {
        modulePath: '/qwen-modules/radiobiology/hereditary-teratogenic/index.html#overview',
        title: 'RadBio Study Hub: Hereditary, Teratogenic & Cataract Interactive Suite',
        description:
          'โมดูลเว็บแอปพลิเคชันแบบโต้ตอบ: ประกอบด้วยเครื่องจำลองขนาดยารังสีต่ออายุครรภ์ (Embryo/Fetal Gestation Simulator), การทดลองวิเคราะห์พันธุศาสตร์และตารางพุนเนตต์ (Punnett Square & Doubling Dose), แผนภูมิเปรียบเทียบความไวของโกนาดชาย-หญิง, กลไกต้อกระจกเลนส์ตา (PSC Cataract) และคลังข้อสอบวัดผล 20 ข้อ',
        initialHeight: 920,
      },
    },
    {
      id: 'sec-radbio-3d-fetal-teratogenesis',
      heading: '2. ห้องปฏิบัติการจำลอง 3 มิติ: 3D Fetal Teratogenesis & Ocular Lens Studio',
      type: 'simulation',
      content: {
        simulationId: 'realistic-radiobiology-3d',
        title: 'แบบจำลอง 3 มิติ: การเจริญของตัวอ่อนมนุษย์, ท่อประสาทและการย้ายที่ของนิวรอน, กายวิภาคเลนส์ตาและการเกิดต้อกระจก',
      },
    },
    {
      id: 'sec-radbio-hereditary-vs-teratogenic-comparison',
      heading: '3. การเปรียบเทียบหัวใจสำคัญ: ผลทางพันธุกรรม (Hereditary) vs ความพิการของทารก (Teratogenic)',
      type: 'paragraph',
      content:
        'ในทางรังสีชีววิทยา ผลกระทบต่อลูกหลานแบ่งออกเป็น 2 ประเภทใหญ่ที่มีธรรมชาติทางฟิสิกส์และชีววิทยาแตกต่างกันอย่างสิ้นเชิง:\n\n' +
        '| มิติการเปรียบเทียบ | ผลทางพันธุกรรม (Hereditary Effect) | ผลต่อทารกในครรภ์ (Teratogenic Effect) |\n' +
        '| :--- | :--- | :--- |\n' +
        '| **ธรรมชาติของผล (Nature)** | **Stochastic effect** (ผลแบบสุ่ม เกิดตามความน่าจะเป็น) | **Deterministic effect** (ความพิการ/ตาย) + Stochastic (มะเร็งในวัยเด็ก) |\n' +
        '| **ขีดเริ่มของโดส (Threshold)** | **ไม่มีขีดเริ่ม (No Threshold)** | **มีขีดเริ่มชัดเจน (Threshold)** ในความพิการทางกายภาพ |\n' +
        '| **ระดับโดสที่ศึกษา** | โดสต่ำ (Low Dose Effect) | โดสต่ำถึงปานกลาง (Low to Medium Dose) |\n' +
        '| **สาเหตุระดับเซลล์** | รังสีเหนี่ยวนำให้เกิด **DNA Mutation** ในเซลล์สืบพันธุ์ | **Cell Death** (เซลล์ตัวอ่อนตาย) หรือรบกวน Cell Migration |\n' +
        '| **ตำแหน่งที่ได้รับรังสี** | โกนาด (Gonads: อัณฑะในเพศชาย หรือ รังไข่ในเพศหญิง) **ก่อนการปฏิสนธิ** | มดลูกและตัวอ่อน (Uterus & Conceptus) **ขณะกำลังตั้งครรภ์** |\n' +
        '| **ผู้แสดงอาการ** | ลูกหลานรุ่นถัดไป (Offspring รุ่น F1, F2...) | ทารกที่คลอดออกมาจากการตั้งครรภ์รอบนั้น |\n\n' +
        '> **กฎ 10 วัน (10-Day Rule):**\n' +
        '> การตรวจทางรังสีบริเวณช่องท้องและเชิงกรานของสตรีวัยเจริญพันธุ์ ควรทำภายใน **10 วันแรกนับจากวันแรกของการมีประจำเดือน (Onset of Menses)** เนื่องจากเป็นช่วงก่อนการตกไข่ (Pre-ovulatory phase) ช่วยลดโอกาสฉายรังสีใส่ตัวอ่อนที่อาจปฏิสนธิโดยไม่รู้ตัว',
    },
    {
      id: 'sec-radbio-gonad-sensitivity-sterility',
      heading: '4. ผลทางรังสีชีววิทยาต่ออวัยวะสืบพันธุ์ (Radiobiology in Gonads & Sterility Thresholds)',
      type: 'paragraph',
      content:
        'อวัยวะสืบพันธุ์ (Gonads) มีการตอบสนองต่อรังสี 2 รูปแบบ:\n\n' +
        '### 1. Lethal Effect (ภาวะเป็นหมัน / Sterility)\n' +
        '- **เพศชาย (Male):** \n' +
        '  - เซลล์ที่มีการแบ่งตัวสูงที่สุดคือ **Spermatogonia** ไวต่อรังสีสูงมาก (Spermatogonia $\\gg$ Spermatocyte, Spermatid, Sperm)\n' +
        '  - ขีดเริ่มภาวะเป็นหมันชั่วคราว (**Temporary Sterility**): **0.15 Sv (150 mSv)**\n' +
        '  - ขีดเริ่มภาวะเป็นหมันถาวร (**Permanent Sterility**): **3.5–6.0 Sv**\n' +
        '- **เพศหญิง (Female):**\n' +
        '  - เซลล์ไข่เกือบเจริญเต็มที่ไวต่อรังสีมากกว่าเซลล์ไข่ตัวอ่อน (Nearly mature $>$ Immature follicles)\n' +
        '  - ขีดเริ่มภาวะเป็นหมันถาวร (**Permanent Sterility**): **2.5–6.0 Sv**\n' +
        '- **ทำไมเพศชายจึงไวต่อการเป็นหมันชั่วคราวมากกว่าเพศหญิง?**\n' +
        '  เนื่องจากอัณฑะมีเซลล์ต้นกำเนิด Spermatogonia ที่ต้องแบ่งตัวแบบ Mitosis ต่อเนื่องตลอดชีวิต เมื่อถูกรังสีเพียงเล็กน้อย (0.15 Sv) เซลล์จะหยุดการแบ่งตัว ส่งผลให้อสุจิขาดแคลนใน 6–8 สัปดาห์ถัดมา ขณะที่เพศหญิงมีจำนวนเซลล์ไข่คงที่ตั้งแต่กำเนิดและอยู่ในระยะพัก\n\n' +
        '### 2. Mutagenic Effect (การกลายพันธุ์ทางพันธุกรรม)\n' +
        '- ในเพศชาย: เซลล์ตัวอ่อนต้นกำเนิด Spermatogonia สามารถซ่อมแซมและกำจัดเซลล์กลายพันธุ์ได้ดีกว่าเซลล์ระยะท้าย ดังนั้น **Spermatogonia $\\ll$ Spermatocyte, Spermatid, Sperm** จึงแนะนำให้เว้นการมีบุตรอย่างน้อย 2–3 เดือนหลังได้รับรังสีเพื่อให้เซลล์อสุจิที่ถูกฉายรังสีในระยะแก่ถูกหลั่งทิ้งไปก่อน\n' +
        '- ในเพศหญิง: เซลล์ไข่ระยะแก่ (Mature/Nearly mature) ไวต่อมิวเทชันมากกว่าเซลล์ไข่ระยะอ่อน',
    },
    {
      id: 'sec-radbio-genetic-mutations-doubling-dose',
      heading: '5. หลักพันธุศาสตร์ของรังสีและค่าโดสเพิ่มเท่าตัว (Genetics, Doubling Dose & GSD)',
      type: 'paragraph',
      content:
        'จากการศึกษาทางระบาดวิทยาในผู้รอดชีวิตจากระเบิดปรมาณูฮิโรชิมะ-นางาซากิ และการทดลองในสัตว์ มีข้อสรุปสำคัญ 4 ประการ:\n\n' +
        '1. **รังสีไม่สร้างชนิดของมิวเทชันใหม่ (Do not induce new type of mutation):** ความผิดปกติที่พบจากรังสีเป็นชนิดเดียวกับที่พบได้ตามธรรมชาติ\n' +
        '2. **รังสีเพิ่มอัตราการเกิดมิวเทชันตามธรรมชาติ (Increase rate of spontaneous mutation)**\n' +
        '3. **มิวเทชันส่วนใหญ่เป็นยีนด้อย (Recessive Mutation):** ต้องได้รับยีนผิดปกติจากทั้งพ่อและแม่จึงจะแสดงอาการในรุ่นถัดไป ยกเว้นมิวเทชันบนโครโมโซม X (X-linked)\n' +
        '4. **ยีนมนุษย์ไม่ได้ไวต่อรังสีมากอย่างที่เคยคาดไว้ (Not extremely sensitive):** เพราะค่า Doubling Dose มีค่าค่อนข้างสูง\n\n' +
        '### ดัชนีควบคุมผลกระทบทางพันธุกรรม\n' +
        '- **Doubling Dose (โดสเพิ่มเท่าตัว):** ปริมาณรังสีที่ทำให้เกิดอัตราการกลายพันธุ์เพิ่มขึ้นเป็น **2 เท่า** ของอัตราที่เกิดขึ้นตามธรรมชาติ ในมนุษย์มีค่าประมาณ **~1 Sv (~100 rem)** (ข้อมูลฮิโรชิมะ-นางาซากิเฉลี่ยประมาณ **156 rem = 1.56 Sv**)\n' +
        '- **Genetically Significant Dose (GSD):** ปริมาณรังสีสะสมเฉลี่ยที่โกนาดของประชากรในวัยเจริญพันธุ์ได้รับ ซึ่งมีผลต่อพันธุกรรมของประชากรโดยรวม\n' +
        '  - แหล่งรังสีธรรมชาติที่ให้ค่า GSD สูงสุด: **ก๊าซเรดอน (Radon) ~200 mRem/ปี**\n' +
        '  - แหล่งรังสีที่มนุษย์สร้างขึ้นที่ให้ค่า GSD สูงสุด: **การถ่ายภาพรังสีทางการแพทย์และทันตกรรม (Medical & Dental X-rays) ~90 mRem/ปี**',
    },
    {
      id: 'sec-radbio-embryo-fetal-gestational-stages',
      heading: '6. ผลของรังสีต่อตัวอ่อนและทารกในแต่ละช่วงอายุครรภ์ (Radiation Effects across Gestational Stages)',
      type: 'paragraph',
      content:
        'ผลของรังสีต่อทารกในครรภ์ขึ้นอยู่กับ **อายุครรภ์ขณะได้รับรังสี (Gestational Age)** อย่างยิ่งยวด:\n\n' +
        '### 1. ระยะก่อนการฝังตัว (Pre-implantation: 0–7 วันแรกหลังปฏิสนธิ)\n' +
        '- ตัวอ่อนยังเป็นกลุ่มเซลล์แบบ Omnipotent/Totipotent ที่ยังไม่แยกอวัยวะ\n' +
        '- ผลสำคัญ: **All-or-None Phenomenon (ตายหรือไม่ก็รอดสมบูรณ์)**\n' +
        '- หากได้รับรังสีเกิน **0.1 Sv (100 mSv)** ตัวอ่อนมักเสียชีวิตก่อนฝังตัว (Prenatal Death) หากรอดชีวิต เซลล์ที่เหลือสามารถแบ่งตัวทดแทนและเติบโตได้ตามปกติโดยแทบไม่พบความพิการแต่กำเนิด\n\n' +
        '### 2. ระยะฝังตัว (Implantation: 8–14 วัน / สัปดาห์ที่ 2)\n' +
        '- ตัวอ่อนฝังตัวในเยื่อบุโพรงมดลูก ทนต่อการเสียชีวิตก่อนคลอดได้ดีขึ้น (Threshold: **0.1–0.25 Sv**)\n' +
        '- ความไวต่อการเกิดความพิการเชิงโครงสร้างยังค่อนข้างต่ำ\n\n' +
        '### 3. ระยะการสร้างอวัยวะ (Major Organogenesis: วันที่ 15–56 หรือ สัปดาห์ที่ 2–8)\n' +
        '- **เป็นช่วงที่ไวต่อการเกิดความพิการเชิงโครงสร้างแต่กำเนิดมากที่สุด (Most Sensitive to Congenital Malformations)**\n' +
        '- ขีดเริ่มของความพิการ: **0.25 Sv (250 mSv)**\n' +
        '- ความผิดปกติเด่น: ระบบโครงกระดูก (แขนขาผิดรูป แขนขากุด Cleft palate, Club feet), ตา (ไม่มีลูกตา Microphthalmia), และการเจริญเติบโตช้าชั่วคราว (Temporary growth retardation)\n\n' +
        '### 4. ระยะทารกในครรภ์ (Fetal Period: สัปดาห์ที่ 8 ถึงคลอด)\n' +
        '- อวัยวะสำคัญสร้างรูปร่างแล้ว แต่ระบบประสาทยังพัฒนาเข้มข้น\n' +
        '- **ภาวะปัญญาอ่อน (Mental Retardation):**\n' +
        '  - ไวที่สุดในช่วง: **สัปดาห์ที่ 8–15** (ขยายถึงสัปดาห์ที่ 16–25)\n' +
        '  - เซลล์เป้าหมาย: **นิวรอน (Neurons)**\n' +
        '  - กลไก: รังสีขัดขวางการแบ่งตัว และทำลายกระบวนการเคลื่อนย้ายเซลล์ประสาท (**Disrupted Neuronal Migration**) ไปยังเปลือกสมองส่วนหน้า (Cerebral Cortex)\n' +
        '  - ขีดเริ่ม (Threshold): **0.12–0.2 Gy**\n' +
        '  - ข้อสังเกต: หลังสัปดาห์ที่ 25 โอกาสเกิดภาวะปัญญาอ่อนจะลดลงถึง 4 เท่า\n' +
        '- **ภาวะศีรษะเล็ก (Microcephaly):**\n' +
        '  - ไวที่สุดในช่วง: **ก่อนสัปดาห์ที่ 8**\n' +
        '  - เซลล์เป้าหมาย: **เซลล์เกลีย (Glial Cells)**\n' +
        '  - ขีดเริ่ม (Threshold): **0.1–0.19 Gy**',
    },
    {
      id: 'sec-radbio-clinical-dose-limits-abortion',
      heading: '7. เกณฑ์ความปลอดภัยทางรังสีในหญิงตั้งครรภ์และการพิจารณายุติการตั้งครรภ์ (NCRP Limits & Therapeutic Abortion)',
      type: 'paragraph',
      content:
        'ข้อกำหนดตามมาตรฐานสากล (NCRP Report No. 184 / ICRP):\n\n' +
        '1. **เกณฑ์จำกัดปริมาณรังสีสำหรับทารกในครรภ์ของผู้ปฏิบัติงานรังสี (NCRP Occupational Limit):**\n' +
        '   - ตลอดการตั้งครรภ์: **ไม่เกิน 500 mRem (5 mSv หรือ 0.5 rem)**\n' +
        '   - ในแต่ละเดือน: **ไม่เกิน 50 mRem (0.5 mSv)**\n\n' +
        '2. **เกณฑ์การประเมินความเสี่ยงต่อทารกในเวชปฏิบัติ (Fetal Dose Risk Assessment):**\n' +
        '   - โดสต่อทารก $< 0.05\\text{ Sv (50 mSv)}$: ความเสี่ยงต่ำมากจนแทบไม่มีนัยสำคัญ (Negligible risk)\n' +
        '   - โดสต่อทารก $> 0.15\\text{ Sv (150 mSv)}$: ความเสี่ยงต่อความผิดปกติเพิ่มขึ้นอย่างมีนัยสำคัญ (Significant risk)\n\n' +
        '3. **จุดตัดสำหรับการพิจารณายุติการตั้งครรภ์เพื่อการรักษา (Cutoff point for Therapeutic Abortion):**\n' +
        '   - **0.1 Gy (10 rad หรือ 100 mSv)** ต่อตัวอ่อน/ทารก ในช่วงอายุครรภ์ที่มีความไวสูง (10 วัน ถึง 26 สัปดาห์)\n\n' +
        '4. **ข้อถกเถียงเรื่องการใช้แผ่นกำบังรังสี (Patient Fetal & Gonadal Shielding):**\n' +
        '   - งานวิจัยยุคใหม่ (เช่น James G. Mainprize 2023 และคำแนะนำ AAPM/NCRP) ระบุว่า **Internal Scatter Radiation** ภายในร่างกายผู้ป่วยไม่สามารถลดลงได้ด้วยการวางแผ่นตะกั่วภายนอก และแผ่นตะกั่วอาจรบกวนระบบควบคุมปริมาณรังสีอัตโนมัติ (AEC) ของเครื่องเอกซเรย์ ทำให้เครื่องเพิ่มปริมาณรังสีขึ้นโดยไม่จำเป็น จึงมีแนวทางยกเลิกการวางแผ่นตะกั่วบังหน้าท้องในหลายสถาบัน',
    },
    {
      id: 'sec-radbio-ocular-cataractogenesis',
      heading: '8. ผลระยะยาวต่อดวงตา: การเกิดต้อกระจกจากรังสี (Radiation-Induced Cataractogenesis)',
      type: 'paragraph',
      content:
        'เลนส์ตา (Crystalline Lens) เป็นหนึ่งในเนื้อเยื่อที่มีความไวต่อรังสีสูงในกลุ่ม Deterministic Effects:\n\n' +
        '### 1. กายวิภาคและลักษณะเฉพาะของเลนส์ตา\n' +
        '- เซลล์ที่มีการแบ่งตัวจำกัดอยู่เฉพาะบริเวณ **เส้นศูนย์สูตรของเยื่อบุผิว (Equatorial Region of Epithelium)**\n' +
        '- **ไม่มีหลอดเลือดมาเลี้ยง (Avascular)** และ **ไม่มีกลไกกำจัดเซลล์ที่ตายแล้ว (No cell removal mechanism)**\n' +
        '- ประกอบด้วย 2 ชนิดเซลล์หลัก: Epithelial Cells และ Lens Fiber Cells\n\n' +
        '### 2. กลไกการเกิดต้อกระจกจากรังสี\n' +
        '1. เซลล์ที่กำลังแบ่งตัวบริเวณเส้นศูนย์สูตรได้รับความเสียหายทางดีเอ็นเอจากรังสี\n' +
        '2. เซลล์ที่เสียหายเจริญไปเป็นเส้นใยเลนส์ที่ผิดปกติ (Abnormal Lens Fibers)\n' +
        '3. เส้นใยที่ผิดปกติไม่ถูกกำจัด แต่จะเคลื่อนย้ายไปยังขั้วด้านหลังของเลนส์ (Posterior Pole)\n' +
        '4. เกิดความขุ่นขาวขึ้นเนื่องจากเส้นใยสูญเสียความโปร่งแสง กลายเป็น **Posterior Subcapsular Cataract (PSC)**\n\n' +
        '### 3. ตารางเปรียบเทียบ: ต้อกระจกตามวัย vs ต้อกระจกจากรังสี\n\n' +
        '| มิติ | ต้อกระจกตามวัย (Age-related Cataract) | ต้อกระจกจากรังสี (Radiation-induced Cataract) |\n' +
        '| :--- | :--- | :--- |\n' +
        '| **สาเหตุ** | ความชราตามธรรมชาติ และออกซิเดชันเรื้อรัง | รังสีทำลาย DNA ของเซลล์เยื่อบุผิวบริเวณศูนย์สูตรโดยตรง |\n' +
        '| **ตำแหน่งในเลนส์** | **Nuclear Sclerosis** (แกนกลาง) หรือ Cortical (ขอบนอก) | **Posterior Subcapsular Cataract (PSC)** ด้านหลังเลนส์ |\n' +
        '| **การดำเนินของโรค** | ค่อยเป็นค่อยไป ใช้เวลานับสิบปี (มักพบหลังอายุ 60 ปี) | **พัฒนาเร็วกว่า** และลุกลามเร็วกว่าอย่างชัดเจน |\n' +
        '| **ขีดเริ่ม (Threshold)** | ไม่มีขีดเริ่มเฉพาะ | **0.5–2.0 Gy** (ICRP แนะนำขีดจำกัดเลนส์ตา 20 mSv/ปี) |\n' +
        '| **การรักษา** | ผ่าตัดเปลี่ยนเลนส์ตาเทียม (IOL) | ผ่าตัดเปลี่ยนเลนส์ตาเทียม (IOL) |',
    },
    {
      id: 'sec-radbio-hereditary-summary-clinical-pearls',
      heading: '9. สรุปความจำขั้นสูงสำหรับสอบใบประกอบวิชาชีพ (High-Yield Board Pearls)',
      type: 'paragraph',
      content:
        '🔥 **High-Yield Checklist ที่ต้องจำให้ขึ้นใจก่อนเข้าห้องสอบ:**\n\n' +
        '1. **Hereditary** = Stochastic, No threshold, Low dose, Gonads, DNA mutation, Abnormal offspring\n' +
        '2. **Teratogenic** = Deterministic (malformation) + Stochastic (childhood leukemia), Uterus during pregnancy\n' +
        '3. **10-Day Rule** = ทำการตรวจใน 10 วันแรกของรอบประจำเดือน\n' +
        '4. **หมันชาย** = ชั่วคราว 0.15 Sv, ถาวร 3.5–6 Sv | **หมันหญิง** = ถาวร 2.5–6 Sv\n' +
        '5. **Doubling Dose** = ~1 Sv (~156 rem ในข้อมูลฮิโรชิมะ)\n' +
        '6. **Pre-implantation (0–7 วัน)** = All or None, Threshold 0.1 Sv\n' +
        '7. **Organogenesis (2–8 สัปดาห์)** = ไวต่อความพิการทางกายภาพมากที่สุด, Threshold 0.25 Sv\n' +
        '8. **Fetal Period (8–15 สัปดาห์)** = ไวต่อปัญญาอ่อน (Neurons / Migration cortex), Threshold 0.12–0.2 Gy\n' +
        '9. **Microcephaly (<8 สัปดาห์)** = เซลล์เกลีย (Glial cells), Threshold 0.1–0.19 Gy\n' +
        '10. **NCRP ตั้งครรภ์** = ทั้งหมด $\\le 500\\text{ mRem}$, แต่ละเดือน $\\le 50\\text{ mRem}$\n' +
        '11. **Therapeutic Abortion Cutoff** = $100\\text{ mSv}$ ($0.1\\text{ Gy}$ หรือ $10\\text{ rad}$)\n' +
        '12. **ต้อกระจกรังสี** = Posterior Subcapsular (PSC), เกิดที่ Equatorial epithelium, ขีดเริ่ม 0.5–2 Gy',
    },
  ],
};

export default radiationHereditaryTeratogenicChapter;
