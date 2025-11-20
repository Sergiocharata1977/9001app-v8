'use client';

// Don Cándido Floating Action Button Component

import { DonCandidoChat } from '@/components/ia/DonCandidoChat';
import { useState } from 'react';

export function DonCandidoFAB() {
  const [mostrarChat, setMostrarChat] = useState(false);

  return (
    <>
      {/* FAB Button */}
      {!mostrarChat && (
        <button
          onClick={() => setMostrarChat(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl flex items-center justify-center text-3xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-40 border-2 border-white animate-in fade-in slide-in-from-bottom-5"
          title="Abrir Don Cándido"
        >
          👷‍♂️
        </button>
      )}

      {/* Chat Component */}
      {mostrarChat && (
        <DonCandidoChat
          onClose={() => setMostrarChat(false)}
          modulo={undefined}
        />
      )}
    </>
  );
}
