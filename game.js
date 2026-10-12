"use strict";

const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];
const canvas = $("#gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;

const CORE_INFO = {
  transparency:{label:"투명성",symbol:"T"},
  truth:{label:"진실",symbol:"V"},
  rights:{label:"권리",symbol:"R"},
  evidence:{label:"근거",symbol:"E"},
  fairness:{label:"공정성",symbol:"F"}
};

const H = (id,x,y,title,observation,type="clue",extra={}) => ({id,x,y,title,observation,type,...extra});

const MAPS = {
  world:{
    name:"아르카 월드맵", image:"assets/world.webp", spawn:{x:140,y:620}, mission:"빛나는 지역 장치에 접근해 다음 탐사 지역을 선택하세요.",
    hotspots:[
      H("p-lab",125,610,"폐쇄 연구소","질문 탐사의 시작점", "portal",{target:"lab"}),
      H("p-clock",250,135,"멈춘 시계광장","설명할 수 없는 시간이 흐르는 광장", "portal",{target:"clock"}),
      H("p-market",1030,145,"메아리 시장","추천과 광고가 반복되는 시장", "portal",{target:"market"}),
      H("p-info",155,350,"시민정보센터","시민의 모든 정보가 모이는 시설", "portal",{target:"info"}),
      H("p-library",1110,405,"뒤바뀐 기록도서관","서로 다른 기록이 보관된 도서관", "portal",{target:"library"}),
      H("p-station",640,640,"길을 잃은 정거장","사람마다 다른 길을 안내하는 정거장", "portal",{target:"station"}),
      H("p-tower",640,330,"오라클 중앙탑","도시의 모든 판단이 시작되는 곳", "portal",{target:"tower"})
    ]
  },
  lab:{
    name:"폐쇄 연구소", image:"assets/lab.webp", spawn:{x:205,y:390}, mission:"이상 현상 3개를 발견한 뒤 중앙 질문 콘솔로 이동하세요.",
    hotspots:[
      H("lab-clock",185,95,"서로 다른 시계","같은 연구소의 시계들이 서로 다른 시간을 가리키고 있다."),
      H("lab-data",760,95,"충돌하는 분석 결과","같은 에너지 상태를 세 개의 화면이 서로 다르게 표시한다."),
      H("lab-camera",1030,115,"작동 중인 보안카메라","연구소가 폐쇄됐는데도 카메라는 계속 주변을 기록한다."),
      H("lab-plant",1020,360,"빛을 거스르는 식물","식물이 밝은 재배등이 아니라 붉은 경고등 쪽으로 자라고 있다."),
      H("lab-generator",650,610,"엇갈린 전력 표시","발전기는 정상과 위험 신호를 동시에 내보낸다."),
      H("lab-console",640,350,"중앙 질문 콘솔","발견한 현상을 질문으로 바꾸는 장치다.","console"),
      H("lab-exit",1160,100,"연구소 출구","아르카 도시로 이어지는 출구다.","exit")
    ]
  },
  clock:{
    name:"멈춘 시계광장", image:"assets/clock.webp", core:"transparency", spawn:{x:640,y:665}, mission:"시간과 AI 판단의 모순을 3개 이상 조사하세요.",
    hotspots:[
      H("clock-a",330,145,"느리게 가는 시계","왼쪽 시계는 다른 시계보다 훨씬 느린 시간을 표시한다."),
      H("clock-b",640,105,"기준 시계","중앙 시계는 자신의 시간이 유일한 기준이라고 표시한다."),
      H("clock-c",930,145,"빠르게 가는 시계","오른쪽 시계는 아직 오지 않은 시간을 표시한다."),
      H("clock-shadow",640,315,"맞지 않는 그림자","해시계의 그림자 방향이 어떤 시계와도 일치하지 않는다."),
      H("clock-schedule",220,430,"개인별 시간표","같은 목적지로 가는 시민에게 서로 다른 출발 시간을 배정한다."),
      H("clock-box",1080,420,"설명하지 않는 판단 상자","결과만 보여주고 사용한 기준과 이유는 공개하지 않는다."),
      H("clock-console",640,545,"투명성 코어 장치","AI 판단의 설명 원칙을 입력하는 장치다.","console"),
      H("clock-exit",640,680,"광장 출구","아르카 월드맵으로 돌아간다.","exit")
    ]
  },
  market:{
    name:"메아리 시장", image:"assets/market.webp", core:"truth", spawn:{x:640,y:675}, mission:"추천·광고·후기에서 이상한 점을 3개 이상 찾아보세요.",
    hotspots:[
      H("market-news",170,145,"서로 다른 뉴스","두 화면이 같은 사건을 전혀 다른 분위기로 보여준다."),
      H("market-price-a",500,150,"첫 번째 가격 광고","할인이라고 표시했지만 원래 가격을 확인할 수 없다."),
      H("market-price-b",790,150,"두 번째 가격 광고","같은 상품인데 다른 사람에게 더 높은 가격이 표시된다."),
      H("market-review",1080,180,"반복되는 후기","표현과 별점이 똑같은 후기가 계속 등록된다."),
      H("market-ranking",1020,420,"광고형 인기 순위","광고비를 낸 상품이 항상 인기 순위 위에 나타난다."),
      H("market-camera",360,75,"시선 추적 카메라","사람이 바라본 상품을 기록해 다음 광고를 선택한다."),
      H("market-console",640,390,"진실 코어 장치","추천과 광고의 기준을 다시 설정하는 장치다.","console"),
      H("market-exit",640,680,"시장 출구","아르카 월드맵으로 돌아간다.","exit")
    ]
  },
  info:{
    name:"시민정보센터", image:"assets/info.webp", core:"rights", spawn:{x:120,y:650}, mission:"개인정보 수집 장치를 3개 이상 조사하세요.",
    hotspots:[
      H("info-face",145,410,"얼굴 인식 출입문","시설을 이용하려면 얼굴 정보를 등록해야 한다."),
      H("info-camera",230,100,"상시 촬영 카메라","누가 언제 어디를 지났는지 자동으로 저장한다."),
      H("info-voice",690,110,"음성 저장 부스","상담 내용뿐 아니라 주변 대화까지 기록한다."),
      H("info-location",930,115,"이동 경로 기록","시민이 방문한 장소를 선으로 연결해 보관한다."),
      H("info-health",435,385,"건강정보 분석기","건강 상태를 서비스 추천과 보험 판단에 함께 사용한다."),
      H("info-consent",570,625,"복잡한 동의 장치","큰 동의 버튼 뒤에 여러 정보 제공 조건이 숨겨져 있다."),
      H("info-server",1110,625,"잠긴 데이터 서버","수집된 정보의 보관 기간과 삭제 방법을 알 수 없다."),
      H("info-console",840,365,"권리 코어 장치","개인정보 수집 원칙을 입력하는 장치다.","console"),
      H("info-exit",1160,95,"센터 출구","아르카 월드맵으로 돌아간다.","exit")
    ]
  },
  library:{
    name:"뒤바뀐 기록도서관", image:"assets/library.webp", core:"evidence", spawn:{x:640,y:675}, mission:"서로 충돌하는 기록과 출처 문제를 3개 이상 조사하세요.",
    hotspots:[
      H("lib-record-a",205,130,"첫 번째 사건 기록","한 사건을 성공적인 구조 활동으로 설명한다."),
      H("lib-record-b",1065,130,"두 번째 사건 기록","같은 사건을 통제 실패로 설명한다."),
      H("lib-source",180,360,"끊어진 출처 나무","정보가 어디에서 시작됐는지 연결이 중간에 사라져 있다."),
      H("lib-machine",1060,365,"문장 조합 장치","여러 책의 문장을 섞어 새로운 기록을 만들지만 원작자는 표시하지 않는다."),
      H("lib-art",205,610,"두 개의 같은 작품","같은 그림에 서로 다른 창작자 표시가 붙어 있다."),
      H("lib-vault",510,650,"봉인된 원본 자료","AI가 요약하기 전의 원본은 열람이 제한되어 있다."),
      H("lib-ai",1080,615,"확신하는 AI 기록기","서로 다른 답을 모두 확실한 사실처럼 제시한다."),
      H("lib-console",640,350,"근거 코어 장치","자료의 출처와 검증 원칙을 입력하는 장치다.","console"),
      H("lib-exit",640,70,"도서관 출구","아르카 월드맵으로 돌아간다.","exit")
    ]
  },
  station:{
    name:"길을 잃은 정거장", image:"assets/station.webp", core:"fairness", spawn:{x:640,y:675}, mission:"서로 다른 이용자에게 제시되는 경로를 3개 이상 조사하세요.",
    hotspots:[
      H("station-route-a",430,340,"첫 번째 추천 경로","시간이 가장 짧지만 계단과 공사 구간을 지난다."),
      H("station-route-b",850,340,"두 번째 추천 경로","시간은 더 걸리지만 엘리베이터와 넓은 길을 지난다."),
      H("station-short",250,420,"막힌 최단 경로","AI가 계속 추천하지만 실제로는 통행할 수 없다."),
      H("station-ramp",1020,380,"긴 접근 가능 경로","휠체어 이용자가 사용할 수 있지만 다른 길보다 지나치게 멀다."),
      H("station-elevator",1130,445,"작동하지 않는 엘리베이터","안내 화면에는 정상으로 표시되어 있다."),
      H("station-gold",1030,650,"특별 승객 출입구","추가 비용을 낸 시민에게만 빠른 경로를 제공한다."),
      H("station-platform",250,645,"서비스가 줄어든 승강장","과거 이용자가 적다는 이유로 운행이 계속 줄어든다."),
      H("station-console",640,330,"공정성 코어 장치","여러 시민을 고려한 경로 원칙을 입력하는 장치다.","console"),
      H("station-exit",640,75,"정거장 출구","아르카 월드맵으로 돌아간다.","exit")
    ]
  },
  tower:{
    name:"오라클 중앙탑", image:"assets/tower.webp", spawn:{x:640,y:675}, mission:"오라클의 판단과 책임 장치를 조사한 뒤 AI 시민 원칙을 작성하세요.",
    hotspots:[
      H("tower-dev",210,120,"개발자 판단 기록","오라클의 목표와 기준은 사람이 선택해 입력했다."),
      H("tower-impact",1070,120,"시민 영향 분석","편리함이 커질수록 일부 시민의 피해도 함께 증가한다."),
      H("tower-shutdown",1110,420,"긴급 정지 장치","큰 문제가 발생해도 누가 정지시킬 수 있는지 명확하지 않다."),
      H("tower-approval",180,580,"인간 승인 장치","중요한 결정에 인간의 확인을 요구하지만 쉽게 건너뛸 수 있다."),
      H("tower-chain",1020,600,"책임 연결망","개발자·운영기관·사용자·AI가 서로 책임을 넘긴다."),
      H("tower-console",640,310,"오라클 최종 질문 장치","다섯 코어를 연결해 AI 시민 원칙을 작성하는 장치다.","console")
    ]
  }
};

const images = {};
const assetSources = {hero:"assets/hero-sprites.png",qbit:"assets/qbit-sprites.png",...Object.fromEntries(Object.entries(MAPS).map(([k,v])=>[k,v.image]))};
let assetsReady = false;
Promise.all(Object.entries(assetSources).map(([key,src])=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[key]=img;resolve()};img.onerror=reject;img.src=src;}))).then(()=>{assetsReady=true}).catch(()=>toast("이미지 일부를 불러오지 못했습니다."));

