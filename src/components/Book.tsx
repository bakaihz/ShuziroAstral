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
      <div className="p-8 text-center text-zinc-400 text-xs">
        Consultando obra via GET /v1/student/books/{bookId}...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="p-8 text-center text-rose-400 text-xs space-y-3">
        <p>Não foi possível obter dados da obra #{bookId}.</p>
        <button onClick={onBack} className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-xs font-bold">
          Voltar para Biblioteca
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 space-y-6">
      <button
        onClick={onBack}
        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar para a Biblioteca
      </button>

      <div className="flex flex-col md:flex-row items-start gap-6">
        <img
          src={book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80"}
          alt={book.title}
          className="w-32 h-44 object-cover rounded-xl border border-zinc-700 shadow-xl shrink-0"
        />

        <div className="space-y-4 flex-1">
          <div>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800/80 px-2.5 py-0.5 rounded-full font-bold">
              {book.genre}
            </span>
            <h2 className="text-lg font-extrabold text-white mt-1.5">{book.title}</h2>
            <p className="text-xs text-zinc-400 font-medium">Autor: {book.author}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs bg-[#09090b] border border-zinc-800 rounded-lg p-3">
            <div>
              <span className="text-zinc-500 block text-[10px]">Total de Páginas</span>
              <span className="font-bold text-zinc-200">{book.totalPages} págs</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Página Atual</span>
              <span className="font-bold text-amber-400">{book.currentPage}</span>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {book.description || "Descrição da obra disponivel no catálogo do Elefante Letrado / LeiaSP."}
          </p>

          <button
            onClick={() => onStartReading(book)}
            className="w-full md:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            Iniciar Sessão de Leitura
          </button>
        </div>
      </div>
    </div>
  );
};
