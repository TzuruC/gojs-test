function init() {
  const $ = go.GraphObject.make; // 定義模板
  myDiagram = new go.Diagram(
    "myDiagramDiv", //Diagram 透過 id 引用 DIV HTML 元素
    {
      "undoManager.isEnabled": true, // 允許復原重做功能
      "toolManager.mouseWheelBehavior": go.ToolManager.None, // 鎖定滾輪功能
    }
  );
  // 大節點產生節點的顏色
  portColors = ["gray"];
  myDiagram.themeManager.set("", {
    colors: { ports: portColors },
  });

  // 當位置有更動時，加一個"*"在網頁 title 上，並解鎖儲存按鈕功能 to the titlewhen the document is modified, add a "*" to the title and enable the "Save" button
  myDiagram.addDiagramListener("Modified", (e) => {
    const button = document.getElementById("SaveButton");
    if (button) button.disabled = !myDiagram.isModified;
    const idx = document.title.indexOf("*");
    if (myDiagram.isModified) {
      if (idx < 0) document.title += "*";
    } else {
      if (idx >= 0) document.title = document.title.slice(0, idx);
    }
  });

  // 統整帶入三個參數的 function 來簡化點擊創建節點的過程
  function makeButton(text, action, visiblePredicate) {
    return $(
      "ContextMenuButton",
      $(go.TextBlock, text),
      { click: action },
      // don't bother with binding GraphObject.visible if there's no predicate
      visiblePredicate
        ? new go.Binding("visible", "", (o, e) =>
            o.diagram ? visiblePredicate(o, e) : false
          ).ofObject()
        : {}
    );
  }
  const nodeMenu = // 對元件點擊右鍵時出現的菜單
    $(
      "ContextMenu",
      makeButton("Copy", (e, obj) => // 選項-複製
        e.diagram.commandHandler.copySelection()
      ),
      makeButton("Delete", (e, obj) => // 選項-刪除
        e.diagram.commandHandler.deleteSelection()
      ),
      makeButton("Add center port", (e, obj) => addPort("center"))// 選項-新增節點
    );
  const portSize = new go.Size(20, 20); // 新增出的節點大小
  const portMenu = // 對小節點擊右鍵時出現的菜單
    $(
      "ContextMenu",
      makeButton(
        "Remove port", // 
        // in the click event handler, the obj.part is the Adornment;
        // its adornedObject is the port
        (e, obj) => removePort(obj.part.adornedObject)
      ),
      makeButton("Change color", (e, obj) => // 改變小節點顏色
        changeColor(obj.part.adornedObject)
      ),
      makeButton("Remove side ports", (e, obj) =>
        removeAll(obj.part.adornedObject)
      )
    );

  // 節點模板
  // 每側都包含一個面板，其中包含包含連接埠的面板的 itemArray
  myDiagram.nodeTemplate = $(
    go.Node,
    "Table",
    {
      locationObjectName: "BODY",
      locationSpot: go.Spot.Center,
      selectionObjectName: "BODY",
      contextMenu: nodeMenu, // 在42行定義
      resizable: false,
      resizeObjectName: "BODY",
    },
    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
      go.Point.stringify
    ),
    
    // the body
    $(
      go.Panel,
      "Auto",
      {
        row: 1,
        column: 1,
        name: "BODY",
        stretch: go.Stretch.Fill,
      },
      $(go.Shape, "Rectangle", { // 元件大小
        fill: "gray",
        stroke: "gray",
        strokeWidth: 0,
        opacity: 0.5,
        minSize: new go.Size(30, 30),        
      }),
      
    ), // end Auto Panel body

    // 節點
    // created for each item in the itemArray, bound to data.leftArray
    
    $(
      go.Panel,
      "auto",
      new go.Binding("itemArray", "leftArray"),
      {
        row: 1,
        column: 1,
        itemTemplate: $(
          go.Panel,
          {
            fromSpot: go.Spot.Center,
            toSpot: go.Spot.Center,
            fromLinkable: true,
            toLinkable: true,
            cursor: "pointer",
            contextMenu: portMenu,
          },
          new go.Binding("portId", "portId"),
          $(
            go.Shape,
            "Rectangle",
            {
              stroke: null,
              strokeWidth: 0,
              desiredSize: portSize,
              margin: new go.Margin(0, 0),
            },
            new go.ThemeBinding(
              "fill",
              "portColor",
              "ports",
            ).ofData()
          ),
          $(
            go.Picture,
            {
              margin: 0,
              imageStretch: go.GraphObject.Fill,
              desiredSize: new go.Size(20, 20), // 設定圖片的期望大小
              source: "../img/g-gold.jpg",
            },
            new go.Binding("source", "image").makeTwoWay()
          )
        ), // end itemTemplate
      }
    ), // end Vertical Panel

  ); // end 節點模板

  // an orthogonal link template, reshapable and relinkable
  myDiagram.linkTemplate = $(
    go.Link,
    {
      routing: go.Routing.AvoidsNodes,
      corner: 4,
      curve: go.Curve.Standard,
      reshapable: true, //編輯線段
      resegmentable: false, //編輯增加轉角
      relinkableFrom: true,
      relinkableTo: true,
    },
    new go.Binding("points").makeTwoWay(),
    $(go.Shape, { stroke: "orange", strokeWidth: 5 })
  );
  // 左鍵雙擊 myDiagram 空白處新增一個元件
  myDiagram.toolManager.clickCreatingTool.archetypeNodeData = {
    name: "Unit",
    rightArray: [],
  };
  myDiagram.contextMenu = $( // 在空白區域點擊右鍵出現的菜單
    "ContextMenu",
    makeButton(
      "Paste",
      (e, obj) =>
        e.diagram.commandHandler.pasteSelection(
          e.diagram.toolManager.contextMenuTool.mouseDownPoint
        ),
      (o) =>
        o.diagram.commandHandler.canPasteSelection(
          o.diagram.toolManager.contextMenuTool.mouseDownPoint
        )
    ),
    makeButton(
      "Undo",
      (e, obj) => e.diagram.commandHandler.undo(),
      (o) => o.diagram.commandHandler.canUndo()
    ),
    makeButton(
      "Redo",
      (e, obj) => e.diagram.commandHandler.redo(),
      (o) => o.diagram.commandHandler.canRedo()
    )
  );
  // load the diagram from JSON data
  load();
}

