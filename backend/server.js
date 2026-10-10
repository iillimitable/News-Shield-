
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dns = require("node:dns");

require("dotenv").config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const User = require("./models/User");
const Verification = require("./models/Verification");
const Feedback = require("./models/Feedback");

const app = express();
const PORT = process.env.PORT || 5001;
const GROQ_MODEL = "qwen/qwen3.8-27b";
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("WARNING: JWT_SECRET is missing in .env");
}

// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ limit: "5mb" }));

// ==========================================
// DATABASE STATUS
// ==========================================

let databaseReady = false;

function requireDatabase(req, res, next) {
  if (
    !databaseReady ||
    mongoose.connection.readyState !== 1
  ) {
    return res.status(503).json({
      error: "Database is not connected. Please try again later.",
    });
  }

  next();
}

// ==========================================
// USER ROLE
// ==========================================

function getUserRole(user) {
  const adminEmail = (process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();

  const email = (user.email || "")
    .trim()
    .toLowerCase();

  return user.role === "admin" ||
    (adminEmail && email === adminEmail)
    ? "admin"
    : "user";
}

// ==========================================
// AUTHENTICATION
// ==========================================

function authenticate(req, res, next) {
  const authorization = req.headers.authorization || "";
  const token = authorization.replace(/^Bearer\s+/i, "");

  if (!token || token === authorization) {
    return res.status(401).json({
      error: "Authentication is required.",
    });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({
      error: "Server authentication is not configured.",
    });
  }

  try {
    req.auth = jwt.verify(token, JWT_SECRET);

    if (!req.auth.userId) {
      return res.status(401).json({
        error: "Invalid authentication token.",
      });
    }

    next();
  } catch {
    return res.status(401).json({
      error: "Your session is invalid or has expired.",
    });
  }
}

// ==========================================
// ADMIN AUTHORIZATION
// ==========================================

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.auth.userId);

    if (!user || getUserRole(user) !== "admin") {
      return res.status(403).json({
        error: "Administrator access is required.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

// ==========================================
// DATABASE CONNECTION + ADMIN SETUP
// ==========================================

async function createAdminAccount() {
  const name = process.env.ADMIN_NAME || "NewsShield Admin";
  const email = (process.env.ADMIN_EMAIL || "")
    .trim()
    .toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "Admin setup skipped: check ADMIN_EMAIL and ADMIN_PASSWORD."
    );
    return;
  }

  if (password.length < 6) {
    console.log(
      "Admin setup failed: password must be at least 6 characters."
    );
    return;
  }

  try {
    let admin = await User.findOne({ email });

    if (!admin) {
      admin = new User({
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role: "admin",
      });
    } else {
      admin.name = name;
      admin.password = await bcrypt.hash(password, 10);
      admin.role = "admin";
    }

    await admin.save();

    console.log("Admin account is ready:", email);
  } catch (error) {
    console.error("Admin setup error:", error.message);
  }
}

if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {
      databaseReady = true;
      console.log("MongoDB connected successfully");
      await createAdminAccount();
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error.message);
    });
} else {
  console.error("MONGO_URI not found in .env");
}

// ==========================================
// REGISTER API
// ==========================================

app.post(
  "/api/auth/register",
  requireDatabase,
  async (req, res, next) => {
    try {
      if (!JWT_SECRET) {
        return res.status(500).json({
          error: "Server authentication is not configured.",
        });
      }

      const { name, email, password } = req.body;

      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string" ||
        !name.trim() ||
        !email.trim() ||
        !password
      ) {
        return res.status(400).json({
          error: "Name, email and password are required.",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters.",
        });
      }

      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          error: "An account with this email already exists.",
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
      });

      const token = jwt.sign(
        { userId: user._id.toString() },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({
        message: "Registration successful.",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: getUserRole(user),
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          error: "An account with this email already exists.",
        });
      }

      next(error);
    }
  }
);

// ==========================================
// LOGIN API
// ==========================================

