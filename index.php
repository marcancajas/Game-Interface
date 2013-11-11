<!-- SAMPLE DEMO GAME FOR JAM*/ -->
<!DOCTYPE html>
<html>
    <head>
        <title></title>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <link rel="stylesheet" type="text/css" href="styles.css" media="screen,projection"/>
        <script src="http://code.createjs.com/easeljs-0.7.0.min.js"></script>
        <script src="http://code.jquery.com/jquery-1.10.1.min.js"></script>
        <script src="http://code.jquery.com/jquery-migrate-1.2.1.min.js"></script>

<?php
$heroid = $_COOKIE["JAMCOOKIE"];
echo $_COOKIE["JAMCOOKIE"];
echo $heroid;
$dbhost = '192.168.42.254:3306';
$dbuser = 'gameadmin';
$dbpass = '4dm1n1st3r';
$database = 'jamaccount';

$link = mysql_pconnect($dbhost,$dbuser,$dbpass);
if (!$link) {
    die('Could not connect: ' .mysql_error());
}
echo 'Connected successfully';
mysql_select_db($database,$link) or die (mysql_error());

$query = "SELECT position_x,position_y FROM Modified_Hero WHERE id = '$heroid'";
$result = mysql_query($query) or die(mysql_error());
echo $heroid;
$num = mysql_num_rows($result);
echo $num;

$row = mysql_fetch_array($result) or die(mysql_error());
$pos_x = $row[0];
$pos_y = $row[1];

echo "posx:".$pos_x;
echo "posy:".$pos_y;

?>          
           
        
    <script>    
        function goFullScreen()
        {
        var canvas = document.getElementById("jam-canvas");
        if(canvas.requestFullScreen)
        canvas.requestFullScreen();
        else if(canvas.webkitRequestFullScreen)
        canvas.webkitRequestFullScreen();
        else if(canvas.mozRequestFullScreen)
        canvas.mozRequestFullScreen();
        }
    </script>
    
    <script type="text/javascript">
      
      
      var stage;
      var textures = ["Green"]; //Block textures add it here
      var selected = null;
      var squares = [];
      var circle = new createjs.Shape(); // THE HERO HIMSELF
      
      function getRandomNumber()
      {
          return Math.floor(Math.random()); //Randomize the ratio of the color/texture in the 10x10 Grid : multiply by the ratio of the color so : Math.random() * 3 );
      }
      
      /**
       * Generate the world environment 10x10 grid with random tiles.
       */
      function generateWorld()
      {

      /* Generate 10x10 Grid */    
          var square;
          for (var x = 0; x < 10; x++)
              {
                  for (var y = 0; y < 10; y++)
                      {
                          var texture = textures[getRandomNumber()];
                          var graphic = new createjs.Graphics();
                          graphic.beginStroke(createjs.Graphics.getRGB(0,0,0));
                          graphic.setStrokeStyle(1);
                          graphic.beginFill(texture);
                          graphic.drawRect(0,0,50,50);
                          square = new createjs.Shape(graphic);
                          square.x = x * 50; //Readjust the x position with the size of the next square.
                          square.y = y * 50; //Readjust the y position with the size of the next square.
                          stage.addChild(square);                        
                          var id = square.x + "_" + square.y;
                          squares[id] = square;
                      }
              }
              
      /* Generate circle with initial position x and position y from database */   
      circle.graphics.beginFill("red").drawCircle(0,0,25);
      circle.x = getPosition_x(); // Initial Position | To move 1 x block is 50. position x -> Grab the current position x from database for every user command then update map
      circle.y = getPosition_y(); // Initial Position | To move 1 y block is 50. position y -> same as x but for position y
      
      /* Boundary Handling should be taken care of by the game engine (cpp game). Should passed Null on edge */
      
      stage.addChild(circle);
          
              stage.update();
      }
      
      
      /* User Control Template */
      function move(action)
      {
          switch(action)
          {
              case "left":
                  alert('Moving Left');
                  circle.x = circle.x - 50;    
               
                  break;
              case "right":
                  alert('Moving Right');                
                  circle.x = circle.x + 50;  
                  
                  break;
              case "up":
                  alert('Moving Up');
                  circle.y = circle.y - 50;
               
                  //Some additional code here to update database/passed it back to game engine etc.
                  break;
              case "down":
                  alert('Moving Down');
                  circle.y = circle.y + 50;

                  //Some additional code here to update database/passed it back to game engine etc.
                  break;
              case "null":
                  alert('You have reached the end of the world, cant move there');
                  //No updates
                  break;
          }   
         
          stage.update(); 
      }
     
   
      function getPosition_x(x)
      {
          var dbx = <?php echo $pos_x;?>;
          return dbx;
      }
      
      
      function getPosition_y(y)
      {
          var dby = <?php echo $pos_y;?>;
          return dby;
      }

    </script>
  
    <script> 
        function init()
        {
          stage = new createjs.Stage("jam-canvas");
          generateWorld();
        }
    </script>
    

  
    </head>
    
<body onload=init();>
    <div id="container">
    <canvas id="jam-canvas" width="640" height="500">
    Your browser does not support html5 Canvas!
    </canvas>
    
    <br />
    <!-- float inputs over canvas -->
    <div id="controls" style="z-index:17;">
        <button id="btnRestart" onclick="move('left');">Left</button>
        <button id="btnFall" onclick="move('right');">Right</button>
        <button id="btnStand" onclick="move('up');">Up</button>
        <button id="Button1" onclick="move('down');">Down</button>
        <p><button id="fullscreen-button" onclick=goFullScreen();>Full Screen</button></p>
        <button id="Start" onclick=startGame();>Start</button><button id="Reset" onclick=reset();>Reset</button>
    </div>
    
    </div>

</body>


</html>
