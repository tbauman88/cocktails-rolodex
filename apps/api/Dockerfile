FROM docker.io/node:lts-alpine

WORKDIR /app

RUN addgroup --system api && adduser --system -G api api

COPY dist/apps/api api
COPY libs/prisma-client-cocktails/prisma/ api/prisma/

RUN chown -R api:api .

RUN npm --prefix api --omit=dev -f install

WORKDIR /app/api
RUN npx prisma generate --schema=/app/api/prisma/schema.prisma

EXPOSE 3000

CMD npx prisma migrate deploy && cd ../ && node api
