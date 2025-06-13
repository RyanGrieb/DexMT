FROM node:lts-alpine

# Install Chrome dependencies and Chrome
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Tell Puppeteer to skip installing Chromium since we have it already
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

USER node
WORKDIR /hono

# Copy package files first for better Docker layer caching
# --chown=node:node sets file ownership to the node user instead of root for security
COPY --chown=node:node package.json ./

# Install dependencies using npm install
RUN npm install

# Copy the rest of the application
# --chown=node:node ensures the node user can access all app files
COPY --chown=node:node . .

EXPOSE 8787

CMD ["npm", "run", "dev"]
