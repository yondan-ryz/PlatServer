
const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Loan Financing API is running",
    version: "1.0.0"
  });
});

app.post("/api/loans", (req, res) => {
  const body = req.body;

  const requiredFields = [
    "loan",
    "customer",
    "employment",
    "vehicle",
    "address",
    "survey",
    "documents",
    "approval",
    "rfu"
  ];

  const missingFields = requiredFields.filter(
    (field) =>
      !body ||
      typeof body[field] !== "object" ||
      body[field] === null ||
      Array.isArray(body[field])
  );

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid loan application payload",
      errors: missingFields.map((field) => ({
        field,
        message: `${field} is required and must be an object`
      }))
    });
  }

  if (
    typeof body.customer.customerName !== "string" ||
    !body.customer.customerName.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Customer name is required",
      errors: [
        {
          field: "customer.customerName",
          message: "Must be a non-empty string"
        }
      ]
    });
  }

  if (
    typeof body.loan.loanAmount !== "number" ||
    !Number.isFinite(body.loan.loanAmount) ||
    body.loan.loanAmount <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid loan amount",
      errors: [
        {
          field: "loan.loanAmount",
          message: "Must be a number greater than zero"
        }
      ]
    });
  }

  const timestamp = new Date().toISOString();
  const requestId = randomUUID();
  const loanId = randomUUID();

  const responseData = {
    loan: {
      loanId: body.loan.loanId || loanId,
      loanNumber: body.loan.loanNumber || `LN-${Date.now()}`,
      loanType: body.loan.loanType,
      loanAmount: body.loan.loanAmount,
      downPayment: body.loan.downPayment,
      tenor: body.loan.tenor,
      interestRate: body.loan.interestRate,
      monthlyInstallment: body.loan.monthlyInstallment,
      applicationDate: body.loan.applicationDate,
      branchCode: body.loan.branchCode,
      dealerCode: body.loan.dealerCode,
      currency: body.loan.currency || "IDR",
      loanStatus: "RECEIVED"
    },

    customer: {
      customerId: body.customer.customerId || `CUST-${randomUUID()}`,
      customerName: body.customer.customerName,
      nik: body.customer.nik,
      birthDate: body.customer.birthDate,
      gender: body.customer.gender,
      maritalStatus: body.customer.maritalStatus,
      phone: body.customer.phone,
      email: body.customer.email,
      numberOfDependents: body.customer.numberOfDependents
    },

    employment: {
      occupation: body.employment.occupation,
      companyName: body.employment.companyName,
      employmentType: body.employment.employmentType,
      monthlyIncome: body.employment.monthlyIncome,
      otherIncome: body.employment.otherIncome,
      monthlyExpenses: body.employment.monthlyExpenses,
      workExperienceYears: body.employment.workExperienceYears,
      companyAddress: body.employment.companyAddress
    },

    vehicle: {
      vehicleType: body.vehicle.vehicleType,
      brand: body.vehicle.brand,
      model: body.vehicle.model,
      year: body.vehicle.year,
      color: body.vehicle.color,
      licensePlate: body.vehicle.licensePlate,
      stnkNumber: body.vehicle.stnkNumber,
      bpkbNumber: body.vehicle.bpkbNumber,
      condition: body.vehicle.condition,
      marketPrice: body.vehicle.marketPrice,
      engineNumber: body.vehicle.engineNumber,
      chassisNumber: body.vehicle.chassisNumber
    },

    address: {
      ktpAddress: body.address.ktpAddress,
      domicileAddress: body.address.domicileAddress,
      city: body.address.city,
      province: body.address.province,
      postalCode: body.address.postalCode
    },

    survey: {
      surveyId: body.survey.surveyId || `SUR-${randomUUID()}`,
      surveyStatus: body.survey.surveyStatus || "PENDING",
      surveyDate: body.survey.surveyDate ?? null,
      surveyResult: body.survey.surveyResult ?? null,
      surveyNotes: body.survey.surveyNotes || "",
      surveyOfficer: body.survey.surveyOfficer ?? null
    },

    documents: {
      ktpDocument: body.documents.ktpDocument ?? null,
      stnkDocument: body.documents.stnkDocument ?? null,
      bpkbDocument: body.documents.bpkbDocument ?? null,
      documentsVerified: body.documents.documentsVerified ?? false,
      missingDocuments: body.documents.missingDocuments || []
    },

    approval: {
      creditScore: body.approval.creditScore ?? null,
      approvalStatus: body.approval.approvalStatus || "PENDING",
      approvedBy: body.approval.approvedBy ?? null,
      approvalDate: body.approval.approvalDate ?? null,
      rejectionReason: body.approval.rejectionReason ?? null
    },

    rfu: {
      isRfu: body.rfu.isRfu ?? false,
      rfuCategory: body.rfu.rfuCategory ?? null,
      rfuNotes: body.rfu.rfuNotes || "",
      requestedAt: body.rfu.requestedAt ?? null,
      requestedBy: body.rfu.requestedBy || "SYSTEM"
    }
  };

  const warnings = [];

  if (
    Array.isArray(responseData.documents.missingDocuments) &&
    responseData.documents.missingDocuments.length > 0
  ) {
    warnings.push({
      code: "INCOMPLETE_DOCUMENT",
      message: "Pengajuan membutuhkan dokumen tambahan."
    });
  }

  const response = {
    success: true,
    message: "Loan application berhasil diterima",
    data: responseData,
    metadata: {
      requestId,
      correlationId: `corr-${randomUUID()}`,
      source: "EXPRESS_API",
      environment: process.env.NODE_ENV || "DEVELOPMENT",
      apiVersion: "1.0.0",
      timestamp,
      processingTimeMs: 0
    },
    errors: [],
    warnings
  };

  return res.status(201).json(response);
});

// Invalid JSON handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON payload",
      errors: [
        {
          field: "body",
          message: "Request body must contain valid JSON"
        }
      ]
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request payload too large"
    });
  }

  return next(err);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
    path: req.originalUrl
  });
});

app.listen(PORT, () => {
  console.log(`Loan API running at http://localhost:${PORT}`);
});