const defaultState = () => ({
  version:1, profile:null, currentMap:"lab", x:205, y:390, direction:"down", cores:[], completed:{}, discoveries:{}, entries:{}, startedAt:new Date().toISOString(), updatedAt:new Date().toISOString(), final:null
});
let state = defaultState();
let teacherConfig = JSON.parse(localStorage.getItem("projectQ_teacher")||"{}") || {};
let keys = new Set(), moveTarget=null, walking=false, lastTime=performance.now(), animClock=0, nearest=null, inquiryStep=0, activeInquiryMap=null;

const launchParams = new URLSearchParams(location.search);
if (launchParams.get("endpoint")) {
  teacherConfig.endpoint = launchParams.get("endpoint");
  localStorage.setItem("projectQ_teacher", JSON.stringify(teacherConfig));
}

function progressKey(profile=state.profile){return profile?`projectQ_${profile.classCode}_${profile.studentNo}`:"projectQ_unknown"}
function saveProgress(){
  if(!state.profile)return;
  state.updatedAt=new Date().toISOString();
  localStorage.setItem(progressKey(),JSON.stringify(state));
  localStorage.setItem("projectQ_lastProfile",JSON.stringify(state.profile));
}
function loadProgress(profile){const raw=localStorage.getItem(progressKey(profile));if(!raw)return false;state=JSON.parse(raw);return true}

