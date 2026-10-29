import { describe, it, expect } from 'vitest';
import { allocate, empty, deleteFile, fragmentation, freeSpace, assertConsistent, compare, addDirectory, deleteDirectory, rename, strategies } from './engine';
describe('allocation state machine', () => {
  it.each(strategies)('allocates and releases %s files including overhead', strategy => {
    const before = empty(); const result = allocate(before, 'test.txt', 6, strategy);
    expect(result.success).toBe(true); expect(before.files).toHaveLength(0);
    expect(freeSpace(result.state).free.length).toBe(64 - 6 - Number(strategy === 'indexed'));
    expect(deleteFile(result.state, result.file!.id).disk).toEqual(empty().disk);
    assertConsistent(result.state);
  });
  it('uses first fit and maintains disjoint mixed strategies', () => {
    let s = empty(); for (const strategy of strategies) s = allocate(s, strategy, 4, strategy).state;
    expect(s.files.map(f => f.blocks)).toEqual([[0,1,2,3],[4,5,6,7],[9,10,11,12]]);
    expect(s.disk[8].references).toEqual([9,10,11,12]); expect(s.disk[4].next).toBe(5); expect(s.disk[7].next).toBeNull(); assertConsistent(s);
  });
  it('fills a disk and fails atomically when full', () => {
    let s = empty(); for (let i=0;i<8;i++) s=allocate(s, `${i}`, 8, 'contiguous').state;
    expect(freeSpace(s).free).toHaveLength(0);
    for (const strategy of strategies) { const r=allocate(s,'overflow',1,strategy); expect(r.success).toBe(false); expect(r.state.disk).toEqual(s.disk); }
  });
  it('reproduces the fragmentation prediction with exactly ten free and largest run three', () => {
    const s=fragmentation(); expect(freeSpace(s).free).toHaveLength(10); expect(freeSpace(s).largest).toBe(3);
    const results=compare(s,6); expect(results.map(r=>r.result.success)).toEqual([false,true,true]);
    expect(results.map(r=>freeSpace(r.result.state).free.length)).toEqual([10,4,3]); expect(s).toEqual(fragmentation());
    results.forEach(r=>assertConsistent(r.result.state));
  });
  it('requires a separate index block even when data alone fits', () => {
    let s=empty(); for(let i=0;i<7;i++) s=allocate(s,`${i}`,8,'linked').state;
    s=allocate(s,'extra',2,'linked').state;
    expect(allocate(s,'data',6,'linked').success).toBe(true); expect(allocate(s,'index',6,'indexed').success).toBe(false);
  });
  it('validates sizes, names and directories without allocating', () => {
    let s=allocate(empty(),'same.txt',2,'linked').state;
    for(const n of [0,13,-1,1.5,NaN]) expect(allocate(s,'invalid',n,'indexed').success).toBe(false);
    expect(allocate(s,'same.txt',1,'linked').success).toBe(false); expect(allocate(s,'/bad',1,'linked').success).toBe(false);
    expect(allocate(s,'file',1,'linked','missing').success).toBe(false);
  });
  it('derives all free-space structures from the disk after deletion', () => {
    const s=fragmentation(); const after=deleteFile(s,s.files[0].id); const f=freeSpace(after);
    expect(f.bitmap.filter(b=>b===0)).toHaveLength(f.free.length); expect(f.groups.flat()).toEqual(f.free);
    expect(f.runs.flatMap(r=>Array.from({length:r.count},(_,i)=>r.start+i))).toEqual(f.free);
  });
  it('handles rename and recursive folder deletion', () => {
    let s=addDirectory(empty(),'nested','documents'); const id=s.directories.at(-1)!.id;
    s=allocate(s,'one.txt',3,'indexed',id).state; s=rename(s,s.files[0].id,'two.txt'); expect(s.files[0].name).toBe('two.txt');
    s=deleteDirectory(s,'documents'); expect(s.files).toHaveLength(0); expect(freeSpace(s).free).toHaveLength(64); expect(s.directories.some(d=>d.id===id)).toBe(false);
  });
  it('preserves existing file metadata when adding another strategy', () => {
    const a=allocate(empty(),'original',5,'contiguous');
    const b=allocate(a.state,'different',3,'indexed');
    expect(b.state.files[0]).toEqual(a.file); expect(b.state.disk.slice(0,5)).toEqual(a.state.disk.slice(0,5));
  });
  it('supports the maximum single index capacity and deterministic resets', () => {
    const r=allocate(empty(),'maximum',12,'indexed'); expect(r.success).toBe(true); expect(r.state.disk[r.file!.indexBlock!].references).toHaveLength(12);
    for(let i=0;i<5;i++){expect(empty()).toEqual(empty());expect(compare(fragmentation(),6)).toEqual(compare(fragmentation(),6));}
  });
  it('keeps invariants across 400 deterministic mixed operations', () => {
    let s=empty(); let seed=17; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed;};
    for(let i=0;i<400;i++){ if(s.files.length && rand()%3===0) s=deleteFile(s,s.files[rand()%s.files.length].id); else s=allocate(s,`file-${i}`,rand()%12+1,strategies[rand()%3]).state; assertConsistent(s); }
  });
});
