const domainConfig = {
  dev: {
    API_BASE_URL: "https://dev.wagervs.fun/api",
    BASE_URL: "https://dev.wagervs.fun",
  },
};

// Get the current domain
const currentDomain = window.location.hostname;

// Check if currentDomain exists in the domainConfig, otherwise fallback to the default
// window.API_BASE_URL =
//   window.location.hostname === "localhost" && window.location.port === "3000"
//     ? "http://localhost:5000/api"
//     : "/api";
window.API_BASE_URL = "https://wagervsmono-test.onrender.com/api";
//
const BASE_URL = "";

const DISTRIBUTION_FEE_PERCENTAGE = 1;
