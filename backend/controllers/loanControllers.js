const db = require("../db");

exports.lendLoan = (req, res) => {
  const { customer_id, loan_amount, loan_period, rate } = req.body;
  const interest = (loan_amount * loan_period * rate) / 100;
  const total_amount = loan_amount + interest;
  const emi = parseFloat((total_amount / (loan_period * 12)).toFixed(2));

  db.run(
    `INSERT INTO loans (customer_id, principal, years, rate, total_amount, emi, interest)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [customer_id, loan_amount, loan_period, rate, total_amount, emi, interest],
    function (err) {
      if (err) return res.status(500).send(err.message);
      return res.json({
        loan_id: this.lastID,
        total_amount,
        emi,
      });
    }
  );
};

exports.makePayment = (req, res) => {
  const { loan_id, amount, payment_type } = req.body;
  const date = new Date().toISOString();

  db.run(
    `INSERT INTO payments (loan_id, amount, payment_type, date) VALUES (?, ?, ?, ?)`,
    [loan_id, amount, payment_type, date],
    function (err) {
      if (err) return res.status(500).send(err.message);
      return res.json({ message: "Payment recorded successfully." });
    }
  );
};

exports.getLedger = (req, res) => {
  const loanId = req.params.loanId;

  db.get(`SELECT * FROM loans WHERE loan_id = ?`, [loanId], (err, loan) => {
    if (err || !loan) return res.status(404).send("Loan not found");

    db.all(`SELECT * FROM payments WHERE loan_id = ? ORDER BY date ASC`, [loanId], (err, payments) => {
      if (err) return res.status(500).send(err.message);

      const paid = payments.reduce((acc, p) => acc + p.amount, 0);
      const balance = parseFloat((loan.total_amount - paid).toFixed(2));
      const emiLeft = Math.ceil(balance / loan.emi);

      res.json({
        loan,
        payments,
        balance,
        emi: loan.emi,
        emiLeft
      });
    });
  });
};

exports.getAccountOverview = (req, res) => {
  const customerId = req.params.customerId;

  db.all(`SELECT * FROM loans WHERE customer_id = ?`, [customerId], async (err, loans) => {
    if (err) return res.status(500).send(err.message);
    if (!loans.length) return res.json([]);

    try {
      const results = await Promise.all(
        loans.map((loan) => new Promise((resolve, reject) => {
          db.all(`SELECT * FROM payments WHERE loan_id = ?`, [loan.loan_id], (err, payments) => {
            if (err) return reject(err);
            const paid = payments.reduce((acc, p) => acc + p.amount, 0);
            const balance = loan.total_amount - paid;
            const emiLeft = Math.ceil(balance / loan.emi);
            resolve({
              loan_id: loan.loan_id,
              principal: loan.principal,
              total_amount: loan.total_amount,
              interest: loan.interest,
              emi: loan.emi,
              paid: parseFloat(paid.toFixed(2)),
              emiLeft,
            });
          });
        }))
      );
      res.json(results);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });
};
