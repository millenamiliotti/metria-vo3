import { User, SavedReport, Company } from '../types';

const DB_KEYS = {
  USERS: 'innometria_db_users',
  REPORTS: 'innometria_db_reports',
  COMPANIES: 'innometria_db_companies'
};

// Dados iniciais para popular o "banco" (Seed) apenas no PRIMEIRO acesso absoluto
const SEED_DATA = {
  companies: [
    { id: 'comp-001', name: 'Metria HQ', industry: 'SaaS / Tecnologia', status: 'active', createdAt: Date.now() },
    { id: 'comp-002', name: 'TechCorp Solutions', industry: 'Consultoria TI', status: 'active', createdAt: Date.now() },
    { id: 'comp-003', name: 'Startup Lab', industry: 'Aceleradora', status: 'active', createdAt: Date.now() },
    { id: 'comp-004', name: 'Varejo 4.0', industry: 'Varejo', status: 'active', createdAt: Date.now() }
  ] as Company[],
  users: [
    {
      id: 'admin-001',
      name: 'Fundadora Metria',
      email: 'admin@metria.com',
      password: 'admin',
      role: 'admin',
      company: 'Metria HQ',
      jobTitle: 'CEO & Founder',
      phone: '+55 11 99999-9999',
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      avatar: 'https://ui-avatars.com/api/?name=Fundadora+Metria&background=0f172a&color=fff'
    },
    {
      id: 'user-001',
      name: 'Carlos Tech',
      email: 'carlos@techcorp.com.br',
      password: '123',
      role: 'user',
      company: 'TechCorp Solutions',
      jobTitle: 'CTO',
      phone: '+55 41 98888-8888',
      city: 'Curitiba',
      state: 'PR',
      country: 'Brasil',
      avatar: 'https://ui-avatars.com/api/?name=Carlos+Tech&background=random'
    },
    {
      id: 'user-002',
      name: 'Ana Inovação',
      email: 'ana@startuplab.com',
      password: '123',
      role: 'user',
      company: 'Startup Lab',
      jobTitle: 'Innovation Manager',
      phone: '+55 21 97777-7777',
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      avatar: 'https://ui-avatars.com/api/?name=Ana+Inovacao&background=random'
    },
    {
      id: 'user-003',
      name: 'Roberto Vendas',
      email: 'roberto@varejo.com',
      password: '123',
      role: 'user',
      company: 'Varejo 4.0',
      jobTitle: 'Diretor Comercial',
      phone: '+55 31 96666-6666',
      city: 'Belo Horizonte',
      state: 'MG',
      country: 'Brasil',
      avatar: 'https://ui-avatars.com/api/?name=Roberto+Vendas&background=random'
    }
  ] as any[],
  reports: [] as SavedReport[]
};

