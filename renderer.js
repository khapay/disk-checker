const txtTotal = document.getElementById('txtTotal');
const txtUsed = document.getElementById('txtUsed');
const txtFree = document.getElementById('txtFree');
const inputSec = document.getElementById('inputSec');
const btnAction = document.getElementById('btnAction');
const btnClose = document.getElementById('btnClose');

let timerId = null;

// 용량 갱신 함수
async function updateDisk() {
  const data = await window.diskAPI.getDiskSpace();
  if (data.success) {
    txtTotal.textContent = data.totalFormatted;
    txtUsed.textContent = data.usedFormatted;
    txtFree.textContent = data.freeFormatted;
  }
}

// 최초 1회 실행
updateDisk();

// 실행 / 중지 버튼 클릭 이벤트
btnAction.addEventListener('click', () => {
  // 이미 실행 중이면 중지
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;

    btnAction.textContent = '실행';
    btnAction.classList.remove('running');
    inputSec.disabled = false;
    return;
  }

  // 실행 시작
  const seconds = parseInt(inputSec.value, 10);
  if (isNaN(seconds) || seconds < 1) {
    alert('1 이상의 초 단위를 입력해주세요.');
    return;
  }

  // 즉시 1회 체크
  updateDisk();

  // 입력한 초마다 주기적 반복
  timerId = setInterval(updateDisk, seconds * 1000);

  // UI 상태 변경
  btnAction.textContent = '중지';
  btnAction.classList.add('running');
  inputSec.disabled = true;
});

// 우측 상단 닫기(X) 버튼
btnClose.addEventListener('click', () => {
  window.diskAPI.closeApp();
});