import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  Divider,
  useMediaQuery,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const BASE_PRICE_INR = 749;

const plans = [
  {
    title: "Free",
    price: "₹0",
    period: "Forever",
    description: "Play, learn & explore 🧩",
    colorLight: "#F2F8FF",
    colorDark: "#132238",
    highlight: false,
    features: ["Starter lessons", "Fun quizzes", "Friendly help"],
    cta: "Start Playing",
  },
  {
    title: "Student Pro",
    description: "Unlock all learning adventures 🚀",
    colorLight: "#FFF8E1",
    colorDark: "#2A1F0F",
    highlight: true,
    features: [
      "All Free features",
      "All subjects unlocked",
      "Games & scores",
      "Achievement badges 🏅",
    ],
    cta: "Start Free Trial",
  },
];

export default function PricingPage() {
  const [currentPlan, setCurrentPlan] = useState("Free");
  const [selectedPlan, setSelectedPlan] = useState("Free");
  const [billing, setBilling] = useState("monthly");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const isDark = useMediaQuery("(prefers-color-scheme: dark)");
  const isMobile = useMediaQuery("(max-width:600px)");

  const discountedMonthly = Math.round(BASE_PRICE_INR * 0.8);
  const yearlyPrice = Math.round(discountedMonthly * 12 * 0.8);

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (typeof window === "undefined") return resolve(false);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlanSelect = async (plan) => {
    if (plan !== "Student Pro") {
      setCurrentPlan("Free");
      return;
    }

    const amount = billing === "yearly" ? yearlyPrice : discountedMonthly;
    const loaded = await loadRazorpay();
    if (!loaded) return alert("Razorpay SDK failed");

    try {
      const orderRes = await axios.post("/api/create-order", { amount });

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "EdTech Learning",
        description: "Student Pro Subscription",
        order_id: orderRes.data.id,
        handler() {
          setCurrentPlan("Student Pro");
          localStorage.setItem("plan", "Student Pro");
          alert("Payment successful 🎉");
        },
        theme: { color: "#FF9800" },
      });

      razorpay.open();
    } catch {
      alert("Payment failed");
    }
  };

  /* Cursor-based tilt (ONLY for selected card) */
  const handleMouseMove = (e, plan) => {
    if (isMobile || selectedPlan !== plan) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10;
    setTilt({ x, y });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <Box sx={{ bgcolor: isDark ? "#0E1624" : "#F6FAFF", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#0B5ED7",
          py: 2,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <Container>
          <Image src="/logo.png" alt="Logo" width={140} height={40} />
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        <Stack textAlign="center" spacing={1} mb={5}>
          <Typography variant="h3" fontWeight={900} color="#0B5ED7">
            Fun Pricing for Happy Learning
          </Typography>
          <Typography color="text.secondary">
            Learn • Play • Grow 🌈
          </Typography>
        </Stack>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.title;
            const isCurrent = currentPlan === plan.title;

            return (
              <Grid item xs={12} md={4} key={plan.title}>
                <Card
                  onMouseMove={(e) => handleMouseMove(e, plan.title)}
                  onMouseLeave={resetTilt}
                  onClick={() => setSelectedPlan(plan.title)}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 6,
                    cursor: "pointer",
                    backgroundColor: isDark
                      ? plan.colorDark
                      : plan.colorLight,
                    border: isSelected
                      ? "3px solid #FF9800"
                      : "1px solid rgba(0,0,0,0.1)",

                    transform:
                      isSelected && !isMobile
                        ? `perspective(900px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg) scale(1.05)`
                        : "none",

                    transition:
                      "transform 0.15s ease, box-shadow 0.15s ease",

                    boxShadow: isSelected
                      ? `0 ${Math.abs(tilt.y) * 2 + 20}px ${
                          Math.abs(tilt.x) * 2 + 40
                        }px rgba(255,152,0,0,0.9)`
                      : "0 8px 18px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent sx={{ p: isMobile ? 2.5 : 4 }}>
                    <Stack spacing={1.5} alignItems="center">
                      {plan.highlight && (
                        <Chip
                          label="Most Loved ⭐"
                          sx={{
                            bgcolor: "#FF9800",
                            color: "#fff",
                          }}
                        />
                      )}

                      <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800}>
                        {plan.title}
                      </Typography>

                      <Typography
                        textAlign="center"
                        variant="body2"
                        color="text.secondary"
                      >
                        {plan.description}
                      </Typography>

                      <Typography
                        variant={isMobile ? "h4" : "h3"}
                        fontWeight={900}
                      >
                        {plan.title === "Student Pro"
                          ? billing === "yearly"
                            ? `₹${yearlyPrice}`
                            : `₹${discountedMonthly}`
                          : plan.price}
                      </Typography>

                      <Divider sx={{ width: "100%" }} />

                      <Stack spacing={0.8} width="100%">
                        {plan.features.map((f) => (
                          <Stack key={f} direction="row" spacing={1}>
                            <CheckCircleIcon sx={{ color: "#0B5ED7" }} />
                            <Typography variant="body2">{f}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>

                  <CardActions sx={{ p: isMobile ? 2 : 4 }}>
                    <Button
                      fullWidth
                      disabled={isCurrent}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlanSelect(plan.title);
                      }}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 900,
                        bgcolor: "#FF9800",
                        color: "#fff",
                        "&.Mui-disabled": {
                          bgcolor: "#FFD699",
                          color: "#8A4B00",
                        },
                      }}
                    >
                      {isCurrent ? "Current Plan ✅" : plan.cta}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Footer */}
        <Box mt={10} textAlign="center">
          <Divider sx={{ mb: 2 }} />
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={600}
          >
            Powered by <span style={{ color: "#FF9800" }}>StudyPilot</span>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