function showScreen(id){$$('.screen').forEach(s=>s.classList.add('hidden'));$(id).classList.remove('hidden')}
function toast(message){const t=$("#toast");t.textContent=message;t.classList.add("show");clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove("show"),2400)}
function openDialog(id){const d=$(id);if(!d.open)d.showModal()}
function closeDialog(id){const d=$(id);if(d.open)d.close()}

function isUnlocked(mapId){
  if(mapId==="lab")return true;
  if(mapId==="clock")return !!state.completed.lab;
  if(["market","info","library"].includes(mapId))return state.cores.includes("transparency");
  if(mapId==="station")return ["transparency","truth","rights","evidence"].every(c=>state.cores.includes(c));
  if(mapId==="tower")return Object.keys(CORE_INFO).every(c=>state.cores.includes(c));
  return true;
}

function storyPages(pages,onDone){
  let index=0;const d=$("#storyDialog");
  const render=()=>{const p=pages[index];$("#storySpeaker").textContent=p.speaker||"Q-BIT";$("#storyTitle").textContent=p.title;$("#storyText").textContent=p.text;$("#storyArt").style.backgroundImage=`linear-gradient(rgba(3,12,23,.12),rgba(3,12,23,.35)),url('${p.image||MAPS[state.currentMap]?.image||MAPS.world.image}')`;$("#storyNext").textContent=index===pages.length-1?(p.button||"탐사 시작"):"계속"};
  $("#storyNext").onclick=()=>{index++;if(index>=pages.length){d.close();onDone?.();return}render()};
  render();d.showModal();
}

