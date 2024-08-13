// 線條顏色數組
// const colors = ['#FFD700', '#FFA500', '#D4AF37', '#FF8C00', '#FFBF00'];
const colors = ['#FFC14F', '#FFA84F', '#FFD74F', '#FF894F', '#FFEC4F'];
let colorIndex = 0;
let portColor = '#555555';

// 螺絲組
const parts = ['../Image/gojs-parts/g-gold.jpg', '../Image/gojs-parts/g-silver.png'];
let partIndex = 0;
function init() {
    // ====================
    //      定義畫面元件
    // ====================
    const $ = go.GraphObject.make; // 定義模板
    myDiagram = new go.Diagram('myDiagramDiv', {
        'undoManager.isEnabled': true,
        'toolManager.mouseWheelBehavior': go.ToolManager.None, // 鎖定滾輪功能
        'panningTool.isEnabled': false, // 鎖定滑鼠拖曳移動功能
        allowSelect: true, // 允許選擇
    });
    myDiagram.routers.add(new AvoidsLinksRouter());
    // 記錄連線資料
    myDiagram.model.copiesArrays = true;
    myDiagram.model.copiesArrayObjects = true;
    myDiagram.model.linkFromPortIdProperty = 'fromPort';
    myDiagram.model.linkToPortIdProperty = 'toPort';
    //更換線條顏色
    myDiagram.addDiagramListener('LinkDrawn', (e) => {
        colorIndex = (colorIndex + 1) % colors.length; // 更新顏色索引
        const link = e.subject;
        const newColor = colors[colorIndex]; // 定義 newColor
        link.elt(0).stroke = newColor; // 更新新連線的顏色
        myDiagram.model.setDataProperty(link.data, 'color', newColor); // 更新模型中的顏色屬性
    });
    // 設置保存模型的監聽器
    myDiagram.addDiagramListener('Modified', (e) => {
        const button = document.getElementById('SaveButton');
        const newButton = document.getElementById('saveStepBtn');
        if (button) {
            button.disabled = !myDiagram.isModified;
            newButton.disabled = !myDiagram.isModified;
        }
        const idx = document.title.indexOf('*');
        if (myDiagram.isModified) {
            if (idx < 0) document.title += '*';
        } else {
            if (idx >= 0) document.title = document.title.slice(0, idx);
        }
    });
    // // 父節點 NODE 模板
    // 定義各種模板類別 'default'
    myDiagram.nodeTemplateMap.add(
        'default',
        new go.Node('Table', {
            locationObjectName: 'BODY',
            locationSpot: go.Spot.Center,
            selectionObjectName: 'BODY',
            contextMenu: $(
                'ContextMenu',
                $('ContextMenuButton', $(go.TextBlock, '更換組件'), {
                    click: (e, obj) => {
                        const node = e.diagram.selection.first(); // 獲取當前選中的節點
                        if (node) {
                            changePart(node); // 呼叫 changePart 函數
                        } else {
                            console.error('No node selected');
                        }
                    },
                })
            ),
        })
            .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
            .add(
                new go.Panel('Auto', {
                    row: 1,
                    column: 1,
                    name: 'BODY',
                    stretch: go.Stretch.Fill,
                }).add(
                    new go.Shape('Rectangle', {
                        fill: '#d3d3d3',
                        stroke: '#d3d3d3',
                        strokeWidth: 0,
                        minSize: new go.Size(16, 16),
                    }),
                    $(
                        go.Picture,
                        {
                            name: 'PICTURE',
                            margin: 0,
                            imageStretch: go.GraphObject.Uniform,
                            desiredSize: new go.Size(16, 16), // 設定圖片的期望大小
                            source: parts[0], // 預設圖片
                        },
                        new go.Binding('source', 'image').makeTwoWay()
                    )
                ), // end Auto Panel body
                // 子節點 PORT 模板 - 左
                new go.Panel('Vertical', {
                    row: 1,
                    column: 0,
                    itemTemplate: new go.Panel({
                        _side: 'left', // internal property to make it easier to tell which side it's on
                        fromSpot: go.Spot.Left,
                        toSpot: go.Spot.Left,
                        fromLinkable: true,
                        toLinkable: true,
                        cursor: 'pointer',
                    })
                        .bind('portId', 'portId')
                        .add(
                            new go.Shape('Rectangle', {
                                stroke: null,
                                strokeWidth: 0,
                                desiredSize: new go.Size(4, 14),
                                margin: new go.Margin(1, 0),
                                fill: portColor,
                            })
                        ),
                }).bind('itemArray', 'leftArray'),
                // 子節點 PORT 模板 - 上
                new go.Panel('Horizontal', {
                    row: 0,
                    column: 1,
                    itemTemplate: new go.Panel({
                        _side: 'top',
                        fromSpot: go.Spot.Top,
                        toSpot: go.Spot.Top,
                        fromLinkable: true,
                        toLinkable: true,
                        cursor: 'pointer',
                    })
                        .bind('portId', 'portId')
                        .add(
                            new go.Shape('Rectangle', {
                                stroke: null,
                                strokeWidth: 0,
                                desiredSize: new go.Size(14, 4),
                                margin: new go.Margin(0, 1),
                                fill: portColor,
                            })
                        ),
                }).bind('itemArray', 'topArray'),
                // 子節點 PORT 模板 - 右
                new go.Panel('Vertical', {
                    row: 1,
                    column: 2,
                    itemTemplate: new go.Panel({
                        _side: 'right',
                        fromSpot: go.Spot.Right,
                        toSpot: go.Spot.Right,
                        fromLinkable: true,
                        toLinkable: true,
                        cursor: 'pointer',
                    })
                        .bind('portId', 'portId')
                        .add(
                            new go.Shape('Rectangle', {
                                stroke: null,
                                strokeWidth: 0,
                                desiredSize: new go.Size(4, 14),
                                margin: new go.Margin(1, 0),
                                fill: portColor,
                            })
                        ),
                }).bind('itemArray', 'rightArray'),
                // 子節點 PORT 模板 - 下
                new go.Panel('Horizontal', {
                    row: 2,
                    column: 1,
                    itemTemplate: new go.Panel({
                        _side: 'bottom',
                        fromSpot: go.Spot.Bottom,
                        toSpot: go.Spot.Bottom,
                        fromLinkable: true,
                        toLinkable: true,
                        cursor: 'pointer',
                    })
                        .bind('portId', 'portId')
                        .add(
                            new go.Shape('Rectangle', {
                                stroke: null,
                                strokeWidth: 0,
                                desiredSize: new go.Size(14, 4),
                                margin: new go.Margin(0, 1),
                                fill: portColor,
                            })
                        ),
                }).bind('itemArray', 'bottomArray')
            )
    );

    myDiagram.nodeTemplateMap.add(
        'default-large',
        new go.Node('Table', {
            locationObjectName: 'BODY',
            locationSpot: go.Spot.Center,
            selectionObjectName: 'BODY',
            contextMenu: $(
                'ContextMenu',
                $('ContextMenuButton', $(go.TextBlock, '更換組件'), {
                    click: (e, obj) => {
                        const node = e.diagram.selection.first(); // 獲取當前選中的節點
                        if (node) {
                            changePart(node); // 呼叫 changePart 函數
                        } else {
                            console.error('No node selected');
                        }
                    },
                })
            ),
        })
            .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
            .add(
                new go.Panel('Auto', {
                    row: 1,
                    column: 1,
                    name: 'BODY',
                    stretch: go.Stretch.Fill,
                }).add(
                    new go.Shape('Rectangle', {
                        fill: '#d3d3d3',
                        stroke: '#d3d3d3',
                        strokeWidth: 0,
                        minSize: new go.Size(30, 30),
                    }),
                    $(
                        go.Picture,
                        {
                            name: 'PICTURE',
                            margin: 0,
                            imageStretch: go.GraphObject.Uniform,
                            desiredSize: new go.Size(30, 30), // 設定圖片的期望大小
                            source: parts[0], // 預設圖片
                        },
                        new go.Binding('source', 'image').makeTwoWay()
                    )
                ), // end Auto Panel body
                // 子節點 PORT 模板 - 左
                new go.Panel('Vertical', {
                    row: 1,
                    column: 0,
                    itemTemplate: new go.Panel({
                        _side: 'left', // internal property to make it easier to tell which side it's on
                        fromSpot: go.Spot.Left,
                        toSpot: go.Spot.Left,
                        fromLinkable: true,
                        toLinkable: true,
                        cursor: 'pointer',
                    })
                        .bind('portId', 'portId')
                        .add(
                            new go.Shape('Rectangle', {
                                stroke: null,
                                strokeWidth: 0,
                                desiredSize: new go.Size(4, 28),
                                margin: new go.Margin(1, 0),
                                fill: portColor,
                            })
                        ),
                }).bind('itemArray', 'leftArray'),
                // 子節點 PORT 模板 - 上
                new go.Panel('Horizontal', {
                    row: 0,
                    column: 1,
                    itemTemplate: new go.Panel({
                        _side: 'top',
                        fromSpot: go.Spot.Top,
                        toSpot: go.Spot.Top,
                        fromLinkable: true,
                        toLinkable: true,
                        cursor: 'pointer',
                    })
                        .bind('portId', 'portId')
                        .add(
                            new go.Shape('Rectangle', {
                                stroke: null,
                                strokeWidth: 0,
                                desiredSize: new go.Size(28, 4),
                                margin: new go.Margin(0, 1),
                                fill: portColor,
                            })
                        ),
                }).bind('itemArray', 'topArray'),
                // 子節點 PORT 模板 - 右
                new go.Panel('Vertical', {
                    row: 1,
                    column: 2,
                    itemTemplate: new go.Panel({
                        _side: 'right',
                        fromSpot: go.Spot.Right,
                        toSpot: go.Spot.Right,
                        fromLinkable: true,
                        toLinkable: true,
                        cursor: 'pointer',
                    })
                        .bind('portId', 'portId')
                        .add(
                            new go.Shape('Rectangle', {
                                stroke: null,
                                strokeWidth: 0,
                                desiredSize: new go.Size(4, 28),
                                margin: new go.Margin(1, 0),
                                fill: portColor,
                            })
                        ),
                }).bind('itemArray', 'rightArray'),
                // 子節點 PORT 模板 - 下
                new go.Panel('Horizontal', {
                    row: 2,
                    column: 1,
                    itemTemplate: new go.Panel({
                        _side: 'bottom',
                        fromSpot: go.Spot.Bottom,
                        toSpot: go.Spot.Bottom,
                        fromLinkable: true,
                        toLinkable: true,
                        cursor: 'pointer',
                    })
                        .bind('portId', 'portId')
                        .add(
                            new go.Shape('Rectangle', {
                                stroke: null,
                                strokeWidth: 0,
                                desiredSize: new go.Size(28, 4),
                                margin: new go.Margin(0, 1),
                                fill: portColor,
                            })
                        ),
                }).bind('itemArray', 'bottomArray')
            )
    );
    myDiagram.nodeTemplateMap.add(
        'comment',
        new go.Node('Auto', {
            locationObjectName: 'BODY',
            locationSpot: go.Spot.Center,
            selectionObjectName: 'BODY',
            contextMenu: $(
                'ContextMenu',
                $('ContextMenuButton', $(go.TextBlock, '更換組件'), {
                    click: (e, obj) => {
                        const node = e.diagram.selection.first(); // 获取当前选中的节点
                        if (node) {
                            changePart(node); // 调用 changePart 函数
                        } else {
                            console.error('No node selected');
                        }
                    },
                })
            ),
        })
            .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
            .add(
                new go.Panel('Auto', {
                    name: 'BODY',
                    stretch: go.Stretch.Fill,
                }).add(
                    new go.Shape('RoundedRectangle', {
                        fill: '#ffffff',
                        stroke: '#d5d5d5',
                        strokeWidth: 1,
                        minSize: new go.Size(150, 50), // 设置适合文本的最小尺寸
                    }),
                    new go.TextBlock({
                        font: 'FontAwesome 14pt', // 设置字体为 FontAwesome
                        stroke: 'red', // 图标颜色
                        text: '\uf00d', // FontAwesome 的 "X" 图标，"\uf00d" 是 Unicode
                    }),
                    $(
                        go.TextBlock,
                        {
                            name: 'TEXT',
                            margin: 10,
                            editable: true, // 使文本可编辑
                            wrap: go.TextBlock.WrapFit, // 自动换行
                            stroke: 'black', // 文本颜色
                            font: 'bold 12pt sans-serif', // 字体样式
                            // text: 'X 接點錯誤'
                        },
                        new go.Binding('text').makeTwoWay() // 双向绑定文本内容
                    )
                )
            )
    );

    // 左鍵雙擊 新增一個元件
    myDiagram.toolManager.clickCreatingTool.archetypeNodeData = {
        category: 'default', // 指定使用 'default' 類別的模板
        name: 'PICTURE',
        image: parts[1], // 預設圖片
        leftArray: [{ portId: 'left0', portSize: new go.Size(4, 14) }],
        rightArray: [{ portId: 'right0', portSize: new go.Size(4, 14) }],
        topArray: [{ portId: 'top0', portSize: new go.Size(14, 4) }],
        bottomArray: [{ portId: 'bottom0', portSize: new go.Size(14, 4) }],
    };

    // 連線模板
    myDiagram.linkTemplate = new go.Link({
        routing: go.Routing.AvoidsNodes,
        corner: 4,
        curve: go.Curve.JumpGap,
        reshapable: true,
        resegmentable: true,
        relinkableFrom: true,
        relinkableTo: true,
        contextMenu: $(
            'ContextMenu',
            $('ContextMenuButton', $(go.TextBlock, '更換線條顏色'), {
                click: (e, obj) => changeLinkColor(obj.part, 'random'),
            }),
            $('ContextMenuButton', $(go.TextBlock, '更換紅色線條'), {
                click: (e, obj) => changeLinkColor(obj.part, 'red'),
            }),
            $('ContextMenuButton', $(go.TextBlock, '更換綠色線條'), {
                click: (e, obj) => changeLinkColor(obj.part, 'green'),
            })
        ),
    })
        .bindTwoWay('points')
        .add(
            new go.Shape({
                strokeWidth: 5,
            }).bind('stroke', 'color')
        );
    // 背景節點模板 - 點擊右鍵建立不同模板
    myDiagram.nodeTemplateMap.add(
        'background',
        new go.Node('Position', {
            zOrder: 0, // 確保背景節點在最底層
            locationSpot: go.Spot.TopLeft,
            selectable: false, // 讓背景節點不可選擇
            click: (e, node) => {
                // 新增點擊事件處理程序
                myDiagram.clearSelection(); // 取消所有選取
            },
            contextMenu: $(
                'ContextMenu',
                $('ContextMenuButton', $(go.TextBlock, '清除所有連線'), { click: (e, obj) => clearAllLinks() }),
                $(
                    'ContextMenuButton',
                    $(go.TextBlock, '新增元件'),
                    { click: (e, obj) => addNodeAtBackground(e, 'default') } // 新增小節點，大小為16
                ),
                $(
                    'ContextMenuButton',
                    $(go.TextBlock, '新增大元件'),
                    { click: (e, obj) => addNodeAtBackground(e, 'default-large') } // 新增大節點，大小為48
                ),
                $(
                    'ContextMenuButton',
                    $(go.TextBlock, '新增評語'),
                    { click: (e, obj) => addNodeAtBackground(e, 'comment') } // 新增小節點，大小為16
                )
            ),
        }).add(
            new go.Picture({
                source: '../Image/gojs-parts/exampic.png', // 將題目設定為背景圖
                stretch: go.GraphObject.Uniform, // 背景圖片填滿節點
                width: myDiagram.viewportBounds.width, // 設置寬度
                height: myDiagram.viewportBounds.height, // 設置高度
            })
        )
    );

    // ====================
    //       定義功能
    // ====================
    // 更換元件 (∩•̀ω•́)⊃--*⋆
    function changePart(node) {
        if (node instanceof go.Node) {
            const img = node.findObject('PICTURE');
            if (img) {
                partIndex = (partIndex + 1) % parts.length;
                img.source = parts[partIndex];
                myDiagram.model.setDataProperty(node.data, 'image', parts[partIndex]);
            } else {
                console.error('PICTURE object not found in node', node);
            }
        } else {
            console.error('Provided part is not a valid go.Node', node);
        }
    }
    // 右鍵點擊線條改變顏色 (∩•̀ω•́)⊃--*⋆
    function changeLinkColor(link, color) {
        if (link && link.elt(0)) {
            let newColor;
            if (color === 'random') {
                colorIndex = (colorIndex + 1) % colors.length;
                newColor = colors[colorIndex];
            } else {
                newColor = color;
            }
            myDiagram.startTransaction('Change Link Color');
            link.elt(0).stroke = newColor;
            myDiagram.model.setDataProperty(link.data, 'color', newColor);
            myDiagram.commitTransaction('Change Link Color');
        } else {
            console.error('Link or link.elt(0) is null', link);
        }
    }
    // 右鍵點擊刪除全部的連線 (∩•̀ω•́)⊃--*⋆
    function clearAllLinks() {
        myDiagram.startTransaction('Clear All Links');
        myDiagram.links.each((link) => {
            myDiagram.remove(link);
        });
        myDiagram.commitTransaction('Clear All Links');
    }
    // 加入背景和一樣大的 node (∩•̀ω•́)⊃--*⋆
    function addBackgroundNode() {
        const backgroundNode = {
            category: 'background',
            key: 'backgroundNode',
            loc: '0 0',
            width: myDiagram.viewportBounds.width,
            height: myDiagram.viewportBounds.height,
        };
        myDiagram.model.addNodeData(backgroundNode);
    }

    // 在背景和一樣大的 node 上加入更多 node (∩•̀ω•́)⊃--*⋆
    function addNodeAtBackground(e, category) {
        const diagram = myDiagram;
        diagram.startTransaction('Add Node');

        const clickPoint = e.documentPoint;
        let newNodeData = {
            category: category, // 使用传入的类别
            loc: go.Point.stringify(clickPoint), // 设置节点位置
        };

        if (category === 'default') {
            // 为 default 类别的节点添加特定属性
            newNodeData = {
                ...newNodeData, // 保留已有的属性
                image: parts[0],
                leftArray: [{ portId: 'left0', portSize: new go.Size(4, 14) }],
                rightArray: [{ portId: 'right0', portSize: new go.Size(4, 14) }],
                topArray: [{ portId: 'top0', portSize: new go.Size(14, 4) }],
                bottomArray: [{ portId: 'bottom0', portSize: new go.Size(14, 4) }],
            };
        } else if (category === 'default-large') {
            newNodeData = {
                ...newNodeData, // 保留已有的属性
                image: parts[0],
                leftArray: [{ portId: 'left0', portSize: new go.Size(4, 28) }],
                rightArray: [{ portId: 'right0', portSize: new go.Size(4, 28) }],
                topArray: [{ portId: 'top0', portSize: new go.Size(28, 4) }],
                bottomArray: [{ portId: 'bottom0', portSize: new go.Size(28, 4) }],
            };
        }

        // 添加新节点到模型
        diagram.model.addNodeData(newNodeData);
        diagram.commitTransaction('Add Node');
    }

    addBackgroundNode();
    load();
}

