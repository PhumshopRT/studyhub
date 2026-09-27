import type { Chapter } from '../../../../types/content';

export const radiologyRisDicomChapter: Chapter = {
  id: 'radiology-ris-dicom',
  subjectId: 'radiology',
  title: 'บทที่ 9: ระบบสารสนเทศรังสีวิทยาและมาตรฐานสากลภาพการแพทย์ (RIS & DICOM Architecture)',
  description:
    'สรุปเนื้อหาเชิงลึกระบบสารสนเทศรังสีวิทยา (RIS): เส้นทางการไหลของข้อมูลโรงพยาบาล, เวิร์กโฟลว์ Digital Dictation, การคำนวณและบริหารค่าดัชนีชี้วัด (KPIs: TAT & Reject Rate), ควบคู่กับมาตรฐาน DICOM ฉบับสมบูรณ์ โครงสร้างแท็ก (Group, Element), การสื่อสารเครือข่าย SCU/SCP, ลำดับชั้น 4 ระดับ (Hierarchy), บริการ C-ECHO/C-FIND/C-STORE/C-MOVE และมาตรฐานจอแสดงผล Part 14 GSDF',
  order: 1,
  estimatedReadingMinutes: 28,
  tags: [
    'เทคโนโลยีรังสี',
    'RIS',
    'DICOM',
    'Modality Worklist',
    'SCU/SCP',
    'C-FIND',
    'C-STORE',
    'C-MOVE',
    'GSDF',
    'Digital Dictation',
    'TAT',
    'Reject Analysis',
  ],
  objectives: [
    'อธิบายเส้นทางการไหลของข้อมูลการตรวจทางรังสีตั้งแต่ HIS → RIS → Modality → PACS → RIS Report ได้อย่างถูกต้อง',
    'แยกความแตกต่างระหว่างหน้าที่ของระบบ RIS (จัดการข้อความ/คิว/สถานะ) กับระบบ PACS (จัดการไฟล์ภาพดิจิทัล)',
    'เข้าใจโครงสร้างไฟล์ DICOM และความสำคัญของการรักษา Metadata ทางรังสีวิทยา (kVp, mAs, DRL)',
    'วิเคราะห์กลไกการเชื่อมต่อเครือข่าย DICOM Association และบทบาทของ SCU (Service Class User) กับ SCP (Service Class Provider)',
    'จำแนกคำสั่ง DICOM Services ที่สำคัญ: C-ECHO, C-FIND, MPPS, C-STORE และ C-MOVE พร้อมจำลองสถานการณ์ใช้งานจริง',
    'อธิบายความสำคัญของมาตรฐาน Part 14 GSDF สำหรับจอภาพวินิจฉัยทางการแพทย์ของรังสีแพทย์',
  ],
  sections: [
    {
      id: 'sec-ris-workflow',
      heading: '1. ภาพรวมสถาปัตยกรรมและกระบวนการทำงานของ RIS (Radiology Information System Workflow)',
      type: 'paragraph',
      content:
        'ระบบสารสนเทศรังสีวิทยา (RIS - Radiology Information System) คือระบบฐานข้อมูลหลักสำหรับบริหารจัดการงานเอกสาร ข้อมูลผู้ป่วย และลำดับคิวการตรวจทั้งหมดในแผนกรังสีวิทยา โดยมีเส้นทางการไหลของข้อมูลมาตรฐานเชื่อมต่อระหว่างระบบสารสนเทศโรงพยาบาล (HIS), เครื่องเอกซเรย์/สแกนเนอร์ (Modality), และระบบจัดเก็บภาพ (PACS):\n\n1. ผู้ป่วยรับการสั่งตรวจจากแพทย์ผู้รักษา ข้อมูลส่งผ่าน HL7 จากระบบ HIS เข้าสู่ RIS\n2. เจ้าหน้าที่รังสีเทคนิคตรวจสอบคิว ยืนยันสิทธิ์ ลงทะเบียนรับผู้ป่วย และจัดคิวการตรวจ (Scheduling & Worklist)\n3. ข้อมูลคำสั่งตรวจถูกส่งเข้าเครื่องตรวจ (Modality) ผ่าน DICOM Modality Worklist (DMWL) โดยไม่ต้องคีย์ชื่อ-HN ด้วยมือ\n4. เครื่องตรวจถ่ายภาพเสร็จ ส่งภาพ DICOM เข้าสู่ระบบจัดเก็บภาพ PACS ผ่านคำสั่ง C-STORE\n5. รังสีแพทย์เปิดดูภาพจาก PACS ควบคู่กับใบขอตรวจใน RIS และทำการอ่านแปลผล (Reporting)\n6. ผลการตรวจที่ได้รับการรับรองจะส่งกลับเข้า EMR/HIS เพื่อให้แพทย์เจ้าของไข้ใช้ในการวางแผนการรักษาต่อไป',
    },
    {
      id: 'sec-ris-vs-pacs-table',
      heading: '2. ตารางเปรียบเทียบความแตกต่าง: ระบบ RIS vs ระบบ PACS (System Demarcation)',
      type: 'table',
      content: {
        headers: ['เกณฑ์การเปรียบเทียบ', 'ระบบ RIS (Radiology Information System)', 'ระบบ PACS (Picture Archiving & Communication System)'],
        rows: [
          ['เป้าหมายหลัก', 'จัดการข้อความ, คิวการตรวจ, สถานะงาน, และรายงานผล', 'จัดการไฟล์ภาพทางการแพทย์ดิจิทัล และเครื่องมือวิเคราะห์ภาพ'],
          ['ชนิดข้อมูลที่จัดเก็บ', 'Text, Numbers, Timestamps, Audio dictation, Billing codes', 'Pixel data, Voxel data, 3D volume sets, DICOM Header'],
          ['มาตรฐานการสื่อสาร', 'HL7 (Health Level Seven) และ DICOM Modality Worklist', 'DICOM Network Protocol (Part 4, 7, 8) และ DICOMweb'],
          ['ผู้ใช้งานหลัก', 'เจ้าหน้าที่เวชระเบียน, นักรังสีเทคนิค, รังสีแพทย์, การเงิน', 'รังสีแพทย์, แพทย์เฉพาะทาง, นักรังสีเทคนิค, ศัลยแพทย์'],
          ['สถานการณ์เมื่อระบบล่ม', 'ต้องใช้สมุดลงทะเบียนมือ เสี่ยงต่อการคีย์ HN/ชื่อผิดพลาดอย่างรุนแรง', 'ถ่ายภาพได้แต่ส่งเก็บไม่ได้ ต้องบันทึกภาพค้างใน Local Hard Drive ของเครื่องตรวจ'],
        ],
      },
    },
    {
      id: 'sec-speech-dictation',
      heading: '3. ระบบบันทึกเสียงอ่านผลและการถอดความดิจิทัล (Digital Dictation & Speech Recognition)',
      type: 'key-points',
      content: {
        title: 'ประเด็นสำคัญของระบบ Digital Dictation ทางรังสีวิทยา',
        points: [
          'โหมดการบันทึกเสียง: ระบบเสียงระดับมืออาชีพจะใช้โหมด "Insert" (แทรกเสียง) เป็นค่าเริ่มต้น เพื่อป้องกันไม่ให้คำพูดถูกอัดทับจนข้อมูลสูญหาย (ห้ามใช้ Overwrite ในงานการแพทย์โดยไม่มีการยืนยัน)',
          'รูปแบบและการบีบอัดไฟล์เสียง: ไฟล์เสียงดิบ (Uncompressed PCM/WAV) มีขนาด ~5MB ต่อรายงาน สามารถบีบอัดด้วยตัวแปลงสัญญาณ Opus หรือ MP3 ให้เหลือเพียง 0.35–1.2 MB เพื่อประหยัดพื้นที่จัดเก็บและแบนด์วิดท์เครือข่าย',
          'ตัวปรับแต่งคุณภาพสัญญาณเสียง (3-Band Equalizer): มีการกรองย่านความถี่ต่ำ (<200Hz) และย่านความถี่สูง (>4000Hz) เพื่อตัดเสียงรบกวนของเครื่องปรับอากาศและเสียงพัดลมในห้องอ่านผล ช่วยเพิ่มความแม่นยำของ AI Speech-to-Text',
          'ข้อกำหนดทางกฎหมายเวชระเบียน: ต้องจัดเก็บไฟล์เสียงต้นฉบับของผู้ตรวจไว้อย่างน้อยตามระยะเวลาที่กฎหมายเวชระเบียนกำหนด เพื่อเป็นหลักฐานตรวจสอบย้อนกลับ (Audit trail) กรณีมีข้อพิพาททางการแพทย์',
        ],
      },
    },
    {
      id: 'sec-kpi-dashboard',
      heading: '4. ตัวชี้วัดประสิทธิภาพแผนกรังสีวิทยา (Radiology Key Performance Indicators - KPIs)',
      type: 'paragraph',
      content:
        'ระบบ RIS มีหน้าที่รวบรวมเวลา Time-stamps ในแต่ละขั้นตอน เพื่อประมวลผลเป็นแดชบอร์ดบริหารจัดการแผนก โดยมีตัวชี้วัดสำคัญ 5 ประการ:\n\n• Turnaround Time (TAT): ระยะเวลาตั้งแต่ผู้ป่วยลงทะเบียนจนถึงเวลาที่รังสีแพทย์เซ็นอนุมัติผลอ่าน (แบ่งเป็น Routine < 24 ชม., Urgent < 2 ชม., และ Stat/Emergency < 30 นาที)\n• Reject Rate (อัตราการถ่ายภาพซ้ำ): อัตราส่วนของภาพที่ถูกปฏิเสธและต้องถ่ายใหม่ เทียบกับภาพทั้งหมด โดยเกณฑ์มาตรฐานของกรมวิทยาศาสตร์การแพทย์ต้องไม่เกิน 5–8%\n• Modality Utilization Rate: สัดส่วนเวลาการใช้งานเครื่องตรวจต่อชั่วโมงทำการ เพื่อประเมินความคุ้มค่าและลดคอขวด\n• No-show Rate: สัดส่วนผู้ป่วยที่ไม่มาตามนัดหมาย ช่วยในการวางแผนคิวล่วงหน้าแบบ Over-booking อย่างเหมาะสม\n• Exam Counting Methodology: การนับสถิติทางรังสีวิทยาต้องแยกให้ชัดเจนระหว่าง "จำนวนผู้ป่วย (Cases)", "จำนวนครั้งการตรวจ (Exams)", "จำนวนท่า (Projections)", และ "จำนวนภาพ/ชิ้นตัด (Images/Slices)" เพื่อความถูกต้องทางบัญชีและการบริหารกำลังคน',
    },
    {
      id: 'sec-dicom-origin-standards',
      heading: '5. กำเนิดและพัฒนาการของมาตรฐาน DICOM (DICOM History & Architecture)',
      type: 'callout',
      content: {
        type: 'info',
        title: 'ความเป็นมาของมาตรฐาน DICOM (Digital Imaging and Communications in Medicine)',
        message:
          'มาตรฐาน DICOM ก่อตั้งขึ้นโดยความร่วมมือระหว่าง American College of Radiology (ACR) และ National Electrical Manufacturers Association (NEMA) เริ่มต้นในปี 1983:\n\n• ปี 1985: ออกมาตรฐาน ACR-NEMA Version 1.0 (เชื่อมต่อผ่านสายสัญญาณเฉพาะทาง 50-pin point-to-point cable)\n• ปี 1988: ออกมาตรฐาน ACR-NEMA Version 2.0 (ปรับปรุงการจัดหมวดหมู่ข้อมูล)\n• ปี 1993: จุดเปลี่ยนสำคัญที่สุด! มีการเปิดตัว **DICOM Version 3.0** ซึ่งย้ายการสื่อสารทั้งหมดขึ้นสู่เครือข่ายอินเทอร์เน็ต TCP/IP ทำให้เครื่องตรวจต่างยี่ห้อสามารถแลกเปลี่ยนภาพผ่านเครือข่ายแลนโรงพยาบาลได้โดยตรง\n\n💡 หมายเหตุทางวิชาการ: ปัจจุบันมาตรฐานสากลยังคงใช้ชื่อเวอร์ชัน 3.0 อยู่ โดยใช้วิธีการปรับปรุงเอกสารและเพิ่มส่วนประกอบใหม่ (Supplements) อย่างสม่ำเสมอในแต่ละปี',
      },
    },
    {
      id: 'sec-dicom-file-network',
      heading: '6. ลักษณะคู่ขนานของ DICOM: รูปแบบไฟล์ และ โพรโทคอลเครือข่าย (Dual Nature of DICOM)',
      type: 'key-points',
      content: {
        title: 'DICOM เป็นทั้งไฟล์ภาพและภาษาเครือข่าย',
        points: [
          'DICOM File Format (.dcm): ไม่ใช่เพียงแค่ไฟล์ภาพเหมือน JPEG ทั่วไป แต่ประกอบด้วย Preamble 128 ไบต์ + อักษรระบุตัวตน "DICM" 4 ไบต์ + ข้อมูลกำกับภาพ (Metadata Header) และ ข้อมูลจุดภาพ (Pixel Data) รวมอยู่ในไฟล์เดียวกันอย่างแยกไม่ออก',
          'ห้ามแปลงไฟล์เป็น JPEG ธรรมดาในงานเวชระเบียน: เนื่องจากการแปลงเป็นภาพธรรมดาจะทำให้ข้อมูลสำคัญ เช่น ค่ารังสี (kVp, mAs), ปริมาณรังสีดูดกลืน (CTDIvol/DLP), ค่าพิกัดกายวิภาค 3 มิติ และข้อมูลการปรับ Window/Level (W/L) สูญหายไปอย่างถาวร',
          'DICOM Network Protocol: กำหนดกฎระเบียบการแลกเปลี่ยนข้อมูลผ่านพอร์ตเครือข่าย TCP/IP (เช่น พอร์ตมาตรฐาน 104 หรือ 11112) โดยใช้โครงสร้างคำสั่งสากล',
        ],
      },
    },
    {
      id: 'sec-dicom-tags',
      heading: '7. โครงสร้างแท็กและลำดับชั้นของข้อมูล DICOM (DICOM Tags & 4-Tier Hierarchy)',
      type: 'paragraph',
      content:
        'ข้อมูลทุกชิ้นในส่วนหัว (Header) ของไฟล์ DICOM จะถูกจัดเก็บในรูปของคู่ตัวเลขเลขฐานสิบหก (Hexadecimal) เรียกว่า Tag คือ (Group Number, Element Number) โดย Group เลขคู่เป็นมาตรฐานสากล และ Group เลขคี่เป็น Private Tags ของผู้ผลิตเครื่องตรวจ:\n\n• (0010,0010) Patient\'s Name: ชื่อ-นามสกุลของผู้ป่วย\n• (0010,0020) Patient ID: รหัสประจำตัวผู้ป่วย (HN)\n• (0008,0060) Modality: ชนิดเครื่องตรวจ (เช่น CT, MR, CR, DX, US)\n• (0020,000D) Study Instance UID: รหัสจำเพาะระดับการตรวจ (Study)\n• (0020,000E) Series Instance UID: รหัสจำเพาะระดับชุดภาพ (Series)\n• (0008,0018) SOP Instance UID: รหัสจำเพาะของแต่ละภาพเดี่ยว (Image)\n• (7FE0,0010) Pixel Data: ข้อมูลเมทริกซ์จุดภาพดิบ\n\nลำดับชั้น 4 ระดับ (DICOM Information Model):\n1. Patient Level (ผู้ป่วย 1 คน มีได้หลายการตรวจ)\n2. Study Level (การตรวจ 1 ครั้ง เช่น CT Chest with Contrast มี Study UID เดียวกัน)\n3. Series Level (ใน 1 Study มีได้หลายชุดภาพ เช่น Axial 3mm, Coronal MPR, Bone window)\n4. Image / SOP Instance Level (แต่ละภาพเดี่ยว มี SOP Instance UID ไม่ซ้ำกันในโลก)',
    },
    {
      id: 'sec-dicom-services',
      heading: '8. สถาปัตยกรรมบริการเครือข่าย DICOM (Network Services & SCU/SCP Roles)',
      type: 'table',
      content: {
        headers: ['คำสั่งบริการ DICOM', 'ชื่อทางการ (Service Class)', 'บทบาทผู้ร้องขอ (SCU)', 'บทบาทผู้ให้บริการ (SCP)', 'การนำไปใช้งานจริง'],
        rows: [
          ['C-ECHO', 'Verification SOP Class', 'เครื่องตรวจ หรือ Workstation', 'ระบบจัดเก็บภาพ PACS', 'เปรียบเสมือน "DICOM Ping" เพื่อตรวจสอบว่าเครื่องเชื่อมต่อเครือข่ายได้ปกติ'],
          ['C-FIND (Worklist)', 'Modality Worklist (DMWL)', 'เครื่องตรวจ (Modality)', 'เซิร์ฟเวอร์ RIS / Broker', 'ค้นหารายชื่อผู้ป่วยและคำสั่งตรวจที่จะทำการถ่ายภาพในวันนี้'],
          ['C-FIND (Q/R)', 'Query/Retrieve Information', 'Diagnostic Viewer', 'ระบบ PACS', 'ค้นหาภาพเก่าในอดีตของผู้ป่วยเพื่อนำมาเปรียบเทียบขนาดรอยโรค'],
          ['MPPS', 'Modality Performed Procedure Step', 'เครื่องตรวจ (Modality)', 'ระบบ RIS', 'แจ้งสถานะงาน: N-CREATE (กำลังตรวจ) และ N-SET (ตรวจเสร็จสิ้น/ยกเลิก) พร้อมบันทึกค่า Dose'],
          ['C-STORE', 'Storage Service Class', 'เครื่องตรวจ (Modality)', 'ระบบ PACS', 'ส่งไฟล์ภาพ DICOM ที่ถ่ายเสร็จแล้วเข้าไปจัดเก็บในคลังภาพ'],
          ['C-MOVE', 'Query/Retrieve Move', 'Diagnostic Viewer', 'ระบบ PACS', 'สั่งให้ PACS ดึงไฟล์ภาพส่งมายังเครื่องอ่านผลของแพทย์'],
        ],
      },
    },
    {
      id: 'sec-gsdf-calibration',
      heading: '9. มาตรฐานการแสดงผลภาพระดับสีเทาสำหรับรังสีแพทย์ (DICOM Part 14: GSDF)',
      type: 'callout',
      content: {
        type: 'warning',
        title: 'เหตุผลที่จอภาพรังสีแพทย์ต้องได้มาตรฐาน DICOM Part 14 GSDF',
        message:
          'Grayscale Standard Display Function (GSDF) กำหนดให้การตอบสนองความสว่างของหน้าจอต้องสอดคล้องกับพฤติกรรมสายตามนุษย์ (Barten Model):\n\n• ตาของมนุษย์มีความไวต่อการจำแนกความแตกต่างของความสว่างไม่เชิงเส้น (Non-linear perception)\n• การปรับเทียบหน้าจอ (Monitor Calibration) ด้วยเซ็นเซอร์วัดแสง (Optical Luminance Sensor) จะปรับให้แต่ละขั้นของสีเทา (Just Noticeable Difference - JND) ปรากฏแก่สายตาด้วยความคมชัดเท่ากันทั่วทั้งจอ\n• หากรังสีแพทย์ใช้จอคอมพิวเตอร์ทั่วไป (sRGB) ที่ไม่ได้คาลิเบรตตาม Part 14 อาจมองไม่เห็นก้อนเนื้อขนาดเล็ก จุดหินปูนในเต้านม (Microcalcification) หรือรอยแตกของกระดูกที่ซ่อนอยู่ในเงาดำได้',
      },
    },
    {
      id: 'sec-quiz-ch9',
      heading: '10. แบบทดสอบวัดความเข้าใจประจำบทเรียนที่ 9 (Self-Assessment Quiz - 16 ข้อ)',
      type: 'quiz',
      content: {
        title: 'แบบทดสอบบทที่ 9: ระบบสารสนเทศรังสีวิทยาและมาตรฐาน DICOM',
        description: 'เลือกคำตอบที่ถูกต้องที่สุดเพื่อทดสอบความเข้าใจระบบ RIS, Worklist, คำสั่ง DICOM และ Part 14 GSDF',
        questions: [
          {
            id: 'q9-1',
            question: 'ระบบสารสนเทศใดทำหน้าที่บริหารจัดการ "ข้อมูลข้อความ คิวการตรวจ และรายงานผล" ในแผนกรังสีวิทยา?',
            options: ['PACS', 'RIS (Radiology Information System)', 'Modality', 'Tele-viewer'],
            correctAnswerIndex: 1,
            explanation: 'RIS จัดการข้อมูลข้อความ คิวตรวจ และรายงานผล ส่วน PACS ทำหน้าที่จัดการไฟล์ภาพดิจิทัล',
          },
          {
            id: 'q9-2',
            question: 'หมายเลขเวอร์ชันของมาตรฐาน DICOM ที่ใช้งานแพร่หลายในปัจจุบันคือเวอร์ชันใด?',
            options: ['3.0 (คงหมายเลขนี้ตั้งแต่ ค.ศ. 1993 แต่ปรับปรุงเนื้อหาทุกปี)', '5.2', '4.0', '6.1'],
            correctAnswerIndex: 0,
            explanation: 'มาตรฐาน DICOM คงหมายเลขเวอร์ชัน 3.0 มาตั้งแต่ ค.ศ. 1993 โดยการพัฒนาต่อยอดจะใช้วิธีเพิ่ม Extension และ Supplement ทุกปี',
          },
          {
            id: 'q9-3',
            question: 'มาตรฐาน DICOM ย้ายมารองรับการสื่อสารผ่านเครือข่าย TCP/IP ตั้งแต่ปี ค.ศ. ใด?',
            options: ['1983', '1985', '1988', '1993 (DICOM 3.0)'],
            correctAnswerIndex: 3,
            explanation: 'DICOM Version 3.0 เปิดตัวในปี ค.ศ. 1993 ซึ่งเป็นจุดเปลี่ยนสำคัญที่นำการเชื่อมต่อเครือข่าย TCP/IP แบบจุดต่อจุด (Point-to-Point Network) มาใช้งาน',
          },
          {
            id: 'q9-4',
            question: 'คำสั่งบริการ DICOM C-ECHO ตรงกับบริการ (SOP Class) ประเภทใด?',
            options: ['Storage Service', 'Verification Service (DICOM Ping)', 'Modality Worklist', 'Print Management'],
            correctAnswerIndex: 1,
            explanation: 'C-ECHO คือ Verification Service ทำหน้าที่คล้ายคำสั่ง Ping ในระบบเน็ตเวิร์ก เพื่อทดสอบว่าเครื่องปลายทางเปิดรับการเชื่อมต่อหรือไม่',
          },
          {
            id: 'q9-5',
            question: 'การดึงรายชื่อผู้ป่วยและคิวตรวจผ่านบริการ DICOM Modality Worklist (DMWL) ใช้คำสั่งบริการใด?',
            options: ['C-STORE', 'C-MOVE', 'C-FIND เท่านั้น', 'N-CREATE'],
            correctAnswerIndex: 2,
            explanation: 'Modality Worklist ทำหน้าที่สอบถามข้อมูลรายชื่อผู้ป่วยจาก RIS จึงใช้เฉพาะคำสั่ง C-FIND (Query) เท่านั้น โดยไม่มีการส่งภาพ',
          },
          {
            id: 'q9-6',
            question: 'ข้อใดไม่ใช่สถานะการทำงานมาตรฐานของบริการ MPPS (Modality Performed Procedure Step)?',
            options: ['IN PROGRESS', 'COMPLETED', 'DISCONTINUED', 'VERIFIED'],
            correctAnswerIndex: 3,
            explanation: 'MPPS มีเพียง 3 สถานะตามมาตรฐานสากล: IN PROGRESS (กำลังตรวจ), COMPLETED (ตรวจเสร็จสมบูรณ์), และ DISCONTINUED (ยกเลิกกลางคัน)',
          },
          {
            id: 'q9-7',
            question: 'เมื่อเครื่องจัดเก็บภาพ PACS ส่งไฟล์ภาพกลับมายัง Diagnostic Workstation ของแพทย์ ใครทำหน้าที่เป็น SCU?',
            options: ['PACS Server (เป็นผู้ส่งบริการภาพ)', 'Diagnostic Workstation', 'ทั้งคู่พร้อมกัน', 'ไม่มีฝ่ายใดเป็น SCU'],
            correctAnswerIndex: 0,
            explanation: 'ในจังหวะที่มีการส่งข้อมูลภาพ (C-STORE Sub-operation) เครื่องที่เป็นฝ่ายส่งข้อมูลภาพ (PACS) จะทำหน้าที่เป็น SCU และเครื่องรับภาพเป็น SCP',
          },
          {
            id: 'q9-8',
            question: 'แท็ก DICOM (0010,0010) หมายถึงข้อมูลอะไร และตัวเลข 4 หลักแรก (0010) เรียกว่าอะไร?',
            options: ['Patient ID / Element Number', "Patient's Name / Group Number", 'Birth Date / Group Number', 'Patient Sex / Element Number'],
            correctAnswerIndex: 1,
            explanation: '(0010,0010) คือ Patient’s Name โดยตัวเลขชุดแรก (0010) คือ Group Number และชุดหลัง (0010) คือ Element Number',
          },
          {
            id: 'q9-9',
            question: 'ตามมาตรฐาน DICOM ชื่อระบุตัวตน Application Entity Title (AE Title) มีความยาวสูงสุดได้กี่ตัวอักษร?',
            options: ['16 ตัวอักษร (Alphanumeric)', '8 ตัวอักษร', '32 ตัวอักษร', 'ไม่จำกัดความยาว'],
            correctAnswerIndex: 0,
            explanation: 'AE Title มีข้อกำหนดความยาวสูงสุดไม่เกิน 16 ตัวอักษร (ตัวพิมพ์ใหญ่-เล็ก และตัวเลข ห้ามมีเว้นวรรคหรืออักขระพิเศษ)',
          },
          {
            id: 'q9-10',
            question: 'พอร์ตเครือข่ายมาตรฐานที่นิยมกำหนดสำหรับการสื่อสาร DICOM เครือข่ายคือพอร์ตใด?',
            options: ['Port 80 / 443', 'Port 104 หรือ 11112', 'Port 3306', 'Port 8080'],
            correctAnswerIndex: 1,
            explanation: 'Port 104 คือ Registered Port ทางการของ DICOM และหลายระบบมักใช้ Port 11112 เป็นพอร์ตสำรองหรือพอร์ตสำหรับคลังภาพ',
          },
          {
            id: 'q9-11',
            question: 'เอกสารแสดงคุณสมบัติความเข้ากันได้ของระบบ (DICOM Conformance Statement) อธิบายอยู่ใน Part ใดของมาตรฐาน DICOM?',
            options: ['Part 2: Conformance', 'Part 6: Data Dictionary', 'Part 14: Display Function', 'Part 18: Web Services'],
            correctAnswerIndex: 0,
            explanation: 'DICOM Part 2 กำหนดโครงสร้างและรายละเอียดของเอกสาร Conformance Statement เพื่อให้ผู้ซื้อสามารถตรวจสอบความเข้ากันได้ก่อนจัดซื้อ',
          },
          {
            id: 'q9-12',
            question: 'การปรับเทียบหน้าจอแสดงผลภาพวินิจฉัยของรังสีแพทย์ (Monitor Calibration) ต้องปฏิบัติตามมาตรฐาน Part ใด?',
            options: ['Part 4: Service Class', 'Part 14: Grayscale Standard Display Function (GSDF)', 'Part 15: Security Profiles', 'Part 20: Imaging Reports'],
            correctAnswerIndex: 1,
            explanation: 'Part 14 GSDF กำหนดความสัมพันธ์ระหว่างค่า Digital Driving Level (DDL) กับความสว่างจริงของจอภาพ เพื่อให้สอดคล้องกับการมองเห็นของสายตามนุษย์',
          },
          {
            id: 'q9-13',
            question: 'การแปลงและส่งรายงานผลการตรวจรังสี (Imaging Report) เข้าสู่มาตรฐาน HL7 สอดคล้องกับ DICOM Part ใด?',
            options: ['Part 16: Content Mapping', 'Part 18: Web Services', 'Part 20: Imaging Reports in HL7 Clinical Document Architecture', 'Part 22: Real-time Communication'],
            correctAnswerIndex: 2,
            explanation: 'DICOM Part 20 กำหนดแนวทางการแปลงรายงานผลภาพทางการแพทย์ให้อยู่ในรูปแบบ HL7 CDA เพื่อส่งกลับสู่ระบบ EMR/HIS',
          },
          {
            id: 'q9-14',
            question: 'การเปิดดูภาพรังสีผ่านเว็บเบราว์เซอร์บนสมาร์ทโฟนหรือแท็บเล็ตด้วย RESTful API สอดคล้องกับมาตรฐานข้อใด?',
            options: ['Part 10: Media Storage', 'Part 12: Media Formats', 'Part 18: Web Services (DICOMweb - WADO/QIDO/STOW)', 'Part 19: Application Hosting'],
            correctAnswerIndex: 2,
            explanation: 'DICOMweb (Part 18) คือมาตรฐานการเรียกดู ค้นหา และส่งภาพผ่านโพรโทคอล HTTP/HTTPS ด้วยคำสั่ง WADO-RS, QIDO-RS, และ STOW-RS',
          },
          {
            id: 'q9-15',
            question: 'เหตุใดในบริการ Query/Retrieve (Q/R) สถาปัตยกรรมจึงบังคับให้ส่งคำสั่ง C-FIND ก่อนการส่งคำสั่ง C-MOVE?',
            options: [
              'เนื่องจากชุดภาพ CT/MRI มีขนาดใหญ่มาก (หลายร้อย MB) การค้นหาเงื่อนไขเฉพาะก่อนส่งภาพช่วยป้องกันเครือข่ายล่มและประหยัด Bandwidth',
              'เป็นข้อบังคับเรื่องรหัสผ่านความปลอดภัย',
              'คำสั่ง C-MOVE ไม่สามารถระบุชื่อผู้ป่วยได้',
              'เพื่อทดสอบว่าฮาร์ดดิสก์มีพื้นที่ว่างเพียงพอหรือไม่',
            ],
            correctAnswerIndex: 0,
            explanation: 'ภาพการแพทย์มีขนาดใหญ่ หากส่ง C-MOVE โดยไม่ระบุ UID ที่เจาะจง อาจทำให้เซิร์ฟเวอร์ส่งข้อมูลที่ไม่จำเป็นมาทั้งหมดจนเครือข่ายอิ่มตัว การ C-FIND ก่อนจึงช่วยประหยัดทรัพยากรอย่างมาก',
          },
          {
            id: 'q9-16',
            question: 'ในระบบ Digital Dictation สำหรับรังสีแพทย์ เหตุใดโรงพยาบาลจึงต้องจัดเก็บไฟล์เสียงต้นฉบับ (Original Audio) ไว้ควบคู่กับข้อความที่ถอดความแล้ว?',
            options: [
              'เพื่อใช้เป็นหลักฐานทางกฎหมายและสามารถตรวจสอบย้อนหลัง (Audit Trail) เมื่อเกิดข้อผิดพลาดในการถอดความ',
              'เพราะไฟล์เสียงมีขนาดเล็กกว่าข้อความ',
              'เป็นข้อกำหนดในการคิดค่ารักษาพยาบาล',
              'เพื่อให้ระบบสังเคราะห์เสียงอัตโนมัติทำงานต่อไปได้',
            ],
            correctAnswerIndex: 0,
            explanation: 'การเก็บไฟล์เสียงต้นฉบับเป็นหลักฐานสำคัญสูงสุดทางการแพทย์และกฎหมาย หากมีข้อผิดพลาดจากการพิมพ์หรือจาก Speech-to-text สามารถเปิดฟังเสียงรังสีแพทย์เพื่อยืนยันข้อเท็จจริงได้ทันที',
          },
        ],
      },
    },
  ],
};

export default radiologyRisDicomChapter;
