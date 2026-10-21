import type { DemoPayslip } from '@/data/demo-data';

const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// e.g. "Payslip_Oct-20-2026_M00600": used as the PDF file name and the print tab title,
// which browsers use as the default "Save as PDF" file name.
export function payslipFileName(slip: DemoPayslip) {
  const clean = (value: string) => value.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `Payslip_${clean(slip.payrollDateShort)}_${clean(slip.payhouse)}`;
}

// Negative amounts print in parentheses, e.g. -1.57 -> (1.57)
const money = (value: string) => (value.startsWith('-') ? `(${value.slice(1)})` : value);

export type PayslipNameOverride = {
  /** Full line shown after "Name :", e.g. "DELA CRUZ, JUAN (123456)" */
  employeeName?: string;
  /** Short name shown on the right-hand stub */
  employeeNameShort?: string;
};

export function buildPayslipHtml(slip: DemoPayslip, override: PayslipNameOverride = {}) {
  const employeeName = override.employeeName ?? slip.employeeName;
  const employeeNameShort = override.employeeNameShort ?? slip.employeeNameShort;
  const earningRows = slip.earnings
    .map(
      (row) => `<tr>
        <td>${esc(row.description)}</td>
        <td class="n">${esc(row.hours)}</td>
        <td class="n">${esc(row.days)}</td>
        <td class="n">${esc(money(row.amount))}</td>
      </tr>`
    )
    .join('');

  const deductionRows = [...slip.deductions]
    .sort((a, b) => a.description.localeCompare(b.description))
    .map(
      (row) => `<tr>
        <td>${esc(row.description)}</td>
        <td class="n">${esc(row.amount)}</td>
        <td class="n">${esc(row.balance)}</td>
      </tr>`
    )
    .join('');

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(payslipFileName(slip))}</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 10px; color: #000; }
  .dash { border-top: 2px dashed #000; }
  .slip { display: flex; margin: 14px 0; min-height: 330px; }

  .main { flex: 3.2; display: flex; flex-direction: column; border-right: 1px solid #000; }
  .head { text-align: center; padding: 2px 0 12px; }
  .head .company { font-size: 12px; font-weight: 700; }
  .head .date { margin-top: 3px; font-size: 10px; }
  .namerow { display: flex; justify-content: space-between; padding: 6px 28px 6px 6px; font-size: 11px; }
  .namerow b { font-weight: 700; }

  .cols { display: flex; flex: 1; border-top: 1px solid #000; }
  .col { flex: 1; display: flex; flex-direction: column; }
  .col + .col { border-left: 1px solid #000; }
  .title { text-align: center; font-weight: 700; font-size: 10px; padding: 3px 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { font-weight: 400; color: #666; font-size: 9px; text-align: right; padding: 4px 6px; }
  th:first-child, td:first-child { text-align: left; }
  td { font-size: 8.5px; padding: 3px 6px; }
  td.n { text-align: right; }
  .spacer { flex: 1; min-height: 110px; }
  .tot { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 14px 10px; font-weight: 700; font-size: 10px; }

  .ytd { display: flex; border-top: 1px solid #000; padding: 6px 10px; }
  .ytd table { width: auto; margin: 0 auto; }
  .ytd td { font-size: 10px; padding: 2px 4px; }
  .ytd td:first-child { text-align: right; font-weight: 400; }
  .ytd td:last-child { text-align: left; font-weight: 700; }
  .ytd .block { flex: 1; }

  .stub { flex: 1; display: flex; flex-direction: column; padding: 14px 0 0 12px; }
  .office { text-align: center; font-weight: 700; font-size: 10px; }
  .sname { margin-top: 16px; text-align: center; font-weight: 700; font-size: 11px; }
  .receipt { margin-top: 18px; font-size: 9.5px; line-height: 1.5; }
  .period { margin-top: 14px; text-align: center; font-size: 9.5px; }
  .thp { margin-top: 18px; display: flex; justify-content: space-between; font-size: 10px; }
  .thp b { font-style: italic; font-size: 11px; }
  .line { margin-top: 14px; font-size: 9.5px; }
  .line span { display: inline-block; border-bottom: 1px dotted #000; width: 140px; margin-left: 6px; height: 9px; }
  .thumb { margin-top: 14px; font-size: 9.5px; }
  .stub .fill { flex: 1; }
  .payhouse { border-top: 1px solid #000; padding: 8px 0; font-size: 10.5px; }
  .payhouse b { margin-left: 6px; }
</style>
</head>
<body>
  <div class="dash"></div>
  <div class="slip">
    <div class="main">
      <div class="head">
        <div class="company">${esc(slip.company)}</div>
        <div class="date">Payroll Date : ${esc(slip.payrollDateShort)}</div>
      </div>
      <div class="namerow">
        <span>Name : <b>${esc(employeeName)}</b></span>
        <span>Payhouse : <b>${esc(slip.payhouse)}</b></span>
      </div>

      <div class="cols">
        <div class="col">
          <div class="title">EARNINGS</div>
          <table>
            <thead><tr><th>EarningsType</th><th>H</th><th>D</th><th>Amount</th></tr></thead>
            <tbody>${earningRows}</tbody>
          </table>
          <div class="spacer"></div>
          <div class="tot"><span>Total Earnings :</span><span>${esc(slip.totalEarnings)}</span></div>
        </div>
        <div class="col">
          <div class="title">DEDUCTIONS</div>
          <table>
            <thead><tr><th>Deduction Type</th><th>Amount</th><th>Loan Balance</th></tr></thead>
            <tbody>${deductionRows}</tbody>
          </table>
          <div class="spacer"></div>
          <div class="tot">
            <span>Total Deductions :</span>
            <span>${esc(slip.totalDeductions)}</span>
            <span>NET PAY : ${esc(slip.netIncome)}</span>
          </div>
        </div>
      </div>

      <div class="ytd">
        <div class="block"><table>
          <tr><td>YTD Basic :</td><td>${esc(slip.ytdBasic)}</td></tr>
          <tr><td>YTD Taxable :</td><td>${esc(slip.ytdTaxable)}</td></tr>
          <tr><td>YTD Tax Withheld :</td><td>${esc(slip.ytdTaxWithheld || '0.00')}</td></tr>
        </table></div>
        <div class="block"><table>
          <tr><td>Tax Status :</td><td>${esc(slip.taxStatus)}</td></tr>
          <tr><td>Position :</td><td>${esc(slip.position)}</td></tr>
          <tr><td>Department :</td><td>${esc(slip.department)}</td></tr>
        </table></div>
        <div class="block"><table>
          <tr><td>No of Hours :</td><td>${esc(slip.noOfHours)}</td></tr>
          <tr><td>No. of Days :</td><td>${esc(slip.noOfDays)}</td></tr>
          <tr><td>Basic Rate :</td><td>${esc(slip.basicRate)}</td></tr>
        </table></div>
      </div>
    </div>

    <div class="stub">
      <div class="office">${esc(slip.headOffice)}</div>
      <div class="sname">${esc(employeeNameShort)}</div>
      <div class="receipt">
        Received the amount mentioned below<br />
        as full payment for my salary/wages<br />
        for the pay period
      </div>
      <div class="period">${esc(slip.periodShort)}</div>
      <div class="thp"><span>TAKE HOME PAY =</span><b>${esc(slip.netIncome)}</b></div>
      <div class="line">Received By :<span></span></div>
      <div class="line">Date :<span></span></div>
      <div class="thumb">THUMB MARK</div>
      <div class="fill"></div>
      <div class="payhouse">Payhouse :<b>${esc(slip.payhouse)}</b></div>
    </div>
  </div>
  <div class="dash"></div>
</body>
</html>`;
}
