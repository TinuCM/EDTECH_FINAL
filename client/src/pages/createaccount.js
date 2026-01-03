import { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useRouter } from "next/router";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

export default function CreateAccount() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/v1/parent/login", { email });
      
      if (response.status === 200) {
        setSuccess(response.data.message);
        setShowOtp(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccess("");

    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/v1/verify/parent", {
        email,
        otp,
      });

      if (response.status === 200) {
        setSuccess("Account verified successfully!");
        
        // Store token and user in cookies
        cookies.set("token", response.data.token, { path: "/" });
        cookies.set("user", JSON.stringify(response.data.user), { path: "/" });

        console.log("Token stored in cookies:", response.data.token);
        console.log("User stored in cookies:", response.data.user);

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          router.push("/dashboard"); // Change to your dashboard route
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (showOtp) {
      setShowOtp(false);
      setOtp("");
      setError("");
      setSuccess("");
    } else {
      router.back();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={24}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            minHeight: { md: "600px" },
          }}
        >
          {/* Left Side - Logo and Illustration */}
          <Box
            sx={{
              flex: 1,
              backgroundColor: "#ffffff", // Complete white background
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              position: "relative",
            }}
          >
            {/* Top Section - Back Button and Logo */}
            <Box
              sx={{
                position: "absolute",
                top: 20,
                left: 20,
                right: 20,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Back Button */}
              <IconButton
                onClick={handleBack}
                sx={{
                  backgroundColor: "#f5f5f5",
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>

              {/* Logo */}
              <Box
                component="img"
                src="/Black logo (1).png"
                alt="Study.Pilot Logo"
                sx={{
                  width: { xs: 120, md: 150 },
                  height: "auto",
                }}
              />
            </Box>

            {/* Cat GIF */}
            <Box
              component="img"
              src="/cats.gif"
              alt="Cat illustration"
              sx={{
                maxWidth: "100%",
                width: { xs: 200, md: 300 },
                height: "auto",
              }}
            />
          </Box>

          {/* Right Side - Form */}
          <Box
            sx={{
              flex: 1,
              padding: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 4,
                color: "#2c3e50",
              }}
            >
              Create your Account
            </Typography>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {!showOtp ? (
              // Email Input
              <>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: "#555",
                  }}
                >
                  Email Address
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendOtp();
                    }
                  }}
                  disabled={loading}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSendOtp}
                  disabled={loading}
                  sx={{
                    backgroundColor: "#000",
                    color: "#fff",
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#333",
                    },
                    "&:disabled": {
                      backgroundColor: "#ccc",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </>
            ) : (
              // OTP Input
              <>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    fontWeight: 500,
                    color: "#555",
                  }}
                >
                  Enter OTP
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    // Only allow numbers and max 6 digits
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleVerifyOtp();
                    }
                  }}
                  disabled={loading}
                  inputProps={{
                    maxLength: 6,
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  sx={{
                    backgroundColor: "#000",
                    color: "#fff",
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: "none",
                    fontSize: 16,
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#333",
                    },
                    "&:disabled": {
                      backgroundColor: "#ccc",
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Verify OTP"
                  )}
                </Button>

                {/* Resend OTP */}
                <Button
                  fullWidth
                  variant="text"
                  onClick={handleSendOtp}
                  disabled={loading}
                  sx={{
                    mt: 2,
                    color: "#1e88e5",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(30, 136, 229, 0.1)",
                    },
                  }}
                >
                  Didn't receive OTP? Resend
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

