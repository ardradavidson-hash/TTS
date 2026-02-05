# Text To Speech App

A simple desktop Text-To-Speech (TTS) application built with Electron and Node.js.

This app allows users to upload text or PDF documents and convert them into audio, with controls for playback, speed, and navigation.

---

## Features

- Upload **Text Files** or **PDF Documents**
- Converts text into **spoken audio**
- **Pause / Resume**
  - Button
  - Keyboard shortcut: `P`
- **Forward / Rewind**
  - Buttons
  - Keyboard shortcuts: `→` and `←`
- **Speed Adjustment Slider**
- **Sentence-by-Sentence Reading Mode**
  - Automatic pause after each sentence
  - Press `Spacebar` to move to the next sentence
  - Press `P` to pause between sentences
  - Helpful for note-taking or studying
- **PDF Split View**
  - Right panel shows the actual PDF
  - Left panel shows the extracted text being read
  - Current sentence is **highlighted**
- **Dark Mode**

---

## How To Use

### Uploading Files
- Open the app
- Upload either:
  - A `.txt` file  
  - A `.pdf` file

### Controls

| Action | Button | Keyboard |
|-------|--------|---------|
| Pause / Resume | Pause Button | `P` |
| Next Sentence | — | `Spacebar` |
| Rewind | Rewind Button | `←` |
| Forward | Forward Button | `→` |
| Adjust Speed | Slider | — |

---

## Best Use Cases
- Studying
- Listening to long PDFs
- Writing notes while listening
- Accessibility / reading assistance

---

## Tech Stack
- Electron
- Node.js
- JavaScript
- HTML / CSS

---

## Installation (For Developers)

```bash
npm install
npm start
