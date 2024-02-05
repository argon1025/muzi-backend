# 환경변수

```
# 서비스 설정
NODE_ENV=local
SERVICE_PORT=3000
DATABASE_URL="postgresql://muzi:muzi@localhost:5432/Muzi?schema=public"

# JWT
JWT_ACCESS_TOKEN_SECRET_KEY="secret"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_SECRET_KEY="secret"
JWT_REFRESH_TOKEN_EXPIRES_IN="30d"

# Cookie
IS_HTTP_ONLY_COOKIE=true
IS_SECURE_COOKIE=false
COOKIE_PATH="/"
COOKIE_DOMAIN="localhost"
REFRESH_TOKEN_EXPIRATION_TIME=2592000000 # 30d (milsec)

# KAKAO OAuth
# 앱 > 요약 정보 > 앱 ID
KAKAO_CLIENT_ID=""
# 앱 > 보안 > Client Secret
KAKAO_CLIENT_SECRET=""
# 리다이렉트 URL
KAKAO_REDIRECT_URL="http://localhost:3000/auth/kakao"
```

로컬 환경 : `.env.local`
개발 환경 : `.env.dev`
상용 환경 : `.env.prod`
