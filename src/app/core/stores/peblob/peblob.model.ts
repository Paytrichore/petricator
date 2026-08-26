import { ComposedPeblob } from '../../../shared/interfaces/peblob';
import { Tint } from '../../../shared/interfaces/peblob';
import { Story } from '../../../shared/interfaces/story';

export enum PeblobStatus {
  AVAILABLE = 'AVAILABLE',
  ON_MAP = 'ON_MAP',
}

export enum DraftStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export interface DraftSession {
  _id: string;
  userId: string;
  question: Story;
  story?: { color: string; action: string; result: string };
  choices: Array<{
    structure: ComposedPeblob;
    dominantColor: Tint;
  }>;
  status: DraftStatus;
  selectedIndex?: number;
}

export interface PeblobEntity {
  _id: string;
  userId: string;
  structure: ComposedPeblob;
  createdAt: Date;
  updatedAt: Date;
  ownerName?: string;
  name?: string;
  dominantColor?: Tint;
  maturity?: number;
  balance?: number;
  earnedPowerCount?: number;
  unlockedPowerCount?: number;
  purchasedPowerIds?: string[];
  playedStoryIds?: string[];
  status?: PeblobStatus;
  mapPosition?: {
    x: number;
    y: number;
  };
}

export interface PeblobPage {
  items: PeblobEntity[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PeblobState {
  peblobs: PeblobEntity[];
  mapPeblobs: PeblobEntity[];
  loading: boolean;
  mapLoading: boolean;
  error: any;
  total: number;
  page: number;
  pageSize: number;
  renamingPeblobIds: string[];
  applyingStoryPeblobIds: string[];
}