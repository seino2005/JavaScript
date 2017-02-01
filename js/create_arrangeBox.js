window.addEventListener("load", init);

// 定数テーブル
var g_valueTable = {
  // shape size
  s_width: 40,
  s_hight: 40,
  s_separator: 1,
  s_diagonal: 0,

  // circle size
  c_radius: 50,
  c_x: 200,
  c_y: 200,

  // ドラッグした場所を保存する変数
  m_dragPointX: 0,
  m_dragPointY: 0,

  /*
  黒色は　#000000
  白色は　#FFFFFF
  赤色は　#FF0000
  緑色は　#00FF00
  青色は　#0000FF
  黄色は　#FFFF00*/

  // color table
  m_colorTable: {
    "black": "#000000",
    "red": "#FF0000",
    "green": "#00FF00",
    "blue": "#0000FF",
    "yellow": "#FFFF00"
  }

};

// Arrange Box Manager
class ABManager {
  constructor() {
    // 全体の名前
    this.name = ""
    // canvas stage
    this.stage;
    // Userの配列
    this.arrayUser = new Array(0);
    // Itemの配列
    this.arrayItem = new Array(0);
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

  // Item
  createItem(name, color, max) {
    var item = new Item(name, color, max);
    item.create(g_valueTable.c_x, g_valueTable.c_y);
    this.arrayItem.push(item);
  }

  // User
  createUser(name, color, num) {
    var user = new User(name, color, num);
    user.create(0, 0);
    this.arrayUser.push(user);
  }

  // square を持つ box を取得する
  getBoxBySquare(square) {
    for (var idx = 0; idx < this.arrayUser.length; ++idx) {
      var box = this.arrayUser[idx].getBoxBySquare(square);
      if (box != undefined) {
        return box;
      }
    }
    return undefined;
  }

  // Boxを引数に取るItemとの衝突判定
  isHitObj(square) {
    //    var box = getBoxBySquare(square);
    var ret = false;

    // Itemのループ
    for (var idx = 0; idx < this.arrayItem.length; ++idx) {
      //circleの衝突判定
      var item = this.arrayItem[idx];
      ret = item.isHitObj(square);
      /* 衝突時の処理 */
      if (ret == true) {
        // square
        square.visible = false;
        square.removeEventListener("pressmove", handleMove);
        g_manager.getStage().removeChild(square);
        g_manager.getStage().update();
        // item
        item.clearBoxes();  // 現在のboxを全部消す
        item.setCircleColor("DarkRed");
        item.push(square);
        item.createBoxes();
        break;
      }
    } // end for

  }

  isLeaveObj(square) {
    var box = g_manager.getBoxBySquare(square);
    // 生成時の座標と現在の座標の差が、箱の対角線以上でtrue
    // 絶対値計算が無駄なので累乗値で比較
    var obj_distance = Math.pow((box.first_x - square.x), 2) + Math.pow((box.first_y - square.y), 2);
    var ret = (g_valueTable.s_diagonal < obj_distance);

    if (ret == true) {
      var item = box.getRegItem();
      if (item != undefined) {
        item.setCircleColor("Blue");
        box.setRegItem(undefined);
        // Itemからpop
        item.pop(square);
        item.clearBoxes();  // 現在のboxを全部消す
        item.createBoxes();
      }
    }

    return ret;
  }


} // class ABManager

// グローバル変数
var g_manager = new ABManager();

class User {
  constructor(name, color, num) {
    this.name = name;
    this.color = color;
    this.num = num;
    // boxes の配列
    this.arrayBox = new Array(0);
  }

  create(x, y) {
    for (var idx = 0; idx < this.num; ++idx) {
      var box = new Box(this.color);
      box.create(x + ((g_valueTable.s_width + g_valueTable.s_separator) * idx), y);
      this.arrayBox.push(box);
    }
  }

  // square を持つ box を取得する
  getBoxBySquare(square) {
    for (var idx = 0; idx < this.arrayBox.length; ++idx) {
      var box = this.arrayBox[idx];
      if (square == box.getSquare()) {
        return box;
      }
    }
    return undefined;
  }

} // User

// Box
class Box {
  constructor(color) {
    this.color = color;
    this.square;
    // 生成時の座標
    this.first_x;
    this.first_y;
    // どのItemに所有されているか
    this.regItem;
  }

