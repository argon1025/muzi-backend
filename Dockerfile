# node version v20.0.0
FROM node:iron-alpine AS Builder

# 작업 디렉터리 생성
WORKDIR /build

# 앱 의존성 설치 use pnpm
COPY ./ ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 앱 빌드
RUN pnpm run build

# 서비스 시작
FROM node:iron-alpine AS APP

# NODE_ENV 환경변수 설정
ARG NODE_ENV
RUN echo $NODE_ENV
ENV NODE_ENV=$NODE_ENV
ENV HUSKY=0

# 앱 디렉터리 생성
WORKDIR /app

# 프로덕션 앱 의존성 설치 use pnpm
COPY ["package.json", "pnpm-lock.yaml", "./"]
RUN npm install -g pnpm
RUN pnpm i --frozen-lockfile -P

# 앱 소스 추가
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/environments ./environments
COPY --from=builder /build/prisma ./prisma

# prisma generate
RUN pnpm run prisma:generate

# puppeteer install
RUN apk update
RUN apk upgrade
RUN apk add --no-cache udev ttf-freefont chromium
RUN mkdir /usr/share/fonts/nanumfont
RUN wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip
RUN unzip NanumFont_TTF_ALL.zip -d /usr/share/fonts/nanumfont
RUN fc-cache -f -v
ENV LANG=ko_KR.UTF-8
ENV LANGUAGE=ko_KR.UTF-8

# 앱 실행
EXPOSE 8080
ENTRYPOINT [ "node", "dist/main" ]