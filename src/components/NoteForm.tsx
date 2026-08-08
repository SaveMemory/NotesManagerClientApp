import { useEffect, useState } from 'react';
import type { Note } from '../types';

interface NoteFormProps {
  /** Note being edited, or null when creating a new one. */
  editingNote: Note | null;
  onSubmit: (title: string, content: string) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
}

export function NoteForm({ editingNote, onSubmit, onCancel, submitting }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    setTitle(editingNote?.title ?? '');
    setContent(editingNote?.content ?? '');
  }, [editingNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit(title, content);
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <h2>{editingNote ? `Edit note #${editingNote.id}` : 'New note'}</h2>
      <label>
        Title
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Note title"
          required
        />
      </label>
      <label>
        Content
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write something..."
          rows={6}
        />
      </label>
      <div className="note-form-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : editingNote ? 'Save changes' : 'Create note'}
        </button>
        {editingNote && (
          <button type="button" className="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
