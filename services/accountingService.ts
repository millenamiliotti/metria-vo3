
import { ProjectInputs, CalculatedMetrics, ScenarioMetrics, RolloutYear } from '../types';

const calculateProMetrics = (inputs: ProjectInputs): CalculatedMetrics => {
  const {
    // Section 3: Costs
    proDirectCost, // Startup Cost
    proFees = 0,
    proLicenses = 0,
    proExternalServices = 0,
    proInfrastructure = 0,
    
    proTeamRateHour,
    proTeamHours,
    proOtherExpenses = 0, // Indirect extra
    proDurationMonths, // POC Duration
    
    // Section 2: Operational
    valueType,
    proMetrics,
    
    // Section 5: Scenarios
    scenarioRealisticInput,
    scenarioOptimisticInput,
    scenarioPessimisticInput,

    // Section 6: ICV
    icvAnswersPro,
    
    // Section 7: Risks
    nonEconomicRisks,
    
    // Legacy/Fallback for simplicity if section 5 is empty
    scaleCustosDiretos = 0
  } = inputs;

  // 1. Custo Total da POC (Detailed)
  // Direct Costs Sum
  const totalDirect = proDirectCost + proFees + proLicenses + proExternalServices + proInfrastructure;
  
  // Indirect Costs Sum (Labor + Overhead)
  const laborMonthly = (proTeamRateHour || 0) * (proTeamHours || 0);
  const totalIndirect = (laborMonthly * proDurationMonths) + (proOtherExpenses * proDurationMonths); // Assuming expenses are monthly
  
  const pocTotalCost = totalDirect + totalIndirect;

  // 2. Valor Econômico (VE) - Based on Section 2 & 5 (Realistic)
  // We use the "Realistic" inputs from Section 5 if available, otherwise fallback to Section 2 data
  
  const getVE = (volume: number, efficiency: number, unitValue: number): number => {
      // Efficiency is a multiplier (e.g., 1.0, 1.1, 0.9)
      return unitValue * volume * efficiency * proDurationMonths;
  };

  // Base unit value calculation
  let baseUnitValue = 0;
  let baseVolume = 0;

  switch (valueType) {
    case 'cost_reduction':
      baseUnitValue = (proMetrics.currentUnitCost || 0) - (proMetrics.newUnitCost || 0);
      baseVolume = proMetrics.volumeTraded || 0;
      break;
    case 'revenue_increase':
       baseUnitValue = proMetrics.ticketPrice || 0;
       baseVolume = proMetrics.additionalSales || 0;
       if (proMetrics.newTicketPrice && proMetrics.ticketPrice) {
          const deltaTicket = proMetrics.newTicketPrice - proMetrics.ticketPrice;
          baseUnitValue = deltaTicket > 0 ? deltaTicket : baseUnitValue;
       }
       break;
    case 'new_revenue':
      baseUnitValue = proMetrics.productPrice || 0;
      baseVolume = proMetrics.salesVolume || 0;
      break;
    case 'cost_avoidance':
      baseUnitValue = proMetrics.futurePredictableCost || 0; // Total cost
      baseVolume = 1; // Treated as 1 event
      break;
  }

  // Use Scenario 5 inputs if valid, else fallback
  const realisticVE = scenarioRealisticInput 
    ? getVE(scenarioRealisticInput.volume, scenarioRealisticInput.efficiency, baseUnitValue)
    : baseUnitValue * baseVolume * proDurationMonths;

  // 3. Ganho Econômico (GE)
  const realisticGE = realisticVE - pocTotalCost;
  
  // 4. ROI
  const realisticROI = pocTotalCost > 0 ? (realisticGE / pocTotalCost) * 100 : 0;

  // 5. Scenarios (Pessimistic / Optimistic)
  const calcScenario = (input: typeof scenarioRealisticInput, multiplier: number, label: string): ScenarioMetrics => {
     let ve = 0;
     let cost = pocTotalCost;

     if (input) {
         ve = getVE(input.volume, input.efficiency, baseUnitValue);
     } else {
         ve = realisticVE * multiplier;
     }
     
     const ge = ve - cost;
     const roi = cost > 0 ? (ge / cost) * 100 : 0;
     
     return {
        roi: parseFloat(roi.toFixed(2)),
        netProfit: parseFloat(ge.toFixed(2)),
        revenue: parseFloat(ve.toFixed(2)),
        totalCost: parseFloat(cost.toFixed(2)),
        label
     };
  };

  const scenarios = {
    pessimistic: calcScenario(scenarioPessimisticInput, 0.7, 'Pessimista'),
    realistic: { roi: parseFloat(realisticROI.toFixed(2)), netProfit: parseFloat(realisticGE.toFixed(2)), revenue: parseFloat(realisticVE.toFixed(2)), totalCost: parseFloat(pocTotalCost.toFixed(2)), label: 'Realista' },
    optimistic: calcScenario(scenarioOptimisticInput, 1.3, 'Otimista')
  };

  // 6. ICV (Detailed: Sim=12.5, Parcial=6.25, Não=0)
  let icvScore = 0;
  if (icvAnswersPro) {
      icvAnswersPro.forEach(ans => {
          if (ans === 'sim') icvScore += 12.5;
          if (ans === 'parcial') icvScore += 6.25;
      });
  } else {
      icvScore = 50;
  }

  // 7. Cost Benefit (Scale)
  const annualVE = (realisticVE / proDurationMonths) * 12;
  const annualCost = inputs.proScaleDurationMonths ? (pocTotalCost / proDurationMonths) * 12 : pocTotalCost * 4; 
  const scaleCostReal = scenarioRealisticInput ? scenarioRealisticInput.directCost * 12 : annualCost;
  
  const costBenefitRatio = scaleCostReal > 0 ? (annualVE - scaleCostReal) / scaleCostReal : 0;

  // 8. Innovation Score
  let score = (realisticROI > 0 ? Math.min(realisticROI, 200) / 4 : 0) + (icvScore / 2);
  let riskScore = 0;
  if (nonEconomicRisks) {
      const riskValues = { low: 1, medium: 2, high: 3 };
      const risks = Object.values(nonEconomicRisks) as ('low'|'medium'|'high')[];
      const totalRiskVal = risks.reduce((acc, r) => acc + riskValues[r], 0);
      const maxRiskVal = risks.length * 3;
      riskScore = (totalRiskVal / maxRiskVal) * 100;
  }
  
  if (riskScore < 30) score += 20;
  else if (riskScore < 60) score += 10;
  
  score = Math.min(score, 100);

  // 9. Rollout Projections (12 mo to 5 Years)
  let rolloutProjections: RolloutYear[] = [];
  if (score >= 60) {
      const baseYearRevenue = annualVE;
      const baseYearCost = scaleCostReal;
      for (let y = 1; y <= 5; y++) {
          const growth = 1 + (0.15 * (y - 1)); 
          const rev = baseYearRevenue * growth;
          const cst = baseYearCost * (1 + (0.05 * (y-1))); 
          rolloutProjections.push({
              year: y,
              revenue: parseFloat(rev.toFixed(2)),
              cost: parseFloat(cst.toFixed(2)),
              profit: parseFloat((rev - cst).toFixed(2)),
              accumulatedProfit: 0 // Calc in loop
          });
      }
      let acc = 0;
      rolloutProjections.forEach(r => {
          acc += r.profit;
          r.accumulatedProfit = parseFloat(acc.toFixed(2));
      });
  }

  let prob = 50 + (icvScore * 0.3) + (realisticROI * 0.05) - (riskScore * 0.2);
  prob = Math.min(Math.max(prob, 10), 95);

  return {
    paybackPeriodMonths: (pocTotalCost / (realisticVE / proDurationMonths)) || 0,
    innovationScore: parseFloat(score.toFixed(0)),
    successProbability: parseFloat(prob.toFixed(1)),
    scenarios,
    runwayMonths: 0,
    pocTotalCost: parseFloat(pocTotalCost.toFixed(2)),
    icvScore: parseFloat(icvScore.toFixed(0)),
    costBenefitRatio: parseFloat(costBenefitRatio.toFixed(2)),
    economicValue: parseFloat(realisticVE.toFixed(2)),
    economicGain: parseFloat(realisticGE.toFixed(2)),
    rolloutProjections,
    riskScore: parseFloat(riskScore.toFixed(0))
  };
};

