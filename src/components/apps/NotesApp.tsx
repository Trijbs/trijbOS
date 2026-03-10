import { useMemo } from "react";
import { useSystemStore } from "../../system-store";

export function NotesApp() {
  const files = useSystemStore((state) => state.files);
  const selectedFileId = useSystemStore((state) => state.selectedFileId);
  const updateFile = useSystemStore((state) => state.updateFile);
  const openFile = useSystemStore((state) => state.openFile);
  const pushNotification = useSystemStore((state) => state.pushNotification);

  const notes = useMemo(
    () => files.filter((item) => item.type === "text" && item.parentId !== null),
    [files],
  );

  const current = notes.find((note) => note.id === selectedFileId) ?? notes[0];

  if (!current) {
    return <div className="app-pane">No notes yet. Create one from File Explorer.</div>;
  }

  return (
    <div className="app-pane notes-app">
      <aside className="sidebar">
        <h3>Documents</h3>
        {notes.map((note) => (
          <button className="note-link" key={note.id} onClick={() => openFile(note.id)} type="button">
            {note.name}
          </button>
        ))}
      </aside>
      <div className="notes-editor">
        <header className="app-toolbar">
          <strong>{current.name}</strong>
          <button
            onClick={() =>
              void pushNotification({
                title: "Note saved",
                body: `${current.name} was updated.`,
                tone: "success",
              })
            }
            type="button"
          >
            Save
          </button>
        </header>
        <textarea
          className="notes-textarea"
          onChange={(event) =>
            void updateFile(current.id, {
              content: event.target.value,
            })
          }
          value={current.content ?? ""}
        />
      </div>
    </div>
  );
}
