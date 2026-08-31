# What this fork adds

`bobsandbox/t3code`, branch `sbxs/sidebar`. Everything here is `apps/web/src`
except two lines of desktop build identity — no server, no contracts, no
migrations. That is deliberate: the fork runs against a stock `t3` server, so
any of it can be cherry-picked into another T3 Code derivative without a
matching backend.

Each feature has a switch in `apps/web/src/forkFeatures.ts`. Off means upstream
behaviour, not our layout with its controls hidden. Everything defaults on.

| Flag id                     | What it does                                                                                                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dense-thread-rows`         | Thread rows go from three lines to two (78px to 58px). Title leads at full width; the project moves down beside the branch as a small tinted label; time and hover actions move to the metadata line. |
| `project-colours`           | Every project gets a colour hashed from its name (FNV-1a into twelve hues). Lightness and chroma shift for dark mode; the 60-115 band is skipped because mustard reads as dirty at these values.      |
| `project-lane`              | The project picker becomes a lane parked left of the thread list rather than a dropdown over it, with its own sort control (recent activity or alphabetical).                                         |
| `project-pinning`           | Right-click a project to pin it; pinned rows sit on top in pin order and drag to reorder, using the same dnd-kit setup as pinned threads.                                                             |
| `project-status-glyphs`     | Running and unread-completed counts per project row, reusing `resolveSidebarThreadStatus` and `hasUnseenCompletion` so a project badge cannot contradict the rows behind it.                          |
| `project-search`            | Sidebar search matches project names and workspace paths alongside thread titles, prefix matches first, sharing one index space with thread hits.                                                     |
| `scoped-new-thread`         | An action row under the picker that follows the level you are on: New thread in the scoped project, or New project at the top level.                                                                  |
| `thread-header-actions`     | Pin, mark unread and regenerate title as buttons on the open thread, calling the same code as the thread menu entries.                                                                                |
| `add-project-create-folder` | Typing a folder that does not exist offers to create it (the server already supported `createWorkspaceRootIfMissing`), and a new project's parent becomes `addProjectBaseDirectory`.                  |
| `detached-windows`          | Drag a project or session out of the app window into its own window, with per-window preview isolation.                                                                                               |

## Known seam debt

Upstream churns `Sidebar.tsx` and `index.css` heavily, and this fork edits both
in place rather than building in cold files with small anchors. That is the
reason a rebase here costs more than it should, and the reason a patch from
this branch will conflict with anyone else's sidebar work. Moving each feature
behind its flag into `components/sidebar/*` with a ≤3-line anchor is the
planned fix; `add-project-create-folder`, `thread-header-actions` and
`project-search` are already close to that shape.

## Taking a feature

The history is upstream's, so any T3 Code derivative can pull directly:

```bash
git remote add sbxs https://github.com/bobsandbox/t3code.git
git fetch sbxs
git log --oneline sbxs/sidebar   # one commit per feature, mostly
git cherry-pick <sha>
```
