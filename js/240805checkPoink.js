// 顏色數組
const colors = ['#FFC14F', '#FFA84F', '#FFD74F', '#FF894F', '#FFEC4F'];
let colorIndex = 0;
// 螺絲組
const parts = ['../img/g-gold.jpg', '../img/g-silver.jpg'];
let partIndex = 0;

function init() {
  const $ = go.GraphObject.make; // 定義模板
  myDiagram = new go.Diagram('myDiagramDiv', { //Diagram refers to its DIV HTML element by id
    "undoManager.isEnabled": true,
    "toolManager.mouseWheelBehavior": go.ToolManager.None, // 鎖定滾輪功能
  });
  myDiagram.routers.add(new AvoidsLinksRouter());

  // 有異動時在title加上"*"
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

  // 父節點大小、子節點大小
  const nodeSquare = 16;
  const nodeSize = new go.Size(nodeSquare, nodeSquare);
  const portXSize = new go.Size(4, nodeSquare-1);
  const portYSize = new go.Size(nodeSquare-1, 4);
  const portColor = "#555555";

  // 父節點 the node template
  // includes a panel on each side with an itemArray of panels containing ports
  myDiagram.nodeTemplate = new go.Node('Table', {
    locationObjectName: 'BODY',
    locationSpot: go.Spot.Center,
    selectionObjectName: 'BODY',
  })
    .bindTwoWay('location', 'loc', go.Point.parse, go.Point.stringify)
    .add(
      // the body
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

      // 左節點
      // created for each item in the itemArray, bound to data.leftArray
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
      }) // end Vertical Panel
        .bind('itemArray', 'leftArray'),

      // 上節點
      // created for each item in the itemArray, bound to data.topArray
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
      }) // end Horizontal Panel
        .bind('itemArray', 'topArray'),

      // 右節點
      // created for each item in the itemArray, bound to data.rightArray
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
      }) // end Vertical Panel
        .bind('itemArray', 'rightArray'),

      // 下節點
      // created for each item in the itemArray, bound to data.bottomArray
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
          ) // end itemTemplate
      }) // end Horizontal Panel
        .bind('itemArray', 'bottomArray')
    ); // end Node

  // an orthogonal link template, reshapable and relinkable
  myDiagram.linkTemplate = new go.Link({
    routing: go.Routing.AvoidsNodes,
    corner: 4,
    curve: go.Curve.JumpGap,
    reshapable: true,
    resegmentable: true,
    relinkableFrom: true,
    relinkableTo: true
  })
    .bindTwoWay('points')
    .add(new go.Shape({ stroke: 'orange', strokeWidth: 5 }));

  // 左鍵雙擊後自動建立元件
  myDiagram.toolManager.clickCreatingTool.archetypeNodeData = {
    name: 'Unit',
    leftArray: [{ portId: "left0", portSize: portXSize}],
    rightArray: [{ portId: "right0", portSize: portXSize}],
    topArray: [{ portId: "top0", portSize: portYSize}],
    bottomArray: [{ portId: "bottom0", portSize: portYSize}]
  };
    
  // load the diagram from JSON data
  load();
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



// Save the model to / load it from JSON text shown on the page itself, not in a database.
function save() {
  document.getElementById('mySavedModel').value = myDiagram.model.toJson();
  myDiagram.isModified = false;
}
function load() {
  myDiagram.model = go.Model.fromJson(document.getElementById('mySavedModel').value);

}
window.addEventListener('DOMContentLoaded', init);