function startNew(profile){
  state=defaultState();state.profile=profile;saveProgress();
  showScreen("#gameScreen");enterMap("lab",true);
  document.documentElement.requestFullscreen?.().catch(()=>{});
  screen.orientation?.lock?.("landscape").catch(()=>{});
  storyPages([
    {speaker:"SYSTEM",title:"질문 지수 0%",text:"아르카의 모든 판단 시스템이 멈췄습니다.\n질문할 수 있는 시민을 탐색합니다.",image:MAPS.world.image},
    {speaker:"Q-BIT",title:"당신은 아직 질문할 수 있습니까?",text:"나는 탐사 지원 드론 Q-BIT입니다.\n먼저 연구소에서 이상한 점을 세 가지 찾아보세요.",image:MAPS.lab.image},
    {speaker:"Q-BIT",title:"발견이 질문의 시작입니다",text:"방향키나 화면의 이동 버튼으로 움직이세요.\n빛나는 원 가까이에서 ‘조사’를 누르면 발견을 기록할 수 있습니다.",image:MAPS.lab.image}
  ]);
}

function enterMap(id,resetPosition=true){
  if(!MAPS[id])return;
  state.currentMap=id;
  if(resetPosition){state.x=MAPS[id].spawn.x;state.y=MAPS[id].spawn.y}
  moveTarget=null;nearest=null;saveProgress();updateHUD();
}

function updateHUD(){
  const map=MAPS[state.currentMap];$("#areaName").textContent=map.name;
  const count=(state.discoveries[state.currentMap]||[]).length;
  if(state.currentMap==="world")$("#missionText").textContent=map.mission;
  else if(state.completed[state.currentMap])$("#missionText").textContent="이 지역의 탐구가 완료되었습니다. 출구로 이동하세요.";
  else if(count<3)$("#missionText").textContent=`${map.mission} (${count}/3)`;
  else $("#missionText").textContent="필요한 발견을 모았습니다. 중앙 질문 장치를 찾아가세요.";
  $("#coreBar").innerHTML=Object.entries(CORE_INFO).map(([id,c])=>`<span class="core-chip ${state.cores.includes(id)?"on":""}" data-core="${id}" title="${c.label} 코어">${c.symbol}</span>`).join("");
  $("#mapHint").textContent="이동: 방향키/WASD · 조사: E/Space · 화면 터치 이동";
}

function portalStatus(target){
  if(!isUnlocked(target)){
    if(target==="station")return "투명성·진실·권리·근거 코어가 필요합니다.";
    if(target==="tower")return "다섯 개의 질문 코어가 필요합니다.";
    if(["market","info","library"].includes(target))return "먼저 시계광장에서 투명성 코어를 복구하세요.";
    return "아직 접근할 수 없습니다.";
  }
  return state.completed[target]?"탐구 완료 · 다시 방문할 수 있습니다.":"접근 가능";
}

function discoveredIds(mapId=state.currentMap){return state.discoveries[mapId]||[]}
function markDiscovery(h){
  const list=discoveredIds();
  if(!list.includes(h.id)){state.discoveries[state.currentMap]=[...list,h.id];saveProgress();updateHUD();toast(`발견 기록: ${h.title}`)}
  storyPages([{speaker:"Q-BIT · 발견 기록",title:h.title,text:`${h.observation}\n\n이 현상에서 어떤 질문을 만들 수 있을까요?`,image:MAPS[state.currentMap].image}],()=>{});
}

