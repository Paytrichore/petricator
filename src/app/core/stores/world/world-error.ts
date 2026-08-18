import { HttpErrorResponse } from '@angular/common/http';

export type WorldErrorCode =
  | 'CELL_OCCUPIED'
  | 'PEBLOB_ALREADY_PLACED'
  | 'PEBLOB_NOT_FOUND'
  | 'INSUFFICIENT_ACTION_POINTS'
  | 'DRAFT_ALREADY_DONE'
  | 'PLACEMENT_DEPENDENCY_UNAVAILABLE'
  | 'PLACEMENT_FAILED'
  | 'WORLD_LOAD_FAILED';

export interface WorldError {
  code: WorldErrorCode;
  status: number;
}

const knownCodes = new Set<WorldErrorCode>([
  'CELL_OCCUPIED',
  'PEBLOB_ALREADY_PLACED',
  'PEBLOB_NOT_FOUND',
  'INSUFFICIENT_ACTION_POINTS',
  'DRAFT_ALREADY_DONE',
  'PLACEMENT_DEPENDENCY_UNAVAILABLE',
  'PLACEMENT_FAILED',
  'WORLD_LOAD_FAILED'
]);

export function extractWorldError(error: unknown, fallback: WorldErrorCode): WorldError {
  if (error instanceof HttpErrorResponse) {
    const payload = error.error as { code?: unknown } | null;
    const code = payload?.code;
    if (typeof code === 'string' && knownCodes.has(code as WorldErrorCode)) {
      return { code: code as WorldErrorCode, status: error.status };
    }

    return { code: fallback, status: error.status };
  }

  return { code: fallback, status: 0 };
}

export function worldErrorTranslationKey(error: WorldError): string {
  return `world.errors.${error.code}`;
}