  getColor() {
    return this.color;
  }

  setRegItem(item) {
    this.regItem = item;
  }

  getRegItem() {
    return this.regItem;
  }

  getSquare() {
    return this.square;
  }

  createSquare(x, y) {
    var stage = g_manager.getStage();
    this.square = new createjs.Shape();
    this.square.graphics.beginFill(this.color);
    this.square.graphics.drawRect(0, 0, g_valueTable.s_width, g_valueTable.s_hight);
    this.first_x = this.square.x = x;
    this.first_y = this.square.y = y;
    stage.addChild(this.square);
  }

  addEvent() {
    if (this.regItem != undefined) {
      // インタラクティブの設定
      this.square.addEventListener("mousedown", handleDown);
      this.square.addEventListener("pressmove", handleMoveFromCircle);
      this.square.addEventListener("pressup", handleUp);
    }
    else {
      // インタラクティブの設定
      this.square.addEventListener("mousedown", handleDown);
      this.square.addEventListener("pressmove", handleMove);
      this.square.addEventListener("pressup", handleUp);
    }
  }

  create(x, y, parent) {
    this.createSquare(x, y);
    this.setRegItem(parent);
    this.addEvent();
    // Stageの描画を更新します
    g_manager.getStage().update();
  }
} // class Box

// 箱を登録するアイテム。
class Item {
  constructor(name, color, max) {
    this.name = name;
    this.color = color;
    this.max = max;
    this.circle;
    this.counterObj;
    this.counter = 0;
    // key:色, value:Boxの配列
    this.boxes = {};
  }

  create(x, y) {
    var stage = g_manager.getStage();

    // アイテム名
    var itemName = new createjs.Text(this.name, "24px sans-serif", "#000000");
    itemName.x = 0;
    itemName.y = 200;
    stage.addChild(itemName);

    // 必要なbox数
    var needboxesObj = new createjs.Text(this.max, "24px sans-serif", "#000000");
    needboxesObj.x = 80;
    needboxesObj.y = 200;
    stage.addChild(needboxesObj);

    // 円
    this.circle = new createjs.Shape();
    this.circle.graphics.beginFill(this.color);
    this.circle.graphics.drawCircle(0, 0, g_valueTable.c_radius);
    this.circle.x = g_valueTable.c_x; // X 座標 200px の位置に配置
    this.circle.y = g_valueTable.c_y; // Y 座標 200px の位置に配置
    stage.addChild(this.circle); // 表示リストに追加

    // カウンタ表示
    this.counterObj = new createjs.Text(g_counter, "24px sans-serif", "#000000");
    this.counterObj.x = 200;
    this.counterObj.y = 200;
    stage.addChild(this.counterObj);

    stage.update();
  }

  setCircleColor(color) {
    this.circle.graphics.clear().beginFill(color).drawCircle(0, 0, g_valueTable.c_radius);
  }

  /*
    countUp() {
      this.counter++;
      this.counterObj.text = this.counter;
    }
  
    countDown() {
      this.counter--;
      this.counterObj.text = this.counter;
    }
  */

  getCounter() {
    var counter = 0;
    for (var color in this.boxes) {
      var array = this.boxes[color];
      counter += array.length;
    }
    return counter;
  }

  isHitObj(square) {
    if (square.visible == false) {
      return false;
    }

    var obj_distance = Math.pow((this.circle.x - square.x), 2) + Math.pow((this.circle.y - square.y), 2);
    // 手抜き
    var ret = (obj_distance < Math.pow((g_valueTable.s_width + g_valueTable.c_radius), 2));
    return ret;
  }

  push(square) {
    var box = g_manager.getBoxBySquare(square);
    var color = box.getColor();
    if (color in this.boxes) {
      this.boxes[color].push(box);
    }
    else {
      this.boxes[color] = new Array(0);
      this.boxes[color].push(box);
    }
    this.counterObj.text = this.getCounter();
  }

  pop(square) {
    var box = g_manager.getBoxBySquare(square);
    var color = box.getColor();
    if (color in this.boxes) {
      var array = this.boxes[color];
      var key = array.indexOf(box);
      if (key >= 0) {
        array.splice(key, 1);
      }
    }
    this.counterObj.text = this.getCounter();
  }

