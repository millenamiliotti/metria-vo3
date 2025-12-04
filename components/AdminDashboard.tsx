import React, { useEffect, useState } from 'react';
import { User, Company } from '../types';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { databaseService } from '../services/databaseService';
import { useToast } from '../contexts/ToastContext';
import { Users, Briefcase, Building, BarChart as BarChartIcon, ShieldCheck, Plus, Edit, Trash2, X, Search, LayoutGrid } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface UserStat extends User {
  projectCount: number;
}

interface CompanyStat extends Company {
  userCount: number;
  projectCount: number;
}

const AdminDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'companies'>('overview');
  
  // Data State
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalCompanies: 0,
    avgProjectsPerUser: 0
  });
  const [usersList, setUsersList] = useState<UserStat[]>([]);
  const [companyList, setCompanyList] = useState<CompanyStat[]>([]);
  const [companyChartData, setCompanyChartData] = useState<{name: string, projects: number}[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({ name: '', industry: '', status: 'active' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    const users = authService.getAllUsers();
    const reports = storageService.getAllReports();
    const companies = databaseService.companies.getAll();

    // 1. Process Users
    const enrichedUsers = users.map(user => {
      const userReports = reports.filter(r => r.userId === user.id);
      return {
        ...user,
        projectCount: userReports.length
      };
    });

    // 2. Process Companies
    // First, verify if there are user companies NOT in the companies DB (legacy handling)
    const userCompanyNames = new Set(users.map(u => u.company || 'Sem Empresa'));
    // Ensure all user companies are represented (optional, but good for display)

    const enrichedCompanies = companies.map(comp => {
        const compUsers = users.filter(u => u.company === comp.name);
        const userIds = compUsers.map(u => u.id);
        const compProjects = reports.filter(r => userIds.includes(r.userId));
        
        return {
            ...comp,
            userCount: compUsers.length,
            projectCount: compProjects.length
        };
    });

    // 3. Prepare Chart Data (Top 10 Companies by Projects)
    const chartData = enrichedCompanies
        .map(c => ({ name: c.name, projects: c.projectCount }))
        .sort((a, b) => b.projects - a.projects)
        .slice(0, 10);

    setStats({
      totalUsers: users.length,
      totalProjects: reports.length,
      totalCompanies: companies.length,
      avgProjectsPerUser: users.length > 0 ? parseFloat((reports.length / users.length).toFixed(1)) : 0
    });

    setUsersList(enrichedUsers.sort((a, b) => b.projectCount - a.projectCount));
    setCompanyList(enrichedCompanies);
    setCompanyChartData(chartData);
  };

  // --- Company Management Handlers ---

  const handleOpenModal = (company?: CompanyStat) => {
    if (company) {
      setEditingCompany(company);
      setFormData({ name: company.name, industry: company.industry, status: company.status as string });
    } else {
      setEditingCompany(null);
      setFormData({ name: '', industry: '', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompany) {
      // Edit Mode
      const updatedCompany: Company = {
        ...editingCompany,
        name: formData.name,
        industry: formData.industry,
        status: formData.status as 'active' | 'inactive'
      };
      databaseService.companies.update(updatedCompany);

      // CRITICAL: Update linked Users if name changed
      if (editingCompany.name !== formData.name) {
          const allUsers = authService.getAllUsers();
          const affectedUsers = allUsers.filter(u => u.company === editingCompany.name);
          affectedUsers.forEach(u => {
             // We need a raw update method for users in DB service to persist this
             const updatedUser = { ...u, company: formData.name };
             databaseService.users.update(updatedUser);
          });
          if (affectedUsers.length > 0) {
              addToast(`${affectedUsers.length} usuários atualizados para a nova empresa.`, 'info');
          }
      }

      addToast('Empresa atualizada com sucesso.', 'success');
    } else {
      // Create Mode
      const newCompany: Company = {
        id: crypto.randomUUID(),
        name: formData.name,
        industry: formData.industry,
        status: formData.status as 'active' | 'inactive',
        createdAt: Date.now()
      };
      databaseService.companies.add(newCompany);
      addToast('Nova empresa cadastrada.', 'success');
    }
    
    setIsModalOpen(false);
    loadData();
  };

  const handleDeleteCompany = (id: string, userCount: number) => {
      if (userCount > 0) {
          addToast('Não é possível excluir uma empresa com usuários ativos.', 'error');
          return;
      }
      if (confirm('Tem certeza que deseja excluir esta empresa?')) {
          databaseService.companies.delete(id);
          addToast('Empresa removida.', 'success');
          loadData();
      }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="bg-slate-900 text-white p-8 rounded-xl shadow-lg relative overflow-hidden border-b-4 border-yellow-500">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-yellow-500" />
            Painel Administrativo
          </h2>
          <p className="text-slate-300 mt-2">Visão geral de métricas de uso da plataforma SaaS.</p>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-slate-800 to-transparent pointer-events-none"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
         <button 
           onClick={() => setActiveTab('overview')}
           className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition border-b-2 ${
             activeTab === 'overview' 
              ? 'border-yellow-500 text-slate-900 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
           }`}
         >
            <LayoutGrid className="w-4 h-4" /> Visão Geral
         </button>
         <button 
           onClick={() => setActiveTab('companies')}
           className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition border-b-2 ${
             activeTab === 'companies' 
              ? 'border-yellow-500 text-slate-900 font-bold' 
              : 'border-transparent text-slate-500 hover:text-slate-700'
           }`}
         >
            <Building className="w-4 h-4" /> Gerenciar Empresas
         </button>
      </div>

      {activeTab === 'overview' ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg">
                    <Users className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                    <p className="text-sm font-medium text-slate-500">Total Usuários</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.totalUsers}</h3>
                    </div>
                </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-50 rounded-lg">
                    <Briefcase className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                    <p className="text-sm font-medium text-slate-500">Projetos Gerados</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.totalProjects}</h3>
                    </div>
                </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 rounded-lg">
                    <Building className="w-6 h-6 text-slate-700" />
                    </div>
                    <div>
                    <p className="text-sm font-medium text-slate-500">Empresas Ativas</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.totalCompanies}</h3>
                    </div>
                </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                    <BarChartIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                    <p className="text-sm font-medium text-slate-500">Média Proj/User</p>
                    <h3 className="text-2xl font-bold text-slate-900">{stats.avgProjectsPerUser}</h3>
                    </div>
                </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Building className="w-5 h-5 text-yellow-500" />
                    Top 10 Empresas por Volume de Projetos
                </h3>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={companyChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 12}} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b'}} 
                        allowDecimals={false}
                    />
                    <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="projects" name="Projetos" radius={[4, 4, 0, 0]} barSize={50}>
                        {companyChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="#0f172a" />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800">Base de Usuários Recentes</h3>
                <span className="text-xs font-medium px-2 py-1 bg-slate-200 rounded text-slate-600">
                    {usersList.length} Registros
                </span>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 font-semibold">Usuário</th>
                        <th className="px-6 py-3 font-semibold">Empresa</th>
                        <th className="px-6 py-3 font-semibold">Cargo</th>
                        <th className="px-6 py-3 font-semibold text-center">Projetos</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                    {usersList.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                            <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="w-8 h-8 rounded-full border border-slate-200"
                            />
                            <div>
                                <div className="font-medium text-slate-900">{user.name}</div>
                                <div className="text-xs text-slate-500">{user.email}</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                            {user.company}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                            user.role === 'admin' 
                                ? 'bg-slate-900 text-white' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                            {user.role}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                            user.projectCount > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {user.projectCount}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Ativo
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
          </>
      ) : (
          <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                   <h3 className="text-xl font-bold text-slate-900">Empresas Cadastradas</h3>
                   <p className="text-slate-500 text-sm">Gerencie as organizações que utilizam a Innometria.</p>
                </div>
                <button 
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-slate-900 font-bold rounded-lg hover:bg-yellow-400 transition"
                >
                    <Plus className="w-4 h-4" /> Adicionar Empresa
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-3 font-semibold">Empresa</th>
                                <th className="px-6 py-3 font-semibold">Setor/Indústria</th>
                                <th className="px-6 py-3 font-semibold text-center">Usuários</th>
                                <th className="px-6 py-3 font-semibold text-center">Projetos</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {companyList.map((company) => (
                                <tr key={company.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900">{company.name}</div>
                                        <div className="text-xs text-slate-400">ID: {company.id.substring(0,8)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {company.industry || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
                                            {company.userCount}
                                        </span>
                                    </td>
                                     <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
                                            {company.projectCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${
                                            company.status === 'active' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-red-100 text-red-700'
                                        }`}>
                                            {company.status === 'active' ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(company)}
                                                className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCompany(company.id, company.userCount)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {companyList.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        Nenhuma empresa cadastrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
              </div>
          </div>
      )}

      {/* Modal for Add/Edit Company */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-fade-in-up">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">
                          {editingCompany ? 'Editar Empresa' : 'Adicionar Nova Empresa'}
                      </h3>
                      <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <form onSubmit={handleSaveCompany} className="p-6 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Empresa</label>
                          <input 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-500 outline-none"
                            placeholder="Ex: Tech Solutions Ltda"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Setor / Indústria</label>
                          <input 
                            type="text" 
                            required
                            value={formData.industry}
                            onChange={(e) => setFormData({...formData, industry: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-500 outline-none"
                            placeholder="Ex: Varejo, SaaS, Logística"
                          />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                          <select 
                             value={formData.status}
                             onChange={(e) => setFormData({...formData, status: e.target.value})}
                             className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-yellow-500 outline-none bg-white"
                          >
                              <option value="active">Ativo</option>
                              <option value="inactive">Inativo</option>
                          </select>
                      </div>
                      <div className="pt-2 flex gap-3">
                          <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition"
                          >
                              Cancelar
                          </button>
                          <button 
                            type="submit" 
                            className="flex-1 py-2.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-yellow-500 hover:text-slate-900 transition"
                          >
                              {editingCompany ? 'Salvar Alterações' : 'Criar Empresa'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminDashboard;