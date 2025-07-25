// /frontend/src/App.js
import React, { useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [customerId, setCustomerId] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanPeriod, setLoanPeriod] = useState('');
  const [interestRate, setInterestRate] = useState('');

  const [loanId, setLoanId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('EMI');

  const [ledgerResult, setLedgerResult] = useState(null);
  const [overviewResult, setOverviewResult] = useState([]);

  const lendLoan = async () => {
    const res = await fetch(`${API_BASE}/lend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customerId,
        loan_amount: parseFloat(loanAmount),
        loan_period: parseInt(loanPeriod),
        rate: parseFloat(interestRate),
      }),
    });
    const data = await res.json();
    alert(`Loan Created. Total: ${data.total_amount}, EMI: ${data.emi}`);
  };

  const makePayment = async () => {
    const res = await fetch(`${API_BASE}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        loan_id: parseInt(loanId),
        amount: parseFloat(paymentAmount),
        payment_type: paymentType,
      }),
    });
    const data = await res.json();
    alert(data.message);
  };

  const fetchLedger = async () => {
    const res = await fetch(`${API_BASE}/ledger/${loanId}`);
    const data = await res.json();
    setLedgerResult(data);
  };

  const fetchOverview = async () => {
    const res = await fetch(`${API_BASE}/overview/${customerId}`);
    const data = await res.json();
    setOverviewResult(data);
  };

  return (
    <div className="App">
      <h1>Bank Loan System</h1>

      <section>
        <h2>Lend Loan</h2>
        <input placeholder="Customer ID" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
        <input placeholder="Loan Amount" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} />
        <input placeholder="Loan Period (Years)" value={loanPeriod} onChange={(e) => setLoanPeriod(e.target.value)} />
        <input placeholder="Interest Rate (%)" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} />
        <button onClick={lendLoan}>Lend</button>
      </section>

      <section>
        <h2>Make Payment</h2>
        <input placeholder="Loan ID" value={loanId} onChange={(e) => setLoanId(e.target.value)} />
        <input placeholder="Payment Amount" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
        <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
          <option value="EMI">EMI</option>
          <option value="LUMP_SUM">LUMP_SUM</option>
        </select>
        <button onClick={makePayment}>Pay</button>
      </section>

      <section>
        <h2>Ledger</h2>
        <input placeholder="Loan ID" value={loanId} onChange={(e) => setLoanId(e.target.value)} />
        <button onClick={fetchLedger}>Get Ledger</button>
        {ledgerResult && (
          <div>
            <p><strong>Balance:</strong> {ledgerResult.balance}</p>
            <p><strong>EMI:</strong> {ledgerResult.emi}</p>
            <p><strong>EMIs Left:</strong> {ledgerResult.emiLeft}</p>
            <h3>Transactions</h3>
            <ul>
              {ledgerResult.payments.map(p => (
                <li key={p.payment_id}>{p.date} - {p.payment_type} - ₹{p.amount}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <h2>Account Overview</h2>
        <input placeholder="Customer ID" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
        <button onClick={fetchOverview}>Get Overview</button>
        {overviewResult.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Loan ID</th>
                <th>Principal</th>
                <th>Total</th>
                <th>Interest</th>
                <th>EMI</th>
                <th>Paid</th>
                <th>EMIs Left</th>
              </tr>
            </thead>
            <tbody>
              {overviewResult.map(loan => (
                <tr key={loan.loan_id}>
                  <td>{loan.loan_id}</td>
                  <td>{loan.principal}</td>
                  <td>{loan.total_amount}</td>
                  <td>{loan.interest}</td>
                  <td>{loan.emi}</td>
                  <td>{loan.paid}</td>
                  <td>{loan.emiLeft}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;