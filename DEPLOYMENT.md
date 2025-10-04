# Deployment Guide for Notionify

This guide covers various deployment options for the Notionify application, from simple hosting to enterprise-grade deployments.

## 🚀 Quick Deploy Options

### Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications with zero configuration.

#### Steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add the following variables:
     ```
     HF_API_KEY=your_hugging_face_api_key
     GITHUB_TOKEN=your_github_token (optional)
     NODE_ENV=production
     ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be available at `https://your-project.vercel.app`

#### Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "edge"
    }
  }
}
```

### Netlify

#### Steps:

1. **Build Configuration**
   Create `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Connect your GitHub repository to Netlify
   - Add environment variables in Netlify dashboard
   - Deploy automatically on push

### Railway

#### Steps:

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Configure Environment**
   - Add environment variables in Railway dashboard
   - Set `NODE_ENV=production`

3. **Deploy**
   - Railway automatically detects Next.js and deploys

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Use the official Node.js 18 image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  notionify:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - HF_API_KEY=${HF_API_KEY}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Build and Run

```bash
# Build the Docker image
docker build -t notionify .

# Run with environment variables
docker run -p 3000:3000 \
  -e HF_API_KEY=your_api_key \
  -e GITHUB_TOKEN=your_token \
  notionify

# Or use docker-compose
docker-compose up -d
```

## ☁️ Cloud Platform Deployments

### AWS

#### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your GitHub repository

2. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Set Environment Variables**
   - Add environment variables in Amplify console
   - Deploy automatically

#### Using AWS ECS

1. **Create ECS Task Definition**
   ```json
   {
     "family": "notionify",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "notionify",
         "image": "your-account.dkr.ecr.region.amazonaws.com/notionify:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "secrets": [
           {
             "name": "HF_API_KEY",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:notionify/hf-api-key"
           }
         ]
       }
     ]
   }
   ```

### Google Cloud Platform

#### Using Cloud Run

1. **Build and Push Image**
   ```bash
   # Build the image
   docker build -t gcr.io/your-project/notionify .
   
   # Push to Google Container Registry
   docker push gcr.io/your-project/notionify
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy notionify \
     --image gcr.io/your-project/notionify \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production \
     --set-secrets HF_API_KEY=notionify-hf-api-key:latest
   ```

### Azure

#### Using Azure Container Instances

1. **Create Resource Group**
   ```bash
   az group create --name notionify-rg --location eastus
   ```

2. **Deploy Container**
   ```bash
   az container create \
     --resource-group notionify-rg \
     --name notionify \
     --image your-registry.azurecr.io/notionify:latest \
     --dns-name-label notionify-app \
     --ports 3000 \
     --environment-variables NODE_ENV=production \
     --secure-environment-variables HF_API_KEY=your_api_key
   ```

## 🔧 Environment Configuration

### Production Environment Variables

```env
# Required
NODE_ENV=production
HF_API_KEY=your_hugging_face_api_key

# Optional
GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Performance
NEXT_TELEMETRY_DISABLED=1
```

### Security Considerations

1. **Environment Variables**
   - Never commit API keys to version control
   - Use secure secret management services
   - Rotate keys regularly

2. **HTTPS**
   - Always use HTTPS in production
   - Configure proper SSL certificates
   - Use HSTS headers

3. **Rate Limiting**
   - Configure appropriate rate limits
   - Monitor for abuse
   - Implement IP blocking if needed

## 📊 Monitoring and Logging

### Application Monitoring

1. **Health Checks**
   - Use `/api/health` endpoint
   - Configure monitoring services
   - Set up alerts for failures

2. **Performance Monitoring**
   - Monitor response times
   - Track error rates
   - Monitor resource usage

3. **Logging**
   - Use structured logging
   - Log errors and important events
   - Set up log aggregation

### Recommended Tools

- **Vercel Analytics** - Built-in analytics for Vercel deployments
- **Sentry** - Error tracking and performance monitoring
- **LogRocket** - Session replay and error tracking
- **New Relic** - Application performance monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Runtime Errors**
   - Verify environment variables are set
   - Check API key validity
   - Monitor application logs

3. **Performance Issues**
   - Monitor resource usage
   - Check for memory leaks
   - Optimize database queries

### Debug Commands

```bash
# Check application health
curl https://your-domain.com/api/health

# View logs (Docker)
docker logs notionify-container

# Check environment variables
docker exec notionify-container env
```

## 📈 Scaling Considerations

### Horizontal Scaling

- Use load balancers
- Implement session management
- Use external databases
- Cache frequently accessed data

### Vertical Scaling

- Monitor resource usage
- Upgrade instance sizes as needed
- Optimize application code
- Use CDN for static assets

### Database Scaling

- Use connection pooling
- Implement read replicas
- Use caching layers
- Consider database sharding

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation in place
- [ ] Error handling secure
- [ ] Dependencies updated
- [ ] Security scanning enabled
- [ ] Backup strategy in place
- [ ] Monitoring configured

## 📞 Support

For deployment issues:
- Check the troubleshooting section
- Review application logs
- Contact support team
- Create GitHub issue

---

This deployment guide covers the most common deployment scenarios. Choose the option that best fits your needs and infrastructure requirements.