import React, { useState, useRef, useEffect } from "react";

const SingleField = ({ maxLength = 6, onSubmit }) => {
  const [otp, setOtp] = useState(Array(maxLength).fill(""));
  const inputRefs = useRef([]);

  useEffect(() => {
    let abortController;

    if ("OTPCredential" in window) {
      abortController = new AbortController();

      navigator.credentials
        .get({
          otp: { transport: ["sms"] },
          signal: abortController.signal,
        })
        .then((otpCredential) => {
          const receivedOtp = otpCredential.code;
          if (receivedOtp.length === maxLength) {
            const newOtp = receivedOtp.split("");
            setOtp(newOtp);

            // Autofill the inputs
            newOtp.forEach((digit, index) => {
              if (inputRefs.current[index]) {
                inputRefs.current[index].value = digit;
              }
            });

            // Optionally, call the submit function
            if (onSubmit) {
              onSubmit(receivedOtp);
            }
          }
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("OTP retrieval failed:", err);
          }
        });
    }

    return () => {
      if (abortController) {
        abortController.abort(); // Abort the signal when the component unmounts
      }
    };
  }, [maxLength, onSubmit]);

  const handleInputChange = (index, event) => {
    const value = event.target.value;
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
    } else if (event.key === "Enter") {
      const otpString = otp.join("");
      if (onSubmit) {
        onSubmit(otpString);
      }
    }
  };

  return (
    <div className="container">
      {otp.map((digit, index) => (
        <input
          key={index}
          type="password"
          maxLength="1"
          inputMode="numeric"
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
