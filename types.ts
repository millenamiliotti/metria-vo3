
export type ProjectModel = 'standard' | 'pro';

export interface ProOperationalMetrics {
  // Reduction
  currentUnitCost?: number;
  newUnitCost?: number;
  volumeTraded?: number; // e.g., number of calls, transactions
  // Revenue Increase
  ticketPrice?: number;
  newTicketPrice?: number; // For Increase Revenue
  additionalSales?: number;
  conversionRate?: number;
  // New Revenue
  productPrice?: number;
  salesVolume?: number;
  purchaseFrequency?: number;
  channel?: string;
  // Cost Avoidance
  futurePredictableCost?: number;
  avoidanceProbability?: number; // 0-100%
  predictorIndicator?: string;
  frequency?: number;
}

// Section 5: Scenarios
export interface ScenarioInput {
  directCost: number;
  volume: number;
  efficiency: number; // Percentage or multiplier
}

// Section 7: Non-Economic Objections (Pro)
export type RiskLevel = 'low' | 'medium' | 'high';
export interface NonEconomicRisks {
  strategicAlignment: RiskLevel;
  reputationalRisk: RiskLevel;
  technicalIncompatibility: RiskLevel;
  startupMaturity: RiskLevel;
  legalBarriers: RiskLevel;
  esgImpact: RiskLevel;
  itPriority: RiskLevel;
  hrAvailability: RiskLevel;
  stakeholderSupport: RiskLevel;
  executionRisk: RiskLevel;
}

// Section 5: Standard Risks (Light)
export interface StandardRisks {
  itDependency: boolean;
  lackOfData: boolean;
  lowStartupCapacity: boolean;
  lackOfBudget: boolean;
  internalResistance: boolean;
}

export interface ProjectInputs {
  projectModel: ProjectModel; // 'standard' or 'pro'
  projectName: string;
  associatedCompany: string; 
  
  // --- NEW FIELDS: STARTUP PARTNER ---
  hasAssociatedStartup: boolean;
  startupName?: string;
  startupCNPJ?: string;

  // --- STANDARD MODEL FIELDS (LIGHT STRUCTURE) ---
  // 1. Geral
  department?: string;
  projectOwner?: string;
  valueType: 'revenue_generation' | 'cost_reduction' | 'cost_avoidance' | 'new_revenue' | 'revenue_increase';
  
  // 2. Custos Simples
  standardDirectCost?: number; // Custo total estimado da solução
  standardFees?: number; // Outras taxas
  standardTeamRateHour?: number; // Vh
  standardTeamHours?: number; // Horas dedicadas
  standardDurationMonths?: number; // Meses da POC
  
  // 3. Dados de Valor (Reuses proMetrics structure for simplicity)
  // 4. Resultado Esperado
  standardGoal?: string; // Meta principal
  standardKPI?: string; // Indicador-chave
  standardImpact?: string; // Impacto esperado
  
  // 5. Riscos Light
  standardRisks?: StandardRisks;
  
  // 6. Obs
  standardObservations?: string;

  // --- PRO MODEL FIELDS (STRUCTURED 1-8) ---
  
  // 1. Dados Gerais (Pro specific extensions)
  stakeholders?: string;
  initiativeType?: 'open' | 'closed' | 'internal' | 'startup';
  stageGate?: 'discovery' | 'validation' | 'poc' | 'scale';
  innovationThesis?: string;
  strategicObjective?: string;
  problemDescription?: string;
  opportunityDescription?: string;

  // 2. Dados Operacionais (VE) - Shared valueType above
  proMetrics: ProOperationalMetrics;

  // 3. Custos (CPOC)
  proDirectCost: number; // Startup cost
  proFees?: number; // Taxas
  proLicenses?: number;
  proExternalServices?: number;
  proInfrastructure?: number;
  
  proTeamRateHour: number; // Vh
  proTeamHours: number; // h (monthly)
  proTeamCount?: number; // Number of people
  proOtherExpenses?: number;

  proDurationMonths: number; // Tm POC
  proScaleDurationMonths?: number; // Implementation time

  // 4. Premissas
  monthlyVolumePredictable?: number;
  seasonality?: string;
  usageFrequency?: string;
  operationalConstraints?: string;
  criticalDependencies?: string;

  // 5. Cenários
  scenarioRealisticInput?: ScenarioInput;
  scenarioOptimisticInput?: ScenarioInput;
  scenarioPessimisticInput?: ScenarioInput;

  // 6. ICV Score (8 questions: 2=Sim, 1=Parcial, 0=Não)
  icvAnswersPro?: ('sim' | 'parcial' | 'nao')[]; 
  
  // 7. Objeções Não Econômicas
  nonEconomicRisks?: NonEconomicRisks;

  // 8. Dados Portfólio
  innovationHorizon?: 'H1' | 'H2' | 'H3';
  thesisAlignment?: string;
  customerImpact?: string;
  internalImpact?: string;
  solutionComplexity?: 'low' | 'medium' | 'high';
  uncertaintyDegree?: 'low' | 'medium' | 'high';

  // Legacy fields (kept for type compatibility if needed, but mostly unused in new forms)
  initialInvestment: number; 
  monthlyBurnRate: number; 
  cac: number; 
  ltv: number; 
  estimatedUsersYear1: number;
  churnRate: number; 
  confidenceLevel: 'low' | 'medium' | 'high';
  pocDurationMonths: number; 
  pocMonthlyOpCost: number;
  pocTeamRateHour: number;
  pocTeamHours: number;
  icvAnswers: boolean[]; 
  proIndirectCost: number; 
  proVariableCostMonthly: number; 
  scaleCustosDiretos?: number;
  scaleVolume?: number;
}

export interface ScenarioMetrics {
  roi: number;
  netProfit: number; // GE
  revenue: number; // VE
  label: string;
  totalCost?: number;
}

export interface RolloutYear {
  year: number;
  revenue: number;
  cost: number;
  profit: number;
  accumulatedProfit: number;
}

export interface CalculatedMetrics {
  paybackPeriodMonths: number;
  innovationScore: number; // 0-100
  successProbability: number; // %
  scenarios: {
    pessimistic: ScenarioMetrics;
    realistic: ScenarioMetrics;
    optimistic: ScenarioMetrics;
  };
  runwayMonths: number;
  
  // Metrics
  pocTotalCost: number;
  icvScore: number; // 0-100%
  costBenefitRatio: number; // GEe / Ce
  
  economicValue?: number; // VE
  economicGain?: number; // GE

  // Pro Specific
  rolloutProjections?: RolloutYear[];
  riskScore?: number; // 0-100 (High is bad)
}

export interface AIAnalysis {
  strategicAnalysis: string;
  riskAssessment: string;
  marketViability: string; 
  recommendations: string[];
  marketFitScore: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  company?: string;
  avatar?: string;
  phone?: string;
  jobTitle?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  status: 'active' | 'inactive';
  createdAt: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SavedReport {
  id: string;
  userId: string;
  createdAt: number; 
  data: ProjectInputs;
  metrics: CalculatedMetrics;
  analysis: AIAnalysis | null;
}

export type ViewState = 'form' | 'dashboard' | 'list' | 'admin';
