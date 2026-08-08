import type { Note, NoteDto, PagedResult, ProblemDetails, UpdateNoteDto } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://localhost:5155/api';

export class ApiError extends Error {
  status: number;
  problem?: ProblemDetails;

  constructor(status: number, message: string, problem?: ProblemDetails) {
    super(message);
    this.status = status;
    this.problem = problem;
  }
}

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    let problem: ProblemDetails | undefined;
    try {
      problem = await res.json();
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, problem?.detail ?? problem?.title ?? res.statusText, problem);
  }

  return res.json() as Promise<T>;
}

export const notesApi = {
  async getAll(page = 1, pageSize = 20): Promise<PagedResult<Note>> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    const res = await fetch(`${BASE_URL}/notes?${params}`);
    return handle<PagedResult<Note>>(res);
  },

  async getById(id: number): Promise<Note> {
    const res = await fetch(`${BASE_URL}/notes/${id}`);
    return handle<Note>(res);
  },

  async create(dto: NoteDto): Promise<Note> {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    return handle<Note>(res);
  },

  async update(id: number, dto: UpdateNoteDto): Promise<Note> {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
    return handle<Note>(res);
  },

  async remove(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/notes/${id}`, { method: 'DELETE' });
    return handle<void>(res);
  },
};
