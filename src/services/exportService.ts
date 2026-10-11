import type { FinancialState, ConsequenceMetrics } from '../types/finance';

/**
 * Export Service for Sanvektro ✦ Multi-Format Data Exports
 * Satisfies multi-format export capability: JSON Archive, Tabular CSV, and Print Statement.
 */

function downloadBlob(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports full financial state, active metrics, and audit log as structured JSON
 */
export function exportStateAsJSON(state: FinancialState, metrics: ConsequenceMetrics): void {
  const payload = {
    app: 'Sanvektro ✦ 30-Day Financial Trajectory Engine',
    author: 'Saaduddin Mohammed (github.com/saad2134)',
    exportedAt: new Date().toISOString(),
    metrics,
    financialState: state
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const filename = `sanvektro-budget-day${state.currentDay}-${Date.now()}.json`;
  downloadBlob(jsonStr, filename, 'application/json');
}

/**
 * Exports transaction ledger and scheduled commitments as CSV
 */
export function exportLedgerAsCSV(state: FinancialState): void {
  const headers = ['Type', 'Day', 'Item Title', 'Category', 'Amount (INR)', 'Status'];
  const rows: string[][] = [];

  // Inflows
  state.inflows.forEach(inf => {
    rows.push(['Inflow', String(inf.day), `"${inf.title.replace(/"/g, '""')}"`, 'Income', String(inf.amount), 'Credited']);
  });

  // Commitments
  state.commitments.forEach(c => {
    rows.push([
      'Commitment',
      String(c.dueDay),
      `"${c.name.replace(/"/g, '""')}"`,
      c.category,
      String(c.amount),
      c.isPaid ? 'Paid' : 'Pending'
    ]);
  });

  // Subscriptions
  state.subscriptions.forEach(s => {
    rows.push([
      'Subscription',
      String(s.billingDay),
      `"${s.name.replace(/"/g, '""')}"`,
      s.category,
      String(s.amount),
      s.isActive ? 'Active' : 'Paused'
    ]);
  });

  // Realized Transactions
  state.transactions.forEach(t => {
    rows.push([
      'Expense',
      String(t.day),
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      String(t.amount),
      t.isUnexpected ? 'Shock Event' : 'Discretionary'
    ]);
  });

  // Sort rows by day
  rows.sort((a, b) => parseInt(a[1], 10) - parseInt(b[1], 10));

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const filename = `sanvektro-ledger-30days-${Date.now()}.csv`;
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;');
}

/**
 * Triggers clean print-preview for physical budget statement
 */
export function printMonthlyStatement(): void {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
