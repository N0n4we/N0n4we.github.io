import { useEffect, useRef, useState } from 'react';
import APlayer from 'aplayer';
import {
  MUSIC_RHYTHM_CALIBRATIONS,
  musicRhythm,
  type MusicRhythmCalibration,
} from '../modules/musicRhythm';

interface Song {
  name: string;
  artist: string;
  url: string;
  cover: string;
  rhythmCalibration: MusicRhythmCalibration;
}

const assetUrl = (path: string) =>
  `${import.meta.env.BASE_URL}${encodeURI(path)}`;

const songs: Song[] = [
  {
    name: 'How to practice opening your eyes underwater',
    artist: 'slowly, slowly',
    url: assetUrl('songs/How to practice opening your eyes underwater.mp3'),
    cover: assetUrl('songs/How to practice opening your eyes underwater.jpg'),
    rhythmCalibration: MUSIC_RHYTHM_CALIBRATIONS.mia,
  },
  {
    name: 'soul seeking, searching',
    artist: 'raiwinnn',
    url: assetUrl('songs/soul seeking, searching.mp3'),
    cover: assetUrl('songs/soul seeking, searching.jpg'),
    rhythmCalibration: MUSIC_RHYTHM_CALIBRATIONS.mia,
  },
  {
    name: 'MIA',
    artist: 'raiwinnn',
    url: assetUrl('songs/raiwinnn - MIA.mp3'),
    cover: assetUrl('songs/raiwinnn - MIA.jpg'),
    rhythmCalibration: MUSIC_RHYTHM_CALIBRATIONS.mia,
  },
  {
    name: 'iN_mY_BED',
    artist: 'vulx',
    url: assetUrl('songs/vulx - iN_mY_BED.mp3'),
    cover: assetUrl('songs/vulx - iN_mY_BED.jpg'),
    rhythmCalibration: MUSIC_RHYTHM_CALIBRATIONS.inMyBed,
  },
  {
    name: 'because it hurts to lose',
    artist: 'grape milk',
    url: assetUrl('songs/grape milk - because it hurts to lose.mp3'),
    cover: assetUrl('songs/grape milk - because it hurts to lose.jpg'),
    rhythmCalibration: MUSIC_RHYTHM_CALIBRATIONS.becauseItHurtsToLose,
  },
  {
    name: 'DEFINITIVAMENTE AFIADO',
    artist: 'ALIEN Z',
    url: assetUrl('songs/ALIEN Z - DEFINITIVAMENTE AFIADO.mp3'),
    cover: assetUrl('songs/ALIEN Z - DEFINITIVAMENTE AFIADO.png'),
    rhythmCalibration: MUSIC_RHYTHM_CALIBRATIONS.mia,
  },
  {
    name: 'Rinse and Repeat (O-Prime Delta Remix)',
    artist: 'CyanBlue, O-Prime Delta',
    url: assetUrl('songs/CyanBlue, O-Prime Delta - Rinse and Repeat (O-Prime Delta Remix).mp3'),
    cover: assetUrl('songs/CyanBlue, O-Prime Delta - Rinse and Repeat (O-Prime Delta Remix).jpg'),
    rhythmCalibration: MUSIC_RHYTHM_CALIBRATIONS.mia,
  },
];

export default function MusicPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rhythmCalibrationRef = useRef<MusicRhythmCalibration>(
    songs[0].rhythmCalibration,
  );
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // No visible visualizer remains. The controller keeps a single, lightweight
  // analyser only to drive page-wide text rhythm.
  useEffect(() => {
    musicRhythm.connect(audioElement, rhythmCalibrationRef.current);
    return () => musicRhythm.disconnect(audioElement);
  }, [audioElement]);

  useEffect(() => {
    musicRhythm.setPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ap = new APlayer({
      container: containerRef.current,
      listFolded: false,
      autoplay: false,
      loop: 'all',
      order: 'list',
      theme: '#282828',
      audio: songs,
    });

    // Expose the underlying <audio> element for the page-wide rhythm engine.
    const audio = ap.audio;
    if (audio) setAudioElement(audio);

    ap.on('listswitch', ({ index }) => {
      rhythmCalibrationRef.current = songs[index].rhythmCalibration;
      musicRhythm.connect(audio, rhythmCalibrationRef.current);
    });

    // Browsers block audible autoplay until the first user interaction.
    // Start playback on that first click/key press, then remove the listeners
    // so later clicks can still pause or control the player normally.
    let interactionHandled = false;
    const removeInteractionListeners = () => {
      window.removeEventListener('click', startAfterInteraction);
      window.removeEventListener('keydown', startAfterInteraction);
    };
    const startAfterInteraction = () => {
      if (interactionHandled) return;
      interactionHandled = true;
      // APlayer.play() handles the native play() promise internally and does
      // not return it. Chaining .then() here therefore throws on interaction.
      ap.play();
    };
    window.addEventListener('click', startAfterInteraction);
    window.addEventListener('keydown', startAfterInteraction);

    ap.on('play', () => {
      setIsPlaying(true);
      removeInteractionListeners();
    });
    ap.on('pause', () => setIsPlaying(false));
    ap.on('ended', () => setIsPlaying(false));

    return () => {
      removeInteractionListeners();
      ap.destroy();
    };
  }, []);

  return (
    <div className="music-player-post">
      <div className="music-player">
        <div ref={containerRef} id="aplayer"></div>
      </div>
    </div>
  );
}
