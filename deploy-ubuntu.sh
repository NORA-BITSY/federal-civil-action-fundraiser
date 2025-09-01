#!/bin/bash

# Ubuntu 24 Deployment Script for Federal Civil Action Fundraiser
# Run this script on your Ubuntu server to set up the application

set -e

echo "🚀 Starting deployment setup for Ubuntu 24..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

echo "📦 Installing project dependencies..."
npm install

echo "🗄️  Setting up database..."
# Create database user and database
sudo -u postgres psql -c "CREATE USER legal_user WITH PASSWORD 'secure_password_123';"
sudo -u postgres psql -c "CREATE DATABASE federal_civil_action_db OWNER legal_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE federal_civil_action_db TO legal_user;"

echo "🔄 Running database migrations..."
npx prisma migrate deploy
npx prisma generate

echo "🏗️  Building the application..."
npm run build

echo "⚙️  Setting up PM2 configuration..."
cat > ecosystem.config.js << EOL
module.exports = {
  apps: [
    {
      name: 'federal-civil-action-fundraiser',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
}
EOL

echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/federal-civil-action-fundraiser << EOL
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable the site
sudo ln -sf /etc/nginx/sites-available/federal-civil-action-fundraiser /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "🔐 Setting up SSL with Let's Encrypt (optional)..."
echo "Run the following commands after updating your domain:"
echo "sudo apt install certbot python3-certbot-nginx -y"
echo "sudo certbot --nginx -d your-domain.com"

echo "✅ Deployment setup complete!"
echo "To start the application:"
echo "1. Copy your .env.local file to the server"
echo "2. Update DATABASE_URL and other environment variables"
echo "3. Run: pm2 start ecosystem.config.js"
echo "4. Run: pm2 save && pm2 startup"