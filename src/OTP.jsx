import React, { useState, useRef, useEffect } from "react";

const SingleField = ({ maxLength = 6, onSubmit }) => {
  const [otp, setOtp] = useState(Array(maxLength).fill(""));
  const inputRefs = useRef([]);
  const abortControllerRef = useRef(null);
  const [webOtpUsed, setWebOtpUsed] = useState(false);

  useEffect(() => {
    if (!("OTPCredential" in window)) return;

    const startListener = () => {
      setWebOtpUsed(false);
      const ac = new AbortController();
      abortControllerRef.current = ac;

      navigator.credentials
        .get({
          otp: { transport: ["sms"] },
          signal: ac.signal,
        })
        .then((otpCredential) => {
          alert("otp received");
          setWebOtpUsed(true);
          if (!otpCredential?.code) return;

          const receivedOtp = otpCredential.code.replace(/\D/g, "");
          if (receivedOtp.length === maxLength) {
            const newOtp = receivedOtp.split("");
            setOtp(newOtp);
          }

          // Restart listener for next OTP
          startListener();
        })
        .catch((err) => {
          if (err.name !== "AbortError") console.error(err);
          startListener(); // Restart even on error
        });
    };

    startListener();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [maxLength]);

  const handleInputChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < maxLength - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      if (index > 0 && !otp[index]) inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "Enter") {
      const otpString = otp.join("");
      if (otpString.length === maxLength && onSubmit) onSubmit(otpString);
    }
  };

  return (
    <div className="container">
      {webOtpUsed && <p>WebOTP API captured the SMS</p>}
      {otp.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          value={digit}
          onChange={(e) => handleInputChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          ref={(el) => (inputRefs.current[index] = el)}
        />
      ))}
    </div>
  );
};

export default SingleField;
