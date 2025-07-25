const express = require("express");
const router = express.Router();
const {
  lendLoan,
  makePayment,
  getLedger,
  getAccountOverview,
} = require("../controllers/loanControllers");

router.post("/lend", lendLoan);
router.post("/payment", makePayment);
router.get("/ledger/:loanId", getLedger);
router.get("/overview/:customerId", getAccountOverview);

module.exports = router;
