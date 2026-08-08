import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { ApiError, notesApi } from './api/notesApi';
import { NoteForm } from './components/NoteForm';
import { NoteList } from './components/NoteList';
import { Pagination } from './components/Pagination';
import type { Note, PagedResult } from './types';

const PAGE_SIZE = 10;

function App() {
  const [result, setResult] = useState<PagedResult<Note> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const loadNotes = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await notesApi.getAll(targetPage, PAGE_SIZE);
      setResult(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load notes. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes(page);
  }, [page, loadNotes]);

  const handleCreateOrUpdate = async (title: string, content: string) => {
    setSubmitting(true);
    setError(null);
    try {
      if (editingNote) {
        await notesApi.update(editingNote.id, { title, content, rowVersion: editingNote.rowVersion });
        setEditingNote(null);
      } else {
        await notesApi.create({ title, content });
      }
      await loadNotes(page);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('This note was changed elsewhere since you loaded it. Refresh and try again.');
      } else if (err instanceof ApiError && err.status === 404) {
        setError('This note no longer exists.');
        setEditingNote(null);
        await loadNotes(page);
      } else {
        setError(err instanceof ApiError ? err.message : 'Something went wrong while saving.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (note: Note) => {
    if (!window.confirm(`Delete "${note.title}"?`)) return;
    setError(null);
    try {
      await notesApi.remove(note.id);
      if (editingNote?.id === note.id) setEditingNote(null);
      await loadNotes(page);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to delete note.');
    }
  };

  return (
    <div className="app">
      <header>
        <h1>Notes Manager</h1>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <div className="layout">
        <section className="list-section">
          {loading ? (
            <p>Loading notes…</p>
          ) : (
            <>
              <NoteList
                notes={result?.items ?? []}
                selectedId={editingNote?.id}
                onEdit={setEditingNote}
                onDelete={handleDelete}
              />
              <Pagination page={page} totalPages={result?.totalPages ?? 1} onChange={setPage} />
            </>
          )}
        </section>

        <section className="form-section">
          <NoteForm
            editingNote={editingNote}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => setEditingNote(null)}
            submitting={submitting}
          />
        </section>
      </div>
    </div>
  );
}

export default App;
