FROM node:20-alpine AS development-dependencies-env
RUN npm install -g pnpm
COPY . /app
WORKDIR /app
RUN pnpm install

FROM node:20-alpine AS build-env
RUN npm install -g pnpm
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN pnpm run build

FROM nginx:alpine
COPY --from=build-env /app/build/client /usr/share/nginx/html
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { try_files $uri $uri/ /index.html; } \
    }' > /etc/nginx/conf.d/default.conf
EXPOSE 3000