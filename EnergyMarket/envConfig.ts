import { ExecOptionsWithStringEncoding } from "child_process";

interface EnvVar {
  PORT: string;
  APP_DOMAIN: string;
  MINIMUM_P2P_ENERGY_PRICE: string;
  MAXIMUM_P2P_ENERGY_PRICE: string;
  DEFAULT_ENERGY_AMOUNT: string;
}

const envVariables = [
  "PORT",
  "APP_DOMAIN",
  "MINIMUM_P2P_ENERGY_PRICE",
  "MAXIMUM_P2P_ENERGY_PRICE",
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
      `Missing environmental variable(s): ${missingVariables.join(", ")}`
    );
  }

  const pairs = envVariables.map((envVar) => [[envVar], process.env[envVar]]);

  return Object.fromEntries(pairs);
};

export default envConfig;