export const calculateMetrics = (inputs: ProjectInputs): CalculatedMetrics => {
  if (inputs.projectModel === 'pro') {
    return calculateProMetrics(inputs);
  }

  // --- STANDARD MODEL (LIGHT) ---
  const {
    standardDirectCost = 0,
    standardFees = 0,
    standardTeamRateHour = 0,
    standardTeamHours = 0,
    standardDurationMonths = 1,
    valueType,
    proMetrics
  } = inputs;

  // 1. Costs
  const directTotal = standardDirectCost + standardFees;
  const indirectTotal = (standardTeamRateHour * standardTeamHours) * standardDurationMonths;
  const pocTotalCost = directTotal + indirectTotal;

  // 2. VE (Standard uses same Pro Metric structure but fewer fields)
  let unitValue = 0;
  let volume = 0;

  switch (valueType) {
    case 'cost_reduction':
      unitValue = (proMetrics.currentUnitCost || 0) - (proMetrics.newUnitCost || 0);
      volume = proMetrics.volumeTraded || 0;
      break;
    case 'revenue_increase':
       // Simple: Ticket * Additional Sales
       unitValue = proMetrics.ticketPrice || 0;
       volume = proMetrics.additionalSales || 0;
       break;
    case 'new_revenue':
      unitValue = proMetrics.productPrice || 0;
      volume = proMetrics.salesVolume || 0;
      break;
    case 'cost_avoidance':
      unitValue = proMetrics.futurePredictableCost || 0;
      volume = 1; 
      break;
  }

  const ve = unitValue * volume * standardDurationMonths;
  const ge = ve - pocTotalCost;
  const roi = pocTotalCost > 0 ? (ge / pocTotalCost) * 100 : 0;
  
  // Simple Scenarios (Just one realistic since Standard is light)
  const scenarios = {
      pessimistic: { roi: 0, netProfit: 0, revenue: 0, label: 'N/A' },
      realistic: { 
          roi: parseFloat(roi.toFixed(2)), 
          netProfit: parseFloat(ge.toFixed(2)), 
          revenue: parseFloat(ve.toFixed(2)), 
          totalCost: parseFloat(pocTotalCost.toFixed(2)),
          label: 'Realista' 
      },
      optimistic: { roi: 0, netProfit: 0, revenue: 0, label: 'N/A' }
  };

  // Simple Score
  let score = roi > 0 ? 60 : 40;
  if (roi > 100) score += 20;
  
  const payback = ge > 0 ? pocTotalCost / (ve/standardDurationMonths) : 0;

  return {
    paybackPeriodMonths: parseFloat(payback.toFixed(1)),
    innovationScore: score,
    successProbability: 50, // Default for Light
    scenarios,
    runwayMonths: 0, // Not used
    pocTotalCost: parseFloat(pocTotalCost.toFixed(2)),
    icvScore: 0, // Not used in Light
    costBenefitRatio: 0, // Not used in Light
    economicValue: parseFloat(ve.toFixed(2)),
    economicGain: parseFloat(ge.toFixed(2))
  };
};
