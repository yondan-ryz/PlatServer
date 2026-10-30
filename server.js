
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");

const app = express();
const PORT = 5000;

// =====================================================
// CONFIGURATION
// =====================================================

const CONFIG = {
  frontendOrigin: "http://localhost:3000",
  sessionSecret: "pega-dummy-session-secret-2026",
  sessionDuration: 8 * 60 * 60 * 1000,

  user: {
    id: "USR-2026-0001",
    name: "Demo Pega User",
    email: "demo@pega.local",
    password: "PegaDemo123!",
    role: "DEVELOPER",
  },
};

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: CONFIG.frontendOrigin,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    name: "pega.sid",
    secret: CONFIG.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: CONFIG.sessionDuration,
    },
  })
);

// =====================================================
// DUMMY USER
// =====================================================

const hashedPassword = bcrypt.hashSync(
  CONFIG.user.password,
  10
);

function getUser() {
  return {
    id: CONFIG.user.id,
    username: CONFIG.user.email,
    name: CONFIG.user.name,
    email: CONFIG.user.email,
    role: CONFIG.user.role,

    permissions: [
      "LOAN_VIEW",
      "LOAN_CREATE",
      "LOAN_UPDATE",
      "LOAN_RFU",
      "LOAN_APPROVAL",
    ],

    profile: {
      employeeId: "EMP-001",
      department: "IT DEVELOPMENT",
      position: "SOFTWARE ENGINEER",
      branch: "JAKARTA",
    },

    status: "ACTIVE",
  };
}

// =====================================================
// DEFAULT LOAN DATA
// =====================================================

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
    loanStatus: "RECEIVED",
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
    numberOfDependents: 2,
  },

  employment: {
    occupation: "SOFTWARE_ENGINEER",
    companyName: "PT Contoh Indonesia",
    employmentType: "PERMANENT",
    monthlyIncome: 15000000,
    otherIncome: 1000000,
    monthlyExpenses: 5000000,
    workExperienceYears: 5,
    companyAddress: "Jakarta Barat",
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
    chassisNumber: "CHS-789012",
  },

  address: {
    ktpAddress: "Jl. Contoh No. 10",
    domicileAddress: "Jl. Contoh No. 20",
    city: "Jakarta Barat",
    province: "DKI Jakarta",
    postalCode: "11460",
  },

  survey: {
    surveyId: "SUR-001",
    surveyStatus: "PENDING",
    surveyDate: null,
    surveyResult: null,
    surveyNotes: "",
    surveyOfficer: null,
  },

  documents: {
    ktpDocument: "DOC-KTP-001",
    stnkDocument: "DOC-STNK-001",
    bpkbDocument: "DOC-BPKB-001",
    documentsVerified: false,
    missingDocuments: ["PROOF_OF_INCOME"],
  },

  approval: {
    creditScore: null,
    approvalStatus: "PENDING",
    approvedBy: null,
    approvalDate: null,
    rejectionReason: null,
  },

  rfu: {
    isRfu: true,
    rfuCategory: "INCOMPLETE_DOCUMENT",
    rfuNotes: "Mohon lengkapi dokumen bukti penghasilan.",
    requestedAt: "2026-10-29",
    requestedBy: "SYSTEM",
  },
};

// =====================================================
// COMMON RESPONSE
// =====================================================

function metadata(startTime, source = "EXPRESS_API") {
  return {
    requestId: randomUUID(),
    correlationId: randomUUID(),
    source,
    environment: "DEVELOPMENT",
    apiVersion: "1.0.0",
    timestamp: new Date().toISOString(),
    processingTimeMs: Date.now() - startTime,
  };
}

function successResponse(res, data, message, startTime, source) {
  return res.status(200).json({
    success: true,
    message,
    data,
    metadata: metadata(startTime, source),
    errors: [],
    warnings: [],
  });
}

function errorResponse(
  res,
  status,
  code,
  message,
  startTime,
  source = "EXPRESS_API"
) {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    metadata: metadata(startTime, source),
    errors: [
      {
        code,
        message,
      },
    ],
    warnings: [],
  });
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function isRecord(value) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function mergeSections(target, source) {
  if (!isRecord(source)) return;

  for (const section of Object.keys(target)) {
    if (isRecord(source[section])) {
      target[section] = {
        ...target[section],
        ...source[section],
      };
    }
  }
}

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

function requireAuth(req, res, next) {
  if (!req.session?.user) {
    return errorResponse(
      res,
      401,
      "UNAUTHENTICATED",
      "Silakan login terlebih dahulu.",
      Date.now(),
      "AUTHENTICATION_SERVICE"
    );
  }

  next();
}

// =====================================================
// AUTH: LOGIN
// =====================================================

