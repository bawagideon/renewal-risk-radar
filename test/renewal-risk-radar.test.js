const { test } = require('node:test');
const assert = require('node:assert');
const { RenewalRiskRadar } = require('../src/index.js');

test('RenewalRiskRadar: flags contract with open P0 tickets as CRITICAL', () => {
  const radar = new RenewalRiskRadar();
  const res = radar.evaluateContract({
    id: 'c1',
    client: 'Acme Bank',
    acv: 50000,
    daysUntilExpiry: 45,
    openP0Tickets: 2,
    recentNps: 5
  });
  assert.strictEqual(res.riskLevel, 'CRITICAL');
  assert.strictEqual(res.renewalProbability, 35);
  assert.ok(res.valueAtRisk > 30000);
});

test('RenewalRiskRadar: assesses safe renewal for high NPS client', () => {
  const radar = new RenewalRiskRadar();
  const res = radar.evaluateContract({
    id: 'c2',
    client: 'Safe Global',
    acv: 25000,
    daysUntilExpiry: 60,
    openP0Tickets: 0,
    recentNps: 9
  });
  assert.strictEqual(res.riskLevel, 'LOW');
  assert.ok(res.renewalProbability >= 90);
});

test('RenewalRiskRadar: aggregates cohort renewal pipeline risk', () => {
  const radar = new RenewalRiskRadar();
  const res = radar.auditRenewals([
    { id: '1', client: 'A', acv: 20000, daysUntilExpiry: 30, openP0Tickets: 1, recentNps: 4 },
    { id: '2', client: 'B', acv: 30000, daysUntilExpiry: 60, openP0Tickets: 0, recentNps: 10 }
  ]);
  assert.strictEqual(res.criticalCount, 1);
  assert.ok(res.totalAtRisk > 10000);
});
