FROM node:20.0.0-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY dist/apps/api api

RUN addgroup --system api && adduser --system -G api api
RUN chown -R api:api .

USER api

EXPOSE 3333
CMD ["node", "api"]
