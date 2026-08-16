import React, { useEffect, useState, useRef } from 'react';
import { BookDetail } from '../api/books';
import { createInitialReaderState } from '../reader/readerState';
import { ProgressTracker } from '../reader/progressTracker';
import { ReaderBookmarksManager } from '../reader/bookmarks';
import { ReaderHighlightsManager } from '../reader/highlights';
import { ReadingAPI } from '../api/reading';
import { QuizAPI } from '../api/quiz';
import { ChevronLeft, ChevronRight, Bookmark, Highlighter, X, Clock, Zap, CheckCircle2 } from 'lucide-react';

interface ReaderProps {
  book: BookDetail;
  onClose: () => void;
  onOpenQuiz?: () => void;
}

export const ReaderComponent: React.FC<ReaderProps> = ({ book, onClose, onOpenQuiz }) => {
  const [tracker, setTracker] = useState<ProgressTracker | null>(null);
  const [page, setPage] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [cfi, setCfi] = useState('');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [quizAvailable, setQuizAvailable] = useState(false);
  const [statusLog, setStatusLog] = useState<string[]>([]);

  const bmManagerRef = useRef(new ReaderBookmarksManager());
  const hlManagerRef = useRef(new ReaderHighlightsManager());

  const addLog = (msg: string) => {
    setStatusLog(prev => [`[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`, ...prev].slice(0, 15));
  };

  useEffect(() => {
    let active = true;

    const initReader = async () => {
      addLog(`📖 Inicializando leitor digital para a obra #${book.id}...`);

      const initial = createInitialReaderState(book.id, book.totalPages);
      const newTracker = new ProgressTracker(initial);
      newTracker.startTimer();
      setTracker(newTracker);
      setPage(initial.page);
      setCfi(initial.cfi);

      // Carrega bookmarks & highlights
      addLog(`🔖 Recuperando marcadores (GET /v1/bookmarks/get-bookmarks/${book.id})...`);
      const loadedBms = await bmManagerRef.current.loadBookmarks(book.id);
      if (active) setBookmarks(loadedBms);

      addLog(`🖍️ Recuperando destaques (GET /v1/highlights/get-highlights/${book.id})...`);
      const loadedHls = await hlManagerRef.current.loadHighlights(book.id);
      if (active) setHighlights(loadedHls);

      // Consulta quiz
      addLog(`⚙️ Consultando configuração do quiz (GET /v1/quiz/config)...`);
      await QuizAPI.getConfig();
      addLog(`❓ Verificando quiz do livro (GET /v2/student/books/${book.id}/quiz)...`);
      const quizRes = await QuizAPI.getQuiz(book.id);
      if (active && quizRes.data) {
        setQuizAvailable(true);
      }
    };

    initReader();

    const interval = setInterval(() => {
      if (tracker) {
        const state = tracker.getState();
        setTimeElapsed(state.timeElapsed);
      }
    }, 1000);

    return () => {
      active = false;
      clearInterval(interval);
      if (tracker) tracker.stopTimer();
    };
  }, [book.id]);

  const handleNextPage = async () => {
    if (!tracker) return;
    await tracker.nextPage();
    const st = tracker.getState();
    setPage(st.page);
    setCfi(st.cfi);
    addLog(`➡️ Avançou para a página ${st.page} (CFI: ${st.cfi})`);
    addLog(`📡 POST /v1/student/books/${book.id}/progress_em/Read enviado com sucesso!`);

    // Monitoring
    await ReadingAPI.monitorRead(book.id, {
      bookId: book.id,
      timestamp: Date.now(),
      activeWindow: true
    });
    addLog(`📡 POST /v1/reading-monitor/read/${book.id} executado.`);
  };

  const handlePrevPage = async () => {
    if (!tracker) return;
    await tracker.prevPage();
    const st = tracker.getState();
    setPage(st.page);
    setCfi(st.cfi);
    addLog(`⬅️ Voltou para a página ${st.page}`);
    addLog(`📡 POST /v1/student/books/${book.id}/progress_em/Read enviado.`);
  };

  const handleClose = async () => {
    addLog(`🚪 Encerrando leitor e registrando fechamento do livro...`);
    addLog(`📡 POST /v1/book-reading/close-book/${book.id}/0`);
    await ReadingAPI.closeBook(book.id);
    if (tracker) tracker.stopTimer();
    onClose();
  };

  const handleAddBookmark = () => {
    const newBm = bmManagerRef.current.addBookmark(book.id, page, cfi);
    setBookmarks(bmManagerRef.current.getBookmarks());
    addLog(`🔖 Marcador adicionado na pág ${page}`);
  };

  return (
    <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#27272a] pb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{book.title}</span>
            <span className="text-[10px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-800">
              ID: {book.id}
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Página <strong className="text-amber-400">{page}</strong> de <strong>{book.totalPages}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-[#18181b] border border-zinc-800 rounded-lg text-xs text-zinc-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{Math.floor(timeElapsed / 60)}m {timeElapsed % 60}s</span>
          </div>

          <button
            onClick={handleAddBookmark}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer border border-zinc-700"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            Marcar
          </button>

          {quizAvailable && onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              Quiz do Livro
            </button>
          )}

          <button
            onClick={handleClose}
            className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/80 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Fechar Livro
          </button>
        </div>
      </div>

      {/* Reader Stage Visualizer */}
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-8 min-h-[220px] flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-800/80 pb-2">
            <span>Trecho Literário Digital</span>
            <span className="font-mono text-[10px] text-amber-400">{cfi}</span>
          </div>
          <p className="text-sm text-zinc-200 leading-relaxed font-serif italic">
            "Na leitura de obras clássicas da literatura brasileira, a reflexão e o discernimento crítico se sobrepõem à pressa. Cada capítulo oferece uma perspectiva sobre a psique humana e a estrutura social da época."
          </p>
        </div>

        {/* Page Nav Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer border border-zinc-700"
          >
            <ChevronLeft className="w-4 h-4" />
            Página Anterior
          </button>

          <span className="text-xs font-bold text-zinc-400">
            {Math.round((page / book.totalPages) * 100)}% concluído
          </span>

          <button
            onClick={handleNextPage}
            disabled={page >= book.totalPages}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md"
          >
            Próxima Página
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reader Logs & State Monitoring */}
      <div className="bg-[#09090b] border border-zinc-800/80 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 font-bold border-b border-zinc-800 pb-2">
          <span>Logs de Requisições HTTP (POST progress_em/Read)</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Estado Ativo
          </span>
        </div>
        <div className="font-mono text-[11px] space-y-1 max-h-32 overflow-y-auto">
          {statusLog.map((log, i) => (
            <div key={i} className="text-amber-300/90 leading-tight">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
