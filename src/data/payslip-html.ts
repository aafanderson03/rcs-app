import type { DemoPayslip } from "@/data/demo-data";

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const clean = (value: string) =>
  value.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function payslipFileName(slip: DemoPayslip) {
  return `Payslip_${clean(slip.payrollDateShort)}_${clean(slip.payhouse)}`;
}

function payslipReference(slip: DemoPayslip) {
  return `${clean(slip.payhouse)}-${clean(slip.payrollDateShort)}`;
}

const isNegative = (value: string) => value.startsWith("-");
const money = (value: string) =>
  isNegative(value) ? `(${value.slice(1)})` : value;

const amountCell = (value: string) =>
  `<td class="n amt${isNegative(value) ? "" : " pos"}">${esc(money(value))}</td>`;

const isZero = (value: string) =>
  /^[-(]?0*\.?0*\)?$/.test(value.replace(/,/g, "").trim());
const balance = (value: string) => (isZero(value) ? "–" : value);

const MIN_ROWS = 6;

export type PayslipNameOverride = {
  employeeName?: string;

  employeeNameShort?: string;
};

export function buildPayslipHtml(
  slip: DemoPayslip,
  override: PayslipNameOverride = {},
) {
  const employeeName = override.employeeName ?? slip.employeeName;
  const employeeNameShort =
    override.employeeNameShort ?? slip.employeeNameShort;
  const printed = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const deductions = [...slip.deductions].sort((a, b) =>
    a.description.localeCompare(b.description),
  );
  const rowCount = Math.max(MIN_ROWS, slip.earnings.length, deductions.length);
  const blankRow = (cells: number) =>
    `<tr class="blank">${"<td>&nbsp;</td>".repeat(cells)}</tr>`;

  const earningRows =
    slip.earnings
      .map(
        (row) => `<tr>
        <td>${esc(row.description)}</td>
        <td class="n">${esc(row.hours)}</td>
        <td class="n">${esc(row.days)}</td>
        ${amountCell(row.amount)}
      </tr>`,
      )
      .join("") + blankRow(4).repeat(rowCount - slip.earnings.length);

  const deductionRows =
    deductions
      .map(
        (row) => `<tr>
        <td>${esc(row.description)}</td>
        <td class="n amt">${esc(row.amount)}</td>
        <td class="n">${esc(balance(row.balance))}</td>
      </tr>`,
      )
      .join("") + blankRow(3).repeat(rowCount - deductions.length);

  const kv = (label: string, value: string) =>
    `<tr><td class="k">${esc(label)}</td><td class="v">${esc(value || "")}</td></tr>`;

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(payslipFileName(slip))}</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9.5px;
    color: #000;
    font-variant-numeric: tabular-nums;
  }
  .sheet { padding: 4mm; }
  .slip {
    display: grid;
    grid-template-columns: 1fr 66mm;
    border: 1.5px solid #000; /* heavy outer border; inner rules are lighter */
    page-break-inside: avoid;
  }
  .label { font-size: 7.5px; color: #444; }

  /* ---------- pay slip ---------- */
  .main { border-right: 1px dashed #000; }
  .head { padding: 7px 10px 6px; text-align: center; border-bottom: 1px solid #000; }
  .head .company { font-size: 13px; font-weight: 700; }
  .head .title { margin-top: 2px; font-size: 9.5px; }

  /* employee block: two rows whose dividers line up */
  .info1 { display: grid; grid-template-columns: 2.4fr 1fr 1.7fr 1.2fr; border-bottom: 0.5px solid #888; }
  .info2 { display: grid; grid-template-columns: 2.4fr 2.7fr 1.2fr; border-bottom: 1px solid #000; }
  .info1 > div, .info2 > div { padding: 5px 10px 6px; }
  .info1 > div + div, .info2 > div + div { border-left: 0.5px solid #888; }
  .info1 .value, .info2 .value { margin-top: 2px; font-size: 10.5px; font-weight: 700; }
  .info2 .value { font-size: 9.5px; }

  .tables { display: grid; grid-template-columns: 1fr 1fr; }
  .col { display: flex; flex-direction: column; }
  .col + .col { border-left: 1px solid #000; }
  .col .cap { padding: 4px 10px; font-weight: 700; border-bottom: 1px solid #000; }
  .col .body { flex: 1; }
  table { width: 100%; border-collapse: collapse; }
  th { padding: 4px 10px 3px; font-size: 7.5px; font-weight: 400; color: #444; text-align: right; border-bottom: 0.5px solid #888; }
  td { padding: 3px 10px; font-size: 9.5px; border-top: 0.5px solid #aaa; }
  tbody tr:first-child td { border-top: 0; }
  th:first-child, td:first-child { text-align: left; }
  td.n { text-align: right; }
  td.pos { padding-right: calc(10px + 0.34em); }
  .total { display: flex; justify-content: space-between; padding: 5px 10px; font-weight: 700; border-top: 1px solid #000; }

  .net {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 5px 10px 6px; border-top: 3px double #000; border-bottom: 1px solid #000;
    font-weight: 700;
  }
  .net .amount { font-size: 13px; }

  .details { display: grid; grid-template-columns: 1fr 1fr; }
  .details > table + table { border-left: 0.5px solid #888; }
  .details td { padding: 2px 10px; border-top: 0; }
  .details tr:first-child td { padding-top: 5px; }
  .details tr:last-child td { padding-bottom: 5px; }
  td.k { color: #444; width: 46%; }
  td.v { font-weight: 700; }
  .foot { padding: 3px 10px; border-top: 1px solid #000; font-size: 7.5px; color: #444; display: flex; justify-content: space-between; gap: 10px; }

  /* ---------- acknowledgment stub ---------- */
  .stub { padding: 8px 10px; display: flex; flex-direction: column; }
  .stub .office { text-align: center; font-weight: 700; font-size: 9.5px; }
  .stub .name { margin-top: 10px; text-align: center; font-weight: 700; font-size: 10.5px; }
  .stub .text { margin-top: 10px; font-size: 9px; line-height: 1.5; }
  .stub .period { margin-top: 10px; text-align: center; font-size: 9.5px; }
  .stub .take { margin-top: 10px; display: flex; justify-content: space-between; align-items: baseline; font-size: 9.5px; }
  .stub .take b { font-size: 12px; }
  .stub .line { margin-top: 14px; display: flex; font-size: 9.5px; }
  .stub .line span { flex: 1; margin-left: 6px; border-bottom: 1px dotted #000; }
  .stub .sigrow { margin-top: 14px; display: flex; align-items: flex-end; gap: 8px; }
  .stub .sigrow .thumbcol { width: 18mm; }
  .stub .sigrow .signcol { flex: 1; }
  .stub .sigrow .box { height: 18mm; border: 1px solid #000; }
  .stub .sigrow .sigline { height: 18mm; border-bottom: 1px solid #000; }
  .stub .sigrow .cap { margin-top: 3px; font-size: 8px; color: #444; text-align: center; }
  .stub .fill { flex: 1; }
  .stub .payhouse { padding-top: 5px; border-top: 1px solid #000; font-size: 9.5px; }
  .stub .payhouse b { margin-left: 4px; }
</style>
</head>
<body>
  <div class="sheet">
    <div class="slip">
      <div class="main">
        <div class="head">
          <div class="company">${esc(slip.company)}</div>
          <div class="title">Payslip</div>
        </div>

        <div class="info1">
          <div><div class="label">Name</div><div class="value">${esc(employeeName)}</div></div>
          <div><div class="label">Payhouse</div><div class="value">${esc(slip.payhouse)}</div></div>
          <div><div class="label">Pay period</div><div class="value">${esc(slip.periodShort)}</div></div>
          <div><div class="label">Payroll date</div><div class="value">${esc(slip.payrollDateShort)}</div></div>
        </div>
        <div class="info2">
          <div><div class="label">Position</div><div class="value">${esc(slip.position)}</div></div>
          <div><div class="label">Department</div><div class="value">${esc(slip.department)}</div></div>
          <div><div class="label">Tax status</div><div class="value">${esc(slip.taxStatus || "—")}</div></div>
        </div>

        <div class="tables">
          <div class="col">
            <div class="cap">Earnings</div>
            <div class="body">
              <table>
                <thead><tr><th>Earnings type</th><th>H</th><th>D</th><th>Amount</th></tr></thead>
                <tbody>${earningRows}</tbody>
              </table>
            </div>
            <div class="total"><span>Total earnings</span><span>${esc(slip.totalEarnings)}</span></div>
          </div>
          <div class="col">
            <div class="cap">Deductions</div>
            <div class="body">
              <table>
                <thead><tr><th>Deduction type</th><th>Amount</th><th>Loan balance</th></tr></thead>
                <tbody>${deductionRows}</tbody>
              </table>
            </div>
            <div class="total"><span>Total deductions</span><span>${esc(slip.totalDeductions)}</span></div>
          </div>
        </div>

        <div class="net"><span>Net pay</span><span class="amount">${esc(slip.netIncome)}</span></div>

        <div class="details">
          <table>
            ${kv("No. of hours", slip.noOfHours)}
            ${kv("No. of days", slip.noOfDays)}
            ${kv("Basic rate", slip.basicRate)}
          </table>
          <table>
            ${kv("YTD basic", slip.ytdBasic)}
            ${kv("YTD taxable", slip.ytdTaxable)}
            ${kv("YTD tax withheld", slip.ytdTaxWithheld || "0.00")}
          </table>
        </div>
        <div class="foot">
          <span>Confidential: for the named employee only.</span>
          <span>Ref. ${esc(payslipReference(slip))} · Printed ${esc(printed)} · Sample data</span>
        </div>
      </div>

      <div class="stub">
        <div class="office">${esc(slip.headOffice)}</div>
        <div class="name">${esc(employeeNameShort)}</div>
        <div class="text">
          Received the amount mentioned below<br />
          as full payment for my salary/wages<br />
          for the pay period
        </div>
        <div class="period">${esc(slip.periodShort)}</div>
        <div class="take"><span>Take home pay</span><b>${esc(slip.netIncome)}</b></div>
        <div class="line">Received by:<span></span></div>
        <div class="line">Date:<span></span></div>
        <div class="sigrow">
          <div class="thumbcol"><div class="box"></div><div class="cap">Thumb mark</div></div>
          <div class="signcol"><div class="sigline"></div><div class="cap">Signature</div></div>
        </div>
        <div class="fill"></div>
        <div class="payhouse">Payhouse:<b>${esc(slip.payhouse)}</b></div>
      </div>
    </div>
  </div>
</body>
</html>`;
}
