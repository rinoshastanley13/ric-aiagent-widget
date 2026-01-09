# Production image using already built standalone artifacts
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Install security updates and use unprivileged user
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init wget && \
    rm -rf /var/cache/apk/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create unprivileged user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy the standalone build (includes server.js, .next, node_modules, package.json)
COPY .next/standalone ./

# Copy static files
COPY .next/static ./.next/static

# Copy public files
COPY public ./public

# Set proper permissions for runtime
RUN chown -R nextjs:nodejs /app

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