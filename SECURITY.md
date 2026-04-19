# Security Guidelines for SaPyme SaaS Platform

## 🔐 Critical Security Recommendations

### 1. Secrets Management

**IMMEDIATE ACTIONS REQUIRED:**

- **Never commit `.env` files** with real credentials to Git
- Change all default passwords before deploying to production:
  - Database password: `admin123` → secure password (min 32 chars)
  - JWT secret: Generate a new 256+ character secret
  - SUNAT credentials: Use production credentials only in prod

**Generate Secure Secrets:**

```bash
# Generate JWT Secret (256+ characters)
openssl rand -base64 32

# Generate Database Password
openssl rand -base64 24
```

### 2. Docker Compose Security

The current `docker-compose.yml` contains development credentials. For production:

1. Use `docker-compose.override.yml` for local development secrets
2. Use environment variables or secrets management in production
3. Never hardcode secrets in docker-compose.yml

### 3. Git History Cleanup

If you've committed secrets in the past, clean your Git history:

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove .env from history
git filter-repo --path .env --invert-paths

# Force push (all collaborators must re-clone)
git push --force --all
```

### 4. CORS Configuration

Current allowed origins: `http://localhost:5173,http://localhost:3000`

For production, update to your actual domains:
```
CORS_ALLOWED_ORIGINS=https://app.tudominio.com,https://admin.tudominio.com
```

### 5. SSL/TLS Requirements

- All production traffic MUST use HTTPS
- Configure SSL certificates for nginx
- Use Let's Encrypt for free certificates

### 6. Database Security

- Change default PostgreSQL port mapping in production (don't expose 5432)
- Use strong passwords (min 32 characters, mixed case, numbers, symbols)
- Enable SSL connections to database
- Regular backups with encryption

### 7. API Security

- Implement rate limiting
- Use API keys for service-to-service communication
- Validate all inputs
- Log security events

### 8. File Upload Security

The facturación service handles XML/PDF files:
- Validate file types strictly
- Scan uploads for malware
- Store outside web root
- Set proper permissions (600 for certs, 644 for generated files)

## 🚨 Production Checklist

- [ ] All default passwords changed
- [ ] JWT secret rotated (256+ chars)
- [ ] HTTPS enabled everywhere
- [ ] Database not exposed to public internet
- [ ] CORS configured for production domains only
- [ ] Git history cleaned of any committed secrets
- [ ] Regular security updates scheduled
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented
- [ ] Disaster recovery plan documented

## 📞 Security Contacts

Report security vulnerabilities to: security@tudominio.com
