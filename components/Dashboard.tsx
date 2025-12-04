
import React, { useState } from 'react';
import { ProjectInputs, CalculatedMetrics, AIAnalysis } from '../types';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ArrowLeft, Printer, CheckCircle, Target, 
  Activity, TrendingUp, Clock, ShieldCheck, Globe, Zap, BarChart3, Star, AlertTriangle, MinusCircle, XCircle, Briefcase, Layers, Flag, FileText
} from 'lucide-react';

interface Props {
  project: ProjectInputs;
  metrics: CalculatedMetrics;
  aiAnalysis: AIAnalysis | null;
  onBack: () => void;
  onPrint: () => void;
}

const Dashboard: React.FC<Props> = ({ project, metrics, aiAnalysis, onBack, onPrint }) => {
  const [activeTab, setActiveTab] = useState<'strategy' | 'risks' | 'market' | 'recs'>('strategy');
  const isPro = project.projectModel === 'pro';

  // Helper para Estilo Custo-Benefício (Tema Metria)
  const getCostBenefitStyle = (ratio: number) => {
    if (ratio <= 0) return { label: 'Descontinuar', color: 'text-slate-500', bg: 'bg-slate-100', icon: XCircle };
    if (ratio < 2) return { label: 'Incremental', color: 'text-slate-700', bg: 'bg-slate-200', icon: MinusCircle };
    if (ratio <= 5) return { label: 'Ótimo Potencial', color: 'text-slate-900', bg: 'bg-yellow-400', icon: CheckCircle };
    return { label: 'Super Projeto', color: 'text-yellow-400', bg: 'bg-slate-900', icon: Star };
  };

  const cbStyle = getCostBenefitStyle(metrics.costBenefitRatio);
  const CBIcon = cbStyle.icon;

  // Chart Data (Year 1 Scenarios) - Only for Pro
  const roiData = [
    { name: 'Pessimista', roi: metrics.scenarios.pessimistic.roi, revenue: metrics.scenarios.pessimistic.revenue },
    { name: 'Realista', roi: metrics.scenarios.realistic.roi, revenue: metrics.scenarios.realistic.revenue },
    { name: 'Otimista', roi: metrics.scenarios.optimistic.roi, revenue: metrics.scenarios.optimistic.revenue },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12 font-sans text-slate-900">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 no-print border-b border-slate-200 pb-6">
        <div>
           <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-900 font-medium transition mb-2">
             <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao Formulário
           </button>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project.projectName}</h1>
           <div className="flex items-center gap-4 mt-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${isPro ? 'bg-slate-900 text-yellow-500' : 'bg-slate-200 text-slate-600'}`}>
                    Modelo {isPro ? 'Pro' : 'Light'}
                </span>
                {project.stageGate && (
                    <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Fase: {project.stageGate}
                    </span>
                )}
           </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onPrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-yellow-500 hover:text-slate-900 transition shadow-lg shadow-slate-900/10 font-bold text-sm tracking-wide"
          >
            <Printer className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* --- STANDARD MODEL SUMMARY (LIGHT) --- */}
      {!isPro && (
          <div className="bg-white p-6 rounded-xl border-l-4 border-yellow-500 shadow-sm mb-6">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Resumo Executivo (Light)</h3>
              <p className="text-slate-600 mb-4">{project.standardGoal || 'Análise de viabilidade inicial.'}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 uppercase font-bold">Investimento Total</div>
                      <div className="text-lg font-black text-slate-900">R$ {metrics.pocTotalCost.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 uppercase font-bold">Valor Econômico (VE)</div>
                      <div className="text-lg font-black text-slate-900">R$ {metrics.economicValue?.toLocaleString()}</div>
                  </div>
                   <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 uppercase font-bold">Ganho (GE)</div>
                      <div className={`text-lg font-black ${metrics.economicGain && metrics.economicGain > 0 ? 'text-green-600' : 'text-red-600'}`}>R$ {metrics.economicGain?.toLocaleString()}</div>
                  </div>
                   <div className="p-3 bg-slate-50 rounded-lg">
                      <div className="text-xs text-slate-500 uppercase font-bold">ROI Estimado</div>
                      <div className={`text-lg font-black ${metrics.scenarios.realistic.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>{metrics.scenarios.realistic.roi}%</div>
                  </div>
              </div>
          </div>
      )}

      {/* --- STRATEGIC KPI GRID (Visible for Both, but simplified if Standard) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Innovation Score (Simplified for Standard) */}
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
              <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform">
                  <Activity className="w-32 h-32" />
              </div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center gap-2 text-yellow-500 mb-2">
                      <Zap className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Innovation Score</span>
                  </div>
                  <div>
                      <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-black text-white">{metrics.innovationScore}</span>
                          <span className="text-lg text-slate-400">/100</span>
                      </div>
                      <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-yellow-500 h-full rounded-full transition-all duration-1000" style={{ width: `${metrics.innovationScore}%` }}></div>
                      </div>
                  </div>
              </div>
          </div>

          {/* 2. Cost Benefit (Only Pro has Scale Logic) / ROI for Standard */}
          {isPro ? (
            <div className={`p-6 rounded-xl border-2 transition-colors ${cbStyle.bg === 'bg-slate-900' ? 'border-slate-900' : 'border-slate-100 bg-white'} shadow-sm flex flex-col justify-between group hover:border-yellow-400`}>
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-bold uppercase tracking-wider ${cbStyle.bg === 'bg-slate-900' ? 'text-slate-400' : 'text-slate-500'}`}>Custo-Benefício (Escala)</span>
                        <CBIcon className={`w-5 h-5 ${cbStyle.bg === 'bg-slate-900' ? 'text-yellow-400' : 'text-slate-400'}`} />
                    </div>
                    <div className={`text-3xl font-black ${cbStyle.color} flex items-center gap-2`}>
                        {metrics.costBenefitRatio}x
                    </div>
                    <div className={`mt-2 text-sm font-bold px-2 py-1 inline-block rounded ${cbStyle.bg} ${cbStyle.color === 'text-yellow-400' ? 'text-yellow-400' : ''} bg-opacity-50`}>
                        {cbStyle.label}
                    </div>
                </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Impacto Esperado</div>
                    <div className="text-sm font-medium text-slate-800 line-clamp-3">{project.standardImpact || 'N/A'}</div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold uppercase text-slate-400">KPI Chave</div>
                    <div className="text-slate-900 font-bold">{project.standardKPI || 'N/A'}</div>
                </div>
            </div>
          )}

          {/* 3. Probability & ICV (Pro) OR Risks (Standard) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-yellow-400 transition-colors">
               <div>
                   <div className="flex items-center justify-between mb-2">
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">{isPro ? 'Probabilidade' : 'Indicador de Risco'}</div>
                      <Target className="w-5 h-5 text-slate-300" />
                   </div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-900">{metrics.successProbability}%</span>
                   </div>
               </div>
               {isPro ? (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> ICV Score
                            </span>
                            <span className="text-xs font-bold text-slate-900">{metrics.icvScore}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-slate-900 h-full rounded-full" style={{ width: `${metrics.icvScore}%` }}></div>
                        </div>
                    </div>
               ) : (
                   <div className="mt-auto">
                       <span className="text-xs text-slate-500">Baseado em checklist simplificado.</span>
                   </div>
               )}
          </div>

           {/* 4. Payback & GE */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-yellow-400 transition-colors">
               <div className="flex items-center justify-between mb-2">
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-wider">{isPro ? 'Ganho Econômico (GE)' : 'Payback Estimado'}</div>
                   <TrendingUp className="w-5 h-5 text-slate-300" />
               </div>
               {isPro ? (
                    <div className="text-3xl font-black text-slate-900 mb-1">
                        R$ {(metrics.economicGain || 0) > 1000 ? `${((metrics.economicGain || 0)/1000).toFixed(1)}k` : metrics.economicGain}
                    </div>
               ) : (
                    <div className="text-3xl font-black text-slate-900 mb-1">
                        {metrics.paybackPeriodMonths > 0 ? metrics.paybackPeriodMonths.toFixed(1) : '∞'} <span className="text-lg font-medium text-slate-400">meses</span>
                    </div>
               )}
               
               <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
                    <div className="p-1.5 bg-yellow-100 rounded text-yellow-700">
                        <Clock className="w-3 h-3" />
                    </div>
                    <div className="text-xs">
                        <span className="text-slate-500">{isPro ? 'Payback da POC: ' : 'Retorno em: '}</span>
                        <span className="font-bold text-slate-900">{metrics.paybackPeriodMonths > 0 ? metrics.paybackPeriodMonths.toFixed(1) : 'N/A'} meses</span>
                    </div>
               </div>
          </div>
      </div>

      {/* --- ROLLOUT PROJECTION (PRO ONLY) --- */}
      {isPro && metrics.rolloutProjections && metrics.rolloutProjections.length > 0 && (
          <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 text-white">
              {/* ... Same Chart Code as Before ... */}
              <div className="flex items-center justify-between mb-6">
                 <div>
                    <h3 className="text-xl font-bold flex items-center gap-2 text-yellow-500">
                        <TrendingUp className="w-6 h-6" /> Projeção de Rollout (5 Anos)
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Estimativa de crescimento acumulado com base no Score de Inovação.</p>
                 </div>
                 <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-bold">Lucro Acumulado (5 anos)</div>
                    <div className="text-2xl font-bold text-white">
                        R$ {(metrics.rolloutProjections[4].accumulatedProfit / 1000000).toFixed(2)} Milhões
                    </div>
                 </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.rolloutProjections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="year" tickFormatter={(val) => `Ano ${val}`} stroke="#64748b" />
                    <YAxis stroke="#64748b" tickFormatter={(val) => `R$${val/1000}k`} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff'}} />
                    <Area type="monotone" dataKey="accumulatedProfit" stroke="#eab308" fillOpacity={1} fill="url(#colorProfit)" name="Lucro Acumulado" />
                    <Area type="monotone" dataKey="revenue" stroke="#fff" fill="none" strokeDasharray="5 5" name="Receita Anual" />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
          </div>
      )}

      {/* --- FINANCIALS (Show Scenarios ONLY for Pro) --- */}
      {isPro && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-yellow-500" /> Cenários (Ano 1/POC)
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Comparativo de ROI e Valor Econômico (VE)</p>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={roiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                            <YAxis yAxisId="left" orientation="left" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val}%`} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `R$${val/1000}k`} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: '1px solid #e2e8f0'}} />
                            <Bar yAxisId="left" dataKey="roi" name="ROI (%)" fill="#eab308" radius={[4, 4, 0, 0]} barSize={48} />
                            <Bar yAxisId="right" dataKey="revenue" name="VE (R$)" fill="#0f172a" radius={[4, 4, 0, 0]} barSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* SIDEBAR METRICS PRO */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-yellow-500" /> Detalhes do Projeto
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex justify-between border-b border-slate-200 pb-2">
                            <span>Horizonte</span>
                            <span className="font-bold text-slate-900">{project.innovationHorizon || 'N/A'}</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-200 pb-2">
                            <span>Tipo de Valor</span>
                            <span className="font-bold text-slate-900 capitalize">{project.valueType?.replace('_', ' ')}</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-200 pb-2">
                            <span>Custo Total POC</span>
                            <span className="font-bold text-slate-900">R$ {metrics.pocTotalCost.toLocaleString()}</span>
                        </li>
                        {metrics.riskScore !== undefined && (
                            <li className="flex justify-between pt-2">
                                <span>Risco Não-Econômico</span>
                                <span className={`font-bold ${metrics.riskScore > 50 ? 'text-red-500' : 'text-green-600'}`}>
                                    {metrics.riskScore > 50 ? 'Alto' : metrics.riskScore > 20 ? 'Médio' : 'Baixo'}
                                </span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
      )}

      {/* --- STANDARD MODEL DETAILS --- */}
      {!isPro && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <Flag className="w-5 h-5 text-yellow-500" /> Riscos Identificados
                   </h3>
                   <div className="space-y-3">
                       {Object.keys(project.standardRisks || {}).filter(k => (project.standardRisks as any)[k]).map(risk => {
                           const labels: any = { itDependency: 'Dependência de TI', lackOfData: 'Falta de Dados', lowStartupCapacity: 'Baixa Capacidade Startup', lackOfBudget: 'Falta de Orçamento', internalResistance: 'Resistência Interna' };
                           return (
                               <div key={risk} className="flex items-center gap-2 text-slate-700 bg-red-50 p-2 rounded">
                                   <AlertTriangle className="w-4 h-4 text-red-500" /> {labels[risk]}
                               </div>
                           )
                       })}
                       {Object.keys(project.standardRisks || {}).filter(k => (project.standardRisks as any)[k]).length === 0 && (
                           <div className="text-slate-500 text-sm italic">Nenhum risco crítico assinalado.</div>
                       )}
                   </div>
               </div>
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <FileText className="w-5 h-5 text-yellow-500" /> Observações
                   </h3>
                   <p className="text-slate-600 text-sm">{project.standardObservations || 'Sem observações adicionais.'}</p>
               </div>
           </div>
      )}

      {/* --- AI INTELLIGENCE REPORT (Keep for Both, maybe simplified content from AI side) --- */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-yellow-500 rounded text-slate-900">
                    <Zap className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg tracking-tight">Metria Intelligence Lab</h3>
                    <p className="text-slate-400 text-xs">Análise qualitativa e recomendações de IA</p>
                </div>
              </div>
          </div>

          <div className="flex flex-col md:flex-row border-b border-slate-200 bg-slate-50">
              <button onClick={() => setActiveTab('strategy')} className={`flex-1 px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'strategy' ? 'border-yellow-500 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Análise Estratégica</button>
              <button onClick={() => setActiveTab('market')} className={`flex-1 px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'market' ? 'border-yellow-500 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Mercado & Viabilidade</button>
              <button onClick={() => setActiveTab('risks')} className={`flex-1 px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'risks' ? 'border-yellow-500 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Avaliação de Riscos</button>
              <button onClick={() => setActiveTab('recs')} className={`flex-1 px-6 py-4 text-sm font-bold border-b-2 transition-all ${activeTab === 'recs' ? 'border-yellow-500 text-slate-900 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Plano de Ação</button>
          </div>

          <div className="p-8 min-h-[200px] bg-white">
              {aiAnalysis ? (
                  <div className="animate-fade-in max-w-4xl mx-auto">
                    {activeTab === 'strategy' && <p className="text-slate-600 leading-relaxed text-lg border-l-4 border-yellow-500 pl-4">{aiAnalysis.strategicAnalysis}</p>}
                    {activeTab === 'market' && <div className="prose prose-slate max-w-none text-slate-600">{aiAnalysis.marketViability}</div>}
                    {activeTab === 'risks' && <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-slate-700">{aiAnalysis.riskAssessment}</div>}
                    {activeTab === 'recs' && (
                        <ul className="space-y-4">
                            {aiAnalysis.recommendations.map((rec, i) => (
                                <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100"><span className="font-bold text-slate-900">{i+1}</span><span className="text-slate-700">{rec}</span></li>
                            ))}
                        </ul>
                    )}
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <div className="animate-spin mb-4"><Activity className="w-10 h-10 text-yellow-500" /></div>
                      <p>Processando inteligência de mercado...</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
