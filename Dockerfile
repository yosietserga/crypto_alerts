# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update && apk add git
WORKDIR /app


# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
   if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
   elif [ -f package-lock.json ]; then npm ci; \
   elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i; \
   else echo "Lockfile not found." && exit 1; \
   fi
 

# Rebuild the source code only when needed
FROM node:16-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
RUN yarn npx prisma generate
RUN yarn npx prisma db push
RUN yarn npx prisma db seed
RUN yarn build

# Production image, copy all the files and run next
FROM node:16-alpine AS runner
WORKDIR /app 

ENV NODE_ENV production
ENV PORT 3000
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# You only need to copy next.config.js if you are NOT using the default configuration
#copying build and modules folders
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
#copying config files
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/schema.prisma ./schema.prisma
COPY --from=builder /app/postcss.config.js ./postcss.config.js
COPY --from=builder /app/tailwind.config.js ./tailwind.config.js
COPY --from=builder /app/.env ./.env
#copying enrtypoint files
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/serverWhatsapp.js ./serverWhatsapp.js
COPY --from=builder /app/serverBinance.js ./serverBinance.js
#copying DB 
COPY --from=builder /app/db.db ./db.db
#copying app files
COPY --from=builder /app/public ./public
COPY --from=builder /app/workers ./workers
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/temp ./temp
COPY --from=builder /app/styles ./styles
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/pages ./pages
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/context ./context
COPY --from=builder /app/components ./components

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

USER nextjs

EXPOSE 3000

CMD [ "yarn", "start" ]