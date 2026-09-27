import type { Chapter } from '../../../../types/content';

export const radiologyImagingSuiteChapter: Chapter = {
  id: 'radiology-imaging-suite',
  subjectId: 'radiology',
  title: 'บทที่ 12: ปฏิบัติการจำลองเครื่องตรวจรังสีวินิจฉัย 3 มิติ และสถานีงานวิเคราะห์ภาพ (3D CT Gantry & Advanced Workstation Suite)',
  description:
    'ห้องปฏิบัติการจำลองเสมือนจริง: สำรวจโครงสร้างภายในเครื่องเอกซเรย์คอมพิวเตอร์ (CT Scanner Gantry) แบบ 3 มิติเชิงโต้ตอบ (Interactive 3D Procedural Model), การหมุนด้วยเทคโนโลยี Slip-Ring, การเปล่งรังสี Bremsstrahlung จาก Tungsten Target, การคำนวณปริมาณรังสี CTDIvol และ DLP, ควบคู่กับสถานีงานอ่านผลวินิจฉัยรังสีแพทย์ (Diagnostic Workstation), การปรับค่า Window Width / Window Level (WW/WL) ในหน่วย Hounsfield Units (HU), และการสร้างภาพ 3D MPR / Volume Rendering',
  order: 4,
  estimatedReadingMinutes: 35,
  tags: [
    'เทคโนโลยีรังสี',
    '3D Simulator',
    'CT Scanner Gantry',
    'Slip Ring',
    'CTDIvol',
    'DLP',
    'Hounsfield Units',
    'Windowing',
    'MPR',
    'ALARA',
    'Dosimetry',
  ],
  simulationIds: ['realistic-radiology-3d'],
  objectives: [
    'ทดลองหมุนและควบคุมแบบจำลอง 3 มิติของ CT Scanner Gantry สำรวจหลอดเอกซเรย์ โครงสร้าง Anode ตัวตรวจวัดรังสี Detector Arc และระบบเลเซอร์ระบุตำแหน่ง',
    'อธิบายหลักการกำเนิดรังสีเอกซ์ (Bremsstrahlung และ Characteristic Radiation) และความสัมพันธ์ระหว่างค่า kVp, mAs ต่อคุณภาพและปริมาณรังสี',
    'คำนวณและแปลความหมายของค่าดัชนีปริมาณรังสีใน CT ได้แก่ CTDIvol (mGy), Dose Length Product (DLP, mGy·cm) และ Effective Dose (mSv)',
    'จำแนกค่าความหนาแน่นรังสีในหน่วย Hounsfield Units (HU) ของเนื้อเยื่อมนุษย์ตั้งแต่ อากาศ (-1000 HU), ไขมัน, น้ำ (0 HU), เลือดออกเฉียบพลัน, เนื้อเยื่ออ่อน จนถึง กระดูกทึบ (+1000 HU)',
    'ประยุกต์ใช้เทคนิค Windowing (Window Width / Window Level) ให้เหมาะสมกับอวัยวะเป้าหมาย (Bone, Lung, Brain, Soft Tissue Windows)',
    'เข้าใจกระบวนการประมวลผลภาพขั้นสูงใน Diagnostic Workstation เช่น Multi-Planar Reconstruction (MPR), Maximum Intensity Projection (MIP), และ 3D Volume Rendering',
  ],
  sections: [
    {
      id: 'sec-3d-ct-sim',
      heading: '1. ปฏิบัติการจำลอง 3 มิติ: CT Scanner Gantry และลำแสงเอกซเรย์แบบโต้ตอบ (Interactive 3D CT Simulator)',
      type: 'simulation',
      content: {
        simulationId: 'realistic-radiology-3d',
        title: 'แบบจำลอง 3D CT Scanner Gantry & Live Dosimetry HUD',
        description:
          'ทดลองปรับค่าพลังงานหลอด (kVp), กระแสหลอด (mAs), ความเร็วรอบการหมุน (Gantry RPM), และเปิด-ปิดลำแสงเอกซเรย์พัด (Fan Beam) พร้อมสังเกตการคำนวณค่ารังสี CTDIvol และ DLP แบบเรียลไทม์',
      },
    },
    {
      id: 'sec-radlearn-full-suite',
      heading: '2. ศูนย์การเรียนรู้ระบบสารสนเทศรังสีวิทยาฉบับเต็ม (RadLearn Interactive Web Suite)',
      type: 'legacy-html',
      content: {
        modulePath: '/qwen-modules/radiology/radlearn/index.html',
        title: 'RadLearn · RIS & DICOM · Risk Scoring Matrix · PACS Architecture (Interactive App)',
        description:
          'แอปพลิเคชันการเรียนรู้รังสีวิทยาเต็มรูปแบบ: เมทริกซ์ความเสี่ยง 5x5 โต้ตอบได้, ตารางวิเคราะห์ 10 กรณีศึกษา, เครื่องสร้างใบส่งงานพิมพ์ PDF / ดาวน์โหลด Markdown, ระบบจำลองกลยุทธ์จัดหา PACS, พีระมิดจัดเก็บข้อมูล 3 Tiers, แฟลชการ์ด และแบบทดสอบครบวงจร',
        initialHeight: 960,
      },
    },
    {
      id: 'sec-ct-gantry-physics',
      heading: '3. กายวิภาคของเครื่อง CT Scanner และฟิสิกส์การกำเนิดรังสี (Gantry Anatomy & Radiation Physics)',
      type: 'paragraph',
      content:
        'เครื่องเอกซเรย์คอมพิวเตอร์ (Computed Tomography - CT) ประกอบด้วยส่วนประกอบหลักที่ติดตั้งอยู่ภายในโครงสร้างวงแหวนหมุน (Rotating Gantry) ดังนี้:\n\n' +
        '1. Slip-Ring Technology: วงแหวนตัวนำไฟฟ้าไร้สายพันรอบตัวแกน ช่วยจ่ายกระแสไฟฟ้าแรงสูงและส่งข้อมูลภาพดิจิทัลความเร็วสูง (Optical Data Transmission) จากแกนที่กำลังหมุนต่อเนื่องด้วยความเร็ว 0.25–0.5 วินาทีต่อรอบ โดยสายไฟไม่พันกัน ทำให้สามารถสแกนแบบเกลียวคลื่นต่อเนื่อง (Helical/Spiral CT) ได้อย่างมีประสิทธิภาพ\n\n' +
        '2. X-ray Tube & Tungsten Anode:\n' +
        '   - อิเล็กตรอนถูกเร่งจาก Cathode ชนเข้ากับเป้า Tungsten-Rhenium Anode ที่กำลังหมุนระบายความร้อนด้วยความเร็วสูงถึง 10,000 RPM\n' +
        '   - พลังงานจลน์กว่า 99% กลายเป็นความร้อน มีเพียง ~1% เท่านั้นที่กลายเป็นรังสีเอกซ์\n' +
        '   - รังสีที่เกิดขึ้นประกอบด้วย Bremsstrahlung Radiation (รังสีต่อเนื่องจากการเบี่ยงเบนของอิเล็กตรอนใกล้ประจุบวกของนิวเคลียส) และ Characteristic Radiation (รังสีเฉพาะพลังงานจากการกระโดดของอิเล็กตรอนวง K-shell ของทังสเตนที่ ~58–69 keV)\n\n' +
        '3. Bowtie Filter & Pre-patient Collimator: แผ่นกรองรูปโบว์ไทช่วยลดปริมาณรังสีที่ขอบข้างของร่างกายผู้ป่วยซึ่งมีความหนาน้อยกว่าส่วนกลาง ทำให้ได้ลำแสงที่สม่ำเสมอยิ่งขึ้น พร้อมตัวจำกัดลำแสง (Collimator) ปรับขนาดความกว้างของลำแสงพัด (Fan Beam Cone) ให้พอดีกับจำนวนแถวของตัวตรวจวัด\n\n' +
        '4. Multi-slice Curved Detector Arc: แถวของตัวตรวจวัดรังสีชนิด Solid-state Scintillator (เช่น Gadolinium Oxysulfide - GOS) จัดเรียงเป็นแนวโค้งรอบจุดกำเนิด เพื่อแปลงโฟตอนรังสีเอกซ์เป็นแสงวาบ แล้วแปลงเป็นสัญญาณไฟฟ้าส่งเข้า Analog-to-Digital Converter (ADC) ส่งต่อไปยัง Reconstruction Computer',
    },
    {
      id: 'sec-dosimetry-ctdi',
      heading: '4. มาตรวิทยารังสีและการควบคุมปริมาณรังสี (CT Dosimetry: CTDIvol, DLP, and DRL)',
      type: 'paragraph',
      content:
        'ในการตรวจเอกซเรย์คอมพิวเตอร์ การควบคุมปริมาณรังสีตามหลัก ALARA (As Low As Reasonably Achievable) มีดัชนีชี้วัดมาตรฐานสากลที่นักรังสีเทคนิคและรังสีแพทย์ต้องตรวจสอบและบันทึกในระบบ RIS เสมอ:\n\n' +
        '• CTDIw (Weighted CT Dose Index):\n' +
        '  CTDIw = (1/3) × CTDI_center + (2/3) × CTDI_periphery\n' +
        '  คำนวณจากการวัดปริมาณรังสีด้วยหัววัดดินสอ (Ionization Pencil Chamber) ในหุ่นจำลองอะคริลิก (PMMA Phantom ขนาด 16 ซม. สำหรับศีรษะ และ 32 ซม. สำหรับลำตัว)\n\n' +
        '• CTDIvol (Volume CT Dose Index):\n' +
        '  CTDIvol = CTDIw / Pitch\n' +
        '  (หน่วยเป็น mGy - มิลลิเกรย์) สะท้อนถึงความเข้มข้นของปริมาณรังสีเฉลี่ยต่อหน่วยปริมาตรในบริเวณที่ถูกสแกน โดยค่า Pitch คือ อัตราส่วนการเคลื่อนที่ของเตียงต่อรอบการหมุน\n' +
        '  - Pitch = 1: ขอบลำแสงต่อกันพอดี\n' +
        '  - Pitch > 1: เตียงเคลื่อนที่เร็ว ลำแสงยืดออก ผู้ป่วยได้รับรังสีลดลง\n' +
        '  - Pitch < 1: ลำแสงเหลื่อมซ้อนกัน (Overlap) ผู้ป่วยได้รับรังสีเพิ่มขึ้น\n\n' +
        '• DLP (Dose Length Product):\n' +
        '  DLP = CTDIvol × Scan Length (L)\n' +
        '  (หน่วยเป็น mGy·cm) สะท้อนถึงปริมาณรังสีรวมทั้งหมดที่ผู้ป่วยได้รับตลอดช่วงความยาวของการสแกน\n\n' +
        '• Effective Dose (E - ปริมาณรังสียังผล):\n' +
        '  E = DLP × k\n' +
        '  (หน่วยเป็น mSv - มิลลิซีเวิร์ต) โดยค่า k คือ ค่าสัมประสิทธิ์การแปลงรังสีตามบริเวณอวัยวะ (เช่น ศีรษะ k ≈ 0.0021, ทรวงอก k ≈ 0.014, ช่องท้อง k ≈ 0.015 mSv·mGy⁻¹·cm⁻¹)',
    },
    {
      id: 'sec-windowing-hounsfield-scale',
      heading: '5. สเกลความหนาแน่น Hounsfield Units (HU) และการปรับแต่ง Window Width / Window Level',
      type: 'table',
      content: {
        headers: ['โครงสร้าง / เนื้อเยื่อในร่างกาย', 'ค่า CT Number เฉลี่ย (HU)', 'การแสดงผลในหน้าต่างดูภาพ', 'การตั้งค่า Window Width (WW) / Window Level (WL)'],
        rows: [
          ['อากาศ (Air)', '-1,000 HU', 'ดำสนิท (ต่ำสุดของสเกล)', 'Lung Window: WW 1,500 / WL -600'],
          ['ปอด (Lung Parenchyma)', '-600 ถึง -500 HU', 'เทาเข้มเกือบดำ เห็นหลอดเลือดฝอยเป็นจุดขาว', 'Lung Window: WW 1,500 / WL -600'],
          ['ไขมัน (Adipose Tissue / Fat)', '-100 ถึง -50 HU', 'เทาเข้มชัดเจน แยกจากกล้ามเนื้อได้ดี', 'Soft Tissue Window: WW 350 / WL 40'],
          ['น้ำบริสุทธิ์ (Pure Water)', '0 HU (จุดอ้างอิงมาตรฐาน)', 'เทากลาง เป็นเกณฑ์ทดสอบเครื่องประจำวัน', 'Soft Tissue Window: WW 350 / WL 40'],
          ['เนื้อเยื่ออ่อน / กล้ามเนื้อ (Muscle & Organs)', '+30 ถึง +50 HU', 'เทากลาง แยกตับ ม้าม กล้ามเนื้อ', 'Soft Tissue Window: WW 350 / WL 40'],
          ['เลือดออกเฉียบพลัน (Acute Hemorrhage)', '+60 ถึง +80 HU', 'ขาวสว่างกว่าเนื้อสมอง แยกก้อนเลือดคั่งได้', 'Brain Window: WW 80 / WL 40 หรือ Blood Window: WW 150 / WL 75'],
          ['เนื้อสมองสีเทา / ขาว (Brain Gray/White Matter)', '+32 ถึง +42 HU', 'เทาตัดกันเล็กน้อย ความเปรียบต่างต่ำ', 'Brain Window แคบมาก: WW 80 / WL 35'],
          ['กระดูกทึบ / สารทึบรังสี (Dense Cortical Bone / Contrast)', '+700 ถึง +3,000 HU', 'ขาวจ้ามาก หากตั้งหน้าต่างปกติจะบังรายละเอียด', 'Bone Window: WW 2,000 / WL 400'],
        ],
      },
    },
    {
      id: 'sec-post-processing-techniques',
      heading: '6. เทคโนโลยีการสร้างและประมวลผลภาพ 3 มิติ (Advanced 3D Post-Processing Modalities)',
      type: 'key-points',
      content: {
        title: 'เครื่องมือและอัลกอริทึมการประมวลผลภาพ 3 มิติบน Diagnostic Workstation',
        points: [
          'Multi-Planar Reconstruction (MPR): การนำข้อมูลก้อนโวลุ่ม 3 มิติ (Isotropic Voxels) มาตัดระนาบใหม่ตามแนวแกนอื่น ได้แก่ Axial (แกนขวาง), Coronal (แกนหน้า-หลัง), Sagittal (แกนซ้าย-ขวา) หรือระนาบเฉียงโค้งตามแนวหลอดเลือด (Curved MPR)',
          'Maximum Intensity Projection (MIP): คัดเลือกเฉพาะพิกเซลที่มีค่าความสว่างสูงสุดตลอดแนวยิงลำรังสีเสมือน เหมาะอย่างยิ่งสำหรับการตรวจหลอดเลือด (CT Angiography - CTA) เพื่อดูการตีบตันหรือโป่งพองของหลอดเลือด',
          'Minimum Intensity Projection (MinIP): คัดเลือกเฉพาะพิกเซลที่มีค่าต่ำสุด (ดำที่สุด) นิยมใช้ในการประเมินทางเดินหายใจ (Airway evaluation), โรคถุงลมโป่งพอง (Emphysema), หรือท่อน้ำดีในตับ',
          '3D Volume Rendering Technique (VRT): เทคนิคสร้างภาพเสมือนจริง 3 มิติโดยกำหนดค่าความโปร่งใส (Opacity) และสีสัน (Color transfer function) ให้กับแต่ละช่วงค่า HU ช่วยให้ศัลยแพทย์วางแผนการผ่าตัดกระดูกหักซับซ้อนและการผ่าตัดเปลี่ยนข้อเทียมได้อย่างแม่นยำ',
        ],
      },
    },
    {
      id: 'sec-quiz-ch12',
      heading: '7. แบบทดสอบปฏิบัติการจำลองเครื่องตรวจและสถานีงานรังสี (Self-Assessment Quiz - 10 ข้อ)',
      type: 'quiz',
      content: {
        title: 'แบบทดสอบบทที่ 12: CT Gantry Physics, Dosimetry และ Diagnostic Workstation',
        description: 'เลือกคำตอบที่ถูกต้องที่สุดเพื่อทดสอบความเข้าใจระบบเครื่อง CT Scanner, การคำนวณปริมาณรังสี, และการปรับหน้าต่างภาพ (Windowing)',
        questions: [
          {
            id: 'q12-1',
            question: 'เทคโนโลยีใดที่ติดตั้งใน CT Gantry สมัยใหม่ที่ช่วยให้วงแหวนหมุนต่อเนื่องได้โดยไม่ต้องหยุดหมุนกลับและสายไฟไม่พันกัน?',
            options: ['Hydraulic Cable Winder', 'Slip-Ring Technology', 'Direct Battery Drive', 'Wireless Induction Coil'],
            correctAnswerIndex: 1,
            explanation: 'Slip-Ring Technology ใช้แปรงถ่านสัมผัสกับวงแหวนทองเหลืองนำไฟฟ้า ทำให้สามารถส่งพลังงานและข้อมูลภาพขณะที่ Gantry หมุนต่อเนื่องได้อย่างราบรื่น',
          },
          {
            id: 'q12-2',
            question: 'พลังงานจลน์ของอิเล็กตรอนที่พุ่งชนเป้าทังสเตนในหลอดเอกซเรย์ มีสัดส่วนเปลี่ยนเป็นรังสีเอกซ์ประมาณกี่เปอร์เซ็นต์?',
            options: ['ประมาณ 99%', 'ประมาณ 50%', 'ประมาณ 1% (อีก 99% กลายเป็นความร้อน)', 'ประมาณ 10%'],
            correctAnswerIndex: 2,
            explanation: 'ในหลอดเอกซเรย์ พลังงานกว่า 99% เปลี่ยนเป็นความร้อนที่ต้องระบายออก และมีเพียง ~1% เท่านั้นที่เกิดปฏิกิริยากลายเป็นรังสีเอกซ์',
          },
          {
            id: 'q12-3',
            question: 'รังสีเอกซ์ชนิดใดที่เกิดขึ้นจากการที่อิเล็กตรอนวิ่งเข้าใกล้นิวเคลียสของอะตอมทังสเตนแล้วสูญเสียความเร็วและเบี่ยงเบนทิศทาง?',
            options: ['Characteristic Radiation', 'Bremsstrahlung (Braking Radiation)', 'Photoelectric Effect', 'Compton Scatter'],
            correctAnswerIndex: 1,
            explanation: 'Bremsstrahlung หรือ Braking Radiation (รังสีเบรมส์) เกิดจากการหน่วงความเร็วของอิเล็กตรอนเมื่อเข้าใกล้นิวเคลียส ทำให้ปล่อยโฟตอนรังสีออกมาเป็นสเปกตรัมต่อเนื่อง',
          },
          {
            id: 'q12-4',
            question: 'การตั้งค่า Pitch ในการสแกนแบบเกลียวคลื่น (Helical CT) มีค่าเท่ากับ 1.5 หมายความว่าอย่างไรต่อปริมาณรังสีที่ผู้ป่วยได้รับเมื่อเทียบกับ Pitch = 1.0?',
            options: [
              'ผู้ป่วยได้รับปริมาณรังสีเพิ่มขึ้น 50%',
              'ผู้ป่วยได้รับปริมาณรังสีลดลง เนื่องจากเตียงเคลื่อนที่เร็วขึ้นและลำแสงไม่ซ้อนทับกัน',
              'ปริมาณรังสีเท่าเดิมไม่มีการเปลี่ยนแปลง',
              'เครื่องจะไม่ปล่อยรังสีออกมา',
            ],
            correctAnswerIndex: 1,
            explanation: 'Pitch = ระยะทางเตียงต่อรอบ / ความกว้างลำแสง เมื่อ Pitch > 1 เตียงจะเคลื่อนที่เร็วขึ้น ทำให้เวลาที่เนื้อเยื่อโดนรังสีสั้นลง ปริมาณรังสี (CTDIvol) จึงลดลง',
          },
          {
            id: 'q12-5',
            question: 'สูตรการคำนวณค่า Dose Length Product (DLP) ในการตรวจเอกซเรย์คอมพิวเตอร์คือข้อใด?',
            options: ['DLP = CTDIvol × Scan Length (L)', 'DLP = CTDIvol / Scan Length (L)', 'DLP = CTDIw + Pitch', 'DLP = kVp × mAs'],
            correctAnswerIndex: 0,
            explanation: 'DLP = CTDIvol × ความยาวของการสแกน (Scan Length หน่วยเป็น cm) มีหน่วยเป็น mGy·cm',
          },
          {
            id: 'q12-6',
            question: 'ค่าความหนาแน่นรังสีในหน่วย Hounsfield Unit (HU) ของน้ำบริสุทธิ์และอากาศมีค่าเท่าใดตามลำดับ?',
            options: ['น้ำ = +100 HU / อากาศ = 0 HU', 'น้ำ = 0 HU / อากาศ = -1,000 HU', 'น้ำ = 0 HU / อากาศ = +1,000 HU', 'น้ำ = -100 HU / อากาศ = -500 HU'],
            correctAnswerIndex: 1,
            explanation: 'ตามนิยามสเกล Hounsfield: น้ำบริสุทธิ์ถูกกำหนดให้มีค่าเท่ากับ 0 HU และอากาศมีค่าเท่ากับ -1,000 HU',
          },
          {
            id: 'q12-7',
            question: 'เลือดออกเฉียบพลันในกะโหลกศีรษะ (Acute Intracranial Hemorrhage) จะมีค่าความหนาแน่นประมาณกี่ HU บนภาพ CT Brain?',
            options: ['-50 ถึง 0 HU', '+10 ถึง +20 HU', '+60 ถึง +80 HU (สว่างกว่าเนื้อสมองปกติ)', '+500 ถึง +1,000 HU'],
            correctAnswerIndex: 2,
            explanation: 'ก้อนเลือดที่ออกเฉียบพลันมีฮีโมโกลบินเข้มข้น ทำให้มีค่า CT Number สูงประมาณ +60 ถึง +80 HU ปรากฏเป็นหย่อมสีขาวเด่นชัดเมื่อเทียบกับเนื้อสมองปกติ (+30 ถึง +40 HU)',
          },
          {
            id: 'q12-8',
            question: 'หากรังสีแพทย์ต้องการตรวจหาจุดเลือดออกเล็กๆ หรือรอยขาดเลือดในเนื้อสมอง ควรเลือกใช้หน้าต่างภาพ (Window) แบบใด?',
            options: [
              'Bone Window (WW 2000 / WL 400)',
              'Brain Window ที่มีหน้าต่างแคบ (Narrow Window เช่น WW 80 / WL 35)',
              'Lung Window (WW 1500 / WL -600)',
              'Abdomen Window (WW 400 / WL 50)',
            ],
            correctAnswerIndex: 1,
            explanation: 'เนื้อสมองสีเทาและสีขาวมีความหนาแน่นต่างกันเพียงไม่กี่ HU จึงจำเป็นต้องบีบหน้าต่างความกว้าง (Window Width) ให้แคบมาก (~80 HU) เพื่อเพิ่ม Contrast Resolution',
          },
          {
            id: 'q12-9',
            question: 'เทคนิคการประมวลผลภาพ 3 มิติชนิดใดที่เหมาะที่สุดสำหรับการแสดงภาพทางเดินหลอดเลือดที่ฉีดสารทึบ (CT Angiography)?',
            options: [
              'Minimum Intensity Projection (MinIP)',
              'Maximum Intensity Projection (MIP)',
              'Virtual Colonoscopy Filter',
              'Single Slice Filter',
            ],
            correctAnswerIndex: 1,
            explanation: 'MIP จะเลือกเฉพาะพิกเซลที่มีค่าความสว่างสูงสุดในแนวรังสี สารทึบรังสีไอโอดีนในหลอดเลือดที่มีค่า HU สูงจึงปรากฏเด่นชัดเจน เหมาะกับการดูหลอดเลือดตีบหรือโป่งพอง',
          },
          {
            id: 'q12-10',
            question: 'ข้อใดกล่าวถึงเทคนิค Multi-Planar Reconstruction (MPR) ได้ถูกต้องที่สุด?',
            options: [
              'สามารถสร้างระนาบภาพแนวตั้ง (Coronal) และแนวข้าง (Sagittal) จากชุดภาพแนวขวาง (Axial) ได้โดยไม่ต้องสแกนผู้ป่วยซ้ำ',
              'ต้องฉีดสีผู้ป่วยซ้ำอีก 1 รอบเพื่อสร้างภาพแนวตั้ง',
              'ใช้ได้เฉพาะกับภาพเอกซเรย์ธรรมดา 2 มิติเท่านั้น',
              'ทำให้ผู้ป่วยได้รับรังสีเพิ่มขึ้นสองเท่า',
            ],
            correctAnswerIndex: 0,
            explanation: 'MPR เป็นการตัดระนาบข้อมูลจาก Isotropic Voxel Volume เดิมในคอมพิวเตอร์ ทำให้สร้างภาพระนาบใดๆ ได้ทันทีโดยผู้ป่วยไม่ต้องถูกสแกนซ้ำหรือรับรังสีเพิ่ม',
          },
        ],
      },
    },
  ],
};

export default radiologyImagingSuiteChapter;
