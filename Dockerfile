# Install dependencies only when needed
FROM node:16-alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update && apk add git
WORKDIR /apps

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown 1001:1001 /apps

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
WORKDIR /apps
COPY --from=deps /apps/node_modules ./node_modules
COPY --chown=1001:1001 . .

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
WORKDIR /apps 

ENV NODE_ENV production
ENV PORT 3000
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# You only need to copy next.config.js if you are NOT using the default configuration
#copying build and modules folders
COPY --from=builder /apps/node_modules ./node_modules
COPY --from=builder /apps/.next ./.next
#copying config files
COPY --from=builder /apps/next.config.js ./
COPY --from=builder /apps/package.json ./package.json
COPY --from=builder /apps/schema.prisma ./schema.prisma
COPY --from=builder /apps/postcss.config.js ./postcss.config.js
COPY --from=builder /apps/tailwind.config.js ./tailwind.config.js
COPY --from=builder /apps/.env ./.env
#copying enrtypoint files
COPY --from=builder /apps/server.js ./server.js
COPY --from=builder /apps/serverWhatsapp.js ./serverWhatsapp.js
COPY --from=builder /apps/serverBinance.js ./serverBinance.js
#copying DB 
COPY --from=builder /apps/db.db ./db.db
#copying apps files
COPY --from=builder /apps/public ./public
COPY --from=builder /apps/workers ./workers
COPY --from=builder /apps/utils ./utils
#COPY --from=builder /apps/temp ./temp
COPY --from=builder /apps/styles ./styles
COPY --from=builder /apps/src ./src
COPY --from=builder /apps/prisma ./prisma
COPY --from=builder /apps/pages ./pages
COPY --from=builder /apps/libs ./libs
COPY --from=builder /apps/context ./context
COPY --from=builder /apps/components ./components

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /apps/.next ./.next

USER nextjs

EXPOSE 3000

CMD [ "yarn", "dev" ]