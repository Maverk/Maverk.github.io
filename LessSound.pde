import ddf.minim.*;
import ddf.minim.analysis.*;

Star[] stars = new Star[30];
Minim minim;
AudioInput input;

PVector gravity;


void setup(){
  size( displayWidth, displayHeight);

  println(height*.1);
  frameRate(30);
  minim = new Minim(this);
  input = minim.getLineIn();


  gravity = new PVector(planet.x,planet.y);
  for (int i = 0; i < stars.length; i++){
    stars[i] = new Star();
  }


}
void draw(){
   //background(#303030);
  noStroke();
  fill(#303030, 50);
  rect(0,0,width,height); //Trales in shapes.
  for (int i = 0; i < stars.length; i++){
    stars[i].display();
  }

}
class Star{
  float x,y,z,r;
  color cp;



  Star(){
    x = random(width);
    y = random(height);
    r = random(5);
    colorPick();
    // .add(#FFFFFF, 9).add(#ECECEC, 9).add(#CCCCCC).add(#333333, 3)
    // .add(#0095a8, 2).add(#00616f, 2).add(#FF3300).add(#FF6600);
  }

  void display(){
    noStroke();
    fill(cp);
    for (int j = 0; j < input.bufferSize() - 1; j++){

      ellipse(x,y,r+(input.right.get(j)*30),r+(input.left.get(j)*30));
    }
  }

  void colorPick(){
    float i = random(100);
    if(i <10){
      cp = #FF6600;
    }else if (i> 10 && i <28){
      cp = #0095a8;
    }else{
      cp = #F7F7F7;
    }
  }
}
