# 라이더 도구함

배달·퀵 기사님용 무료 웹앱 모음.

- `/` 홈페이지
- `/barogil/` 바로길 — 콜 폰 → 내비 폰 주소 전달
- `/rider/` 라이더 장부 — 쿠팡이츠·배민커넥트 수익·지출 기록
- `/privacy.html` 개인정보처리방침
- `site-config.js` 광고 코드·문의 이메일 설정 (여기만 채우면 모든 페이지에 반영)

## 주변 주유소와 새 디자인

홈에서 유종(휘발유/경유/LPG/고급휘발유), 반경(1/3/5km), 가까운순/가격 낮은순을 선택합니다. 위치는 버튼을 눌렀을 때만 조회하며 브라우저에 저장하지 않습니다. 정렬은 이미 받은 결과에서 처리해 API 호출을 줄입니다. 실제 가격이 없을 때는 지도/오피넷 링크를 표시합니다.

### 실시간 유가 연결 (나중에 설정)

1. Netlify에 이 저장소를 연결합니다. 기존 netlify.toml의 publish와 functions 설정을 사용하며 proj4 의존성을 설치해야 합니다.
2. Netlify의 서버 환경 변수에 OPINET_API_KEY를 추가하고 재배포합니다. 인증키를 HTML/JS/GitHub 저장소에 넣지 않습니다.
3. 같은 Netlify 사이트에서 서비스하면 /.netlify/functions/stations를 자동 사용합니다.
4. GitHub Pages는 함수를 실행하지 못합니다. GitHub Pages를 유지하려면 API 서버를 별도로 운영하고 site-config.js에 fuelApiUrl을 설정해야 합니다. 별도 도메인 사용 시 해당 서버에서 riderstool.com Origin만 CORS 허용하도록 구성합니다. 현재 함수는 같은 출처 호출용입니다.
5. 실제 인증키로 위치/유종/반경별 응답을 확인한 뒤 운영을 활성화합니다. 조회 시각은 API 요청 시각이며 주유소 가격 갱신 시각과 다릅니다.

확인: node --test stations.test.mjs
API 명세: https://www.opinet.co.kr/user/custapi/openApiInfoDtl.do?apiId=3
