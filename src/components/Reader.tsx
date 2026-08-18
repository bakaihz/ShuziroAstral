import React, { useEffect, useState, useRef } from 'react';
import { BookDetail } from '../api/books';
import { createInitialReaderState } from '../reader/readerState';
import { ProgressTracker } from '../reader/progressTracker';
import { ReaderBookmarksManager } from '../reader/bookmarks';
import { ReaderHighlightsManager } from '../reader/highlights';
import { EpubRangeLoader, ChunkRange } from '../reader/epubRangeLoader';
import { ReadingMonitor } from '../reader/readingMonitor';
import { ReadingAPI } from '../api/reading';
import { QuizAPI } from '../api/quiz';
import { ChevronLeft, ChevronRight, Bookmark, X, Clock, Zap, CheckCircle2, Layers, DownloadCloud } from 'lucide-react';

interface ReaderProps {
  book: BookDetail;
  onClose: () => void;
  onOpenQuiz?: () => void;
}

export const ReaderComponent: React.FC<ReaderProps> = ({ book, onClose, onOpenQuiz }) => {
  const [tracker, setTracker] = useState<ProgressTracker | null>(null);
  const [rangeLoader, setRangeLoader] = useState<EpubRangeLoader | null>(null);
  const [monitor, setMonitor] = useState<ReadingMonitor | null>(null);

  const [page, setPage] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [cfi, setCfi] = useState('');
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [quizAvailable, setQuizAvailable] = useState(false);
  const [loadedChunks, setLoadedChunks] = useState<ChunkRange[]>([]);
  const [totalEpubSize, setTotalEpubSize] = useState(0);
  const [statusLog, setStatusLog] = useState<string[]>([]);

  const bmManagerRef = useRef(new ReaderBookmarksManager());
  const hlManagerRef = useRef(new ReaderHighlightsManager());

  const addLog = (msg: string) => {
    setStatusLog(prev => [`[${new Date().toLocaleTimeString('pt-BR')}] ${msg}`, ...prev].slice(0, 20));
  };

  useEffect(() => {
    let active = true;

    const initReader = async () => {
      addLog(`📖 Inicializando leitor digital para a obra #${book.id}...`);

      // 1. Criar estado inicial do leitor
      const epubUrl = book.epubUrl || `https://prod-us.elefanteletrado.com.br/cdn/Content/cdn/books/book_${book.id}.epub`;
      const initial = createInitialReaderState(book.id, book.totalPages, epubUrl);
      const newTracker = new ProgressTracker(initial);
      newTracker.startTimer();
      setTracker(newTracker);
      setPage(initial.page);
      setCfi(initial.cfi);

      // 2. Inicializar EpubRangeLoader
      addLog(`📦 Inicializando EpubRangeLoader (${epubUrl})...`);
      const loader = new EpubRangeLoader(epubUrl);
      setRangeLoader(loader);

      // Solicitar primeiro chunk de range do EPUB (HTTP 206 Partial Content)
      addLog(`⚡ Solicitando Range HTTP inicial (bytes=0-262143)...`);
      await loader.loadRange(0, 262143);
      if (active) {
        setLoadedChunks(loader.getLoadedChunks());
        setTotalEpubSize(loader.getTotalSize());
        addLog(`✅ Chunk EPUB recebido com sucesso (Tamanho total descoberto: ${(loader.getTotalSize() / 1024 / 1024).toFixed(2)} MB)`);
      }

      // 3. Inicializar ReadingMonitor
      addLog(`📊 Inicializando ReadingMonitor (POST /v1/reading-monitor/read/${book.id})...`);
      const newMonitor = new ReadingMonitor(book.id);
      newMonitor.startMonitoring(30000);
      setMonitor(newMonitor);

      // 4. Carregar bookmarks & highlights
      addLog(`🔖 Recuperando marcadores (GET /v1/bookmarks/get-bookmarks/${book.id})...`);
      const loadedBms = await bmManagerRef.current.loadBookmarks(book.id);
      if (active) setBookmarks(loadedBms);

      addLog(`🖍️ Recuperando destaques (GET /v1/highlights/get-highlights/${book.id})...`);
      const loadedHls = await hlManagerRef.current.loadHighlights(book.id);
      if (active) setHighlights(loadedHls);

      // 5. Consulta de Quiz
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
      if (monitor) monitor.stopMonitoring();
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

    // Solicitando mais dados de range do EPUB se necessário
    if (rangeLoader) {
      addLog(`🔄 Solicitando próximo intervalo do EPUB via HTTP Range...`);
      await rangeLoader.requestMoreData(262144);
      setLoadedChunks(rangeLoader.getLoadedChunks());
      setTotalEpubSize(rangeLoader.getTotalSize());
    }

    // Disparar atualização do Reading Monitor
    if (monitor) {
      await monitor.sendMonitorUpdate();
      addLog(`📡 POST /v1/reading-monitor/read/${book.id} sincronizado.`);
    }
  };

  const handlePrevPage = async () => {
    if (!tracker) return;
    await tracker.prevPage();
    const st = tracker.getState();
    setPage(st.page);
    setCfi(st.cfi);
    addLog(`⬅️ Voltou para a página ${st.page}`);
    addLog(`📡 POST /v1/student/books/${book.id}/progress_em/Read enviado.`);

    if (monitor) {
      await monitor.sendMonitorUpdate();
    }
  };

  const [isAutoReading, setIsAutoReading] = useState(false);
  const autoReadTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isAutoReading) {
      addLog(`🤖 Leitura Automática ATIVADA - Avançando páginas e enviando progresso automaticamente...`);
      autoReadTimerRef.current = setInterval(() => {
        handleNextPage();
      }, 3000);
    } else {
      if (autoReadTimerRef.current) {
        clearInterval(autoReadTimerRef.current);
        autoReadTimerRef.current = null;
        addLog(`🛑 Leitura Automática PAUSADA.`);
      }
    }
    return () => {
      if (autoReadTimerRef.current) clearInterval(autoReadTimerRef.current);
    };
  }, [isAutoReading, tracker]);

  const handleClose = async () => {
    if (autoReadTimerRef.current) clearInterval(autoReadTimerRef.current);
    const currentTime = tracker ? tracker.getState().timeElapsed : 0;
    addLog(`🚪 Encerrando leitor e registrando fechamento do livro...`);
    addLog(`📡 POST /v1/book-reading/close-book/${book.id}/0?currentPageTime=${currentTime}`);
    
    await ReadingAPI.closeBook(book.id, currentTime);

    if (tracker) tracker.stopTimer();
    if (monitor) monitor.stopMonitoring();

    onClose();
  };

  const handleAddBookmark = () => {
    bmManagerRef.current.addBookmark(book.id, page, cfi);
    setBookmarks(bmManagerRef.current.getBookmarks());
    addLog(`🔖 Marcador adicionado na pág ${page}`);
  };

  return (
    <div className="bg-[#09090b] border border-red-950/40 rounded-2xl p-6 space-y-6 text-white">
      {/* Barra de Controles do Topo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-4 gap-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{book.title}</span>
            <span className="text-[10px] bg-red-950/40 text-red-400 font-bold px-2 py-0.5 rounded border border-red-900/40">
              ID: {book.id}
            </span>
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Página <strong className="text-white">{page}</strong> de <strong className="text-zinc-300">{book.totalPages}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-black border border-zinc-850 rounded-lg text-xs text-zinc-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span>{Math.floor(timeElapsed / 60)}m {timeElapsed % 60}s</span>
          </div>

          <button
            onClick={() => setIsAutoReading(!isAutoReading)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border ${
              isAutoReading
                ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-md shadow-red-950/50'
                : 'bg-red-950/30 hover:bg-red-950/50 text-red-400 border-red-900/40'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isAutoReading ? 'fill-white text-white' : 'fill-red-400 text-red-400'}`} />
            {isAutoReading ? 'Lendo Automático...' : 'Leitura Automática'}
          </button>

          <button
            onClick={handleAddBookmark}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer border border-zinc-800"
          >
            <Bookmark className="w-3.5 h-3.5 text-red-500" />
            Marcar
          </button>

          {quizAvailable && onOpenQuiz && (
            <button
              onClick={onOpenQuiz}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-red-950/50"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              Quiz do Livro
            </button>
          )}

          <button
            onClick={handleClose}
            className="px-3 py-1.5 bg-black hover:bg-zinc-950 text-red-500 border border-red-950/60 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Fechar Livro
          </button>
        </div>
      </div>

      {/* Visualizador de Páginas (Stage) */}
      <div className="bg-black border border-zinc-900 rounded-xl p-8 min-h-[220px] flex flex-col justify-between space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 border-b border-zinc-900 pb-2">
            <span className="flex items-center gap-1.5 text-zinc-400 font-bold uppercase tracking-wider">
              <DownloadCloud className="w-4 h-4 text-red-500" />
              EPUB Range Loader (HTTP 206 Partial Content)
            </span>
            <span className="font-mono text-[10px] text-zinc-500">{cfi}</span>
          </div>

          {/* Status dos Chunks Baixados em Cache */}
          <div className="bg-[#0c0c0e] border border-zinc-900 p-3 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-500" />
              <span className="text-zinc-400 font-bold">Chunks EPUB em Cache:</span>
              <span className="bg-red-950/40 text-red-400 text-[10px] px-2 py-0.5 rounded font-bold border border-red-900/40">
                {loadedChunks.length} intervalo(s)
              </span>
            </div>
            <div className="text-zinc-500 text-[11px] font-mono font-bold">
              Tamanho Total: {totalEpubSize > 0 ? `${(totalEpubSize / 1024 / 1024).toFixed(2)} MB` : 'Calculando via Content-Range...'}
            </div>
          </div>

          <p className="text-sm text-zinc-300 leading-relaxed font-serif italic pt-3 max-w-2xl mx-auto text-center border-b border-zinc-900/40 pb-4">
            "Na leitura de obras clássicas da literatura brasileira, a reflexão e o discernimento crítico se sobrepõem à pressa. Cada capítulo oferece uma perspectiva sobre a psique humana e a estrutura social da época."
          </p>
        </div>

        {/* Botões de Navegação das Páginas */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
          <button
            onClick={handlePrevPage}
            disabled={page <= 1}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 disabled:opacity-30 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Página Anterior
          </button>

          <span className="text-xs font-bold text-zinc-500">
            {Math.round((page / book.totalPages) * 100)}% concluído
          </span>

          <button
            onClick={handleNextPage}
            disabled={page >= book.totalPages}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-30 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-md shadow-red-950/50"
          >
            Próxima Página
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monitor de Requisições HTTP */}
      <div className="bg-black border border-zinc-900 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-500 font-bold border-b border-zinc-900 pb-2">
          <span>LOGS DAS REQUISIÇÕES HTTP (progress_em / range / close-book)</span>
          <span className="text-[10px] text-red-500 flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3 h-3" /> CONEXÃO DIRETA ATIVA
          </span>
        </div>
        <div className="font-mono text-[10px] space-y-1 max-h-28 overflow-y-auto">
          {statusLog.map((log, i) => (
            <div key={i} className="text-red-400/90 leading-tight">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
