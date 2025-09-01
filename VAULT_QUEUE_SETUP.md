# Production Vault Queue System Setup Guide

This document provides the complete setup and testing instructions for the production-grade BullMQ OCR+Redaction worker system.

## 🎯 What Was Implemented

### Core Features
- **BullMQ + Redis Queue System**: Asynchronous document processing with retry logic
- **Production S3/R2 Storage**: AWS SDK v3 with presigned URLs (PUT/GET)
- **OCR Processing**: PDF text extraction with page-by-page analysis
- **PII Redaction**: Comprehensive privacy protection (SSN, phone, email, names, addresses)
- **Smart Document Tagging**: Auto-generated tags based on content analysis
- **Status Tracking**: Real-time processing status with error handling
- **Retry Mechanisms**: Failed job retry with exponential backoff

### New Components
```
src/lib/
├── queue.ts              # BullMQ setup and job management
├── storage.ts            # Production S3/R2 utilities  
├── ocr.ts                # PDF processing and tag generation
└── redact.ts             # PII redaction and safety validation

src/workers/
└── vault.worker.ts       # Main processing worker

src/app/api/vault/
├── upload/route.ts       # Updated for queue workflow
├── status/[id]/route.ts  # File processing status
└── queue/stats/route.ts  # Queue health monitoring

scripts/
├── start-worker.js       # Development worker launcher
├── worker-prod.js        # Production worker with monitoring
└── queue-stats.js        # Queue statistics utility
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install bullmq ioredis pdf-parse @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 2. Environment Setup
Copy and configure your environment variables:
```bash
cp .env.example .env.local
```

Required new variables:
```env
# Redis Configuration
REDIS_HOST="localhost"
REDIS_PORT="6379" 
REDIS_PASSWORD=""
REDIS_DB="0"

# Storage (S3 or Cloudflare R2)
STORAGE_BUCKET="your-vault-bucket"
STORAGE_REGION="us-east-1"
STORAGE_ACCESS_KEY_ID="your-access-key"
STORAGE_SECRET_ACCESS_KEY="your-secret-key"
STORAGE_ENDPOINT="https://s3.amazonaws.com"  # or R2 endpoint

# Worker Settings
VAULT_WORKER_CONCURRENCY="2"
```

### 3. Database Migration
Update your database schema:
```bash
npm run db:push
```

### 4. Start Redis
```bash
# Local Redis
redis-server

# Or Docker
docker run -p 6379:6379 redis:alpine
```

### 5. Start the Worker
```bash
# Development
npm run worker:dev

# Production  
npm run worker:prod
```

## 🧪 Testing the Complete Workflow

### End-to-End Test Scenario

1. **Upload Document** via UI or API
   - Document status: `PENDING`
   - Signed upload URL generated
   - VaultFile record created

2. **Complete Upload** (client uploads to S3)
   - Call PUT `/api/vault/upload` with fileId
   - Job queued for processing
   - Document status: `PENDING` → processing queued

3. **Worker Processing**
   - Downloads file from storage
   - Runs antivirus scan (stub)
   - Performs OCR text extraction
   - Redacts PII (SSN, phone, emails, names)
   - Generates smart tags
   - Document status: `PROCESSING` → `READY` or `FAILED`

4. **Monitor Progress**
   - Poll GET `/api/vault/status/{fileId}` 
   - UI shows real-time status updates
   - Failed files can be retried

### Manual Test Commands

```bash
# Check queue health
npm run queue:stats

# Watch queue in real-time
npm run queue:stats -- --watch

# Seed demo data
npm run db:seed:phase1

# Start development environment
npm run dev  # Terminal 1
npm run worker:dev  # Terminal 2
```

### API Testing with curl

```bash
# 1. Get upload URL
curl -X POST localhost:3000/api/vault/upload \
  -H "Content-Type: application/json" \
  -d '{"fileName":"test.pdf","sizeBytes":50000,"mimeType":"application/pdf"}'

# 2. Upload file to S3 (use returned uploadUrl)
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: application/pdf" \
  --data-binary @test.pdf

# 3. Trigger processing
curl -X PUT localhost:3000/api/vault/upload \
  -H "Content-Type: application/json" \
  -d '{"fileId":"file_id_from_step_1"}'

# 4. Check processing status
curl localhost:3000/api/vault/status/file_id_from_step_1

# 5. Retry if failed
curl -X POST localhost:3000/api/vault/status/file_id_from_step_1
```

## 📊 Monitoring and Debugging

### Queue Statistics
```bash
npm run queue:stats
```
Shows:
- ✅ Queue health (Redis connection)
- 📈 Job counts (waiting, active, completed, failed)
- 💡 Performance recommendations
- 🚨 Alerts for stuck workers

### Worker Logs
Development: Console output
Production: Structured logs with health checks

### Common Issues

1. **Redis Connection Failed**
   - Check REDIS_HOST/PORT environment variables
   - Ensure Redis server is running
   - Test connection: `redis-cli ping`

2. **S3 Upload Errors** 
   - Verify AWS credentials and permissions
   - Check bucket exists and region is correct
   - Test with AWS CLI: `aws s3 ls s3://your-bucket`

3. **OCR Processing Fails**
   - Ensure pdf-parse dependency is installed
   - Check file format is supported
   - Verify file isn't corrupted

4. **Worker Not Processing**
   - Check worker is running: `npm run queue:stats`
   - Look for errors in worker logs
   - Restart worker: `npm run worker:dev`

## 🔒 Security Features

### PII Redaction
- **Social Security Numbers**: `123-45-6789` → `[SSN-REDACTED]`
- **Phone Numbers**: `(555) 123-4567` → `[PHONE-REDACTED]`
- **Email Addresses**: `user@domain.com` → `[EMAIL-REDACTED]`
- **Full Names**: Smart detection with court term exclusions
- **Addresses**: Street addresses and financial accounts

### Safety Validation
- Pre-redaction safety checks
- Confidence scoring
- Manual review recommendations for sensitive content

## 🎚️ Configuration Options

### Worker Scaling
```env
VAULT_WORKER_CONCURRENCY="4"  # Jobs processed simultaneously
```

### Queue Settings
- **Retry Logic**: 3 attempts with exponential backoff
- **Job Retention**: 50 completed, 100 failed jobs kept
- **Timeout**: 10 minutes per job
- **Priority**: Higher priority for smaller files

### Storage Optimization
- **Presigned URL TTL**: 5 minutes (upload), 10 minutes (download)
- **File Size Limit**: 50MB
- **Supported Types**: PDF, images, Word docs, plain text

## 📈 Performance Guidelines

### Recommended Setup
- **Development**: 1-2 worker processes, local Redis
- **Production**: 2-4 workers per CPU core, Redis cluster
- **Storage**: Cloudflare R2 for cost, AWS S3 for performance

### Scaling Considerations
- Workers scale horizontally (add more processes)
- Redis handles high job throughput
- S3/R2 provides unlimited storage
- Database handles file metadata only

## 🚢 Production Deployment

### Docker Example
```dockerfile
# Worker container
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
CMD ["npm", "run", "worker:prod"]
```

### Process Management
```bash
# PM2 (recommended)
pm2 start scripts/worker-prod.js --name vault-worker

# Systemd service
systemctl enable chips-copilot-worker
systemctl start chips-copilot-worker
```

### Health Checks
- Redis connectivity test
- Queue processing verification  
- Memory usage monitoring
- Auto-restart on failure

## ✅ Completion Checklist

- [ ] Redis server running and accessible
- [ ] S3/R2 bucket configured with proper permissions
- [ ] Environment variables set
- [ ] Database schema updated
- [ ] Dependencies installed
- [ ] Worker process started
- [ ] End-to-end test successful
- [ ] Queue monitoring set up
- [ ] Production deployment configured

---

🎉 **Your production-grade vault processing system is now ready!**

The system provides enterprise-level document processing with privacy protection, automatic scaling, and comprehensive monitoring. All uploaded documents will be automatically processed for OCR, PII redaction, and intelligent tagging.