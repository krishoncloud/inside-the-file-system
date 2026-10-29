# Inside the File System: From Files to Disk Blocks

Target: 10–12 minutes, including audience pauses. The app's eight chapter durations total 10 minutes; use the remaining minute for answers and transitions. The fragmentation segment is the centerpiece. The optional guided demo replaces that segment rather than extending the talk.

## 1. You press Ctrl+S — 45 seconds

“Think about the last time you saved an assignment. You pressed Ctrl+S, saw a file name, and moved on. But the storage device does not understand ‘my assignment’ or ‘the Documents folder.’ So what actually happens?”

[Click **Save project.txt**. Follow the highlighted steps.]

“The application asks the operating system to save. The file system records information about the file and decides which storage blocks will hold its data. These squares are our disk. The allocation here is real within the simulation: occupied blocks cannot be handed to another file.”

“A file system gives data names, organizes it into directories, stores it, and helps us retrieve it. Today we will connect the names we see to the addresses the machine needs.”

“First, let us look inside a file.”

## 2. File organization — 1 minute

“Suppose a file holds ten records, and we want record eight. There are different ways to organize and access those records.”

[Choose **Sequential**, then **Find record 8**.]

“With sequential organization, we scan in order. We pass records one through seven before reaching eight.”

[Choose **Direct**, then **Find record 8**.]

“With direct access, a known position lets us calculate a location. For fixed-size records, the offset is seven times the record size, because the first record starts at offset zero.”

[Choose **Indexed**, then **Find record 8**.]

“An index maps a key to a record location. Think of looking up a topic in a book's index.”

“Keep one distinction in mind: this is organization inside a file. Later, allocation will mean placing the file's data blocks on a physical disk. Both may use indexes, but they operate at different levels.”

## 3. The logical file system — 1 minute

[Open **Logical file system** and select a file.]

“This is the familiar view: folders, file names, and properties. The logical file system manages naming, directories, metadata, and access-control information.”

“Here is the file's name. Here is its identifier, which gives us a stable way to refer to it. Here are its size, type, permissions, and creation time. This app uses a simulated clock, and it displays permissions without enforcing them.”

“A directory connects a name to a file. It is not a drawing of the file's physical position. Files next to one another in a folder do not have to be next to one another on disk.”

“Our model also keeps directory storage abstract. Creating a folder does not consume data blocks here. A complete file system would have to store its directory information somewhere.”

“Now let us follow a file beyond its name.”

## 4. The physical view — 1 minute

[Select **Physical file system** and select report.pdf or another file.]

“These 64 numbered squares represent physical storage blocks. Look at the mapping below the grid. Logical block zero is the first block of this particular file. Its physical address can be somewhere else entirely.”

“That is why we need a mapping. ‘First in my file’ and ‘first on the disk’ are different ideas.”

“The pipeline below is a conceptual picture: the application makes a request, the file-system layers manage metadata and mapping, and storage I/O reaches the device. Real systems include more layers, caches, and hardware translation.”

“We use equal-size data-block units today. We are not modeling byte contents or the unused part of a partially filled block. That lets us focus on one question: which free blocks should this file receive?”

## 5. Three allocation strategies — 1 minute 30 seconds

[Open **Allocation strategies**. Keep the request at 6.]

“Contiguous allocation puts a file in consecutive physical blocks. Once you know the start and the length, finding a particular block is simple: add its offset. Sequential access is straightforward too.”

“The cost is flexibility. A file needs a long enough empty run. Growing it can be difficult if its neighbor is occupied; the system may need to move it or use a different allocation design.”

“Linked allocation allows scattered blocks. Each block points to the next one. That uses holes in the disk, but finding a later block requires following the chain. In this model, pointer overhead is acknowledged but not subtracted from the block's data payload.”

“Indexed allocation stores data-block addresses in a separate index block. We can look up the requested logical block through the index. But the index itself costs space.”

[Point to the physical-block totals in the comparison.]

“Six data blocks need seven physical blocks with our indexed model. A single index supports at most twelve addresses here. We are not silently adding more index blocks.”

“The comparison uses separate results from the same starting disk. It does not modify our live disk. None of these strategies is always best; each trades space, access, and flexibility differently.”

## 6. Tracking free space — 45 seconds

[Switch through the four views.]

“How does the file system know what is available? A bitmap uses a bit per block. Our convention is zero for free and one for allocated.”

“A free list connects available addresses. Grouping collects addresses into batches. Counting records a run as a start address and a length.”

[Create or delete a file with the button beside the view.]

“Notice that the representation changes with the disk. These are alternatives a system could use, not four independent answers that can disagree. Here we derive all four from one authoritative state.”

“Now we have enough information to make a prediction.”

## 7. The fragmentation challenge — 3 minutes

[Open **The fragmentation challenge**. Do not reveal immediately.]

“This disk has ten free blocks. I want to save a file that needs six data blocks. Will it fit?”

[Pause for about 15 seconds. Ask for hands. Record the room's prediction.]

“Ten is greater than six, so yes is a reasonable first answer. But look carefully at where those free blocks are.”

[Click **Reveal contiguous**.]

“It fails. And we still have ten free blocks. The failed attempt has not partially allocated the file.”

“Can anyone point to six consecutive free blocks?”

[Pause for an answer. Point to the runs.]

“The holes have lengths three, two, three, one, and one. Their total is ten, but the largest single run is only three. Contiguous allocation needs one run of six. This is external fragmentation: available space is separated into holes.”

[Optionally play a short portion of the scan, then pause.]

“The scan checks addresses in order, restarting its free-run count whenever it meets an occupied block. The animation replays the algorithm's trace; it does not fake the result.”

[Click **Reveal linked**.]

“We have restored exactly the same initial disk. Linked allocation chooses six available blocks: two, three, four, fourteen, fifteen, and twenty-seven. The arrows in the chain connect them. Four free blocks remain.”

“The file fits because linked allocation does not require its blocks to be adjacent. The trade-off is that accessing a later block means following pointers through the earlier blocks.”

[Click **Reveal indexed**.]

“Again, the same starting snapshot. This time block two is the index. It stores the addresses of six data blocks. Seven physical blocks are consumed, so three remain free.”

“Here is a second prediction: if there were only six free physical blocks, would that indexed file fit?”

[Take an answer. If time permits, choose **Index overhead**, then **Reveal indexed**.]

“No. Six data plus one index needs seven. It is not enough to count the payload and forget the structure that locates it.”

“That is why allocation strategies exist. Free space is a quantity, but usable space also has a shape. We need to consider both the placement rules and the overhead.”

## 8. Quiz and conclusion — 1 minute

[Open **Quiz & conclusion**. Ask for votes before selecting B.]

“Your disk has ten free blocks, but a six-block file cannot be allocated contiguously. Why? Is the disk full, is the file corrupted, is there a five-block limit, or are the free blocks fragmented?”

[Select **B**. Pause for the free-run visualization.]

“The blocks are fragmented. Total capacity does not guarantee a sufficiently long run.”

“Today we moved from names and directories to metadata, from logical file blocks to physical addresses, and from allocation decisions to tracking available space. We also separated record organization from block allocation.”

“Modern file systems use more sophisticated mechanisms than these classical models. But the underlying questions remain: where is my data, how do I find it, and how do I use the remaining storage?”

“A file system is the bridge between the files we understand and the storage hardware that actually holds them.”

[Use the remaining minute for questions or replay the most surprising result.]