function save() {
    document.getElementById('mySavedModel').value = myDiagram.model.toJson();
    myDiagram.isModified = false;
}

function load(savedStep) {
    const savedModel = savedStep || document.getElementById('mySavedModel').value;
    if (savedModel) {
        try {
            const model = go.Model.fromJson(savedModel);
            myDiagram.model = model;
            myDiagram.nodes.each((node) => {
                if (node.category === 'background') {
                    const bounds = myDiagram.viewportBounds;
                    node.diagram.model.setDataProperty(node.data, 'width', bounds.width);
                    node.diagram.model.setDataProperty(node.data, 'height', bounds.height);
                }
                const img = node.findObject('PICTURE');
                if (img) {
                    const width = node.data.imageWidth || img.desiredSize.width;
                    const height = node.data.imageHeight || img.desiredSize.height;
                    img.desiredSize = new go.Size(width, height);
                }
            });
        } catch (error) {
            console.error('Error loading model:', error);
        }
    } else {
        console.error('No saved model found');
    }
}

window.addEventListener('DOMContentLoaded', init);
window.animateCustom = () => {
    window.custom = true;
    diagram.animationManager.initialAnimationStyle = go.AnimationStyle.None;
    // Customer listener zooms-in the Diagram on load:
    diagram.addDiagramListener('InitialAnimationStarting', (e) => {
        const animation = e.subject.defaultAnimation;
        if (window.custom === false) {
            // a different button was pressed, restore default values on the default animation:
            animation.easing = go.Animation.EaseInOutQuad;
            animation.duration = NaN;
            return;
        }
        animation.easing = go.Animation.EaseOutExpo;
        animation.duration = 1500;
        animation.add(e.diagram, 'scale', 0.1, 1);
        animation.add(e.diagram, 'opacity', 0, 1);
    });
    diagram.model = go.Model.fromJson(diagram.model.toJson());
};
