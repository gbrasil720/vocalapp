Here is the comprehensive Product Requirements Document (PRD) for the UI/UX polish of the Transcription Page. It focuses on elevating the user interface from "functional MVP" to "Premium SaaS."

PRD: Transcription View UI/UX Polish
Date: December 6, 2025 Priority: High (Pre-Launch Polish) Status: Ready for Development

1. Problem Statement
The current transcription interface functions correctly (including the click-to-jump feature) but suffers from low readability and visual clutter. The text appears dense ("wall of text"), the hover effects are visually jarring, and secondary metadata cards occupy too much valuable screen real estate above the fold. This reduces the perceived value of the product.

2. Objectives
Improve Readability: Transform the text display from a "system log" feel to a "blog post" reading experience.

Refine Interactivity: Make the interactive segment highlighting feel organic and fluid.

Optimize Hierarchy: prioritize content (the transcript) over metadata (file details/timestamps).

3. Functional & Design Requirements
3.1 Typography & Readability (The "Wall of Text" Fix)
Current Issue: Text is too dense, line height is too tight, and segments blend together indistinguishably.

Requirements:

Font Size: Increase base font size to 16px (or text-base/text-lg in Tailwind) for better legibility on desktop.

Line Height: Increase line height significantly to 1.6 or 1.8 (leading-loose). This adds "breathing room" between lines.

Segment Spacing: Add a small right margin (margin-right: 4px or 6px) to each text segment <span>. This visually separates sentences slightly without breaking the flow.

Font Color: Ensure high contrast but avoid pure white (#FFFFFF) on pure black. Use a slightly off-white (e.g., text-gray-100 or text-slate-200) to reduce eye strain.

3.2 Interactive Segment States (The "Hover" Fix)
Current Issue: Hovering creates a sharp, blocky gray background that looks like a rendering glitch.

Requirements:

Hover Style (Option A - Preferred): Instead of a background change, brighten the text color on hover.

Default: text-gray-300

Hover: text-cyan-400 (Brand Neon Color) + transition-colors duration-200.

Hover Style (Option B - Background): If retaining the background highlight, it must be subtle.

Style: bg-cyan-500/10 (10% opacity) with rounded-md (rounded corners).

Padding: Add tiny padding (px-1) so the background doesn't clip the text.

Cursor: Force cursor-pointer on all interactive segments.

3.3 Information Architecture (Layout Cleanup)
Current Issue: 5 large cards (File Details, Timeline, Transcription Info, etc.) push the actual transcript content below the fold.

Requirements:

Consolidation: Remove the grid of 5 cards.

New Header Design: Create a single, slim "Project Header" row above the text editor containing only essential info:

Left: Title (Editable via pencil icon).

Subtitle: Duration • Language • Date (Small, gray text).

Right: Action Buttons (Export, Share, Make Public).

Sidebar (Optional): If detailed metadata (File Size, Codec, ID) is needed, move it to a collapsible "Info" drawer or a narrow right-hand sidebar.

Visual Priority: The transcript text container should occupy at least 80% of the viewport height.

3.4 Player & Scroll Behavior
Current Issue: The fixed bottom player might overlap the last lines of text.

Requirements:

Padding Bottom: Add a large padding-bottom (e.g., pb-32 or 8rem) to the main text container. This ensures the user can scroll the final sentence well above the floating audio player.

Sticky Header: Keep the "Copy" and "Export" buttons sticky at the top of the screen or transcript container so they are accessible even when deep in a long text.

3.5 "Copy" Utility
Current Issue: The copy button is located at the bottom or is hard to find.

Requirements:

Placement: Place a prominent "Copy Text" button (Icon: Clipboard) at the top-right corner of the Transcript Card.

Feedback: Upon clicking, the icon should temporarily change to a Checkmark (✅) with a toast notification "Copied to clipboard".

4. Technical Implementation Notes (Tailwind CSS)
Suggested Segment Component Structure:

TypeScript

<span
  key={segment.id}
  onClick={() => handleJump(segment.start)}
  className="
    cursor-pointer
    text-gray-300
    text-lg
    leading-loose
    mr-1.5
    rounded-sm
    transition-colors
    duration-200
    hover:text-cyan-400
    hover:bg-cyan-500/5
  "
>
  {segment.text}
</span>
Suggested Container Structure:

TypeScript

<div className="max-w-4xl mx-auto pb-40"> {/* pb-40 prevents player overlap */}
   {/* Header Area */}
   <header className="mb-8">
      {/* Title and Metadata here */}
   </header>

   {/* Text Area */}
   <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 shadow-sm">
      {segments.map(...)}
   </div>
</div>