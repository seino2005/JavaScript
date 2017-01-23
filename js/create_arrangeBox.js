window.addEventListener("load", init);

// 定数テーブル
var g_valueTable = {
  // shape size
  s_width: 40,
  s_hight: 40,
  s_separator: 1,

  // circle size
  c_radius: 50,
  c_x: 200,
  c_y: 200,

  // ドラッグした場所を保存する変数
  m_dragPointX: 0,
  m_dragPointY: 0

};

// Arrange Box Manager
class ABManager {
  constructor() {
    // 全体の名前
    this.name = ""
    // canvas stage
    this.stage;
    // Userの配列
    this.arrayUser;
    // Itemの配列
    this.arrayItem;
  }

  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  setStage(stage) {
    this.stage = stage;
  }

  getStage() {
    return this.stage;
  }
} // class ABManager

// グローバル変数
var g_manager = new ABManager();

class Boxes {
  constructor(color, num) {
    this.color = color;
    this.num = num;
  }

  create(x, y) {
    var stage = g_manager.getStage();

    for (var idx = 0; idx < this.num; ++idx) {
      var square = new createjs.Shape();
      square.graphics.beginFill(this.color);
      square.graphics.drawRect(0, 0, g_valueTable.s_width, g_valueTable.s_hight);
      square.x = x + ((g_valueTable.s_width + g_valueTable.s_separator) * idx);
      square.y = y;
      this.x = square.x;
      this.y = square.y;
      stage.addChild(square);
      // インタラクティブの設定
      square.addEventListener("mousedown", handleDown);
      square.addEventListener("pressmove", handleMove);
      square.addEventListener("pressup", handleUp);
    }
    // Stageの描画を更新します
    stage.update();
  }
} // class Boxes

// 箱を登録するアイテム。
class Item {
  constructor(name, color, max) {
    this.name = name;
    this.color = color;
    this.max = max;
    this.shape;
    this.counterObj;
    this.counter = 0;
    this.boxes;
  }

  create(x, y) {
    var stage = g_manager.getStage();

    // アイテム名
    var itemName = new createjs.Text(this.name, "24px sans-serif", "#000000");
    itemName.x = 0;
    itemName.y = 200;
    stage.addChild(itemName);

    // 必要なbox数
    var needCounterObj = new createjs.Text(this.max, "24px sans-serif", "#000000");
    needCounterObj.x = 80;
    needCounterObj.y = 200;
    stage.addChild(needCounterObj);

    // 円
    var shape = new createjs.Shape();
    shape.graphics.beginFill(this.color);
    shape.graphics.drawCircle(0, 0, g_valueTable.c_radius);
    shape.x = g_valueTable.c_x; // X 座標 200px の位置に配置
    shape.y = g_valueTable.c_y; // Y 座標 200px の位置に配置
    stage.addChild(shape); // 表示リストに追加
    // 未完成
    g_circleObj = shape;

    // カウンタ表示
    var counterObj = new createjs.Text(g_counter, "24px sans-serif", "#000000");
    counterObj.x = 200;
    counterObj.y = 200;
    stage.addChild(counterObj);
    // 未完成
    g_counterObj = counterObj;

    stage.update();
  }

} // class Item


// 未完成
var g_circleObj;
var g_counterObj;
var g_counter = 0;


function init() {
  // Stageオブジェクトを作成します
  var stage = new createjs.Stage("myCanvas");
  g_manager.setStage(stage);

  var item = new Item("item1", "#00FF00", 7);
  item.create(g_valueTable.c_x, g_valueTable.c_y);

  /*
    // 円を作成します
    var shape = new createjs.Shape();
    shape.graphics.beginFill("#00FF00");
    shape.graphics.drawCircle(0, 0, 50); //半径 100px の円を描画
    shape.x = 200; // X 座標 200px の位置に配置
    shape.y = 200; // Y 座標 200px の位置に配置
    stage.addChild(shape); // 表示リストに追加
    stage.update();
    // 未完成
    g_circleObj = shape;
  
    // カウンタ表示
    var counterObj = new createjs.Text(g_counter, "24px sans-serif", "#000000");
    counterObj.x = 100;
    counterObj.y = 200;
    stage.addChild(counterObj);
    stage.update();
    g_counterObj = counterObj;
    */

  // Boxes
  var boxes = new Boxes("#000000", 3);
  boxes.create(0, 0);


}

function handleTick() {
  g_manager.getStage().update(); // 画面更新
}

function handleUp(event) {
  var instance = event.target;
  instance.removeEventListener("pressmove", handleMove);
  instance.removeEventListener("pressup", handleUp);
}

function handleDown(event) {
  var instance = event.target;
  // ドラッグを開始した座標を覚えておく
  g_valueTable.m_dragPointX = g_manager.getStage().mouseX - instance.x;
  g_valueTable.m_dragPointY = g_manager.getStage().mouseY - instance.y;
}

function isHitObjs(square, circle) {
  var width = 40;
  var height = 40;
  var radius = 50;
  var obj_distance = Math.pow((circle.x - square.x), 2) + Math.pow((circle.y - square.y), 2);

  // 手抜き
  return obj_distance < Math.pow((40 + 50), 2);

  // console.log("S: x = " + (square.x + width) + ",y = " + (square.y + height));
  // console.log("C: x = " + circle.x + ",y = " + circle.y);
  //return (((circle.x - square.x) < (radius + width)) && (circle.y - square.y) < (radius + height));
}

function handleMove(event) {
  var instance = event.target;
  // 表示オブジェクトはマウス座標に追随する
  // ただしドラッグ開始地点との補正をいれておく
  instance.x = g_manager.getStage().mouseX - g_valueTable.m_dragPointX;
  instance.y = g_manager.getStage().mouseY - g_valueTable.m_dragPointY;

  /*
  // 円からみたマウスカーソルの相対座標
  //var point = g_circleObj.globalToLocal(g_manager.getStage().mouseX, g_manager.getStage().mouseY);
  // 円に対する表示オブジェクトの相対座標
  var point = instance.localToLocal(0, 0, g_circleObj);
  // 当たり判定
  var isHit = g_circleObj.hitTest(point.x, point.y);
  */
  var isHit = isHitObjs(instance, g_circleObj);

  if (isHit == true) {
    g_circleObj.graphics.clear().beginFill("DarkRed").drawCircle(0, 0, 50);

    g_counter++;
    g_counterObj.text = g_counter;

    //instance.x = 260;
    //instance.y = 200;

    var instance = event.target;
    instance.removeEventListener("pressmove", handleMove);
    g_manager.getStage().removeChild(instance);

    // 新しいの作る
    var square = new createjs.Shape();
    square.graphics.beginFill("#000000");
    square.graphics.drawRect(0, 0, 40, 40);
    square.x = 300;
    square.y = 200;
    g_manager.getStage().addChild(square);

    // インタラクティブの設定
    square.addEventListener("mousedown", handleDown);
    square.addEventListener("pressmove", handleMove);
    square.addEventListener("pressup", handleUp);

    //instance = square;

  }
  else {
    g_circleObj.graphics.clear().beginFill("#00FF00").drawCircle(0, 0, 50);
  }

  g_manager.getStage().update();

}

