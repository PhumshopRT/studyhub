import type { Subject, Chapter } from '../types/content';
import { validateSubject, validateChapter } from './schema';

// Import Subject definitions (Real Medical Physiology & Pathology & Radiology)
import physiologySubject from './subjects/physiology/subject';
import pathologySubject from './subjects/pathology/subject';
import radiologySubject from './subjects/radiology/subject';

// Import Chapter definitions (Real Physiology content from Qwen / PhysioStudy)
import respiratoryPhysiologyChapter from './subjects/physiology/chapters/respiratory-physiology';
import giTractPhysiologyChapter from './subjects/physiology/chapters/gi-tract-physiology';
import physiologyRespiratoryGiChapter from './subjects/physiology/chapters/physiology-respiratory-gi';

// Import Chapter definitions (Pathology: Reproductive, Neuro, MSK, Hepatobiliary & Labs)
import reproductiveMaleChapter from './subjects/pathology/chapters/reproductive-male';
import reproductiveFemaleBreastChapter from './subjects/pathology/chapters/reproductive-female-breast';
import reproductiveAtlasChapter from './subjects/pathology/chapters/reproductive-atlas';
import neuropathologyChapter from './subjects/pathology/chapters/neuropathology';
import musculoskeletalChapter from './subjects/pathology/chapters/musculoskeletal';
import hepatobiliaryPancreasChapter from './subjects/pathology/chapters/hepatobiliary-pancreas';
import pathologyMultiLabChapter from './subjects/pathology/chapters/pathology-multi-lab';

// Import Chapter definitions (Radiological Technology & Medical Imaging Systems)
import radiologyRisDicomChapter from './subjects/radiology/chapters/radiology-ris-dicom';
import radiologyRiskScoringChapter from './subjects/radiology/chapters/radiology-risk-scoring';
import radiologyPacsArchitectureChapter from './subjects/radiology/chapters/radiology-pacs-architecture';
import radiologyImagingSuiteChapter from './subjects/radiology/chapters/radiology-imaging-suite';

// Internal in-memory registry maps
const subjectsRegistry = new Map<string, Subject>();
const chaptersRegistry = new Map<string, Chapter>();

// Register initial data with validation
const initialSubjects = [physiologySubject, pathologySubject, radiologySubject];
const initialChapters = [
  respiratoryPhysiologyChapter,
  giTractPhysiologyChapter,
  physiologyRespiratoryGiChapter,
  reproductiveMaleChapter,
  reproductiveFemaleBreastChapter,
  reproductiveAtlasChapter,
  neuropathologyChapter,
  musculoskeletalChapter,
  hepatobiliaryPancreasChapter,
  pathologyMultiLabChapter,
  radiologyRisDicomChapter,
  radiologyRiskScoringChapter,
  radiologyPacsArchitectureChapter,
  radiologyImagingSuiteChapter,
];

initialSubjects.forEach((sub) => {
  const result = validateSubject(sub);
  if (!result.valid) {
    console.error(`[ContentRegistry] Invalid subject "${sub?.id}":`, result.errors);
  }
  subjectsRegistry.set(sub.id, sub);
});

initialChapters.forEach((chap) => {
  const result = validateChapter(chap);
  if (!result.valid) {
    console.error(`[ContentRegistry] Invalid chapter "${chap?.id}":`, result.errors);
  }
  chaptersRegistry.set(chap.id, chap);
});

/**
 * Get all available subjects sorted by their defined order
 */
export function getAllSubjects(): Subject[] {
  return Array.from(subjectsRegistry.values()).sort((a, b) => a.order - b.order);
}

/**
 * Get a specific subject by its ID
 */
export function getSubjectById(subjectId: string): Subject | undefined {
  return subjectsRegistry.get(subjectId);
}

/**
 * Get a specific chapter by its ID
 */
export function getChapterById(chapterId: string): Chapter | undefined {
  return chaptersRegistry.get(chapterId);
}

/**
 * Get all chapters for a given subject ID, sorted by order
 */
export function getChaptersBySubjectId(subjectId: string): Chapter[] {
  const subject = subjectsRegistry.get(subjectId);
  if (!subject) return [];

  return subject.chapterIds
    .map((chapId) => chaptersRegistry.get(chapId))
    .filter((chap): chap is Chapter => chap !== undefined)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get all chapters across all subjects
 */
export function getAllChapters(): Chapter[] {
  return Array.from(chaptersRegistry.values());
}

/**
 * Get next and previous chapters for reader navigation
 */
export function getNextAndPrevChapter(
  subjectId: string,
  chapterId: string
): { prev: Chapter | null; next: Chapter | null } {
  const chapters = getChaptersBySubjectId(subjectId);
  const currentIndex = chapters.findIndex((c) => c.id === chapterId);

  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return { prev, next };
}

/**
 * Search content across all subjects and chapters
 */
export interface SearchResult {
  type: 'subject' | 'chapter';
  id: string;
  title: string;
  subtitle: string;
  subjectId: string;
  path: string;
  matchSnippet?: string;
}

export function searchContent(query: string): SearchResult[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return [];

  const results: SearchResult[] = [];

  // Search subjects
  for (const subject of subjectsRegistry.values()) {
    if (
      subject.title.toLowerCase().includes(clean) ||
      subject.description.toLowerCase().includes(clean) ||
      subject.shortTitle.toLowerCase().includes(clean)
    ) {
      results.push({
        type: 'subject',
        id: subject.id,
        title: subject.title,
        subtitle: subject.description,
        subjectId: subject.id,
        path: `/subject/${subject.id}`,
      });
    }
  }

  // Search chapters
  for (const chapter of chaptersRegistry.values()) {
    const titleMatch = chapter.title.toLowerCase().includes(clean);
    const descMatch = chapter.description.toLowerCase().includes(clean);
    const tagMatch = chapter.tags.some((t) => t.toLowerCase().includes(clean));

    // Search inside section text
    let sectionSnippet: string | undefined;
    for (const sec of chapter.sections) {
      if (typeof sec.content === 'string' && sec.content.toLowerCase().includes(clean)) {
        sectionSnippet = sec.content.slice(0, 120) + '...';
        break;
      }
    }

    if (titleMatch || descMatch || tagMatch || sectionSnippet) {
      results.push({
        type: 'chapter',
        id: chapter.id,
        title: chapter.title,
        subtitle: chapter.description,
        subjectId: chapter.subjectId,
        path: `/chapter/${chapter.subjectId}/${chapter.id}`,
        matchSnippet: sectionSnippet,
      });
    }
  }

  return results;
}

/**
 * Helper to dynamically register new subjects without modifying app core
 */
export function registerSubject(subject: Subject): void {
  const result = validateSubject(subject);
  if (!result.valid) {
    throw new Error(`Failed to register subject: ${result.errors.map((e) => e.message).join(', ')}`);
  }
  subjectsRegistry.set(subject.id, subject);
}

/**
 * Helper to dynamically register new chapters without modifying app core
 */
export function registerChapter(chapter: Chapter): void {
  const result = validateChapter(chapter);
  if (!result.valid) {
    throw new Error(`Failed to register chapter: ${result.errors.map((e) => e.message).join(', ')}`);
  }
  chaptersRegistry.set(chapter.id, chapter);
}
