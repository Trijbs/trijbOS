import { CheckSquare, FileText, Folder, Image, MoveRight, PencilLine, RotateCcw, Square, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { isProtectedFileNode } from "../../filesystem-roots";
import { buildBreadcrumbs, getMoveTargets, sortDirectoryEntries, toggleFileSelection } from "../../file-utils";
import { useSystemStore } from "../../system-store";

export function FileExplorerApp() {
  const activeDirectoryId = useSystemStore((state) => state.activeDirectoryId);
  const selectedFileId = useSystemStore((state) => state.selectedFileId);
  const selectedFileIds = useSystemStore((state) => state.selectedFileIds);
  const files = useSystemStore((state) => state.files);
  const setActiveDirectory = useSystemStore((state) => state.setActiveDirectory);
  const setSelectedFiles = useSystemStore((state) => state.setSelectedFiles);
  const createFile = useSystemStore((state) => state.createFile);
  const updateFile = useSystemStore((state) => state.updateFile);
  const removeFile = useSystemStore((state) => state.removeFile);
  const moveFiles = useSystemStore((state) => state.moveFiles);
  const restoreFiles = useSystemStore((state) => state.restoreFiles);
  const emptyTrash = useSystemStore((state) => state.emptyTrash);
  const importBrowserFiles = useSystemStore((state) => state.importBrowserFiles);
  const openFile = useSystemStore((state) => state.openFile);
  const [renameId, setRenameId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const directoryEntries = useMemo(
    () => sortDirectoryEntries(files.filter((item) => item.parentId === activeDirectoryId)),
    [activeDirectoryId, files],
  );
  const rootDirectories = files.filter((item) => item.parentId === null);
  const moveTargets = useMemo(
    () => getMoveTargets(files, activeDirectoryId, selectedFileIds),
    [activeDirectoryId, files, selectedFileIds],
  );
  const breadcrumbs = buildBreadcrumbs(files, activeDirectoryId);
  const selectedEntry = files.find((item) => item.id === selectedFileId) ?? null;
  const isTrashDirectory = activeDirectoryId === "trash";
  const selectedTrashIds = selectedFileIds.filter((fileId) =>
    files.some((item) => item.id === fileId && item.parentId === "trash"),
  );

  const toggleSelection = (id: string) => {
    const next = toggleFileSelection(selectedFileIds, id);
    setSelectedFiles(next);
  };

  return (
    <div className="app-pane file-explorer">
      <aside className="sidebar">
        <h3>Storage</h3>
        {rootDirectories.map((directory) => (
          <button
            className={`sidebar-link ${directory.id === activeDirectoryId ? "is-active" : ""}`}
            key={directory.id}
            onClick={() => setActiveDirectory(directory.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (selectedFileIds.length > 0 && directory.id !== activeDirectoryId) {
                void moveFiles(selectedFileIds, directory.id);
              }
            }}
            type="button"
          >
            <Folder size={16} />
            <span>{directory.name}</span>
          </button>
        ))}
      </aside>
      <section className="explorer-main">
        <div className="app-toolbar">
          <div className="breadcrumbs">
            {breadcrumbs.map((crumb) => (
              <button key={crumb.id} onClick={() => setActiveDirectory(crumb.id)} type="button">
                {crumb.name}
              </button>
            ))}
          </div>
          <div className="toolbar-actions">
            {isTrashDirectory ? (
              <button
                disabled={!files.some((item) => item.parentId === "trash")}
                onClick={() => void emptyTrash()}
                type="button"
              >
                Empty Trash
              </button>
            ) : null}
            <button
              onClick={() =>
                void createFile({
                  name: `New Note ${directoryEntries.length + 1}.md`,
                  parentId: activeDirectoryId,
                  type: "text",
                  content: "New note",
                })
              }
              type="button"
            >
              New File
            </button>
            <button
              onClick={() =>
                void createFile({
                  name: `Folder ${directoryEntries.length + 1}`,
                  parentId: activeDirectoryId,
                  type: "folder",
                  content: "",
                })
              }
              type="button"
            >
              New Folder
            </button>
            <button onClick={() => fileInputRef.current?.click()} type="button">
              Upload
            </button>
            <input
              hidden
              id="file-explorer-upload"
              multiple
              name="file-explorer-upload"
              onChange={(event) => {
                const uploaded = event.target.files;
                if (uploaded && uploaded.length > 0) {
                  void importBrowserFiles(uploaded, activeDirectoryId);
                }
                event.target.value = "";
              }}
              ref={fileInputRef}
              type="file"
            />
          </div>
        </div>
        {selectedFileIds.length > 0 ? (
          <div className="selection-bar">
            <span>{selectedFileIds.length} selected</span>
            <div className="selection-actions">
              {selectedTrashIds.length > 0 ? (
                <button onClick={() => void restoreFiles(selectedTrashIds)} type="button">
                  <RotateCcw size={14} />
                  <span>Restore</span>
                </button>
              ) : null}
              {moveTargets.map((folder) => (
                <button key={folder.id} onClick={() => void moveFiles(selectedFileIds, folder.id)} type="button">
                  <MoveRight size={14} />
                  <span>{folder.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="explorer-list">
          {directoryEntries.map((entry) => {
            const isSelected = selectedFileIds.includes(entry.id);
            const isProtected = isProtectedFileNode(entry.id);
            const isInTrash = entry.parentId === "trash";
            return (
              <article
                className={`explorer-row ${isSelected ? "is-selected" : ""}`}
                draggable
                key={entry.id}
                onDragStart={() => {
                  if (!isSelected) {
                    setSelectedFiles([entry.id]);
                  }
                }}
              >
                <div className="explorer-row-main">
                  <button
                    aria-label={isSelected ? `Deselect ${entry.name}` : `Select ${entry.name}`}
                    className="select-toggle"
                    onClick={() => toggleSelection(entry.id)}
                    type="button"
                  >
                    {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                  </button>
                  {entry.type === "folder" ? (
                    <Folder size={16} />
                  ) : entry.type === "image" ? (
                    <Image size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                  <div>
                    {renameId === entry.id ? (
                      <input
                        autoFocus
                        className="inline-input"
                        defaultValue={entry.name}
                        id={`rename-${entry.id}`}
                        name={`rename-${entry.id}`}
                        onBlur={(event) => {
                          void updateFile(entry.id, { name: event.target.value.trim() || entry.name });
                          setRenameId(null);
                        }}
                      />
                    ) : (
                      <strong>{entry.name}</strong>
                    )}
                    <small>{entry.updatedAt.slice(0, 10)}</small>
                  </div>
                </div>
                <div className="explorer-row-actions">
                  {entry.type === "folder" ? (
                    <button
                      onClick={() => setActiveDirectory(entry.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (selectedFileIds.length > 0) {
                          void moveFiles(selectedFileIds, entry.id);
                        }
                      }}
                      type="button"
                    >
                      Open
                    </button>
                  ) : (
                    <button onClick={() => openFile(entry.id)} type="button">
                      Open
                    </button>
                  )}
                  {isInTrash ? (
                    <button
                      aria-label={`Restore ${entry.name}`}
                      onClick={() => void restoreFiles([entry.id])}
                      type="button"
                    >
                      <RotateCcw size={14} />
                    </button>
                  ) : null}
                  <button
                    aria-label={isProtected ? `${entry.name} cannot be renamed` : `Rename ${entry.name}`}
                    disabled={isProtected}
                    onClick={() => setRenameId(entry.id)}
                    type="button"
                  >
                    <PencilLine size={14} />
                  </button>
                  <button
                    aria-label={
                      isProtected
                        ? `${entry.name} cannot be deleted`
                        : isInTrash
                          ? `Delete ${entry.name} permanently`
                          : `Move ${entry.name} to trash`
                    }
                    disabled={isProtected}
                    onClick={() => void removeFile(entry.id)}
                    type="button"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        {selectedEntry ? (
          <aside className="inspector-panel">
            <strong>{selectedEntry.name}</strong>
            <small>Type: {selectedEntry.type}</small>
            <small>Updated: {selectedEntry.updatedAt.slice(0, 16).replace("T", " ")}</small>
          </aside>
        ) : null}
      </section>
    </div>
  );
}
