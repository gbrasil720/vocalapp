2. Feature: Interactive Transcript (Click-to-Jump)
2.1 Problem Statement
Navigating long audio files using only a timeline slider is imprecise. Users find it difficult to verify specific text segments against the audio or to replay a specific sentence they are reading.

2.2 User Story
As a user reviewing a transcript, I want to click on any sentence in the text to instantly hear the audio corresponding to that specific moment, so I can verify accuracy or listen to context without scrubbing the timeline.

2.3 Functional Requirements
The text display must be synchronized with the HTML5 Audio Player.

Granularity: The interactivity should be at the Segment level (phrases/sentences returned by Whisper), not the block level.

Action: Clicking a text segment must set the audio player's current time to the segment's start timestamp and ensure playback is active.

2.4 UX/UI Design
Visual Cues:

The text must not look like a static wall of text.

Hover State: When the mouse hovers over a segment, the background of that specific segment should highlight (e.g., bg-primary/10) and the text color should brighten slightly.

Cursor: The cursor must change to a pointer (hand icon).

Active State (Optional/Nice to have): The segment currently being spoken should be highlighted automatically as audio plays (requires a timeupdate listener).

2.5 Technical Implementation Notes
Data Structure: The rendering component must map over transcription.segments instead of rendering transcription.text.

Player Reference: Use a React useRef to access the <audio> element.