app.post("/api/auth/login", async (req, res, next) => {
  const startTime = Date.now();

  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return errorResponse(
        res,
        400,
        "INVALID_REQUEST",
        "Email dan kata sandi wajib diisi.",
        startTime,
        "AUTHENTICATION_SERVICE"
      );
    }

    const validEmail =
      email.trim().toLowerCase() ===
      CONFIG.user.email.toLowerCase();

    const validPassword = await bcrypt.compare(
      password,
      hashedPassword
    );

    if (!validEmail || !validPassword) {
      return errorResponse(
        res,
        401,
        "INVALID_CREDENTIALS",
        "Email atau kata sandi tidak valid.",
        startTime,
        "AUTHENTICATION_SERVICE"
      );
    }

    req.session.regenerate((err) => {
      if (err) return next(err);

      const loginTime = new Date();
      const expiresAt = new Date(
        loginTime.getTime() + CONFIG.sessionDuration
      );

      const user = getUser();

      user.lastLogin = loginTime.toISOString();

      req.session.user = user;

      req.session.save((saveError) => {
        if (saveError) return next(saveError);

        return successResponse(
          res,
          {
            user,
            session: {
              authenticated: true,
              sessionType: "SERVER_SESSION",
              expiresIn: CONFIG.sessionDuration / 1000,
              expiresAt: expiresAt.toISOString(),
            },
          },
          "Login berhasil.",
          startTime,
          "AUTHENTICATION_SERVICE"
        );
      });
    });
  } catch (error) {
    next(error);
  }
});

// =====================================================
// AUTH: CHECK SESSION
// =====================================================

app.get("/api/auth/session", (req, res) => {
  const startTime = Date.now();

  if (!req.session?.user) {
    return errorResponse(
      res,
      401,
      "UNAUTHENTICATED",
      "Session tidak ditemukan atau sudah berakhir.",
      startTime,
      "AUTHENTICATION_SERVICE"
    );
  }

  return successResponse(
    res,
    {
      user: req.session.user,
      session: {
        authenticated: true,
        sessionType: "SERVER_SESSION",
      },
    },
    "Session berhasil ditemukan.",
    startTime,
    "AUTHENTICATION_SERVICE"
  );
});

// =====================================================
// AUTH: LOGOUT
// =====================================================

app.post("/api/auth/logout", (req, res) => {
  const startTime = Date.now();

  if (!req.session) {
    res.clearCookie("pega.sid", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return successResponse(
      res,
      null,
      "Logout berhasil.",
      startTime,
      "AUTHENTICATION_SERVICE"
    );
  }

  req.session.destroy((err) => {
    if (err) {
      return errorResponse(
        res,
        500,
        "LOGOUT_FAILED",
        "Gagal mengakhiri session.",
        startTime,
        "AUTHENTICATION_SERVICE"
      );
    }

    res.clearCookie("pega.sid", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return successResponse(
      res,
      null,
      "Logout berhasil.",
      startTime,
      "AUTHENTICATION_SERVICE"
    );
  });
});

// =====================================================
// LOAN: GET
// =====================================================

app.get("/api/loans", requireAuth, (req, res) => {
  const startTime = Date.now();
  const data = cloneData(defaultData);

  const warnings = data.documents.missingDocuments.length
    ? [
        {
          code: "INCOMPLETE_DOCUMENT",
          message: "Pengajuan membutuhkan dokumen tambahan.",
        },
      ]
    : [];

  return res.status(200).json({
    success: true,
    message: "Data loan berhasil diambil.",
    data,
    metadata: metadata(startTime),
    errors: [],
    warnings,
  });
});

// =====================================================
// LOAN: POST
// =====================================================

app.post("/api/loans", requireAuth, (req, res) => {
  const startTime = Date.now();
  const data = cloneData(defaultData);

  mergeSections(data, req.body);

  const warnings = data.documents.missingDocuments.length
    ? [
        {
          code: "INCOMPLETE_DOCUMENT",
          message: "Pengajuan membutuhkan dokumen tambahan.",
        },
      ]
    : [];

  return res.status(200).json({
    success: true,
    message: "Loan application berhasil diterima.",
    data,
    metadata: metadata(startTime),
    errors: [],
    warnings,
  });
});

// =====================================================
// FALLBACK
// =====================================================

app.use((req, res) => {
  const startTime = Date.now();

  return errorResponse(
    res,
    404,
    "ENDPOINT_NOT_FOUND",
    "Endpoint tidak ditemukan.",
    startTime
  );
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {
  console.error(err);

  const startTime = Date.now();

  if (err instanceof SyntaxError && err.status === 400) {
    return errorResponse(
      res,
      400,
      "INVALID_JSON",
      "Format JSON request tidak valid.",
      startTime
    );
  }

  return errorResponse(
    res,
    500,
    "INTERNAL_SERVER_ERROR",
    "Terjadi kesalahan pada server.",
    startTime
  );
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log("===================================");
  console.log("DUMMY EXPRESS API RUNNING");
  console.log("===================================");
  console.log(`URL      : http://localhost:${PORT}`);
  console.log(`Frontend : ${CONFIG.frontendOrigin}`);
  console.log("-----------------------------------");
  console.log("DUMMY LOGIN");
  console.log(`Email    : ${CONFIG.user.email}`);
  console.log(`Password : ${CONFIG.user.password}`);
  console.log("===================================");
});
