# Inside the File System: From Files to Disk Blocks

An interactive Operating Systems classroom presentation and a real, deterministic file-allocation simulator. The centerpiece asks students whether a six-block file fits into ten scattered free blocks, then tests their prediction using three allocation strategies.

## Run locally

Requires Node.js 22 and npm. Install dependencies once while online:

```sh
npm install
npm run dev
```

Open the URL printed by Vite. No API, account, database, remote font, or runtime network service is used. Once dependencies are installed, development works offline.

```sh
npm test
npm run build
npm run offline
```

The last command serves the production build at http://127.0.0.1:4173. The downloadable classroom ZIP includes `dist/` and `serve-offline.mjs`: with Node installed, it runs offline without installing packages. Opening `dist/index.html` directly as a file is not supported; use the local server.

## Classroom flow

Eight chapters cover file systems, file organization, the logical layer, physical mapping, allocation, free-space management, fragmentation, and a quiz. The planned sequence is 11 minutes, including three minutes devoted to the fragmentation challenge. See [PRESENTATION_SCRIPT.md](PRESENTATION_SCRIPT.md) and [DEMO_CHEATSHEET.md](DEMO_CHEATSHEET.md).

Use the chapter navigation or arrow keys/Space when focus is outside interactive controls. Keyboard navigation does not change chapters while editing an input or interacting with a button. Fullscreen uses the browser Fullscreen API; Escape exits. Presenter notes and an optional 11-minute countdown are in the footer.

Presentation and Simulator share the same state. Switching modes preserves it. Opening the fragmentation chapter from another chapter deliberately loads its preset. Replay reloads the selected challenge. Reset Demo restores initial sample files and chapter 1; Reset Disk clears file data and restores empty default directories. A page reload restores initial sample files; there is no persistence.

The simulator provides create/delete/rename file and folder operations, file metadata, an 8×8 physical disk, logical mapping, pointer arrows and chains, four synchronized free-space representations, comparison from independent snapshots, a guided demo, and a recent event log. Deleting a folder recursively deletes its descendants. Root cannot be renamed or removed.

## Technical model

- `src/engine.ts` is a pure state-transition engine. UI animation does not own allocation decisions.
- Each physical block is free, data, or index. An allocation commits atomically; failure changes only the event log. Runtime invariants detect invalid ownership, mappings, chains, and orphaned blocks.
- Contiguous allocation is first-fit, scanning physical blocks in ascending order for a sufficiently long free run.
- Linked allocation chooses free blocks in ascending address order, stores explicit next pointers, and terminates with `null`. Pointer storage overhead is abstract, not deducted from payload capacity. Direct access requires traversal of the simple chain.
- Indexed allocation reserves the first free block for its index, then N free data blocks. It consumes N+1 physical blocks and supports at most 12 data addresses. The index arrays are stored on the index blocks themselves.
- File sizes are integer data-block units from 1 to 12. Blocks have equal size; bytes and partial-block internal fragmentation are not modeled.
- The global strategy selector affects new allocations only. Each file retains its own allocation strategy.
- Bitmap convention: 0 = free, 1 = allocated. Bitmap, free list, batches of eight free addresses, and maximal contiguous runs are derived from the authoritative disk. Their own metadata storage costs are outside this model.
- Directories are logical objects; directory data-block storage is not modeled. Permissions are displayed, not enforced. Creation times use a deterministic simulated clock starting at 2026-01-01 UTC, not the user's wall clock.
- Algorithm controls replay an already completed atomic operation's inspection steps; they do not leave partially allocated files in live state. Highlighted squares show the trace. Select “pointers” to overlay linked-chain/index-reference arrows on the disk.
- The grouping view is an abstract grouping of free addresses, not a full on-disk grouped-list implementation.
- Modern file systems such as ext4, NTFS, and APFS use richer mechanisms than these classical teaching models.

## Reproducible fragmentation

Free physical block addresses are `[2,3,4,14,15,27,28,29,46,57]`. Runs have lengths 3, 2, 3, 1, 1. The occupied files are valid linked files with consistent data and next pointers. This is a constructed snapshot of a fragmented disk, not a claim that deleting bytes from a contiguous file can convert it into linked allocation.

Each reveal starts from that original snapshot:

| Strategy | Request | Result | Remaining free |
| --- | --- | --- | --- |
| Contiguous | 6 data | Fails: largest run is 3 | 10 |
| Linked | 6 data | Allocates 2, 3, 4, 14, 15, 27 | 4 |
| Indexed | 6 data + 1 index | Index 2; data 3, 4, 14, 15, 27, 28 | 3 |

Two additional challenges show why six free blocks cannot hold six indexed data blocks, and why seven free blocks can fit that indexed request exactly.

## Verification and deployment

`npm test` covers empty-disk allocation for all strategies, mixed ownership, complete filling and atomic failure, fragmentation, linked-chain integrity, indexed references and overhead, input validation, free-space synchronization, recursive directory deletion, and 400 seeded mixed operations.

GitHub Pages serves the committed `docs/` production snapshot from the `main` branch. To update it, run `npm test` and `npm run prepare:pages`, then commit and push the updated source and `docs/`. Configure Pages to deploy from `main` and `/docs`. This branch-based setup does not require permission to create GitHub Actions workflows. Relative asset paths allow deployment under a repository path. Authored code contains no comments; the build suppresses JavaScript legal comments and removes CSS comment banners. Dependencies are not vendored in the repository.

## Source map

- `src/engine.ts`: types, algorithms, directory operations, snapshots, invariants.
- `src/engine.test.ts`: automated engine checks.
- `src/main.tsx`: React Context state and interactive presentation/simulator.
- `src/content.ts`: lesson content, notes, and guided narration.
- `src/style.css`: responsive dark theme and reduced-motion handling.
- `serve-offline.mjs`: dependency-free local production server.