function interact(){
  if(!nearest)return toast("조사할 대상 가까이 이동하세요.");
  const h=nearest;
  if(h.type==="clue")return markDiscovery(h);
  if(h.type==="portal"){
    const status=portalStatus(h.target);
    if(!isUnlocked(h.target))return storyPages([{speaker:"Q-BIT",title:"접근 권한이 없습니다",text:status,image:MAPS.world.image}]);
    return enterMap(h.target,true);
  }
  if(h.type==="exit"){
    if(state.currentMap==="lab"&&!state.completed.lab)return toast("중앙 질문 콘솔을 먼저 완료하세요.");
    return enterMap("world",true);
  }
  if(h.type==="console"){
    if(state.completed[state.currentMap])return toast("이미 복구한 질문 장치입니다.");
    if(discoveredIds().length<3)return toast("이상 현상을 3개 이상 발견해야 합니다.");
    return openInquiry(state.currentMap);
  }
}

function openInquiry(mapId){
  activeInquiryMap=mapId;inquiryStep=0;const form=$("#inquiryForm");form.reset();
  $("#inquiryTitle").textContent=mapId==="tower"?"AI 시민 원칙":"질문 탐험일지";
  const map=MAPS[mapId], ids=discoveredIds(mapId), clues=map.hotspots.filter(h=>ids.includes(h.id));
  $("#discoveryChoices").innerHTML=clues.map((h,i)=>`<label class="choice-card"><input type="radio" name="selectedDiscovery" value="${h.id}" ${i===0?"checked":""}><span><strong>${h.title}</strong><br>${h.observation}</span></label>`).join("");
  $("#principleFields").classList.toggle("hidden",mapId!=="tower");
  renderInquiryStep();openDialog("#inquiryDialog");
}
function renderInquiryStep(){
  $$(".form-step").forEach((el,i)=>el.classList.toggle("active",i===inquiryStep));
  $$(".stepper span").forEach((el,i)=>el.classList.toggle("active",i<=inquiryStep));
  $("#prevStep").classList.toggle("hidden",inquiryStep===0);
  $("#nextStep").classList.toggle("hidden",inquiryStep===2);
  $("#completeInquiry").classList.toggle("hidden",inquiryStep!==2);
  $("#saveState").textContent=`${inquiryStep+1}/3 단계`;
}
function validateStep(){
  const step=$(`.form-step[data-step="${inquiryStep}"]`);
  const fields=$$("input,textarea,select",step).filter(el=>!el.closest(".hidden"));
  for(const field of fields){if(field.required&&!field.value.trim()){field.reportValidity();return false}}
  if(inquiryStep===0&&!$("input[name=selectedDiscovery]:checked"))return false;
  if(inquiryStep===2&&activeInquiryMap==="tower"){
    for(const name of ["principle1","principle2","principle3"]){const f=$(`[name=${name}]`);if(!f.value.trim()){f.focus();toast("AI 시민 원칙 세 가지를 완성하세요.");return false}}
  }
  return true;
}

function completeInquiry(event){
  event.preventDefault();if(!validateStep())return;
  const form=new FormData(event.currentTarget), map=MAPS[activeInquiryMap];
  const selected=map.hotspots.find(h=>h.id===form.get("selectedDiscovery"));
  const entry={
    recordedAt:new Date().toISOString(),region:activeInquiryMap,regionName:map.name,discoveryId:selected?.id||"",discoveryTitle:selected?.title||"최종 판단",discovery:selected?.observation||"다섯 코어의 기록",
    question:form.get("question"),prediction:form.get("prediction"),method:form.get("method"),evidence:form.get("evidence"),answer:form.get("answer"),stakeholders:form.get("stakeholders"),benefit:form.get("benefit"),risk:form.get("risk"),decision:form.get("decision"),nextQuestion:form.get("nextQuestion"),principle1:form.get("principle1")||"",principle2:form.get("principle2")||"",principle3:form.get("principle3")||""
  };
  state.entries[activeInquiryMap]=entry;state.completed[activeInquiryMap]=true;
  if(map.core&&!state.cores.includes(map.core))state.cores.push(map.core);
  if(activeInquiryMap==="tower")state.final=entry;
  saveProgress();sendRecord(entry);closeDialog("#inquiryDialog");updateHUD();
  if(activeInquiryMap==="tower")return showEnding();
  if(activeInquiryMap==="lab"){
    return storyPages([{speaker:"Q-BIT",title:"첫 질문이 기록되었습니다",text:"질문 탐사 권한이 활성화되었습니다.\n연구소 출구를 통해 아르카로 이동하세요.",image:MAPS.lab.image}],()=>{});
  }
  const core=CORE_INFO[map.core];
  storyPages([{speaker:"SYSTEM",title:`${core.label}의 코어 복구`,text:`${map.name}의 질문 기록이 저장되었습니다.\n새로운 지역 접근 권한을 확인합니다.`,image:map.image,button:"월드맵으로"}],()=>enterMap("world",true));
}

