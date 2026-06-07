FROM node:20-alpine as build
ARG VITE_API_URL=https://hamidulloh.duckdns.org
ENV VITE_API_URL=${VITE_API_URL}
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build || npx vite build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]