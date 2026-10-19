# Backend Dockerfile for Node.js / Express
FROM node:20


# Set working directory inside the container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code into container
COPY . .

# Expose backend port
EXPOSE 5000

# Start Express server
CMD ["node", "server.js"]
