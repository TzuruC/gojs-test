// console.log("importStep"); 

//點擊右側選單按鈕載入步驟內容 ヾ(*´∀ ˋ*)ﾉ
// 使用事件委派來處理 .numStep 的點擊事件
document.addEventListener('click', (e) => {
    if (e.target.matches('.numStep')) {
        e.preventDefault();        
        // 去除所有 .numStep 元素的 active 類別
        document.querySelectorAll('.numStep').forEach((e) => {
        e.classList.remove('active');
        });
        // 為當前點擊的元素添加 active 類別
        e.target.classList.add('active');
        // 載入對應步驟的內容
        // document.getElementById('mySavedModel').value = JSON.stringify(dataModel[e.target.dataset.step]);
        load(JSON.stringify(dataModel[e.target.dataset.step]));
        console.log(e.target.dataset.step);
        console.log("資料長度 = "+dataModel.length);
    }
});

//點擊「儲存為新的步驟」新增新的步驟 ヾ(*´∀ ˋ*)ﾉ
const savedList = document.querySelector('#savedList');
const saveStepBtn = document.querySelector('#saveStepBtn');
saveStepBtn.addEventListener('click',(e)=>{
    e.preventDefault();
    save();
    // 將模型轉換為 JSON 字串
    const jsonString = myDiagram.model.toJson();    
    // 將 JSON 字串轉換為物件
    const modelObject = JSON.parse(jsonString);
    // 將物件格式的模型存入 dataModel 中
    dataModel.push(modelObject);
    // 去除所有 .numStep 元素的 active 類別
    document.querySelectorAll('.numStep').forEach((e) => {
        e.classList.remove('active');
        });
    savedList.innerHTML += `
        <li>
            <a href="#" class="numStep active" data-step=${dataModel.length -1 }>步驟${dataModel.length -1 }</a>
        </li>
    `;
});

// 1. 儲存當下圖表資訊
// 2. 新增右側步驟按鈕

