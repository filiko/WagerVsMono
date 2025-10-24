# WagerVS Migration Guide: MySQL/Prisma → Supabase + Vercel

This guide will help you migrate your WagerVS application from MySQL/Prisma to Supabase and deploy it on Vercel.

## 🎯 Migration Overview

**From:** MySQL database with Prisma ORM  
**To:** Supabase (PostgreSQL) with Vercel deployment

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Your code should be in a GitHub repository

## 🚀 Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `wager-vs`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (2-3 minutes)

### 1.2 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-ref.supabase.co`)
   - **Anon Key** (public key)
   - **Service Role Key** (secret key)

### 1.3 Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `wager-backend/supabase-migration.sql`
3. Click **Run** to execute the migration
4. Verify tables are created in **Table Editor**

## 🔧 Step 2: Update Environment Variables

### 2.1 Local Development

1. Copy `wager-backend/env.supabase.template` to `wager-backend/.env`
2. Fill in your Supabase credentials:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase Configuration
SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Other environment variables...
```

### 2.2 Test Local Connection

```bash
cd wager-backend
npm install
npm run dev
```

Visit `http://localhost:5000/api/health` to verify connection.

## 🚀 Step 3: Deploy to Vercel

### 3.1 Prepare for Deployment

1. **Update package.json** (already done in migration)
2. **Create vercel.json** (already created)
3. **Commit changes to Git**:

```bash
git add .
git commit -m "Migrate to Supabase + Vercel"
git push origin main
```

### 3.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. **Import Git Repository**: Select your WagerVS repository
4. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `wager-backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Add Environment Variables**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI`
   - `CLIENT_URL`
   - All other required variables
6. Click **Deploy**

### 3.3 Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

## 🔄 Step 4: Data Migration (If Needed)

If you have existing data in MySQL, you'll need to migrate it:

### 4.1 Export from MySQL

```sql
-- Export users table
SELECT * FROM users INTO OUTFILE '/tmp/users.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n';

-- Export ai_prediction_logs table
SELECT * FROM ai_prediction_logs INTO OUTFILE '/tmp/ai_prediction_logs.csv'
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

### 4.2 Import to Supabase

1. Go to **Table Editor** in Supabase
2. Use **Import** feature to upload CSV files
3. Or use the **SQL Editor** with INSERT statements

## 🧪 Step 5: Testing

### 5.1 Test API Endpoints

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Test authentication
curl -X POST https://your-app.vercel.app/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"userInfo": {...}, "accessToken": "..."}'
```

### 5.2 Test Database Operations

1. Create a test user
2. Create a test prediction log
3. Verify data in Supabase dashboard

## 🔒 Step 6: Security Configuration

### 6.1 Row Level Security (RLS)

The migration SQL already sets up RLS policies. Verify in Supabase:

1. Go to **Authentication** → **Policies**
2. Ensure policies are active
3. Test with different user roles

### 6.2 Environment Variables Security

- Never commit `.env` files
- Use Vercel's environment variables for production
- Rotate keys regularly

## 📊 Step 7: Monitoring & Analytics

### 7.1 Supabase Dashboard

- Monitor database performance
- Check API usage
- Review logs

### 7.2 Vercel Analytics

- Monitor deployment health
- Check function performance
- Review error logs

## 🚨 Troubleshooting

### Common Issues

1. **Connection Errors**:
   - Verify environment variables
   - Check Supabase project status
   - Ensure RLS policies allow access

2. **Build Errors**:
   - Check TypeScript compilation
   - Verify all dependencies are installed
   - Review Vercel build logs

3. **Authentication Issues**:
   - Verify JWT secret matches
   - Check Google OAuth configuration
   - Ensure redirect URIs are correct

### Debug Commands

```bash
# Test Supabase connection
npm run dev
curl http://localhost:5000/api/health

# Check Vercel deployment
vercel logs

# Test database queries
# Use Supabase SQL Editor
```

## 📈 Benefits of Migration

### ✅ Scalability
- **Automatic scaling** with Vercel serverless functions
- **Global CDN** for static assets
- **Built-in connection pooling** with Supabase

### ✅ Real-time Features
- **Live subscriptions** for wager updates
- **Instant notifications** for bet outcomes
- **Real-time chat** capabilities

### ✅ Enhanced Security
- **Row Level Security** policies
- **Built-in authentication** with Supabase Auth
- **Automatic HTTPS** with Vercel

### ✅ Developer Experience
- **Instant deployments** with Vercel
- **Database dashboard** with Supabase
- **Type-safe APIs** with auto-generated types

### ✅ Cost Efficiency
- **Pay-per-use pricing** with both platforms
- **No server maintenance** required
- **Automatic backups** with Supabase

## 🎉 Migration Complete!

Your WagerVS application is now running on:
- **Database**: Supabase (PostgreSQL)
- **Backend**: Vercel Serverless Functions
- **Frontend**: Vercel Static Hosting

### Next Steps

1. **Monitor Performance**: Use Supabase and Vercel dashboards
2. **Set Up Alerts**: Configure monitoring for errors and performance
3. **Optimize**: Fine-tune based on usage patterns
4. **Scale**: Add more features as needed

### Support

- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Community**: Join Supabase and Vercel Discord servers

---

**Migration completed successfully! 🚀**
