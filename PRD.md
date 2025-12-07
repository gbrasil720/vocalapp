PRD: VocalApp Pre-Launch Features
Date: December 6, 2025 Status: Ready for Development Priority: High (Blocker for Launch)

1. Feature: Export Suite (Client-Side)
1.1 Problem Statement
Users currently have no way to extract the transcribed text from the platform for use in external workflows (e.g., video editing, content writing, archiving). This limits the product's value to a "read-only" experience.

1.2 User Story
As a content creator (YouTuber/Podcaster), I want to download my transcription in specific formats (SRT for video, TXT for blogs) so that I can immediately use the output in my production software without manual formatting.

1.3 Functional Requirements
The system must provide a "Download" action that generates files locally (Client-Side) based on the current transcription data.

Supported Formats:

SubRip (.srt): Must follow standard SRT formatting (Index, HH:MM:SS,ms, Text). Crucial: Milliseconds must be separated by a comma (,).

WebVTT (.vtt): Must follow W3C standards (WEBVTT header, HH:MM:SS.ms). Crucial: Milliseconds must be separated by a period (.).

Plain Text (.txt): Pure text content with line breaks preserved, stripped of timestamps and metadata.

JSON (.json): The raw data object containing segments, language, and duration.

File Naming: The downloaded file must automatically adopt the name of the transcription project.

Example: If project is "Podcast #1", file is Podcast #1.srt.

Fallback: If name is empty, use transcript-[date].srt.

1.4 UX/UI Design
Placement: Add an "Export" or "Download" button (icon: Download) in the transcription view header (top-right), adjacent to the status/date.

Interaction: Clicking the button opens a small dropdown menu listing the 4 formats.

Action: Clicking a format triggers the browser's native download prompt immediately.

1.5 Technical Implementation Notes
Logic: Implement a utility function generateExportBlob(data, format) in the frontend.

No API Calls: Do not send a request to the server. Generate the Blob object in the browser using the existing segments array currently displayed on screen.

Memory: Revoke the URL.createObjectURL after download to prevent memory leaks.