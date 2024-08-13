// 顏色數組
const colors = ['#FFC14F', '#FFA84F', '#FFD74F', '#FF894F', '#FFEC4F'];
let colorIndex = 0;
// 螺絲組
const parts = ['../img/g-gold.jpg', '../img/g-silver.jpg'];
let partIndex = 0;

function init() {
  const $ = go.GraphObject.make; // 定義模板
  myDiagram = new go.Diagram('myDiagramDiv', {
    "undoManager.isEnabled": true,
    "toolManager.mouseWheelBehavior": go.ToolManager.None, // 鎖定滾輪功能
    "panningTool.isEnabled": false, // 鎖定滑鼠拖曳移動功能
  });

  myDiagram.routers.add(new AvoidsLinksRouter());
  // 記錄連線資料
  myDiagram.model.copiesArrays = true;
  myDiagram.model.copiesArrayObjects = true;
  myDiagram.model.linkFromPortIdProperty = "fromPort";
  myDiagram.model.linkToPortIdProperty = "toPort";
  // end 記錄連線資料

  myDiagram.addDiagramListener('Modified', (e) => {
    const button = document.getElementById('SaveButton');
    if (button) button.disabled = !myDiagram.isModified;
    const idx = document.title.indexOf('*');
    if (myDiagram.isModified) {
      if (idx < 0) document.title += '*';
    } else {
      if (idx >= 0) document.title = document.title.slice(0, idx);
    }
  });

  // 定義節點(node)大小
  const nodeSquare = 16; // 標準寬
  const nodeSize = new go.Size(nodeSquare, nodeSquare);
  const portXSize = new go.Size(nodeSquare/4, nodeSquare-1);
  const portYSize = new go.Size(nodeSquare-1, nodeSquare/4);
  const portColor = "#555555";
  // end 定義節點(node)大小 

  myDiagram.nodeTemplate = new go.Node('Table', {
    locationObjectName: 'BODY',
    locationSpot: go.Spot.Center,
    selectionObjectName: 'BODY',
  })
    .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
    .add(
      new go.Panel('Auto', {
        row: 1,
        column: 1,
        name: 'BODY',
        stretch: go.Stretch.Fill
      })
        .add(
          new go.Shape('Rectangle', {
            fill: '#d3d3d3',
            stroke: '#d3d3d3',
            strokeWidth: 0,
            minSize: nodeSize
          }),          
          $(
            go.Picture,
            {
              margin: 0,
              imageStretch: go.GraphObject.UniForm,
              desiredSize: nodeSize, // 設定圖片的期望大小
              source: "../img/g-gold.jpg",
            },
            new go.Binding("source", "image").makeTwoWay()
          )
        ), // end Auto Panel body

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
              desiredSize: portXSize,
              margin: new go.Margin(1, 0),
              fill: portColor
            })
          )
      })
        .bind('itemArray', 'leftArray'),

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
              desiredSize: portYSize,
              margin: new go.Margin(0, 1),
              fill: portColor
            })
          )
      })
        .bind('itemArray', 'topArray'),

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
              desiredSize: portXSize,
              margin: new go.Margin(1, 0),
              fill: portColor
            })
          )
      })
        .bind('itemArray', 'rightArray'),

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
              desiredSize: portYSize,
              margin: new go.Margin(0, 1),
              fill: portColor
            })
          )
      })
        .bind('itemArray', 'bottomArray')
    );

  myDiagram.linkTemplate = new go.Link({
    routing: go.Routing.AvoidsNodes,
    corner: 4,
    curve: go.Curve.JumpGap,
    reshapable: true,
    resegmentable: true,
    relinkableFrom: true,
    relinkableTo: true,
    contextMenu: $("ContextMenu",
      $("ContextMenuButton",
        $(go.TextBlock, "更換線條顏色"),
        { click: (e, obj) => changeLinkColor(obj.part) }
      ),
    )
  })
  .bindTwoWay('points')
  .add(new go.Shape({
    strokeWidth: 5
  }).bind('stroke', 'color'));

  myDiagram.addDiagramListener('LinkDrawn', (e) => {
    colorIndex = (colorIndex + 1) % colors.length; // 更新顏色索引
    const link = e.subject;
    const newColor = colors[colorIndex]; // 定義 newColor
    link.elt(0).stroke = newColor; // 更新新連線的顏色
    myDiagram.model.setDataProperty(link.data, 'color', newColor); // 更新模型中的顏色屬性
  });

  function changeLinkColor(link) {
    if (link && link.elt(0)) {
      colorIndex = (colorIndex + 1) % colors.length; // 更新顏色索引
      const newColor = colors[colorIndex]; // 定義 newColor
      link.elt(0).stroke = newColor; // 更新連線顏色
      myDiagram.model.setDataProperty(link.data, 'color', newColor); // 更新模型中的顏色屬性
    } else {
      console.error('Link or link.elt(0) is null', link);
    }
  }

  myDiagram.toolManager.clickCreatingTool.archetypeNodeData = {
    name: 'Unit',
    leftArray: [{ portId: "left0", portSize: portXSize}],
    rightArray: [{ portId: "right0", portSize: portXSize}],
    topArray: [{ portId: "top0", portSize: portYSize}],
    bottomArray: [{ portId: "bottom0", portSize: portYSize}]
  };
  
  function addBackgroundNode() {
    const backgroundNode = {
      category: 'background',
      key: 'backgroundNode',
      loc: '0 0',
      width: myDiagram.viewportBounds.width,
      height: myDiagram.viewportBounds.height
    };
    myDiagram.model.addNodeData(backgroundNode);
  }
  

  myDiagram.nodeTemplateMap.add('background', 
    new go.Node('Position', {
      zOrder: 0, // 確保背景節點在最底層
      locationSpot: go.Spot.TopLeft,
      selectable: false, // 讓背景節點不可選擇
      click: (e, node) => { // 新增點擊事件處理程序
        myDiagram.clearSelection(); // 取消所有選取
      }
    })
      .add(
        new go.Picture({
          source: "../img/exampic.png", // 將題目設定為背景圖
          stretch: go.GraphObject.UniForm, // 背景圖片填滿節點
          width: myDiagram.viewportBounds.width, // 設置寬度
          height: myDiagram.viewportBounds.height // 設置高度
        })
      )
  );
  addBackgroundNode();  // 212行
  load(); // 276行
}

