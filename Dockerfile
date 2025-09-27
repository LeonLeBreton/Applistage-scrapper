FROM node:22-alpine
WORKDIR /app

RUN apk add --no-cache tzdata


COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY src/ ./src/

RUN npm run build

RUN rm -rf src/ tsconfig.json && \
    npm prune --production && \
    npm cache clean --force

RUN addgroup -g 1001 -S nodejs && \
    adduser -S appuser -u 1001 -G nodejs

RUN chown -R appuser:nodejs /app
USER appuser

ENV TZ=Europe/Paris
ENV DISABLE_WEBHOOK_TEST="false"
ENV APPLISTAGE_CONFIG_PATH="/config/config.toml"
ENV NODE_ENV=production

CMD ["npm", "start"]