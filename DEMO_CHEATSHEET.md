# Classroom demo cheat sheet

## Before class

1. With internet available, run `npm install`, `npm test`, and `npm run build`.
2. Disconnect from the internet and run `npm run offline` to check the local backup.
3. Open http://127.0.0.1:4173 and click **Reset Demo**.
4. Use browser fullscreen for the projector. Keep this cheat sheet on a second screen or print it.
5. Click the **11:00** timer once to start it. Click again to pause. Presenter notes are optional.

## Eleven-minute route

| Time | Chapter | Action |
| --- | --- | --- |
| 0:00–0:45 | The save journey | Click **Save project.txt**. Follow the five steps. |
| 0:45–1:45 | File organization | Choose each method, click **Find record 8**. |
| 1:45–2:45 | Logical file system | Select notes.txt or report.pdf; show metadata. |
| 2:45–3:45 | Physical file system | Show logical → physical block mapping. |
| 3:45–5:15 | Allocation strategies | Compare the same 6-block request. Explain overhead. |
| 5:15–6:00 | Free space management | Switch Bitmap / Free list / Grouping / Counting. |
| 6:00–9:00 | Fragmentation challenge | Follow the centerpiece sequence below. |
| 9:00–10:00 | Quiz and conclusion | Ask for votes, then select answer B. |
| 10:00–11:00 | Buffer | Audience response, replay, or guided-demo excerpts. |

The chapter labels allocate 10 minutes of direct content; the 11-minute timer includes a one-minute interaction buffer. Rehearse to your own speaking pace. The three-minute guided demo is an alternative to the main challenge segment, not an extra three minutes to add to the talk.

## The centerpiece: predict, reveal, compare

1. Click **07 The fragmentation challenge**. It loads the preset.
2. Show **10 free**, **largest run 3**, **6 data blocks needed**. Ask: “Will it fit?”
3. Wait for answers. Choose **Yes, it fits**, **It depends**, or **No** to record the room's prediction.
4. Click **01 Reveal contiguous**. It fails. There are still 10 free blocks.
5. Ask someone to point to six adjacent free blocks. They cannot. Explain external fragmentation.
6. Optional: click **Play** below the disk to inspect the first-fit scan. It is a replay of the completed attempt. Pause or use Previous Step / Next Step.
7. Click **02 Reveal linked**. The original snapshot is restored automatically; six scattered blocks are allocated. Four remain free. Read the chain below the disk.
8. Click **03 Reveal indexed**. The same original snapshot is restored again. Block 2 is marked **IDX**, six data blocks are allocated, and three remain free.
9. Say “six data plus one index is seven physical blocks.”
10. Click **Replay** to restore the original preset, or move to the quiz.

### Extra challenges if time permits

- **02 · Index overhead**: six free physical blocks in one run. Contiguous and linked succeed; indexed fails because it needs seven.
- **03 · Exact fit**: seven free physical blocks. Indexed succeeds and uses the last block.

## Guided three-minute alternative

Click **Simulator → Run Guided Demo**. Use **Next Step** after each narrated action:

1. Empty disk.
2. Create notes.txt, 4 blocks.
3. Create image.png, 8 blocks.
4. Create assignment.pdf, 6 blocks.
5. Delete image.png, releasing its middle run.
6. Create code.py, 5 blocks, reusing the hole by first fit.
7. Load a separate later fragmented snapshot. Ask for a prediction.
8. Attempt contiguous allocation: failure.
9. Restore that snapshot and allocate linked: success.
10. Restore it and allocate indexed: success, including the index overhead.

Previous Step restores the prior disk snapshot. Finish guide exits the narration panel. Avoid free experimentation while narrating the guide: each guide step deliberately restores its scripted snapshot.

## If something unexpected happens

- **Replay** restores the current prediction challenge.
- **Reset Demo** restores the original samples and first chapter.
- **Reset Disk** empties the simulator.
- Duplicate-name errors: change the file name, select another directory, or delete the old file.
- Cannot find a file: expand its parent folder.
- File stays in the old strategy: expected; the selector only controls new files.
- Blank hosted page or no network: use the local offline server and classroom ZIP.
- Escape exits fullscreen. Arrow keys and Space advance only when focus is outside controls; click a heading first or use Next chapter.
