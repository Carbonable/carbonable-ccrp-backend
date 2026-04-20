FROM node:20-slim AS builder

WORKDIR /srv/www

RUN npm install -g pnpm
COPY package*.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
RUN npx prisma generate && pnpm run build

FROM node:20-slim AS production

RUN groupadd --system carbonable && useradd --system -g carbonable -m carbonable
USER carbonable:carbonable

WORKDIR /srv/www

COPY --chown=carbonable:carbonable --from=builder /srv/www/package.json ./package.json
COPY --chown=carbonable:carbonable --from=builder /srv/www/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --chown=carbonable:carbonable --from=builder /srv/www/node_modules ./node_modules
COPY --chown=carbonable:carbonable --from=builder /srv/www/dist ./dist
COPY --chown=carbonable:carbonable --from=builder /srv/www/src/schemas ./src/schemas
COPY --chown=carbonable:carbonable --from=builder /srv/www/prisma ./prisma

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
