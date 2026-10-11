import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Song } from './context/PlayerContext';

export interface TunetasticDB extends DBSchema {
  downloads: {
    key: string;
    value: {
      songId: string;
      songData: Song;
      audioBlob: Blob;
      downloadedAt: number;
    };
  };
  uploads: {
    key: string;
    value: {
      songId: string;
      songData: Song;
      audioBlob: Blob;
      uploadedAt: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<TunetasticDB>>;

export const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<TunetasticDB>('tunetastic-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('downloads')) {
          db.createObjectStore('downloads', { keyPath: 'songId' });
        }
        if (!db.objectStoreNames.contains('uploads')) {
          db.createObjectStore('uploads', { keyPath: 'songId' });
        }
      },
    });
  }
  return dbPromise;
};

// Downloads API
export const saveDownloadedSong = async (song: Song, audioBlob: Blob) => {
  const db = await getDB();
  await db.put('downloads', {
    songId: song.id,
    songData: song,
    audioBlob,
    downloadedAt: Date.now(),
  });
};

export const getDownloadedSong = async (songId: string) => {
  const db = await getDB();
  return await db.get('downloads', songId);
};

export const getAllDownloadedSongs = async () => {
  const db = await getDB();
  return await db.getAll('downloads');
};

export const deleteDownloadedSong = async (songId: string) => {
  const db = await getDB();
  await db.delete('downloads', songId);
};

// Uploads API
export const saveUploadedSong = async (song: Song, audioBlob: Blob) => {
  const db = await getDB();
  await db.put('uploads', {
    songId: song.id,
    songData: song,
    audioBlob,
    uploadedAt: Date.now(),
  });
};

export const getUploadedSong = async (songId: string) => {
  const db = await getDB();
  return await db.get('uploads', songId);
};

export const getAllUploadedSongs = async () => {
  const db = await getDB();
  return await db.getAll('uploads');
};

export const deleteUploadedSong = async (songId: string) => {
  const db = await getDB();
  await db.delete('uploads', songId);
};
