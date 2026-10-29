
const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const defaultData = {
  loan: {
    loanId: "LN-2026-001",
    loanNumber: "APP-20261029-0001",
    loanType: "CAR_FINANCING",
    loanAmount: 185000000,
    downPayment: 65000000,
    tenor: 48,
    interestRate: 8.5,
    monthlyInstallment: 0,
    applicationDate: "2026-10-29",
    branchCode: "JKT001",
    dealerCode: "DLR009",
    currency: "IDR",
    loanStatus: "RECEIVED"
  },
  customer: {
    customerId: "CUST-001",
    customerName: "Dani John",
    nik: "3174000000000001",
    birthDate: "1992-05-15",
    gender: "MALE",
    maritalStatus: "MARRIED",
    phone: "081234567890",
    email: "budi@example.com",
    numberOfDependents: 2
  },
  employment: {
    occupation: "SOFTWARE_ENGINEER",
    companyName: "PT Contoh Indonesia",
    employmentType: "PERMANENT",
    monthlyIncome: 15000000,
    otherIncome: 1000000,
    monthlyExpenses: 5000000,
    workExperienceYears: 5,
    companyAddress: "Jakarta Barat"
  },
  vehicle: {
    vehicleType: "CAR",
    brand: "Toyota",
    model: "Avanza",
    year: 2023,
    color: "Silver",
    licensePlate: "B 1234 ABC",
    stnkNumber: "STNK-123456",
    bpkbNumber: "BPKB-789012",
    condition: "USED",
    marketPrice: 250000000,
    engineNumber: "ENG-123456",
    chassisNumber: "CHS-789012"
  },
  address: {
    ktpAddress: "Jl. Contoh No. 10",
    domicileAddress: "Jl. Contoh No. 20",
    city: "Jakarta Barat",
    province: "DKI Jakarta",
    postalCode: "11460"
  },
  survey: {
    surveyId: "SUR-001",
    surveyStatus: "PENDING",
    surveyDate: null,
    surveyResult: null,
    surveyNotes: "",
    surveyOfficer: null
  },
  documents: {
    ktpDocument: "DOC-KTP-001",
    stnkDocument: "DOC-STNK-001",
    bpkbDocument: "DOC-BPKB-001",
    documentsVerified: false,
    missingDocuments: ["PROOF_OF_INCOME"]
  },
  approval: {
    creditScore: null,
    approvalStatus: "PENDING",
    approvedBy: null,
    approvalDate: null,
    rejectionReason: null
  },
  rfu: {
    isRfu: true,
    rfuCategory: "INCOMPLETE_DOCUMENT",
    rfuNotes: "Mohon lengkapi dokumen bukti penghasilan.",
    requestedAt: "2026-10-29",
    requestedBy: "SYSTEM"
  }
};

function successResponse(req, res) {
  const startTime = Date.now();
  const data = structuredClone(defaultData);

  // Override default values with supplied fields.
  if (
    req.body &&
    typeof req.body === "object" &&
    !Array.isArray(req.body)
  ) {
    for (const section of Object.keys(data)) {
      const incoming = req.body[section];

      if (
        incoming &&
        typeof incoming === "object" &&
        !Array.isArray(incoming)
      ) {
        data[section] = {
          ...data[section],
          ...incoming
        };
      }
    }
  }

  return res.status(200).json({
    success: true,
    message: "Loan application berhasil diterima",
    data,
    metadata: {
      requestId: randomUUID(),
      correlationId: randomUUID(),
      source: "EXPRESS_API",
      environment: process.env.NODE_ENV || "DEVELOPMENT",
      apiVersion: "1.0.0",
      timestamp: new Date().toISOString(),
      processingTimeMs: Date.now() - startTime
    },
    errors: [],
    warnings: data.documents.missingDocuments.length
      ? [
          {
            code: "INCOMPLETE_DOCUMENT",
            message: "Pengajuan membutuhkan dokumen tambahan."
          }
        ]
      : []
  });
}

// Always return a successful response.
app.get("/api/loans", successResponse);
app.post("/api/loans", successResponse);

// Fallback for other endpoints.
app.use((req, res) => {
  return res.status(200).json({
    success: true,
    message: "Request berhasil diproses",
    data: {},
    metadata: {
      requestId: randomUUID(),
      timestamp: new Date().toISOString()
    },
    errors: [],
    warnings: []
  });
});

// Handle malformed JSON with a successful default response.
app.use((err, req, res, next) => {
  return successResponse({ ...req, body: {} }, res);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
