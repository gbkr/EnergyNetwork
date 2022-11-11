interface EnvVar {
  PORT: string;
  APP_DOMAIN: string;
  MARKET_URL: string;
  RUN_SIMULATION: string;
  STORAGE_BUY_LIMIT: string;
  STORAGE_SELL_LIMIT: string;
  MARKET_EXPIRE_REQUEST_SECONDS: string;
  DEFAULT_ENERGY_AMOUNT: string;
}

const envVariables = [
  "PORT",
  "APP_DOMAIN",
  "MARKET_URL",
  "RUN_SIMULATION",
  "STORAGE_BUY_LIMIT",
  "STORAGE_SELL_LIMIT",
  "MARKET_EXPIRE_REQUEST_SECONDS",
  "DEFAULT_ENERGY_AMOUNT",
];

const missingVariables: String[] = [];

let cachedVars: EnvVar;

const envConfig = (): EnvVar => {
  if (cachedVars) {
    return cachedVars;
  }

  envVariables.forEach((varName) => {
    if (!process.env[varName]) {
      missingVariables.push(varName);
    }
  });

  if (missingVariables.length) {
    throw new Error(
      `Missing enviromental variable(s): ${missingVariables.join(", ")}`
    );
  }

  const pairs = envVariables.map((envVar) => [[envVar], process.env[envVar]]);

  return Object.fromEntries(pairs);
};

export default envConfig;
