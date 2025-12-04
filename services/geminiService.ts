import { GoogleGenAI, Type } from "@google/genai";
import { ProjectInputs, CalculatedMetrics, AIAnalysis } from '../types';

// NOTE: In a real app, never expose API keys on the client like this. 
// This is for the MVP demo requirement where environment vars are injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeProjectWithGemini = async (
  inputs: ProjectInputs, 
  metrics: CalculatedMetrics
): Promise<AIAnalysis> => {
  
  const isPro = inputs.projectModel === 'pro';

  const basePrompt = `
    Analise o seguinte projeto de inovação/startup com base nos dados fornecidos:
    
    Nome: ${inputs.projectName}
    Modelo de Análise: ${isPro ? 'Metodologia Avançada (Pro)' : 'Standard'}
    Innovation Score: ${metrics.innovationScore}/100
    Probabilidade de Sucesso: ${metrics.successProbability}%
    ICV (Confiança): ${metrics.icvScore}%
  `;

  const standardData = `
    Investimento Inicial: R$ ${inputs.initialInvestment}
    Burn Rate Mensal: R$ ${inputs.monthlyBurnRate}
    CAC: R$ ${inputs.cac}
    LTV: R$ ${inputs.ltv}
    Churn: ${inputs.churnRate}%
    Usuários Estimados (Ano 1): ${inputs.estimatedUsersYear1}
    ROI Realista: ${metrics.scenarios.realistic.roi}%
    Payback: ${metrics.paybackPeriodMonths > 0 ? metrics.paybackPeriodMonths + ' meses' : 'Indefinido/Longo Prazo'}
  `;

  const proData = `
    Custo Total (POC/Implementação): R$ ${metrics.pocTotalCost}
    Tipo de Valor: ${inputs.valueType}
    Valor Econômico Gerado (VE): R$ ${metrics.economicValue}
    Ganho Econômico (GE): R$ ${metrics.economicGain}
    ROI do Projeto: ${metrics.scenarios.realistic.roi}% (ou ${metrics.scenarios.realistic.roi / 100}x)
    Custo-Benefício em Escala: ${metrics.costBenefitRatio}x
    
    Detalhes Operacionais:
    - Custo Direto: R$ ${inputs.proDirectCost}
    - Custo Indireto: R$ ${inputs.proIndirectCost}
    - Duração: ${inputs.proDurationMonths} meses
  `;

  const prompt = `
    ${basePrompt}
    ${isPro ? proData : standardData}

    Por favor, forneça uma análise estruturada contendo:
    1. Uma análise estratégica breve (2-3 frases).
    2. Avaliação de riscos principais (Considerando ${isPro ? 'a viabilidade econômica (VE/GE)' : 'o runway e unit economics'}).
    3. Análise de Viabilidade de Mercado: ${isPro ? 'Foque na relação Custo x Benefício e no tipo de valor ('+inputs.valueType+')' : 'Foque especificamente na relação LTV/CAC e na taxa de Churn'}.
    4. 3 recomendações táticas para melhorar o Innovation Score.
    5. Uma nota de "Market Fit" de 0 a 10 baseada na coerência dos números.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategicAnalysis: { type: Type.STRING },
            riskAssessment: { type: Type.STRING },
            marketViability: { type: Type.STRING },
            recommendations: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            marketFitScore: { type: Type.NUMBER }
          },
          required: ["strategicAnalysis", "riskAssessment", "marketViability", "recommendations", "marketFitScore"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AIAnalysis;
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback if AI fails or key is missing
    return {
      strategicAnalysis: "Não foi possível gerar a análise detalhada no momento. Verifique sua chave de API.",
      riskAssessment: "Risco calculado com base em heurísticas padrão.",
      marketViability: "Análise indisponível no modo offline.",
      recommendations: ["Revise os custos.", "Valide a proposta de valor.", "Monitore a execução."],
      marketFitScore: 5
    };
  }
};