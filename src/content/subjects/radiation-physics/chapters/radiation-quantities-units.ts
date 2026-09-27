import type { Chapter } from '../../../../types/content';

export const radiationQuantitiesUnitsChapter: Chapter = {
  id: 'radiation-quantities-units',
  subjectId: 'radiation-physics',
  title: 'บทที่ 1: ปริมาณและหน่วยทางรังสีวิทยา (Radiation Quantities, Units & Dosimetric Principles)',
  description:
    'สรุปเนื้อหาเชิงลึกวิชาฟิสิกส์รังสี หลักสูตรเทคโนโลยีรังสี (2568 RT): ความเป็นมาขององค์กรสากล (ICRP & ICRU), ฟิสิกส์รังสีพื้นฐาน, ปริมาณการฉายรังสีในอากาศ (Exposure X), เคอร์มา (Kerma K), ปริมาณรังสีดูดกลืน (Absorbed Dose D), ปริมาณรังสีสมมูล (Equivalent Dose H), ปริมาณรังสียังผล (Effective Dose E), ค่าน้ำหนักรังสี (wR) และค่าน้ำหนักเนื้อเยื่อ (wT) ตาม ICRP 103, ปริมาณเชิงปฏิบัติการ (Operational Quantities: H*(10), H\'(0.07), Hp(10)), ปริมาณเชิงรังสีมิติ (Radiometric Quantities: Fluence), และสัมประสิทธิ์การลดทอนเชิงมวล (Mass Attenuation & Energy Absorption Coefficients)',
  order: 1,
  estimatedReadingMinutes: 35,
  tags: [
    'ฟิสิกส์รังสี',
    'Radiation Quantities',
    'Exposure',
    'Kerma',
    'Absorbed Dose',
    'Equivalent Dose',
    'Effective Dose',
    'ICRP 103',
    'ICRU',
    'Operational Quantities',
    'wR',
    'wT',
    'f-factor',
    'Attenuation',
  ],
  objectives: [
    'อธิบายบทบาทและวิวัฒนาการของรายงานมาตรฐานจาก ICRP (Pub 26, 60, 103) และ ICRU (Report 51, 60)',
    'นิยามและคำนวณปริมาณการฉายรังสี (Exposure X) การแตกตัวเป็นไอออนในอากาศ และความสัมพันธ์ 1 R = 2.58 × 10⁻⁴ C/kg',
    'เข้าใจแนวคิดของ Kerma (K) การแบ่งเป็น Collision Kerma (Kcol) กับ Radiative Kerma (Krad) และสภาวะสมดุลของอนุภาคประจุ (CPE: D = Kcol)',
    'คำนวณปริมาณรังสีดูดกลืนในเนื้อเยื่อ (Dmed) จากค่า Exposure ผ่านตัวคูณ f-factor (Dmed = fmed · X)',
    'แยกความแตกต่างระหว่าง Absorbed Dose (Gy), Equivalent Dose (Sv), และ Effective Dose (Sv) ได้อย่างแม่นยำ',
    'จำแนกค่าน้ำหนักชนิดรังสี (wR) และค่าน้ำหนักเนื้อเยื่อ (wT) ตามเกณฑ์ ICRP Publication 103',
    'ระบุการใช้งานของปริมาณเชิงปฏิบัติการ: Ambient dose equivalent H*(10), Directional dose equivalent H\'(0.07), และ Personal dose equivalent Hp(10), Hp(0.07)',
    'วิเคราะห์สัมประสิทธิ์การลดทอนรังสี: Linear (μ), Mass Attenuation (μ/ρ), Mass Energy Transfer (μtr/ρ), และ Mass Energy Absorption (μen/ρ)',
  ],
  sections: [
    {
      id: 'sec-radlib-quantities-app',
      heading: '1. RadLibrary: คลังบทเรียนและห้องจำลองปริมาณและหน่วยทางรังสี (Interactive Suite)',
      type: 'legacy-html',
      content: {
        modulePath: '/qwen-modules/radiation-physics/radlib/index.html#rt2568',
        title: 'RadLibrary: ปริมาณและหน่วยทางรังสี (Radiation Quantities & Unit - STD 2568)',
        description:
          'ศูนย์รวมเว็บแอปพลิเคชันเพื่อการเรียนรู้: รวม 8 บทย่อย, คลังภาพสไลด์ 69 สไลด์, เครื่องคำนวณโดสสิเมทรี, แบบจำลองการลดทอนและการสลายตัว, พร้อมตารางสูตรและระบบควิซทดสอบประเมินผล',
        initialHeight: 880,
      },
    },
    {
      id: 'sec-organizations-standards',
      heading: '2. องค์กรสากลและกรอบมาตรฐานการควบคุมทางรังสี (International Organizations: ICRP & ICRU)',
      type: 'paragraph',
      content:
        'การวัดและการป้องกันอันตรายจากรังสีถูกกำกับและพัฒนาโดยองค์กรสากลสำคัญ ได้แก่:\n\n' +
        '1. ICRP (International Commission on Radiological Protection):\n' +
        '   • ก่อตั้งขึ้นตั้งแต่ ค.ศ. 1928 ในชื่อ International X-ray and Radium Protection Committee\n' +
        '   • มีหน้าที่ให้คำแนะนำเชิงนโยบายและหลักการป้องกันอันตรายจากรังสี (Radiation Protection System)\n' +
        '   • รายงานหลักหมุดสำคัญ: ICRP Publication 26 (ค.ศ. 1977), ICRP Publication 60 (ค.ศ. 1990), และฉบับปรับปรุงล่าสุด ICRP Publication 103 (ค.ศ. 2007)\n\n' +
        '2. ICRU (International Commission on Radiation Units and Measurements):\n' +
        '   • ก่อตั้งเมื่อ ค.ศ. 1925 เพื่อกำหนดนิยาม คำจำกัดความ ปริมาณ และหน่วยวัดทางรังสีวิทยาให้เป็นมาตรฐานเดียวกันทั่วโลก\n' +
        '   • รายงานสำคัญ: ICRU Report 51 (1993) และ Report 60 (1998) ซึ่งกำหนดหน่วย SI สำหรับปริมาณรังสี\n\n' +
        '3. IAEA (International Atomic Energy Agency) & UNSCEAR:\n' +
        '   • ร่วมประเมินผลกระทบด้านชีววิทยาทางรังสีและเผยแพร่มาตรฐานความปลอดภัยในระดับนานาชาติ\n\n' +
        '• ระดับรังสีพื้นหลังเฉลี่ยที่มนุษย์ได้รับ:\n' +
        '   - แหล่งกำเนิดธรรมชาติ (Natural Background): เฉลี่ยประมาณ 2.4 mSv/ปี (ก๊าซเรดอน 1.26 mSv, รังสีคอสมิก 0.39 mSv, รังสีจากพื้นพิภพ 0.48 mSv, สารรังสีในร่างกาย 0.29 mSv)\n' +
        '   - แหล่งกำเนิดที่มนุษย์สร้างขึ้น (Artificial Sources): เฉลี่ยประมาณ 0.65 mSv/ปี (หลักๆ มาจากการตรวจวินิจฉัยทางการแพทย์)',
    },
    {
      id: 'sec-exposure-concept',
      heading: '3. ปริมาณการฉายรังสีและการแตกตัวเป็นไอออนในอากาศ (Exposure: X)',
      type: 'paragraph',
      content:
        'ปริมาณการฉายรังสี (Exposure: X) เป็นปริมาณทางรังสีที่เก่าแก่ที่สุด วัดความสามารถของลำรังสีเอกซ์หรือรังสีแกมมาในการทำให้อากาศแห้งแตกตัวเป็นประจุไฟฟ้า:\n\n' +
        '• นิยามทางการ: ผลรวมของประจุไฟฟ้าชนิดเดียวกันทั้งหมด (dq) ที่เกิดจากอิเล็กตรอน (และโพซิตรอน) ที่ถูกปลดปล่อยโดยรังสีโฟตอนในมวลอากาศแห้ง dm:\n' +
        '  X = dq / dm\n\n' +
        '• เงื่อนไขสำคัญของ Exposure:\n' +
        '  1. ใช้ได้เฉพาะกับ "รังสีโฟตอน" (X-ray และ Gamma-ray) เท่านั้น ไม่ใช้กับอนุภาคมีประจุ (Alpha, Beta, Proton)\n' +
        '  2. ตัวกลางต้องเป็น "อากาศแห้ง" (Dry Air) ที่ STP (0 °C, 760 mmHg) เท่านั้น ไม่ใช้กับน้ำหรือเนื้อเยื่อ\n' +
        '  3. ใช้ได้กับพลังงานโฟตอนไม่เกิน 3 MeV เนื่องจากที่พลังงานสูงกว่านี้ อิเล็กตรอนทุติยภูมิจะเดินทางไกลเกินกว่าจะเกิดสมดุลประจุ (CPE) ในช่องตรวจวัดทั่วไป\n\n' +
        '• หน่วยของ Exposure:\n' +
        '  - หน่วย SI: คูลอมบ์ต่อกิโลกรัม (C/kg)\n' +
        '  - หน่วยดั้งเดิม: เรินต์เกน (Roentgen: R)\n' +
        '  - อัตราการแปลงหน่วย:\n' +
        '    1 R = 2.58 × 10⁻⁴ C/kg (แน่นอนตามนิยามมาตรฐานสากล)\n' +
        '    1 C/kg ≈ 3,876 R\n\n' +
        '• พลังงานเฉลี่ยในการสร้างไอออน 1 คู่ในอากาศ (W-value):\n' +
        '  ค่าเฉลี่ยพลังงานที่รังสีสูญเสียไปในการสร้างคู่ไอออน 1 คู่ในอากาศแห้ง คือ:\n' +
        '  W_air = 33.97 eV/ion pair = 33.97 J/C\n' +
        '  ค่านี้ทำให้เราสามารถเชื่อมโยงระหว่าง "ประจุที่วัดได้ (Exposure)" กับ "พลังงานที่ถูกถ่ายเทพลังงานให้แก่อากาศ (Air Kerma)" ได้อย่างแม่นยำ',
    },
    {
      id: 'sec-kerma-absorbed-dose',
      heading: '4. เคอร์มาและปริมาณรังสีดูดกลืน (Kerma vs Absorbed Dose)',
      type: 'paragraph',
      content:
        'เพื่อความแม่นยำทางฟิสิกส์ ICRU ได้จำแนกขั้นตอนการถ่ายเทพลังงานของรังสีโฟตอนออกเป็น 2 ขั้นตอนอย่างชัดเจน:\n\n' +
        '1. เคอร์มา (Kerma: Kinetic Energy Released per unit MAss):\n' +
        '   • คือ ผลรวมของพลังงานจลน์เริ่มต้นทั้งหมด (dE_tr) ที่อนุภาคไม่มีประจุ (เช่น โฟตอน) ถ่ายทอดให้อนุภาคมีประจุ (เช่น โฟโตอิเล็กตรอน, คอมป์ตันอิเล็กตรอน) ในมวล dm:\n' +
        '     K = dE_tr / dm  (หน่วย: Gray = J/kg)\n' +
        '   • Kerma ถูกแบ่งออกเป็น 2 ส่วนย่อย:\n' +
        '     K = K_col + K_rad\n' +
        '     - Collision Kerma (K_col): พลังงานจลน์ที่สูญเสียไปกับการชนและแตกตัวเป็นไอออนในตัวกลาง (Local Energy Deposition)\n' +
        '     - Radiative Kerma (K_rad): พลังงานจลน์ที่สูญเสียไปกับการแผ่รังสีเบรมส์สตราลุง (Bremsstrahlung) หลุดลอยออกจากบริเวณนั้น\n\n' +
        '2. ปริมาณรังสีดูดกลืน (Absorbed Dose: D):\n' +
        '   • คือ ปริมาณพลังงานเฉลี่ยที่ถูกดูดกลืนสะสมไว้จริง (dε̄) ในมวล dm ของตัวกลางใดๆ:\n' +
        '     D = dε̄ / dm  (หน่วย: Gray = J/kg, หน่วยเดิม: rad; 1 Gy = 100 rad = 1 J/kg)\n' +
        '   • ใช้ได้กับรังสีทุกชนิด (Photons, Electrons, Protons, Neutrons) และตัวกลางทุกชนิด (เนื้อเยื่อ, กระดูก, น้ำ, อากาศ, โลหะ)\n\n' +
        '3. สภาวะสมดุลของอนุภาคประจุ (Charged Particle Equilibrium: CPE):\n' +
        '   • ในบริเวณที่มี CPE (ประจุหลุดออกจากปริมาตรเท่ากับประจุที่วิ่งเข้ามา) จะได้ความสัมพันธ์สำคัญ:\n' +
        '     D = K_col\n' +
        '   • ในอากาศแห้งที่พลังงานต่ำกว่า 3 MeV ค่า K_rad น้อยมากจนตัดทิ้งได้ (g ≈ 0) ทำให้:\n' +
        '     D_air = K_col ≈ K_air\n' +
        '     D_air (Gy) = X (C/kg) × (W_air / e) = X (C/kg) × 33.97 J/C\n' +
        '   • เมื่อ Exposure = 1 R (2.58 × 10⁻⁴ C/kg):\n' +
        '     D_air = 2.58 × 10⁻⁴ × 33.97 = 0.008764 Gy = 0.876 rad (หรือ 8.76 mGy)',
    },
    {
      id: 'sec-f-factor-medium',
      heading: '5. การคำนวณโดสในเนื้อเยื่อและตัวคูณ f-factor (Dose to Medium: Dmed = fmed · X)',
      type: 'paragraph',
      content:
        'เมื่อต้องการทราบปริมาณรังสีดูดกลืนในเนื้อเยื่อมนุษย์หรืออวัยวะเป้าหมายจากการวัดค่า Exposure (X) ในอากาศ จะใช้ตัวแปลงที่เรียกว่า Roentgen-to-Rad Conversion Factor (f-factor):\n\n' +
        '• สูตรคำนวณ:\n' +
        '  D_med = f_med × X\n' +
        '  โดยที่ f_med = 0.876 × [(μ_en / ρ)_med / (μ_en / ρ)_air]\n\n' +
        '• พฤติกรรมของค่า f-factor ในเนื้อเยื่อต่างๆ ตามระดับพลังงาน:\n' +
        '  1. ในน้ำ (Water) และกล้ามเนื้อ (Muscle):\n' +
        '     - ค่า f-factor ค่อนข้างคงที่ใกล้เคียง 0.95–0.97 rad/R ตลอดทุกช่วงพลังงานทางการแพทย์ (โฟตอนพลังงานวินิจฉัยจนถึงพลังงานบำบัดระดับ MV)\n' +
        '  2. ในกระดูกทึบ (Compact Bone):\n' +
        '     - ที่พลังงานต่ำ (30–50 keV) เกิดอันตรกิริยา Photoelectric Effect เด่นชัด ซึ่งแปรผันตาม Z³ (Z_bone ≈ 13.8 ขณะที่ Z_air ≈ 7.6)\n' +
        '     - ส่งผลให้ค่า f-factor ของกระดูกพุ่งสูงขึ้นถึง 3.5–4.4 rad/R! กระดูกจึงดูดกลืนรังสีมากกว่าเนื้อเยื่ออ่อนหลายเท่า\n' +
        '     - ที่พลังงานสูง (Compton Scattering เด่น, เช่น 1–2 MeV) ค่า f-factor ของกระดูกจะลดลงมาใกล้เคียงกับกล้ามเนื้อ (ประมาณ 0.92 rad/R)',
    },
    {
      id: 'sec-equivalent-dose',
      heading: '6. ปริมาณรังสีสมมูลและค่าน้ำหนักชนิดรังสี (Equivalent Dose: H & Radiation Weighting Factor wR)',
      type: 'paragraph',
      content:
        'เนื่องจากรังสีแต่ละชนิดมีประสิทธิภาพในการทำลายชีวภาพ (Relative Biological Effectiveness: RBE) ไม่เท่ากัน แม้จะมีปริมาณรังสีดูดกลืน (Gy) เท่ากัน รังสีที่มีความหนาแน่นการแตกตัวเป็นไอออนสูง (High LET) ย่อมสร้างความเสียหายต่อ DNA รุนแรงกว่า\n\n' +
        '• นิยาม Equivalent Dose (H_T):\n' +
        '  H_T = ∑ [w_R × D_T,R]\n' +
        '  หน่วย SI: ซีเวิร์ต (Sievert: Sv = J/kg), หน่วยดั้งเดิม: rem (1 Sv = 100 rem)\n\n' +
        '• ค่าน้ำหนักชนิดรังสี (Radiation Weighting Factors: w_R) ตาม ICRP Publication 103:\n' +
        '  - รังสีโฟตอนทุกพลังงาน (X-rays, Gamma rays): w_R = 1\n' +
        '  - อิเล็กตรอนและมิวออนทุกพลังงาน (Electrons, Positrons, Muons): w_R = 1\n' +
        '  - โปรตอนและพิออนมีประจุ (Protons & Charged Pions): w_R = 2\n' +
        '  - อนุภาคแอลฟา ชิ้นส่วนฟิชชัน และไอออนหนัก (Alpha particles, Fission fragments, Heavy nuclei): w_R = 20\n' +
        '  - นิวตรอน (Neutrons): เป็นฟังก์ชันต่อเนื่องตามพลังงานจลน์ (Continuous curve) โดยมีค่าสูงสุด w_R ≈ 20 ในช่วงพลังงานประมาณ 1 MeV (เพราะเป็นช่วงที่เกิดการชนยืดหยุ่นกับไฮโดรเจนในเซลล์ได้รุนแรงที่สุด) และลดลงเหลือ w_R = 2.5–5 ในช่วงนิวตรอนความร้อนและพลังงานสูงมาก',
    },
    {
      id: 'sec-effective-dose',
      heading: '7. ปริมาณรังสียังผลและความเสี่ยงทางพันธุกรรมและมะเร็ง (Effective Dose: E & Tissue Weighting Factor wT)',
      type: 'paragraph',
      content:
        'อวัยวะและเนื้อเยื่อแต่ละชนิดในร่างกายมนุษย์มีความไวต่อรังสี (Radiosensitivity) และโอกาสในการเกิดมะเร็งหรือผลทางพันธุกรรมระยะยาว (Stochastic Effects) แตกต่างกัน ICRP จึงกำหนดปริมาณรังสียังผล (Effective Dose: E) ขึ้นมาเพื่อใช้ประเมินความเสี่ยงรวมของทั้งร่างกาย (Whole-body Detriment):\n\n' +
        '• สูตรคำนวณ:\n' +
        '  E = ∑ [w_T × H_T]  (หน่วย: Sievert: Sv)\n' +
        '  โดยที่ผลรวมของค่าน้ำหนักเนื้อเยื่อทั้งหมดต้องเท่ากับ 1.00 เสมอ (∑ w_T = 1.00)\n\n' +
        '• ค่าน้ำหนักเนื้อเยื่อ (Tissue Weighting Factors: w_T) ตาม ICRP Publication 103 (2007):\n' +
        '  - กลุ่มไวต่อรังสีสูงสุด (w_T = 0.12 แต่ละอวัยวะ, รวม 0.72):\n' +
        '    ไขกระดูกแดง (Red Bone Marrow), ลำไส้ใหญ่ (Colon), ปอด (Lung), กระเพาะอาหาร (Stomach), เต้านม (Breast), และเนื้อเยื่อส่วนที่เหลือ (Remainder Tissues - 14 อวัยวะ)\n' +
        '  - กลุ่มต่อมสืบพันธุ์ (w_T = 0.08):\n' +
        '    ต่อมสืบพันธุ์ อัณฑะ/รังไข่ (Gonads - ปรับลดจากเดิม 0.20 ใน ICRP 60 เนื่องจากข้อมูลพันธุศาสตร์มนุษย์พบความเสี่ยงถ่ายทอดต่ำกว่าที่เคยคาดไว้)\n' +
        '  - กลุ่มความไวปานกลาง (w_T = 0.04 แต่ละอวัยวะ, รวม 0.16):\n' +
        '    กระเพาะปัสสาวะ (Bladder), หลอดอาหาร (Esophagus), ตับ (Liver), ต่อมไทรอยด์ (Thyroid)\n' +
        '  - กลุ่มความไวต่ำ (w_T = 0.01 แต่ละอวัยวะ, รวม 0.04):\n' +
        '    ผิวผิวกระดูก (Bone Surface), สมอง (Brain), ต่อมน้ำลาย (Salivary Glands), ผิวหนัง (Skin)',
    },
    {
      id: 'sec-operational-quantities',
      heading: '8. ปริมาณเชิงปฏิบัติการสำหรับการเฝ้าระวังทางรังสี (Operational Quantities for Radiation Protection)',
      type: 'paragraph',
      content:
        'เนื่องจากปริมาณรังสีสมมูลในอวัยวะ (H_T) และปริมาณรังสียังผล (E) ไม่สามารถวัดได้โดยตรงจากร่างกายมนุษย์ในทางปฏิบัติ ICRU จึงกำหนด ปริมาณเชิงปฏิบัติการ (Operational Quantities) ที่วัดได้จริงด้วยเครื่องมือวัดรังสี (Survey Meter และ Personnel Dosimeter):\n\n' +
        '1. การเฝ้าระวังพื้นที่ (Area Monitoring):\n' +
        '   • Ambient Dose Equivalent H*(d):\n' +
        '     - ใช้สำหรับรังสีทะลุทะลวงสูง (Strongly Penetrating Radiation เช่น X-ray, Gamma)\n' +
        '     - วัดที่ความลึกมาตรฐาน d = 10 mm ในทรงกลมจำลองเนื้อเยื่อ ICRU Sphere (ขนาด 30 cm) สัญลักษณ์คือ H*(10)\n' +
        '   • Directional Dose Equivalent H\'(d, Ω):\n' +
        '     - ใช้สำหรับรังสีทะลุทะลวงต่ำ (Weakly Penetrating Radiation เช่น Beta, Low-energy X-ray)\n' +
        '     - วัดที่ความลึก d = 0.07 mm สำหรับผิวหนัง สัญลักษณ์คือ H\'(0.07, Ω)\n\n' +
        '2. การเฝ้าระวังบุคคล (Individual / Personnel Monitoring):\n' +
        '   • Personal Dose Equivalent H_p(d):\n' +
        '     - วัดด้วยอุปกรณ์วัดรังสีติดตัวบุคคล (TLD Badge, OSLD, Pocket Dosimeter) ที่สวมบนร่างกาย:\n' +
        '     - H_p(10): ปริมาณรังสีที่ความลึก 10 mm (Deep Dose) ใช้เป็นตัวแทนประเมิน Effective Dose (E)\n' +
        '     - H_p(3): ปริมาณรังสีที่ความลึก 3 mm ใช้ประเมินปริมาณรังสีต่อเลนส์ตา (Eye Lens)\n' +
        '     - H_p(0.07): ปริมาณรังสีที่ความลึก 0.07 mm (Shallow Dose) ใช้ประเมินรังสีต่อผิวหนังและมือ/เท้า (Extremities)',
    },
    {
      id: 'sec-radiometric-coefficients',
      heading: '9. ปริมาณเชิงรังสีมิติและสัมประสิทธิ์การลดทอน (Radiometric Quantities & Attenuation Coefficients)',
      type: 'paragraph',
      content:
        'การทำความเข้าใจพฤติกรรมของลำรังสีต้องพิจารณาความหนาแน่นของอนุภาคและการสูญเสียพลังงานผ่านตัวกลาง:\n\n' +
        '1. ปริมาณเชิงรังสีมิติ (Radiometric Quantities):\n' +
        '   • Particle Fluence (Φ):\n' +
        '     Φ = dN / da  (จำนวนอนุภาคที่ตัดผ่านพื้นที่ทรงกลม da, หน่วย: m⁻² หรือ cm⁻²)\n' +
        '   • Energy Fluence (Ψ):\n' +
        '     Ψ = dR / da = Φ × E  (พลังงานรังสีทั้งหมดที่ตัดผ่านพื้นที่ da, หน่วย: J/m²)\n' +
        '   • Fluence Rate / Flux (φ):\n' +
        '     φ = dΦ / dt  (หน่วย: m⁻² · s⁻¹)\n\n' +
        '2. สัมประสิทธิ์การอันตรกิริยาและการลดทอน (Interaction & Attenuation Coefficients):\n' +
        '   • Linear Attenuation Coefficient (μ, cm⁻¹):\n' +
        '     - สัดส่วนการลดทอนของจำนวนโฟตอนต่อหนึ่งหน่วยความหนาตัวกลาง: I(x) = I₀ e⁻⁽μˣ⁾\n' +
        '     - ค่า Half-Value Layer (HVL): ความหนาตัวกลางที่ลดความเข้มลงเหลือครึ่งหนึ่ง: HVL = ln 2 / μ = 0.693 / μ\n' +
        '   • Mass Attenuation Coefficient (μ/ρ, cm²/g):\n' +
        '     - กำจัดผลของความหนาแน่นตัวกลาง ทำให้เปรียบเทียบสารต่างสถานะกันได้โดยตรง\n' +
        '     - μ/ρ = (τ/ρ) [Photoelectric] + (σ_c/ρ) [Compton] + (κ/ρ) [Pair Production]\n' +
        '   • Mass Energy Transfer Coefficient (μ_tr/ρ, cm²/g):\n' +
        '     - อัตราส่วนพลังงานที่โฟตอนเปลี่ยนเป็นพลังงานจลน์เริ่มต้นของอิเล็กตรอน (Kerma): K = Ψ × (μ_tr / ρ)\n' +
        '   • Mass Energy Absorption Coefficient (μ_en/ρ, cm²/g):\n' +
        '     - อัตราส่วนพลังงานที่ถูกดูดกลืนสะสมไว้ในตัวกลางจริง (หักพลังงาน Bremsstrahlung ออก):\n' +
        '     - μ_en / ρ = (μ_tr / ρ) × (1 - g)\n' +
        '     - ภายใต้สภาวะ CPE: D = Ψ × (μ_en / ρ)',
    },
    {
      id: 'sec-summary-table-quantities',
      heading: '10. ตารางสรุปเปรียบเทียบปริมาณ หน่วยวัด และความสัมพันธ์ทางรังสีวิทยา',
      type: 'table',
      content: {
        headers: ['ปริมาณ (Quantity)', 'สัญลักษณ์', 'นิยามทางคณิตศาสตร์', 'หน่วย SI', 'หน่วยดั้งเดิม (Conventional)', 'ความสัมพันธ์เทียบเท่า'],
        rows: [
          ['Exposure', 'X', 'X = dq / dm', 'C/kg', 'Roentgen (R)', '1 R = 2.58 × 10⁻⁴ C/kg'],
          ['Kerma', 'K', 'K = dE_tr / dm', 'Gray (Gy = J/kg)', 'rad', '1 Gy = 100 rad (K = K_col + K_rad)'],
          ['Absorbed Dose', 'D', 'D = dε̄ / dm', 'Gray (Gy = J/kg)', 'rad', '1 Gy = 100 rad (D = K_col เมื่อมี CPE)'],
          ['Equivalent Dose', 'H_T', 'H = ∑ w_R · D_T,R', 'Sievert (Sv = J/kg)', 'rem', '1 Sv = 100 rem (คำนึงถึงชนิดรังสี)'],
          ['Effective Dose', 'E', 'E = ∑ w_T · H_T', 'Sievert (Sv = J/kg)', 'rem', '1 Sv = 100 rem (คำนึงถึงความไวเนื้อเยื่อ)'],
          ['Activity', 'A', 'A = λN = -dN/dt', 'Becquerel (Bq = s⁻¹)', 'Curie (Ci)', '1 Ci = 3.7 × 10¹⁰ Bq = 37 GBq'],
          ['Ambient Dose Eq.', 'H*(10)', 'ICRU sphere ที่ลึก 10 mm', 'Sievert (Sv)', 'rem', 'ใช้ตรวจวัดพื้นที่ ลำรังสีทะลุทะลวงสูง'],
          ['Personal Dose Eq.', 'H_p(10)', 'เนื้อเยื่อบุคคลที่ลึก 10 mm', 'Sievert (Sv)', 'rem', 'ใช้ติดป้ายวัดรังสีประจำตัวบุคคล'],
        ],
      },
    },
    {
      id: 'sec-dosimetry-quiz',
      heading: '11. ข้อสอบประเมินความเข้าใจและโจทย์คำนวณปริมาณรังสี (Clinical Dosimetry Quiz)',
      type: 'quiz',
      content: {
        questions: [
          {
            id: 'q-quant-1',
            question: 'ปริมาณรังสีใดต่อไปนี้ ใช้ได้เฉพาะกับรังสีโฟตอน (X-ray, Gamma) ในตัวกลางอากาศแห้งเท่านั้น และจำกัดพลังงานไม่เกิน 3 MeV?',
            options: [
              'Absorbed Dose (D)',
              'Exposure (X)',
              'Equivalent Dose (H)',
              'Kerma (K)',
            ],
            correctAnswer: 1,
            explanation:
              'Exposure (X) มีข้อกำหนดเข้มงวด 3 ข้อ: 1) ใช้ได้เฉพาะโฟตอน 2) ตัวกลางต้องเป็นอากาศแห้งที่ STP 3) พลังงานไม่เกิน 3 MeV เพื่อรักษาสภาวะ Electronic Equilibrium',
          },
          {
            id: 'q-quant-2',
            question: 'ภายใต้สภาวะสมดุลของอนุภาคประจุ (Charged Particle Equilibrium: CPE) ปริมาณรังสีดูดกลืน (D) จะมีค่าเท่ากับค่าใด?',
            options: [
              'Total Kerma (K)',
              'Collision Kerma (K_col)',
              'Radiative Kerma (K_rad)',
              'Exposure (X)',
            ],
            correctAnswer: 1,
            explanation:
              'เมื่อมี CPE พลังงานจลน์ของอิเล็กตรอนที่สูญเสียไปกับการชนในพื้นที่ (Collision Kerma) จะเท่ากับปริมาณพลังงานที่ถูกดูดกลืนสะสมไว้จริงในมวลนั้นพอดี ดังนั้น D = K_col',
          },
          {
            id: 'q-quant-3',
            question: 'ตามเกณฑ์ ICRP Publication 103 (2007) อนุภาคแอลฟา (Alpha particle) มีค่าน้ำหนักชนิดรังสี (w_R) เท่าใด?',
            options: ['1', '2', '5', '20'],
            correctAnswer: 3,
            explanation:
              'อนุภาคแอลฟา ชิ้นส่วนฟิชชัน และไอออนหนักจัดเป็น High LET radiation ที่มีการแตกตัวเป็นไอออนหนาแน่นมาก มีค่า w_R = 20',
          },
          {
            id: 'q-quant-4',
            question: 'เจ้าหน้าที่รังสีเทคนิคได้รับปริมาณรังสีดูดกลืนต่อต่อมไทรอยด์ (w_T = 0.04) จากรังสีเอกซ์ (w_R = 1) เท่ากับ 5 mGy และได้รับรังสีต่อปอด (w_T = 0.12) เท่ากับ 10 mGy ปริมาณรังสียังผลรวม (Effective Dose) คือเท่าใด?',
            options: [
              '0.20 mSv',
              '1.20 mSv',
              '1.40 mSv',
              '15.0 mSv',
            ],
            correctAnswer: 2,
            explanation:
              'H_ไทรอยด์ = 5 mGy × 1 = 5 mSv → E_ไทรอยด์ = 0.04 × 5 = 0.20 mSv\nH_ปอด = 10 mGy × 1 = 10 mSv → E_ปอด = 0.12 × 10 = 1.20 mSv\nผลรวม Effective Dose = 0.20 + 1.20 = 1.40 mSv',
          },
        ],
      },
    },
  ],
};

export default radiationQuantitiesUnitsChapter;
