interface EnvVar {
  PORT: string;
  APP_DOMAIN: string;
  DEFAULT_STARTUP_PEER: string;
}

const envVariables = ["PORT", "APP_DOMAIN", "DEFAULT_STARTUP_PEER"];

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
