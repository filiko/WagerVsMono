const { execSync } = require('child_process');

const envVars = {
  'SUPABASE_URL': 'https://huzjvdumnmknxfssjwjq.supabase.co',
  'SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1emp2ZHVtbm1rbnhmc3Nqd2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMDIxNjksImV4cCI6MjA3Njg3ODE2OX0.z5NiuxgUm2gjqMySRzmjbeMzCSH9c2xDWEkqvzyWfyo',
  'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1emp2ZHVtbm1rbnhmc3Nqd2pxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTMwMjE2OSwiZXhwIjoyMDc2ODc4MTY5fQ.L7bPZzVf_QlVTBOKj1fzjdBYE5eoYbH7-vZlgqYZXL4',
  'JWT_SECRET': 'wager_vs_secure_jwt_secret_2024_production',
  'NODE_ENV': 'production'
};

console.log('Setting environment variables...');

for (const [key, value] of Object.entries(envVars)) {
  try {
    console.log(`Setting ${key}...`);
    // Note: This is a placeholder - you'll need to set these manually in Vercel dashboard
    console.log(`Would set ${key}=${value}`);
  } catch (error) {
    console.error(`Error setting ${key}:`, error.message);
  }
}

console.log('\nPlease manually add these to Vercel dashboard:');
console.log('Go to: https://vercel.com/aufstins-projects/wager-vs-mono/settings/environment-variables');
console.log('\nAdd these variables:');
for (const [key, value] of Object.entries(envVars)) {
  console.log(`${key} = ${value}`);
}
