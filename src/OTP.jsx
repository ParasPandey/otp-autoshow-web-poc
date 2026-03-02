import React, { useState, useRef, useEffect } from "react";

const SingleField = ({ maxLength = 6, onSubmit }) => {
  const [otp, setOtp] = useState(Array(maxLength).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    if ("OTPCredential" in window) {
      window.addEventListener("DOMContentLoaded", () => {
        const input = document.querySelector(
          'input[autocomplete="one-time-code"]'
        );
        if (!input) return;
        const ac = new AbortController();
        const form = input.closest("form");
        if (form) {
          form.addEventListener("submit", () => {
            ac.abort();
          });
        }
        navigator.credentials
          .get({
            otp: { transport: ["sms"] },
            signal: ac.signal,
          })
          .then((otp) => {
            input.value = otp.code;
            if (form) form.submit();
          })
          .catch((err) => {
            console.log(err);
          });
      });
    }
  }, [maxLength, onSubmit]);

  const handleInputChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, "");
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < maxLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);

      if (index > 0 && !otp[index]) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (event.key === "Enter") {
      const otpString = otp.join("");
      if (otpString.length === maxLength && onSubmit) {
        onSubmit(otpString);
      }
    }
  };

  return (
    <form className="container">
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
    </form>
  );
};

export default SingleField;
