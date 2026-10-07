// Renewal Risk Radar
class RenewalRiskRadar {
  constructor() {}

  evaluateContract(contract) {
    const { id, client, acv, daysUntilExpiry, openP0Tickets, recentNps } = contract;

    let riskLevel = 'LOW';
    let renewalProbability = 0.95;

    if (daysUntilExpiry <= 90) {
      if (openP0Tickets > 0 || recentNps <= 6) {
        riskLevel = 'CRITICAL';
        renewalProbability = 0.35;
      } else if (recentNps <= 7) {
        riskLevel = 'MODERATE';
        renewalProbability = 0.70;
      }
    }

    const valueAtRisk = Math.round(acv * (1 - renewalProbability));

    return {
      contractId: id,
      client,
      acv,
      daysUntilExpiry,
      openP0Tickets,
      recentNps,
      riskLevel,
      renewalProbability: Math.round(renewalProbability * 100),
      valueAtRisk,
      playbook: this.selectPlaybook(riskLevel)
    };
  }

  selectPlaybook(risk) {
    if (risk === 'CRITICAL') {
      return 'Initiate VP Engineering escalation + offer 20% early renewal rebate';
    }
    if (risk === 'MODERATE') {
      return 'Schedule Executive Business Review + review open feature requests';
    }
    return 'Send standard annual renewal agreement';
  }

  auditRenewals(contracts) {
    const list = contracts.map(c => this.evaluateContract(c));
    const totalAcv = list.reduce((sum, c) => sum + c.acv, 0);
    const totalAtRisk = list.reduce((sum, c) => sum + c.valueAtRisk, 0);
    const criticalCount = list.filter(c => c.riskLevel === 'CRITICAL').length;

    return {
      totalContracts: list.length,
      totalAcv,
      totalAtRisk,
      criticalCount,
      contracts: list
    };
  }
}

module.exports = { RenewalRiskRadar };