  // 手持ちの箱の表示を消す
  clearBoxes() {
    for (var color in this.boxes) {
      var array = this.boxes[color];
      for (var idx in array) {
        var box = array[idx];
        g_manager.getStage().removeChild(box.getSquare());
      }
    }
    g_manager.getStage().update();
  }

  // 手持ちの箱を表示する
  createBoxes() {
    for (var color in this.boxes) {
      var array = this.boxes[color];
      for (var idx in array) {
        var box = array[idx];

        // 箱を作り直す
        // 円のx + 半径 + space + index offset(1)
        box.create(
          this.circle.x + (g_valueTable.c_radius + 10) + (idx * (g_valueTable.s_width + 1)),
          this.circle.y,
          this);
      }
    }
    g_manager.getStage().update();
  }

} // class Item


// 未完成
var g_circleObj;
var g_counterObj;
var g_counter = 0;


function init() {
  var hash = { "#000000": 100, "#FF0000": 200 };

  for (var key in g_valueTable.m_colorTable) {
    var color = g_valueTable.m_colorTable[key];
    if (color in hash) {
      console.log(color + " " + hash[color]);
    }
    else {
      console.log(color + " none");
    }

  }

  // Stageオブジェクトを作成します
  var stage = new createjs.Stage("myCanvas");
  g_manager.setStage(stage);

  g_manager.createItem("item1", "#00FF00", 7);

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

  // User
  g_manager.createUser("Mr.X", "#000000", 3);

  // 数値計算
  g_valueTable.s_diagonal = Math.pow(g_valueTable.s_width, 2) + Math.pow(g_valueTable.s_hight, 2);

  // 時間経過
  createjs.Ticker.addEventListener("tick", handleTick);
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
  // [Bug-1] Itemに登録されている時はhandleMoveFromCircleでないといけない
  // [Bug-2] ここでEventを書き換えるとBox内のinstanceと==判定できなくなる。
  //instance.addEventListener("pressmove", handleMove);
  //instance.addEventListener("pressup", handleUp);
  var box = g_manager.getBoxBySquare(instance);
  box.addEvent();

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

function handleMoveFromCircle(event) {
  var instance = event.target;
  instance.x = g_manager.getStage().mouseX - g_valueTable.m_dragPointX;
  instance.y = g_manager.getStage().mouseY - g_valueTable.m_dragPointY;

  var isLeave = g_manager.isLeaveObj(instance);
  if (isLeave == true) {
    console.log("Leave!");
    // 離脱した
    instance.removeEventListener("pressmove", handleMoveFromCircle);
    instance.addEventListener("pressmove", handleMove);
    g_manager.getStage().update();
  }
}

function handleMove(event) {
  var instance = event.target;
  if (instance.visible == false) {
    return;
  }

  // 表示オブジェクトはマウス座標に追随する
  // ただしドラッグ開始地点との補正をいれておく
  instance.x = g_manager.getStage().mouseX - g_valueTable.m_dragPointX;
  instance.y = g_manager.getStage().mouseY - g_valueTable.m_dragPointY;

  // 初期位置からのMoveか、円からのMoveかで判定が違う。関数を分けるか分岐するか


  /*
  // 円からみたマウスカーソルの相対座標
  //var point = g_circleObj.globalToLocal(g_manager.getStage().mouseX, g_manager.getStage().mouseY);
  // 円に対する表示オブジェクトの相対座標
  var point = instance.localToLocal(0, 0, g_circleObj);
  // 当たり判定
  var isHit = g_circleObj.hitTest(point.x, point.y);
  */
  //var isHit = isHitObjs(instance, g_circleObj);
  var isHit = g_manager.isHitObj(instance);

  if (isHit == true) {
    //    g_circleObj.graphics.clear().beginFill("DarkRed").drawCircle(0, 0, 50);
    console.log("[debug] " + instance.color);


    //instance.x = 260;
    //instance.y = 200;
    /*
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
    */
    //instance = square;

  }
  else {
    //    g_circleObj.graphics.clear().beginFill("#00FF00").drawCircle(0, 0, 50);
  }

  g_manager.getStage().update();

}

