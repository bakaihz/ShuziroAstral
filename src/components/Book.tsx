import React, { useEffect, useState } from 'react';
import { BooksAPI, BookDetail } from '../api/books';
import { BookOpen, Play, ArrowLeft, Bookmark, Sparkles } from 'lucide-react';

interface BookProps {
  bookId: string | number;
  onBack: () => void;
  onStartReading: (bookDetail: BookDetail) => void;
}

export const BookComponent: React.FC<BookProps> = ({ bookId, onBack, onStartReading }) => {
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBook = async () => {
      setLoading(true);
      const res = await BooksAPI.getBook(bookId);
      if (isMounted && res.data) {
        setBook(res.data);
      }
      if (isMounted) setLoading(false);
    };
    fetchBook();
    return () => {
      isMounted = false;
    };
  }, [bookId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-zinc-500 text-xs font-bold animate-pulse">
        Consultando obra no catálogo (GET /v1/student/books/{bookId})...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-8 text-center text-red-500 text-xs space-y-4 bg-[#0a0a0a] border border-red-950 rounded-xl">
        <p className="font-bold">Não foi possível obter os dados reais desta obra (#{bookId}).</p>
        <button onClick={onBack} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer">
          Voltar para Biblioteca
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0a0a] border border-red-950/60 rounded-xl p-6 space-y-6 text-white">
      <button
        onClick={onBack}
        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar para a Biblioteca
      </button>

      <div className="flex flex-col md:flex-row items-start gap-6">
        <img
          src={book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80"}
          alt={book.title}
          className="w-32 h-44 object-cover rounded-xl border border-zinc-800 shadow-xl shrink-0"
          referrerPolicy="no-referrer"
        />

        <div className="space-y-4 flex-1">
          <div>
            <span className="text-[10px] bg-red-950/40 text-red-400 border border-red-900/40 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {book.genre || 'Literatura'}
            </span>
            <h2 className="text-lg font-extrabold text-white mt-1.5 leading-snug">{book.title}</h2>
            <p className="text-xs text-zinc-400 font-medium">Autor: {book.author}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-black border border-zinc-900 rounded-lg p-3">
            <div>
              <span className="text-zinc-500 block text-[10px] font-bold uppercase tracking-wider">Total de Páginas</span>
              <span className="font-extrabold text-white">{book.totalPages} págs</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px] font-bold uppercase tracking-wider">Última Página Lida</span>
              <span className="font-extrabold text-red-500">{book.currentPage || 1}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {book.description || "Descrição completa obtida dinamicamente do servidor do Elefante Letrado para esta obra literária."}
          </p>

          <button
            onClick={() => onStartReading(book)}
            className="w-full md:w-auto px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            Iniciar Sessão de Leitura
          </button>
        </div>
      </div>
    </div>
  );
};
