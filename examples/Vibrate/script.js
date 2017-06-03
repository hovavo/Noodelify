view.pause();
var parts = 9;
var volume = 1;
var level = 0;

var noo = new Noodle();

noo.loadSVG('../assets/dude3.svg', function () {
  noo.position = view.center;
  noo.stretchStart = 15;
  noo.stretchEnd = 30;
  divide();
  view.play();
});


var rightSpeaker = speaker();

function speaker() {
  // project.currentStyle.strokeColor = 0.3;
  // project.currentStyle.strokeWidth = 2;
  var speaker = new Group();
  // var case =
  var membrane = new Path([view.center - [0, 10], view.center, view.center + [0, 10]]);
  membrane.position.y = view.center.y - 36;
  membrane.smooth();
  speaker.membrane = membrane;
  speaker.addChild(membrane);
  speaker.style = {
    strokeColor: 0.3,
    strokeWidth: 2
  }
  return speaker;

}



function onFrame(event) {
  analyser.getByteTimeDomainData(dataArray);
  level = (dataArray[0] - 128) * 0.5;

  noo.path.segments.forEach(function(segment, i){
    segment.point.x = noo.position.x + Math.sin(event.count * 0.3 + i) * level;
  });

  noo.path.smooth();
  noo.update();

  rightSpeaker.position.x = view.center.x + (1-volume) * view.size.width * .52 + 50;
  rightSpeaker.membrane.segments[1].point.x = rightSpeaker.position.x - Math.abs(level * 0.3 / volume);
}

function divide () {
  for (var i = 1; i < parts; i++){
    noo.path.divideAt((noo.path.length / parts) * i);
  }
}

function onMouseMove(event) {
  if (audioElement) {
    volume = audioElement.volume =
      1- Math.abs(event.point.x - view.size.width / 2) /  (view.size.width / 2);
  }
}


var source;
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var analyser = audioCtx.createAnalyser();
var audioElement = document.querySelector('audio');
analyser.fftSize = 32;
var bufferLength = analyser.fftSize;
var dataArray = new Uint8Array(bufferLength);
audioElement.addEventListener('canplay', function() {
  if (source) return;
  source = audioCtx.createMediaElementSource(audioElement);
  source.connect(analyser);
  source.connect(audioCtx.destination);
});