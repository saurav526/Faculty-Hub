// ─── Faculty Title ────────────────────────────────────────────────────────────
export type FacultyTitle = 'Dr.' | 'Prof.' | 'Mr.' | 'Mrs.' | 'Ms.' | 'Miss.';

// ─── Floor & Block ────────────────────────────────────────────────────────────
export type FloorKey = '2nd' | '3rd' | '4th' | '5th' | '6th' | '9th';

export type BlockCode =
  | 'S-001' | 'N-003' | 'S-211'
  | 'S-309'
  | 'S-402' | 'S-411' | 'S-415' | 'N-409' | 'N-410'
  | 'S-502' | 'S-504' | 'S-511' | 'S-513' | 'N-502' | 'N-504'
  | 'S-602' | 'S-616' | 'LAB-S608'
  | 'J-901' | 'S-901';

export type CabinType = 'numbered' | 'lettered' | 'cubicle' | 'lab';

// ─── Status ───────────────────────────────────────────────────────────────────
// available  → green   — faculty is at their desk / free
// in_class   → blue    — currently teaching
// away       → amber   — on campus but not at desk
// on_leave   → red     — absent / on leave
export type FacultyStatus = 'available' | 'in_class' | 'away' | 'on_leave';

// ─── Remark Type ─────────────────────────────────────────────────────────────
export type RemarkType =
  | 'medical_leave'
  | 'maternity_leave'
  | 'on_leave'
  | 'resigned'
  | 'shifted'
  | 'hod_cabin'
  | 'sharing'
  | 'entrepreneurship'
  | 'note'
  | 'none';

// ─── Core Faculty Record ──────────────────────────────────────────────────────
export interface FacultyRecord {
  id: number;           // Sr. No. from seating PDF (unique key)
  title: FacultyTitle;
  name: string;         // Name without title prefix
  fullName: string;     // title + ' ' + name
  block: BlockCode;
  floor: FloorKey;
  cabinPosition: string; // e.g. "Cabin 1", "A (Right First)", "Cubicle 3"
  cabinType: CabinType;
  rawRemark: string;
  remarkType: RemarkType;
  isHOD: boolean;
}

// ─── Status Overrides ────────────────────────────────────────────────────────
export interface StatusOverride {
  status: FacultyStatus;
  updatedAt: string;    // ISO timestamp
  note?: string;
}

export interface StatusOverrides {
  [facultyId: number]: StatusOverride;
}

// ─── Filter State ─────────────────────────────────────────────────────────────
export interface FilterState {
  searchQuery: string;
  floors: FloorKey[];
  blocks: BlockCode[];
  statuses: FacultyStatus[];
  remarkTypes: RemarkType[];
}

// ─── Faculty Account ─────────────────────────────────────────────────────────
export interface FacultyAccount {
  email: string;            // unique identifier + login credential
  // Personal info — fully editable by the faculty member
  title: FacultyTitle;
  name: string;             // name without title prefix
  fullName: string;         // title + ' ' + name

  // Location — editable; initially pre-filled from seating record
  block: BlockCode;
  floor: FloorKey;
  cabinPosition: string;

  // Optional profile fields
  photoDataUrl?: string;    // base64 data URL
  phone?: string;

  // Seating-record link (set when faculty finds themselves in the directory)
  linkedFacultyId?: number;

  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
}

/** All accounts keyed by email */
export type FacultyAccounts = Record<string, FacultyAccount>;

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export interface DashboardStats {
  totalFaculty: number;
  totalFloors: number;
  totalBlocks: number;
  byStatus: Record<FacultyStatus, number>;
  byFloor: Record<FloorKey, number>;
  remarkCounts: Partial<Record<RemarkType, number>>;
}
