# ✅ Hostinger VPS Deployment Checklist

Use this checklist to ensure you complete all steps for deploying to Hostinger VPS.

## 📋 Pre-Deployment

- [ ] VPS access credentials (IP, username, password/SSH key)
- [ ] Domain name purchased and DNS configured
- [ ] Git repository ready (GitHub/GitLab/Bitbucket)
- [ ] Razorpay account and API keys
- [ ] SMTP email credentials (Gmail/other provider)
- [ ] All environment variables documented

## 🔧 VPS Initial Setup

- [ ] Connected to VPS via SSH
- [ ] System packages updated (`sudo apt update && sudo apt upgrade`)
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] PM2 installed globally (`sudo npm install -g pm2`)
- [ ] Nginx installed
- [ ] PostgreSQL installed (or SQLite ready)

## 🗄️ Database Setup

- [ ] Database created (PostgreSQL or SQLite)
- [ ] Database user created (if PostgreSQL)
- [ ] Database permissions configured
- [ ] Prisma schema updated for production database type

## 📁 Project Setup

- [ ] Project directory created (`/var/www/hars-jewellery`)
- [ ] Repository cloned to VPS
- [ ] Dependencies installed (`npm ci`)
- [ ] `.env` file created with all production variables
- [ ] `NEXTAUTH_SECRET` generated (32+ characters)
- [ ] `WEBHOOK_SECRET` set
- [ ] All API keys configured (Razorpay, SMTP, etc.)

## 🏗️ Build & Deploy

- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Application built (`npm run build`)
- [ ] PM2 configuration updated (`ecosystem.config.js`)
- [ ] Logs directory created
- [ ] Application started with PM2
- [ ] PM2 auto-start configured (`pm2 save && pm2 startup`)

## 🌐 Nginx Configuration

- [ ] Nginx configuration file created
- [ ] Domain name configured in Nginx
- [ ] Proxy settings configured (port 3000)
- [ ] Static files caching configured
- [ ] Upload size limit set (10M+)
- [ ] Nginx configuration tested (`sudo nginx -t`)
- [ ] Nginx restarted and enabled

## 🔒 SSL Certificate

- [ ] Certbot installed
- [ ] SSL certificate obtained
- [ ] HTTPS redirect configured
- [ ] Auto-renewal tested (`sudo certbot renew --dry-run`)

## 🧪 Testing

- [ ] Application accessible at domain (HTTP)
- [ ] Application accessible at domain (HTTPS)
- [ ] Homepage loads correctly
- [ ] Admin login works
- [ ] User registration works
- [ ] Email sending works (test OTP/verification)
- [ ] Product pages load
- [ ] Cart functionality works
- [ ] Payment gateway (Razorpay) configured
- [ ] File uploads work
- [ ] Database operations work

## 📊 Monitoring

- [ ] PM2 monitoring set up (`pm2 monit`)
- [ ] Logs accessible and readable
- [ ] Error tracking configured
- [ ] Backup strategy planned

## 🔄 Deployment Automation

- [ ] `deploy.sh` script updated and executable
- [ ] GitHub Actions workflow configured (optional)
- [ ] Webhook deployment tested (optional)
- [ ] Manual deployment process documented

## 🔐 Security

- [ ] Firewall configured (UFW)
- [ ] SSH key authentication set up
- [ ] Strong passwords set
- [ ] Environment variables secured
- [ ] File permissions set correctly
- [ ] Regular updates scheduled

## 📝 Post-Deployment

- [ ] All features tested
- [ ] Performance checked
- [ ] Error logs reviewed
- [ ] Backup tested
- [ ] Team notified
- [ ] Documentation updated

## 🆘 Troubleshooting Prepared

- [ ] Know how to check PM2 logs
- [ ] Know how to check Nginx logs
- [ ] Know how to restart services
- [ ] Know how to rollback if needed
- [ ] Support contacts documented

---

## 🚀 Quick Deployment Command

Once everything is set up, you can deploy updates with:

```bash
cd /var/www/hars-jewellery && bash deploy.sh
```

---

**Note:** Check off each item as you complete it. This ensures nothing is missed during deployment.

