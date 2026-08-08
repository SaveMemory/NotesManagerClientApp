import type { Note } from '../types';

interface NoteListProps {
  notes: Note[];
  selectedId?: number;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteList({ notes, selectedId, onEdit, onDelete }: NoteListProps) {
  if (notes.length === 0) {
    return <p className="empty-state">No notes yet — create your first one.</p>;
  }

  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id} className={note.id === selectedId ? 'selected' : ''}>
          <div className="note-list-item-body" onClick={() => onEdit(note)}>
            <h3>{note.title}</h3>
            <p>{note.content.length > 120 ? `${note.content.slice(0, 120)}…` : note.content}</p>
            <span className="note-meta">
              Updated {new Date(note.updatedAt).toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            className="danger"
            onClick={() => onDelete(note)}
            aria-label={`Delete note ${note.title}`}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
