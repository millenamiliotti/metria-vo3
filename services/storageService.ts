import { SavedReport, User, ProjectInputs, CalculatedMetrics, AIAnalysis } from '../types';
import { databaseService } from './databaseService';

export const storageService = {
  saveReport: (user: User, data: ProjectInputs, metrics: CalculatedMetrics, analysis: AIAnalysis | null): SavedReport => {
    const newReport: SavedReport = {
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: Date.now(),
      data,
      metrics,
      analysis
    };

    databaseService.reports.add(newReport);
    return newReport;
  },

  getReportsByUser: (userId: string): SavedReport[] => {
    const allReports = databaseService.reports.getAll();
    return allReports
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  getAllReports: (): SavedReport[] => {
    return databaseService.reports.getAll();
  },

  deleteReport: (reportId: string): void => {
    databaseService.reports.delete(reportId);
  }
};