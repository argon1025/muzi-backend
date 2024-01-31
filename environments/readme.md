# 환경변수

```
# 서비스 설정
SERVICE_PORT=3000
DATABASE_URL="postgresql://muzi:muzi@localhost:5432/Muzi?schema=public"

# JWT
JWT_ACCESS_TOKEN_SECRET_KEY="secret"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_SECRET_KEY="secret"
JWT_REFRESH_TOKEN_EXPIRES_IN="30d"

# KAKAO OAuth
# 앱 > 요약 정보 > 앱 ID
KAKAO_CLIENT_ID="clientKey"
# 앱 > 보안 > Client Secret
KAKAO_CLIENT_SECRET="secretKey"
# 리다이렉트 URL
KAKAO_REDIRECT_URL="http://localhost:3000/oauth/kakao"
```

로컬 환경 : `.env.local`
개발 환경 : `.env.dev`
상용 환경 : `.env.prod`