export const databaseService = {
  init: () => {
    // Verificação robusta: Só roda o SEED se NÃO houver nenhum usuário cadastrado.
    // Isso garante que se você criou contas novas, elas NÃO serão apagadas no refresh.
    const existingUsers = localStorage.getItem(DB_KEYS.USERS);
    
    if (!existingUsers) {
      console.log('Primeiro acesso detectado: Criando base de dados inicial...');
      
      // Salvar usuários iniciais (Seed)
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(SEED_DATA.users));
      
      // Salvar empresas iniciais
      localStorage.setItem(DB_KEYS.COMPANIES, JSON.stringify(SEED_DATA.companies));
      
      // Criar alguns relatórios fictícios para popular o dashboard admin
      const dummyReports = generateDummyReports();
      localStorage.setItem(DB_KEYS.REPORTS, JSON.stringify(dummyReports));
    } else {
      // Garantir que empresas existam (migração para usuários antigos que não tinham a key companies)
      const existingCompanies = localStorage.getItem(DB_KEYS.COMPANIES);
      if (!existingCompanies) {
         localStorage.setItem(DB_KEYS.COMPANIES, JSON.stringify(SEED_DATA.companies));
      }
      console.log('Banco de dados carregado com sucesso.');
    }
  },

  users: {
    getAll: (): any[] => {
      const data = localStorage.getItem(DB_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    },
    save: (users: any[]) => {
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
    },
    add: (user: any) => {
      const users = databaseService.users.getAll();
      users.push(user);
      databaseService.users.save(users);
    },
    update: (updatedUser: User) => {
       const users = databaseService.users.getAll();
       const index = users.findIndex((u: any) => u.id === updatedUser.id);
       if (index !== -1) {
           const oldUser = users[index];
           users[index] = { ...oldUser, ...updatedUser }; // Merge keeping password
           databaseService.users.save(users);
       }
    },
    findByEmail: (email: string) => {
      const users = databaseService.users.getAll();
      return users.find((u: any) => u.email === email);
    }
  },

  companies: {
    getAll: (): Company[] => {
      const data = localStorage.getItem(DB_KEYS.COMPANIES);
      return data ? JSON.parse(data) : [];
    },
    save: (companies: Company[]) => {
      localStorage.setItem(DB_KEYS.COMPANIES, JSON.stringify(companies));
    },
    add: (company: Company) => {
      const companies = databaseService.companies.getAll();
      companies.push(company);
      databaseService.companies.save(companies);
    },
    update: (updatedCompany: Company) => {
      const companies = databaseService.companies.getAll();
      const index = companies.findIndex(c => c.id === updatedCompany.id);
      if (index !== -1) {
        companies[index] = updatedCompany;
        databaseService.companies.save(companies);
      }
    },
    delete: (id: string) => {
      const companies = databaseService.companies.getAll();
      const newCompanies = companies.filter(c => c.id !== id);
      databaseService.companies.save(newCompanies);
    }
  },

  reports: {
    getAll: (): SavedReport[] => {
      const data = localStorage.getItem(DB_KEYS.REPORTS);
      return data ? JSON.parse(data) : [];
    },
    saveAll: (reports: SavedReport[]) => {
      localStorage.setItem(DB_KEYS.REPORTS, JSON.stringify(reports));
    },
    add: (report: SavedReport) => {
      const reports = databaseService.reports.getAll();
      reports.push(report);
      databaseService.reports.saveAll(reports);
    },
    delete: (id: string) => {
      const reports = databaseService.reports.getAll();
      const newReports = reports.filter(r => r.id !== id);
      databaseService.reports.saveAll(newReports);
    }
  }
};

// Helper para gerar relatórios falsos (apenas para popular o visual do Admin no primeiro load)
function generateDummyReports(): SavedReport[] {
  const users = SEED_DATA.users;
  const reports: SavedReport[] = [];
  const projects = [
    'SaaS Fintech', 'Marketplace B2B', 'App de Delivery', 'Plataforma EdTech', 
    'IoT Agritech', 'HealthTech AI', 'E-commerce Niche'
  ];

  for (let i = 0; i < 15; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomProject = projects[Math.floor(Math.random() * projects.length)];
    const roi = Math.floor(Math.random() * 300) - 50;
    
    // Create dummy inputs matching the new structure
    const dummyInputs = {
        projectName: randomProject,
        initialInvestment: 50000,
        monthlyBurnRate: 5000,
        cac: 100,
        ltv: 1000,
        estimatedUsersYear1: 1000,
        churnRate: 5,
        confidenceLevel: 'medium',
        valueType: 'revenue_generation',
        pocDurationMonths: 3,
        pocMonthlyOpCost: 2000,
        pocTeamRateHour: 100,
        pocTeamHours: 100,
        icvAnswers: [true, true, true, true, false, false, true, true]
    };

    reports.push({
      id: crypto.randomUUID(),
      userId: randomUser.id,
      createdAt: Date.now() - Math.floor(Math.random() * 10000000000),
      data: dummyInputs as any,
      metrics: {
        paybackPeriodMonths: Math.floor(Math.random() * 24),
        innovationScore: Math.floor(Math.random() * 100),
        successProbability: Math.floor(Math.random() * 100),
        scenarios: {
          realistic: { roi: roi, netProfit: 0, revenue: 0, label: 'Realista' },
          pessimistic: { roi: roi - 20, netProfit: 0, revenue: 0, label: 'Pessimista' },
          optimistic: { roi: roi + 20, netProfit: 0, revenue: 0, label: 'Otimista' }
        },
        runwayMonths: 12,
        pocTotalCost: 35000,
        icvScore: 75,
        costBenefitRatio: 3.5
      },
      analysis: null
    });
  }
  return reports;
}