function sendRecord(entry){
  if(!teacherConfig.endpoint)return;
  const payload={type:"record",game:"PROJECT Q",...state.profile,cores:state.cores.join(","),...entry};
  fetch(teacherConfig.endpoint,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)}).then(()=>toast("교사 기록함으로 전송했습니다.")).catch(()=>toast("기기에는 저장했지만 교사 기록함 전송에 실패했습니다."));
}

function showEnding(){
  showScreen("#endingScreen");
  $("#endingTitle").textContent="질문의 설계자";
  $("#endingQuestion").textContent=`“${state.final?.nextQuestion||state.final?.question||"AI와 함께 살아가기 위해 우리는 무엇을 계속 질문해야 할까?"}”`;
}

function renderJournal(){
  const entries=Object.values(state.entries);
  $("#journalContent").innerHTML=`<div class="journal-entry"><h3>${state.profile?.agentName||"탐사대원"}의 기록</h3><p>학급 ${state.profile?.classCode||"-"} · 탐험가 ${state.profile?.studentNo||"-"} · 코어 ${state.cores.length}/5</p></div>`+(entries.length?entries.map(e=>`<article class="journal-entry"><h3>${e.regionName}</h3><dl><dt>발견</dt><dd>${escapeHtml(e.discovery)}</dd><dt>질문</dt><dd>${escapeHtml(e.question)}</dd><dt>예상</dt><dd>${escapeHtml(e.prediction)}</dd><dt>탐구 방법</dt><dd>${escapeHtml(e.method)}</dd><dt>답과 근거</dt><dd>${escapeHtml(e.answer)}<br>${escapeHtml(e.evidence)}</dd><dt>판단</dt><dd>${escapeHtml(e.decision)}</dd><dt>다음 질문</dt><dd>${escapeHtml(e.nextQuestion)}</dd></dl></article>`).join(""):`<div class="journal-entry">아직 완료한 질문 탐구가 없습니다.</div>`);
}
function escapeHtml(s=""){return String(s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}

function draw(){
  if(!assetsReady){ctx.fillStyle="#071426";ctx.fillRect(0,0,1280,720);ctx.fillStyle="#21d9ff";ctx.font="700 24px sans-serif";ctx.textAlign="center";ctx.fillText("ARCA SYSTEM LOADING",640,360);return}
  const map=MAPS[state.currentMap];ctx.drawImage(images[state.currentMap],0,0,1280,720);
  const discovered=discoveredIds();
  for(const h of map.hotspots){
    let active=true,color="#21d9ff",radius=h.type==="portal"?25:17;
    if(h.type==="clue"&&discovered.includes(h.id)){active=false;color="#d6a83b"}
    if(h.type==="portal"&&!isUnlocked(h.target)){color="#66798a";active=false}
    if(h.type==="console"&&discovered.length<3){color="#708090";active=false}
    ctx.save();ctx.globalAlpha=active?.85:.48;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(h.x,h.y,radius+Math.sin(animClock*.004)*3,0,Math.PI*2);ctx.stroke();ctx.fillStyle=color;ctx.globalAlpha=.15;ctx.beginPath();ctx.arc(h.x,h.y,radius,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  drawQbit();drawHero();
}

function heroFrame(){
  const dir=state.direction;
  if(walking){const f=Math.floor(animClock/130)%4;if(dir==="down")return {r:1,c:f};if(dir==="up")return {r:1,c:4+f};if(dir==="left")return {r:2,c:f};return {r:2,c:4+f}}
  const f=Math.floor(animClock/420)%2;const base={down:0,left:2,right:4,up:6}[dir];return {r:0,c:base+f};
}
function drawHero(){
  const img=images.hero,fw=198,fh=198,fr=heroFrame(),size=88;
  ctx.save();ctx.shadowColor="rgba(0,0,0,.55)";ctx.shadowBlur=10;ctx.drawImage(img,fr.c*fw,fr.r*fh,fw,fh,state.x-size/2,state.y-size*.72,size,size);ctx.restore();
}
function drawQbit(){
  const img=images.qbit,fw=198,fh=248;const base={down:0,left:2,right:4,up:6}[state.direction];const c=base+(Math.floor(animClock/420)%2);const bob=Math.sin(animClock*.006)*5;
  ctx.drawImage(img,c*fw,0,fw,fh,state.x+28,state.y-88+bob,56,70);
}

function update(dt){
  const speed=235;let dx=0,dy=0;
  if(keys.has("left")||keys.has("a"))dx=-1;if(keys.has("right")||keys.has("d"))dx=1;if(keys.has("up")||keys.has("w"))dy=-1;if(keys.has("down")||keys.has("s"))dy=1;
  if(moveTarget&&!dx&&!dy){const tx=moveTarget.x-state.x,ty=moveTarget.y-state.y,d=Math.hypot(tx,ty);if(d>6){dx=tx/d;dy=ty/d}else moveTarget=null}
  walking=!!(dx||dy);if(walking){const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;state.x=Math.max(28,Math.min(1252,state.x+dx*speed*dt));state.y=Math.max(40,Math.min(700,state.y+dy*speed*dt));if(Math.abs(dx)>Math.abs(dy))state.direction=dx<0?"left":"right";else state.direction=dy<0?"up":"down"}
  const map=MAPS[state.currentMap];nearest=null;let best=Infinity;for(const h of map.hotspots){const d=Math.hypot(h.x-state.x,h.y-state.y);if(d<best&&d<85){best=d;nearest=h}}
  $("#interactBtn").classList.toggle("hidden",!nearest);$("#interactBtn").textContent=nearest?(nearest.type==="portal"?"이동":nearest.type==="exit"?"나가기":nearest.type==="console"?"질문 기록":"조사"):"조사";
}
function loop(now){const dt=Math.min(.035,(now-lastTime)/1000);lastTime=now;animClock+=now?dt*1000:0;if(!$("#gameScreen").classList.contains("hidden"))update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);

function pointerToCanvas(event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)*1280/r.width,y:(event.clientY-r.top)*720/r.height}}
canvas.addEventListener("pointerdown",e=>{if(document.querySelector("dialog[open]"))return;const p=pointerToCanvas(e);moveTarget=p;const h=MAPS[state.currentMap].hotspots.find(h=>Math.hypot(h.x-p.x,h.y-p.y)<34);if(h){moveTarget={x:h.x,y:h.y};const timer=setInterval(()=>{if(Math.hypot(h.x-state.x,h.y-state.y)<80){clearInterval(timer);nearest=h;interact()}},80);setTimeout(()=>clearInterval(timer),5000)}});
window.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"].includes(k)){e.preventDefault();keys.add(k.replace("arrow",""));moveTarget=null}if(["e"," ","enter"].includes(k)&&!document.querySelector("dialog[open]")){e.preventDefault();interact()}});
window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase().replace("arrow","")));

