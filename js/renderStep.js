const savedList = document.querySelector('#savedList');
const saveStepBtn = document.querySelector('#saveStepBtn');

const renderSteps = (modelData) => {
    modelData.forEach((e, index) => {
        const stepNum = index === 0 ? '題目' : `步驟 ${index}`;
        savedList.innerHTML += `
        <label class="numStep list-group-item rounded border-1">
            <input class="form-check-input" type="checkbox" value="" data-step=${index}  />
            ${stepNum}
        </label>
    `;
    });
};
renderSteps(dataModel);

// 印出某一個步驟
const printStep = (modelData) => {
    document.getElementById('mySavedModel').value = JSON.stringify(modelData);
    load(JSON.stringify(modelData));
};

//找到右側所有勾選的項目，印出他們的索引值為陣列  (∩•̀ω•́)⊃--*⋆
function checkAllChecked() {
    let checkedStep = [];
    document.querySelectorAll('.numStep').forEach((label) => {
        const input = label.querySelector('input[type="checkbox"]');
        if (input && input.checked) {
            label.classList.add('active');
            checkedStep.push(parseInt(input.dataset.step, 10));
        } else {
            label.classList.remove('active');
        }
    });
    return checkedStep;
}

// 合併指定索引的 nodeDataArray 並去掉重複(∩•̀ω•́)⊃--*⋆
function mergeNodeDataArrays(dataModel, indices) {
    const nodeDataMap = new Map();
    indices.forEach((index) => {
        const model = dataModel[index];
        if (model && model.nodeDataArray) {
            model.nodeDataArray.forEach((node) => {
                if (!nodeDataMap.has(node.key)) {
                    nodeDataMap.set(node.key, node);
                }
            });
        }
    });
    return Array.from(nodeDataMap.values());
}

// 合併指定索引的 linkDataArray 並去掉重複(∩•̀ω•́)⊃--*⋆
function mergeLinkDataArrays(dataModel, indices) {
    const linkDataMap = new Map();
    indices.forEach((index) => {
        const model = dataModel[index];
        if (model && model.linkDataArray) {
            model.linkDataArray.forEach((link) => {
                // 使用 from 和 to 组合作为唯一键
                const key = `${link.from}-${link.to}`;
                if (!linkDataMap.has(key)) {
                    linkDataMap.set(key, link);
                }
            });
        }
    });
    return Array.from(linkDataMap.values());
}

// 點擊右側選單按鈕印出步驟內容  (∩•̀ω•́)⊃--*⋆
// 點擊toggle核取checked和確保label有css變化
document.querySelectorAll('.numStep').forEach((label) => {
    // 點擊label或點擊input時，在所屬label加上/刪除類別名稱
    label.addEventListener('click', (e) => {
        const input =
            e.target.querySelector('input[type="checkbox"]') ||
            e.target.closest('label').querySelector('input[type="checkbox"]');
        if (input) {
            const isChecked = input.checked;
            const labelElement = input.closest('label');
            labelElement.classList.toggle('active', isChecked);

            // 获取所有勾选的步骤索引
            const checkedStep = checkAllChecked();
            // 合併勾選的資料
            const combinedNodeDataArray = mergeNodeDataArrays(dataModel, checkedStep);
            const combinedLinkDataArray = mergeLinkDataArrays(dataModel, checkedStep);
            let temDataModel = [
                {
                    class: 'GraphLinksModel',
                    copiesArrays: true,
                    copiesArrayObjects: true,
                    linkFromPortIdProperty: 'fromPort',
                    linkToPortIdProperty: 'toPort',
                    nodeDataArray: combinedNodeDataArray,
                    linkDataArray: combinedLinkDataArray,
                },
            ];
            printStep(temDataModel[0]);
        }
    });
});

// ---

// cookie
let newMergedStepData = function setCookie(name, value, days) {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
};

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

//點擊「儲存為新的步驟」新增新的步驟  (∩•̀ω•́)⊃--*⋆
saveStepBtn.addEventListener('click', (e) => {
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
        <label class="numStep list-group-item rounded border-1 active">
            <input class="form-check-input" type="checkbox" value="" data-step=${dataModel.length - 1} checked />
            步驟 ${dataModel.length - 1}
        </label>
    `;
});
