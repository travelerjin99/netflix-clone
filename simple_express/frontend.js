// frontend.js

// 1. DOM 요소 가져오기
const searchInput = document.getElementById('search-input');
const resultsContainer = document.getElementById('results-container');
const API_URL = 'http://localhost:3001/api/search'; // Express 서버 주소!

// Debounce 유틸리티 함수 (요청 횟수 조절을 위해 필요)
const debounce = (callback, delay) => {
    let timerId;
    return function(...args) {
        if (timerId) {
            clearTimeout(timerId);
        }
        timerId = setTimeout(() => {
            callback.apply(this, args);
        }, delay);
    };
};

/**
 * 2. Express 서버로 검색 요청을 보내고 결과를 받아오는 함수
 * @param {string} query 검색어
 */
async function fetchAndRenderResults(query) {
    // 쿼리가 비어있으면 요청하지 않고 결과를 비웁니다.
    if (query.trim().length === 0) {
        resultsContainer.innerHTML = '검색어를 입력하세요.';
        return;
    }
    
    resultsContainer.innerHTML = '서버 응답 대기 중... (1초 지연)';

    try {
        // 서버에 GET 요청을 보냅니다. (예: http://localhost:3001/api/search?q=stranger)
        const response = await fetch(`${API_URL}?q=${query}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // JSON 응답을 파싱합니다.
        const data = await response.json();
        
        // 3. 결과를 화면에 렌더링하는 함수 호출
        renderResults(data.items);

    } catch (error) {
        console.error("검색 중 오류 발생:", error);
        resultsContainer.innerHTML = `<p style="color: red;">검색 오류: ${error.message}</p>`;
    }
}

/**
 * 3. 검색 결과를 HTML로 만들어 화면에 표시하는 함수
 * @param {Array<Object>} items 서버에서 받은 검색 결과 배열
 */
function renderResults(items) {
    if (items.length === 0) {
        resultsContainer.innerHTML = '검색 결과가 없습니다.';
        return;
    }

    const html = items.map(item => `
        <div class="result-item">
            <img src="${item.image}" alt="${item.name} 이미지">
            <span>${item.name} (${item.type})</span>
        </div>
    `).join('');

    resultsContainer.innerHTML = `총 ${items.length}개 결과:<br>` + html;
}


// 4. Debounce를 적용하여 입력 이벤트에 연결
// 입력 후 500ms(0.5초) 동안 추가 입력이 없으면 서버에 요청합니다.
const debouncedSearch = debounce((e) => {
    const query = e.target.value;
    fetchAndRenderResults(query);
}, 500); // 0.5초 debounce 적용

// 이벤트 리스너 등록
searchInput.addEventListener('input', debouncedSearch);

// 초기 메시지
resultsContainer.innerHTML = '검색을 시작해 보세요.';