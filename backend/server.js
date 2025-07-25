const express = require("express");
const app = express();
const cors = require("cors");
const loanRoutes = require("./routes/loanRoutes");

app.use(cors());
app.use(express.json());

app.use("/api", loanRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