// 在元件上指定的方向新增小節點
function addPort(side) {
  myDiagram.startTransaction("addPort");
  myDiagram.selection.each((node) => {
    // skip any selected Links
    if (!(node instanceof go.Node)) return;
    // compute the next available index number for the side
    let i = 0;
    while (node.findPort(side + i.toString()) !== node) i++;
    // now this new port name is unique within the whole Node because of the side prefix
    const name = side + i.toString();
    // get the Array of port data to be modified
    const arr = node.data[side + "Array"];
    if (arr) {
      // create a new port data object
      const newportdata = {
        portId: name,
        portColor: getPortColor(),
      };
      // and add it to the Array of port data
      myDiagram.model.insertArrayItem(arr, -1, newportdata);
    }
  });
  myDiagram.commitTransaction("addPort");
}

// 改變節點顏色
function changeColor(port) {
  myDiagram.startTransaction("colorPort");
  const data = port.data;
  myDiagram.model.setDataProperty(
    data,
    "portColor",
    getPortColor()
  );
  myDiagram.commitTransaction("colorPort");
}
function getPortColor() {
  return Math.floor(Math.random() * portColors.length);
}

// 儲存 / 載入 json資料，而非從database
function save() {
  document.getElementById("mySavedModel").value =
    myDiagram.model.toJson();
  myDiagram.isModified = false;
}
function load() {
  myDiagram.model = go.Model.fromJson(
    document.getElementById("mySavedModel").value
  );
}
window.addEventListener("DOMContentLoaded", init);