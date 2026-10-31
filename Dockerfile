FROM alpine:3.20 AS builder
RUN apk add --no-cache bash
WORKDIR /app
COPY . .
RUN chmod +x build.sh && ./build.sh

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]