FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build for Production
RUN npm run build

EXPOSE 3000

# Initialization and Porduction Start
# 1. cli/x402-escape.js init (Folder & State setup)
# 2. cli/x402-escape.js seed (Inject seed templates)
# 3. npm start (Standard Next.js Production Server)
CMD ["sh", "-c", "node cli/x402-escape.js init && node cli/x402-escape.js seed && npm start"]