app.post(
  "/api/auth/login",
  requireDatabase,
  async (req, res, next) => {
    try {
      if (!JWT_SECRET) {
        return res.status(500).json({
          error: "Server authentication is not configured.",
        });
      }

      const { email, password } = req.body;

      if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        !email.trim() ||
        !password
      ) {
        return res.status(400).json({
          error: "Email and password are required.",
        });
      }

      const user = await User.findOne({
        email: email.trim().toLowerCase(),
      });

      if (
        !user ||
        !(await bcrypt.compare(password, user.password))
      ) {
        return res.status(401).json({
          error: "Invalid email or password.",
        });
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Login successful.",
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: getUserRole(user),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// TAVILY WEB SEARCH
// ==========================================

async function searchNews(claim) {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is missing.");
  }

  const response = await axios.post(
    "https://api.tavily.com/search",
    {
      api_key: process.env.TAVILY_API_KEY,
      query: claim,
      search_depth: "advanced",
      topic: "news",
      max_results: 20,
      include_answer: true,
      include_raw_content: true,
      include_images: false,
    },
    { timeout: 60000 }
  );

  const results = Array.isArray(response.data?.results)
    ? response.data.results
    : [];

  return results.map((source) => ({
    title: source.title || "",
    url: source.url || "",
    content: source.raw_content || source.content || "",
    score: Number(source.score) || 0,
  }));
}

// ==========================================
// GROQ AI VERIFICATION
// ==========================================

async function geminiVerify(claim, sources) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  const sourceText = sources
    .slice(0, 5)
    .map(
      (source, index) => `SOURCE ${index + 1}
Title: ${source.title}
URL: ${source.url}
Content: ${(source.content || "").slice(0, 800)}`
    )
    .join("\n\n");

  const prompt = `You are NewsShield, a news verification system.

Verify the claim using the supplied web sources.

CLAIM:
${claim}

WEB SOURCES:
${sourceText}

Choose exactly one verdict: Real, Fake, or Unverified.

Rules:
1. Use supplied evidence only.
2. Do not invent facts.
3. Direct reliable support may justify Real.
4. Direct reliable contradiction may justify Fake.
5. Insufficient or conflicting evidence means Unverified.
6. Check dates, names, locations and numbers.
7. Similar topics are not proof of a claim.
8. Prefer official and independent reliable sources.
9. Confidence must reflect the strength of evidence.
10. supporting and contradicting must be numbers from 0 to 100.

Return ONLY valid JSON:
{"verdict":"Real","reason":"Evidence-based explanation","confidence":80,"supporting":70,"contradicting":30}`;

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Groq request attempt ${attempt}/3`);

      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: GROQ_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 512,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          timeout: 60000,
        }
      );

      const rawText =
        response.data?.choices?.[0]?.message?.content;

      if (!rawText) {
        throw new Error("Empty Groq response.");
      }

      const cleaned = rawText
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const match = cleaned.match(/\{[\s\S]*\}/);

      if (!match) {
        throw new Error("Groq did not return a JSON object.");
      }

      const parsed = JSON.parse(match[0]);
      const validVerdicts = ["Real", "Fake", "Unverified"];

      const validNumber = (value) =>
        Number.isFinite(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) <= 100;

      if (!validVerdicts.includes(parsed.verdict)) {
        throw new Error("Groq returned an invalid verdict.");
      }

      if (
        !validNumber(parsed.confidence) ||
        !validNumber(parsed.supporting) ||
        !validNumber(parsed.contradicting)
      ) {
        throw new Error("Groq returned invalid score values.");
      }

      return {
        verdict: parsed.verdict,
        reason:
          typeof parsed.reason === "string"
            ? parsed.reason
            : "No explanation was provided.",
        confidence: Number(parsed.confidence),
        supporting: Number(parsed.supporting),
        contradicting: Number(parsed.contradicting),
      };
    } catch (error) {
      lastError = error;

      console.error(
        `Groq attempt ${attempt} failed:`,
        error.response?.status || error.message
      );

      if (error.response?.status === 429 && attempt < 3) {
        await new Promise((resolve) =>
          setTimeout(resolve, 3000)
        );
        continue;
      }

      break;
    }
  }

  throw new Error(
    `Groq API failed: ${
      lastError?.response?.status ||
      lastError?.message ||
      "Unknown error"
    }`
  );
}

// ==========================================
// SEARCH API
// ==========================================

app.post("/api/search", async (req, res, next) => {
  try {
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Please provide news text.",
      });
    }

    const sources = await searchNews(text.trim());

    return res.json({
      query: text.trim(),
      sources,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// VERIFY NEWS API
// ==========================================

app.post("/api/verify", async (req, res, next) => {
  try {
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Please provide news text.",
      });
    }

    const claim = text.trim();

    console.log("NewsShield verification started:", claim);

    // ML is a supporting signal, not the final decision-maker.
    let mlPrediction = "Unverified";
    let mlConfidence = 0;

    try {
      const mlUrl =
        process.env.ML_SERVICE_URL ||
        "http://127.0.0.1:5000/predict";

      const mlResponse = await axios.post(
        mlUrl,
        { text: claim },
        { timeout: 10000 }
      );

      mlPrediction =
        mlResponse.data?.prediction || "Unverified";
      mlConfidence =
        Number(mlResponse.data?.confidence) || 0;
    } catch (error) {
      console.warn("ML service unavailable:", error.message);
    }

    const sources = await searchNews(claim);

    if (sources.length === 0) {
      return res.json({
        claim,
        mlPrediction,
        mlConfidence,
        webVerdict: "Unverified",
        verdict: "Unverified",
        reason: "No web sources were found to verify this claim.",
        confidence: 20,
        evidenceScore: 0,
        supportingScore: 0,
        contradictingScore: 0,
        supportingPercentage: 0,
        contradictingPercentage: 0,
        analysisEngine: "Tavily Web Search + Groq AI + ML Classifier",
        sources: [],
      });
    }

    let result;

    try {
      result = await geminiVerify(claim, sources);
    } catch (error) {
      console.error("Groq verification failed:", error.message);

      result = {
        verdict: "Unverified",
        reason: "AI evidence analysis failed. Please try again later.",
        confidence: 30,
        supporting: 0,
        contradicting: 0,
      };
    }

    const clamp = (value) =>
      Math.max(0, Math.min(100, Number(value) || 0));

    const confidence = clamp(result.confidence);
    const supporting = clamp(result.supporting);
    const contradicting = clamp(result.contradicting);

    return res.json({
      claim,
      mlPrediction,
      mlConfidence,
      webVerdict: result.verdict,
      verdict: result.verdict,
      reason: result.reason,
      confidence,
      evidenceScore: confidence / 100,
      supportingScore: supporting / 100,
      contradictingScore: contradicting / 100,
      supportingPercentage: supporting,
      contradictingPercentage: contradicting,
      analysisEngine: "Tavily Web Search + Groq AI + ML Classifier",
      sources,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// SAVE VERIFICATION HISTORY
// Requires a valid login token.
// ==========================================

app.post(
  "/api/history",
  requireDatabase,
  authenticate,
  async (req, res, next) => {
    try {
      const {
        title,
        verdict,
        mlPrediction,
        mlConfidence,
        webVerdict,
        reason,
        confidence,
        evidenceScore,
        supportingScore,
        contradictingScore,
        supportingPercentage,
        contradictingPercentage,
        analysisEngine,
        sources,
      } = req.body;

      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          error: "News title is required.",
        });
      }

      const validVerdicts = ["Real", "Fake", "Unverified"];

      if (verdict && !validVerdicts.includes(verdict)) {
        return res.status(400).json({
          error: "Invalid verdict.",
        });
      }

      const compactSources = Array.isArray(sources)
        ? sources
            .map((source) => {
              if (typeof source === "string") {
                return { title: source, url: source };
              }

              return {
                title: source?.title || "",
                url: source?.url || "",
              };
            })
            .filter((source) => source.url)
            .slice(0, 20)
        : [];

      const history = await Verification.create({
        // Never trust userId supplied in the request body.
        userId: req.auth.userId,
        title: title.trim(),
        verdict: verdict || "Unverified",
        mlPrediction: mlPrediction || "Unverified",
        mlConfidence: Number(mlConfidence) || 0,
        webVerdict: webVerdict || "Unverified",
        reason: reason || "",
        confidence: Number(confidence) || 0,
        evidenceScore: Number(evidenceScore) || 0,
        supportingScore: Number(supportingScore) || 0,
        contradictingScore: Number(contradictingScore) || 0,
        supportingPercentage:
          Number(supportingPercentage) || 0,
        contradictingPercentage:
          Number(contradictingPercentage) || 0,
        analysisEngine:
          analysisEngine || "Tavily Web Search + Groq AI",
        sources: compactSources,
      });

      return res.status(201).json({
        message: "Verification history saved successfully.",
        history,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// ALL USERS' PUBLIC VERIFICATION HISTORY
// Route must be before /:userId.
// Does not return user IDs, names or emails.
// ==========================================

app.get(
  "/api/history/all",
  requireDatabase,
  authenticate,
  async (req, res, next) => {
    try {
      const history = await Verification.find()
        .select(
          "title verdict reason confidence evidenceScore supportingScore contradictingScore supportingPercentage contradictingPercentage analysisEngine sources createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      return res.json({ history });
    } catch (error) {
      next(error);
    }
  }
);



// ==========================================
// PERSONAL VERIFICATION HISTORY
// ==========================================

app.get(
  "/api/history/:userId",
  requireDatabase,
  authenticate,
  async (req, res, next) => {
    try {
      const { userId } = req.params;

      // Check whether the ID is valid
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          error: "Invalid user ID.",
        });
      }

      // Users can view only their own history
      if (String(req.auth.userId) !== String(userId)) {
        return res.status(403).json({
          error: "You can only view your own history.",
        });
      }

      const history = await Verification.find({
        userId: req.auth.userId,
      })
        .sort({ createdAt: -1 })
        .lean();

      return res.json({ history });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// DELETE PERSONAL HISTORY RECORD
// ==========================================

app.delete(
  "/api/history/:id",
  requireDatabase,
  authenticate,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid history ID.",
        });
      }

      const record = await Verification.findOneAndDelete({
        _id: id,
        userId: req.auth.userId,
      });

      if (!record) {
        return res.status(404).json({
          error: "History record not found.",
        });
      }

      return res.json({
        message: "Verification history deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// USER FEEDBACK API
// ==========================================

app.post(
  "/api/feedback",
  requireDatabase,
  authenticate,
  async (req, res, next) => {
    try {
      const {
        verificationId,
        verificationResult,
        helpful,
        rating,
        category,
        comment,
      } = req.body;

      const categories = [
        "Correct result",
        "Incorrect result",
        "Unclear explanation",
        "Insufficient evidence",
        "Irrelevant sources",
        "Other",
      ];

      const verdicts = ["Real", "Fake", "Unverified"];

      if (
        verificationId &&
        !mongoose.Types.ObjectId.isValid(verificationId)
      ) {
        return res.status(400).json({
          error: "A valid verification ID is required.",
        });
      }

      if (
        verificationResult &&
        !verdicts.includes(verificationResult)
      ) {
        return res.status(400).json({
          error: "Invalid verification result.",
        });
      }

      if (typeof helpful !== "boolean") {
        return res.status(400).json({
          error: "Please indicate whether the result was helpful.",
        });
      }

      if (
        !Number.isInteger(Number(rating)) ||
        Number(rating) < 1 ||
        Number(rating) > 5
      ) {
        return res.status(400).json({
          error: "Rating must be between 1 and 5.",
        });
      }

      if (!categories.includes(category)) {
        return res.status(400).json({
          error: "Please select a valid feedback type.",
        });
      }

      let verification = null;

      if (verificationId) {
        verification = await Verification.findOne({
          _id: verificationId,
          userId: req.auth.userId,
        });

        if (!verification) {
          return res.status(404).json({
            error: "Verification record not found.",
          });
        }
      }

      const feedback = await Feedback.create({
        userId: req.auth.userId,
        verificationId: verificationId || undefined,
        verificationResult:
          verification?.verdict ||
          verificationResult ||
          "Unverified",
        helpful,
        rating: Number(rating),
        category,
        comment:
          typeof comment === "string" ? comment.trim() : "",
      });

      return res.status(201).json({
        message: "Thank you! Your feedback helps improve NewsShield.",
        feedback,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// ADMIN FEEDBACK MANAGEMENT
// ==========================================

app.get(
  "/api/admin/feedback",
  requireDatabase,
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const feedback = await Feedback.find()
        .populate("userId", "name email")
        .populate("verificationId", "title verdict")
        .sort({ createdAt: -1 })
        .lean();

      const total = feedback.length;

      const averageRating = total
        ? Number(
            (
              feedback.reduce(
                (sum, item) => sum + item.rating,
                0
              ) / total
            ).toFixed(1)
          )
        : 0;

      const helpfulCount = feedback.filter(
        (item) => item.helpful
      ).length;

      const categories = feedback.reduce((counts, item) => {
        counts[item.category] =
          (counts[item.category] || 0) + 1;
        return counts;
      }, {});

      return res.json({
        feedback,
        statistics: {
          total,
          averageRating,
          helpfulCount,
          helpfulPercentage: total
            ? Math.round((helpfulCount / total) * 100)
            : 0,
          categories,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// ADMIN USERS MANAGEMENT
// ==========================================

app.get(
  "/api/admin/users",
  requireDatabase,
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .lean();

      return res.json({ users });
    } catch (error) {
      next(error);
    }
  }
);

app.put(
  "/api/admin/users/:id",
  requireDatabase,
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { name, email, role } = req.body;
      const updates = {};

      if (name !== undefined) {
        if (typeof name !== "string" || !name.trim()) {
          return res.status(400).json({
            error: "Name cannot be empty.",
          });
        }

        updates.name = name.trim();
      }

      if (email !== undefined) {
        if (typeof email !== "string" || !email.trim()) {
          return res.status(400).json({
            error: "Email cannot be empty.",
          });
        }

        updates.email = email.trim().toLowerCase();
      }

      if (role !== undefined) {
        if (!["user", "admin"].includes(role)) {
          return res.status(400).json({
            error: "Invalid role.",
          });
        }

        updates.role = role;
      }

      if (!Object.keys(updates).length) {
        return res.status(400).json({
          error: "No update fields provided.",
        });
      }

      if (req.params.id === String(req.user._id) &&
          role === "user") {
        return res.status(400).json({
          error: "You cannot remove your own admin role.",
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          error: "User not found.",
        });
      }

      return res.json({
        message: "User updated successfully.",
        user,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          error: "Email already exists.",
        });
      }

      next(error);
    }
  }
);

app.delete(
  "/api/admin/users/:id",
  requireDatabase,
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      if (String(req.user._id) === req.params.id) {
        return res.status(400).json({
          error: "You cannot delete your own account.",
        });
      }

      const user = await User.findByIdAndDelete(req.params.id);

      if (!user) {
        return res.status(404).json({
          error: "User not found.",
        });
      }

      return res.json({
        message: "User deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// ADMIN HISTORY API
// GET ALL RECORDS WITH USER DETAILS
// ==========================================

app.get(
  "/api/admin/history",
  requireDatabase,
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const records = await Verification.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .lean();

      const history = records.map((item) => ({
        ...item,
        title:
          item.title ||
          item.news ||
          item.claim ||
          "Untitled claim",
        verdict: ["Real", "Fake", "Unverified"].includes(
          item.verdict
        )
          ? item.verdict
          : "Unverified",
        reason: item.reason || "",
        confidence: Number(item.confidence) || 0,
        userId: item.userId
          ? {
              _id: item.userId._id,
              name: item.userId.name || "",
              email: item.userId.email || "",
            }
          : null,
      }));

      return res.json({ history });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// ADMIN HISTORY API
// UPDATE A RECORD
// ==========================================

app.put(
  "/api/admin/history/:id",
  requireDatabase,
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, reason, verdict, confidence } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid history ID.",
        });
      }

      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
          error: "Title is required.",
        });
      }

      if (!["Real", "Fake", "Unverified"].includes(verdict)) {
        return res.status(400).json({
          error: "Invalid verdict.",
        });
      }

      const score = Number(confidence);

      if (
        confidence === "" ||
        confidence === null ||
        confidence === undefined ||
        !Number.isFinite(score) ||
        score < 0 ||
        score > 100
      ) {
        return res.status(400).json({
          error: "Confidence must be between 0 and 100.",
        });
      }

      const record = await Verification.findByIdAndUpdate(
        id,
        {
          $set: {
            title: title.trim(),
            reason:
              typeof reason === "string" ? reason.trim() : "",
            verdict,
            confidence: score,
            evidenceScore: score / 100,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!record) {
        return res.status(404).json({
          error: "History record not found.",
        });
      }

      return res.json({
        message: "History updated successfully.",
        history: record,
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// ADMIN HISTORY API
// DELETE A RECORD
// ==========================================

app.delete(
  "/api/admin/history/:id",
  requireDatabase,
  authenticate,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          error: "Invalid history ID.",
        });
      }

      const record = await Verification.findByIdAndDelete(id);

      if (!record) {
        return res.status(404).json({
          error: "History record not found.",
        });
      }

      return res.json({
        message: "History deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }
);

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  console.error(
    "404 ROUTE NOT FOUND:",
    req.method,
    req.originalUrl
  );

  return res.status(404).json({
    message: "API route not found.",
    method: req.method,
    path: req.originalUrl,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((error, req, res, next) => {
  console.error("Global server error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({
    error: "Internal server error.",
  });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log("\n========================================");
  console.log(
    `NewsShield Backend running on http://localhost:${PORT}`
  );
  console.log("========================================\n");
});
