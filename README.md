[![LastDeploy](https://github.com/argon1025/muzi-backend/actions/workflows/deploy-ecs-prod.yaml/badge.svg)](https://github.com/argon1025/muzi-backend/actions/workflows/deploy-ecs-prod.yaml)
[![pull_request_test](https://github.com/argon1025/muzi-backend/actions/workflows/pull-request-test.yaml/badge.svg)](https://github.com/argon1025/muzi-backend/actions/workflows/pull-request-test.yaml)

<div align="center">
    <img src="https://github.com/argon1025/muzi-backend/assets/55491354/4b92e8d2-6d67-42ba-be54-ec82af8ec14a" alt="Logo">
  <h3 align="center">Muzi Back-end</h3>

  <p align="center">
    무지 백엔드 서비스<br />
    서로 다른 서비스의 맛집, 제품 체험단 공고 통합 조회 제공
    <br />
    <br />
    <a href="https://backend.mu-zi.net/api">View Swagger Doc</a>
    ·
    <a href="https://github.com/argon1025/muzi-backend/issues">Report Bug</a>
    ·
    <a href="https://github.com/argon1025/muzi-backend/issues">Request Feature</a>
  </p>
</div>

# Introduce


## Built With

- NestJS(Express)
- TypeScript
- PostgreSQL/Prisma
- AWS ECS, ECR, ALB, VPC
- Github Actions (CI/CD)

## Infra

![image](https://github.com/argon1025/muzi-backend/assets/55491354/089c4f53-2e63-4657-9ec7-b83e3f360182)
인프라 구성에 대해 설명합니다.

- Github Actions를 통해 지속적 배포를 구현합니다.
  - PR이 발생할 경우 테스트를 수행합니다.
  - `main` 브랜치에 업데이트가 발생할 경우 Github Actions에서 ECS 배포를 수행합니다.
- AWS VPC private, public 서브넷을 통해 중요 인스턴스를 격리합니다.
- AWS ECS를 통해 인스턴스를 배포합니다.
  - 클러스터 인스턴스는 EC2를 사용합니다.
  - 업데이트 배포 시 롤링 업데이트를 사용합니다.

## Architecture

![image](https://github.com/argon1025/muzi-backend/assets/55491354/d65cca09-120b-47d6-a1fa-7e107d977ea1)
서비스별 책임에 대해 설명합니다.

- Parsing-event
  - 파싱 요청을 관리하는 서비스입니다.
  - 동일한 이벤트를 중복으로 발행할 수 없도록 합니다.
  - 이벤트 조회 시 점유상태로 설정하여 다른 워커에게 동일한 이벤트가 조회되지 않도록 합니다.
- Campaign
  - 캠페인 도메인을 관리하는 서비스입니다.
- Worker
  - 일정 주기로 이벤트를 폴링 하여 요청 타입에 맞게 비즈니스 로직을 호출합니다.

## Convention

이슈 관리

- `Github Projects`로 이슈를 생성 및 트래킹 합니다.

브랜치 정책

- 브랜치를 병합하기 위해서는 반드시 PR을 생성하고 테스트가 통과되어야 합니다.
  - PR 생성 시 [테스트 자동화 액션](https://github.com/argon1025/muzi-backend/actions/workflows/pull-request-test.yaml)이 자동으로 수행됩니다.
- 각 이슈별로 브랜치를 분리합니다.
  - 브랜치 명칭은 `{feature|fix}-#{이슈 번호}` 로 생성합니다. ex) `feature-#19`
- `Main` `Develop` 브랜치는 리니어 하게 관리합니다.
  - 핫픽스를 병합할 경우 이력전체를 저장하기 위해 `Merge` 합니다.
  - 개발 브랜치를 병합할 경우 `Squash` 합니다.
  - Main, Develop 간에는 `Fast forward`를 합니다.
- conventionalCommits을 준수합니다

코드 컨벤션

- 패키지 관리
  - 패키지 매니저는 pnpm을 사용합니다.
- 네이밍
  - NestJS에서 사용하는 기본 네이밍 컨벤션을 사용합니다.
- 코드 스타일
  - Airbnb Rule을 사용합니다.
- 기타
  - 최대한 테스트 코드를 작성합니다.
  - 요청, 응답에 대해서 DTO를 사용하고 알맞은 Validation 및 직렬화, 역직렬화 프로세스를 거쳐야 합니다
  - Service 레이어의 경우 변경에 유연한 구조를 만들기 위해 의존성 역전을 활용합니다.
    - 객체는 하나의 책임만 가져야 하며 GOD 객체를 만드는 행위를 지양합니다.

# How To Start


## Docker-compose 로컬 개발환경 구성

프로젝트를 시작하기 위해서는 개발 환경이 명시적으로 구성되어있는 Docker-compose를 통해서 로컬 개발환경을 시작할 수 있습니다.

```
$ cd ./muzi-backend
$ docker-compose up
```

> DB 데이터는 프로젝트 폴더 .environments/docker에 저장됩니다

## NodeJS 버전 확인

```
cat .nvmrc
```

> 현재 프로젝트의 노드 버전을 확인할 수 있습니다.

## 패키지 설치

```
pnpm i
```

> 해당 프로젝트의 기본 패키지 매니저는 pnpm 입니다.

## 환경설정

`.environments/.env.local` 에서 로컬 환경설정을 구성할 수 있습니다

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

> 환경에 따라 `.env.local`, `env.dev`, `.env.prod` 로 구성합니다.

## Prisma Client 생성

```
$ yarn prisma:migrate:local
```

이 프로젝트에서는 Prisma로 마이그레이션을 관리합니다

위 명령어를 통해 로컬환경과 마이그레이션 기록을 동기화하고 서버 애플리케이션 실행을 위한 Prisma Client 모듈이 생성됩니다

## 프로젝트 시작

```
pnpm start:local
```
