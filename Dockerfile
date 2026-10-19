# Frontend Dockerfile for React (Vite)
# Using Node 22 to satisfy Vite 8+ requirements (Node 20.19+ / 22.12+)
FROM node:22 AS build


# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy application source code into container
COPY . .

# Build production bundle
RUN npm run build

# Expose Vite preview port
EXPOSE 5173

# Serve production build accessible to Docker network
CMD ["npm", "run", "preview", "--", "--host"]
