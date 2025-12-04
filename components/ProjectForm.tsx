
import React, { useState } from 'react';
import { ProjectInputs, ProjectModel, RiskLevel, StandardRisks } from '../types';
import { Briefcase, DollarSign, Activity, TrendingUp, CheckSquare, AlertTriangle, PieChart, FileText, Layers, Target, FileEdit } from 'lucide-react';

interface Props {
  onSubmit: (data: ProjectInputs) => void;
  isLoading: boolean;
}

const ProjectForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [model, setModel] = useState<ProjectModel>('standard');
  const [activeProSection, setActiveProSection] = useState<number>(1);
  
  const [formData, setFormData] = useState<ProjectInputs>({
    projectModel: 'standard',
    projectName: 'Projeto Beta',
    associatedCompany: '',
    hasAssociatedStartup: false,
    startupName: '',
    startupCNPJ: '',
    
    // Standard (Light) Defaults
    valueType: 'cost_reduction',
    standardDirectCost: 0,
    standardFees: 0,
    standardTeamRateHour: 100,
    standardTeamHours: 10,
    standardDurationMonths: 3,
    standardRisks: {
        itDependency: false,
        lackOfData: false,
        lowStartupCapacity: false,
        lackOfBudget: false,
        internalResistance: false
    },
    
    // Pro Defaults
    initiativeType: 'internal',
    stageGate: 'discovery',
    
    proDirectCost: 0,
    proFees: 0,
    proLicenses: 0,
    proExternalServices: 0,
    proInfrastructure: 0,
    
    proTeamRateHour: 150,
    proTeamHours: 40,
    proTeamCount: 2,
    proOtherExpenses: 0,
    
    proDurationMonths: 3,
    proScaleDurationMonths: 6,
    
    proMetrics: {
       currentUnitCost: 0,
       newUnitCost: 0,
       volumeTraded: 0,
       ticketPrice: 0,
       newTicketPrice: 0,
       additionalSales: 0,
       productPrice: 0,
       salesVolume: 0,
       futurePredictableCost: 0,
       predictorIndicator: '',
       frequency: 1
    },
    
    scenarioRealisticInput: { directCost: 0, volume: 0, efficiency: 1 },
    scenarioOptimisticInput: { directCost: 0, volume: 0, efficiency: 1.2 },
    scenarioPessimisticInput: { directCost: 0, volume: 0, efficiency: 0.8 },

    icvAnswersPro: new Array(8).fill('nao'),
    
    nonEconomicRisks: {
        strategicAlignment: 'low',
        reputationalRisk: 'low',
        technicalIncompatibility: 'low',
        startupMaturity: 'low',
        legalBarriers: 'low',
        esgImpact: 'low',
        itPriority: 'low',
        hrAvailability: 'low',
        stakeholderSupport: 'low',
        executionRisk: 'low'
    },

    // Legacy fields needed for type
    initialInvestment: 0,
    monthlyBurnRate: 0,
    cac: 0,
    ltv: 0,
    estimatedUsersYear1: 0,
    churnRate: 0,
    confidenceLevel: 'medium',
    pocDurationMonths: 3,
    pocMonthlyOpCost: 0,
    pocTeamRateHour: 0,
    pocTeamHours: 0,
    proIndirectCost: 0,
    proVariableCostMonthly: 0,
    icvAnswers: new Array(8).fill(false),
  });

  const icvQuestions = [
    "Dados utilizados são confiáveis?",
    "Variáveis críticas foram consideradas?",
    "Riscos foram mapeados?",
    "Os cenários refletem a realidade?",
    "A solução atingiu os objetivos da POC?",
    "É escalável sem perda de eficiência?",
    "A startup tem capacidade operacional?",
    "A empresa está alinhada para escalar?"
  ];

  const handleModelChange = (newModel: ProjectModel) => {
    setModel(newModel);
    setFormData(prev => ({ ...prev, projectModel: newModel }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['projectName', 'associatedCompany', 'department', 'projectOwner', 'stakeholders', 'innovationThesis', 'strategicObjective', 'problemDescription', 'opportunityDescription', 'startupName', 'startupCNPJ', 'seasonality', 'usageFrequency', 'operationalConstraints', 'criticalDependencies', 'thesisAlignment', 'customerImpact', 'internalImpact', 'standardGoal', 'standardKPI', 'standardImpact', 'standardObservations'].includes(name) 
              ? value 
              : isNaN(Number(value)) ? value : Number(value)
    }));
  };

  const handleStandardRiskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setFormData(prev => ({
          ...prev,
          standardRisks: {
              ...prev.standardRisks!,
              [name]: checked
          }
      }));
  };

  const handleProMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      proMetrics: {
        ...prev.proMetrics,
        [name]: name === 'predictorIndicator' ? value : Number(value)
      }
    }));
  };

  const handleScenarioChange = (scenario: 'Realistic' | 'Optimistic' | 'Pessimistic', field: string, value: string) => {
      const key = `scenario${scenario}Input` as keyof ProjectInputs;
      setFormData(prev => ({
          ...prev,
          [key]: {
              ...(prev[key] as any),
              [field]: Number(value)
          }
      }));
  };

  const handleRiskChange = (riskName: string, level: string) => {
      setFormData(prev => ({
          ...prev,
          nonEconomicRisks: {
              ...prev.nonEconomicRisks!,
              [riskName]: level as RiskLevel
          }
      }));
  };

  const handleIcvProChange = (index: number, val: string) => {
      const newArr = [...(formData.icvAnswersPro || [])];
      newArr[index] = val as any;
      setFormData(prev => ({ ...prev, icvAnswersPro: newArr }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const baseInputStyles = "rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all duration-300 ease-in-out focus:scale-[1.01] focus:shadow-sm focus:bg-white text-sm";
  const labelStyles = "block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1";
  
  const renderProSection = () => {
      switch(activeProSection) {
          case 1: // DADOS GERAIS
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                    <div className="sm:col-span-2">
                        <label className={labelStyles}>Nome do Projeto</label>
                        <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} required />
                    </div>
                    <div>
                        <label className={labelStyles}>Área Solicitante</label>
                        <input type="text" name="department" value={formData.department || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                    </div>
                    <div>
                        <label className={labelStyles}>Responsável</label>
                        <input type="text" name="projectOwner" value={formData.projectOwner || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                    </div>
                    <div className="sm:col-span-2">
                        <label className={labelStyles}>Stakeholders Envolvidos</label>
                        <input type="text" name="stakeholders" value={formData.stakeholders || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} placeholder="Ex: Diretor de TI, CFO..." />
                    </div>
                    <div>
                        <label className={labelStyles}>Tipo de Iniciativa</label>
                        <select name="initiativeType" value={formData.initiativeType} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`}>
                            <option value="open">Inovação Aberta</option>
                            <option value="closed">Inovação Fechada</option>
                            <option value="internal">Interna</option>
                            <option value="startup">Parceria Startup</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelStyles}>Estágio (Stage Gate)</label>
                        <select name="stageGate" value={formData.stageGate} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`}>
                            <option value="discovery">Descoberta</option>
                            <option value="validation">Validação</option>
                            <option value="poc">POC (Prova de Conceito)</option>
                            <option value="scale">Escala</option>
                        </select>
                    </div>
                    <div className="sm:col-span-2">
                         <label className={labelStyles}>Tese de Inovação Relacionada</label>
                         <input type="text" name="innovationThesis" value={formData.innovationThesis || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                    </div>
                    <div className="sm:col-span-2">
                         <label className={labelStyles}>Objetivo Estratégico</label>
                         <input type="text" name="strategicObjective" value={formData.strategicObjective || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                    </div>
                    <div className="sm:col-span-2">
                         <label className={labelStyles}>Problema que resolve</label>
                         <textarea name="problemDescription" value={formData.problemDescription || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} rows={2} />
                    </div>
                    <div className="sm:col-span-2">
                         <label className={labelStyles}>Oportunidade Identificada (Quantitativa)</label>
                         <textarea name="opportunityDescription" value={formData.opportunityDescription || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} rows={2} />
                    </div>
                </div>
            );
          
          case 2: // OPERACIONAIS (VE)
            return (
                 <div className="space-y-6 animate-fade-in">
                    <div>
                         <label className={labelStyles}>Tipo de Valor Econômico (ΔV)</label>
                         <select name="valueType" value={formData.valueType} onChange={handleChange} className={`w-full px-4 py-3 font-bold bg-yellow-50 border-yellow-300 text-slate-800 ${baseInputStyles}`}>
                            <option value="cost_reduction">Redução de Custos</option>
                            <option value="cost_avoidance">Cost Avoidance (Evitar Custo)</option>
                            <option value="revenue_increase">Aumento de Receita Atual</option>
                            <option value="new_revenue">Nova Receita</option>
                         </select>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.valueType === 'cost_reduction' && (
                            <>
                                <div><label className={labelStyles}>Custo Atual (Unidade)</label><input type="number" name="currentUnitCost" value={formData.proMetrics.currentUnitCost} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div><label className={labelStyles}>Novo Custo Estimado</label><input type="number" name="newUnitCost" value={formData.proMetrics.newUnitCost} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div className="sm:col-span-2"><label className={labelStyles}>Volume Mensal Impactado</label><input type="number" name="volumeTraded" value={formData.proMetrics.volumeTraded} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                            </>
                        )}
                        {formData.valueType === 'cost_avoidance' && (
                            <>
                                <div><label className={labelStyles}>Custo Futuro Previsto</label><input type="number" name="futurePredictableCost" value={formData.proMetrics.futurePredictableCost} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div><label className={labelStyles}>Frequência de Ocorrência</label><input type="number" name="frequency" value={formData.proMetrics.frequency} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div className="sm:col-span-2"><label className={labelStyles}>Indicador Preditor</label><input type="text" name="predictorIndicator" value={formData.proMetrics.predictorIndicator} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                            </>
                        )}
                        {formData.valueType === 'revenue_increase' && (
                            <>
                                <div><label className={labelStyles}>Ticket Médio Atual</label><input type="number" name="ticketPrice" value={formData.proMetrics.ticketPrice} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div><label className={labelStyles}>Ticket Médio Novo</label><input type="number" name="newTicketPrice" value={formData.proMetrics.newTicketPrice} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div><label className={labelStyles}>Incremento de Volume</label><input type="number" name="additionalSales" value={formData.proMetrics.additionalSales} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div><label className={labelStyles}>Conversão Esperada (%)</label><input type="number" name="conversionRate" value={formData.proMetrics.conversionRate} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                            </>
                        )}
                         {formData.valueType === 'new_revenue' && (
                            <>
                                <div><label className={labelStyles}>Preço Novo Produto</label><input type="number" name="productPrice" value={formData.proMetrics.productPrice} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div><label className={labelStyles}>Volume Estimado Mensal</label><input type="number" name="salesVolume" value={formData.proMetrics.salesVolume} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                            </>
                        )}
                    </div>
                 </div>
            );

          case 3: // CUSTOS (CPOC)
            return (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                     <div className="sm:col-span-2 border-b border-slate-100 pb-2 mb-2">
                         <h4 className="font-bold text-slate-800 text-sm">3.1 Custos Diretos</h4>
                     </div>
                     <div><label className={labelStyles}>Custo da Startup</label><input type="number" name="proDirectCost" value={formData.proDirectCost} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div><label className={labelStyles}>Taxas / Comissões</label><input type="number" name="proFees" value={formData.proFees} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div><label className={labelStyles}>Licenças</label><input type="number" name="proLicenses" value={formData.proLicenses} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div><label className={labelStyles}>Serviços Externos</label><input type="number" name="proExternalServices" value={formData.proExternalServices} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     
                     <div className="sm:col-span-2 border-b border-slate-100 pb-2 mb-2 mt-4">
                         <h4 className="font-bold text-slate-800 text-sm">3.2 Custos Indiretos</h4>
                     </div>
                     <div><label className={labelStyles}>Valor Hora Equipe (Vh)</label><input type="number" name="proTeamRateHour" value={formData.proTeamRateHour} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div><label className={labelStyles}>Horas/Mês Dedicadas</label><input type="number" name="proTeamHours" value={formData.proTeamHours} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div><label className={labelStyles}>Qtd Pessoas</label><input type="number" name="proTeamCount" value={formData.proTeamCount} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div><label className={labelStyles}>Outras Despesas</label><input type="number" name="proOtherExpenses" value={formData.proOtherExpenses} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>

                     <div className="sm:col-span-2 border-b border-slate-100 pb-2 mb-2 mt-4">
                         <h4 className="font-bold text-slate-800 text-sm">3.3 Duração</h4>
                     </div>
                     <div><label className={labelStyles}>Duração da POC (Meses)</label><input type="number" name="proDurationMonths" value={formData.proDurationMonths} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div><label className={labelStyles}>Tempo de Implementação Escala (Meses)</label><input type="number" name="proScaleDurationMonths" value={formData.proScaleDurationMonths} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                 </div>
            );
          
          case 4: // PREMISSAS
             return (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                     <div><label className={labelStyles}>Volume Mensal Previsível</label><input type="number" name="monthlyVolumePredictable" value={formData.monthlyVolumePredictable || 0} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div><label className={labelStyles}>Frequência de Uso</label><input type="text" name="usageFrequency" value={formData.usageFrequency || ''} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div className="sm:col-span-2"><label className={labelStyles}>Sazonalidade</label><input type="text" name="seasonality" value={formData.seasonality || ''} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div className="sm:col-span-2"><label className={labelStyles}>Restrições da Operação</label><input type="text" name="operationalConstraints" value={formData.operationalConstraints || ''} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                     <div className="sm:col-span-2"><label className={labelStyles}>Dependências Críticas</label><input type="text" name="criticalDependencies" value={formData.criticalDependencies || ''} onChange={handleChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                 </div>
             );

          case 5: // CENÁRIOS
             return (
                 <div className="space-y-6 animate-fade-in">
                     {['Realistic', 'Optimistic', 'Pessimistic'].map((scen) => {
                         const key = `scenario${scen}Input` as keyof ProjectInputs;
                         const data = formData[key] as any;
                         const color = scen === 'Realistic' ? 'border-yellow-400 bg-yellow-50' : 'border-slate-200 bg-slate-50';
                         
                         return (
                            <div key={scen} className={`p-4 rounded-lg border ${color}`}>
                                <h4 className="font-bold text-slate-800 mb-3 uppercase text-xs tracking-wider">Cenário {scen === 'Realistic' ? 'Realista' : scen === 'Optimistic' ? 'Otimista' : 'Pessimista'}</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    <div><label className="text-[10px] text-slate-500 uppercase font-bold">Custo Direto</label><input type="number" value={data.directCost} onChange={(e) => handleScenarioChange(scen as any, 'directCost', e.target.value)} className={`w-full px-2 py-1 ${baseInputStyles}`} /></div>
                                    <div><label className="text-[10px] text-slate-500 uppercase font-bold">Volume</label><input type="number" value={data.volume} onChange={(e) => handleScenarioChange(scen as any, 'volume', e.target.value)} className={`w-full px-2 py-1 ${baseInputStyles}`} /></div>
                                    <div><label className="text-[10px] text-slate-500 uppercase font-bold">Eficiência</label><input type="number" step="0.1" value={data.efficiency} onChange={(e) => handleScenarioChange(scen as any, 'efficiency', e.target.value)} className={`w-full px-2 py-1 ${baseInputStyles}`} /></div>
                                </div>
                            </div>
                         );
                     })}
                 </div>
             );

          case 6: // ICV
             return (
                 <div className="space-y-4 animate-fade-in">
                     <div className="grid grid-cols-1 gap-0 border border-slate-200 rounded-lg overflow-hidden">
                        {icvQuestions.map((q, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <span className="text-sm font-medium text-slate-700 mb-2 sm:mb-0 w-1/2">{q}</span>
                                <div className="flex gap-1">
                                    {['sim', 'parcial', 'nao'].map(opt => (
                                        <button 
                                            key={opt}
                                            type="button"
                                            onClick={() => handleIcvProChange(i, opt)}
                                            className={`px-3 py-1 text-xs font-bold uppercase rounded transition-all ${
                                                formData.icvAnswersPro![i] === opt 
                                                ? (opt === 'sim' ? 'bg-green-500 text-white' : opt === 'parcial' ? 'bg-yellow-400 text-slate-900' : 'bg-red-500 text-white')
                                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                     </div>
                 </div>
             );

          case 7: // OBJEÇÕES
             return (
                 <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {Object.keys(formData.nonEconomicRisks || {}).map((riskKey) => {
                              const labels: any = {
                                  strategicAlignment: 'Alinhamento Estratégico',
                                  reputationalRisk: 'Riscos Reputacionais',
                                  technicalIncompatibility: 'Incompatibilidade Técnica',
                                  startupMaturity: 'Baixa Maturidade Startup',
                                  legalBarriers: 'Barreiras Legais/Reg',
                                  esgImpact: 'Impacto ESG',
                                  itPriority: 'Prioridade TI',
                                  hrAvailability: 'Disponibilidade RH',
                                  stakeholderSupport: 'Apoio Stakeholders',
                                  executionRisk: 'Risco de Execução'
                              };
                              const val = (formData.nonEconomicRisks as any)[riskKey];
                              return (
                                  <div key={riskKey} className="p-3 border border-slate-200 rounded-lg bg-white">
                                      <label className="text-xs font-bold text-slate-700 block mb-2">{labels[riskKey]}</label>
                                      <div className="flex gap-1">
                                          {['low', 'medium', 'high'].map(lvl => (
                                              <button
                                                key={lvl}
                                                type="button"
                                                onClick={() => handleRiskChange(riskKey, lvl)}
                                                className={`flex-1 py-1 text-[10px] font-bold uppercase rounded ${
                                                    val === lvl 
                                                    ? (lvl === 'low' ? 'bg-green-100 text-green-700' : lvl === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')
                                                    : 'bg-slate-50 text-slate-400'
                                                }`}
                                              >
                                                  {lvl === 'low' ? 'Baixo' : lvl === 'medium' ? 'Médio' : 'Alto'}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                 </div>
             );

          case 8: // PORTFÓLIO
             return (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fade-in">
                     <div>
                         <label className={labelStyles}>Horizonte de Inovação</label>
                         <select name="innovationHorizon" value={formData.innovationHorizon || 'H1'} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`}>
                             <option value="H1">H1 - Incremental</option>
                             <option value="H2">H2 - Adjacente</option>
                             <option value="H3">H3 - Transformacional</option>
                         </select>
                     </div>
                     <div>
                         <label className={labelStyles}>Complexidade</label>
                         <select name="solutionComplexity" value={formData.solutionComplexity || 'low'} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`}>
                             <option value="low">Baixa</option>
                             <option value="medium">Média</option>
                             <option value="high">Alta</option>
                         </select>
                     </div>
                     <div>
                         <label className={labelStyles}>Grau de Incerteza</label>
                         <select name="uncertaintyDegree" value={formData.uncertaintyDegree || 'low'} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`}>
                             <option value="low">Baixo</option>
                             <option value="medium">Médio</option>
                             <option value="high">Alto</option>
                         </select>
                     </div>
                     <div className="sm:col-span-2"><label className={labelStyles}>Impacto no Cliente</label><input type="text" name="customerImpact" value={formData.customerImpact || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} /></div>
                     <div className="sm:col-span-2"><label className={labelStyles}>Impacto Interno</label><input type="text" name="internalImpact" value={formData.internalImpact || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} /></div>
                 </div>
             );
          
          default: return null;
      }
  };

  const proSections = [
      { id: 1, title: 'Dados Gerais', icon: FileText },
      { id: 2, title: 'Operacional (VE)', icon: Activity },
      { id: 3, title: 'Custos (CPOC)', icon: DollarSign },
      { id: 4, title: 'Premissas', icon: Layers },
      { id: 5, title: 'Cenários', icon: TrendingUp },
      { id: 6, title: 'ICV', icon: CheckSquare },
      { id: 7, title: 'Objeções/Riscos', icon: AlertTriangle },
      { id: 8, title: 'Portfólio', icon: PieChart },
  ];

  const sectionTitleStyles = "text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200 mb-6";

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
      
      {/* HEADER WITH TABS */}
      <div className="bg-slate-900 text-white border-b-4 border-yellow-500">
         <div className="p-6 pb-2">
            <h2 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-yellow-500" /> Novo Projeto
            </h2>
            <p className="opacity-90 mt-1 text-slate-300 mb-6">
                Selecione o modelo de análise adequado para o estágio do seu projeto.
            </p>
         </div>
         <div className="flex px-6">
            <button 
                onClick={() => handleModelChange('standard')}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors border-b-2 ${model === 'standard' ? 'bg-white text-slate-900 border-yellow-500' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'}`}
            >
                Modelo Light (Gratuito)
            </button>
            <button 
                onClick={() => handleModelChange('pro')}
                className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider rounded-t-lg transition-colors border-b-2 ${model === 'pro' ? 'bg-white text-slate-900 border-yellow-500' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'}`}
            >
                Modelo Pro (Completo)
            </button>
         </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 md:p-8">
        
        {/* --- STANDARD MODEL FORM (LIGHT) --- */}
        {model === 'standard' && (
            <div className="space-y-8 animate-fade-in">
                
                {/* 1. DADOS GERAIS */}
                <div>
                    <h3 className={sectionTitleStyles}><FileText className="w-5 h-5 text-yellow-500"/> 1. Dados Gerais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                         <div className="sm:col-span-2">
                            <label className={labelStyles}>Nome do Projeto</label>
                            <input type="text" name="projectName" required value={formData.projectName} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                         </div>
                         <div>
                            <label className={labelStyles}>Área Solicitante</label>
                            <input type="text" name="department" value={formData.department || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                         </div>
                         <div>
                            <label className={labelStyles}>Responsável</label>
                            <input type="text" name="projectOwner" value={formData.projectOwner || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                         </div>
                         <div className="sm:col-span-2">
                            <label className={labelStyles}>Tipo de Valor Econômico (ΔV)</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {['cost_reduction', 'revenue_increase', 'new_revenue', 'cost_avoidance'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, valueType: type as any }))}
                                        className={`px-2 py-2 text-xs font-bold uppercase rounded border transition-all ${
                                            formData.valueType === type
                                            ? 'bg-yellow-100 border-yellow-400 text-slate-900 shadow-sm'
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                                        }`}
                                    >
                                        {type === 'cost_reduction' && 'Redução Custo'}
                                        {type === 'revenue_increase' && 'Aumento Receita'}
                                        {type === 'new_revenue' && 'Nova Receita'}
                                        {type === 'cost_avoidance' && 'Cost Avoidance'}
                                    </button>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>

                {/* 2. CUSTOS SIMPLES */}
                <div>
                    <h3 className={sectionTitleStyles}><DollarSign className="w-5 h-5 text-yellow-500"/> 2. Custos Estimados</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="sm:col-span-2">
                            <label className={labelStyles}>Custo Total Estimado da Solução (Direto)</label>
                            <input type="number" name="standardDirectCost" value={formData.standardDirectCost} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                        </div>
                        <div>
                            <label className={labelStyles}>Taxas / Comissões Extras</label>
                            <input type="number" name="standardFees" value={formData.standardFees} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                        </div>
                         <div>
                            <label className={labelStyles}>Duração POC (Meses)</label>
                            <input type="number" name="standardDurationMonths" value={formData.standardDurationMonths} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                        </div>
                        <div>
                            <label className={labelStyles}>Valor Hora Médio (Vh)</label>
                            <input type="number" name="standardTeamRateHour" value={formData.standardTeamRateHour} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                        </div>
                         <div>
                            <label className={labelStyles}>Horas Dedicadas</label>
                            <input type="number" name="standardTeamHours" value={formData.standardTeamHours} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                        </div>
                    </div>
                </div>

                {/* 3. DADOS DE VALOR (VE) */}
                <div>
                    <h3 className={sectionTitleStyles}><Activity className="w-5 h-5 text-yellow-500"/> 3. Dados de Valor (VE)</h3>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.valueType === 'cost_reduction' && (
                            <>
                                <div><label className={labelStyles}>Custo Atual (Unidade)</label><input type="number" name="currentUnitCost" value={formData.proMetrics.currentUnitCost} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div><label className={labelStyles}>Novo Custo Estimado</label><input type="number" name="newUnitCost" value={formData.proMetrics.newUnitCost} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div className="sm:col-span-2"><label className={labelStyles}>Volume Mensal Impactado</label><input type="number" name="volumeTraded" value={formData.proMetrics.volumeTraded} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                            </>
                        )}
                        {formData.valueType === 'cost_avoidance' && (
                            <>
                                <div className="sm:col-span-2"><label className={labelStyles}>Custo Futuro Previsto (Total)</label><input type="number" name="futurePredictableCost" value={formData.proMetrics.futurePredictableCost} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                            </>
                        )}
                        {formData.valueType === 'revenue_increase' && (
                            <>
                                <div><label className={labelStyles}>Ticket Médio</label><input type="number" name="ticketPrice" value={formData.proMetrics.ticketPrice} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div><label className={labelStyles}>Volume Adicional Esperado</label><input type="number" name="additionalSales" value={formData.proMetrics.additionalSales} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                            </>
                        )}
                         {formData.valueType === 'new_revenue' && (
                            <>
                                <div><label className={labelStyles}>Preço Unitário</label><input type="number" name="productPrice" value={formData.proMetrics.productPrice} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                                <div><label className={labelStyles}>Volume Estimado</label><input type="number" name="salesVolume" value={formData.proMetrics.salesVolume} onChange={handleProMetricChange} className={`w-full px-4 py-2 ${baseInputStyles}`} /></div>
                            </>
                        )}
                    </div>
                </div>

                {/* 4. RESULTADO ESPERADO */}
                <div>
                     <h3 className={sectionTitleStyles}><Target className="w-5 h-5 text-yellow-500"/> 4. Resultado Esperado</h3>
                     <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className={labelStyles}>Meta Principal do Projeto</label>
                            <input type="text" name="standardGoal" value={formData.standardGoal || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                        </div>
                        <div>
                            <label className={labelStyles}>Indicador-chave Afetado</label>
                            <input type="text" name="standardKPI" value={formData.standardKPI || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                        </div>
                        <div>
                            <label className={labelStyles}>Impacto Esperado no Negócio</label>
                            <input type="text" name="standardImpact" value={formData.standardImpact || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} />
                        </div>
                     </div>
                </div>

                {/* 5. RISCOS PRINCIPAIS */}
                <div>
                     <h3 className={sectionTitleStyles}><AlertTriangle className="w-5 h-5 text-yellow-500"/> 5. Riscos Principais</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                         {Object.keys(formData.standardRisks || {}).map(risk => {
                             const labels: any = {
                                 itDependency: 'Dependência de TI',
                                 lackOfData: 'Falta de Dados',
                                 lowStartupCapacity: 'Baixa Capacidade Startup',
                                 lackOfBudget: 'Falta de Orçamento',
                                 internalResistance: 'Resistência Interna'
                             };
                             return (
                                 <label key={risk} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                                     <input 
                                        type="checkbox" 
                                        name={risk} 
                                        checked={(formData.standardRisks as any)[risk]} 
                                        onChange={handleStandardRiskChange}
                                        className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500 border-gray-300"
                                     />
                                     <span className="text-sm font-medium text-slate-700">{labels[risk]}</span>
                                 </label>
                             )
                         })}
                     </div>
                </div>

                {/* 6. OBSERVAÇÕES */}
                <div>
                     <h3 className={sectionTitleStyles}><FileEdit className="w-5 h-5 text-yellow-500"/> 6. Observações Finais</h3>
                     <textarea name="standardObservations" value={formData.standardObservations || ''} onChange={handleChange} className={`w-full px-4 py-2.5 ${baseInputStyles}`} rows={3} placeholder="Informações adicionais relevantes..." />
                </div>

            </div>
        )}

        {/* --- PRO MODEL FORM --- */}
        {model === 'pro' && (
            <div className="flex flex-col md:flex-row gap-6 animate-fade-in relative">
                
                {/* SIDEBAR NAVIGATION - STICKY DESKTOP / SCROLLABLE MOBILE */}
                <div className="w-full md:w-64 flex-shrink-0 md:sticky md:top-24 h-fit z-10 bg-white md:bg-transparent p-2 md:p-0 border-b md:border-b-0 border-slate-200 overflow-x-auto md:overflow-visible">
                    <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
                        {proSections.map((sec) => {
                            const Icon = sec.icon;
                            return (
                                <button
                                    key={sec.id}
                                    type="button"
                                    onClick={() => setActiveProSection(sec.id)}
                                    className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-all whitespace-nowrap md:whitespace-normal ${
                                        activeProSection === sec.id 
                                        ? 'bg-slate-900 text-yellow-400 shadow-md transform scale-105' 
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${activeProSection === sec.id ? 'text-yellow-400' : 'text-slate-400'}`} />
                                    {sec.title}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[400px]">
                    <div className="mb-6 border-b border-slate-100 pb-2">
                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            {React.createElement(proSections[activeProSection-1].icon, { className: "w-6 h-6 text-yellow-500" })}
                            {proSections[activeProSection-1].title}
                        </h3>
                    </div>
                    
                    {renderProSection()}

                    {/* Navigation Buttons */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
                         <button
                            type="button"
                            onClick={() => {
                                setActiveProSection(prev => Math.max(1, prev - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={activeProSection === 1}
                            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 disabled:opacity-50"
                         >
                             Anterior
                         </button>
                         {activeProSection < 8 ? (
                             <button
                                type="button"
                                onClick={() => {
                                    setActiveProSection(prev => Math.min(8, prev + 1));
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-yellow-500 hover:text-slate-900 transition"
                             >
                                 Próximo
                             </button>
                         ) : (
                             <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-yellow-500 text-slate-900 rounded-lg text-sm font-bold hover:bg-yellow-400 transition shadow-lg"
                             >
                                 {isLoading ? 'Calculando...' : 'Gerar Relatório Completo'}
                             </button>
                         )}
                    </div>
                </div>
            </div>
        )}

        {/* --- SUBMIT STANDARD --- */}
        {model === 'standard' && (
            <div className="pt-8 border-t border-slate-200 mt-8">
            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-xl shadow-slate-900/10 transition-all ${
                isLoading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-yellow-500 hover:text-slate-900'
                }`}
            >
                {isLoading ? 'Processando...' : 'Gerar Relatório Light'}
            </button>
            </div>
        )}

      </form>
    </div>
  );
};

export default ProjectForm;
