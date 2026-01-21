# Production image using standard Next.js build + custom server
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Install security updates and use unprivileged user
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init wget && \
    rm -rf /var/cache/apk/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4000
ENV HOSTNAME=0.0.0.0

# Create unprivileged user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the built application with correct ownership
COPY --chown=nextjs:nodejs package*.json ./
COPY --chown=nextjs:nodejs node_modules ./node_modules
COPY --chown=nextjs:nodejs .next ./.next
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs server.js ./server.js

# Switch to unprivileged user
USER nextjs

EXPOSE 4000

ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/widget || exit 1

# Run the application
CMD ["node", "server.js"]