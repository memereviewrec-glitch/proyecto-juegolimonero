#!/usr/bin/env python3
"""Generate the small MP3 sound bank used by the Limonero Fuzz prototype.

Requires numpy and ffmpeg with libmp3lame. Source tones mirror the former game
synth, but are now shipped and played as MP3 assets.
"""
from __future__ import annotations

import math
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "client" / "public" / "audio"
GUITAR_DIR = OUTPUT / "guitar"
SAMPLE_RATE = 44_100
BITRATE = "96k"


def midi_frequency(midi: int) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def encode_mp3(samples: np.ndarray, destination: Path, temporary_dir: Path) -> None:
    peak = float(np.max(np.abs(samples)))
    if peak > 0:
        samples = samples * (0.82 / peak)
    pcm = np.clip(samples * 32767, -32768, 32767).astype(np.int16)
    wav_path = temporary_dir / f"{destination.stem}.wav"
    with wave.open(str(wav_path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(pcm.tobytes())
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(wav_path),
         "-codec:a", "libmp3lame", "-b:a", BITRATE, "-ar", str(SAMPLE_RATE), str(destination)],
        check=True,
    )


def guitar_note(midi: int, duration: float = 2.0) -> np.ndarray:
    count = round(SAMPLE_RATE * duration)
    time = np.arange(count, dtype=np.float64) / SAMPLE_RATE
    fundamental = midi_frequency(midi)
    tone = np.zeros(count, dtype=np.float64)
    for harmonic in range(1, 9):
        partial = fundamental * harmonic * (1 + 0.000025 * harmonic * harmonic)
        tone += np.sin(2 * math.pi * partial * time + harmonic * 0.11) / harmonic**1.42
    attack = np.minimum(time / 0.018, 1.0)
    envelope = attack * np.exp(-0.13 * time)
    release_frames = round(SAMPLE_RATE * 0.24)
    envelope[-release_frames:] *= np.linspace(1, 0, release_frames)
    return tone * envelope


def whistle(notes: list[tuple[float, float, float, float]], duration: float) -> np.ndarray:
    count = round(SAMPLE_RATE * duration)
    output = np.zeros(count, dtype=np.float64)
    for start, length, low_hz, high_hz in notes:
        offset = round(start * SAMPLE_RATE)
        frames = round(length * SAMPLE_RATE)
        local_time = np.arange(frames, dtype=np.float64) / SAMPLE_RATE
        slope = (high_hz - low_hz) / length
        phase = 2 * math.pi * (low_hz * local_time + 0.5 * slope * local_time**2)
        fade = np.minimum(local_time / 0.025, 1.0) * np.minimum((length - local_time) / 0.035, 1.0)
        chirp = (np.sin(phase) + 0.12 * np.sin(2 * phase)) * np.clip(fade, 0, 1)
        output[offset:offset + frames] += chirp
    return output


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    GUITAR_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="limonero-audio-") as tmp:
        temporary_dir = Path(tmp)
        for midi in range(40, 74):
            encode_mp3(guitar_note(midi), GUITAR_DIR / f"guitar-midi-{midi}.mp3", temporary_dir)

        encode_mp3(
            whistle([(0.0, 0.45, 920, 1330), (0.56, 0.48, 1110, 1580)], 1.15),
            OUTPUT / "lemon-whistle.mp3",
            temporary_dir,
        )
        encode_mp3(
            whistle([(0.0, 0.16, 1480, 1980), (0.22, 0.15, 1710, 2240), (0.46, 0.19, 1560, 2100)], 0.72),
            OUTPUT / "bird-whistles.mp3",
            temporary_dir,
        )
    print(f"Generated 34 guitar notes and 2 whistles in {OUTPUT}")


if __name__ == "__main__":
    main()
