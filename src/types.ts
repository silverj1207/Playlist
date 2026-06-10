import React from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  url?: string;
}

export interface Playlist {
  id: string;
  name: string;
  icon?: React.ReactNode;
  songs: Song[];
}
