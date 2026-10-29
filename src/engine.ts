export type AllocationStrategy = 'contiguous' | 'linked' | 'indexed';
export type DiskBlock = { id: number; owner: string | null; kind: 'free' | 'data' | 'index'; logical: number | null; next: number | null; references: number[] };
export type FileMetadata = { size: number; type: string; permissions: string; created: string };
export type SimulatedFile = FileMetadata & { id: string; name: string; directory: string; strategy: AllocationStrategy; blocks: number[]; indexBlock: number | null };
export type Directory = { id: string; name: string; parent: string | null };
export type SimulationEvent = { id: number; message: string; success: boolean };
export type State = { disk: DiskBlock[]; files: SimulatedFile[]; directories: Directory[]; events: SimulationEvent[]; serial: number };
export type TraceStep = { blocks: number[]; message: string };
export type AllocationResult = { state: State; success: boolean; message: string; trace: TraceStep[]; file?: SimulatedFile };
export type FreeSpaceRepresentation = { bitmap: number[]; free: number[]; groups: number[][]; runs: { start: number; count: number }[]; largest: number };
export const strategies: AllocationStrategy[] = ['contiguous', 'linked', 'indexed'];
export const empty = (): State => ({ disk: Array.from({ length: 64 }, (_, id) => ({ id, owner: null, kind: 'free', logical: null, next: null, references: [] })), files: [], directories: [{ id: 'root', name: '/', parent: null }, { id: 'documents', name: 'Documents', parent: 'root' }, { id: 'pictures', name: 'Pictures', parent: 'root' }, { id: 'projects', name: 'Projects', parent: 'root' }], events: [], serial: 0 });
export function freeSpace(state: State): FreeSpaceRepresentation {
  const free = state.disk.filter(b => b.kind === 'free').map(b => b.id);
  const runs: FreeSpaceRepresentation['runs'] = [];
  for (const id of free) { const last = runs.at(-1); if (last && last.start + last.count === id) last.count++; else runs.push({ start: id, count: 1 }); }
  return { free, bitmap: state.disk.map(b => Number(b.kind !== 'free')), runs, groups: Array.from({ length: Math.ceil(free.length / 8) }, (_, i) => free.slice(i * 8, i * 8 + 8)), largest: Math.max(0, ...runs.map(r => r.count)) };
}
function event(state: State, message: string, success: boolean): State { return { ...state, serial: state.serial + 1, events: [...state.events.slice(-39), { id: state.serial + 1, message, success }] }; }
function validName(state: State, name: string, parent: string, except?: string) { return !!name.trim() && !/[\/\\]/.test(name) && name !== '.' && name !== '..' && !state.files.some(f => f.id !== except && f.directory === parent && f.name === name) && !state.directories.some(d => d.id !== except && d.parent === parent && d.name === name); }
export function allocate(state: State, name: string, size: number, strategy: AllocationStrategy, directory = 'documents'): AllocationResult {
  const trace: TraceStep[] = [];
  const fail = (message: string): AllocationResult => ({ state: event(state, message, false), success: false, message, trace });
  name = name.trim();
  if (!state.directories.some(d => d.id === directory)) return fail('Directory does not exist.');
  if (!validName(state, name, directory)) return fail('Use a unique, nonempty name without slashes.');
  if (!Number.isInteger(size) || size < 1 || size > 12) return fail('Choose 1–12 data blocks. A single index supports at most 12 addresses.');
  const space = freeSpace(state);
  const needed = size + Number(strategy === 'indexed');
  let blocks: number[] = [];
  if (strategy === 'contiguous') {
    let run: number[] = [];
    for (const block of state.disk) {
      run = block.kind === 'free' ? [...run, block.id] : [];
      trace.push({ blocks: [block.id], message: `Inspect block ${block.id}: ${block.kind === 'free' ? `free run ${run.length}/${size}` : 'occupied; restart run'}.` });
      if (run.length === size) { blocks = run; break; }
    }
    if (!blocks.length) return fail(`Allocation failed: ${space.free.length} free blocks, but the largest run is ${space.largest}. No ${size} consecutive free blocks exist.`);
  } else {
    if (space.free.length < needed) return fail(`${strategy === 'indexed' ? `${size} data + 1 index = ${needed}` : needed} physical blocks needed; only ${space.free.length} available.`);
    blocks = space.free.slice(0, needed);
    blocks.forEach((b, i) => trace.push({ blocks: [b], message: strategy === 'indexed' && i === 0 ? `Reserve block ${b} as the index.` : `Choose free block ${b} in ascending address order.` }));
  }
  const indexBlock = strategy === 'indexed' ? blocks[0] : null;
  const dataBlocks = strategy === 'indexed' ? blocks.slice(1) : blocks;
  const id = `f${state.serial + 1}`;
  const file: SimulatedFile = { id, name, directory, size, strategy, blocks: dataBlocks, indexBlock, type: name.includes('.') ? name.split('.').at(-1)! : 'file', permissions: 'rw-r--r--', created: new Date(Date.UTC(2026, 0, 1, 0, 0, state.serial)).toISOString() };
  const disk = state.disk.map(b => {
    if (b.id === indexBlock) return { ...b, owner: id, kind: 'index' as const, references: [...dataBlocks] };
    const logical = dataBlocks.indexOf(b.id);
    return logical < 0 ? b : { ...b, owner: id, kind: 'data' as const, logical, next: strategy === 'linked' ? dataBlocks[logical + 1] ?? null : null };
  });
  const message = `${name}: allocated ${size} data block${size === 1 ? '' : 's'}${indexBlock !== null ? ' + 1 index block' : ''} using ${strategy} allocation.`;
  const next = event({ ...state, disk, files: [...state.files, file] }, message, true);
  assertConsistent(next);
  trace.push({ blocks, message });
  return { state: next, success: true, message, file, trace };
}
export function deleteFile(state: State, id: string): State {
  const file = state.files.find(f => f.id === id);
  if (!file) return state;
  const next = event({ ...state, disk: state.disk.map(b => b.owner === id ? { id: b.id, owner: null, kind: 'free', logical: null, next: null, references: [] } : b), files: state.files.filter(f => f.id !== id) }, `Deleted ${file.name}; released ${file.size + Number(file.indexBlock !== null)} physical blocks.`, true);
  assertConsistent(next); return next;
}
export function addDirectory(state: State, name: string, parent: string): State {
  name = name.trim();
  if (!state.directories.some(d => d.id === parent) || !validName(state, name, parent)) return event(state, 'Invalid or duplicate folder name.', false);
  return event({ ...state, directories: [...state.directories, { id: `d${state.serial + 1}`, name, parent }] }, `Created logical folder ${name}; no data blocks consumed.`, true);
}
export function rename(state: State, id: string, name: string): State {
  name = name.trim(); const f = state.files.find(f => f.id === id); const d = state.directories.find(d => d.id === id);
  const parent = f?.directory ?? d?.parent;
  if (!parent || !validName(state, name, parent, id)) return event(state, 'Invalid or duplicate name.', false);
  return event({ ...state, files: state.files.map(x => x.id === id ? { ...x, name, type: name.split('.').at(-1)! } : x), directories: state.directories.map(x => x.id === id ? { ...x, name } : x) }, `Renamed item to ${name}.`, true);
}
export function deleteDirectory(state: State, id: string): State {
  if (id === 'root') return event(state, 'The root directory cannot be deleted.', false);
  let next = state;
  for (const child of state.directories.filter(d => d.parent === id)) next = deleteDirectory(next, child.id);
  for (const file of next.files.filter(f => f.directory === id)) next = deleteFile(next, file.id);
  return event({ ...next, directories: next.directories.filter(d => d.id !== id) }, 'Deleted folder and its contents.', true);
}
export function fragmentation(): State {
  let state = empty();
  for (let i = 0; i < 8; i++) state = allocate(state, `segment-${i + 1}.bin`, 8, 'contiguous').state;
  const free = new Set([2, 3, 4, 14, 15, 27, 28, 29, 46, 57]);
  state = { ...state, disk: state.disk.map(b => free.has(b.id) ? { id: b.id, owner: null, kind: 'free', logical: null, next: null, references: [] } : b), files: state.files.map(f => ({ ...f, strategy: 'linked', blocks: f.blocks.filter(id => !free.has(id)), size: f.blocks.filter(id => !free.has(id)).length })), events: [] };
  state.disk = state.disk.map(b => { const file = state.files.find(f => f.id === b.owner); if (!file) return b; const logical = file.blocks.indexOf(b.id); return { ...b, logical, next: file.blocks[logical + 1] ?? null }; });
  assertConsistent(state); return state;
}
export function initial(): State { let state = empty(); for (const [name, size, dir] of [['notes.txt', 4, 'documents'], ['report.pdf', 6, 'documents'], ['photo.png', 8, 'pictures'], ['code.py', 3, 'projects']] as const) state = allocate(state, name, size, 'contiguous', dir).state; return state; }
export function compare(state: State, size: number) { return strategies.map(strategy => ({ strategy, result: allocate(state, `comparison-${state.serial}.bin`, size, strategy, 'root') })); }
export function assertConsistent(state: State) {
  const claimed = new Set<number>();
  if (state.disk.length !== 64) throw new Error('Disk must contain 64 blocks');
  for (const file of state.files) {
    if (file.blocks.length !== file.size || !state.directories.some(d => d.id === file.directory)) throw new Error('Invalid file metadata');
    if (file.strategy === 'contiguous' && file.blocks.some((id, i) => id !== file.blocks[0] + i)) throw new Error('Noncontiguous file');
    if ((file.strategy === 'indexed') !== (file.indexBlock !== null)) throw new Error('Invalid index ownership');
    for (const [i, id] of file.blocks.entries()) {
      const b = state.disk[id];
      if (claimed.has(id) || !b || b.owner !== file.id || b.kind !== 'data' || b.logical !== i || b.next !== (file.strategy === 'linked' ? file.blocks[i + 1] ?? null : null)) throw new Error('Invalid data mapping');
      claimed.add(id);
    }
    if (file.indexBlock !== null) { const b = state.disk[file.indexBlock]; if (claimed.has(b.id) || b.owner !== file.id || b.kind !== 'index' || JSON.stringify(b.references) !== JSON.stringify(file.blocks)) throw new Error('Invalid index'); claimed.add(b.id); }
  }
  for (const [i, b] of state.disk.entries()) if (b.id !== i || (b.kind === 'free' ? b.owner !== null || b.logical !== null || b.next !== null || b.references.length !== 0 : !claimed.has(i))) throw new Error('Orphaned or corrupt block');
}
