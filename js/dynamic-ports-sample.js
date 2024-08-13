function init() {
  const $ = go.GraphObject.make; // 定義節點模板

  myDiagram = new go.Diagram(
    "myDiagramDiv", //Diagram 通过 id 引用其 DIV HTML 元素
    {
      "undoManager.isEnabled": true, // 启用復原功能
    }
  );
  // 大節點產生節點的顏色
  portColors = ["brown"];
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
      $(go.Shape, "LineH", { // 選項-分隔線
        strokeWidth: 2,
        height: 1,
        stretch: go.Stretch.Horizontal,
      }),
      makeButton("Add top port", (e, obj) => addPort("top")), // 選項-新增節點
      makeButton("Add left port", (e, obj) => addPort("left")), // 選項-新增節點
      makeButton("Add right port", (e, obj) => addPort("right")), // 選項-新增節點
      makeButton("Add bottom port", (e, obj) => addPort("bottom")) // 選項-新增節點
    );
  const portSize = new go.Size(18, 18); // 新增出的節點大小
  const portMenu = // 對小節點擊右鍵時出現的菜單
    $(
      "ContextMenu",
      makeButton("Swap order", (e, obj) => // 
        swapOrder(obj.part.adornedObject)
      ),
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
        fill: "lightgray",
        stroke: "gray",
        strokeWidth: 0.5,
        minSize: new go.Size(60, 60),
      }),
      $(
        go.TextBlock,
        {
          margin: 10,
          textAlign: "center",
          font: "bold 14px Segoe UI,sans-serif",
          stroke: "#484848",
          editable: true,
        },
        new go.Binding("text", "name").makeTwoWay()
      )
    ), // end Auto Panel body

    // the Panel holding the left port elements, which are themselves Panels,
    // created for each item in the itemArray, bound to data.leftArray
    $(
      go.Panel,
      "Vertical",
      new go.Binding("itemArray", "leftArray"),
      {
        row: 1,
        column: 0,
        itemTemplate: $(
          go.Panel,
          {
            _side: "left", // internal property to make it easier to tell which side it's on
            fromSpot: go.Spot.Left,
            toSpot: go.Spot.Left,
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
              margin: new go.Margin(1, 0),
            },
            new go.ThemeBinding(
              "fill",
              "portColor",
              "ports"
            ).ofData()
          )
        ), // end itemTemplate
      }
    ), // end Vertical Panel

    // the Panel holding the top port elements, which are themselves Panels,
    // created for each item in the itemArray, bound to data.topArray
    $(
      go.Panel,
      "Horizontal",
      new go.Binding("itemArray", "topArray"),
      {
        row: 0,
        column: 1,
        itemTemplate: $(
          go.Panel,
          {
            _side: "top",
            fromSpot: go.Spot.Top,
            toSpot: go.Spot.Top,
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
              margin: new go.Margin(0, 1),
            },
            new go.ThemeBinding(
              "fill",
              "portColor",
              "ports"
            ).ofData()
          )
        ), // end itemTemplate
      }
    ), // end Horizontal Panel

    // the Panel holding the right port elements, which are themselves Panels,
    // created for each item in the itemArray, bound to data.rightArray
    $(
      go.Panel,
      "Vertical",
      new go.Binding("itemArray", "rightArray"),
      {
        row: 1,
        column: 2,
        itemTemplate: $(
          go.Panel,
          {
            _side: "right",
            fromSpot: go.Spot.Right,
            toSpot: go.Spot.Right,
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
              margin: new go.Margin(1, 0),
            },
            new go.ThemeBinding(
              "fill",
              "portColor",
              "ports"
            ).ofData()
          )
        ), // end itemTemplate
      }
    ), // end Vertical Panel

    // the Panel holding the bottom port elements, which are themselves Panels,
    // created for each item in the itemArray, bound to data.bottomArray
    $(
      go.Panel,
      "Horizontal",
      new go.Binding("itemArray", "bottomArray"),
      {
        row: 2,
        column: 1,
        itemTemplate: $(
          go.Panel,
          {
            _side: "bottom",
            fromSpot: go.Spot.Bottom,
            toSpot: go.Spot.Bottom,
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
              margin: new go.Margin(0, 1),
            },
            new go.ThemeBinding(
              "fill",
              "portColor",
              "ports"
            ).ofData()
          )
        ), // end itemTemplate
      }
    ) // end Horizontal Panel
  ); // end Node

  // an orthogonal link template, reshapable and relinkable
  myDiagram.linkTemplate = $(
    go.Link,
    {
      routing: go.Routing.AvoidsNodes,
      corner: 4,
      curve: go.Curve.JumpGap,
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
    leftArray: [],
    rightArray: [],
    topArray: [],
    bottomArray: [],
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

// 交換節點位置
// 如果是最後一個節點，則一到前一的地方
function swapOrder(port) {
  const arr = port.panel.itemArray;
  if (arr.length >= 2) {
    // only if there are at least two ports!
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].portId === port.portId) {
        myDiagram.startTransaction("swap ports");
        if (i >= arr.length - 1) i--; // now can swap I and I+1, even if it's the last port
        const newarr = arr.slice(0); // copy Array
        newarr[i] = arr[i + 1]; // swap items
        newarr[i + 1] = arr[i];
        // remember the new Array in the model
        myDiagram.model.setDataProperty(
          port.part.data,
          port._side + "Array",
          newarr
        );
        port.part
          .findLinksConnected(newarr[i].portId)
          .each((l) => l.invalidateRoute());
        port.part
          .findLinksConnected(newarr[i + 1].portId)
          .each((l) => l.invalidateRoute());
        myDiagram.commitTransaction("swap ports");
        break;
      }
    }
  }
}

// 移除元件上的節點
// 原本有連結到該節點的節點會被恢復成沒有連結線的狀態
function removePort(port) {
  myDiagram.startTransaction("removePort");
  const pid = port.portId;
  const arr = port.panel.itemArray;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].portId === pid) {
      myDiagram.model.removeArrayItem(arr, i);
      break;
    }
  }
  myDiagram.commitTransaction("removePort");
}

// 刪除元件同一邊的所有節點
function removeAll(port) {
  myDiagram.startTransaction("removePorts");
  const nodedata = port.part.data;
  const side = port._side; // there are four property names, all ending in "Array"
  myDiagram.model.setDataProperty(nodedata, side + "Array", []); // an empty Array
  myDiagram.commitTransaction("removePorts");
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

// 儲存json 並從此json load出json資料，而非從database
function save() {
  document.getElementById("mySavedModel").value =
    myDiagram.model.toJson();
  myDiagram.isModified = false;
}
function load() {
  myDiagram.model = go.Model.fromJson(
    document.getElementById("mySavedModel").value
  );

  // 複製節點時，我們需要複製該節點綁定的資料。
  // 這個 JavaScript 物件包含整個節點的屬性，並且
  // 四個屬性，它們是保存每個連接埠資料的陣列。
  // 這些數組和連接埠資料物件也需要複製。
  // 因此 Model.copiesArrays 和 Model.copiesArrayObjects 都需要為 true。
  // // "copiesArrays": true,
  // // "copiesArrayObjects": true,
  // 連結資料包括起始連接埠和起始連接埠的名稱；
  // 因此 GraphLinksModel 需要設定這些屬性名稱：
  // linkFromPortIdProperty 和 linkToPortIdProperty。
  // // "linkFromPortIdProperty": "fromPort",
  // // "linkToPortIdProperty": "toPort",
}
window.addEventListener("DOMContentLoaded", init);