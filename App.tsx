import React, { useState, useEffect } from 'react';
import { ProjectInputs, CalculatedMetrics, AIAnalysis, ViewState, User, SavedReport } from './types';
import ProjectForm from './components/ProjectForm';
import Dashboard from './components/Dashboard';
import AuthScreen from './components/AuthScreen';
import ReportsList from './components/ReportsList';
import AdminDashboard from './components/AdminDashboard';
import { calculateMetrics } from './services/accountingService';
import { analyzeProjectWithGemini } from './services/geminiService';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { databaseService } from './services/databaseService'; // Import DB
import { useToast } from './contexts/ToastContext';
import { BarChart3, Layout, LogOut, User as UserIcon, Settings, FileText, Shield } from 'lucide-react';

export default function App() {
  const { addToast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [viewState, setViewState] = useState<ViewState>('form');
  const [projectData, setProjectData] = useState<ProjectInputs | null>(null);
  const [metrics, setMetrics] = useState<CalculatedMetrics | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);

  // Check auth and Init DB on mount
  useEffect(() => {
    // 1. Initialize Database (Seed Data if empty)
    databaseService.init();

    // 2. Check Session
    const sessionUser = authService.getSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      loadUserReports(sessionUser.id);
    }
    setIsAuthChecking(false);
  }, []);

  // Scroll to top whenever viewState changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewState]);

  const loadUserReports = (userId: string) => {
    const reports = storageService.getReportsByUser(userId);
    setSavedReports(reports);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    loadUserReports(user.id);
    // If admin, go to admin dashboard by default, else form
    if (user.role === 'admin') {
      setViewState('admin');
    } else {
      setViewState('form');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setProjectData(null);
    setMetrics(null);
    setAiAnalysis(null);
    setSavedReports([]);
    setViewState('form');
    addToast('Você saiu com sucesso.', 'info');
  };

  const handleFormSubmit = async (data: ProjectInputs) => {
    setIsLoading(true);
    setProjectData(data);
    
    // 1. Calculate deterministic metrics locally
    const calculated = calculateMetrics(data);
    setMetrics(calculated);

    let finalAnalysis: AIAnalysis | null = null;

    // 2. Call AI for qualitative analysis
    try {
      finalAnalysis = await analyzeProjectWithGemini(data, calculated);
      setAiAnalysis(finalAnalysis);
      addToast('Análise de IA concluída!', 'success');
    } catch (error) {
      console.error("Error fetching AI analysis", error);
      addToast('Erro na IA. O relatório foi gerado com análise básica.', 'warning');
    }

    // 3. Auto Save to History
    if (currentUser) {
      try {
        storageService.saveReport(currentUser, data, calculated, finalAnalysis);
        loadUserReports(currentUser.id); // Update the list immediately
        addToast('Relatório salvo automaticamente em seu histórico.', 'success');
      } catch (e) {
        console.error("Error auto-saving", e);
      }
    }

    setIsLoading(false);
    setViewState('dashboard');
  };

  const handleLoadReport = (report: SavedReport) => {
    setProjectData(report.data);
    setMetrics(report.metrics);
    setAiAnalysis(report.analysis);
    setViewState('dashboard');
  };

  const handleDeleteReport = (reportId: string) => {
    if (!currentUser) return;
    if (confirm('Tem certeza que deseja excluir este relatório?')) {
      storageService.deleteReport(reportId);
      loadUserReports(currentUser.id);
      addToast('Relatório excluído.', 'info');
    }
  };

  const handleBack = () => {
    setViewState('form');
    setAiAnalysis(null);
    setProjectData(null);
    setMetrics(null);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">Carregando Metria...</div>;
  }

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewState('form')}>
            <div className="bg-slate-900 p-2 rounded-lg">
               <BarChart3 className="w-5 h-5 text-yellow-500" />
            </div>
            <span className="text-xl font-bold text-slate-900 hidden sm:inline-block tracking-tight">
              Metria
            </span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
              <button 
                onClick={() => setViewState('form')} 
                className={`transition animate-slide-up-fade ${viewState === 'form' ? 'text-yellow-600 font-bold' : 'hover:text-slate-900'}`}
                style={{ animationDelay: '100ms' }}
              >
                Novo Projeto
              </button>
              <button 
                onClick={() => setViewState('list')} 
                className={`transition animate-slide-up-fade ${viewState === 'list' ? 'text-yellow-600 font-bold' : 'hover:text-slate-900'}`}
                style={{ animationDelay: '200ms' }}
              >
                Meus Relatórios
              </button>
              {currentUser.role === 'admin' && (
                <button 
                  onClick={() => setViewState('admin')} 
                  className={`transition flex items-center gap-1 animate-slide-up-fade ${viewState === 'admin' ? 'text-yellow-600 font-bold' : 'hover:text-slate-900'}`}
                  style={{ animationDelay: '300ms' }}
                >
                  <Shield className="w-4 h-4" /> Painel Admin
                </button>
              )}
            </nav>

            {/* User Profile Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100 animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800">{currentUser.name}</div>
                <div className="text-xs text-slate-500">{currentUser.company}</div>
              </div>
              <div className="relative group">
                <button className="h-10 w-10 rounded-full overflow-hidden border-2 border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                  <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
                </button>
                
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 hidden group-hover:block hover:block">
                  <div className="px-4 py-2 text-xs text-slate-400 border-b border-slate-50 sm:hidden">
                    {currentUser.name}
                  </div>
                   <button 
                    onClick={() => setViewState('list')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" /> Meus Relatórios
                  </button>
                  {currentUser.role === 'admin' && (
                     <button 
                      onClick={() => setViewState('admin')}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" /> Painel Admin
                    </button>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sair
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {viewState === 'form' && (
            <div className="animate-fade-in">
              <div className="text-center mb-10">
                <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-slate-900 uppercase bg-yellow-400 rounded-sm">
                  Plataforma de Innovation Accounting
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Analise a Viabilidade do seu Negócio</h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Utilize nossos modelos financeiros e inteligência artificial para calcular ROI, Payback e mitigar riscos antes de investir.
                </p>
              </div>
              <ProjectForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
          )}

          {viewState === 'list' && (
            <ReportsList 
              reports={savedReports} 
              onView={handleLoadReport} 
              onDelete={handleDeleteReport}
              onCreateNew={() => setViewState('form')}
            />
          )}

          {viewState === 'dashboard' && projectData && metrics && (
            <Dashboard 
              project={projectData} 
              metrics={metrics} 
              aiAnalysis={aiAnalysis}
              onBack={handleBack}
              onPrint={handlePrint}
            />
          )}

          {viewState === 'admin' && currentUser.role === 'admin' && (
            <AdminDashboard />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto no-print">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
           © {new Date().getFullYear()} Metria. Todos os direitos reservados.
         </div>
      </footer>
    </div>
  );
}