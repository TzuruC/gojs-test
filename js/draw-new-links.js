diagram.nodeTemplate =
  new go.Node("Auto")
    .add(
      new go.Shape("Rectangle", { fill: "lightgray" }),
      new go.Panel("Table")
        .addColumnDefinition(0, { alignment: go.Spot.Left })
        .addColumnDefinition(2, { alignment: go.Spot.Right })
        .add(
          new go.TextBlock(  // the node title
            { column: 0, row: 0, columnSpan: 3, alignment: go.Spot.Center,
              font: "bold 10pt sans-serif", margin: new go.Margin(4, 2) })
            .bind("text"),
          new go.Panel("Horizontal",
            { column: 0, row: 1 })
            .add(
              new go.Shape( // the "A" port
                { width: 6, height: 6, portId: "A", toSpot: go.Spot.Left,
                  toLinkable: true, toMaxLinks: 1 }),  // allow user-drawn links to here
              new go.TextBlock( "A")  // "A" port label
            ),
          new go.Panel("Horizontal",
            { column: 0, row: 2 })
            .add(
              new go.Shape( // the "B" port
                { width: 6, height: 6, portId: "B", toSpot: go.Spot.Left,
                  toLinkable: true, toMaxLinks: 1 }),  // allow user-drawn links to here
              new go.TextBlock( "B")  // "B" port label
            ),
          new go.Panel("Horizontal",
            { column: 2, row: 1, rowSpan: 2 })
            .add(
              new go.TextBlock( "Out"),  // "Out" port label
              new go.Shape( // the "Out" port
                { width: 6, height: 6, portId: "Out", fromSpot: go.Spot.Right,
                  fromLinkable: true, cursor: "pointer" })  // allow user-drawn links from here
            )
        )
    );

diagram.linkTemplate =
  new go.Link({ routing: go.Routing.Orthogonal, corner: 3 })
    .add(
      new go.Shape(),
      new go.Shape({ toArrow: "Standard" })
    );

diagram.layout = new go.LayeredDigraphLayout({ columnSpacing: 10 });

diagram.toolManager.linkingTool.temporaryLink.routing = go.Routing.Orthogonal;

diagram.model =
  new go.GraphLinksModel(
    { linkFromPortIdProperty: "fromPort",  // required information:
      linkToPortIdProperty: "toPort",      // identifies data property names
      nodeDataArray: [
        { key: 1, text: "Add1" },
        { key: 2, text: "Add2" },
        { key: 3, text: "Subtract1" }
      ],
      linkDataArray: [
        // no predeclared links
      ] });