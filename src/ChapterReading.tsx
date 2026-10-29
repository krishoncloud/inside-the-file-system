import type { ReactNode } from 'react';

function Part({ title, children }: { title: string; children: ReactNode }) {
  return <section className="reading-part"><h3>{title}</h3>{children}</section>;
}

function ExampleDisk({ blocks, label }: { blocks: string[]; label: string }) {
  return <figure className="example-disk"><figcaption>{label} · illustrative 12-block disk</figcaption><div>{blocks.map((owner, i) => <div className={owner === 'Free' ? 'example-free' : ''} key={i}><small>{i}</small><strong>{owner}</strong></div>)}</div></figure>;
}

const chapterTitles = [
  'Introduction to file systems',
  'File organization: records and access',
  'Logical file system: paths, metadata, and inodes',
  'Physical file system: bytes to block addresses',
  'Allocation strategies: worked examples and trade-offs',
  'Free-space management: four classical methods',
  'Connect everything: what saving a file really means',
  'Check your understanding and prepare for the viva'
];

const chapters: ReactNode[] = [
  <>
    <Part title="One example: save notes.txt">
      <p>Create <code>notes.txt</code>, write <code>Hello World!</code>, and press Ctrl+S. A file system connects that familiar name to the storage locations holding its data.</p>
      <p>Imagine a laptop with a 512 GB SSD. The device reads and writes at addressable locations; it does not inherently understand the folder hierarchy and file names shown by File Explorer.</p>
      <pre>{`C:/
├── Users/
│   └── Krish/
│       ├── notes.txt
│       ├── image.png
│       └── project.py
└── Program Files/`}</pre>
      <p>The file system creates and manages this organization. It is the mechanism an operating system uses to organize, store, retrieve, name, and manage files on storage devices.</p>
      <div className="reading-insight">A file system provides an abstraction over storage: applications work with files rather than managing raw storage addresses themselves.</div>
    </Part>
    <Part title="Five major responsibilities">
      <ol>
        <li><strong>Naming:</strong> associate stored data with a name such as <code>notes.txt</code>.</li>
        <li><strong>Organization:</strong> maintain files and directories.</li>
        <li><strong>Metadata management:</strong> track size, permissions, timestamps, and information used to locate data.</li>
        <li><strong>Space allocation:</strong> decide which blocks store a file’s data.</li>
        <li><strong>Free-space management:</strong> track which blocks are available.</li>
      </ol>
    </Part>
    <Part title="Ask for a name; the OS finds the data">
      <pre>{`with open("notes.txt", "r") as f:
    print(f.read())`}</pre>
      <p>The application does not need to know whether the bytes live at block 12, block 19, or elsewhere. The OS and file system locate and retrieve them. That is the value of abstraction and organization.</p>
    </Part>
  </>,
  <>
    <Part title="Organization and allocation answer different questions">
      <p><strong>File organization</strong> describes how records or data are arranged and accessed within a file. <strong>File allocation</strong> describes how the file’s blocks are placed on storage.</p>
      <p>Consider a student-record file. We want the record for roll number 104.</p>
      <div className="reading-table"><table><caption>Example records within one file</caption><thead><tr><th>Roll number</th><th>Name</th><th>Marks</th></tr></thead><tbody>{[[101, 'Aman', 85], [102, 'Riya', 91], [103, 'Kabir', 78], [104, 'Neha', 88], [105, 'Arjun', 95]].map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody></table></div>
    </Part>
    <Part title="A. Sequential organization">
      <p>Records are stored and processed in sequence. A basic sequential scan checks each record until it finds the target.</p>
      <pre>101 → 102 → 103 → 104</pre>
      <p>This is useful for processing records in order, such as generating a report. A basic linear search takes <code>O(n)</code> time in the worst case.</p>
    </Part>
    <Part title="B. Direct / random access organization">
      <p>Suppose every record occupies 100 bytes and record 104 is known to be the fourth record. Counting the first position from one, calculate:</p>
      <div className="reading-formula">Byte offset = (position − 1) × record size<br /><strong>(4 − 1) × 100 = 300 bytes</strong></div>
      <p>The system can seek to byte offset 300 without scanning the preceding three records.</p>
      <div className="reading-insight">Key 104 does not automatically mean position 4. Direct access needs a known mapping or a fixed-position scheme.</div>
    </Part>
    <Part title="C. Indexed organization">
      <p>To find “Deadlock” in a 500-page textbook, you consult the index instead of scanning every page. An indexed file similarly keeps a mapping:</p>
      <pre>Record key → Record location</pre>
      <p>Looking up the key gives the record’s location. This can be much faster than scanning a large file; the exact search cost depends on the index structure.</p>
      <p><strong>Indexed file organization and indexed disk allocation are different concepts.</strong> One locates records within a file; the other locates the file’s data blocks on storage.</p>
    </Part>
  </>,
  <>
    <Part title="Resolve a path to a file">
      <p>The logical file system manages the logical representation of files: names, directories, metadata, permissions and access control, file identifiers, and directory entries.</p>
      <pre>/home/krish/documents/notes.txt</pre>
      <p>Path resolution follows the directory entries to identify the intended file. Access-control information helps the OS decide whether the requested operation is permitted.</p>
    </Part>
    <Part title="Metadata means data about data">
      <div className="reading-table"><table><caption>Illustrative metadata for notes.txt</caption><tbody>{[['File size', '8 KiB (8192 bytes)'], ['Owner', 'krish'], ['Permissions', 'rw-r--r--'], ['File type', 'Regular file'], ['Identifier', 'Inode 2048 (example)']].map(([key, value]) => <tr key={key}><th scope="row">{key}</th><td>{value}</td></tr>)}</tbody></table></div>
      <p>On Unix-like file systems, an inode stores metadata and information needed to locate the file’s data. A directory maps a file name to a file identifier, such as an inode number.</p>
      <pre>{`Directory entry:
notes.txt → inode 2048

Inode 2048:
File size: 8192 bytes
Permissions: rw-r--r--
Data mapping: …`}</pre>
    </Part>
    <Part title="The name and contents are separate">
      <p>Renaming a file can update its directory entry without moving all of its data blocks. The file name itself is not the file’s contents, and the directory tree is not a picture of physical block placement.</p>
      <p>Try renaming a selected file in Simulator mode and inspect its identifier and allocated blocks afterward.</p>
      <p className="reading-context">These are explanatory metadata examples. The simulator uses its own file identifiers and data-block units, displays permissions without enforcing them, and keeps directory storage abstract.</p>
    </Part>
  </>,
  <>
    <Part title="Turn a file size into a block count">
      <p>Suppose <code>notes.txt</code> contains 8 KiB of data and the file system uses 4 KiB data blocks. Here, 1 KiB means 1024 bytes.</p>
      <div className="reading-formula">8 KiB ÷ 4 KiB per block = <strong>2 data blocks</strong></div>
      <p>More generally, round up when a file does not fill the final block: <code>data blocks = ceil(file bytes / block bytes)</code>. Allocation metadata can require additional storage.</p>
    </Part>
    <Part title="Logical blocks become storage addresses">
      <div className="reading-table"><table><caption>Illustrative logical-to-physical mapping</caption><thead><tr><th>Logical file block</th><th>Physical disk block</th></tr></thead><tbody><tr><td>0 — first block of notes.txt</td><td>5</td></tr><tr><td>1 — second block of notes.txt</td><td>10</td></tr></tbody></table></div>
      <p>The two blocks belonging to one file do not necessarily sit next to each other. The allocation strategy determines how they are placed and tracked.</p>
      <p className="reading-context">“Physical block” is a simulated storage address here, not a literal SSD cell location. The example’s 4 KiB block size is illustrative; the live engine uses generic equal-size block units.</p>
    </Part>
    <Part title="From application to device">
      <pre className="wrap-code">Application → File-system interface → Logical file system → Block mapping / allocation → Storage I/O → Device</pre>
      <p>This pipeline is a conceptual model. Actual storage stacks also involve mechanisms such as caching, buffering, and device address translation.</p>
    </Part>
  </>,
  <>
    <Part title="A. Contiguous allocation">
      <p>Use a 12-block disk and a file A requiring four data blocks. Contiguous allocation places them consecutively, at blocks 3, 4, 5, and 6.</p>
      <ExampleDisk label="File A: four consecutive data blocks" blocks={['Free', 'Free', 'Free', 'A', 'A', 'A', 'A', 'Free', 'Free', 'Free', 'Free', 'Free']} />
      <pre>{`Starting block = 3
Length = 4 blocks`}</pre>
      <p>To access the third block of the file, use logical block 2 because logical numbering begins at zero.</p>
      <div className="reading-formula">Physical block = start + logical block<br /><strong>3 + 2 = 5</strong></div>
      <p><strong>Advantages:</strong> simple mapping, efficient sequential access, and efficient random access.</p>
      <p><strong>Disadvantages:</strong> external fragmentation and difficult growth when the following blocks are occupied.</p>
    </Part>
    <Part title="External fragmentation: enough free blocks, no usable run">
      <ExampleDisk label="Five free blocks; largest free run is two" blocks={['A', 'A', 'Free', 'B', 'B', 'Free', 'C', 'C', 'Free', 'Free', 'D', 'Free']} />
      <p>The free addresses are 2, 5, 8, 9, and 11: five blocks total. A request for three contiguous blocks still fails because the largest free run is only two blocks.</p>
      <div className="reading-insight">External fragmentation means available space is split into separate regions. Total free capacity does not guarantee a sufficiently long consecutive run.</div>
    </Part>
    <Part title="B. Linked allocation">
      <p>A file’s data blocks can be scattered. Each block stores a pointer to the next, and metadata identifies the start of the chain.</p>
      <pre>Start → 2 → 8 → 4 → 11 → END</pre>
      <p>To read the fourth block in this simple chain, start at block 2 and follow the pointers through 8 and 4 to 11. You cannot calculate the fourth block’s address directly from the start.</p>
      <p><strong>Advantages:</strong> no consecutive-run requirement, use of scattered free space, and flexible growth by adding blocks.</p>
      <p><strong>Disadvantages:</strong> pointer storage, possible chain corruption, and random access that takes time proportional to the requested position in the chain.</p>
      <p className="reading-context">The simulator explicitly models next pointers. Their payload overhead is abstract rather than deducted from the data capacity of each block.</p>
    </Part>
    <Part title="C. Indexed allocation">
      <p>A dedicated index block stores the addresses of a file’s data blocks. For the same scattered data addresses:</p>
      <pre>{`Index entries: [2, 8, 4, 11]
Logical block 2 → index entry 2 → physical block 4`}</pre>
      <p>Reading the third logical block uses entry 2. There is no need to traverse earlier data blocks.</p>
      <p><strong>Advantages:</strong> efficient random access and noncontiguous data placement.</p>
      <p><strong>Disadvantages:</strong> extra index storage and a capacity limit. Larger designs may use multilevel indexing, which this single-index simulator does not implement.</p>
      <div className="reading-formula">N data blocks + 1 index block = <strong>N + 1 physical blocks</strong><br />In this simulator: at most 12 data addresses per index.</div>
    </Part>
    <Part title="Compare all three">
      <div className="reading-table"><table><caption>Classical allocation trade-offs</caption><thead><tr><th>Property</th><th>Contiguous</th><th>Linked</th><th>Indexed</th></tr></thead><tbody>{[
        ['Consecutive data blocks required', 'Yes', 'No', 'No'],
        ['Random access', 'Efficient: start + offset', 'Traverse the chain', 'Efficient: index lookup'],
        ['External fragmentation', 'Can prevent allocation', 'No consecutive-run requirement', 'No consecutive-run requirement'],
        ['Extra storage overhead', 'Low: start and length', 'Pointers', 'Index blocks'],
        ['File growth', 'Can be difficult', 'Flexible', 'Flexible within index capacity']
      ].map(row => <tr key={row[0]}><th scope="row">{row[0]}</th>{row.slice(1).map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody></table></div>
      <p>Linked and indexed allocation avoid the consecutive-free-run problem for data blocks; each still requires sufficient total physical space for its data and overhead.</p>
    </Part>
  </>,
  <>
    <Part title="Which blocks are available after creates and deletes?">
      <p>After hundreds of file operations, the OS needs a reliable way to identify available storage. Four classical approaches are bitmap, linked free list, grouping, and counting.</p>
    </Part>
    <Part title="A. Bitmap / bit vector">
      <p>Maintain one bit for every disk block. Our convention is <strong>0 = free</strong> and <strong>1 = allocated</strong>.</p>
      <p>The OS can scan for a zero to find an available block, or for consecutive zeroes to find a contiguous free run.</p>
      <div className="reading-formula">A disk with N blocks needs <strong>N bitmap bits</strong>.<br />64 blocks → 64 bits → 8 bytes for the raw bit vector.</div>
      <p>This is relatively compact. Use the live view above and its create/delete button to see the bitmap and disk update together.</p>
    </Part>
    <Part title="B. Linked free list">
      <pre>Free head → 2 → 5 → 9 → 14 → NULL</pre>
      <p>Allocation can remove an address from the list. Freeing a block can add it back. Finding a large consecutive region may require substantial traversal.</p>
    </Part>
    <Part title="C. Grouping">
      <p>A free block can hold the addresses of several free blocks instead of just one next pointer. Groups connect to further groups, allowing multiple free-block addresses to be obtained together.</p>
      <pre>{`Group 1: [2, 5, 9, 14] → next group
Group 2: [18, 20, 25, 27] → END`}</pre>
      <p className="reading-context">The live grouping view batches eight addresses per group and abstracts the on-disk storage of those group records.</p>
    </Part>
    <Part title="D. Counting">
      <p>Represent a consecutive free run as <code>(starting block, number of consecutive free blocks)</code> instead of listing every address separately.</p>
      <pre>{`Free blocks: 4, 5, 6, 7, 8  →  (4, 5)
Free blocks: 12, 13, 14     →  (12, 3)`}</pre>
      <p>Counting is particularly effective when free blocks occur in long consecutive runs.</p>
      <div className="reading-insight">These are alternative tracking structures. The simulator displays all four for comparison, deriving them from the same disk so the views agree.</div>
    </Part>
  </>,
  <>
    <Part title="Follow notes.txt through the whole save">
      <ol className="save-sequence">
        <li><strong>Application requests a write.</strong> Your editor asks the OS to save the data.</li>
        <li><strong>Logical file-system operations.</strong> The OS resolves the path, checks permissions, and identifies the file’s metadata.</li>
        <li><strong>Allocation and block mapping.</strong> If more storage is required, the file system finds free blocks and updates the mapping. Overwriting existing data does not always require a new allocation.</li>
        <li><strong>Storage I/O.</strong> Data and metadata updates pass through the storage stack. Caching and buffering may be involved.</li>
        <li><strong>File-system state is updated.</strong> Size, timestamps, allocation information, and free-space records are updated as necessary.</li>
      </ol>
      <p>The exact ordering and durability mechanisms vary by file system. This is a conceptual account of the responsibilities involved.</p>
      <div className="reading-insight"><strong>Save is not always a durability guarantee.</strong> Operating systems often buffer writes. A completed save does not necessarily mean every byte has reached persistent storage; additional synchronization may be needed.</div>
    </Part>
    <Part title="Why the live fragmentation challenge matters">
      <p>Our classroom snapshot has ten free blocks in runs of 3, 2, 3, 1, and 1. A six-data-block request fails contiguously, succeeds with linked placement, and needs seven physical blocks with the indexed model.</p>
      <p>Each reveal restores the same original disk. The result comes from the allocation engine, and a failed operation does not claim any blocks.</p>
      <p>Ask the room to predict first, then explain the difference between enough space in total and enough space under the chosen placement rule.</p>
    </Part>
    <Part title="Six syllabus topics, one connected story">
      <p><strong>The logical file system</strong> makes data accessible through names and metadata. <strong>Allocation strategies</strong> decide where the data blocks go. <strong>Free-space management</strong> identifies which blocks can be allocated next.</p>
    </Part>
  </>,
  <>
    <Part title="Explain the relationship in your own words">
      <p>A file system organizes storage and presents files as useful abstractions. File organization concerns records within a file. The logical layer handles names and metadata. Physical mapping connects logical file blocks to storage addresses.</p>
      <p>Allocation strategies decide how the file’s blocks are placed and tracked. Free-space management records which blocks are available for the next allocation.</p>
      <div className="reading-insight">Use the five-question Quick OS Viva below to check whether you can explain the ideas, rather than just memorize the slides.</div>
    </Part>
  </>
];

export function ChapterReading({ chapter }: { chapter: number }) {
  return <details className="chapter-reading"><summary><span><span className="eyebrow">FULL CHAPTER NOTES</span><strong>{chapterTitles[chapter]}</strong></span><span className="reading-toggle" aria-hidden="true">+</span></summary><div className="reading-body">{chapters[chapter]}</div></details>;
}

export const vivaQuestions = [
  { question: 'A file requires 5 blocks. There are 8 free blocks, but the largest free run is 3. Which method may fail due to fragmentation?', options: ['Contiguous allocation', 'Linked allocation', 'Indexed allocation', 'All three must fail'], answer: 0, explanation: 'Contiguous allocation needs five consecutive free blocks. Linked can use five scattered blocks, and our indexed model can use six physical blocks including its index.' },
  { question: 'Why is random access inefficient in simple linked allocation?', options: ['Blocks must be adjacent', 'The chain must be traversed', 'There is no file metadata', 'Files cannot be deleted'], answer: 1, explanation: 'The next address is stored in the preceding data block. Reaching a later block means following the chain from the start.' },
  { question: 'A file has 6 data blocks. In our simplified indexed scheme, how many physical disk blocks are needed?', options: ['5', '6', '7', '12'], answer: 2, explanation: 'Six data blocks plus one dedicated index block consume seven physical blocks.' },
  { question: 'What is the difference between file organization and file allocation?', options: ['They mean exactly the same thing', 'Organization concerns records within a file; allocation concerns disk-block placement', 'Organization only concerns permissions', 'Allocation only concerns filenames'], answer: 1, explanation: 'Organization describes records and access within a file. Allocation describes the placement and tracking of the file’s blocks on storage.' },
  { question: 'Which free-space method represents a free run using a starting address and a length?', options: ['Bitmap', 'Linked free list', 'Grouping', 'Counting'], answer: 3, explanation: 'Counting records each consecutive free run as a (start, count) pair, such as (4, 5) for blocks 4 through 8.' }
];

export function Viva({ answers, setAnswers, checked, setChecked }: { answers: (number | null)[]; setAnswers: (answers: (number | null)[]) => void; checked: boolean; setChecked: (checked: boolean) => void }) {
  const answered = answers.filter(a => a !== null).length;
  const score = answers.filter((a, i) => a === vivaQuestions[i].answer).length;
  return <section className="viva" aria-labelledby="viva-heading"><div className="viva-heading"><div><span className="eyebrow">TEACHER’S QUESTIONS · SELF CHECK</span><h2 id="viva-heading">Quick OS Viva</h2></div><span aria-live="polite">{answered}/5 answered</span></div><form onSubmit={e => { e.preventDefault(); setChecked(true); }}>{vivaQuestions.map((q, i) => <fieldset key={q.question} className={checked ? answers[i] === q.answer ? 'viva-correct' : 'viva-incorrect' : ''}><legend>{i + 1}. {q.question}</legend><div className="viva-options">{q.options.map((option, j) => <label key={option}><input type="radio" name={`viva-${i}`} value={j} checked={answers[i] === j} onChange={() => { setAnswers(answers.map((a, n) => n === i ? j : a)); setChecked(false); }} /><span>{option}</span></label>)}</div>{checked && <p className="viva-explanation"><strong>{answers[i] === q.answer ? 'Correct.' : `Correct answer: ${q.options[q.answer]}.`}</strong> {q.explanation}</p>}</fieldset>)}<div className="viva-actions"><button className="btn primary" type="submit" disabled={answered !== 5}>Check my answers</button><button className="btn" type="button" onClick={() => { setAnswers(Array(5).fill(null)); setChecked(false); }}>Reset viva</button><span className="muted">{answered < 5 ? 'Answer all five to check your understanding.' : 'Ready to check.'}</span></div>{checked && <div className="viva-score" role="status"><strong>{score}/5 correct</strong><p>{score === 5 ? 'You connected the concepts. Try explaining each answer aloud.' : 'Review the explanations above, then adjust your answers and try again.'}</p></div>}</form></section>;
}
