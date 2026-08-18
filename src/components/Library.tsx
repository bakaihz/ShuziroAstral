import React, { useEffect, useState } from 'react';
import { LibraryAPI, BookItem } from '../api/library';
import { BookOpen, Layers, RefreshCw, Folder } from 'lucide-react';

interface LibraryProps {
  onSelectBook: (bookId: string | number) => void;
}

export const Library: React.FC<LibraryProps> = ({ onSelectBook }) => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [readingProject, setReadingProject] = useState<any>(null);
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLibraryData = async () => {
    setLoading(true);
    try {
      const [discRes, projRes, genRes] = await Promise.all([
        LibraryAPI.discover(),
        LibraryAPI.getReadingProject(),
        LibraryAPI.getGenrePreview()
      ]);

      if (discRes.data) setBooks(discRes.data);
      if (projRes.data) setReadingProject(projRes.data);
      if (genRes.data) setGenres(genRes.data);
    } catch (e) {
      console.error("[Library Component] Erro ao carregar dados da biblioteca:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGenre = async (genreName: string | null, genreId?: number) => {
    setSelectedGenre(genreName);
    setLoading(true);
    try {
      if (!genreName) {
        const discRes = await LibraryAPI.discover();
        if (discRes.data) setBooks(discRes.data);
      } else if (genreId) {
        const genRes = await LibraryAPI.getGenre(genreId, 24);
        if (genRes.data?.books) {
          setBooks(genRes.data.books);
        } else if (Array.isArray(genRes.data)) {
          setBooks(genRes.data);
        } else {
          // Fallback filtro local
          const discRes = await LibraryAPI.discover();
          if (discRes.data) {
            const filtered = discRes.data.filter((b: BookItem) => 
              String(b.genre || '').toLowerCase().includes(genreName.toLowerCase())
            );
            setBooks(filtered);
          }
        }
      } else {
        // Filtro local por gênero
        const discRes = await LibraryAPI.discover();
        if (discRes.data) {
          const filtered = discRes.data.filter((b: BookItem) => 
            String(b.genre || '').toLowerCase().includes(genreName.toLowerCase())
          );
          setBooks(filtered.length > 0 ? filtered : discRes.data);
        }
      }
    } catch (e) {
      console.error("[Library Component] Erro ao filtrar categoria:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLibraryData();
  }, []);

  return (
    <div className="space-y-6 text-white bg-black p-1">
      {/* Projeto de Leitura Ativo (Sem Nível Recomendado e em Cores Vermelho/Preto/Branco) */}
      {readingProject && (
        <div className="bg-[#0f0a0a] border border-red-950 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2.5 bg-red-950/40 text-red-500 rounded-lg shrink-0 border border-red-900/60">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Projeto de Leitura Ativo</p>
            <h4 className="text-xs font-bold text-white">{readingProject.title}</h4>
          </div>
        </div>
      )}

      {/* Gêneros & Categorias Filtráveis */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-red-500" />
            Categorias & Gêneros Literários
          </h3>
          {selectedGenre && (
            <button
              onClick={() => handleSelectGenre(null)}
              className="text-[11px] text-red-500 hover:text-red-400 font-bold cursor-pointer"
            >
              Ver Todos
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSelectGenre(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              selectedGenre === null
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                : 'bg-[#121214] border-zinc-800 text-zinc-300 hover:border-zinc-700'
            }`}
          >
            Todos os Livros
          </button>
          {genres.map((g, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectGenre(g.name, g.genreId)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                selectedGenre === g.name
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                  : 'bg-[#121214] border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {g.name} ({g.count})
            </button>
          ))}
        </div>
      </div>

      {/* Acervo Principal */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-red-500" />
            {selectedGenre ? `Livros de ${selectedGenre}` : 'Acervo da Biblioteca'}
          </h3>
          <button
            onClick={loadLibraryData}
            disabled={loading}
            className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500 animate-pulse font-bold">
            Buscando obras literárias no acervo...
          </div>
        ) : books.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500 border border-zinc-900 rounded-xl">
            Nenhum livro disponível nesta categoria no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-[#121214] border border-zinc-850 rounded-xl p-4 space-y-4 hover:border-red-600/40 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded-lg border border-zinc-800 shrink-0 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[9px] bg-red-950/40 text-red-400 px-2 py-0.5 rounded font-bold border border-red-900/40 inline-block truncate max-w-full">
                      {book.genre || 'Literatura'}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">{book.title}</h4>
                    <p className="text-[11px] text-zinc-400 truncate">{book.author}</p>
                    <p className="text-[10px] text-zinc-500">{book.totalPages} páginas</p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectBook(book.id)}
                  className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-red-950/30"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Abrir Livro #{book.id}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
