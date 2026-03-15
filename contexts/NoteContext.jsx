'use client';

import { createContext, useContext, useState } from 'react';

const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const [note, setNote] = useState('');

  return (
    <NoteContext.Provider value={{ note, setNote }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNote = () => useContext(NoteContext);