$("#profileForm").addEventListener("submit",e=>{e.preventDefault();const profile={classCode:$("#classCode").value.trim().toUpperCase(),studentNo:$("#studentNo").value.trim(),agentName:$("#agentName").value.trim()};startNew(profile)});
$("#continueBtn").onclick=()=>{const profile={classCode:$("#classCode").value.trim().toUpperCase(),studentNo:$("#studentNo").value.trim(),agentName:$("#agentName").value.trim()};if(!profile.classCode||!profile.studentNo)return toast("참여코드와 탐험가 번호를 입력하세요.");if(!loadProgress(profile))return toast("이 기기에서 저장된 기록을 찾지 못했습니다.");showScreen("#gameScreen");enterMap(state.currentMap,false);toast("저장된 탐사를 이어갑니다.")};
const lastProfile=JSON.parse(localStorage.getItem("projectQ_lastProfile")||"null");if(lastProfile){$("#classCode").value=lastProfile.classCode||"";$("#studentNo").value=lastProfile.studentNo||"";$("#agentName").value=lastProfile.agentName||""}
if(launchParams.get("class"))$("#classCode").value=launchParams.get("class").toUpperCase();
$("#howBtn").onclick=()=>storyPages([{speaker:"Q-BIT",title:"탐사 조작 방법",text:"키보드: 방향키 또는 WASD로 이동, E 또는 Space로 조사\n태블릿: 화면을 눌러 이동하거나 왼쪽 이동 버튼 사용, 오른쪽 Q 버튼으로 조사\n빛나는 원은 조사하거나 이동할 수 있는 지점입니다.",image:MAPS.lab.image}],()=>{});
$("#interactBtn").onclick=interact;$("#mobileAction").onclick=interact;
$$('[data-dir]').forEach(btn=>{const dir=btn.dataset.dir;const down=e=>{e.preventDefault();keys.add(dir);moveTarget=null};const up=e=>{e.preventDefault();keys.delete(dir)};btn.addEventListener("pointerdown",down);btn.addEventListener("pointerup",up);btn.addEventListener("pointercancel",up);btn.addEventListener("pointerleave",up)});
$("#fullscreenBtn").onclick=()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();
$("#journalBtn").onclick=()=>{renderJournal();openDialog("#journalDialog")};
$("#journalPrint").onclick=()=>window.print();$("#printBtn").onclick=()=>{renderJournal();openDialog("#journalDialog");setTimeout(()=>window.print(),300)};
$("#returnTitleBtn").onclick=()=>showScreen("#startScreen");
$("#closeInquiry").onclick=()=>closeDialog("#inquiryDialog");
$("#prevStep").onclick=()=>{inquiryStep=Math.max(0,inquiryStep-1);renderInquiryStep()};
$("#nextStep").onclick=()=>{if(!validateStep())return;inquiryStep=Math.min(2,inquiryStep+1);renderInquiryStep()};
$("#inquiryForm").addEventListener("submit",completeInquiry);
$$('[data-close-dialog]').forEach(b=>b.onclick=()=>closeDialog(`#${b.dataset.closeDialog}`));

