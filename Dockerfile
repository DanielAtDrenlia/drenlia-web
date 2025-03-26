FROM node:20-slim

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-dev \
    make \
    g++ \
    git \
    libsqlite3-dev \
    # Add dependencies for canvas module
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libpixman-1-dev \
    libtool \
    autoconf \
    automake \
    # Add additional libraries needed for canvas
    libfreetype6-dev \
    libfontconfig1-dev \
    # Add process management tools
    net-tools \
    procps \
    iproute2 \
    lsof \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install global npm packages
RUN npm install -g concurrently

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY setup/package*.json ./setup/
COPY setup/api/package*.json ./setup/api/

# Install dependencies and rebuild native modules
RUN npm install && \
    npm install --save-dev @types/react @types/styled-components @types/react-icons && \
    cd server && npm install && \
    cd ../setup && npm install && \
    cd api && npm install && \
    cd ../.. && \
    npm rebuild better-sqlite3 && \
    cd server && npm rebuild better-sqlite3 && \
    cd ../setup/api && npm rebuild better-sqlite3

# Copy the rest of the application
COPY . .

# Expose ports
EXPOSE 3010 3011 3012 3013

# Start the application
CMD ["npm", "run", "start"] 