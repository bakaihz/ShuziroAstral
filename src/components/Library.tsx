import React, { useEffect, useState } from 'react';
import { LibraryAPI, BookItem } from '../api/library';
import { BookOpen, Star, Sparkles, Folder, Layers, RefreshCw } from 'lucide-react';

interface LibraryProps {
  onSelectBook: (bookId: string | number) => void;
}

export const Library: React.FC<LibraryProps> = ({ onSelectBook }) => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [readings, setReadings] = useState<any[]>([]);
  const [suggestedLevel, setSuggestedLevel] = useState<any>(null);
  const [readingProject, setReadingProject] = useState<any>(null);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      const [discRes, favRes, readRes, levRes, projRes, genRes] = await Promise.all([
        LibraryAPI.discover(),
        LibraryAPI.getFavorites(),
        LibraryAPI.getReadings(),
        LibraryAPI.getSuggestedLevel(),
        LibraryAPI.getReadingProject(),
        LibraryAPI.getGenrePreview()
      ]);

      if (discRes.data) setBooks(discRes.data);
      if (favRes.data?.favorites) setFavorites(favRes.data.favorites);
      if (readRes.data?.readings) setReadings(readRes.data.readings);
      if (levRes.data) setSuggestedLevel(levRes.data);
      if (projRes.data) setReadingProject(projRes.data);
      if (genRes.data) setGenres(genRes.data);
    } catch (e) {
      console.error("[Library Component] Erro ao carregar dados da biblioteca:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibraryData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Cards de Status do Projeto & Nível */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestedLevel && (
          <div className="bg-[#18181b] border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Recomendação de Nível</p>
              <h4 className="text-sm font-bold text-white">{suggestedLevel.level || "Nível Ativo"}</h4>
            </div>
          </div>
        )}

        {readingProject && (
          <div className="bg-[#18181b] border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 font-medium">Projeto de Leitura</p>
              <h4 className="text-sm font-bold text-white">{readingProject.title}</h4>
            </div>
          </div>
        )}
      </div>

      {/* Gêneros Literários */}
      {genres.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Gêneros & Categorias
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((g, idx) => (
              <span key={idx} className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium">
                {g.name} ({g.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Acervo Principal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            Acervo da Biblioteca (GET /v1/library/discover/)
          </h3>
          <button
            onClick={loadLibraryData}
            disabled={loading}
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 space-y-3 hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-14 h-20 object-cover rounded-lg border border-zinc-700 shrink-0"
                />
                <div className="space-y-1 overflow-hidden">
                  <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-bold">
                    {book.genre}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate">{book.title}</h4>
                  <p className="text-[11px] text-zinc-400 truncate">{book.author}</p>
                  <p className="text-[10px] text-zinc-500">{book.totalPages} páginas</p>
                </div>
              </div>

              <button
                onClick={() => onSelectBook(book.id)}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Abrir Livro #{book.id}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