// Add a port to the specified side of the selected nodes.
function addPort(side) {
  myDiagram.startTransaction('addPort');
  myDiagram.selection.each((node) => {
    // skip any selected Links
    if (!(node instanceof go.Node)) return;
    // compute the next available index number for the side
    let i = 0;
    while (node.findPort(side + i.toString()) !== node) i++;
    // now this new port name is unique within the whole Node because of the side prefix
    const name = side + i.toString();
    // get the Array of port data to be modified
    const arr = node.data[side + 'Array'];
    if (arr) {
      // create a new port data object
      const newportdata = {
        portId: name,
        portColor: "#d3d3d3",
      };
      // and add it to the Array of port data
      myDiagram.model.insertArrayItem(arr, -1, newportdata);
    }
  });
  myDiagram.commitTransaction('addPort');
}

function save() {
  document.getElementById('mySavedModel').value = myDiagram.model.toJson();
  myDiagram.isModified = false;
}

function load() {
  const savedModel = document.getElementById('mySavedModel').value;
  console.log('Saved Model:', savedModel); // 調試用
  if (savedModel) {
    try {
      myDiagram.model = go.Model.fromJson(savedModel);
      // 確保背景節點的大小與畫布匹配
      myDiagram.nodes.each(node => {
        if (node.category === 'background') {
          const bounds = myDiagram.viewportBounds;
          node.diagram.model.setDataProperty(node.data, 'width', bounds.width);
          node.diagram.model.setDataProperty(node.data, 'height', bounds.height);
        }
      });
    } catch (e) {
      console.error('Failed to load model:', e);
    }
  }
}

window.addEventListener('DOMContentLoaded', init);
