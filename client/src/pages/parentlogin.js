import { Box, Container, Typography, TextField, Button } from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { Cookies } from "react-cookie";
import Head from "next/head";
// import { CssBaseline } from "@mui/material";

const cookies = new Cookies();
//parent login component
export default function Login() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const sendOtp = async () => {
    console.log(email);
    const response = await axios.post("api/v1/parent/login", { email });
    console.log(response.data);
    if (response.status === 200) {
      setShowOtp(true);
    }
  };
//parent verify
  const verifyOtp = async () => {
    const response = await axios.post("/api/v1/verify/parent", {
      email,
      otp,
    });
    console.log(response.data);
    if (response.status === 200) {
      setShowOtp(false);
    //   console.log("response.data.token:", response.data.token);
      cookies.set("token", response.data.token);
      //   cookies.set("user", JSON.stringify(response.data.user));
      console.log("Login successful, token stored in cookies.");
      // window.location.href = "/";
    }
    else if (response.status === 400) {
      console.log("OTP verification failed.");
    }
  };
  

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
         <Box sx={{ paddingTop: "100px" }}>
            <Container maxWidth="sm">
              <Typography variant="h1">Login</Typography>
              <br />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {showOtp ? (
                  <>
                    <TextField
                      label="Enter OTP"
                      onChange={(event) => {
                        setOtp(event.target.value);
                      }}
                      value={otp}
                    />
                    <Button variant="contained" onClick={verifyOtp}>
                      Login
                    </Button>
                  </>
                ) : (
                  <>
                    <TextField
                      label="Email"
                      onChange={(event) => {
                        setEmail(event.target.value);
                      }}
                      value={email}
                    />
                    <Button variant="contained" onClick={sendOtp} hidden={true}>
                      Send OTP
                    </Button>
                  </>
                )}
              </Box>
            </Container>
          </Box>
    </>
  );
};