function openSettings(){$("#gasEndpoint").value=teacherConfig.endpoint||"";$("#teacherName").value=teacherConfig.teacherName||"";$("#connectionState").textContent=teacherConfig.endpoint?"교사 기록함 연결 정보가 저장되어 있습니다.":"현재 로컬 저장 모드";openDialog("#settingsDialog")}
$$('[data-open-settings]').forEach(b=>b.onclick=openSettings);
$("#settingsForm").addEventListener("submit",e=>{e.preventDefault();teacherConfig={endpoint:$("#gasEndpoint").value.trim(),teacherName:$("#teacherName").value.trim()};localStorage.setItem("projectQ_teacher",JSON.stringify(teacherConfig));closeDialog("#settingsDialog");toast(teacherConfig.endpoint?"교사 기록함 연결 설정을 저장했습니다.":"로컬 저장 모드로 설정했습니다.")});
$("#testConnection").onclick=()=>{const endpoint=$("#gasEndpoint").value.trim();if(!endpoint)return toast("GAS 웹 앱 주소를 입력하세요.");fetch(endpoint,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({type:"ping",sentAt:new Date().toISOString()})}).then(()=>{$("#connectionState").textContent="테스트 신호를 보냈습니다. 스프레드시트의 연결기록 시트를 확인하세요."}).catch(()=>{$("#connectionState").textContent="연결 요청을 보내지 못했습니다. /exec 주소인지 확인하세요."})};

document.addEventListener("visibilitychange",()=>{if(document.hidden)saveProgress()});
window.addEventListener("beforeunload",saveProgress);

function registerWebMCPTools(){
  const context=document.modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  const register=tool=>Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});
  register({
    name:"read_project_q_progress",title:"PROJECT Q 진행 확인",
    description:"현재 탐사 지역, 완료한 지역, 보유 질문 코어를 읽습니다.",
    inputSchema:{type:"object",properties:{},additionalProperties:false},
    annotations:{readOnlyHint:true,untrustedContentHint:false},
    execute(){return {currentMap:state.currentMap,completed:Object.keys(state.completed).filter(k=>state.completed[k]),cores:[...state.cores],discoveries:Object.fromEntries(Object.entries(state.discoveries).map(([k,v])=>[k,v.length]))}}
  });
  register({
    name:"navigate_project_q_region",title:"PROJECT Q 지역 이동",
    description:"잠금이 해제된 탐사 지역으로 이동하고 화면을 해당 지역으로 전환합니다.",
    inputSchema:{type:"object",properties:{region:{type:"string",enum:Object.keys(MAPS)}},required:["region"],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute(input){if(!input||!MAPS[input.region])throw new Error("알 수 없는 지역입니다.");if(!isUnlocked(input.region))throw new Error("아직 잠긴 지역입니다.");showScreen("#gameScreen");enterMap(input.region,true);return {ok:true,region:input.region,name:MAPS[input.region].name}}
  });
}
registerWebMCPTools();

