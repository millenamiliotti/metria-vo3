import React, { useState } from 'react';
import { SavedReport } from '../types';
import { Calendar, Trash2, Eye, TrendingUp, DollarSign } from 'lucide-react';

interface Props {
  reports: SavedReport[];
  onView: (report: SavedReport) => void;
  onDelete: (reportId: string) => void;
  onCreateNew: () => void;
}

const ReportsList: React.FC<Props> = ({ reports, onView, onDelete, onCreateNew }) => {
  if (reports.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="bg-slate-100 p-4 rounded-full inline-block mb-4">
          <TrendingUp className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum relatório salvo</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Você ainda não salvou nenhuma análise. Crie um novo projeto para começar a monitorar suas inovações.
        </p>
        <button 
          onClick={onCreateNew}
          className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-yellow-500 hover:text-slate-900 transition"
        >
          Criar Novo Projeto
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Meus Relatórios</h2>
        <button 
          onClick={onCreateNew}
          className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-yellow-500 hover:text-slate-900 transition shadow-sm"
        >
          + Novo Projeto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-4 font-semibold">Projeto</th>
                <th className="px-6 py-4 font-semibold">Data Criação</th>
                <th className="px-6 py-4 font-semibold">Score</th>
                <th className="px-6 py-4 font-semibold">ROI (Realista)</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{report.data.projectName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                       <DollarSign className="w-3 h-3" /> Inv. R$ {report.data.initialInvestment.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                       {new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className={`text-sm font-bold px-2 py-1 rounded ${
                         report.metrics.innovationScore >= 75 ? 'bg-green-100 text-green-700' :
                         report.metrics.innovationScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                         'bg-red-100 text-red-700'
                       }`}>
                         {report.metrics.innovationScore}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`font-semibold ${
                       report.metrics.scenarios.realistic.roi > 0 ? 'text-green-600' : 'text-red-600'
                     }`}>
                       {report.metrics.scenarios.realistic.roi}%
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onView(report)}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Ver Relatório"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => onDelete(report.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsList;