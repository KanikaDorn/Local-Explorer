# Deployment Guide

## Environment Setup

Before deploying, ensure all environment variables are configured:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Vertex AI / Gemini
VERTEX_PROJECT_ID=your_project_id
VERTEX_LOCATION=us-central1

# Bakong (Optional - test mode works without)
BAKONG_API_BASE=https://api.bakong.dev
BAKONG_API_KEY=your_bakong_key
BAKONG_MERCHANT_ID=your_merchant_id

# Email Service (Optional)
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=noreply@localexplore.com

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Database Setup

1. **Create Supabase project**

   - Go to https://supabase.com
   - Create new project
   - Note the URL and keys

2. **Run migrations**

   ```bash
   supabase migration up
   ```

3. **Verify tables**
   - profiles
   - partners
   - admins
   - spots
   - spot_moderation
   - subscriptions
   - payments
   - analytics_events
   - itineraries
   - bucket_list
   - feedback
   - spot_embeddings

## Build & Deploy

### Local Development

```bash
npm install
npm run dev
```

### Production Build

```bash
npm install
npm run build
npm start
```

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Docker

```bash
docker build -t localexplore .
docker run -p 3000:3000 localexplore
```

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Monitoring

- Monitor Supabase database usage
- Check API quotas (Vertex AI, Bakong)
- Review error logs in application
- Monitor payment webhooks

## Troubleshooting

### Database Connection Issues

- Verify Supabase credentials
- Check network access
- Verify RLS policies

### Payment Issues

- Test Bakong credentials
- Check webhook endpoints
- Review transaction logs

### Email Not Sending

- Configure email service (SendGrid recommended)
- Verify sender email
- Check spam folder

## Security

1. Never commit `.env.local` to version control
2. Use strong passwords for admin accounts
3. Enable RLS on all tables
4. Regularly update dependencies
5. Monitor for security vulnerabilities

## Performance Optimization

1. Enable image optimization (Next.js Image component)
2. Use CDN for static assets
3. Implement caching strategies
4. Monitor Core Web Vitals
5. Optimize database queries

## Backup & Recovery

1. Enable Supabase automated backups
2. Export data regularly
3. Test recovery procedures
4. Document critical procedures

## Rollback Procedures

1. Keep previous version tagged in Git
2. Database: Use Supabase point-in-time recovery
3. Frontend: Use Vercel rollback feature
4. Create rollback checklist

## Support & Contact

For issues or questions:

- GitHub Issues: [project-repo]
- Email: support@localexplore.com
- Slack: [workspace-link]

Last Updated: December 12, 2025
