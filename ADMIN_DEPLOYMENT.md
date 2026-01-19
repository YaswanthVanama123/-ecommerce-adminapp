# StyleHub Admin WebApp Deployment Guide

## Production Build and Deployment

### Prerequisites
- Node.js 18+
- Backend API running
- Subdomain configured (admin.yourdomain.com)

### Build Process

```bash
cd admin-webapp
npm install

# Create production environment
cat > .env.production << EOF
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME=StyleHub Admin
EOF

npm run build
```

### NGINX Configuration

```bash
sudo nano /etc/nginx/sites-available/stylehub-admin
```

```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;

    root /var/www/stylehub/admin-webapp/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Additional security for admin panel
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    location / {
        try_files $uri $uri/ /index.html;

        # Optional: IP whitelist for admin access
        # allow 203.0.113.0/24;
        # deny all;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/stylehub-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d admin.yourdomain.com
```

### Security Recommendations

1. **IP Whitelisting:** Add office/team IPs to NGINX config
2. **2FA:** Enable two-factor authentication
3. **VPN Access:** Require VPN for admin access
4. **Monitoring:** Set up alerts for admin logins
5. **Audit Logs:** Monitor all admin actions

### Deployment

```bash
ssh user@server
cd /var/www/stylehub/admin-webapp
git pull
npm install
npm run build
```
